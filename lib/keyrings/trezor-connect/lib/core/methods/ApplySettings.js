"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _paramsValidator = require("./helpers/paramsValidator");

var _builder = require("../../message/builder");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var ApplySettings = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(ApplySettings, _AbstractMethod);

  function ApplySettings() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = ApplySettings.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['management'];
    this.useDeviceState = false;
    var payload = this.payload;
    (0, _paramsValidator.validateParams)(payload, [{
      name: 'language',
      type: 'string'
    }, {
      name: 'label',
      type: 'string'
    }, {
      name: 'use_passphrase',
      type: 'boolean'
    }, {
      name: 'homescreen',
      type: 'string'
    }, {
      name: 'passphrase_source',
      type: 'number'
    }, {
      name: 'passphrase_always_on_device',
      type: 'boolean'
    }, {
      name: 'auto_lock_delay_ms',
      type: 'number'
    }, {
      name: 'display_rotation',
      type: 'number'
    }, {
      name: 'safety_checks',
      type: 'string'
    }, {
      name: 'experimental_features',
      type: 'boolean'
    }]);
    this.params = {
      language: payload.language,
      label: payload.label,
      use_passphrase: payload.use_passphrase,
      homescreen: payload.homescreen,
      passphrase_always_on_device: payload.passphrase_always_on_device,
      auto_lock_delay_ms: payload.auto_lock_delay_ms,
      display_rotation: payload.display_rotation,
      safety_checks: payload.safety_checks,
      experimental_features: payload.experimental_features,
      // $FlowIssue passphrase_source is a legacy param
      _passphrase_source: payload.passphrase_source
    };
  };

  _proto.confirmation = /*#__PURE__*/function () {
    var _confirmation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var uiPromise, uiResp;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.getPopupPromise().promise;

            case 2:
              // initialize user response promise
              uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device); // request confirmation view

              this.postMessage((0, _builder.UiMessage)(UI.REQUEST_CONFIRMATION, {
                view: 'device-management',
                customConfirmButton: {
                  className: 'confirm',
                  label: 'Proceed'
                },
                label: 'Do you really want to change device settings?'
              })); // wait for user action

              _context.next = 6;
              return uiPromise.promise;

            case 6:
              uiResp = _context.sent;
              return _context.abrupt("return", uiResp.payload);

            case 8:
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
              return cmd.typedCall('ApplySettings', 'Success', this.params);

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

  return ApplySettings;
}(_AbstractMethod2["default"]);

exports["default"] = ApplySettings;