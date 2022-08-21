"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _events = _interopRequireDefault(require("events"));

var _DeviceCommands = _interopRequireDefault(require("./DeviceCommands"));

var _constants = require("../constants");

var _deferred = require("../utils/deferred");

var _DataManager = _interopRequireDefault(require("../data/DataManager"));

var _CoinInfo = require("../data/CoinInfo");

var _FirmwareInfo = require("../data/FirmwareInfo");

var _deviceFeaturesUtils = require("../utils/deviceFeaturesUtils");

var _versionUtils = require("../utils/versionUtils");

var _debug = require("../utils/debug");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// custom log
var _log = (0, _debug.initLog)('Device');

var parseRunOptions = function parseRunOptions(options) {
  if (!options) options = {};
  return options;
};
/**
 *
 *
 * @export
 * @class Device
 * @extends {EventEmitter}
 */


var Device = /*#__PURE__*/function (_EventEmitter) {
  (0, _inheritsLoose2["default"])(Device, _EventEmitter);

  // unreadable error like: HID device, LIBUSB_ERROR
  function Device(transport, descriptor) {
    var _this;

    _this = _EventEmitter.call(this) || this;
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "featuresNeedsReload", false);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "deferredActions", {});
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "loaded", false);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "inconsistent", false);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "keepSession", false);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "instance", 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "internalState", []);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "externalState", []);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "unavailableCapabilities", {});
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "networkTypeState", []);
    _log.enabled = _DataManager["default"].getSettings('debug'); // === immutable properties

    _this.transport = transport;
    _this.originalDescriptor = descriptor;
    _this.hasDebugLink = descriptor.debug; // this will be released after first run

    _this.firstRunPromise = (0, _deferred.create)();
    return _this;
  }

  Device.fromDescriptor = function fromDescriptor(transport, originalDescriptor) {
    var descriptor = _objectSpread(_objectSpread({}, originalDescriptor), {}, {
      session: null
    });

    try {
      var device = new Device(transport, descriptor);
      return device;
    } catch (error) {
      _log.error('Device.fromDescriptor', error);

      throw error;
    }
  };

  Device.createUnacquired = function createUnacquired(transport, descriptor, unreadableError) {
    var device = new Device(transport, descriptor);
    device.unreadableError = unreadableError;
    return device;
  };

  var _proto = Device.prototype;

  _proto.acquire = /*#__PURE__*/function () {
    var _acquire = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var sessionID;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // will be resolved after trezor-link acquire event
              this.deferredActions[_constants.DEVICE.ACQUIRE] = (0, _deferred.create)();
              this.deferredActions[_constants.DEVICE.ACQUIRED] = (0, _deferred.create)();
              _context.prev = 2;
              _context.next = 5;
              return this.transport.acquire({
                path: this.originalDescriptor.path,
                previous: this.originalDescriptor.session
              }, false);

            case 5:
              sessionID = _context.sent;

              _log.warn('Expected session id:', sessionID);

              this.activitySessionID = sessionID;

              this.deferredActions[_constants.DEVICE.ACQUIRED].resolve();

              delete this.deferredActions[_constants.DEVICE.ACQUIRED];

              if (this.commands) {
                this.commands.dispose();
              }

              this.commands = new _DeviceCommands["default"](this, this.transport, sessionID); // future defer for trezor-link release event

              this.deferredActions[_constants.DEVICE.RELEASE] = (0, _deferred.create)();
              _context.next = 25;
              break;

            case 15:
              _context.prev = 15;
              _context.t0 = _context["catch"](2);

              this.deferredActions[_constants.DEVICE.ACQUIRED].resolve();

              delete this.deferredActions[_constants.DEVICE.ACQUIRED];

              if (!this.runPromise) {
                _context.next = 23;
                break;
              }

              this.runPromise.reject(_context.t0);
              _context.next = 24;
              break;

            case 23:
              throw _context.t0;

            case 24:
              this.runPromise = null;

            case 25:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[2, 15]]);
    }));

    function acquire() {
      return _acquire.apply(this, arguments);
    }

    return acquire;
  }();

  _proto.release = /*#__PURE__*/function () {
    var _release = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(this.isUsedHere() && !this.keepSession && this.activitySessionID)) {
                _context2.next = 22;
                break;
              }

              if (!this.commands) {
                _context2.next = 12;
                break;
              }

              this.commands.dispose();

              if (!this.commands.callPromise) {
                _context2.next = 12;
                break;
              }

              _context2.prev = 4;
              _context2.next = 7;
              return this.commands.callPromise;

            case 7:
              _context2.next = 12;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](4);
              this.commands.callPromise = undefined;

            case 12:
              _context2.prev = 12;
              _context2.next = 15;
              return this.transport.release(this.activitySessionID, false, false);

            case 15:
              if (!this.deferredActions[_constants.DEVICE.RELEASE]) {
                _context2.next = 18;
                break;
              }

              _context2.next = 18;
              return this.deferredActions[_constants.DEVICE.RELEASE].promise;

            case 18:
              _context2.next = 22;
              break;

            case 20:
              _context2.prev = 20;
              _context2.t1 = _context2["catch"](12);

            case 22:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[4, 9], [12, 20]]);
    }));

    function release() {
      return _release.apply(this, arguments);
    }

    return release;
  }();

  _proto.cleanup = /*#__PURE__*/function () {
    var _cleanup = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              this.removeAllListeners(); // make sure that Device_CallInProgress will not be thrown

              this.runPromise = null;
              _context3.next = 4;
              return this.release();

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function cleanup() {
      return _cleanup.apply(this, arguments);
    }

    return cleanup;
  }();

  _proto.run = function run(fn, options) {
    if (this.runPromise) {
      _log.debug('Previous call is still running');

      throw _constants.ERRORS.TypedError('Device_CallInProgress');
    }

    options = parseRunOptions(options);
    this.runPromise = (0, _deferred.create)(this._runInner.bind(this, fn, options));
    return this.runPromise.promise;
  };

  _proto.override = /*#__PURE__*/function () {
    var _override = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(error) {
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!this.deferredActions[_constants.DEVICE.ACQUIRE]) {
                _context4.next = 3;
                break;
              }

              _context4.next = 3;
              return this.deferredActions[_constants.DEVICE.ACQUIRE].promise;

            case 3:
              if (this.runPromise) {
                this.runPromise.reject(error);
                this.runPromise = null;
              }

              if (!(!this.keepSession && this.deferredActions[_constants.DEVICE.RELEASE])) {
                _context4.next = 7;
                break;
              }

              _context4.next = 7;
              return this.deferredActions[_constants.DEVICE.RELEASE].promise;

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function override(_x) {
      return _override.apply(this, arguments);
    }

    return override;
  }();

  _proto.interruptionFromUser = function interruptionFromUser(error) {
    _log.debug('+++++interruptionFromUser');

    if (this.commands) {
      this.commands.cancel();
      this.commands.dispose();
    }

    if (this.runPromise) {
      // reject inner defer
      this.runPromise.reject(error);
      this.runPromise = null;
    }
  };

  _proto.interruptionFromOutside = function interruptionFromOutside() {
    _log.debug('+++++interruptionFromOutside');

    if (this.commands) {
      this.commands.dispose();
    }

    if (this.runPromise) {
      this.runPromise.reject(_constants.ERRORS.TypedError('Device_UsedElsewhere'));
      this.runPromise = null;
    }
  };

  _proto._runInner = /*#__PURE__*/function () {
    var _runInner2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(fn, options) {
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!(!this.isUsedHere() || this.commands.disposed || !this.getExternalState())) {
                _context5.next = 23;
                break;
              }

              _context5.next = 3;
              return this.acquire();

            case 3:
              _context5.prev = 3;

              if (!fn) {
                _context5.next = 9;
                break;
              }

              _context5.next = 7;
              return this.initialize(!!options.useEmptyPassphrase, !!options.useCardanoDerivation);

            case 7:
              _context5.next = 11;
              break;

            case 9:
              _context5.next = 11;
              return Promise.race([this.getFeatures(), new Promise(function (resolve, reject) {
                return setTimeout(function () {
                  return reject(new Error('GetFeatures timeout'));
                }, 3000);
              })]);

            case 11:
              _context5.next = 23;
              break;

            case 13:
              _context5.prev = 13;
              _context5.t0 = _context5["catch"](3);

              if (!(!this.inconsistent && _context5.t0.message === 'GetFeatures timeout')) {
                _context5.next = 18;
                break;
              }

              // handling corner-case T1 + bootloader < 1.4.0 (above)
              // if GetFeatures fails try again
              // this time add empty "fn" param to force Initialize message
              this.inconsistent = true;
              return _context5.abrupt("return", this._runInner(function () {
                return Promise.resolve({});
              }, options));

            case 18:
              this.inconsistent = true;
              _context5.next = 21;
              return this.deferredActions[_constants.DEVICE.ACQUIRE].promise;

            case 21:
              this.runPromise = null;
              return _context5.abrupt("return", Promise.reject(_constants.ERRORS.TypedError('Device_InitializeFailed', "Initialize failed: " + _context5.t0.message + ", code: " + _context5.t0.code)));

            case 23:
              // if keepSession is set do not release device
              // until method with keepSession: false will be called
              if (options.keepSession) {
                this.keepSession = true;
              } // wait for event from trezor-link


              _context5.next = 26;
              return this.deferredActions[_constants.DEVICE.ACQUIRE].promise;

            case 26:
              if (!fn) {
                _context5.next = 29;
                break;
              }

              _context5.next = 29;
              return fn();

            case 29:
              if (!(this.loaded && this.features && !options.skipFinalReload)) {
                _context5.next = 32;
                break;
              }

              _context5.next = 32;
              return this.getFeatures();

            case 32:
              if (!(!this.keepSession && typeof options.keepSession !== 'boolean' || options.keepSession === false)) {
                _context5.next = 36;
                break;
              }

              this.keepSession = false;
              _context5.next = 36;
              return this.release();

            case 36:
              if (this.runPromise) {
                this.runPromise.resolve();
              }

              this.runPromise = null;

              if (!this.loaded) {
                this.loaded = true;
                this.firstRunPromise.resolve(true);
              }

            case 39:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this, [[3, 13]]);
    }));

    function _runInner(_x2, _x3) {
      return _runInner2.apply(this, arguments);
    }

    return _runInner;
  }();

  _proto.getCommands = function getCommands() {
    return this.commands;
  };

  _proto.setInstance = function setInstance(instance) {
    if (this.instance !== instance) {
      // if requested instance is different than current
      // and device wasn't released in previous call (example: interrupted discovery which set "keepSession" to true but never released)
      // clear "keepSession" and reset "activitySessionID" to ensure that "initialize" will be called
      if (this.keepSession) {
        this.activitySessionID = null;
        this.keepSession = false;
      } // T1: forget passphrase cached in internal state


      if (this.isT1() && this.useLegacyPassphrase()) {
        this.setInternalState(undefined);
      }
    }

    this.instance = instance;
  };

  _proto.getInstance = function getInstance() {
    return this.instance;
  };

  _proto.setInternalState = function setInternalState(state) {
    if (typeof state !== 'string') {
      delete this.internalState[this.instance];
    } else {
      this.internalState[this.instance] = state;
    }
  };

  _proto.getInternalState = function getInternalState() {
    return this.internalState[this.instance];
  };

  _proto.setExternalState = function setExternalState(state) {
    if (typeof state !== 'string') {
      delete this.internalState[this.instance];
      delete this.externalState[this.instance];
    } else {
      this.externalState[this.instance] = state;
    }
  };

  _proto.getExternalState = function getExternalState() {
    return this.externalState[this.instance];
  };

  _proto.validateState = /*#__PURE__*/function () {
    var _validateState = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(networkType) {
      var altMode, expectedState, state, uniqueState;
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (this.features) {
                _context6.next = 2;
                break;
              }

              return _context6.abrupt("return");

            case 2:
              altMode = this._altModeChange(networkType);
              expectedState = altMode ? undefined : this.getExternalState();
              _context6.next = 6;
              return this.commands.getDeviceState(networkType);

            case 6:
              state = _context6.sent;
              uniqueState = state + "@" + (this.features.device_id || 'device_id') + ":" + this.instance;

              if (!this.useLegacyPassphrase() && this.features.session_id) {
                this.setInternalState(this.features.session_id);
              }

              if (!(expectedState && expectedState !== uniqueState)) {
                _context6.next = 11;
                break;
              }

              return _context6.abrupt("return", uniqueState);

            case 11:
              if (!expectedState) {
                this.setExternalState(uniqueState);
              }

            case 12:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function validateState(_x4) {
      return _validateState.apply(this, arguments);
    }

    return validateState;
  }();

  _proto.useLegacyPassphrase = function useLegacyPassphrase() {
    return !this.atLeast(['1.9.0', '2.3.0']);
  };

  _proto.initialize = /*#__PURE__*/function () {
    var _initialize = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(useEmptyPassphrase, useCardanoDerivation) {
      var payload, legacy, internalState, _yield$this$commands$, message;

      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (this.features) {
                legacy = this.useLegacyPassphrase();
                internalState = this.getInternalState();
                payload = {}; // If the user has BIP-39 seed, and Initialize(derive_cardano=True) is not sent,
                // all Cardano calls will fail because the root secret will not be available.

                payload.derive_cardano = useCardanoDerivation;

                if (!legacy && internalState) {
                  payload.session_id = internalState;
                }

                if (legacy && !this.isT1()) {
                  payload.state = internalState;

                  if (useEmptyPassphrase) {
                    payload._skip_passphrase = useEmptyPassphrase;
                    payload.state = null;
                  }
                }
              }

              _context7.next = 3;
              return this.commands.typedCall('Initialize', 'Features', payload);

            case 3:
              _yield$this$commands$ = _context7.sent;
              message = _yield$this$commands$.message;

              this._updateFeatures(message);

            case 6:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function initialize(_x5, _x6) {
      return _initialize.apply(this, arguments);
    }

    return initialize;
  }();

  _proto.getFeatures = /*#__PURE__*/function () {
    var _getFeatures = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
      var _yield$this$commands$2, message;

      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return this.commands.typedCall('GetFeatures', 'Features', {});

            case 2:
              _yield$this$commands$2 = _context8.sent;
              message = _yield$this$commands$2.message;

              this._updateFeatures(message);

            case 5:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function getFeatures() {
      return _getFeatures.apply(this, arguments);
    }

    return getFeatures;
  }();

  _proto._updateFeatures = function _updateFeatures(feat) {
    var capabilities = (0, _deviceFeaturesUtils.parseCapabilities)(feat);
    feat.capabilities = capabilities;
    var version = [feat.major_version, feat.minor_version, feat.patch_version]; // capabilities could change in case where features was fetched with older version of messages.json which doesn't know this field

    var capabilitiesDidChange = this.features && this.features.capabilities && this.features.capabilities.join('') !== capabilities.join(''); // check if FW version or capabilities did change

    if ((0, _versionUtils.versionCompare)(version, this.getVersion()) !== 0 || capabilitiesDidChange) {
      this.unavailableCapabilities = (0, _deviceFeaturesUtils.getUnavailableCapabilities)(feat, (0, _CoinInfo.getAllNetworks)(), _DataManager["default"].getConfig().supportedFirmware);
      this.firmwareStatus = (0, _FirmwareInfo.getFirmwareStatus)(feat);
      this.firmwareRelease = (0, _FirmwareInfo.getRelease)(feat);
    } // GetFeatures doesn't return 'session_id'


    if (this.features && this.features.session_id && !feat.session_id) {
      feat.session_id = this.features.session_id;
    }

    feat.unlocked = feat.unlocked || true; // fix inconsistency of revision attribute between T1 and T2

    var revision = (0, _deviceFeaturesUtils.parseRevision)(feat);
    feat.revision = revision;
    this.features = feat;
    this.featuresNeedsReload = false;
  };

  _proto.isUnacquired = function isUnacquired() {
    return this.features === undefined;
  };

  _proto.updateDescriptor = /*#__PURE__*/function () {
    var _updateDescriptor = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(upcomingDescriptor) {
      var originalSession, upcomingSession, methodStillRunning;
      return _regenerator["default"].wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              originalSession = this.originalDescriptor.session;
              upcomingSession = upcomingDescriptor.session;

              _log.debug('updateDescriptor', 'currentSession', originalSession, 'upcoming', upcomingSession, 'lastUsedID', this.activitySessionID);

              if (!(!originalSession && !upcomingSession && !this.activitySessionID)) {
                _context9.next = 5;
                break;
              }

              return _context9.abrupt("return");

            case 5:
              if (!this.deferredActions[_constants.DEVICE.ACQUIRED]) {
                _context9.next = 8;
                break;
              }

              _context9.next = 8;
              return this.deferredActions[_constants.DEVICE.ACQUIRED].promise;

            case 8:
              if (!upcomingSession) {
                // corner-case: if device was unacquired but some call to this device was made
                // this will automatically change unacquired device to acquired (without deviceList)
                // emit ACQUIRED event to deviceList which will propagate DEVICE.CONNECT event
                if (this.listeners(_constants.DEVICE.ACQUIRED).length > 0) {
                  this.emit(_constants.DEVICE.ACQUIRED);
                }
              }

              methodStillRunning = this.commands && !this.commands.disposed;

              if (!upcomingSession && !methodStillRunning) {
                // released
                if (originalSession === this.activitySessionID) {
                  // by myself
                  _log.debug('RELEASED BY MYSELF');

                  if (this.deferredActions[_constants.DEVICE.RELEASE]) {
                    this.deferredActions[_constants.DEVICE.RELEASE].resolve();

                    delete this.deferredActions[_constants.DEVICE.RELEASE];
                  }

                  this.activitySessionID = null;
                } else {
                  // by other application
                  _log.debug('RELEASED BY OTHER APP');

                  this.featuresNeedsReload = true;
                }

                this.keepSession = false;
              } else if (upcomingSession === this.activitySessionID) {
                // acquired
                // TODO: Case where listen event will dispatch before this.transport.acquire (this.acquire) return ID
                // by myself
                _log.debug('ACQUIRED BY MYSELF');

                if (this.deferredActions[_constants.DEVICE.ACQUIRE]) {
                  this.deferredActions[_constants.DEVICE.ACQUIRE].resolve(); // delete this.deferred[ DEVICE.ACQUIRE ];

                }
              } else {
                // by other application
                _log.debug('ACQUIRED BY OTHER');

                this.interruptionFromOutside();
              }

              this.originalDescriptor = upcomingDescriptor;

            case 12:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));

    function updateDescriptor(_x7) {
      return _updateDescriptor.apply(this, arguments);
    }

    return updateDescriptor;
  }();

  _proto.disconnect = function disconnect() {
    // TODO: cleanup everything
    _log.debug('DISCONNECT CLEANUP!'); // don't try to release


    if (this.deferredActions[_constants.DEVICE.RELEASE]) {
      this.deferredActions[_constants.DEVICE.RELEASE].resolve();

      delete this.deferredActions[_constants.DEVICE.RELEASE];
    }

    this.interruptionFromUser(_constants.ERRORS.TypedError('Device_Disconnected'));
    this.runPromise = null;
  };

  _proto.isBootloader = function isBootloader() {
    return this.features && !!this.features.bootloader_mode;
  };

  _proto.isInitialized = function isInitialized() {
    return this.features && !!this.features.initialized;
  };

  _proto.isSeedless = function isSeedless() {
    return this.features && !!this.features.no_backup;
  };

  _proto.isInconsistent = function isInconsistent() {
    return this.inconsistent;
  };

  _proto.getVersion = function getVersion() {
    if (!this.features) return [];
    return [this.features.major_version, this.features.minor_version, this.features.patch_version];
  };

  _proto.atLeast = function atLeast(versions) {
    if (!this.features) return false;
    var modelVersion = typeof versions === 'string' ? versions : versions[this.features.major_version - 1];
    return (0, _versionUtils.versionCompare)(this.getVersion(), modelVersion) >= 0;
  };

  _proto.isUsed = function isUsed() {
    return typeof this.originalDescriptor.session === 'string';
  };

  _proto.isUsedHere = function isUsedHere() {
    return this.isUsed() && this.originalDescriptor.session === this.activitySessionID;
  };

  _proto.isUsedElsewhere = function isUsedElsewhere() {
    return this.isUsed() && !this.isUsedHere();
  };

  _proto.isRunning = function isRunning() {
    return !!this.runPromise;
  };

  _proto.isLoaded = function isLoaded() {
    return this.loaded;
  };

  _proto.waitForFirstRun = function waitForFirstRun() {
    return this.firstRunPromise.promise;
  };

  _proto.getDevicePath = function getDevicePath() {
    return this.originalDescriptor.path;
  };

  _proto.needAuthentication = function needAuthentication() {
    if (this.isUnacquired() || this.isUsedElsewhere() || this.featuresNeedsReload) return true;
    if (this.features.bootloader_mode || !this.features.initialized) return true;
    var pin = this.features.pin_protection ? !!this.features.unlocked : true; // $FlowIssue protobuf, passphrase_cached available only in older messages

    var pass = this.features.passphrase_protection ? this.features.passphrase_cached : true;
    return pin && pass;
  };

  _proto.isT1 = function isT1() {
    return this.features ? this.features.major_version === 1 : false;
  };

  _proto.hasUnexpectedMode = function hasUnexpectedMode(allow, require) {
    // both allow and require cases might generate single unexpected mode
    if (this.features) {
      // allow cases
      if (this.isBootloader() && !allow.includes(_constants.UI.BOOTLOADER)) {
        return _constants.UI.BOOTLOADER;
      }

      if (!this.isInitialized() && !allow.includes(_constants.UI.INITIALIZE)) {
        return _constants.UI.INITIALIZE;
      }

      if (this.isSeedless() && !allow.includes(_constants.UI.SEEDLESS)) {
        return _constants.UI.SEEDLESS;
      } // require cases


      if (!this.isBootloader() && require.includes(_constants.UI.BOOTLOADER)) {
        return _constants.UI.NOT_IN_BOOTLOADER;
      }
    }

    return null;
  };

  _proto.dispose = function dispose() {
    this.removeAllListeners();

    if (this.isUsedHere() && this.activitySessionID) {
      try {
        if (this.commands) {
          this.commands.cancel();
        }

        this.transport.release(this.activitySessionID, true, false);
      } catch (err) {// empty
      }
    }
  };

  _proto.getMode = function getMode() {
    if (this.features.bootloader_mode) return 'bootloader';
    if (!this.features.initialized) return 'initialize';
    if (this.features.no_backup) return 'seedless';
    return 'normal';
  } // simplified object to pass via postMessage
  ;

  _proto.toMessageObject = function toMessageObject() {
    if (this.unreadableError) {
      return {
        type: 'unreadable',
        path: this.originalDescriptor.path,
        error: this.unreadableError,
        // provide error details
        label: 'Unreadable device'
      };
    }

    if (this.isUnacquired()) {
      return {
        type: 'unacquired',
        path: this.originalDescriptor.path,
        label: 'Unacquired device'
      };
    }

    var defaultLabel = 'My Trezor';
    var label = this.features.label === '' || !this.features.label ? defaultLabel : this.features.label;
    var status = this.isUsedElsewhere() ? 'occupied' : 'available';
    if (this.featuresNeedsReload) status = 'used';
    return {
      type: 'acquired',
      id: this.features.device_id || null,
      path: this.originalDescriptor.path,
      label: label,
      state: this.getExternalState(),
      status: status,
      mode: this.getMode(),
      firmware: this.firmwareStatus,
      firmwareRelease: this.firmwareRelease,
      features: this.features,
      unavailableCapabilities: this.unavailableCapabilities
    };
  };

  _proto._getNetworkTypeState = function _getNetworkTypeState() {
    return this.networkTypeState[this.instance];
  };

  _proto._setNetworkTypeState = function _setNetworkTypeState(networkType) {
    if (typeof networkType !== 'string') {
      delete this.networkTypeState[this.instance];
    } else {
      this.networkTypeState[this.instance] = networkType;
    }
  };

  _proto._altModeChange = function _altModeChange(networkType) {
    var prevAltMode = this._isAltModeNetworkType(this._getNetworkTypeState());

    var nextAltMode = this._isAltModeNetworkType(networkType); // Update network type


    this._setNetworkTypeState(networkType);

    return prevAltMode !== nextAltMode;
  } // Is it a network type that requires the device to operate in an alternative state (ie: Cardano)
  ;

  _proto._isAltModeNetworkType = function _isAltModeNetworkType(networkType) {
    return [_constants.NETWORK.TYPES.cardano].includes(networkType);
  } //
  ;

  _proto.legacyForceRelease =
  /*#__PURE__*/
  function () {
    var _legacyForceRelease = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10() {
      return _regenerator["default"].wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              if (!this.isUsedHere()) {
                _context10.next = 7;
                break;
              }

              _context10.next = 3;
              return this.acquire();

            case 3:
              _context10.next = 5;
              return this.getFeatures();

            case 5:
              _context10.next = 7;
              return this.release();

            case 7:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));

    function legacyForceRelease() {
      return _legacyForceRelease.apply(this, arguments);
    }

    return legacyForceRelease;
  }();

  return Device;
}(_events["default"]);

var _default = Device;
exports["default"] = _default;