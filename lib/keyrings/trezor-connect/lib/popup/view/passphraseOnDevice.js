"use strict";

exports.__esModule = true;
exports.passphraseOnDeviceView = void 0;

var _common = require("./common");

var passphraseOnDeviceView = function passphraseOnDeviceView(payload) {
  (0, _common.showView)('passphrase-on-device');

  var deviceName = _common.container.getElementsByClassName('device-name')[0];

  deviceName.innerText = payload.device.label;
};

exports.passphraseOnDeviceView = passphraseOnDeviceView;