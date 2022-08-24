"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getDeviceList = exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _events = _interopRequireDefault(require("events"));

var _transport = _interopRequireDefault(require("@trezor/transport"));

var _crossFetch = _interopRequireDefault(require("cross-fetch"));

var _constants = require("../constants");

var _DescriptorStream = _interopRequireDefault(require("./DescriptorStream"));

var _Device = _interopRequireDefault(require("./Device"));

var _DataManager = _interopRequireDefault(require("../data/DataManager"));

var _TransportInfo = require("../data/TransportInfo");

var _debug = require("../utils/debug");

var _promiseUtils = require("../utils/promiseUtils");

var _workers = require("../env/node/workers");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var BridgeV2 = _transport["default"].BridgeV2,
    Fallback = _transport["default"].Fallback; // custom log

var _log = (0, _debug.initLog)('DeviceList'); // TODO: plugins are not typed in 'trezor-link'


var DeviceList = /*#__PURE__*/function (_EventEmitter) {
  (0, _inheritsLoose2["default"])(DeviceList, _EventEmitter);

  function DeviceList() {
    var _this;

    _this = _EventEmitter.call(this) || this;
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "devices", {});
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "creatingDevicesDescriptors", {});
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "hasCustomMessages", false);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "transportStartPending", 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "penalizedDevices", {});
    var _DataManager$settings = _DataManager["default"].settings,
        debug = _DataManager$settings.debug,
        env = _DataManager$settings.env,
        webusb = _DataManager$settings.webusb;
    _log.enabled = !!debug;
    var transports = [];

    if (env === 'react-native' && typeof _workers.ReactNativeUsbPlugin !== 'undefined') {
      transports.push((0, _workers.ReactNativeUsbPlugin)());
    } else {
      var bridgeLatestVersion = (0, _TransportInfo.getBridgeInfo)().version.join('.');
      var bridge = new BridgeV2(null, null);
      bridge.setBridgeLatestVersion(bridgeLatestVersion); // modify fetch being used by lower layer (@trezor/transport)

      if (typeof AbortController !== 'undefined') {
        // AbortController part of node since v15
        // with cross-fetch:
        // https://github.com/node-fetch/node-fetch#request-cancellation-with-abortsignal
        _this.fetchController = new AbortController();
        var signal = _this.fetchController.signal;

        var fetchWithSignal = function fetchWithSignal(args, options) {
          if (options === void 0) {
            options = {};
          }

          return (0, _crossFetch["default"])(args, _objectSpread(_objectSpread({}, options), {}, {
            signal: signal
          }));
        };

        BridgeV2.setFetch(fetchWithSignal, typeof window === 'undefined');
      } else if (typeof window === 'undefined') {
        // node <15
        BridgeV2.setFetch(_crossFetch["default"], true);
      } // otherwise @trezor/transport defaults to window.fetch


      transports.push(bridge);
    }

    if (webusb && typeof _workers.WebUsbPlugin !== 'undefined') {
      transports.push((0, _workers.WebUsbPlugin)());
    }

    _this.transport = new Fallback(transports);
    _this.defaultMessages = _DataManager["default"].getProtobufMessages();
    _this.currentMessages = _this.defaultMessages;
    return _this;
  }

  var _proto = DeviceList.prototype;

  _proto.init = /*#__PURE__*/function () {
    var _init = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var transport, activeName;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              transport = this.transport;
              _context.prev = 1;

              _log.debug('Initializing transports');

              _context.next = 5;
              return transport.init(_log.enabled);

            case 5:
              _log.debug('Configuring transports');

              _context.next = 8;
              return transport.configure(JSON.stringify(this.defaultMessages));

            case 8:
              _log.debug('Configuring transports done');

              activeName = transport.activeName;

              if (activeName === 'LowlevelTransportWithSharedConnections') {
                // $FlowIssue "activeTransport" is not typed in trezor-link
                this.transportPlugin = transport.activeTransport.plugin;
              }

              _context.next = 13;
              return this._initStream();

            case 13:
              // listen for self emitted events and resolve pending transport event if needed
              this.on(_constants.DEVICE.CONNECT, this.resolveTransportEvent.bind(this));
              this.on(_constants.DEVICE.CONNECT_UNACQUIRED, this.resolveTransportEvent.bind(this));
              _context.next = 20;
              break;

            case 17:
              _context.prev = 17;
              _context.t0 = _context["catch"](1);
              this.emit(_constants.TRANSPORT.ERROR, _context.t0);

            case 20:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[1, 17]]);
    }));

    function init() {
      return _init.apply(this, arguments);
    }

    return init;
  }();

  _proto.reconfigure = /*#__PURE__*/function () {
    var _reconfigure = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(messages, custom) {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (Array.isArray(messages)) {
                messages = _DataManager["default"].getProtobufMessages(messages);
              }

              if (!(this.currentMessages === messages || !messages)) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt("return");

            case 3:
              _context2.prev = 3;
              _context2.next = 6;
              return this.transport.configure(JSON.stringify(messages));

            case 6:
              this.currentMessages = messages;
              this.hasCustomMessages = typeof custom === 'boolean' ? custom : false;
              _context2.next = 13;
              break;

            case 10:
              _context2.prev = 10;
              _context2.t0 = _context2["catch"](3);
              throw _constants.ERRORS.TypedError('Transport_InvalidProtobuf', _context2.t0.message);

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[3, 10]]);
    }));

    function reconfigure(_x, _x2) {
      return _reconfigure.apply(this, arguments);
    }

    return reconfigure;
  }();

  _proto.restoreMessages = /*#__PURE__*/function () {
    var _restoreMessages = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (this.hasCustomMessages) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return");

            case 2:
              _context3.prev = 2;
              _context3.next = 5;
              return this.transport.configure(JSON.stringify(this.defaultMessages));

            case 5:
              this.hasCustomMessages = false;
              _context3.next = 11;
              break;

            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3["catch"](2);
              throw _constants.ERRORS.TypedError('Transport_InvalidProtobuf', _context3.t0.message);

            case 11:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this, [[2, 8]]);
    }));

    function restoreMessages() {
      return _restoreMessages.apply(this, arguments);
    }

    return restoreMessages;
  }();

  _proto.resolveTransportEvent = function resolveTransportEvent() {
    this.transportStartPending--;

    if (this.transportStartPending === 0) {
      this.stream.emit(_constants.TRANSPORT.START);
    }
  };

  _proto.waitForTransportFirstEvent = /*#__PURE__*/function () {
    var _waitForTransportFirstEvent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
      var _this2 = this;

      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return new Promise(function (resolve) {
                var handler = function handler() {
                  _this2.removeListener(_constants.TRANSPORT.START, handler);

                  _this2.removeListener(_constants.TRANSPORT.ERROR, handler);

                  resolve();
                };

                _this2.on(_constants.TRANSPORT.START, handler);

                _this2.on(_constants.TRANSPORT.ERROR, handler);
              });

            case 2:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    function waitForTransportFirstEvent() {
      return _waitForTransportFirstEvent.apply(this, arguments);
    }

    return waitForTransportFirstEvent;
  }()
  /**
   * Transport events handler
   * @param {Transport} transport
   * @memberof DeviceList
   */
  ;

  _proto._initStream = function _initStream() {
    var _this3 = this;

    var stream = new _DescriptorStream["default"](this.transport);
    stream.on(_constants.TRANSPORT.START_PENDING, function (pending) {
      _this3.transportStartPending = pending;
    });
    stream.on(_constants.TRANSPORT.START, function () {
      _this3.emit(_constants.TRANSPORT.START, _this3.getTransportInfo());
    });
    stream.on(_constants.TRANSPORT.UPDATE, function (diff) {
      // eslint-disable-next-line no-use-before-define
      new DiffHandler(_this3, diff).handle();
    });
    stream.on(_constants.TRANSPORT.ERROR, function (error) {
      _this3.emit(_constants.TRANSPORT.ERROR, error);

      stream.stop();
    });
    stream.listen();
    this.stream = stream;

    if (this.transportPlugin && this.transportPlugin.name === 'WebUsbPlugin') {
      var unreadableHidDeviceChange = this.transportPlugin.unreadableHidDeviceChange; // TODO: https://github.com/trezor/trezor-link/issues/40

      var UNREADABLE_PATH = 'unreadable'; // unreadable device doesn't return incremental path.

      unreadableHidDeviceChange.on('change', function () {
        if (_this3.transportPlugin && _this3.transportPlugin.unreadableHidDevice) {
          var device = _this3._createUnreadableDevice({
            path: UNREADABLE_PATH,
            session: null,
            debugSession: null,
            debug: false
          }, 'HID_DEVICE');

          _this3.devices[UNREADABLE_PATH] = device;

          _this3.emit(_constants.DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
        } else {
          var _device = _this3.devices[UNREADABLE_PATH];
          delete _this3.devices[UNREADABLE_PATH];

          _this3.emit(_constants.DEVICE.DISCONNECT, _device.toMessageObject());
        }
      });
    }

    this.emit(_constants.TRANSPORT.STREAM, stream);
  };

  _proto._createAndSaveDevice = /*#__PURE__*/function () {
    var _createAndSaveDevice2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(descriptor) {
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _log.debug('Creating Device', descriptor); // eslint-disable-next-line no-use-before-define


              _context5.next = 3;
              return new CreateDeviceHandler(descriptor, this).handle();

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function _createAndSaveDevice(_x3) {
      return _createAndSaveDevice2.apply(this, arguments);
    }

    return _createAndSaveDevice;
  }();

  _proto._createUnacquiredDevice = function _createUnacquiredDevice(descriptor) {
    var _this4 = this;

    _log.debug('Creating Unacquired Device', descriptor);

    var device = _Device["default"].createUnacquired(this.transport, descriptor);

    device.once(_constants.DEVICE.ACQUIRED, function () {
      // emit connect event once device becomes acquired
      _this4.emit(_constants.DEVICE.CONNECT, device.toMessageObject());
    });
    return device;
  };

  _proto._createUnreadableDevice = function _createUnreadableDevice(descriptor, unreadableError) {
    _log.debug('Creating Unreadable Device', descriptor, unreadableError);

    return _Device["default"].createUnacquired(this.transport, descriptor, unreadableError);
  };

  _proto.getDevice = function getDevice(path) {
    return this.devices[path];
  };

  _proto.getFirstDevicePath = function getFirstDevicePath() {
    return this.asArray()[0].path;
  };

  _proto.asArray = function asArray() {
    return this.allDevices().map(function (device) {
      return device.toMessageObject();
    });
  };

  _proto.allDevices = function allDevices() {
    var _this5 = this;

    return Object.keys(this.devices).map(function (key) {
      return _this5.devices[key];
    });
  };

  _proto.length = function length() {
    return this.asArray().length;
  };

  _proto.transportType = function transportType() {
    var transport = this.transport,
        transportPlugin = this.transportPlugin;
    var activeName = transport.activeName;

    if (activeName === 'BridgeTransport') {
      return 'bridge';
    }

    if (transportPlugin) {
      return transportPlugin.name;
    }

    return transport.name;
  };

  _proto.getTransportInfo = function getTransportInfo() {
    return {
      type: this.transportType(),
      version: this.transport.version,
      outdated: this.transport.isOutdated
    };
  };

  _proto.dispose = function dispose() {
    this.removeAllListeners();

    if (this.stream) {
      this.stream.stop();
    }

    if (this.transport) {
      this.transport.stop();
    }

    if (this.fetchController) {
      this.fetchController.abort();
      this.fetchController = null;
    }

    this.allDevices().forEach(function (device) {
      return device.dispose();
    });
  };

  _proto.disconnectDevices = function disconnectDevices() {
    var _this6 = this;

    this.allDevices().forEach(function (device) {
      // device.disconnect();
      _this6.emit(_constants.DEVICE.DISCONNECT, device.toMessageObject());
    });
  };

  _proto.enumerate = function enumerate() {
    var _this7 = this;

    this.stream.enumerate();
    if (!this.stream.current) return; // update current values

    this.stream.current.forEach(function (descriptor) {
      var path = descriptor.path.toString();
      var device = _this7.devices[path];

      if (device) {
        device.updateDescriptor(descriptor);
      }
    });
  };

  _proto.addAuthPenalty = function addAuthPenalty(device) {
    if (!device.isInitialized() || device.isBootloader() || !device.features.device_id) return;
    var deviceID = device.features.device_id;
    var penalty = this.penalizedDevices[deviceID] ? this.penalizedDevices[deviceID] + 500 : 2000;
    this.penalizedDevices[deviceID] = Math.min(penalty, 5000);
  };

  _proto.getAuthPenalty = function getAuthPenalty() {
    var penalizedDevices = this.penalizedDevices;
    return Object.keys(penalizedDevices).reduce(function (penalty, key) {
      return Math.max(penalty, penalizedDevices[key]);
    }, 0);
  };

  _proto.removeAuthPenalty = function removeAuthPenalty(device) {
    if (!device.isInitialized() || device.isBootloader() || !device.features.device_id) return;
    var deviceID = device.features.device_id;
    delete this.penalizedDevices[deviceID];
  };

  return DeviceList;
}(_events["default"]);
/**
 * DeviceList initialization
 * returns instance of DeviceList
 * @returns {Promise<DeviceList>}
 */


exports["default"] = DeviceList;

var getDeviceList = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
    var list;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            list = new DeviceList();
            _context6.next = 3;
            return list.init();

          case 3:
            return _context6.abrupt("return", list);

          case 4:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function getDeviceList() {
    return _ref.apply(this, arguments);
  };
}(); // Helper class for creating new device


exports.getDeviceList = getDeviceList;

var CreateDeviceHandler = /*#__PURE__*/function () {
  function CreateDeviceHandler(descriptor, list) {
    this.descriptor = descriptor;
    this.list = list;
    this.path = descriptor.path.toString();
  } // main logic


  var _proto2 = CreateDeviceHandler.prototype;

  _proto2.handle =
  /*#__PURE__*/
  function () {
    var _handle = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
      var device;
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              // creatingDevicesDescriptors is needed, so that if *during* creating of Device,
              // other application acquires the device and changes the descriptor,
              // the new unacquired device has correct descriptor
              this.list.creatingDevicesDescriptors[this.path] = this.descriptor;
              _context7.prev = 1;
              _context7.next = 4;
              return this._takeAndCreateDevice();

            case 4:
              _context7.next = 35;
              break;

            case 6:
              _context7.prev = 6;
              _context7.t0 = _context7["catch"](1);

              _log.debug('Cannot create device', _context7.t0);

              if (!(_context7.t0.code === 'Device_NotFound')) {
                _context7.next = 12;
                break;
              }

              _context7.next = 35;
              break;

            case 12:
              if (!(_context7.t0.message === _constants.ERRORS.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE || _context7.t0.toString() === _constants.ERRORS.WEBUSB_ERROR_MESSAGE)) {
                _context7.next = 17;
                break;
              }

              this.list.enumerate();

              this._handleUsedElsewhere();

              _context7.next = 35;
              break;

            case 17:
              if (!(_context7.t0.message.indexOf(_constants.ERRORS.LIBUSB_ERROR_MESSAGE) >= 0)) {
                _context7.next = 23;
                break;
              }

              // catch one of trezord LIBUSB_ERRORs
              device = this.list._createUnreadableDevice(this.list.creatingDevicesDescriptors[this.path], _context7.t0.message);
              this.list.devices[this.path] = device;
              this.list.emit(_constants.DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
              _context7.next = 35;
              break;

            case 23:
              if (!(_context7.t0.code === 'Device_InitializeFailed')) {
                _context7.next = 27;
                break;
              }

              // firmware bug - device is in "show address" state which cannot be cancelled
              this._handleUsedElsewhere();

              _context7.next = 35;
              break;

            case 27:
              if (!(_context7.t0.code === 'Device_UsedElsewhere')) {
                _context7.next = 31;
                break;
              }

              // most common error - someone else took the device at the same time
              this._handleUsedElsewhere();

              _context7.next = 35;
              break;

            case 31:
              _context7.next = 33;
              return (0, _promiseUtils.resolveAfter)(501, null);

            case 33:
              _context7.next = 35;
              return this.handle();

            case 35:
              delete this.list.creatingDevicesDescriptors[this.path];

            case 36:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this, [[1, 6]]);
    }));

    function handle() {
      return _handle.apply(this, arguments);
    }

    return handle;
  }();

  _proto2._takeAndCreateDevice = /*#__PURE__*/function () {
    var _takeAndCreateDevice2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
      var device;
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              device = _Device["default"].fromDescriptor(this.list.transport, this.descriptor);
              this.list.devices[this.path] = device;
              _context8.next = 4;
              return device.run();

            case 4:
              this.list.emit(_constants.DEVICE.CONNECT, device.toMessageObject());

            case 5:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function _takeAndCreateDevice() {
      return _takeAndCreateDevice2.apply(this, arguments);
    }

    return _takeAndCreateDevice;
  }();

  _proto2._handleUsedElsewhere = function _handleUsedElsewhere() {
    var device = this.list._createUnacquiredDevice(this.list.creatingDevicesDescriptors[this.path]);

    this.list.devices[this.path] = device;
    this.list.emit(_constants.DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
  };

  return CreateDeviceHandler;
}(); // Helper class for actual logic of handling differences


var DiffHandler = /*#__PURE__*/function () {
  function DiffHandler(list, diff) {
    this.list = list;
    this.diff = diff;
  }

  var _proto3 = DiffHandler.prototype;

  _proto3.handle = function handle() {
    _log.debug('Update DescriptorStream', this.diff); // note - this intentionally does not wait for connected devices
    // createDevice inside waits for the updateDescriptor event


    this._createConnectedDevices();

    this._createReleasedDevices();

    this._signalAcquiredDevices();

    this._updateDescriptors();

    this._emitEvents();

    this._disconnectDevices();
  };

  _proto3._updateDescriptors = function _updateDescriptors() {
    var _this8 = this;

    this.diff.descriptors.forEach(function (descriptor) {
      var path = descriptor.path.toString();
      var device = _this8.list.devices[path];

      if (device) {
        device.updateDescriptor(descriptor);
      }
    });
  };

  _proto3._emitEvents = function _emitEvents() {
    var _this9 = this;

    var events = [{
      d: this.diff.changedSessions,
      e: _constants.DEVICE.CHANGED
    }, {
      d: this.diff.acquired,
      e: _constants.DEVICE.ACQUIRED
    }, {
      d: this.diff.released,
      e: _constants.DEVICE.RELEASED
    }];
    events.forEach(function (_ref2) {
      var d = _ref2.d,
          e = _ref2.e;
      d.forEach(function (descriptor) {
        var path = descriptor.path.toString();
        var device = _this9.list.devices[path];

        _log.debug('Event', e, device);

        if (device) {
          _this9.list.emit(e, device.toMessageObject());
        }
      });
    });
  } // tries to read info about connected devices
  ;

  _proto3._createConnectedDevices = function _createConnectedDevices() {
    var _this10 = this;

    this.diff.connected.forEach( /*#__PURE__*/function () {
      var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(descriptor) {
        var path, priority, penalty, device;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                path = descriptor.path.toString();
                priority = _DataManager["default"].getSettings('priority');
                penalty = _this10.list.getAuthPenalty();

                _log.debug('Connected', priority, penalty, descriptor.session, _this10.list.devices);

                if (!(priority || penalty)) {
                  _context9.next = 7;
                  break;
                }

                _context9.next = 7;
                return (0, _promiseUtils.resolveAfter)(501 + penalty + 100 * priority, null);

              case 7:
                if (!(descriptor.session == null)) {
                  _context9.next = 12;
                  break;
                }

                _context9.next = 10;
                return _this10.list._createAndSaveDevice(descriptor);

              case 10:
                _context9.next = 17;
                break;

              case 12:
                _context9.next = 14;
                return _this10.list._createUnacquiredDevice(descriptor);

              case 14:
                device = _context9.sent;
                _this10.list.devices[path] = device;

                _this10.list.emit(_constants.DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());

              case 17:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));

      return function (_x4) {
        return _ref3.apply(this, arguments);
      };
    }());
  };

  _proto3._signalAcquiredDevices = function _signalAcquiredDevices() {
    var _this11 = this;

    this.diff.acquired.forEach(function (descriptor) {
      var path = descriptor.path.toString();

      if (_this11.list.creatingDevicesDescriptors[path]) {
        _this11.list.creatingDevicesDescriptors[path] = descriptor;
      }
    });
  } // tries acquire and read info about recently released devices
  ;

  _proto3._createReleasedDevices = function _createReleasedDevices() {
    var _this12 = this;

    this.diff.released.forEach( /*#__PURE__*/function () {
      var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(descriptor) {
        var path, device;
        return _regenerator["default"].wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                path = descriptor.path.toString();
                device = _this12.list.devices[path];

                if (!device) {
                  _context10.next = 9;
                  break;
                }

                if (!(device.isUnacquired() && !device.isInconsistent())) {
                  _context10.next = 9;
                  break;
                }

                _context10.next = 6;
                return (0, _promiseUtils.resolveAfter)(501, null);

              case 6:
                _log.debug('Create device from unacquired', device);

                _context10.next = 9;
                return _this12.list._createAndSaveDevice(descriptor);

              case 9:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10);
      }));

      return function (_x5) {
        return _ref4.apply(this, arguments);
      };
    }());
  };

  _proto3._disconnectDevices = function _disconnectDevices() {
    var _this13 = this;

    this.diff.disconnected.forEach(function (descriptor) {
      var path = descriptor.path.toString();
      var device = _this13.list.devices[path];

      if (device != null) {
        device.disconnect();
        delete _this13.list.devices[path];

        _this13.list.emit(_constants.DEVICE.DISCONNECT, device.toMessageObject());
      }
    });
  };

  return DiffHandler;
}();