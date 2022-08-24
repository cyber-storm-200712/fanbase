"use strict";

exports.__esModule = true;
exports.tokenBundleToProto = void 0;

var _paramsValidator = require("./paramsValidator");

var validateTokens = function validateTokens(tokenAmounts) {
  tokenAmounts.forEach(function (tokenAmount) {
    (0, _paramsValidator.validateParams)(tokenAmount, [{
      name: 'assetNameBytes',
      type: 'string',
      required: true
    }, {
      name: 'amount',
      type: 'uint'
    }, {
      name: 'mintAmount',
      type: 'uint',
      allowNegative: true
    }]);
  });
};

var validateTokenBundle = function validateTokenBundle(tokenBundle) {
  tokenBundle.forEach(function (tokenGroup) {
    (0, _paramsValidator.validateParams)(tokenGroup, [{
      name: 'policyId',
      type: 'string',
      required: true
    }, {
      name: 'tokenAmounts',
      type: 'array',
      required: true
    }]);
    validateTokens(tokenGroup.tokenAmounts);
  });
};

var tokenAmountsToProto = function tokenAmountsToProto(tokenAmounts) {
  return tokenAmounts.map(function (tokenAmount) {
    return {
      asset_name_bytes: tokenAmount.assetNameBytes,
      amount: tokenAmount.amount,
      mint_amount: tokenAmount.mintAmount
    };
  });
};

var tokenBundleToProto = function tokenBundleToProto(tokenBundle) {
  validateTokenBundle(tokenBundle);
  return tokenBundle.map(function (tokenGroup) {
    return {
      policyId: tokenGroup.policyId,
      tokens: tokenAmountsToProto(tokenGroup.tokenAmounts)
    };
  });
};

exports.tokenBundleToProto = tokenBundleToProto;