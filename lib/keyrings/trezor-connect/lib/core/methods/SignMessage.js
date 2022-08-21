"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _pathUtils = require("../../utils/pathUtils");

var _CoinInfo = require("../../data/CoinInfo");

var _formatUtils = require("../../utils/formatUtils");

var SignMessage = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(SignMessage, _AbstractMethod);

  function SignMessage() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = SignMessage.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read', 'write'];
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'path',
      required: true
    }, {
      name: 'coin',
      type: 'string'
    }, {
      name: 'message',
      type: 'string',
      required: true
    }, {
      name: 'hex',
      type: 'boolean'
    }, {
      name: 'no_script_type',
      type: 'boolean'
    }]);
    var path = (0, _pathUtils.validatePath)(payload.path);
    var coinInfo;

    if (payload.coin) {
      coinInfo = (0, _CoinInfo.getBitcoinNetwork)(payload.coin);
      (0, _paramsValidator.validateCoinPath)(coinInfo, path);
    } else {
      coinInfo = (0, _CoinInfo.getBitcoinNetwork)(path);
    }

    this.info = (0, _pathUtils.getLabel)('Sign #NETWORK message', coinInfo); // firmware range depends on used no_script_type parameter
    // AOPP is possible since 1.10/42.4.3

    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(payload.no_script_type ? 'aopp' : this.name, coinInfo, this.firmwareRange);
    var messageHex = payload.hex ? (0, _formatUtils.messageToHex)(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
    var scriptType = (0, _pathUtils.getScriptType)(path);
    this.params = {
      address_n: path,
      message: messageHex,
      coin_name: coinInfo ? coinInfo.name : undefined,
      script_type: scriptType && scriptType !== 'SPENDMULTISIG' ? scriptType : 'SPENDADDRESS',
      // script_type 'SPENDMULTISIG' throws Failure_FirmwareError
      no_script_type: payload.no_script_type
    };
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var cmd, _yield$cmd$typedCall, message, signatureBuffer;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              cmd = this.device.getCommands();
              _context.next = 3;
              return cmd.typedCall('SignMessage', 'MessageSignature', this.params);

            case 3:
              _yield$cmd$typedCall = _context.sent;
              message = _yield$cmd$typedCall.message;
              // convert signature to base64
              signatureBuffer = Buffer.from(message.signature, 'hex');
              message.signature = signatureBuffer.toString('base64');
              return _context.abrupt("return", message);

            case 8:
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

  return SignMessage;
}(_AbstractMethod2["default"]);

exports["default"] = SignMessage;