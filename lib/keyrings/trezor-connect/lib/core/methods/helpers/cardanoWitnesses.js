"use strict";

exports.__esModule = true;
exports.gatherWitnessPaths = void 0;

var _protobuf = require("../../../types/trezor/protobuf");

var gatherWitnessPaths = function gatherWitnessPaths(inputsWithPath, certificatesWithPoolOwnersAndRelays, withdrawals, additionalWitnessRequests, signingMode) {
  var witnessPaths = new Map();

  function _insert(path) {
    var pathKey = JSON.stringify(path);
    witnessPaths.set(pathKey, path);
  }

  if (signingMode !== _protobuf.Enum_CardanoTxSigningMode.MULTISIG_TRANSACTION) {
    inputsWithPath.forEach(function (_ref) {
      var path = _ref.path;
      if (path) _insert(path);
    });
    certificatesWithPoolOwnersAndRelays.forEach(function (_ref2) {
      var certificate = _ref2.certificate,
          poolOwners = _ref2.poolOwners;

      if (certificate.path && (certificate.type === _protobuf.Enum_CardanoCertificateType.STAKE_DELEGATION || certificate.type === _protobuf.Enum_CardanoCertificateType.STAKE_DEREGISTRATION)) {
        _insert(certificate.path);
      }

      poolOwners.forEach(function (poolOwner) {
        if (poolOwner.staking_key_path) {
          _insert(poolOwner.staking_key_path);
        }
      });
    });
    withdrawals.forEach(function (_ref3) {
      var path = _ref3.path;

      if (path) {
        _insert(path);
      }
    });
  }

  additionalWitnessRequests.forEach(function (path) {
    _insert(path);
  });
  return Array.from(witnessPaths.values());
};

exports.gatherWitnessPaths = gatherWitnessPaths;