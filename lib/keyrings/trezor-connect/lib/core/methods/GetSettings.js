"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _DataManager = _interopRequireDefault(require("../../data/DataManager"));

var GetSettings = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(GetSettings, _AbstractMethod);

  function GetSettings() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = GetSettings.prototype;

  _proto.init = function init() {
    this.requiredPermissions = [];
    this.useDevice = false;
    this.useUi = false;
  };

  _proto.run = function run() {
    return Promise.resolve(_DataManager["default"].getSettings());
  };

  return GetSettings;
}(_AbstractMethod2["default"]);

exports["default"] = GetSettings;