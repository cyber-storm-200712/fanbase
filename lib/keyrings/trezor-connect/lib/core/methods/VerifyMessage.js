"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _CoinInfo = require("../../data/CoinInfo");

var _pathUtils = require("../../utils/pathUtils");

var _formatUtils = require("../../utils/formatUtils");

var _constants = require("../../constants");

var VerifyMessage = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(VerifyMessage, _AbstractMethod);

  function VerifyMessage() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = VerifyMessage.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read', 'write'];
    this.info = 'Verify message';
    var payload = this.payload; // validate incoming parameters for each batch

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'address',
      type: 'string',
      required: true
    }, {
      name: 'signature',
      type: 'string',
      required: true
    }, {
      name: 'message',
      type: 'string',
      required: true
    }, {
      name: 'coin',
      type: 'string',
      required: true
    }, {
      name: 'hex',
      type: 'boolean'
    }]);
    var coinInfo = (0, _CoinInfo.getBitcoinNetwork)(payload.coin);

    if (!coinInfo) {
      throw _constants.ERRORS.TypedError('Method_UnknownCoin');
    } else {
      // check required firmware with coinInfo support
      this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, coinInfo, this.firmwareRange);
      this.info = (0, _pathUtils.getLabel)('Verify #NETWORK message', coinInfo);
    }

    var messageHex = payload.hex ? (0, _formatUtils.messageToHex)(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
    var signatureHex = Buffer.from(payload.signature, 'base64').toString('hex');
    this.params = {
      address: payload.address,
      signature: signatureHex,
      message: messageHex,
      coin_name: coinInfo.name
    };
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var cmd, response;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              cmd = this.device.getCommands();
              _context.next = 3;
              return cmd.typedCall('VerifyMessage', 'Success', this.params);

            case 3:
              response = _context.sent;
              return _context.abrupt("return", response.message);

            case 5:
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

  return VerifyMessage;
}(_AbstractMethod2["default"]);

exports["default"] = VerifyMessage;