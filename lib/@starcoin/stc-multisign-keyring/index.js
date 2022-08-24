const EventEmitter = require('events').EventEmitter
const Wallet = require('@starcoin/stc-wallet')
const arrayify = require('@ethersproject/bytes').arrayify
const stcUtil = require('@starcoin/stc-util')
const { utils, encoding, starcoin_types } = require('@starcoin/starcoin')
const sigUtil = require('eth-sig-util')
const log = require('loglevel')

const type = 'Multi Sign'
class MutiSignKeyring extends EventEmitter {

  /* PUBLIC METHODS */

  constructor(opts) {
    super()
    this.type = type
    this.wallets = []
    this.accounts = []
    this.deserialize(opts)
  }

  serialize() {
    return Promise.resolve(this.accounts.map(account => {
      // ignore address, shard
      const { publicKeys, privateKeys, threshold } = account;
      return { publicKeys, privateKeys, threshold }
    }))
  }

  deserialize(keyPairs = []) {
    this.accounts = keyPairs
    return Promise.resolve(this.accounts)
  }


  addAccounts(args) {
    const { publicKeys = [], privateKeys = [], threshold = 1 } = args
    // console.log({ publicKeys, privateKeys, threshold })
    return new Promise((resolve, reject) => {
      try {
        utils.multiSign
          .createMultiEd25519KeyShard(publicKeys, privateKeys, threshold)
          .then((shard) => {
            const address = utils.account.getMultiEd25519AccountAddress(shard);
            const accounts = this.accounts.filter(account => account.address === address)
            if (accounts.length > 0) {
              reject(new Error('MultiSign Keyring - address already exists.'))
            }
            this.accounts.push({ publicKeys, privateKeys, threshold, address, shard });
            return resolve(this.getAccounts())
          });
      } catch (e) {
        log.Error(e)
        reject(e)
      }
    })
  }

  getAccounts() {
    const accountPromises = this.accounts.map(
      ({ publicKeys, privateKeys, threshold, address }, index) => {
        if (address) {
          return Promise.resolve(address);
        } else {
          return utils.multiSign
            .generateMultiEd25519KeyShard(publicKeys, privateKeys, threshold)
            .then((shard) => {
              const _address = utils.account.getMultiEd25519AccountAddress(shard);
              this.accounts[index].address = _address
              this.accounts[index].shard = shard
              return _address;
            })
        }
      }
    );
    const result = Promise.all(accountPromises)
    return Promise.resolve(result)
  }

  // tx is rawUserTransaction.
  signTransaction(address, tx, opts = {}) {
    const { authenticator: existingAuthenticator } = opts
    return new Promise((resolve, reject) => {
      try {
        this._getShardForAddress(address)
          .then(async (shard) => {
            const signatureShard = await utils.multiSign.generateMultiEd25519SignatureShard(shard, tx)
            const count_signatures = signatureShard.signature.signatures.length

            let signature
            if (existingAuthenticator) {
              const count_signatures = existingAuthenticator.signature.signatures.length
              const existingSignatureShards = new starcoin_types.MultiEd25519SignatureShard(existingAuthenticator.signature, existingAuthenticator.public_key.threshold)
              const mySignatureShards = new starcoin_types.MultiEd25519SignatureShard(signatureShard.signature, existingAuthenticator.public_key.threshold)
              const signatureShards = []
              signatureShards.push(existingSignatureShards)
              signatureShards.push(mySignatureShards)
              const mergedSignatureShards = starcoin_types.MultiEd25519SignatureShard.merge(signatureShards)
              signature = mergedSignatureShards.signature
            } else {
              signature = signatureShard.signature
            }
            const authenticator = new starcoin_types.TransactionAuthenticatorVariantMultiEd25519(shard.publicKey(), signature)
            const partial_signed_txn = new starcoin_types.SignedUserTransaction(tx, authenticator)
            const signedTxHex = encoding.bcsEncode(partial_signed_txn)
            return resolve(signedTxHex)
          });
      } catch (e) {
        log.Error(e)
        reject(e)
      }
    })
  }

  // For eth_sign, we need to sign arbitrary data:
  signMessage(address, data, opts = {}) {
    const message = stcUtil.stripHexPrefix(data)
    const privKey = this.getPrivateKeyFor(address, opts);
    var msgSig = stcUtil.ecsign(Buffer.from(message, 'hex'), privKey)
    var rawMsgSig = stcUtil.bufferToHex(sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s))
    return Promise.resolve(rawMsgSig)
  }

  // For eth_sign, we need to sign transactions:
  newGethSignMessage(withAccount, msgHex, opts = {}) {
    const privKey = this.getPrivateKeyFor(withAccount, opts);
    const msgBuffer = stcUtil.toBuffer(msgHex)
    const msgHash = stcUtil.hashPersonalMessage(msgBuffer)
    const msgSig = stcUtil.ecsign(msgHash, privKey)
    const rawMsgSig = stcUtil.bufferToHex(sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s))
    return Promise.resolve(rawMsgSig)
  }

  // For personal_sign, we need to prefix the message:
  signPersonalMessage(address, message, opts = {}) {
    const privKey = this.getPrivateKeyFor(address, opts);
    return utils.signedMessage.signMessage(message, privKey.toString('hex'))
      .then((payload) => {
        // const { publicKey, signature } = payload
        return payload
      })
  }

  // For stc_decrypt:
  decryptMessage(withAccount, encryptedData, opts) {
    const wallet = this._getWalletForAccount(withAccount, opts)
    const privKey = stcUtil.stripHexPrefix(wallet.getPrivateKey())
    const sig = sigUtil.decrypt(encryptedData, privKey)
    return Promise.resolve(sig)
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData(withAccount, typedData, opts = { version: 'V1' }) {
    switch (opts.version) {
      case 'V1':
        return this.signTypedData_v1(withAccount, typedData, opts);
      case 'V3':
        return this.signTypedData_v3(withAccount, typedData, opts);
      case 'V4':
        return this.signTypedData_v4(withAccount, typedData, opts);
      default:
        return this.signTypedData_v1(withAccount, typedData, opts);
    }
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v1(withAccount, typedData, opts = {}) {
    const privKey = this.getPrivateKeyFor(withAccount, opts);
    const sig = sigUtil.signTypedDataLegacy(privKey, { data: typedData })
    return Promise.resolve(sig)
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v3(withAccount, typedData, opts = {}) {
    const privKey = this.getPrivateKeyFor(withAccount, opts);
    const sig = sigUtil.signTypedData(privKey, { data: typedData })
    return Promise.resolve(sig)
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v4(withAccount, typedData, opts = {}) {
    const privKey = this.getPrivateKeyFor(withAccount, opts);
    const sig = sigUtil.signTypedData_v4(privKey, { data: typedData })
    return Promise.resolve(sig)
  }

  // get public key for nacl
  getEncryptionPublicKey(withAccount, opts = {}) {
    const privKey = this.getPrivateKeyFor(withAccount, opts);
    const publicKey = sigUtil.getEncryptionPublicKey(privKey)
    return Promise.resolve(publicKey)
  }

  // get public key
  getPublicKeyFor(address) {
    return this._getShardForAddress(address).then(shard => utils.account.getMultiEd25519AccountPublicKey(shard))
  }

  // returns an address specific to an app
  getAppKeyAddress(address, origin) {
    return new Promise((resolve, reject) => {
      try {
        const wallet = this._getWalletForAccount(address, {
          withAppKeyOrigin: origin,
        })
        const appKeyAddress = sigUtil.normalize(wallet.getAddress().toString('hex'))
        return resolve(appKeyAddress)
      } catch (e) {
        return reject(e)
      }
    })
  }

  // exportAccount should return a hex-encoded private key:
  exportAccount(address) {
    return this._getShardForAddress(address).then(shard => utils.account.getMultiEd25519AccountPrivateKey(shard))
  }

  removeAccount(address) {
    if (!this.accounts.map(account => account.address && account.address.toLowerCase() === address.toLowerCase())) {
      throw new Error(`Address ${ address } not found in this keyring`)
    }
    this.accounts = this.accounts.filter(account => account.address.toLowerCase() !== address.toLowerCase())
  }

  getReceiptIdentifier(address) {
    return this._getShardForAddress(address).then(shard => utils.account.getMultiEd25519AccountReceiptIdentifier(shard))
  }

  /* PRIVATE METHODS */

  _getShardForAddress(address) {
    const _address = sigUtil.normalize(address)
    return new Promise((resolve, reject) => {
      const accounts = this.accounts.filter(account => account.address === _address)
      if (!accounts.length > 0) {
        reject(new Error('MultiSign Keyring - Unable to find matching address.'))
      }
      resolve(accounts[0].shard)
    })
  }
}

MutiSignKeyring.type = type
module.exports = MutiSignKeyring
