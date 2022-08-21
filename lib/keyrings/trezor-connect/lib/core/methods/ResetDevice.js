"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _builder = require("../../message/builder");

var _paramsValidator = require("./helpers/paramsValidator");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var ResetDevice = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(ResetDevice, _AbstractMethod);

  function ResetDevice() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = ResetDevice.prototype;

  _proto.init = function init() {
    this.allowDeviceMode = [UI.INITIALIZE, UI.SEEDLESS];
    this.useDeviceState = false;
    this.requiredPermissions = ['management'];
    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, null, this.firmwareRange);
    this.info = 'Setup device';
    var payload = this.payload; // validate bundle type

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'display_random',
      type: 'boolean'
    }, {
      name: 'strength',
      type: 'number'
    }, {
      name: 'passphrase_protection',
      type: 'boolean'
    }, {
      name: 'pin_protection',
      type: 'boolean'
    }, {
      name: 'language',
      type: 'string'
    }, {
      name: 'label',
      type: 'string'
    }, {
      name: 'u2f_counter',
      type: 'number'
    }, {
      name: 'skip_backup',
      type: 'boolean'
    }, {
      name: 'no_backup',
      type: 'boolean'
    }, {
      name: 'backup_type',
      type: 'number'
    }]);
    this.params = {
      display_random: payload.display_random,
      strength: payload.strength || 256,
      passphrase_protection: payload.passphrase_protection,
      pin_protection: payload.pin_protection,
      language: payload.language,
      label: payload.label,
      u2f_counter: payload.u2f_counter || Math.floor(Date.now() / 1000),
      skip_backup: payload.skip_backup,
      no_backup: payload.no_backup,
      backup_type: payload.backup_type
    };
  };

  _proto.confirmation = /*#__PURE__*/function () {
    var _confirmation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var uiPromise, uiResp;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!this.confirmed) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", true);

            case 2:
              _context.next = 4;
              return this.getPopupPromise().promise;

            case 4:
              // initialize user response promise
              uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device); // request confirmation view

              this.postMessage((0, _builder.UiMessage)(UI.REQUEST_CONFIRMATION, {
                view: 'device-management',
                label: 'Do you really you want to create a new wallet?'
              })); // wait for user action

              _context.next = 8;
              return uiPromise.promise;

            case 8:
              uiResp = _context.sent;
              this.confirmed = uiResp.payload;
              return _context.abrupt("return", this.confirmed);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function confirmation() {
      return _confirmation.apply(this, arguments);
    }

    return confirmation;
  }();

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var cmd, response;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              cmd = this.device.getCommands();
              _context2.next = 3;
              return cmd.typedCall('ResetDevice', 'Success', this.params);

            case 3:
              response = _context2.sent;
              return _context2.abrupt("return", response.message);

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  return ResetDevice;
}(_AbstractMethod2["default"]);

exports["default"] = ResetDevice;