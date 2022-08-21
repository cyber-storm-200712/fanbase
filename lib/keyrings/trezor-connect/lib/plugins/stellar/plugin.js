"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// eslint-disable-next-line import/no-unresolved
var StellarSdk = require('stellar-sdk');

var BigNumber = require('bignumber.js');
/**
 * Transforms StellarSdk.Signer to TrezorConnect.StellarTransaction.Signer
 * @param {StellarSdk.Signer} signer
 * @returns { type: 1 | 2 | 3, key: string, weight: number }
 */


var transformSigner = function transformSigner(signer) {
  var type = 0;
  var key;
  var weight = signer.weight;

  if (typeof signer.ed25519PublicKey === 'string') {
    var keyPair = StellarSdk.Keypair.fromPublicKey(signer.ed25519PublicKey);
    key = keyPair.rawPublicKey().toString('hex');
  }

  if (signer.preAuthTx instanceof Buffer) {
    type = 1;
    key = signer.preAuthTx.toString('hex');
  }

  if (signer.sha256Hash instanceof Buffer) {
    type = 2;
    key = signer.sha256Hash.toString('hex');
  }

  return {
    type: type,
    key: key,
    weight: weight
  };
};
/**
 * Transforms StellarSdk.Asset to TrezorConnect.StellarTransaction.Asset
 * @param {StellarSdk.Asset} asset
 * @returns { type: 0 | 1 | 2, code: string, issuer?: string }
 */


var transformAsset = function transformAsset(asset) {
  if (asset.isNative()) {
    return {
      type: 0,
      code: asset.getCode()
    };
  }

  return {
    type: asset.getAssetType() === 'credit_alphanum4' ? 1 : 2,
    code: asset.getCode(),
    issuer: asset.getIssuer()
  };
};
/**
 * Transforms amount from decimals (lumens) to integer (stroop)
 * @param {string} amount
 * @returns {string}
 */


var transformAmount = function transformAmount(amount) {
  return new BigNumber(amount).times(10000000).toString();
};
/**
 * Transforms StellarSdk.Memo to TrezorConnect.StellarTransaction.Memo
 * @param {string} type
 * @returns {string}
 */


var transformMemo = function transformMemo(memo) {
  switch (memo.type) {
    case StellarSdk.MemoText:
      return {
        type: 1,
        text: memo.value.toString('utf-8')
      };

    case StellarSdk.MemoID:
      return {
        type: 2,
        id: memo.value
      };

    case StellarSdk.MemoHash:
      // stringify is not necessary, Buffer is also accepted
      return {
        type: 3,
        hash: memo.value.toString('hex')
      };

    case StellarSdk.MemoReturn:
      // stringify is not necessary, Buffer is also accepted
      return {
        type: 4,
        hash: memo.value.toString('hex')
      };

    default:
      return {
        type: 0
      };
  }
};
/**
 * Transforms StellarSdk.Transaction.timeBounds to TrezorConnect.StellarTransaction.timebounds
 * @param {string} path
 * @param {StellarSdk.Transaction.timeBounds} timebounds
 * @returns {minTime: number, maxTime: number}
 */


var transformTimebounds = function transformTimebounds(timebounds) {
  if (!timebounds) return undefined; // those values are defined in Trezor firmware messages as numbers

  return {
    minTime: Number.parseInt(timebounds.minTime, 10),
    maxTime: Number.parseInt(timebounds.maxTime, 10)
  };
};
/**
 * Transforms StellarSdk.Transaction to TrezorConnect.StellarTransaction
 * @param {string} path
 * @param {StellarSdk.Transaction} transaction
 * @returns {TrezorConnect.StellarTransaction}
 */


var transformTransaction = function transformTransaction(path, transaction) {
  var amounts = ['amount', 'sendMax', 'destAmount', 'startingBalance', 'limit', 'buyAmount'];
  var assets = ['asset', 'sendAsset', 'destAsset', 'selling', 'buying', 'line'];
  var operations = transaction.operations.map(function (o, i) {
    var operation = _objectSpread({}, o); // transform StellarSdk.Signer


    if (operation.signer) {
      operation.signer = transformSigner(operation.signer);
    } // transform asset path


    if (operation.path) {
      operation.path = operation.path.map(transformAsset);
    } // transform "price" field to { n: number, d: number }


    if (typeof operation.price === 'string') {
      var xdrOperation = transaction.tx.operations()[i];
      operation.price = {
        n: xdrOperation.body().value().price().n(),
        d: xdrOperation.body().value().price().d()
      };
    } // transform amounts


    amounts.forEach(function (field) {
      if (typeof operation[field] === 'string') {
        operation[field] = transformAmount(operation[field]);
      }
    }); // transform assets

    assets.forEach(function (field) {
      if (operation[field]) {
        operation[field] = transformAsset(operation[field]);
      }
    }); // add missing field

    if (operation.type === 'allowTrust') {
      var allowTrustAsset = new StellarSdk.Asset(operation.assetCode, operation.trustor);
      operation.assetType = transformAsset(allowTrustAsset).type;
    }

    if (operation.type === 'manageData' && operation.value) {
      // stringify is not necessary, Buffer is also accepted
      operation.value = operation.value.toString('hex');
    }

    if (operation.type === 'manageBuyOffer') {
      operation.amount = operation.buyAmount;
      delete operation.buyAmount;
    }

    operation.type = o.type;
    return operation;
  });
  return {
    path: path,
    networkPassphrase: transaction.networkPassphrase,
    transaction: {
      source: transaction.source,
      fee: Number.parseInt(transaction.fee, 10),
      sequence: transaction.sequence,
      memo: transformMemo(transaction.memo),
      timebounds: transformTimebounds(transaction.timeBounds),
      operations: operations
    }
  };
};

exports["default"] = transformTransaction;
module.exports = exports["default"];