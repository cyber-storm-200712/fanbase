"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.BlockfrostWorker = exports.RippleWorker = exports.BlockbookWorker = exports.ReactNativeUsbPlugin = exports.WebUsbPlugin = void 0;

var _tinyWorker = _interopRequireDefault(require("tiny-worker"));

/* istanbul ignore next */
var WebUsbPlugin = undefined;
exports.WebUsbPlugin = WebUsbPlugin;
var ReactNativeUsbPlugin = undefined;
exports.ReactNativeUsbPlugin = ReactNativeUsbPlugin;

var BlockbookWorker = function BlockbookWorker() {
  return new _tinyWorker["default"](function () {
    // $FlowIssue
    require('@trezor/blockchain-link/lib/workers/blockbook'); // eslint-disable-line global-require

  });
};

exports.BlockbookWorker = BlockbookWorker;

var RippleWorker = function RippleWorker() {
  return new _tinyWorker["default"](function () {
    // $FlowIssue
    require('@trezor/blockchain-link/lib/workers/ripple'); // eslint-disable-line global-require

  });
};

exports.RippleWorker = RippleWorker;

var BlockfrostWorker = function BlockfrostWorker() {
  return new _tinyWorker["default"](function () {
    // $FlowIssue
    require('@trezor/blockchain-link/lib/workers/blockfrost'); // eslint-disable-line global-require

  });
};

exports.BlockfrostWorker = BlockfrostWorker;