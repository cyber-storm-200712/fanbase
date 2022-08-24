"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _rollout = require("@trezor/rollout");

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _constants = require("../../constants");

var _uploadFirmware = require("./helpers/uploadFirmware");

var _builder = require("../../message/builder");

var _paramsValidator = require("./helpers/paramsValidator");

var _FirmwareInfo = require("../../data/FirmwareInfo");

var FirmwareUpdate = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(FirmwareUpdate, _AbstractMethod);

  function FirmwareUpdate() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = FirmwareUpdate.prototype;

  _proto.init = function init() {
    this.useEmptyPassphrase = true;
    this.requiredPermissions = ['management'];
    this.allowDeviceMode = [_constants.UI.BOOTLOADER, _constants.UI.INITIALIZE];
    this.requireDeviceMode = [_constants.UI.BOOTLOADER];
    this.useDeviceState = false;
    this.skipFirmwareCheck = true;
    var payload = this.payload;
    (0, _paramsValidator.validateParams)(payload, [{
      name: 'version',
      type: 'array'
    }, {
      name: 'btcOnly',
      type: 'boolean'
    }, {
      name: 'baseUrl',
      type: 'string'
    }, {
      name: 'binary',
      type: 'array-buffer'
    }, {
      name: 'intermediary',
      type: 'boolean'
    }]);
    this.params = {
      // either receive version and btcOnly
      version: payload.version,
      btcOnly: payload.btcOnly,
      baseUrl: payload.baseUrl || 'https://data.trezor.io',
      // or binary
      binary: payload.binary,
      intermediary: payload.intermediary
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
              uiPromise = this.createUiPromise(_constants.UI.RECEIVE_CONFIRMATION, this.device); // request confirmation view

              this.postMessage((0, _builder.UiMessage)(_constants.UI.REQUEST_CONFIRMATION, {
                view: 'device-management',
                customConfirmButton: {
                  className: 'wipe',
                  label: 'Proceed'
                },
                label: 'Do you want to update firmware? Never do this without your recovery card.'
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
      var device, params, binary, firmware;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              device = this.device, params = this.params;
              _context2.prev = 1;

              if (!params.binary) {
                _context2.next = 6;
                break;
              }

              binary = (0, _rollout.modifyFirmware)({
                fw: params.binary,
                features: device.features
              });
              _context2.next = 10;
              break;

            case 6:
              _context2.next = 8;
              return (0, _rollout.getBinary)({
                // features and releases are used for sanity checking inside @trezor/rollout
                features: device.features,
                releases: (0, _FirmwareInfo.getReleases)(device.features.major_version),
                // version argument is used to find and fetch concrete release from releases list
                version: params.version,
                btcOnly: params.btcOnly,
                baseUrl: params.baseUrl,
                intermediary: params.intermediary
              });

            case 8:
              firmware = _context2.sent;
              binary = firmware.binary;

            case 10:
              _context2.next = 15;
              break;

            case 12:
              _context2.prev = 12;
              _context2.t0 = _context2["catch"](1);
              throw _constants.ERRORS.TypedError('Method_FirmwareUpdate_DownloadFailed', 'Failed to download firmware binary');

            case 15:
              return _context2.abrupt("return", (0, _uploadFirmware.uploadFirmware)(this.device.getCommands().typedCall.bind(this.device.getCommands()), this.postMessage, device, {
                payload: binary
              }));

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[1, 12]]);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  return FirmwareUpdate;
}(_AbstractMethod2["default"]);

exports["default"] = FirmwareUpdate;