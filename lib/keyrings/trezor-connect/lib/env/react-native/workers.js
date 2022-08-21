"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.BlockfrostWorker = exports.RippleWorker = exports.BlockbookWorker = exports.ReactNativeUsbPlugin = exports.WebUsbPlugin = void 0;

var _blockbookWorker = _interopRequireDefault(require("@trezor/blockchain-link/build/module/blockbook-worker.js"));

var _rippleWorker = _interopRequireDefault(require("@trezor/blockchain-link/build/module/ripple-worker.js"));

var _blockfrostWorker = _interopRequireDefault(require("@trezor/blockchain-link/build/module/blockfrost-worker.js"));

var _transport = _interopRequireDefault(require("@trezor/transport"));

var _RNUsbPlugin = _interopRequireDefault(require("./RNUsbPlugin"));

/* eslint-disable import/extensions */
// $FlowIssue
// $FlowIssue
// $FlowIssue
var WebUsbPlugin = undefined;
exports.WebUsbPlugin = WebUsbPlugin;

var ReactNativeUsbPlugin = function ReactNativeUsbPlugin() {
  return new _transport["default"].Lowlevel(new _RNUsbPlugin["default"]());
};

exports.ReactNativeUsbPlugin = ReactNativeUsbPlugin;

var BlockbookWorker = function BlockbookWorker() {
  return new _blockbookWorker["default"]();
};

exports.BlockbookWorker = BlockbookWorker;

var RippleWorker = function RippleWorker() {
  return new _rippleWorker["default"]();
};

exports.RippleWorker = RippleWorker;

var BlockfrostWorker = function BlockfrostWorker() {
  return new _blockfrostWorker["default"]();
};

exports.BlockfrostWorker = BlockfrostWorker;