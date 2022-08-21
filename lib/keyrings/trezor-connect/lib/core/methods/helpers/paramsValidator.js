"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.validateParams = validateParams;
exports.getFirmwareRange = exports.validateCoinPath = void 0;

var _constants = require("../../../constants");

var _pathUtils = require("../../../utils/pathUtils");

var _versionUtils = require("../../../utils/versionUtils");

var _DataManager = _interopRequireDefault(require("../../../data/DataManager"));

var invalidParameter = function invalidParameter(message) {
  return _constants.ERRORS.TypedError('Method_InvalidParameter', message);
};

function validateParams(params, schema) {
  schema.forEach(function (field) {
    var value = params[field.name];

    if (field.required && value == null) {
      // required parameter not found
      throw invalidParameter("Parameter \"" + field.name + "\" is missing.");
    } // parameter doesn't have a type or value, validation is pointless


    if (!field.type || value == null) return;
    var name = field.name,
        type = field.type; // schema type is a union

    if (Array.isArray(type)) {
      // create single field object
      var p = {};
      p[name] = value; // validate case for each type in union

      var success = type.reduce(function (count, t) {
        try {
          validateParams(p, [{
            name: field.name,
            type: t
          }]);
          return count + 1;
        } catch (e) {
          return count;
        }
      }, 0); // every case ended with error = no type match

      if (!success) {
        throw invalidParameter("Parameter \"" + name + "\" has invalid type. Union of \"" + type.join('|') + "\" expected.");
      }

      return;
    }

    if (type === 'array') {
      if (!Array.isArray(value)) {
        throw invalidParameter("Parameter \"" + name + "\" has invalid type. \"" + type + "\" expected.");
      }

      if (!field.allowEmpty && value.length < 1) {
        throw invalidParameter("Parameter \"" + name + "\" is empty.");
      }
    } else if (type === 'uint') {
      if (typeof value !== 'string' && typeof value !== 'number') {
        throw invalidParameter("Parameter \"" + name + "\" has invalid type. \"string|number\" expected.");
      }

      if (typeof value === 'number' && !Number.isSafeInteger(value) || !/^(?:[1-9]\d*|\d)$/.test(value.toString().replace(/^-/, field.allowNegative ? '' : '-'))) {
        throw invalidParameter("Parameter \"" + name + "\" has invalid value \"" + value + "\". Integer representation expected.");
      }
    } else if (type === 'array-buffer') {
      if (!(value instanceof ArrayBuffer)) {
        throw invalidParameter("Parameter \"" + name + "\" has invalid type. \"ArrayBuffer\" expected.");
      } // eslint-disable-next-line valid-typeof

    } else if (typeof value !== type) {
      // invalid type
      throw invalidParameter("Parameter \"" + name + "\" has invalid type. \"" + type + "\" expected.");
    }
  });
  return params;
}

var validateCoinPath = function validateCoinPath(coinInfo, path) {
  if (coinInfo && coinInfo.slip44 !== (0, _pathUtils.fromHardened)(path[1])) {
    throw invalidParameter('Parameters "path" and "coin" do not match.');
  }
};

exports.validateCoinPath = validateCoinPath;

var getFirmwareRange = function getFirmwareRange(method, coinInfo, currentRange) {
  var current = JSON.parse(JSON.stringify(currentRange)); // set minimum required firmware from coins.json (coinInfo)

  if (coinInfo) {
    if (!coinInfo.support || typeof coinInfo.support.trezor1 !== 'string') {
      current['1'].min = '0';
    } else if ((0, _versionUtils.versionCompare)(coinInfo.support.trezor1, current['1'].min) > 0) {
      current['1'].min = coinInfo.support.trezor1;
    }

    if (!coinInfo.support || typeof coinInfo.support.trezor2 !== 'string') {
      current['2'].min = '0';
    } else if ((0, _versionUtils.versionCompare)(coinInfo.support.trezor2, current['2'].min) > 0) {
      current['2'].min = coinInfo.support.trezor2;
    }
  }

  var coinType = coinInfo ? coinInfo.type : null;
  var shortcut = coinInfo ? coinInfo.shortcut.toLowerCase() : null; // find firmware range in config.json

  var _DataManager$getConfi = _DataManager["default"].getConfig(),
      supportedFirmware = _DataManager$getConfi.supportedFirmware;

  var range = supportedFirmware.filter(function (rule) {
    // check if rule applies to requested method
    if (rule.methods) {
      return rule.methods.includes(method);
    } // check if rule applies to capability


    if (rule.capabilities) {
      return rule.capabilities.includes(method);
    } // rule doesn't have specified methods
    // it may be a global rule for coin or coinType


    return true;
  }).find(function (c) {
    if (c.coinType) {
      // rule for coin type
      return c.coinType === coinType;
    }

    if (c.coin) {
      // rule for coin shortcut
      return (typeof c.coin === 'string' ? [c.coin] : c.coin).includes(shortcut);
    } // rule for method


    return c.methods || c.capabilities;
  });

  if (range) {
    var min = range.min,
        max = range.max; // override defaults
    // NOTE:
    // 0 may be confusing. means: no-support for "min" and unlimited support for "max"

    if (min) {
      var t1 = min[0],
          t2 = min[1];

      if (t1 === '0' || current['1'].min === '0' || (0, _versionUtils.versionCompare)(current['1'].min, t1) < 0) {
        current['1'].min = t1;
      }

      if (t2 === '0' || current['2'].min === '0' || (0, _versionUtils.versionCompare)(current['2'].min, t2) < 0) {
        current['2'].min = t2;
      }
    }

    if (max) {
      var _t = max[0],
          _t2 = max[1];

      if (_t === '0' || current['1'].max === '0' || (0, _versionUtils.versionCompare)(current['1'].max, _t) < 0) {
        current['1'].max = _t;
      }

      if (_t2 === '0' || current['2'].max === '0' || (0, _versionUtils.versionCompare)(current['2'].max, _t2) < 0) {
        current['2'].max = _t2;
      }
    }
  }

  return current;
};

exports.getFirmwareRange = getFirmwareRange;