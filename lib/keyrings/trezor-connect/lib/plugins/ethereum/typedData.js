"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// eslint-disable-next-line import/no-unresolved
var sigUtil = require('@metamask/eth-sig-util'); // Sanitization is used for T1 as eth-sig-util does not support BigInt


function sanitizeData(data) {
  switch (Object.prototype.toString.call(data)) {
    case '[object Object]':
      {
        var entries = Object.keys(data).map(function (k) {
          return [k, sanitizeData(data[k])];
        });
        return Object.fromEntries(entries);
      }

    case '[object Array]':
      return data.map(function (v) {
        return sanitizeData(v);
      });

    case '[object BigInt]':
      return data.toString();

    default:
      return data;
  }
}

var transformTypedData = function transformTypedData(data, metamask_v4_compat) {
  if (!metamask_v4_compat) {
    throw new Error('Trezor: Only version 4 of typed data signing is supported');
  }

  var version = sigUtil.SignTypedDataVersion.V4;

  var _sigUtil$TypedDataUti = sigUtil.TypedDataUtils.sanitizeData(data),
      types = _sigUtil$TypedDataUti.types,
      primaryType = _sigUtil$TypedDataUti.primaryType,
      domain = _sigUtil$TypedDataUti.domain,
      message = _sigUtil$TypedDataUti.message;

  var domainSeparatorHash = sigUtil.TypedDataUtils.hashStruct('EIP712Domain', sanitizeData(domain), types, version).toString('hex');
  var messageHash = sigUtil.TypedDataUtils.hashStruct(primaryType, sanitizeData(message), types, version).toString('hex');
  return _objectSpread({
    domain_separator_hash: domainSeparatorHash,
    message_hash: messageHash
  }, data);
};

module.exports = transformTypedData;