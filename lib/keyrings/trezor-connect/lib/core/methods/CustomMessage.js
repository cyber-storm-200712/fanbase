"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _constants = require("../../constants");

var _builder = require("../../message/builder");

var CustomMessage = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(CustomMessage, _AbstractMethod);

  function CustomMessage() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = CustomMessage.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['custom-message', 'read', 'write'];
    this.info = 'Custom message';
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'message',
      type: 'string',
      required: true
    }, {
      name: 'params',
      type: 'object',
      required: true
    }]);

    if (payload.messages) {
      try {
        JSON.parse(JSON.stringify(payload.messages));
      } catch (error) {
        throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Parameter "messages" has invalid type. JSON expected.');
      }
    }

    this.params = {
      customMessages: payload.messages,
      message: payload.message,
      params: payload.params
    };
  };

  _proto.getCustomMessages = function getCustomMessages() {
    return this.params.customMessages;
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var response, uiPromise, uiResp, payload;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(this.device.features.vendor === 'trezor.io' || this.device.features.vendor === 'bitcointrezor.com')) {
                _context.next = 2;
                break;
              }

              throw _constants.ERRORS.TypedError('Runtime', 'Cannot use custom message on device with official firmware. Change device "vendor" field.');

            case 2:
              _context.next = 4;
              return this.device.getCommands() // $FlowIssue message could be anything, unknown type
              ._commonCall(this.params.message, this.params.params);

            case 4:
              response = _context.sent;
              // create ui promise
              uiPromise = this.createUiPromise(_constants.UI.CUSTOM_MESSAGE_RESPONSE, this.device); // send result to developer

              this.postMessage((0, _builder.UiMessage)(_constants.UI.CUSTOM_MESSAGE_REQUEST, response)); // wait for response from developer

              _context.next = 9;
              return uiPromise.promise;

            case 9:
              uiResp = _context.sent;
              payload = uiResp.payload; // validate incoming response

              (0, _paramsValidator.validateParams)(payload, [{
                name: 'message',
                type: 'string',
                required: true
              }]);

              if (!(payload.message.toLowerCase() === 'release')) {
                _context.next = 14;
                break;
              }

              return _context.abrupt("return", response);

            case 14:
              // validate incoming parameters
              (0, _paramsValidator.validateParams)(payload, [{
                name: 'params',
                type: 'object',
                required: true
              }]); // change local params and make another call to device

              this.params.message = payload.message;
              this.params.params = payload.params;
              return _context.abrupt("return", this.run());

            case 18:
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

  return CustomMessage;
}(_AbstractMethod2["default"]);

exports["default"] = CustomMessage;