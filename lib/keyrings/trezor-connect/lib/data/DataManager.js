"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _parseUri = _interopRequireDefault(require("parse-uri"));

var _networkUtils = require("../env/node/networkUtils");

var _ConnectSettings = require("./ConnectSettings");

var _CoinInfo = require("./CoinInfo");

var _FirmwareInfo = require("./FirmwareInfo");

var _TransportInfo = require("./TransportInfo");

var _versionUtils = require("../utils/versionUtils");

// TODO: transform json to flow typed object
var parseConfig = function parseConfig(json) {
  var config = json;
  return config;
};

var DataManager = /*#__PURE__*/function () {
  function DataManager() {}

  DataManager.load = /*#__PURE__*/function () {
    var _load = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(settings, withAssets) {
      var _this = this;

      var ts, config, isLocalhost, whitelist, knownHost, assetPromises, protobufPromises;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (withAssets === void 0) {
                withAssets = true;
              }

              ts = settings.env === 'web' ? "?r=" + settings.timestamp : '';
              this.settings = settings;
              _context3.next = 5;
              return (0, _networkUtils.httpRequest)("" + settings.configSrc + ts, 'json');

            case 5:
              config = _context3.sent;
              this.config = parseConfig(config); // check if origin is localhost or trusted

              isLocalhost = typeof window !== 'undefined' && window.location ? window.location.hostname === 'localhost' : true;
              whitelist = DataManager.isWhitelisted(this.settings.origin || '');
              this.settings.trustedHost = (isLocalhost || !!whitelist) && !this.settings.popup; // ensure that popup will be used

              if (!this.settings.trustedHost) {
                this.settings.popup = true;
              } // ensure that debug is disabled


              if (!this.settings.trustedHost && !whitelist) {
                this.settings.debug = false;
              }

              this.settings.priority = DataManager.getPriority(whitelist);
              knownHost = DataManager.getHostLabel(this.settings.extension || this.settings.origin || '');

              if (knownHost) {
                this.settings.hostLabel = knownHost.label;
                this.settings.hostIcon = knownHost.icon;
              } // hotfix webusb + chrome:72, allow webextensions


              if (this.settings.popup && this.settings.webusb && this.settings.env !== 'webextension') {
                this.settings.webusb = false;
              }

              if (withAssets) {
                _context3.next = 18;
                break;
              }

              return _context3.abrupt("return");

            case 18:
              assetPromises = this.config.assets.map( /*#__PURE__*/function () {
                var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(asset) {
                  var json;
                  return _regenerator["default"].wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.next = 2;
                          return (0, _networkUtils.httpRequest)("" + asset.url + ts, asset.type || 'json');

                        case 2:
                          json = _context.sent;
                          _this.assets[asset.name] = json;

                        case 4:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                }));

                return function (_x3) {
                  return _ref.apply(this, arguments);
                };
              }());
              _context3.next = 21;
              return Promise.all(assetPromises);

            case 21:
              protobufPromises = this.config.messages.map( /*#__PURE__*/function () {
                var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(protobuf) {
                  var json;
                  return _regenerator["default"].wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return (0, _networkUtils.httpRequest)("" + protobuf.json + ts, 'json');

                        case 2:
                          json = _context2.sent;
                          _this.messages[protobuf.name] = json;

                        case 4:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                }));

                return function (_x4) {
                  return _ref2.apply(this, arguments);
                };
              }());
              _context3.next = 24;
              return Promise.all(protobufPromises);

            case 24:
              // parse bridge JSON
              (0, _TransportInfo.parseBridgeJSON)(this.assets.bridge); // parse coins definitions

              (0, _CoinInfo.parseCoinsJson)(this.assets.coins); // parse firmware definitions

              (0, _FirmwareInfo.parseFirmware)(this.assets['firmware-t1'], 1);
              (0, _FirmwareInfo.parseFirmware)(this.assets['firmware-t2'], 2);

            case 28:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function load(_x, _x2) {
      return _load.apply(this, arguments);
    }

    return load;
  }();

  DataManager.getProtobufMessages = function getProtobufMessages(version) {
    // empty array = unacquired device
    if (!version || !version.length) return this.messages["default"];
    var model = version[0] - 1;
    var messages = this.config.messages.find(function (m) {
      var min = m.range.min[model];
      var max = m.range.max ? m.range.max[model] : version;
      return (0, _versionUtils.versionCompare)(version, min) >= 0 && (0, _versionUtils.versionCompare)(version, max) <= 0;
    });
    return this.messages[messages ? messages.name : 'default'];
  };

  DataManager.isWhitelisted = function isWhitelisted(origin) {
    if (!this.config) return null;
    var uri = (0, _parseUri["default"])(origin);

    if (uri && typeof uri.host === 'string') {
      var parts = uri.host.split('.');

      if (parts.length > 2) {
        // subdomain
        uri.host = parts.slice(parts.length - 2, parts.length).join('.');
      }

      return this.config.whitelist.find(function (item) {
        return item.origin === origin || item.origin === uri.host;
      });
    }
  };

  DataManager.isManagementAllowed = function isManagementAllowed() {
    var _this2 = this;

    if (!this.config) return;
    var uri = (0, _parseUri["default"])(this.settings.origin);

    if (uri && typeof uri.host === 'string') {
      var parts = uri.host.split('.');

      if (parts.length > 2) {
        // subdomain
        uri.host = parts.slice(parts.length - 2, parts.length).join('.');
      }

      return this.config.management.find(function (item) {
        return item.origin === _this2.settings.origin || item.origin === uri.host;
      });
    }
  };

  DataManager.getPriority = function getPriority(whitelist) {
    if (whitelist) {
      return whitelist.priority;
    }

    return _ConnectSettings.DEFAULT_PRIORITY;
  };

  DataManager.getHostLabel = function getHostLabel(origin) {
    return this.config.knownHosts.find(function (host) {
      return host.origin === origin;
    });
  };

  DataManager.getSettings = function getSettings(key) {
    if (!this.settings) return null;

    if (typeof key === 'string') {
      return this.settings[key];
    }

    return this.settings;
  };

  DataManager.getDebugSettings = function getDebugSettings() {
    return false;
  };

  DataManager.getConfig = function getConfig() {
    return this.config;
  };

  return DataManager;
}();

exports["default"] = DataManager;
(0, _defineProperty2["default"])(DataManager, "assets", {});
(0, _defineProperty2["default"])(DataManager, "messages", {});