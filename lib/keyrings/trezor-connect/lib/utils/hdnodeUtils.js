"use strict";

exports.__esModule = true;
exports.xpubDerive = xpubDerive;
exports.convertMultisigPubKey = exports.xpubToHDNodeType = exports.convertBitcoinXpub = exports.convertXpub = void 0;

var _utxoLib = require("@trezor/utxo-lib");

var _constants = require("../constants");

var pubNode2bjsNode = function pubNode2bjsNode(node, network) {
  var chainCode = Buffer.from(node.chain_code, 'hex');
  var publicKey = Buffer.from(node.public_key, 'hex');

  var res = _utxoLib.bip32.fromPublicKey(publicKey, chainCode, network); // override private fields of BIP32Interface


  res.__DEPTH = node.depth;
  res.__INDEX = node.child_num;
  res.__PARENT_FINGERPRINT = node.fingerprint;
  return res;
};

var convertXpub = function convertXpub(xpub, originalNetwork, requestedNetwork) {
  var node = _utxoLib.bip32.fromBase58(xpub, originalNetwork);

  if (requestedNetwork) {
    // override network of BIP32Interface
    node.network = requestedNetwork;
  }

  return node.toBase58();
}; // stupid hack, because older (1.7.1, 2.0.8) trezor FW serializes all xpubs with bitcoin magic


exports.convertXpub = convertXpub;

var convertBitcoinXpub = function convertBitcoinXpub(xpub, network) {
  if (network.bip32["public"] === 0x0488b21e) {
    // it's bitcoin-like => return xpub
    return xpub;
  }

  var node = _utxoLib.bip32.fromBase58(xpub); // use default bitcoin magic
  // override network of BIP32Interface


  node.network = network;
  return node.toBase58();
}; // converts from protobuf.PublicKey to bip32.BIP32Interface


exports.convertBitcoinXpub = convertBitcoinXpub;

var pubKey2bjsNode = function pubKey2bjsNode(key, network) {
  var keyNode = key.node;
  var bjsNode = pubNode2bjsNode(keyNode, network);
  var bjsXpub = bjsNode.toBase58();
  var keyXpub = convertXpub(key.xpub, network);

  if (bjsXpub !== keyXpub) {
    throw _constants.ERRORS.TypedError('Runtime', "pubKey2bjsNode: Invalid public key transmission detected. Key: " + bjsXpub + ", Received: " + keyXpub);
  }

  return bjsNode;
};

var checkDerivation = function checkDerivation(parBjsNode, childBjsNode, suffix) {
  var derivedChildBjsNode = parBjsNode.derive(suffix);
  var derivedXpub = derivedChildBjsNode.toBase58();
  var compXpub = childBjsNode.toBase58();

  if (derivedXpub !== compXpub) {
    throw _constants.ERRORS.TypedError('Runtime', "checkDerivation: Invalid child cross-check public key. Derived: " + derivedXpub + ", Received: " + compXpub);
  }
};

function xpubDerive(xpub, childXPub, suffix, network, _requestedNetwork) {
  var resNode = pubKey2bjsNode(xpub, network);
  var childNode = pubKey2bjsNode(childXPub, network);
  checkDerivation(resNode, childNode, suffix);
  return xpub;
}

var xpubToHDNodeType = function xpubToHDNodeType(xpub, network) {
  var hd = _utxoLib.bip32.fromBase58(xpub, network);

  return {
    depth: hd.depth,
    child_num: hd.index,
    fingerprint: hd.parentFingerprint,
    public_key: hd.publicKey.toString('hex'),
    chain_code: hd.chainCode.toString('hex')
  };
};

exports.xpubToHDNodeType = xpubToHDNodeType;

var convertMultisigPubKey = function convertMultisigPubKey(network, utxo) {
  if (utxo.multisig && utxo.multisig.pubkeys) {
    // convert xpubs to HDNodeTypes
    utxo.multisig.pubkeys.forEach(function (pk) {
      if (typeof pk.node === 'string') {
        pk.node = xpubToHDNodeType(pk.node, network);
      }
    });
  }

  return utxo;
};

exports.convertMultisigPubKey = convertMultisigPubKey;