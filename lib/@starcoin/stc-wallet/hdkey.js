const HDKey = require('@starcoin/stc-hdkey');
const Wallet = require('./index.js');

function EthereumHDKey() {}

/*
 * Horrible wrapping.
 */
function fromHDKey(hdkey) {
  var ret = new EthereumHDKey();
  ret._hdkey = hdkey;
  return ret;
}

EthereumHDKey.fromMasterSeed = function (seedBuffer) {
  return fromHDKey(HDKey.fromMasterSeed(seedBuffer));
};

EthereumHDKey.fromExtendedKey = function (base58key) {
  return fromHDKey(HDKey.fromExtendedKey(base58key));
};

EthereumHDKey.prototype.privateExtendedKey = function () {
  if (!this._hdkey.privateExtendedKey) {
    throw new Error('This is a public key only wallet');
  }
  return this._hdkey.privateExtendedKey;
};

EthereumHDKey.prototype.publicExtendedKey = function () {
  return this._hdkey.publicExtendedKey;
};

EthereumHDKey.prototype.derivePath = function (path) {
  return fromHDKey(this._hdkey.derive(path));
};

EthereumHDKey.prototype.deriveChild = function (index) {
  return fromHDKey(this._hdkey.deriveChild(index));
};

EthereumHDKey.prototype.getWallet = function () {
  return Wallet.fromPrivatePublic(this._hdkey._privateKey, this._hdkey._publicKey);
};

module.exports = EthereumHDKey;