"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getOrigin = exports.httpRequest = void 0;

var _crossFetch = _interopRequireDefault(require("cross-fetch"));

/* eslint-disable global-require */
if (global && typeof global.fetch !== 'function') {
  global.fetch = _crossFetch["default"];
}

var httpRequest = function httpRequest(url, _type) {
  var fileUrl = url.split('?')[0];

  switch (fileUrl) {
    case './data/config.json':
      return require('../../../data/config.json');

    case './data/coins.json':
      return require('../../../data/coins.json');

    case './data/bridge/releases.json':
      return require('@trezor/connect-common/files/bridge/releases.json');

    case './data/firmware/1/releases.json':
      return require('@trezor/connect-common/files/firmware/1/releases.json');

    case './data/firmware/2/releases.json':
      return require('@trezor/connect-common/files/firmware/2/releases.json');

    case './data/messages/messages.json':
      return require('../../../data/messages/messages.json');

    default:
      return null;
  }
};

exports.httpRequest = httpRequest;

var getOrigin = function getOrigin(url) {
  if (url.indexOf('file://') === 0) return 'file://'; // eslint-disable-next-line no-useless-escape

  var parts = url.match(/^.+\:\/\/[^\/]+/);
  return Array.isArray(parts) && parts.length > 0 ? parts[0] : 'unknown';
};

exports.getOrigin = getOrigin;