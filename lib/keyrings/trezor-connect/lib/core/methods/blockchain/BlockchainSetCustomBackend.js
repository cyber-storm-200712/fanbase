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

var BlockchainSetCustomBackend = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(BlockchainSetCustomBackend, _AbstractMethod);

  function BlockchainSetCustomBackend() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = BlockchainSetCustomBackend.prototype;

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
    }, {
      name: 'blockchainLink',
      type: 'object'
    }]);
    var coinInfo = (0, _CoinInfo.getCoinInfo)(payload.coin);

    if (!coinInfo) {
      throw _constants.ERRORS.TypedError('Method_UnknownCoin');
    }

    (0, _BlockchainLink.setCustomBackend)(coinInfo, payload.blockchainLink);
    this.params = {
      coinInfo: coinInfo
    };
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var current;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              current = (0, _BlockchainLink.findBackend)(this.params.coinInfo.name);

              if (!current) {
                _context.next = 5;
                break;
              }

              current.disconnect();
              _context.next = 5;
              return (0, _BlockchainLink.initBlockchain)(this.params.coinInfo, this.postMessage);

            case 5:
              return _context.abrupt("return", true);

            case 6:
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

  return BlockchainSetCustomBackend;
}(_AbstractMethod2["default"]);

exports["default"] = BlockchainSetCustomBackend;