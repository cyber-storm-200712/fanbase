"use strict";

exports.__esModule = true;
exports.firmwareNotSupported = void 0;

var _common = require("./common");

var firmwareNotSupported = function firmwareNotSupported(device) {
  var view = (0, _common.showView)('firmware-not-supported');
  if (!device.features) return;
  var features = device.features;
  var h3 = view.getElementsByTagName('h3')[0];
  h3.innerHTML = (features.major_version === 1 ? 'Trezor One' : 'Trezor T') + " is not supported";
};

exports.firmwareNotSupported = firmwareNotSupported;