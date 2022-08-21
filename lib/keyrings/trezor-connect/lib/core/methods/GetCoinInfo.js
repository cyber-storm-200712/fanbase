"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _constants = require("../../constants");

var _CoinInfo = require("../../data/CoinInfo");

var GetCoinInfo = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(GetCoinInfo, _AbstractMethod);

  function GetCoinInfo() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = GetCoinInfo.prototype;

  _proto.init = function init() {
    this.requiredPermissions = [];
    this.useDevice = false;
    this.useUi = false;
    var payload = this.payload;
    (0, _paramsValidator.validateParams)(payload, [{
      name: 'coin',
      type: 'string',
      required: true
    }]);
    var coinInfo = (0, _CoinInfo.getCoinInfo)(payload.coin);

    if (!coinInfo) {
      throw _constants.ERRORS.TypedError('Method_UnknownCoin');
    }

    this.params = {
      coinInfo: coinInfo
    };
  };

  _proto.run = function run() {
    return Promise.resolve(this.params.coinInfo);
  };

  return GetCoinInfo;
}(_AbstractMethod2["default"]);

exports["default"] = GetCoinInfo;