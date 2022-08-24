"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _CoinInfo = require("../../data/CoinInfo");

var _pathUtils = require("../../utils/pathUtils");

var _cardanoAuxiliaryData = require("./helpers/cardanoAuxiliaryData");

var _cardanoCertificate = require("./helpers/cardanoCertificate");

var _cardanoOutputs = require("./helpers/cardanoOutputs");

var _cardanoSignTxLegacy = require("./helpers/cardanoSignTxLegacy");

var _constants = require("../../constants");

var _protobuf = require("../../types/trezor/protobuf");

var _cardanoWitnesses = require("./helpers/cardanoWitnesses");

var _cardanoTokenBundle = require("./helpers/cardanoTokenBundle");

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// todo: remove when listed firmwares become mandatory for cardanoSignTransaction
var CardanoSignTransactionFeatures = Object.freeze({
  SignStakePoolRegistrationAsOwner: ['0', '2.3.5'],
  ValidityIntervalStart: ['0', '2.3.5'],
  MultiassetOutputs: ['0', '2.3.5'],
  AuxiliaryData: ['0', '2.3.7'],
  ZeroTTL: ['0', '2.4.2'],
  ZeroValidityIntervalStart: ['0', '2.4.2'],
  TransactionStreaming: ['0', '2.4.2'],
  AuxiliaryDataHash: ['0', '2.4.2'],
  TokenMinting: ['0', '2.4.3'],
  Multisig: ['0', '2.4.3']
});

var CardanoSignTransaction = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(CardanoSignTransaction, _AbstractMethod);

  function CardanoSignTransaction() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = CardanoSignTransaction.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read', 'write'];
    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, (0, _CoinInfo.getMiscNetwork)('Cardano'), this.firmwareRange);
    this.info = 'Sign Cardano transaction';
    var payload = this.payload; // $FlowIssue payload.metadata is a legacy param

    if (payload.metadata) {
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Metadata field has been replaced by auxiliaryData.');
    } // $FlowIssue payload.auxiliaryData.blob is a legacy param


    if (payload.auxiliaryData && payload.auxiliaryData.blob) {
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Auxiliary data can now only be sent as a hash.');
    } // validate incoming parameters


    (0, _paramsValidator.validateParams)(payload, [{
      name: 'signingMode',
      type: 'number',
      required: true
    }, {
      name: 'inputs',
      type: 'array',
      required: true
    }, {
      name: 'outputs',
      type: 'array',
      required: true,
      allowEmpty: true
    }, {
      name: 'fee',
      type: 'uint',
      required: true
    }, {
      name: 'ttl',
      type: 'uint'
    }, {
      name: 'certificates',
      type: 'array',
      allowEmpty: true
    }, {
      name: 'withdrawals',
      type: 'array',
      allowEmpty: true
    }, {
      name: 'mint',
      type: 'array',
      allowEmpty: true
    }, {
      name: 'validityIntervalStart',
      type: 'uint'
    }, {
      name: 'protocolMagic',
      type: 'number',
      required: true
    }, {
      name: 'networkId',
      type: 'number',
      required: true
    }, {
      name: 'additionalWitnessRequests',
      type: 'array',
      allowEmpty: true
    }, {
      name: 'derivationType',
      type: 'number'
    }]);
    var inputsWithPath = payload.inputs.map(function (input) {
      (0, _paramsValidator.validateParams)(input, [{
        name: 'prev_hash',
        type: 'string',
        required: true
      }, {
        name: 'prev_index',
        type: 'number',
        required: true
      }]);
      return {
        input: {
          prev_hash: input.prev_hash,
          prev_index: input.prev_index
        },
        path: input.path ? (0, _pathUtils.validatePath)(input.path, 5) : undefined
      };
    });
    var outputsWithTokens = payload.outputs.map(function (output) {
      return (0, _cardanoOutputs.transformOutput)(output);
    });
    var certificatesWithPoolOwnersAndRelays = [];

    if (payload.certificates) {
      certificatesWithPoolOwnersAndRelays = payload.certificates.map(_cardanoCertificate.transformCertificate);
    }

    var withdrawals = [];

    if (payload.withdrawals) {
      withdrawals = payload.withdrawals.map(function (withdrawal) {
        (0, _paramsValidator.validateParams)(withdrawal, [{
          name: 'amount',
          type: 'uint',
          required: true
        }, {
          name: 'scriptHash',
          type: 'string'
        }]);
        return {
          path: withdrawal.path ? (0, _pathUtils.validatePath)(withdrawal.path, 5) : undefined,
          amount: withdrawal.amount,
          script_hash: withdrawal.scriptHash
        };
      });
    }

    var mint = [];

    if (payload.mint) {
      mint = (0, _cardanoTokenBundle.tokenBundleToProto)(payload.mint);
    }

    var auxiliaryData;

    if (payload.auxiliaryData) {
      auxiliaryData = (0, _cardanoAuxiliaryData.transformAuxiliaryData)(payload.auxiliaryData);
    }

    var additionalWitnessRequests = [];

    if (payload.additionalWitnessRequests) {
      additionalWitnessRequests = payload.additionalWitnessRequests.map(function (witnessRequest) {
        return (0, _pathUtils.validatePath)(witnessRequest, 3);
      });
    }

    this.params = {
      signingMode: payload.signingMode,
      inputsWithPath: inputsWithPath,
      outputsWithTokens: outputsWithTokens,
      fee: payload.fee,
      ttl: payload.ttl,
      certificatesWithPoolOwnersAndRelays: certificatesWithPoolOwnersAndRelays,
      withdrawals: withdrawals,
      mint: mint,
      auxiliaryData: auxiliaryData,
      validityIntervalStart: payload.validityIntervalStart,
      protocolMagic: payload.protocolMagic,
      networkId: payload.networkId,
      witnessPaths: (0, _cardanoWitnesses.gatherWitnessPaths)(inputsWithPath, certificatesWithPoolOwnersAndRelays, withdrawals, additionalWitnessRequests, payload.signingMode),
      additionalWitnessRequests: additionalWitnessRequests,
      derivationType: typeof payload.derivationType !== 'undefined' ? payload.derivationType : _protobuf.Enum_CardanoDerivationType.ICARUS_TREZOR
    };
  };

  _proto._isFeatureSupported = function _isFeatureSupported(feature) {
    return this.device.atLeast(CardanoSignTransactionFeatures[feature]);
  };

  _proto._ensureFeatureIsSupported = function _ensureFeatureIsSupported(feature) {
    if (!this._isFeatureSupported(feature)) {
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', "Feature " + feature + " not supported by device firmware");
    }
  };

  _proto._ensureFirmwareSupportsParams = function _ensureFirmwareSupportsParams() {
    var _this = this;

    var params = this.params;
    params.certificatesWithPoolOwnersAndRelays.forEach(function (_ref) {
      var certificate = _ref.certificate;

      if (certificate.type === _protobuf.Enum_CardanoCertificateType.STAKE_POOL_REGISTRATION) {
        _this._ensureFeatureIsSupported('SignStakePoolRegistrationAsOwner');
      }
    });

    if (params.validityIntervalStart != null) {
      this._ensureFeatureIsSupported('ValidityIntervalStart');
    }

    params.outputsWithTokens.forEach(function (output) {
      if (output.tokenBundle && output.tokenBundle.length > 0) {
        _this._ensureFeatureIsSupported('MultiassetOutputs');
      }
    });

    if (params.auxiliaryData) {
      this._ensureFeatureIsSupported('AuxiliaryData');
    }

    if (params.ttl === '0') {
      this._ensureFeatureIsSupported('ZeroTTL');
    }

    if (params.validityIntervalStart === '0') {
      this._ensureFeatureIsSupported('ZeroValidityIntervalStart');
    }

    if (params.auxiliaryData && params.auxiliaryData.hash) {
      this._ensureFeatureIsSupported('AuxiliaryDataHash');
    }

    if (params.mint.length > 0) {
      this._ensureFeatureIsSupported('TokenMinting');
    }

    if (params.additionalWitnessRequests.length > 0 || params.signingMode === _protobuf.Enum_CardanoTxSigningMode.MULTISIG_TRANSACTION) {
      this._ensureFeatureIsSupported('Multisig');
    }
  };

  _proto._sign_tx = /*#__PURE__*/function () {
    var _sign_tx2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var typedCall, hasAuxiliaryData, signTxInitMessage, _iterator, _step, input, _iterator2, _step2, _step2$value, output, tokenBundle, _iterator8, _step8, _assetGroup, _iterator9, _step9, _token, _iterator3, _step3, _step3$value, certificate, poolOwners, poolRelays, _iterator10, _step10, poolOwner, _iterator11, _step11, poolRelay, _iterator4, _step4, withdrawal, auxiliaryDataSupplement, catalyst_registration_parameters, _yield$typedCall, message, auxiliaryDataType, _iterator5, _step5, assetGroup, _iterator6, _step6, token, witnesses, _iterator7, _step7, path, _yield$typedCall3, _message, _yield$typedCall2, txBodyHashMessage;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              typedCall = this.device.getCommands().typedCall.bind(this.device.getCommands());
              hasAuxiliaryData = !!this.params.auxiliaryData;
              signTxInitMessage = {
                signing_mode: this.params.signingMode,
                protocol_magic: this.params.protocolMagic,
                network_id: this.params.networkId,
                inputs_count: this.params.inputsWithPath.length,
                outputs_count: this.params.outputsWithTokens.length,
                fee: this.params.fee,
                ttl: this.params.ttl,
                certificates_count: this.params.certificatesWithPoolOwnersAndRelays.length,
                withdrawals_count: this.params.withdrawals.length,
                has_auxiliary_data: hasAuxiliaryData,
                validity_interval_start: this.params.validityIntervalStart,
                witness_requests_count: this.params.witnessPaths.length,
                minting_asset_groups_count: this.params.mint.length,
                derivation_type: this.params.derivationType
              }; // init

              _context.next = 5;
              return typedCall('CardanoSignTxInit', 'CardanoTxItemAck', signTxInitMessage);

            case 5:
              _iterator = _createForOfIteratorHelperLoose(this.params.inputsWithPath);

            case 6:
              if ((_step = _iterator()).done) {
                _context.next = 12;
                break;
              }

              input = _step.value.input;
              _context.next = 10;
              return typedCall('CardanoTxInput', 'CardanoTxItemAck', input);

            case 10:
              _context.next = 6;
              break;

            case 12:
              _iterator2 = _createForOfIteratorHelperLoose(this.params.outputsWithTokens);

            case 13:
              if ((_step2 = _iterator2()).done) {
                _context.next = 34;
                break;
              }

              _step2$value = _step2.value, output = _step2$value.output, tokenBundle = _step2$value.tokenBundle;
              _context.next = 17;
              return typedCall('CardanoTxOutput', 'CardanoTxItemAck', output);

            case 17:
              if (!tokenBundle) {
                _context.next = 32;
                break;
              }

              _iterator8 = _createForOfIteratorHelperLoose(tokenBundle);

            case 19:
              if ((_step8 = _iterator8()).done) {
                _context.next = 32;
                break;
              }

              _assetGroup = _step8.value;
              _context.next = 23;
              return typedCall('CardanoAssetGroup', 'CardanoTxItemAck', {
                policy_id: _assetGroup.policyId,
                tokens_count: _assetGroup.tokens.length
              });

            case 23:
              _iterator9 = _createForOfIteratorHelperLoose(_assetGroup.tokens);

            case 24:
              if ((_step9 = _iterator9()).done) {
                _context.next = 30;
                break;
              }

              _token = _step9.value;
              _context.next = 28;
              return typedCall('CardanoToken', 'CardanoTxItemAck', _token);

            case 28:
              _context.next = 24;
              break;

            case 30:
              _context.next = 19;
              break;

            case 32:
              _context.next = 13;
              break;

            case 34:
              _iterator3 = _createForOfIteratorHelperLoose(this.params.certificatesWithPoolOwnersAndRelays);

            case 35:
              if ((_step3 = _iterator3()).done) {
                _context.next = 55;
                break;
              }

              _step3$value = _step3.value, certificate = _step3$value.certificate, poolOwners = _step3$value.poolOwners, poolRelays = _step3$value.poolRelays;
              _context.next = 39;
              return typedCall('CardanoTxCertificate', 'CardanoTxItemAck', certificate);

            case 39:
              _iterator10 = _createForOfIteratorHelperLoose(poolOwners);

            case 40:
              if ((_step10 = _iterator10()).done) {
                _context.next = 46;
                break;
              }

              poolOwner = _step10.value;
              _context.next = 44;
              return typedCall('CardanoPoolOwner', 'CardanoTxItemAck', poolOwner);

            case 44:
              _context.next = 40;
              break;

            case 46:
              _iterator11 = _createForOfIteratorHelperLoose(poolRelays);

            case 47:
              if ((_step11 = _iterator11()).done) {
                _context.next = 53;
                break;
              }

              poolRelay = _step11.value;
              _context.next = 51;
              return typedCall('CardanoPoolRelayParameters', 'CardanoTxItemAck', poolRelay);

            case 51:
              _context.next = 47;
              break;

            case 53:
              _context.next = 35;
              break;

            case 55:
              _iterator4 = _createForOfIteratorHelperLoose(this.params.withdrawals);

            case 56:
              if ((_step4 = _iterator4()).done) {
                _context.next = 62;
                break;
              }

              withdrawal = _step4.value;
              _context.next = 60;
              return typedCall('CardanoTxWithdrawal', 'CardanoTxItemAck', withdrawal);

            case 60:
              _context.next = 56;
              break;

            case 62:
              if (!this.params.auxiliaryData) {
                _context.next = 73;
                break;
              }

              catalyst_registration_parameters = this.params.auxiliaryData.catalyst_registration_parameters;

              if (catalyst_registration_parameters) {
                this.params.auxiliaryData = (0, _cardanoAuxiliaryData.modifyAuxiliaryDataForBackwardsCompatibility)(this.device, this.params.auxiliaryData);
              }

              _context.next = 67;
              return typedCall('CardanoTxAuxiliaryData', 'CardanoTxAuxiliaryDataSupplement', this.params.auxiliaryData);

            case 67:
              _yield$typedCall = _context.sent;
              message = _yield$typedCall.message;
              auxiliaryDataType = _protobuf.Enum_CardanoTxAuxiliaryDataSupplementType[message.type];

              if (auxiliaryDataType !== _protobuf.Enum_CardanoTxAuxiliaryDataSupplementType.NONE) {
                auxiliaryDataSupplement = {
                  type: auxiliaryDataType,
                  auxiliaryDataHash: message.auxiliary_data_hash,
                  catalystSignature: message.catalyst_signature
                };
              }

              _context.next = 73;
              return typedCall('CardanoTxHostAck', 'CardanoTxItemAck');

            case 73:
              if (!(this.params.mint.length > 0)) {
                _context.next = 90;
                break;
              }

              _context.next = 76;
              return typedCall('CardanoTxMint', 'CardanoTxItemAck', {
                asset_groups_count: this.params.mint.length
              });

            case 76:
              _iterator5 = _createForOfIteratorHelperLoose(this.params.mint);

            case 77:
              if ((_step5 = _iterator5()).done) {
                _context.next = 90;
                break;
              }

              assetGroup = _step5.value;
              _context.next = 81;
              return typedCall('CardanoAssetGroup', 'CardanoTxItemAck', {
                policy_id: assetGroup.policyId,
                tokens_count: assetGroup.tokens.length
              });

            case 81:
              _iterator6 = _createForOfIteratorHelperLoose(assetGroup.tokens);

            case 82:
              if ((_step6 = _iterator6()).done) {
                _context.next = 88;
                break;
              }

              token = _step6.value;
              _context.next = 86;
              return typedCall('CardanoToken', 'CardanoTxItemAck', token);

            case 86:
              _context.next = 82;
              break;

            case 88:
              _context.next = 77;
              break;

            case 90:
              // witnesses
              witnesses = [];
              _iterator7 = _createForOfIteratorHelperLoose(this.params.witnessPaths);

            case 92:
              if ((_step7 = _iterator7()).done) {
                _context.next = 101;
                break;
              }

              path = _step7.value;
              _context.next = 96;
              return typedCall('CardanoTxWitnessRequest', 'CardanoTxWitnessResponse', {
                path: path
              });

            case 96:
              _yield$typedCall3 = _context.sent;
              _message = _yield$typedCall3.message;
              witnesses.push({
                type: _protobuf.Enum_CardanoTxWitnessType[_message.type],
                pubKey: _message.pub_key,
                signature: _message.signature,
                chainCode: _message.chain_code
              });

            case 99:
              _context.next = 92;
              break;

            case 101:
              _context.next = 103;
              return typedCall('CardanoTxHostAck', 'CardanoTxBodyHash');

            case 103:
              _yield$typedCall2 = _context.sent;
              txBodyHashMessage = _yield$typedCall2.message;
              _context.next = 107;
              return typedCall('CardanoTxHostAck', 'CardanoSignTxFinished');

            case 107:
              return _context.abrupt("return", {
                hash: txBodyHashMessage.tx_hash,
                witnesses: witnesses,
                auxiliaryDataSupplement: auxiliaryDataSupplement
              });

            case 108:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function _sign_tx() {
      return _sign_tx2.apply(this, arguments);
    }

    return _sign_tx;
  }();

  _proto._sign_tx_legacy = /*#__PURE__*/function () {
    var _sign_tx_legacy2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var typedCall, legacyParams, serializedTx, _yield$typedCall4, type, message, _yield$typedCall5;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              typedCall = this.device.getCommands().typedCall.bind(this.device.getCommands());
              legacyParams = (0, _cardanoSignTxLegacy.toLegacyParams)(this.device, this.params);
              serializedTx = '';
              _context2.next = 5;
              return typedCall('CardanoSignTx', 'CardanoSignedTx|CardanoSignedTxChunk', legacyParams);

            case 5:
              _yield$typedCall4 = _context2.sent;
              type = _yield$typedCall4.type;
              message = _yield$typedCall4.message;

            case 8:
              if (!(type === 'CardanoSignedTxChunk')) {
                _context2.next = 17;
                break;
              }

              serializedTx += message.signed_tx_chunk;
              _context2.next = 12;
              return typedCall('CardanoSignedTxChunkAck', 'CardanoSignedTx|CardanoSignedTxChunk');

            case 12:
              _yield$typedCall5 = _context2.sent;
              type = _yield$typedCall5.type;
              message = _yield$typedCall5.message;
              _context2.next = 8;
              break;

            case 17:
              // this is required for backwards compatibility for FW <= 2.3.6 when the tx was not sent in chunks yet
              if (message.serialized_tx) {
                serializedTx += message.serialized_tx;
              }

              return _context2.abrupt("return", (0, _cardanoSignTxLegacy.legacySerializedTxToResult)(message.tx_hash, serializedTx));

            case 19:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function _sign_tx_legacy() {
      return _sign_tx_legacy2.apply(this, arguments);
    }

    return _sign_tx_legacy;
  }();

  _proto.run = function run() {
    this._ensureFirmwareSupportsParams();

    if (!this._isFeatureSupported('TransactionStreaming')) {
      return this._sign_tx_legacy();
    }

    return this._sign_tx();
  };

  return CardanoSignTransaction;
}(_AbstractMethod2["default"]);

exports["default"] = CardanoSignTransaction;