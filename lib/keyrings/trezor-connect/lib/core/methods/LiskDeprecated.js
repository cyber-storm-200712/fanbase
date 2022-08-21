"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

// Empty placeholder for all Lisk methods
// FirmwareRange is set to "0" for both T1 and TT
// This should be removed in next major version of connect
var LiskDeprecated = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(LiskDeprecated, _AbstractMethod);

  function LiskDeprecated() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = LiskDeprecated.prototype;

  _proto.init = function init() {
    this.firmwareRange = {
      '1': {
        min: '0',
        max: '0'
      },
      '2': {
        min: '0',
        max: '0'
      }
    };
    this.info = 'Lisk not supported';
  };

  _proto.run = function run() {
    throw new Error(this.info);
  };

  return LiskDeprecated;
}(_AbstractMethod2["default"]);

exports["default"] = LiskDeprecated;