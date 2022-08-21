"use strict";

exports.__esModule = true;
exports.parseRevision = exports.getUnavailableCapabilities = exports.parseCapabilities = void 0;

var _versionUtils = require("./versionUtils");

// From protobuf
var CAPABILITIES = ['Capability_Bitcoin', 'Capability_Bitcoin_like', 'Capability_Binance', 'Capability_Cardano', 'Capability_Crypto', 'Capability_EOS', 'Capability_Ethereum', 'Capability_Lisk', // 8, for historical reasons
'Capability_Monero', 'Capability_NEM', 'Capability_Ripple', 'Capability_Stellar', 'Capability_Tezos', 'Capability_U2F', 'Capability_Shamir', 'Capability_ShamirGroups', 'Capability_PassphraseEntry'];
var DEFAULT_CAPABILITIES_T1 = [1, 2, 5, 7, 10, 12, 14];
var DEFAULT_CAPABILITIES_TT = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14];

var parseCapabilities = function parseCapabilities(features) {
  if (!features || features.firmware_present === false) return []; // no features or no firmware - no capabilities
  // needs to be "any" since Features.capabilities are declared as string[] but in fact it's a number[]

  var filter = function filter(c) {
    return CAPABILITIES[c - 1] ? [CAPABILITIES[c - 1]] : [];
  }; // fallback for older firmware


  if (!features.capabilities || !features.capabilities.length) return features.major_version === 1 ? DEFAULT_CAPABILITIES_T1.flatMap(filter) : DEFAULT_CAPABILITIES_TT.flatMap(filter); // regular capabilities

  return features.capabilities.flatMap(filter);
}; // TODO: support type


exports.parseCapabilities = parseCapabilities;

var getUnavailableCapabilities = function getUnavailableCapabilities(features, coins, support) {
  var capabilities = features.capabilities;
  var list = {};
  if (!capabilities) return list;
  var fw = [features.major_version, features.minor_version, features.patch_version];
  var key = "trezor" + features.major_version; // 1. check if firmware version is supported by CoinInfo.support

  var supported = coins.filter(function (info) {
    if (!info.support || typeof info.support[key] !== 'string') {
      list[info.shortcut.toLowerCase()] = 'no-support';
      return false;
    }

    return true;
  }); // 2. check if current firmware have enabled capabilities

  var unavailable = supported.filter(function (info) {
    if (info.type === 'bitcoin') {
      if (info.name === 'Bitcoin' || info.name === 'Testnet') {
        return !capabilities.includes('Capability_Bitcoin');
      }

      return !capabilities.includes('Capability_Bitcoin_like');
    }

    if (info.type === 'ethereum') {
      return !capabilities.includes('Capability_Ethereum');
    }

    if (info.type === 'nem') {
      return !capabilities.includes('Capability_NEM');
    } // misc


    if (info.shortcut === 'BNB') return !capabilities.includes('Capability_Binance');
    if (info.shortcut === 'ADA' || info.shortcut === 'tADA') return !capabilities.includes('Capability_Cardano');
    if (info.shortcut === 'XRP' || info.shortcut === 'tXRP') return !capabilities.includes('Capability_Ripple');
    return !capabilities.includes("Capability_" + info.name);
  }); // add unavailable coins to list

  unavailable.forEach(function (info) {
    list[info.shortcut.toLowerCase()] = 'no-capability';
  }); // 3. check if firmware version is in range of CoinInfo.support

  supported.filter(function (info) {
    return !unavailable.includes(info);
  }).forEach(function (info) {
    if ((0, _versionUtils.versionCompare)(info.support[key], fw) > 0) {
      list[info.shortcut.toLowerCase()] = 'update-required';
      unavailable.push(info);
    }
  }); // 4. check if firmware version is in range of capabilities in "config.supportedFirmware"

  support.forEach(function (s) {
    if (!s.capabilities) return;
    var min = s.min ? s.min[fw[0] - 1] : null;
    var max = s.max ? s.max[fw[0] - 1] : null;

    if (min && (min === '0' || (0, _versionUtils.versionCompare)(min, fw) > 0)) {
      var value = min === '0' ? 'no-support' : 'update-required';
      s.capabilities.forEach(function (m) {
        list[m] = value;
      });
    }

    if (max && (0, _versionUtils.versionCompare)(max, fw) < 0) {
      s.capabilities.forEach(function (m) {
        list[m] = 'trezor-connect-outdated';
      });
    }
  });
  return list;
};
/**
 * Fixes an inconsistency in representation of device feature revision attribute (git commit of specific release).
 * - T1 uses standard hexadecimal notation. (df0963ec48f01f3d07ffca556e21ff0070cab099)
 * - T2 uses hexadecimal raw bytes notation. (6466303936336563)
 * To avoid being model specific, in case the inconsistency is fixed, it is required to reliably detect what encoding is used.
 * @param {Features} features
 * @returns revision - standard hexadecimal notation or null
 */


exports.getUnavailableCapabilities = getUnavailableCapabilities;

var parseRevision = function parseRevision(features) {
  var revision = features.revision; // if device is in bootloader mode, revision is null

  if (!revision) return null; // if revision contains at least one a-f character and the rest are numbers, it is already in standard hexadecimal notation

  if (/^(?=.*[a-f])([a-f0-9]*)$/gi.test(revision)) return revision; // otherwise it is probably in hexadecimal raw bytes representation so we encode it into standard hexadecimal notation

  var revisionUtf8 = Buffer.from(revision, 'hex').toString('utf-8');
  /**
   * We have to make sure, that revision was not in standard hexadecimal notation before encoding,
   * that means it consisted only from decimal numbers (chance close to zero).
   * So, if it contains characters different from a-f and numbers, it was in hexadecimal notation before encoding.
   */

  return /^([a-f0-9])*$/gi.test(revisionUtf8) ? revisionUtf8 : revision;
};

exports.parseRevision = parseRevision;