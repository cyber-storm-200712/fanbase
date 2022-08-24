"use strict";

exports.__esModule = true;
exports.transformOutput = void 0;

var _paramsValidator = require("./paramsValidator");

var _cardanoAddressParameters = require("./cardanoAddressParameters");

var _cardanoTokenBundle = require("./cardanoTokenBundle");

var transformOutput = function transformOutput(output) {
  (0, _paramsValidator.validateParams)(output, [{
    name: 'address',
    type: 'string'
  }, {
    name: 'amount',
    type: 'uint',
    required: true
  }, {
    name: 'tokenBundle',
    type: 'array',
    allowEmpty: true
  }]);
  var result = {
    output: {
      amount: output.amount,
      asset_groups_count: 0
    }
  };

  if (output.addressParameters) {
    (0, _cardanoAddressParameters.validateAddressParameters)(output.addressParameters);
    result.output.address_parameters = (0, _cardanoAddressParameters.addressParametersToProto)(output.addressParameters);
  } else {
    result.output.address = output.address;
  }

  if (output.tokenBundle) {
    result.tokenBundle = (0, _cardanoTokenBundle.tokenBundleToProto)(output.tokenBundle);
    result.output.asset_groups_count = result.tokenBundle.length;
  } else {
    result.output.asset_groups_count = 0;
  }

  return result;
};

exports.transformOutput = transformOutput;