"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.parseArrayType = parseArrayType;
exports.encodeData = encodeData;
exports.getFieldType = getFieldType;

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _protobuf = require("../../../types/trezor/protobuf");

var _constants = require("../../../constants");

var _formatUtils = require("../../../utils/formatUtils");

// Copied from https://github.com/ethers-io/ethers.js/blob/v5.5.2/packages/abi/src.ts/fragments.ts#L249
var paramTypeArray = new RegExp(/^(.*)\[([0-9]*)\]$/);
var paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
var paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
/**
 * Parse the given EIP-712 array type into its entries, and its length (if not dynamic)
 * E.g. `uint16[32]` will return `{entryTypeName: 'uint16', arraySize: 32}`.
 */

function parseArrayType(arrayTypeName) {
  var arrayMatch = paramTypeArray.exec(arrayTypeName);

  if (arrayMatch === null) {
    throw _constants.ERRORS.TypedError('Runtime', "typename " + arrayTypeName + " could not be parsed as an EIP-712 array");
  }

  var _ = arrayMatch[0],
      entryTypeName = arrayMatch[1],
      arraySize = arrayMatch[2];
  return {
    entryTypeName: entryTypeName,
    arraySize: parseInt(arraySize, 10) || null
  };
}
/**
 * Converts a number to a two's complement representation.
 *
 * E.g. -128 would be 0x80 in two's complement, while 127 would be 0x7F.
 *
 * BigNumber.js has no built-in function, unlike https://www.npmjs.com/package/bn.js
 */


function twosComplement(number, bytes) {
  if (bytes < 1 || bytes > 32) {
    throw _constants.ERRORS.TypedError('Runtime', 'Int byte size must be between 1 and 32 (8 and 256 bits)');
  } // Determine value range


  var minValue = new _bignumber["default"](2).exponentiatedBy(bytes * 8 - 1).negated();
  var maxValue = minValue.negated().minus(1);
  var bigNumber = new _bignumber["default"](number);

  if (bigNumber.isGreaterThan(maxValue) || bigNumber.isLessThan(minValue)) {
    throw _constants.ERRORS.TypedError('Runtime', "Overflow when trying to convert number " + number + " into " + bytes + " bytes");
  }

  if (bigNumber.isPositive()) {
    return bigNumber;
  }

  return bigNumber.minus(minValue).minus(minValue);
}

function intToHex( // $FlowIssue bigint-unsupported, TODO: Update flow when bigint is supported
number, bytes, signed) {
  var bigNumber = new _bignumber["default"](number);

  if (signed) {
    bigNumber = twosComplement(bigNumber, bytes);
  }

  if (bigNumber.isNegative()) {
    throw _constants.ERRORS.TypedError('Runtime', "Cannot convert negative number to unsigned interger: " + number);
  }

  var hex = bigNumber.toString(16);
  var hexChars = bytes * 2;

  if (hex.length > hexChars) {
    throw _constants.ERRORS.TypedError('Runtime', "Overflow when trying to convert number " + number + " into " + bytes + " bytes");
  }

  return hex.padStart(bytes * 2, '0');
}
/**
 * Encodes the given primitive data to a big-endian hex string.
 *
 * @param typeName - Primitive Solidity data type (e.g. `uint16`)
 * @param data - The actual data to convert.
 * @returns Hex string of the data.
 */


function encodeData(typeName, data) {
  if (paramTypeBytes.test(typeName) || typeName === 'address') {
    return (0, _formatUtils.messageToHex)(data);
  }

  if (typeName === 'string') {
    return Buffer.from(data, 'utf-8').toString('hex');
  }

  var numberMatch = paramTypeNumber.exec(typeName);

  if (numberMatch) {
    var _ = numberMatch[0],
        intType = numberMatch[1],
        bits = numberMatch[2];
    var bytes = Math.ceil(parseInt(bits, 10) / 8);
    return intToHex(data, bytes, intType === 'int');
  }

  if (typeName === 'bool') {
    return data ? '01' : '00';
  } // We should be receiving only atomic, non-array types


  throw _constants.ERRORS.TypedError('Runtime', "Unsupported data type for direct field encoding: " + typeName);
} // these are simple types, so we can just do a string-match


var paramTypesMap = {
  string: _protobuf.Enum_EthereumDataType.STRING,
  bool: _protobuf.Enum_EthereumDataType.BOOL,
  address: _protobuf.Enum_EthereumDataType.ADDRESS
};
/**
 * Converts the given EIP-712 typename into a Protobuf package.
 *
 * @param typeName - The EIP-712 typename (e.g. `uint16` for simple types, `Example` for structs)
 * @param types - Map of types, required for recursive (`struct`) types.
 */

function getFieldType(typeName, types) {
  var arrayMatch = paramTypeArray.exec(typeName);

  if (arrayMatch) {
    var _ = arrayMatch[0],
        arrayItemTypeName = arrayMatch[1],
        arraySize = arrayMatch[2];
    var entryType = getFieldType(arrayItemTypeName, types);
    return {
      data_type: _protobuf.Enum_EthereumDataType.ARRAY,
      size: parseInt(arraySize, 10) || undefined,
      entry_type: entryType
    };
  }

  var numberMatch = paramTypeNumber.exec(typeName);

  if (numberMatch) {
    var _2 = numberMatch[0],
        type = numberMatch[1],
        bits = numberMatch[2];
    return {
      data_type: type === 'uint' ? _protobuf.Enum_EthereumDataType.UINT : _protobuf.Enum_EthereumDataType.INT,
      size: Math.floor(parseInt(bits, 10) / 8)
    };
  }

  var bytesMatch = paramTypeBytes.exec(typeName);

  if (bytesMatch) {
    var _3 = bytesMatch[0],
        size = bytesMatch[1];
    return {
      data_type: _protobuf.Enum_EthereumDataType.BYTES,
      size: parseInt(size, 10) || undefined
    };
  }

  var fixedSizeTypeMatch = paramTypesMap[typeName];

  if (fixedSizeTypeMatch) {
    return {
      data_type: fixedSizeTypeMatch
    };
  }

  if (typeName in types) {
    return {
      data_type: _protobuf.Enum_EthereumDataType.STRUCT,
      size: types[typeName].length,
      struct_name: typeName
    };
  }

  throw _constants.ERRORS.TypedError('Runtime', "No type definition specified: " + typeName);
}