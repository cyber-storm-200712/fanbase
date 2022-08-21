"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.addressParametersFromProto = exports.addressParametersToProto = exports.modifyAddressParametersForBackwardsCompatibility = exports.validateAddressParameters = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _paramsValidator = require("./paramsValidator");

var _pathUtils = require("../../../utils/pathUtils");

var _constants = require("../../../constants");

var _cardano = require("../../../types/networks/cardano");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var validateAddressParameters = function validateAddressParameters(addressParameters) {
  (0, _paramsValidator.validateParams)(addressParameters, [{
    name: 'addressType',
    type: 'number',
    required: true
  }, {
    name: 'stakingKeyHash',
    type: 'string'
  }, {
    name: 'paymentScriptHash',
    type: 'string'
  }, {
    name: 'stakingScriptHash',
    type: 'string'
  }]);

  if (addressParameters.path) {
    (0, _pathUtils.validatePath)(addressParameters.path);
  }

  if (addressParameters.stakingPath) {
    (0, _pathUtils.validatePath)(addressParameters.stakingPath);
  }

  if (addressParameters.certificatePointer) {
    (0, _paramsValidator.validateParams)(addressParameters.certificatePointer, [{
      name: 'blockIndex',
      type: 'number',
      required: true
    }, {
      name: 'txIndex',
      type: 'number',
      required: true
    }, {
      name: 'certificateIndex',
      type: 'number',
      required: true
    }]);
  }
};

exports.validateAddressParameters = validateAddressParameters;

var modifyAddressParametersForBackwardsCompatibility = function modifyAddressParametersForBackwardsCompatibility(device, address_parameters) {
  if (address_parameters.address_type === _cardano.CardanoAddressType.REWARD) {
    // older firmware expects reward address path in path field instead of staking path
    var address_n = address_parameters.address_n,
        address_n_staking = address_parameters.address_n_staking;

    if (address_n.length > 0 && address_n_staking.length > 0) {
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', "Only stakingPath is allowed for CardanoAddressType.REWARD");
    }

    if (device.atLeast(['0', '2.4.3'])) {
      if (address_n.length > 0) {
        address_n_staking = address_n;
        address_n = [];
      }
    } else if (address_n_staking.length > 0) {
      address_n = address_n_staking;
      address_n_staking = [];
    }

    return _objectSpread(_objectSpread({}, address_parameters), {}, {
      address_n: address_n,
      address_n_staking: address_n_staking
    });
  }

  return address_parameters;
};

exports.modifyAddressParametersForBackwardsCompatibility = modifyAddressParametersForBackwardsCompatibility;

var addressParametersToProto = function addressParametersToProto(addressParameters) {
  var path = [];

  if (addressParameters.path) {
    path = (0, _pathUtils.validatePath)(addressParameters.path, 3);
  }

  var stakingPath = [];

  if (addressParameters.stakingPath) {
    stakingPath = (0, _pathUtils.validatePath)(addressParameters.stakingPath, 3);
  }

  var certificatePointer;

  if (addressParameters.certificatePointer) {
    certificatePointer = {
      block_index: addressParameters.certificatePointer.blockIndex,
      tx_index: addressParameters.certificatePointer.txIndex,
      certificate_index: addressParameters.certificatePointer.certificateIndex
    };
  }

  return {
    address_type: addressParameters.addressType,
    address_n: path,
    address_n_staking: stakingPath,
    staking_key_hash: addressParameters.stakingKeyHash,
    certificate_pointer: certificatePointer,
    script_payment_hash: addressParameters.paymentScriptHash,
    script_staking_hash: addressParameters.stakingScriptHash
  };
};

exports.addressParametersToProto = addressParametersToProto;

var addressParametersFromProto = function addressParametersFromProto(addressParameters) {
  var certificatePointer;

  if (addressParameters.certificate_pointer) {
    certificatePointer = {
      blockIndex: addressParameters.certificate_pointer.block_index,
      txIndex: addressParameters.certificate_pointer.tx_index,
      certificateIndex: addressParameters.certificate_pointer.certificate_index
    };
  }

  return {
    addressType: addressParameters.address_type,
    path: addressParameters.address_n,
    stakingPath: addressParameters.address_n_staking,
    stakingKeyHash: addressParameters.staking_key_hash,
    certificatePointer: certificatePointer
  };
};

exports.addressParametersFromProto = addressParametersFromProto;