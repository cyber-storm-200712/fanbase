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

var _Fees = _interopRequireDefault(require("../tx/Fees"));

var _BlockchainLink = require("../../../backend/BlockchainLink");

var _CoinInfo = require("../../../data/CoinInfo");

var BlockchainEstimateFee = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(BlockchainEstimateFee, _AbstractMethod);

  function BlockchainEstimateFee() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = BlockchainEstimateFee.prototype;

  _proto.init = function init() {
    this.useDevice = false;
    this.useUi = false;
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'coin',
      type: 'string',
      required: true
    }, {
      name: 'request',
      type: 'object'
    }]);
    var request = payload.request;

    if (request) {
      (0, _paramsValidator.validateParams)(request, [{
        name: 'blocks',
        type: 'array'
      }, {
        name: 'specific',
        type: 'object'
      }, {
        name: 'feeLevels',
        type: 'string'
      }]);

      if (request.specific) {
        (0, _paramsValidator.validateParams)(request.specific, [{
          name: 'conservative',
          type: 'boolean'
        }, {
          name: 'data',
          type: 'string'
        }, {
          name: 'from',
          type: 'string'
        }, {
          name: 'to',
          type: 'string'
        }, {
          name: 'txsize',
          type: 'number'
        }]);
      }
    }

    var coinInfo = (0, _CoinInfo.getCoinInfo)(payload.coin);

    if (!coinInfo) {
      throw _constants.ERRORS.TypedError('Method_UnknownCoin');
    } // validate backend


    (0, _BlockchainLink.isBackendSupported)(coinInfo);
    this.params = {
      coinInfo: coinInfo,
      request: request
    };
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _this$params, coinInfo, request, feeInfo, fees, backend, _backend;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _this$params = this.params, coinInfo = _this$params.coinInfo, request = _this$params.request;
              feeInfo = {
                blockTime: coinInfo.blocktime,
                minFee: coinInfo.minFee,
                maxFee: coinInfo.maxFee,
                dustLimit: coinInfo.type === 'bitcoin' ? coinInfo.dustLimit : undefined,
                levels: []
              };

              if (!(request && request.feeLevels)) {
                _context.next = 13;
                break;
              }

              fees = new _Fees["default"](coinInfo); // smart fees for DOGE are not relevant since their fee policy changed, see @trezor/utxo-lib/compose: baseFee

              if (!(request.feeLevels === 'smart' && coinInfo.shortcut !== 'DOGE')) {
                _context.next = 10;
                break;
              }

              _context.next = 7;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 7:
              backend = _context.sent;
              _context.next = 10;
              return fees.load(backend);

            case 10:
              feeInfo.levels = fees.levels;
              _context.next = 19;
              break;

            case 13:
              _context.next = 15;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 15:
              _backend = _context.sent;
              _context.next = 18;
              return _backend.estimateFee(request || {});

            case 18:
              feeInfo.levels = _context.sent;

            case 19:
              return _context.abrupt("return", feeInfo);

            case 20:
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

  return BlockchainEstimateFee;
}(_AbstractMethod2["default"]);

exports["default"] = BlockchainEstimateFee;