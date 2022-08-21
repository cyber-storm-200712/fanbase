"use strict";

exports.__esModule = true;
exports.createTx = exports.NEM_SUPPLY_CHANGE = exports.NEM_MOSAIC_CREATION = exports.NEM_PROVISION_NAMESPACE = exports.NEM_MULTISIG = exports.NEM_MULTISIG_SIGNATURE = exports.NEM_AGGREGATE_MODIFICATION = exports.NEM_IMPORTANCE_TRANSFER = exports.NEM_COSIGNING = exports.NEM_TRANSFER = exports.NETWORKS = exports.NEM_MIJIN = exports.NEM_TESTNET = exports.NEM_MAINNET = void 0;

var _constants = require("../../../constants");

var $T = _interopRequireWildcard(require("../../../types/networks/nem"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var NEM_MAINNET = 0x68;
exports.NEM_MAINNET = NEM_MAINNET;
var NEM_TESTNET = 0x98;
exports.NEM_TESTNET = NEM_TESTNET;
var NEM_MIJIN = 0x60;
exports.NEM_MIJIN = NEM_MIJIN;
var NETWORKS = {
  mainnet: NEM_MAINNET,
  testnet: NEM_TESTNET,
  mijin: NEM_MIJIN
};
exports.NETWORKS = NETWORKS;
var NEM_TRANSFER = 0x0101;
exports.NEM_TRANSFER = NEM_TRANSFER;
var NEM_COSIGNING = 0x0102;
exports.NEM_COSIGNING = NEM_COSIGNING;
var NEM_IMPORTANCE_TRANSFER = 0x0801;
exports.NEM_IMPORTANCE_TRANSFER = NEM_IMPORTANCE_TRANSFER;
var NEM_AGGREGATE_MODIFICATION = 0x1001;
exports.NEM_AGGREGATE_MODIFICATION = NEM_AGGREGATE_MODIFICATION;
var NEM_MULTISIG_SIGNATURE = 0x1002;
exports.NEM_MULTISIG_SIGNATURE = NEM_MULTISIG_SIGNATURE;
var NEM_MULTISIG = 0x1004;
exports.NEM_MULTISIG = NEM_MULTISIG;
var NEM_PROVISION_NAMESPACE = 0x2001;
exports.NEM_PROVISION_NAMESPACE = NEM_PROVISION_NAMESPACE;
var NEM_MOSAIC_CREATION = 0x4001;
exports.NEM_MOSAIC_CREATION = NEM_MOSAIC_CREATION;
var NEM_SUPPLY_CHANGE = 0x4002;
exports.NEM_SUPPLY_CHANGE = NEM_SUPPLY_CHANGE;
var NEM_MOSAIC_LEVY_TYPES = {
  '1': 'MosaicLevy_Absolute',
  '2': 'MosaicLevy_Percentile'
};
var NEM_SUPPLY_CHANGE_TYPES = {
  '1': 'SupplyChange_Increase',
  '2': 'SupplyChange_Decrease'
};
var NEM_AGGREGATE_MODIFICATION_TYPES = {
  '1': 'CosignatoryModification_Add',
  '2': 'CosignatoryModification_Delete'
};
var NEM_IMPORTANCE_TRANSFER_MODES = {
  '1': 'ImportanceTransfer_Activate',
  '2': 'ImportanceTransfer_Deactivate'
};

var getCommon = function getCommon(tx, address_n) {
  return {
    address_n: address_n,
    network: tx.version >> 24 & 0xff,
    timestamp: tx.timeStamp,
    fee: tx.fee,
    deadline: tx.deadline,
    signer: address_n ? undefined : tx.signer
  };
};

var transferMessage = function transferMessage(tx) {
  var mosaics = tx.mosaics ? tx.mosaics.map(function (mosaic) {
    return {
      namespace: mosaic.mosaicId.namespaceId,
      mosaic: mosaic.mosaicId.name,
      quantity: mosaic.quantity
    };
  }) : undefined;
  return {
    recipient: tx.recipient,
    amount: tx.amount,
    payload: tx.message ? tx.message.payload : undefined,
    public_key: tx.message && tx.message.type === 0x02 ? tx.message.publicKey : undefined,
    mosaics: mosaics
  };
};

var importanceTransferMessage = function importanceTransferMessage(tx) {
  return {
    mode: NEM_IMPORTANCE_TRANSFER_MODES[tx.importanceTransfer.mode],
    public_key: tx.importanceTransfer.publicKey
  };
};

var aggregateModificationMessage = function aggregateModificationMessage(tx) {
  var modifications = tx.modifications ? tx.modifications.map(function (modification) {
    return {
      type: NEM_AGGREGATE_MODIFICATION_TYPES[modification.modificationType],
      public_key: modification.cosignatoryAccount
    };
  }) : undefined;
  return {
    modifications: modifications,
    relative_change: tx.minCosignatories.relativeChange
  };
};

var provisionNamespaceMessage = function provisionNamespaceMessage(tx) {
  return {
    namespace: tx.newPart,
    parent: tx.parent || undefined,
    sink: tx.rentalFeeSink,
    fee: tx.rentalFee
  };
};

var mosaicCreationMessage = function mosaicCreationMessage(tx) {
  var levy = tx.mosaicDefinition.levy;
  var definition = {
    namespace: tx.mosaicDefinition.id.namespaceId,
    mosaic: tx.mosaicDefinition.id.name,
    levy: levy && levy.type ? NEM_MOSAIC_LEVY_TYPES[levy.type] : undefined,
    fee: levy && levy.fee,
    levy_address: levy && levy.recipient,
    levy_namespace: levy && levy.mosaicId && levy.mosaicId.namespaceId,
    levy_mosaic: levy && levy.mosaicId && levy.mosaicId.name,
    description: tx.mosaicDefinition.description
  };
  var properties = tx.mosaicDefinition.properties;

  if (Array.isArray(properties)) {
    properties.forEach(function (property) {
      var name = property.name,
          value = property.value;

      switch (name) {
        case 'divisibility':
          definition.divisibility = parseInt(value, 10);
          break;

        case 'initialSupply':
          definition.supply = parseInt(value, 10);
          break;

        case 'supplyMutable':
          definition.mutable_supply = value === 'true';
          break;

        case 'transferable':
          definition.transferable = value === 'true';
          break;
        // no default
      }
    });
  }

  return {
    definition: definition,
    sink: tx.creationFeeSink,
    fee: tx.creationFee
  };
};

var supplyChangeMessage = function supplyChangeMessage(tx) {
  return {
    namespace: tx.mosaicId.namespaceId,
    mosaic: tx.mosaicId.name,
    type: NEM_SUPPLY_CHANGE_TYPES[tx.supplyType],
    delta: tx.delta
  };
};

var createTx = function createTx(tx, address_n) {
  var transaction = tx;
  var message = {
    transaction: getCommon(tx, address_n),
    transfer: undefined,
    importance_transfer: undefined,
    aggregate_modification: undefined,
    provision_namespace: undefined,
    mosaic_creation: undefined,
    supply_change: undefined
  };

  if (tx.type === NEM_COSIGNING || tx.type === NEM_MULTISIG || tx.type === NEM_MULTISIG_SIGNATURE) {
    message.cosigning = tx.type === NEM_COSIGNING || tx.type === NEM_MULTISIG_SIGNATURE;
    transaction = tx.otherTrans;
    message.multisig = getCommon(transaction);
  }

  switch (transaction.type) {
    case NEM_TRANSFER:
      message.transfer = transferMessage(transaction);
      break;

    case NEM_IMPORTANCE_TRANSFER:
      message.importance_transfer = importanceTransferMessage(transaction);
      break;

    case NEM_AGGREGATE_MODIFICATION:
      message.aggregate_modification = aggregateModificationMessage(transaction);
      break;

    case NEM_PROVISION_NAMESPACE:
      message.provision_namespace = provisionNamespaceMessage(transaction);
      break;

    case NEM_MOSAIC_CREATION:
      message.mosaic_creation = mosaicCreationMessage(transaction);
      break;

    case NEM_SUPPLY_CHANGE:
      message.supply_change = supplyChangeMessage(transaction);
      break;

    default:
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Unknown transaction type');
  }

  return message;
};

exports.createTx = createTx;