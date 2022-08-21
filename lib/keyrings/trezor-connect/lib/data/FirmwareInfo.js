"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getReleases = exports.getRelease = exports.getFirmwareStatus = exports.parseFirmware = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _rollout = require("@trezor/rollout");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var releases = {};
releases[1] = [];
releases[2] = []; // strip "data" directory from download url (default: data.trezor.io)
// it's hard coded in "releases.json" ("mytrezor" dir structure)

var cleanUrl = function cleanUrl(url) {
  if (typeof url !== 'string') return;
  if (url.indexOf('data/') === 0) return url.substring(5);
  return url;
};

var parseFirmware = function parseFirmware(json, model) {
  Object.keys(json).forEach(function (key) {
    var release = json[key];
    releases[model].push(_objectSpread(_objectSpread({}, release), {}, {
      url: cleanUrl(release.url),
      url_bitcoinonly: cleanUrl(release.url_bitcoinonly)
    }));
  });
};

exports.parseFirmware = parseFirmware;

var getFirmwareStatus = function getFirmwareStatus(features) {
  // indication that firmware is not installed at all. This information is set to false in bl mode. Otherwise it is null.
  if (features.firmware_present === false) {
    return 'none';
  } // for t1 in bootloader, what device reports as firmware version is in fact bootloader version, so we can
  // not safely tell firmware version


  if (features.major_version === 1 && features.bootloader_mode) {
    return 'unknown';
  }

  var info = (0, _rollout.getInfo)({
    features: features,
    releases: releases[features.major_version]
  }); // should not happen, possibly if releases list contains inconsistent data or so

  if (!info) return 'unknown';
  if (info.isRequired) return 'required';
  if (info.isNewer) return 'outdated';
  return 'valid';
};

exports.getFirmwareStatus = getFirmwareStatus;

var getRelease = function getRelease(features) {
  return (0, _rollout.getInfo)({
    features: features,
    releases: releases[features.major_version]
  });
};

exports.getRelease = getRelease;

var getReleases = function getReleases(model) {
  return releases[model];
};

exports.getReleases = getReleases;