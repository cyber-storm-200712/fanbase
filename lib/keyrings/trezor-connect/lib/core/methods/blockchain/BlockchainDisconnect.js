"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("../AbstractMethod"));

var _paramsValidator = require("../helpers/paramsValidator");

var _constants = require("../../../constants");

var _BlockchainLink = require("../../../backend/BlockchainLink");

var _CoinInfo = require("../../../data/CoinInfo");

var BlockchainDisconnect = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(BlockchainDisconnect, _AbstractMethod);

  function BlockchainDisconnect() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = BlockchainDisconnect.prototype;

  _proto.init = function init() {
    this.requiredPermissions = [];
    this.info = '';
    this.useDevice = false;
    this.useUi = false;
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'coin',
      type: 'string',
      required: true
    }]);
    var coinInfo = (0, _CoinInfo.getCoinInfo)(payload.coin);

    if (!coinInfo) {
      throw _constants.ERRORS.TypedError('Method_UnknownCoin');
    } // validate backend


    (0, _BlockchainLink.isBackendSupported)(coinInfo);
    this.params = {
      coinInfo: coinInfo
    };
  };

  _proto.run = function run() {
    var backend = (0, _BlockchainLink.findBackend)(this.params.coinInfo.name);

    if (backend) {
      backend.disconnect();
    }

    return Promise.resolve({
      disconnected: true
    });
  };

  return BlockchainDisconnect;
}(_AbstractMethod2["default"]);

exports["default"] = BlockchainDisconnect;