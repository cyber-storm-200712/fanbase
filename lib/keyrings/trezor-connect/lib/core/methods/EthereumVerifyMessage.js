"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _formatUtils = require("../../utils/formatUtils");

var EthereumVerifyMessage = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(EthereumVerifyMessage, _AbstractMethod);

  function EthereumVerifyMessage() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = EthereumVerifyMessage.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read', 'write'];
    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, null, this.firmwareRange);
    this.info = 'Verify message';
    var payload = this.payload; // validate incoming parameters

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
      name: 'hex',
      type: 'boolean'
    }]);
    var messageHex = payload.hex ? (0, _formatUtils.messageToHex)(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
    this.params = {
      address: (0, _formatUtils.stripHexPrefix)(payload.address),
      signature: (0, _formatUtils.stripHexPrefix)(payload.signature),
      message: messageHex
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
              return cmd.typedCall('EthereumVerifyMessage', 'Success', this.params);

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

  return EthereumVerifyMessage;
}(_AbstractMethod2["default"]);

exports["default"] = EthereumVerifyMessage;