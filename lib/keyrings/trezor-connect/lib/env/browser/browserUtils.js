"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.suggestUdevInstaller = exports.suggestBridgeInstaller = exports.getSuggestedPlatform = exports.getOS = exports.getBrowserState = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _bowser = _interopRequireDefault(require("bowser"));

var _TransportInfo = require("../../data/TransportInfo");

var _UdevInfo = require("../../data/UdevInfo");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var DEFAULT_STATE = {
  name: 'unknown',
  osname: 'unknown',
  supported: false,
  outdated: false,
  mobile: false
};

var getBrowserState = function getBrowserState(supportedBrowsers) {
  if (typeof window === 'undefined' || !navigator || !navigator.userAgent) return DEFAULT_STATE;

  var _Bowser$parse = _bowser["default"].parse(navigator.userAgent),
      browser = _Bowser$parse.browser,
      os = _Bowser$parse.os,
      platform = _Bowser$parse.platform;

  var mobile = platform.type === 'mobile';
  var supported = browser.name ? supportedBrowsers[browser.name.toLowerCase()] : null;
  var outdated = false;

  if (mobile && typeof navigator.usb === 'undefined') {
    supported = null;
  }

  if (supported) {
    outdated = supported.version > parseInt(browser.version, 10);

    if (outdated) {
      supported = null;
    }
  }

  return {
    name: browser.name + ": " + browser.version + "; " + os.name + ": " + os.version + ";",
    osname: os.name,
    mobile: mobile,
    supported: !!supported,
    outdated: outdated
  };
};

exports.getBrowserState = getBrowserState;

var getOS = function getOS() {
  if (typeof window === 'undefined' || !navigator || !navigator.userAgent) return 'unknown';

  var _Bowser$parse2 = _bowser["default"].parse(navigator.userAgent),
      os = _Bowser$parse2.os;

  return os.name ? os.name.toLowerCase() : 'unknown';
};

exports.getOS = getOS;

var getSuggestedPlatform = function getSuggestedPlatform() {
  if (typeof window === 'undefined' || !navigator || !navigator.userAgent) return; // Find preferred platform using bowser and userAgent

  var agent = navigator.userAgent;

  var _Bowser$parse3 = _bowser["default"].parse(agent),
      os = _Bowser$parse3.os;

  var name = os.name ? os.name.toLowerCase() : null;

  switch (name) {
    case 'linux':
      {
        var isRpm = agent.match(/CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/) ? 'rpm' : 'deb';
        var is64x = agent.match(/Linux i[3456]86/) ? '32' : '64';
        return "" + isRpm + is64x;
      }

    case 'macos':
      return 'mac';

    case 'windows':
      {
        var arch = agent.match(/(Win64|WOW64)/) ? '64' : '32';
        return "win" + arch;
      }

    default:
      break;
  }
};

exports.getSuggestedPlatform = getSuggestedPlatform;

var suggestBridgeInstaller = function suggestBridgeInstaller() {
  var info = (0, _TransportInfo.getBridgeInfo)(); // check if preferred field was already added

  if (!info.packages.find(function (p) {
    return p.preferred;
  })) {
    var platform = getSuggestedPlatform();

    if (platform) {
      // override BridgeInfo packages, add preferred field
      info.packages = info.packages.map(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          preferred: p.platform.indexOf(platform) >= 0
        });
      });
    }
  }

  return info;
};

exports.suggestBridgeInstaller = suggestBridgeInstaller;

var suggestUdevInstaller = function suggestUdevInstaller() {
  var info = (0, _UdevInfo.getUdevInfo)(); // check if preferred field was already added

  if (!info.packages.find(function (p) {
    return p.preferred;
  })) {
    var platform = getSuggestedPlatform();

    if (platform) {
      // override UdevInfo packages, add preferred field
      info.packages = info.packages.map(function (p) {
        return _objectSpread(_objectSpread({}, p), {}, {
          preferred: p.platform.indexOf(platform) >= 0
        });
      });
    }
  }

  return info;
};

exports.suggestUdevInstaller = suggestUdevInstaller;