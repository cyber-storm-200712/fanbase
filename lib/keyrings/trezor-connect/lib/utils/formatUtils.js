"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.messageToHex = exports.stripHexPrefix = exports.hasHexPrefix = exports.btckb2satoshib = exports.formatTime = exports.formatAmountOld = exports.formatAmount = void 0;

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var currencyUnits = 'btc';

var formatAmount = function formatAmount(n, coinInfo) {
  return new _bignumber["default"](n).div(Math.pow(10, coinInfo.decimals)).toString(10) + " " + coinInfo.shortcut;
};

exports.formatAmount = formatAmount;

var formatAmountOld = function formatAmountOld(n, coinInfo) {
  var amount = n / 1e8; // if (coinInfo.isBitcoin && currencyUnits === 'mbtc' && amount <= 0.1 && n !== 0) {

  if (currencyUnits === 'mbtc' && amount <= 0.1 && n !== 0) {
    var _s = (n / 1e5).toString();

    return _s + " mBTC";
  }

  var s = amount.toString();
  return s + " " + coinInfo.shortcut;
};

exports.formatAmountOld = formatAmountOld;

var formatTime = function formatTime(n) {
  if (!n || n <= 0) return 'No time estimate';
  var hours = Math.floor(n / 60);
  var minutes = n % 60;
  var res = '';

  if (hours !== 0) {
    res += hours + " hour";

    if (hours > 1) {
      res += 's';
    }

    res += ' ';
  }

  if (minutes !== 0) {
    res += minutes + " minutes";
  }

  return res;
};

exports.formatTime = formatTime;

var btckb2satoshib = function btckb2satoshib(n) {
  return new _bignumber["default"](n).times(1e5).toFixed(0, _bignumber["default"].ROUND_HALF_UP);
};

exports.btckb2satoshib = btckb2satoshib;

var hasHexPrefix = function hasHexPrefix(str) {
  return str.slice(0, 2).toLowerCase() === '0x';
};

exports.hasHexPrefix = hasHexPrefix;

var stripHexPrefix = function stripHexPrefix(str) {
  return hasHexPrefix(str) ? str.slice(2) : str;
}; // from (isHexString) https://github.com/ethjs/ethjs-util/blob/master/src/index.js


exports.stripHexPrefix = stripHexPrefix;

var isHexString = function isHexString(value, length) {
  if (typeof value !== 'string' || !value.match(/^(0x|0X)?[0-9A-Fa-f]*$/)) {
    return false;
  }

  if (length && value.length !== 2 + 2 * length) {
    return false;
  }

  return true;
}; // from (toBuffer) https://github.com/ethereumjs/ethereumjs-util/blob/master/index.js


var messageToHex = function messageToHex(message) {
  var buffer;

  if (isHexString(message)) {
    var clean = stripHexPrefix(message); // pad left even

    if (clean.length % 2 !== 0) {
      clean = "0" + clean;
    }

    buffer = Buffer.from(clean, 'hex');
  } else {
    buffer = Buffer.from(message);
  }

  return buffer.toString('hex');
};

exports.messageToHex = messageToHex;