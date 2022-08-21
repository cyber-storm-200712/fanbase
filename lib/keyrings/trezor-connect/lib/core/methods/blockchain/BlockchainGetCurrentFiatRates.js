"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("../AbstractMethod"));

var _paramsValidator = require("../helpers/paramsValidator");

var _constants = require("../../../constants");

var _BlockchainLink = require("../../../backend/BlockchainLink");

var _CoinInfo = require("../../../data/CoinInfo");

var BlockchainGetCurrentFiatRates = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(BlockchainGetCurrentFiatRates, _AbstractMethod);

  function BlockchainGetCurrentFiatRates() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = BlockchainGetCurrentFiatRates.prototype;

  _proto.init = function init() {
    this.useDevice = false;
    this.useUi = false;
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'currencies',
      type: 'array',
      required: false
    }, {
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
      currencies: payload.currencies,
      coinInfo: coinInfo
    };
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var backend;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _BlockchainLink.initBlockchain)(this.params.coinInfo, this.postMessage);

            case 2:
              backend = _context.sent;
              return _context.abrupt("return", backend.getCurrentFiatRates({
                currencies: this.params.currencies
              }));

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  return BlockchainGetCurrentFiatRates;
}(_AbstractMethod2["default"]);

exports["default"] = BlockchainGetCurrentFiatRates;