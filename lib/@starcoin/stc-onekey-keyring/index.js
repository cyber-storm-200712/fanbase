const { EventEmitter } = require('events')
const stcUtil = require('@starcoin/stc-util')
const HDKey = require('@starcoin/stc-hdkey')
const OneKeyConnect = require('@onekeyfe/js-sdk').default
const { encoding, utils } = require('@starcoin/starcoin')
const log = require('loglevel')

const hdPathString = `m/44'/101010'/0'/0'`
const keyringType = 'OneKey Hardware'
const pathBase = 'm'
const MAX_INDEX = 1000
const DELAY_BETWEEN_POPUPS = 1000
const ONEKEY_CONNECT_MANIFEST = {
  email: 'hi@onekey.so',
  appUrl: 'https://www.onekey.so',
}

class OneKeyKeyring extends EventEmitter {
  constructor(opts = {}) {
    super()
    this.type = keyringType
    this.accounts = []
    this.hdk = new HDKey()
    this.page = 0
    this.perPage = 5
    this.unlockedAccount = 0
    this.paths = {}
    this.accountPublicKeys = {}
    this.persistAllKeyringsInsideOneKey = opts.persistAllKeyringsInsideOneKey || undefined
    this.deserialize(opts)
    OneKeyConnect.manifest(ONEKEY_CONNECT_MANIFEST)
  }

  serialize() {
    return Promise.resolve({
      hdPath: this.hdPath,
      accounts: this.accounts,
      page: this.page,
      paths: this.paths,
      perPage: this.perPage,
      unlockedAccount: this.unlockedAccount,
      accountPublicKeys: this.accountPublicKeys,
    })
  }

  deserialize(opts = {}) {
    this.hdPath = opts.hdPath || hdPathString
    this.accounts = opts.accounts || []
    this.page = opts.page || 0
    this.perPage = opts.perPage || 5
    this.accountPublicKeys = opts.accountPublicKeys || {}
    this.paths = opts.paths || {}
    return Promise.resolve()
  }

  isUnlocked() {
    return Boolean(this.hdk && this.hdk.publicKey)
  }

  unlock() {
    if (this.isUnlocked()) {
      return Promise.resolve('already unlocked')
    }
    return new Promise((resolve, reject) => {
      try {
        const path = `${ this.hdPath }/0'`
        OneKeyConnect.starcoinGetPublicKey({
          path,
          showOnDevice: false,
        }).then((response) => {
          if (response.success) {
            this.hdk.publicKey = Buffer.from(response.payload.publicKey, 'hex')
            // this.hdk.chainCode = Buffer.from(response.payload.chainCode, 'hex')
            resolve('just unlocked')
          } else {
            reject(new Error((response.payload && response.payload.error) || 'Unknown error'))
          }
        }).catch((e) => {
          reject(new Error((e && e.toString()) || 'Unknown error'))
        })
      } catch (e) {
        reject(new Error((e && e.toString()) || 'Unknown error'))
      }
    })
  }

  setAccountToUnlock(index) {
    this.unlockedAccount = parseInt(index, 10)
  }

  addAccounts(n = 1) {
    return new Promise((resolve, reject) => {
      this.unlock()
        .then(async (_) => {
          const from = this.unlockedAccount
          const to = from + n

          for (let i = from; i < to; i++) {
            const address = await this._addressFromIndex(this.hdPath, i)
            if (!this.accounts.includes(address)) {
              this.accounts.push(address)
            }
            this.page = 0
          }
          resolve(this.accounts)
        })
        .catch((e) => {
          reject(e)
        })
    })
  }

  getFirstPage() {
    this.page = 0
    return this.__getPage(1)
  }

  getNextPage() {
    return this.__getPage(1)
  }

  getPreviousPage() {
    return this.__getPage(-1)
  }

  __getPage(increment) {
    this.page += increment

    if (this.page <= 0) {
      this.page = 1
    }
    return new Promise((resolve, reject) => {
      this.unlock()
        .then(async (_) => {

          const from = (this.page - 1) * this.perPage
          const to = from + this.perPage

          const accounts = []

          const bundle = []
          for (let i = from; i < to; i++) {
            bundle.push({ path: `${ this.hdPath }/${ i }'`, showOnDevice: false })
          }
          const addresses = await this._addressFromBundle(bundle)
          addresses.forEach((item) => {
            accounts.push({
              address: item[0],
              balance: null,
              index: item[1],
            })
            this.paths[stcUtil.toChecksumAddress(item[0])] = item[1]
          })
          resolve(accounts)
        })
        .catch((e) => {
          reject(e)
        })
    })
  }

  getAccounts() {
    return Promise.resolve(this.accounts.slice())
  }

  removeAccount(address) {
    if (!this.accounts.map((a) => a.toLowerCase()).includes(address.toLowerCase())) {
      throw new Error(`Address ${ address } not found in this keyring`)
    }
    this.accounts = this.accounts.filter((a) => a.toLowerCase() !== address.toLowerCase())
  }

  // tx is an instance of the starcoin_types.RawUserTransaction.
  signTransaction(address, tx) {
    return new Promise((resolve, reject) => {
      this.unlock()
        .then((status) => {
          setTimeout(async (_) => {
            try {
              OneKeyConnect.starcoinSignTransaction({
                path: await this._pathFromAddress(address),
                rawTx: stcUtil.stripHexPrefix(encoding.bcsEncode(tx)),
              }).then((response) => {
                if (response.success) {
                  const signature = stcUtil.addHexPrefix(response.payload.signature)
                  const public_key = stcUtil.addHexPrefix(response.payload.public_key)
                  const signedTx = utils.tx.signTxn(public_key, signature, tx)

                  const addressSignedWith = stcUtil.toChecksumAddress(encoding.addressFromSCS(tx.sender))
                  const correctAddress = stcUtil.toChecksumAddress(address)
                  if (addressSignedWith !== correctAddress) {
                    reject(new Error('签名的 OneKey 设备与绑定的 OneKey 账户不是同一个设备，请确认后重试！'))
                  }

                  const signedTxHex = encoding.bcsEncode(signedTx)

                  resolve(signedTxHex)
                } else {
                  reject(new Error((response.payload && response.payload.error) || '1.Unknown error'))
                }
              }).catch((e) => {
                reject(new Error((e && e.toString()) || '2.Unknown error'))
              })
            } catch (e) {
              // 上面的 this._pathFromAddress 可能会扔出错误, 没有被catch, promise 就一直在pending
              reject(new Error((e && e.toString()) || '3.Unknown error'))
            }
            // This is necessary to avoid popup collision
            // between the unlock & sign onekey popups
          }, status === 'just unlocked' ? DELAY_BETWEEN_POPUPS : 0)

        }).catch((e) => {
          reject(new Error((e && e.toString()) || '4.Unknown error'))
        })
    })
  }

  signMessage(withAccount, data) {
    return this.signPersonalMessage(withAccount, data)
  }

  // For personal_sign, we need to prefix the message:
  signPersonalMessage(withAccount, message) {
    return new Promise((resolve, reject) => {
      this.unlock()
        .then((status) => {
          setTimeout(async (_) => {
            try {
              OneKeyConnect.starcoinSignMessage({
                path: await this._pathFromAddress(withAccount),
                message,
              }).then((response) => {
                if (response.success) {
                  resolve(response.payload)
                } else {
                  reject(new Error((response.payload && response.payload.error) || 'Unknown error'))
                }
              }).catch((e) => {
                log.info('Error while trying to sign a message ', e)
                reject(new Error((e && e.toString()) || 'Unknown error'))
              })
            } catch (e) {
              reject(new Error((e && e.toString()) || 'Unknown error'))
            }
            // This is necessary to avoid popup collision
            // between the unlock & sign onekey popups
          }, status === 'just unlocked' ? DELAY_BETWEEN_POPUPS : 0)
        }).catch((e) => {
          log.info('Error while trying to sign a message ', e)
          reject(new Error((e && e.toString()) || 'Unknown error'))
        })
    })
  }

  signTypedData() {
    // Waiting on onekey to enable this
    return Promise.reject(new Error('Not supported on this device'))
  }

  exportAccount() {
    return Promise.reject(new Error('Not supported on this device'))
  }

  forgetDevice() {
    this.accounts = []
    this.hdk = new HDKey()
    this.page = 0
    this.unlockedAccount = 0
    this.paths = {}
    this.accountPublicKeys = {}
  }

  getPublicKeyFor(address, opts = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const checksummedAddress = stcUtil.toChecksumAddress(address)
        if (this.accountPublicKeys[checksummedAddress]) {
          resolve(this.accountPublicKeys[checksummedAddress])
          return
        }
        const path = await this._pathFromAddress(address)
        OneKeyConnect.starcoinGetPublicKey({
          path,
          showOnDevice: false,
        }).then((response) => {
          if (response.success) {
            const publicKey = stcUtil.addHexPrefix(response.payload.publicKey)
            this.accountPublicKeys[checksummedAddress] = publicKey
            if (this.persistAllKeyringsInsideOneKey) {
              this.persistAllKeyringsInsideOneKey()
            }
            resolve(publicKey)
          } else {
            reject(new Error((response.payload && response.payload.error) || 'Unknown error 1'))
          }
        }).catch((e) => {
          reject(new Error((e && e.toString()) || 'Unknown error 2'))
        })
      } catch (e) {
        reject(new Error((e && e.toString()) || 'Unknown error 3'))
      }
    })
  }

  getReceiptIdentifier(address) {
    return this.getPublicKeyFor(address).then((publicKey) => encoding.publicKeyToReceiptIdentifier(publicKey))
  }

  /* PRIVATE METHODS */

  _normalize(buf) {
    return stcUtil.bufferToHex(buf).toString()
  }

  // eslint-disable-next-line no-shadow
  _addressFromBundle(bundle) {
    return new Promise((resolve, reject) => {
      try {
        OneKeyConnect.starcoinGetAddress({
          bundle,
        }).then((response) => {
          if (response.success) {
            const addresses = response.payload.map((item, idx) => {
              const arr = item.serializedPath.split('/')
              const i = arr[arr.length - 1].split("'")[0]
              return [item.address, parseInt(i, 10)]
            })
            resolve(addresses)
          } else {
            reject(new Error((response.payload && response.payload.error) || 'Unknown error'))
          }
        }).catch((e) => {
          reject(new Error((e && e.toString()) || 'Unknown error'))
        })
      } catch (e) {
        reject(new Error((e && e.toString()) || 'Unknown error'))
      }
    })
  }

  // eslint-disable-next-line no-shadow
  _addressFromIndex(pathBase, i) {
    return new Promise((resolve, reject) => {
      try {
        const path = `${ pathBase }/${ i }'`
        OneKeyConnect.starcoinGetAddress({
          path,
          showOnDevice: false,
        }).then((response) => {
          if (response.success) {
            resolve(stcUtil.toChecksumAddress(response.payload.address))
          } else {
            reject(new Error((response.payload && response.payload.error) || 'Unknown error'))
          }
        }).catch((e) => {
          reject(new Error((e && e.toString()) || 'Unknown error'))
        })
      } catch (e) {
        reject(new Error((e && e.toString()) || 'Unknown error'))
      }
    })
  }

  async _pathFromAddress(address) {
    const checksummedAddress = stcUtil.toChecksumAddress(address)
    let index = this.paths[checksummedAddress]
    if (typeof index === 'undefined') {
      for (let i = 0; i < MAX_INDEX; i++) {
        if (checksummedAddress === await this._addressFromIndex(this.hdPath, i)) {
          index = i
          break
        }
      }
    }

    if (typeof index === 'undefined') {
      throw new Error('Unknown address')
    }
    return `${ this.hdPath }/${ index }'`
  }
}

OneKeyKeyring.type = keyringType
module.exports = OneKeyKeyring
