"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.firmwareNotCompatible = void 0;

var _builder = require("../../message/builder");

var _DataManager = _interopRequireDefault(require("../../data/DataManager"));

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _common = require("./common");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var firmwareNotCompatible = function firmwareNotCompatible(device) {
  var view = (0, _common.showView)('firmware-not-compatible');
  if (!device.features) return;
  var features = device.features;
  var fwVersion = view.getElementsByClassName('fw-version')[0];
  var identity = view.getElementsByClassName('fw-identity');
  var developer = _DataManager["default"].getSettings('hostLabel') || _DataManager["default"].getSettings('origin') || 'this application';
  var confirmButton = view.getElementsByClassName('confirm')[0];
  var cancelButton = view.getElementsByClassName('cancel')[0];
  fwVersion.innerHTML = features.major_version + "." + features.minor_version + "." + features.patch_version;

  for (var i = 0; i < identity.length; i++) {
    identity[i].innerText = developer;
  }

  confirmButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_CONFIRMATION, true));
    (0, _common.showView)('loader');
  };

  cancelButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_CONFIRMATION, false));
    (0, _common.showView)('loader');
  };
};

exports.firmwareNotCompatible = firmwareNotCompatible;