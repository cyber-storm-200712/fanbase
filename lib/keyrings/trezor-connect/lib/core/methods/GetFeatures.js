"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var UI = _interopRequireWildcard(require("../../constants/ui"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var GetFeatures = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(GetFeatures, _AbstractMethod);

  function GetFeatures() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = GetFeatures.prototype;

  _proto.init = function init() {
    this.requiredPermissions = [];
    this.useUi = false;
    this.allowDeviceMode = [].concat(this.allowDeviceMode, [UI.INITIALIZE, UI.BOOTLOADER]);
    this.useDeviceState = false;
    this.skipFirmwareCheck = true;
  };

  _proto.run = function run() {
    return Promise.resolve(this.device.features);
  };

  return GetFeatures;
}(_AbstractMethod2["default"]);

exports["default"] = GetFeatures;