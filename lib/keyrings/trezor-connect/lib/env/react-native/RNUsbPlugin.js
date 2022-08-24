"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _reactNative = require("react-native");

// $FlowIssue: 'react-native' is not a dependency
var bufferToHex = function bufferToHex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), function (x) {
    return ("00" + x.toString(16)).slice(-2);
  }).join('');
};

var toArrayBuffer = function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  var len = buffer.length;

  for (var i = 0; i < len; ++i) {
    view[i] = buffer[i];
  }

  return ab;
};

var ReactNativePlugin = /*#__PURE__*/function () {
  function ReactNativePlugin() {
    (0, _defineProperty2["default"])(this, "name", 'ReactNativePlugin');
    (0, _defineProperty2["default"])(this, "version", '1.0.0');
    (0, _defineProperty2["default"])(this, "debug", false);
    (0, _defineProperty2["default"])(this, "allowsWriteAndEnumerate", true);
    (0, _defineProperty2["default"])(this, "requestNeeded", false);
    this.usb = _reactNative.NativeModules.RNBridge;
  }

  var _proto = ReactNativePlugin.prototype;

  _proto.init = function init(debug) {
    this.debug = !!debug;

    if (!this.usb) {
      throw new Error('ReactNative plugin is not available');
    }

    return Promise.resolve();
  };

  _proto.enumerate = function enumerate() {
    return this.usb.enumerate();
  };

  _proto.send = function send(path, data, debugLink) {
    var dataHex = bufferToHex(data);
    return this.usb.write(path, debugLink, dataHex);
  };

  _proto.receive = /*#__PURE__*/function () {
    var _receive = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(path, debugLink) {
      var _yield$this$usb$read, data;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.usb.read(path, debugLink);

            case 2:
              _yield$this$usb$read = _context.sent;
              data = _yield$this$usb$read.data;
              return _context.abrupt("return", toArrayBuffer(Buffer.from(data, 'hex')));

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function receive(_x, _x2) {
      return _receive.apply(this, arguments);
    }

    return receive;
  }();

  _proto.connect = /*#__PURE__*/function () {
    var _connect = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(path, debugLink) {
      var _this = this;

      var _loop, i, _ret;

      return _regenerator["default"].wrap(function _callee2$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop(i) {
                return _regenerator["default"].wrap(function _loop$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        if (!(i > 0)) {
                          _context2.next = 3;
                          break;
                        }

                        _context2.next = 3;
                        return new Promise(function (resolve) {
                          return setTimeout(resolve, i * 200);
                        });

                      case 3:
                        _context2.prev = 3;
                        _context2.next = 6;
                        return _this.usb.acquire(path, debugLink);

                      case 6:
                        return _context2.abrupt("return", {
                          v: void 0
                        });

                      case 9:
                        _context2.prev = 9;
                        _context2.t0 = _context2["catch"](3);

                        if (!(i === 4)) {
                          _context2.next = 13;
                          break;
                        }

                        throw _context2.t0;

                      case 13:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _loop, null, [[3, 9]]);
              });
              i = 0;

            case 2:
              if (!(i < 5)) {
                _context3.next = 10;
                break;
              }

              return _context3.delegateYield(_loop(i), "t0", 4);

            case 4:
              _ret = _context3.t0;

              if (!(typeof _ret === "object")) {
                _context3.next = 7;
                break;
              }

              return _context3.abrupt("return", _ret.v);

            case 7:
              i++;
              _context3.next = 2;
              break;

            case 10:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee2);
    }));

    function connect(_x3, _x4) {
      return _connect.apply(this, arguments);
    }

    return connect;
  }();

  _proto.disconnect = function disconnect(path, debugLink, last) {
    return this.usb.release(path, debugLink, last);
  };

  return ReactNativePlugin;
}();

exports["default"] = ReactNativePlugin;