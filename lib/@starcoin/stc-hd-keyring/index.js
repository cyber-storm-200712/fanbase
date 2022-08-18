const hdkey = require('@starcoin/stc-wallet/hdkey')
const SimpleKeyring = require('@starcoin/stc-simple-keyring')
const { utils } = require('@starcoin/starcoin')
const stcUtil = require('@starcoin/stc-util')
const bip39 = require('bip39')
const sigUtil = require('eth-sig-util')
const log = require('loglevel')

// Options:
const hdPathString = `m/44'/101010'/0'/0'`
const type = 'HD Key Tree'

class HdKeyring extends SimpleKeyring {

  /* PUBLIC METHODS */
  constructor(opts = {}) {
    super()
    this.type = type
    this.deserialize(opts)
  }

  serialize() {
    return Promise.resolve({
      mnemonic: this.mnemonic,
      numberOfAccounts: this.wallets.length,
      hdPath: this.hdPath,
    })
  }

  deserialize(opts = {}) {
    this.opts = opts || {}
    this.wallets = []
    this.mnemonic = null
    this.root = null
    this.hdPath = opts.hdPath || hdPathString

    if (opts.mnemonic) {
      this._initFromMnemonic(opts.mnemonic)
    }

    if (opts.numberOfAccounts) {
      return this.addAccounts(opts.numberOfAccounts)
    }

    return Promise.resolve([])
  }

  addAccounts(numberOfAccounts = 1) {
    if (!this.root) {
      this._initFromMnemonic(bip39.generateMnemonic())
    }
    const HARDENED_OFFSET = 0x80000000
    const oldLen = this.wallets.length
    const newWallets = []
    for (let i = oldLen; i < numberOfAccounts + oldLen; i++) {
      const child = this.root.deriveChild(i + HARDENED_OFFSET)
      const wallet = child.getWallet()
      newWallets.push(wallet)
      this.wallets.push(wallet)
    }
    const hexWallets = newWallets.map((w) => {
      return w.getAddress()
        .then((address) => {
          return sigUtil.normalize(address.toString('hex'))
        })
    })
    return Promise.all(hexWallets)
  }

  getAccounts() {
    return Promise.all(this.wallets.map((w) => {
      return w.getAddress()
        .then((address) => {
          return sigUtil.normalize(address.toString('hex'))
        })
    }))
  }

  exportAccount(address) {
    return this._getWalletForAccount(address).then((wallet) => wallet.getPrivateKey().toString('hex'))
  }

  signTransaction(address, tx, opts = {}) {
    return this._getWalletForAccount(address, opts)
      .then((w) => {
        const privKey = w.getPrivateKey()
        const privKeyStr = stcUtil.addHexPrefix(privKey.toString('hex'))
        const hex = utils.tx.signRawUserTransaction(
          privKeyStr,
          tx,
        )
        return Promise.resolve(hex)
      })
  }

  signPersonalMessage(address, message, opts = {}) {
    return this._getWalletForAccount(address, opts)
      .then((w) => {
        const privKey = w.getPrivateKey()
        return utils.signedMessage.signMessage(message, privKey.toString('hex'))
          .then((payload) => {
            // const { publicKey, signature } = payload
            return payload
          })
      })
  }

  getPublicKeyFor(withAccount, opts = {}) {
    return this._getWalletForAccount(withAccount, opts)
      .then((w) => {
        return w.getPublicKeyString()
      })
  }

  getEncryptionPublicKey(withAccount, opts = {}) {
    return this._getWalletForAccount(withAccount, opts)
      .then((w) => {
        const privKey = w.getPrivateKey()
        const publicKey = sigUtil.getEncryptionPublicKey(privKey)
        return publicKey
      })
  }

  getReceiptIdentifier(address) {
    return this._getWalletForAccount(address).then((wallet) => wallet.getReceiptIdentifier())
  }

  // For stc_decrypt:
  decryptMessage(withAccount, encryptedData, opts) {
    return this._getWalletForAccount(withAccount, opts)
      .then((w) => {
        const privKey = stcUtil.stripHexPrefix(w.getPrivateKeyString())
        const sig = sigUtil.decrypt(encryptedData, privKey)
        return Promise.resolve(sig)
      })
  }

  /* PRIVATE METHODS */
  _initFromMnemonic(mnemonic) {
    this.mnemonic = mnemonic
    const seed = bip39.mnemonicToSeed(mnemonic)
    this.hdWallet = hdkey.fromMasterSeed(seed)
    this.root = this.hdWallet.derivePath(this.hdPath)
  }

  _getWalletForAccount(account) {
    const targetAddress = sigUtil.normalize(account)
    return Promise.all(this.wallets.map(async (w) => {
      const addressBytes = await w.getAddress()
      const address = sigUtil.normalize(addressBytes.toString('hex'))
      return ((address === targetAddress) || (sigUtil.normalize(address) === targetAddress))
    })).then((arr) => {
      return this.wallets[arr.findIndex((r) => Boolean(r))]
    })
  }
}

HdKeyring.type = type
module.exports = HdKeyring
