"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.disableWebUSB = exports.renderWebUSBButton = exports.cancel = exports.requestLogin = exports.customMessage = exports.getSettings = exports.uiResponse = exports.call = exports.init = exports.dispose = exports.manifest = exports.messagePromises = exports.eventEmitter = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _events = _interopRequireDefault(require("events"));

var _ConnectSettings = require("../../data/ConnectSettings");

var _debug = require("../../utils/debug");

var _message = require("../../message");

var _Core = require("../../core/Core");

var _deferred = require("../../utils/deferred");

var _constants = require("../../constants");

var $T = _interopRequireWildcard(require("../../types"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var eventEmitter = new _events["default"]();
exports.eventEmitter = eventEmitter;

var _log = (0, _debug.initLog)('[trezor-connect.js]');

var _settings;

var _core;

var _messageID = 0;
var messagePromises = {};
exports.messagePromises = messagePromises;

var manifest = function manifest(data) {
  _settings = (0, _ConnectSettings.parse)({
    manifest: data
  });
};

exports.manifest = manifest;

var dispose = function dispose() {
  eventEmitter.removeAllListeners();

  if (_core) {
    _core.dispose();
  } // TODO: fix top level values during refactor
  // $FlowIssue


  _settings = null; // $FlowIssue

  _core = null;
}; // handle message received from iframe


exports.dispose = dispose;

var handleMessage = function handleMessage(message) {
  var event = message.event,
      type = message.type,
      payload = message.payload;
  var id = message.id || 0;

  if (type === _constants.UI.REQUEST_UI_WINDOW) {
    _core.handleMessage({
      event: _constants.UI_EVENT,
      type: _constants.POPUP.HANDSHAKE
    }, true);

    return;
  }

  if (type === _constants.POPUP.CANCEL_POPUP_REQUEST) return;

  _log.log('handleMessage', message);

  switch (event) {
    case _constants.RESPONSE_EVENT:
      if (messagePromises[id]) {
        // resolve message promise (send result of call method)
        messagePromises[id].resolve({
          id: id,
          success: message.success,
          payload: payload
        });
        delete messagePromises[id];
      } else {
        _log.warn("Unknown message id " + id);
      }

      break;

    case _constants.DEVICE_EVENT:
      // pass DEVICE event up to html
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload); // DEVICE_EVENT also emit single events (connect/disconnect...)

      break;

    case _constants.TRANSPORT_EVENT:
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload);
      break;

    case _constants.BLOCKCHAIN_EVENT:
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload);
      break;

    case _constants.UI_EVENT:
      // pass UI event up
      eventEmitter.emit(event, message);
      eventEmitter.emit(type, payload);
      break;

    default:
      _log.log('Undefined message', event, message);

  }
};

var postMessage = function postMessage(message, usePromise) {
  if (usePromise === void 0) {
    usePromise = true;
  }

  if (!_core) {
    throw _constants.ERRORS.TypedError('Runtime', 'postMessage: _core not found');
  }

  if (usePromise) {
    _messageID++;
    message.id = _messageID;
    messagePromises[_messageID] = (0, _deferred.create)();
    var promise = messagePromises[_messageID].promise;

    _core.handleMessage(message, true);

    return promise;
  }

  _core.handleMessage(message, true);

  return null;
};

var init = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(settings) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (settings === void 0) {
              settings = {};
            }

            if (!_settings) {
              _settings = (0, _ConnectSettings.parse)(settings);
            } // set defaults for node


            _settings.origin = 'http://node.trezor.io/';
            _settings.popup = false;
            _settings.env = 'react-native';

            if (_settings.manifest) {
              _context.next = 7;
              break;
            }

            throw _constants.ERRORS.TypedError('Init_ManifestMissing');

          case 7:
            if (!_settings.lazyLoad) {
              _context.next = 10;
              break;
            }

            // reset "lazyLoad" after first use
            _settings.lazyLoad = false;
            return _context.abrupt("return");

          case 10:
            _log.enabled = !!_settings.debug;
            _context.next = 13;
            return (0, _Core.init)(_settings);

          case 13:
            _core = _context.sent;

            _core.on(_constants.CORE_EVENT, handleMessage);

            _context.next = 17;
            return (0, _Core.initTransport)(_settings);

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function init(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.init = init;

var call = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(params) {
    var response;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (_core) {
              _context2.next = 10;
              break;
            }

            _settings = (0, _ConnectSettings.parse)({
              debug: false,
              popup: false
            }); // auto init with default settings

            _context2.prev = 2;
            _context2.next = 5;
            return init(_settings);

          case 5:
            _context2.next = 10;
            break;

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](2);
            return _context2.abrupt("return", (0, _message.errorMessage)(_context2.t0));

          case 10:
            _context2.prev = 10;
            _context2.next = 13;
            return postMessage({
              type: _constants.IFRAME.CALL,
              payload: params
            });

          case 13:
            response = _context2.sent;

            if (!response) {
              _context2.next = 16;
              break;
            }

            return _context2.abrupt("return", response);

          case 16:
            return _context2.abrupt("return", (0, _message.errorMessage)(_constants.ERRORS.TypedError('Method_NoResponse')));

          case 19:
            _context2.prev = 19;
            _context2.t1 = _context2["catch"](10);

            _log.error('__call error', _context2.t1);

            return _context2.abrupt("return", (0, _message.errorMessage)(_context2.t1));

          case 23:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[2, 7], [10, 19]]);
  }));

  return function call(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.call = call;

var customMessageResponse = function customMessageResponse(payload) {
  _core.handleMessage({
    event: _constants.UI_EVENT,
    type: _constants.UI.CUSTOM_MESSAGE_RESPONSE,
    payload: payload
  }, true);
};

var uiResponse = function uiResponse(response) {
  var type = response.type,
      payload = response.payload;

  _core.handleMessage({
    event: _constants.UI_EVENT,
    type: type,
    payload: payload
  }, true);
};

exports.uiResponse = uiResponse;

var getSettings = function getSettings() {
  if (!_core) {
    return Promise.resolve((0, _message.errorMessage)(_constants.ERRORS.TypedError('Init_NotInitialized')));
  }

  return call({
    method: 'getSettings'
  });
};

exports.getSettings = getSettings;

var customMessage = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(params) {
    var callback, customMessageListener, response;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(typeof params.callback !== 'function')) {
              _context4.next = 2;
              break;
            }

            return _context4.abrupt("return", (0, _message.errorMessage)(_constants.ERRORS.TypedError('Method_CustomMessage_Callback')));

          case 2:
            // TODO: set message listener only if iframe is loaded correctly
            callback = params.callback;

            customMessageListener = /*#__PURE__*/function () {
              var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(event) {
                var data, payload;
                return _regenerator["default"].wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        data = event.data;

                        if (!(data && data.type === _constants.UI.CUSTOM_MESSAGE_REQUEST)) {
                          _context3.next = 6;
                          break;
                        }

                        _context3.next = 4;
                        return callback(data.payload);

                      case 4:
                        payload = _context3.sent;

                        if (payload) {
                          customMessageResponse(payload);
                        } else {
                          customMessageResponse({
                            message: 'release'
                          });
                        }

                      case 6:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function customMessageListener(_x4) {
                return _ref4.apply(this, arguments);
              };
            }();

            _core.on(_constants.CORE_EVENT, customMessageListener);

            _context4.next = 7;
            return call(_objectSpread(_objectSpread({
              method: 'customMessage'
            }, params), {}, {
              callback: null
            }));

          case 7:
            response = _context4.sent;

            _core.removeListener(_constants.CORE_EVENT, customMessageListener);

            return _context4.abrupt("return", response);

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function customMessage(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

exports.customMessage = customMessage;

var requestLogin = /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(params) {
    var callback, loginChallengeListener, response;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!(typeof params.callback === 'function')) {
              _context6.next = 9;
              break;
            }

            callback = params.callback; // TODO: set message listener only if iframe is loaded correctly

            loginChallengeListener = /*#__PURE__*/function () {
              var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(event) {
                var data, payload;
                return _regenerator["default"].wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        data = event.data;

                        if (!(data && data.type === _constants.UI.LOGIN_CHALLENGE_REQUEST)) {
                          _context5.next = 12;
                          break;
                        }

                        _context5.prev = 2;
                        _context5.next = 5;
                        return callback();

                      case 5:
                        payload = _context5.sent;

                        _core.handleMessage({
                          event: _constants.UI_EVENT,
                          type: _constants.UI.LOGIN_CHALLENGE_RESPONSE,
                          payload: payload
                        }, true);

                        _context5.next = 12;
                        break;

                      case 9:
                        _context5.prev = 9;
                        _context5.t0 = _context5["catch"](2);

                        _core.handleMessage({
                          event: _constants.UI_EVENT,
                          type: _constants.UI.LOGIN_CHALLENGE_RESPONSE,
                          payload: _context5.t0.message
                        }, true);

                      case 12:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5, null, [[2, 9]]);
              }));

              return function loginChallengeListener(_x6) {
                return _ref6.apply(this, arguments);
              };
            }();

            _core.on(_constants.CORE_EVENT, loginChallengeListener);

            _context6.next = 6;
            return call(_objectSpread(_objectSpread({
              method: 'requestLogin'
            }, params), {}, {
              asyncChallenge: true,
              callback: null
            }));

          case 6:
            response = _context6.sent;

            _core.removeListener(_constants.CORE_EVENT, loginChallengeListener);

            return _context6.abrupt("return", response);

          case 9:
            return _context6.abrupt("return", call(_objectSpread({
              method: 'requestLogin'
            }, params)));

          case 10:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function requestLogin(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

exports.requestLogin = requestLogin;

var cancel = function cancel(error) {
  postMessage({
    type: _constants.POPUP.CLOSED,
    payload: error ? {
      error: error
    } : null
  }, false);
};

exports.cancel = cancel;

var renderWebUSBButton = function renderWebUSBButton(_className) {
  throw _constants.ERRORS.TypedError('Method_InvalidPackage');
};

exports.renderWebUSBButton = renderWebUSBButton;

var disableWebUSB = function disableWebUSB() {
  throw _constants.ERRORS.TypedError('Method_InvalidPackage');
};

exports.disableWebUSB = disableWebUSB;