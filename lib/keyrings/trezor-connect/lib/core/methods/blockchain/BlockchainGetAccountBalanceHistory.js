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

var BlockchainGetAccountBalanceHistory = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(BlockchainGetAccountBalanceHistory, _AbstractMethod);

  function BlockchainGetAccountBalanceHistory() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = BlockchainGetAccountBalanceHistory.prototype;

  _proto.init = function init() {
    this.useDevice = false;
    this.useUi = false;
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'coin',
      type: 'string',
      required: true
    }, {
      name: 'descriptor',
      type: 'string',
      required: true
    }, {
      name: 'from',
      type: 'number',
      required: false
    }, {
      name: 'to',
      type: 'number',
      required: false
    }, {
      name: 'groupBy',
      type: 'number',
      required: false
    }]);
    var coinInfo = (0, _CoinInfo.getCoinInfo)(payload.coin);

    if (!coinInfo) {
      throw _constants.ERRORS.TypedError('Method_UnknownCoin');
    } // validate backend


    (0, _BlockchainLink.isBackendSupported)(coinInfo);
    this.params = {
      coinInfo: coinInfo,
      request: {
        descriptor: payload.descriptor,
        from: payload.from,
        to: payload.to,
        groupBy: payload.groupBy
      }
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
              return _context.abrupt("return", backend.getAccountBalanceHistory(this.params.request));

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

  return BlockchainGetAccountBalanceHistory;
}(_AbstractMethod2["default"]);

exports["default"] = BlockchainGetAccountBalanceHistory;