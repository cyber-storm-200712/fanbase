"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.legacySerializedTxToResult = exports.toLegacyParams = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var cbor = _interopRequireWildcard(require("cbor-web"));

var _constants = require("../../../constants");

var _protobuf = require("../../../types/trezor/protobuf");

var _cardanoAuxiliaryData = require("./cardanoAuxiliaryData");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var METADATA_HASH_KEY = 7;
var SHELLEY_WITNESSES_KEY = 0;
var BYRON_WITNESSES_KEY = 2;
var CATALYST_REGISTRATION_SIGNATURE_ENTRY_KEY = 61285;
var CATALYST_REGISTRATION_SIGNATURE_KEY = 1;

var toLegacyParams = function toLegacyParams(device, params) {
  return {
    inputs: params.inputsWithPath.map(function (_ref) {
      var input = _ref.input,
          path = _ref.path;
      return _objectSpread(_objectSpread({}, input), {}, {
        address_n: path
      });
    }),
    outputs: params.outputsWithTokens.map(function (_ref2) {
      var output = _ref2.output,
          tokenBundle = _ref2.tokenBundle;
      return _objectSpread(_objectSpread({}, output), {}, {
        token_bundle: tokenBundle ? tokenBundle.map(function (assetGroup) {
          return {
            policy_id: assetGroup.policyId,
            tokens: assetGroup.tokens.map(function (token) {
              if (!token.amount) {
                throw _constants.ERRORS.TypedError('Method_InvalidParameter', "Tokens must contain an amount for legacy firmware");
              }

              return {
                asset_name_bytes: token.asset_name_bytes,
                amount: token.amount
              };
            })
          };
        }) : [],
        asset_groups_count: undefined
      });
    }),
    fee: params.fee,
    ttl: params.ttl,
    certificates: params.certificatesWithPoolOwnersAndRelays.map(function (_ref3) {
      var certificate = _ref3.certificate,
          poolOwners = _ref3.poolOwners,
          poolRelays = _ref3.poolRelays;
      return _objectSpread(_objectSpread({}, certificate), {}, {
        pool_parameters: certificate.pool_parameters ? _objectSpread(_objectSpread({}, certificate.pool_parameters), {}, {
          owners: poolOwners,
          relays: poolRelays
        }) : undefined
      });
    }),
    withdrawals: params.withdrawals.map(function (withdrawal) {
      if (!withdrawal.path) {
        throw _constants.ERRORS.TypedError('Method_InvalidParameter', "Withdrawal must contain a path for legacy firmware");
      }

      return {
        path: withdrawal.path,
        amount: withdrawal.amount
      };
    }),
    auxiliary_data: params.auxiliaryData ? {
      catalyst_registration_parameters: params.auxiliaryData.catalyst_registration_parameters ? (0, _cardanoAuxiliaryData.modifyAuxiliaryDataForBackwardsCompatibility)(device, params.auxiliaryData).catalyst_registration_parameters : undefined
    } : undefined,
    validity_interval_start: params.validityIntervalStart,
    protocol_magic: params.protocolMagic,
    network_id: params.networkId
  };
};

exports.toLegacyParams = toLegacyParams;

var _transformShelleyWitnesses = function _transformShelleyWitnesses(deserializedWitnesses) {
  if (!deserializedWitnesses.has(SHELLEY_WITNESSES_KEY)) {
    return [];
  }

  return deserializedWitnesses.get(SHELLEY_WITNESSES_KEY).map(function (witness) {
    var pubKeyBytes = witness[0],
        signatureBytes = witness[1];
    return {
      type: _protobuf.Enum_CardanoTxWitnessType.SHELLEY_WITNESS,
      pubKey: Buffer.from(pubKeyBytes).toString('hex'),
      signature: Buffer.from(signatureBytes).toString('hex'),
      chainCode: null
    };
  });
};

var _transformByronWitnesses = function _transformByronWitnesses(deserializedWitnesses) {
  if (!deserializedWitnesses.has(BYRON_WITNESSES_KEY)) {
    return [];
  }

  return deserializedWitnesses.get(BYRON_WITNESSES_KEY).map(function (witness) {
    var pubKeyBytes = witness[0],
        signatureBytes = witness[1],
        chainCodeBytes = witness[2];
    return {
      type: _protobuf.Enum_CardanoTxWitnessType.BYRON_WITNESS,
      pubKey: Buffer.from(pubKeyBytes).toString('hex'),
      signature: Buffer.from(signatureBytes).toString('hex'),
      chainCode: Buffer.from(chainCodeBytes).toString('hex')
    };
  });
};

var _transformAuxiliaryData = function _transformAuxiliaryData(txBody, auxiliaryData) {
  // Legacy firmware only supported catalyst registration auxiliary data so try to parse it.
  // If it fails, then no supplement is needed.
  try {
    var maybeCatalystRegistration = auxiliaryData[0];
    return {
      type: _protobuf.Enum_CardanoTxAuxiliaryDataSupplementType.CATALYST_REGISTRATION_SIGNATURE,
      auxiliaryDataHash: Buffer.from(txBody.get(METADATA_HASH_KEY)).toString('hex'),
      catalystSignature: Buffer.from(maybeCatalystRegistration.get(CATALYST_REGISTRATION_SIGNATURE_ENTRY_KEY).get(CATALYST_REGISTRATION_SIGNATURE_KEY)).toString('hex')
    };
  } catch (e) {
    return undefined;
  }
};

var legacySerializedTxToResult = function legacySerializedTxToResult(txHash, serializedTx) {
  var _cbor$decode = cbor.decode(serializedTx),
      txBody = _cbor$decode[0],
      deserializedWitnesses = _cbor$decode[1],
      auxiliaryData = _cbor$decode[2];

  var shelleyWitnesses = _transformShelleyWitnesses(deserializedWitnesses);

  var byronWitnesses = _transformByronWitnesses(deserializedWitnesses);

  var witnesses = shelleyWitnesses.concat(byronWitnesses);

  var auxiliaryDataSupplement = _transformAuxiliaryData(txBody, auxiliaryData);

  return {
    hash: txHash,
    witnesses: witnesses,
    auxiliaryDataSupplement: auxiliaryDataSupplement
  };
};

exports.legacySerializedTxToResult = legacySerializedTxToResult;