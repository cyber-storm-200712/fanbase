"use strict";

exports.__esModule = true;
exports.firmwareRequiredUpdate = void 0;

var _common = require("./common");

var firmwareRequiredUpdate = function firmwareRequiredUpdate(device) {
  var view = (0, _common.showView)('firmware-update');
  if (!device.features) return;
  if (!device.firmwareRelease) return;
  var button = view.getElementsByClassName('confirm')[0];
  button.setAttribute('href', 'https://suite.trezor.io/web/firmware/');
};

exports.firmwareRequiredUpdate = firmwareRequiredUpdate;