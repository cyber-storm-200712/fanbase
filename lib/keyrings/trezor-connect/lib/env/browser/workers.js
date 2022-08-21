"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.ReactNativeUsbPlugin = exports.WebUsbPlugin = void 0;

var _sharedConnectionWorker = _interopRequireDefault(require("@trezor/transport/lib/lowlevel/sharedConnectionWorker"));

var _blockbook = _interopRequireDefault(require("@trezor/blockchain-link/lib/workers/blockbook"));

exports.BlockbookWorker = _blockbook["default"];

var _ripple = _interopRequireDefault(require("@trezor/blockchain-link/lib/workers/ripple"));

exports.RippleWorker = _ripple["default"];

var _blockfrost = _interopRequireDefault(require("@trezor/blockchain-link/lib/workers/blockfrost"));

exports.BlockfrostWorker = _blockfrost["default"];

var _transport = _interopRequireDefault(require("@trezor/transport"));

var WebUsbPlugin = function WebUsbPlugin() {
  return new _transport["default"].Lowlevel(new _transport["default"].WebUsb(), typeof SharedWorker !== 'undefined' ? function () {
    return new _sharedConnectionWorker["default"]();
  } : null);
};

exports.WebUsbPlugin = WebUsbPlugin;
var ReactNativeUsbPlugin = undefined;
exports.ReactNativeUsbPlugin = ReactNativeUsbPlugin;