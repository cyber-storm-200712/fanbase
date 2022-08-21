"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.modifyAuxiliaryDataForBackwardsCompatibility = exports.transformAuxiliaryData = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _cardanoAddressParameters = require("./cardanoAddressParameters");

var _paramsValidator = require("./paramsValidator");

var _pathUtils = require("../../../utils/pathUtils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var transformCatalystRegistrationParameters = function transformCatalystRegistrationParameters(catalystRegistrationParameters) {
  (0, _paramsValidator.validateParams)(catalystRegistrationParameters, [{
    name: 'votingPublicKey',
    type: 'string',
    required: true
  }, {
    name: 'stakingPath',
    required: true
  }, {
    name: 'nonce',
    type: 'uint',
    required: true
  }]);
  (0, _cardanoAddressParameters.validateAddressParameters)(catalystRegistrationParameters.rewardAddressParameters);
  return {
    voting_public_key: catalystRegistrationParameters.votingPublicKey,
    staking_path: (0, _pathUtils.validatePath)(catalystRegistrationParameters.stakingPath, 3),
    reward_address_parameters: (0, _cardanoAddressParameters.addressParametersToProto)(catalystRegistrationParameters.rewardAddressParameters),
    nonce: catalystRegistrationParameters.nonce
  };
};

var transformAuxiliaryData = function transformAuxiliaryData(auxiliaryData) {
  (0, _paramsValidator.validateParams)(auxiliaryData, [{
    name: 'hash',
    type: 'string'
  }]);
  var catalystRegistrationParameters;

  if (auxiliaryData.catalystRegistrationParameters) {
    catalystRegistrationParameters = transformCatalystRegistrationParameters(auxiliaryData.catalystRegistrationParameters);
  }

  return {
    hash: auxiliaryData.hash,
    catalyst_registration_parameters: catalystRegistrationParameters
  };
};

exports.transformAuxiliaryData = transformAuxiliaryData;

var modifyAuxiliaryDataForBackwardsCompatibility = function modifyAuxiliaryDataForBackwardsCompatibility(device, auxiliary_data) {
  var catalyst_registration_parameters = auxiliary_data.catalyst_registration_parameters;

  if (catalyst_registration_parameters) {
    catalyst_registration_parameters.reward_address_parameters = (0, _cardanoAddressParameters.modifyAddressParametersForBackwardsCompatibility)(device, catalyst_registration_parameters.reward_address_parameters);
    return _objectSpread(_objectSpread({}, auxiliary_data), {}, {
      catalyst_registration_parameters: catalyst_registration_parameters
    });
  }

  return auxiliary_data;
};

exports.modifyAuxiliaryDataForBackwardsCompatibility = modifyAuxiliaryDataForBackwardsCompatibility;