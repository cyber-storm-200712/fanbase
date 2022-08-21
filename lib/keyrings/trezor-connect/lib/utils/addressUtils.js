"use strict";

exports.__esModule = true;
exports.isValidAddress = void 0;

var _utxoLib = require("@trezor/utxo-lib");

// Base58
var isValidBase58Address = function isValidBase58Address(address, network) {
  try {
    var decoded = _utxoLib.address.fromBase58Check(address, network);

    if (decoded.version !== network.pubKeyHash && decoded.version !== network.scriptHash) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
}; // segwit native


var isValidBech32Address = function isValidBech32Address(address, network) {
  try {
    var decoded = _utxoLib.address.fromBech32(address);

    if (decoded.prefix !== network.bech32) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
};

var isValidAddress = function isValidAddress(address, coinInfo) {
  return isValidBase58Address(address, coinInfo.network) || isValidBech32Address(address, coinInfo.network);
};

exports.isValidAddress = isValidAddress;