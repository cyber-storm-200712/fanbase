"use strict";

exports.__esModule = true;
exports.getLabel = exports.fixPath = exports.getIndexFromPath = exports.getPathFromIndex = exports.getSerializedPath = exports.validatePath = exports.getOutputScriptType = exports.getScriptType = exports.getAccountType = exports.isTaprootPath = exports.isBech32Path = exports.isSegwitPath = exports.isMultisigPath = exports.getHDPath = exports.fromHardened = exports.toHardened = exports.HD_HARDENED = void 0;

var _constants = require("../constants");

var HD_HARDENED = 0x80000000;
exports.HD_HARDENED = HD_HARDENED;

var toHardened = function toHardened(n) {
  return (n | HD_HARDENED) >>> 0;
};

exports.toHardened = toHardened;

var fromHardened = function fromHardened(n) {
  return (n & ~HD_HARDENED) >>> 0;
};

exports.fromHardened = fromHardened;

var PATH_NOT_VALID = _constants.ERRORS.TypedError('Method_InvalidParameter', 'Not a valid path');

var PATH_NEGATIVE_VALUES = _constants.ERRORS.TypedError('Method_InvalidParameter', 'Path cannot contain negative values');

var getHDPath = function getHDPath(path) {
  var parts = path.toLowerCase().split('/');
  if (parts[0] !== 'm') throw PATH_NOT_VALID;
  return parts.filter(function (p) {
    return p !== 'm' && p !== '';
  }).map(function (p) {
    var hardened = false;

    if (p.substr(p.length - 1) === "'") {
      hardened = true;
      p = p.substr(0, p.length - 1);
    }

    var n = parseInt(p, 10);

    if (Number.isNaN(n)) {
      throw PATH_NOT_VALID;
    } else if (n < 0) {
      throw PATH_NEGATIVE_VALUES;
    }

    if (hardened) {
      // hardened index
      n = toHardened(n);
    }

    return n;
  });
};

exports.getHDPath = getHDPath;

var isMultisigPath = function isMultisigPath(path) {
  return Array.isArray(path) && path[0] === toHardened(48);
};

exports.isMultisigPath = isMultisigPath;

var isSegwitPath = function isSegwitPath(path) {
  return Array.isArray(path) && path[0] === toHardened(49);
};

exports.isSegwitPath = isSegwitPath;

var isBech32Path = function isBech32Path(path) {
  return Array.isArray(path) && path[0] === toHardened(84);
};

exports.isBech32Path = isBech32Path;

var isTaprootPath = function isTaprootPath(path) {
  return Array.isArray(path) && path[0] === toHardened(86);
};

exports.isTaprootPath = isTaprootPath;

var getAccountType = function getAccountType(path) {
  if (isTaprootPath(path)) return 'p2tr';
  if (isBech32Path(path)) return 'p2wpkh';
  if (isSegwitPath(path)) return 'p2sh';
  return 'p2pkh';
};

exports.getAccountType = getAccountType;

var getScriptType = function getScriptType(path) {
  if (!Array.isArray(path) || path.length < 1) return 'SPENDADDRESS';
  var p1 = fromHardened(path[0]);

  switch (p1) {
    case 48:
      return 'SPENDMULTISIG';

    case 49:
      return 'SPENDP2SHWITNESS';

    case 84:
      return 'SPENDWITNESS';

    case 86:
      return 'SPENDTAPROOT';

    default:
      return 'SPENDADDRESS';
  }
};

exports.getScriptType = getScriptType;

var getOutputScriptType = function getOutputScriptType(path) {
  if (!Array.isArray(path) || path.length < 1) return 'PAYTOADDRESS'; // compatibility for Casa - allow an unhardened 49 path to use PAYTOP2SHWITNESS

  if (path[0] === 49) {
    return 'PAYTOP2SHWITNESS';
  }

  var p = fromHardened(path[0]);

  switch (p) {
    case 48:
      return 'PAYTOMULTISIG';

    case 49:
      return 'PAYTOP2SHWITNESS';

    case 84:
      return 'PAYTOWITNESS';

    case 86:
      return 'PAYTOTAPROOT';

    default:
      return 'PAYTOADDRESS';
  }
};

exports.getOutputScriptType = getOutputScriptType;

var validatePath = function validatePath(path, length, base) {
  if (length === void 0) {
    length = 0;
  }

  if (base === void 0) {
    base = false;
  }

  var valid;

  if (typeof path === 'string') {
    valid = getHDPath(path);
  } else if (Array.isArray(path)) {
    valid = path.map(function (p) {
      var n = parseInt(p, 10);

      if (Number.isNaN(n)) {
        throw PATH_NOT_VALID;
      } else if (n < 0) {
        throw PATH_NEGATIVE_VALUES;
      }

      return n;
    });
  }

  if (!valid) throw PATH_NOT_VALID;
  if (length > 0 && valid.length < length) throw PATH_NOT_VALID;
  return base ? valid.splice(0, 3) : valid;
};

exports.validatePath = validatePath;

var getSerializedPath = function getSerializedPath(path) {
  return "m/" + path.map(function (i) {
    var s = (i & ~HD_HARDENED).toString();

    if (i & HD_HARDENED) {
      return s + "'";
    }

    return s;
  }).join('/');
};

exports.getSerializedPath = getSerializedPath;

var getPathFromIndex = function getPathFromIndex(bip44purpose, bip44cointype, index) {
  return [toHardened(bip44purpose), toHardened(bip44cointype), toHardened(index)];
};

exports.getPathFromIndex = getPathFromIndex;

var getIndexFromPath = function getIndexFromPath(path) {
  if (path.length < 3) {
    throw _constants.ERRORS.TypedError('Method_InvalidParameter', "getIndexFromPath: invalid path length " + path.toString());
  }

  return fromHardened(path[2]);
};

exports.getIndexFromPath = getIndexFromPath;

var fixPath = function fixPath(utxo) {
  // make sure bip32 indices are unsigned
  if (utxo.address_n && Array.isArray(utxo.address_n)) {
    utxo.address_n = utxo.address_n.map(function (i) {
      return i >>> 0;
    });
  }

  return utxo;
};

exports.fixPath = fixPath;

var getLabel = function getLabel(label, coinInfo) {
  if (coinInfo) {
    return label.replace('#NETWORK', coinInfo.label);
  }

  return label.replace('#NETWORK', '');
};

exports.getLabel = getLabel;