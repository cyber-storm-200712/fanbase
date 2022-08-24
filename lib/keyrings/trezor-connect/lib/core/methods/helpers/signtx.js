"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _constants = require("../../../constants");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var requestPrevTxInfo = function requestPrevTxInfo(_ref) {
  var typedCall = _ref.typedCall,
      _ref$txRequest = _ref.txRequest,
      request_type = _ref$txRequest.request_type,
      details = _ref$txRequest.details,
      refTxs = _ref.refTxs;
  var tx_hash = details.tx_hash;

  if (!tx_hash) {
    throw _constants.ERRORS.TypedError('Runtime', 'requestPrevTxInfo: unknown details.tx_hash');
  }

  var tx = refTxs[tx_hash.toLowerCase()];

  if (!tx) {
    throw _constants.ERRORS.TypedError('Runtime', "requestPrevTxInfo: Requested unknown tx: " + tx_hash);
  }

  if (request_type === 'TXINPUT') {
    // bin_outputs not present in tx = invalid RefTransaction object
    if (!tx.bin_outputs) throw _constants.ERRORS.TypedError('Runtime', "requestPrevTxInfo: Requested unknown TXINPUT: " + tx_hash);
    return typedCall('TxAckPrevInput', 'TxRequest', {
      tx: {
        input: tx.inputs[details.request_index]
      }
    });
  }

  if (request_type === 'TXOUTPUT') {
    // bin_outputs not present in tx = invalid RefTransaction object
    if (!tx.bin_outputs) throw _constants.ERRORS.TypedError('Runtime', "requestPrevTxInfo: Requested unknown TXOUTPUT: " + tx_hash);
    return typedCall('TxAckPrevOutput', 'TxRequest', {
      tx: {
        output: tx.bin_outputs[details.request_index]
      }
    });
  }

  if (request_type === 'TXORIGINPUT') {
    // outputs not present in tx = invalid RefTransaction object
    if (!tx.outputs) throw _constants.ERRORS.TypedError('Runtime', "requestPrevTxInfo: Requested unknown TXORIGINPUT: " + tx_hash);
    return typedCall('TxAckInput', 'TxRequest', {
      tx: {
        input: tx.inputs[details.request_index]
      }
    });
  }

  if (request_type === 'TXORIGOUTPUT') {
    // outputs not present in tx = invalid RefTransaction object
    if (!tx.outputs) throw _constants.ERRORS.TypedError('Runtime', "requestPrevTxInfo: Requested unknown TXORIGOUTPUT: " + tx_hash);
    return typedCall('TxAckOutput', 'TxRequest', {
      tx: {
        output: tx.outputs[details.request_index]
      }
    });
  }

  if (request_type === 'TXEXTRADATA') {
    if (typeof details.extra_data_len !== 'number') {
      throw _constants.ERRORS.TypedError('Runtime', 'requestPrevTxInfo: Missing extra_data_len');
    }

    if (typeof details.extra_data_offset !== 'number') {
      throw _constants.ERRORS.TypedError('Runtime', 'requestPrevTxInfo: Missing extra_data_offset');
    }

    if (typeof tx.extra_data !== 'string') {
      throw _constants.ERRORS.TypedError('Runtime', "requestPrevTxInfo: No extra data for transaction " + tx.hash);
    }

    var data = tx.extra_data;
    var dataLen = details.extra_data_len;
    var dataOffset = details.extra_data_offset;
    var extra_data_chunk = data.substring(dataOffset * 2, (dataOffset + dataLen) * 2);
    return typedCall('TxAckPrevExtraData', 'TxRequest', {
      tx: {
        extra_data_chunk: extra_data_chunk
      }
    });
  }

  if (request_type === 'TXMETA') {
    var _data = tx.extra_data;
    var meta = {
      version: tx.version,
      lock_time: tx.lock_time,
      inputs_count: tx.inputs.length,
      outputs_count: tx.outputs ? tx.outputs.length : tx.bin_outputs.length,
      timestamp: tx.timestamp,
      version_group_id: tx.version_group_id,
      expiry: tx.expiry,
      branch_id: tx.branch_id,
      extra_data_len: _data ? _data.length / 2 : undefined
    };
    return typedCall('TxAckPrevMeta', 'TxRequest', {
      tx: meta
    });
  }

  throw _constants.ERRORS.TypedError('Runtime', "requestPrevTxInfo: Unknown request type: " + request_type);
};

var requestSignedTxInfo = function requestSignedTxInfo(_ref2) {
  var typedCall = _ref2.typedCall,
      _ref2$txRequest = _ref2.txRequest,
      request_type = _ref2$txRequest.request_type,
      details = _ref2$txRequest.details,
      inputs = _ref2.inputs,
      outputs = _ref2.outputs;

  if (request_type === 'TXINPUT') {
    return typedCall('TxAckInput', 'TxRequest', {
      tx: {
        input: inputs[details.request_index]
      }
    });
  }

  if (request_type === 'TXOUTPUT') {
    return typedCall('TxAckOutput', 'TxRequest', {
      tx: {
        output: outputs[details.request_index]
      }
    });
  }

  if (request_type === 'TXMETA') {
    throw _constants.ERRORS.TypedError('Runtime', 'requestSignedTxInfo: Cannot read TXMETA from signed transaction');
  }

  if (request_type === 'TXEXTRADATA') {
    throw _constants.ERRORS.TypedError('Runtime', 'requestSignedTxInfo: Cannot read TXEXTRADATA from signed transaction');
  }

  throw _constants.ERRORS.TypedError('Runtime', "requestSignedTxInfo: Unknown request type: " + request_type);
}; // requests information about a transaction
// can be either signed transaction itself of prev transaction


var requestTxAck = function requestTxAck(props) {
  var tx_hash = props.txRequest.details.tx_hash;

  if (tx_hash) {
    return requestPrevTxInfo(props);
  }

  return requestSignedTxInfo(props);
};

var saveTxSignatures = function saveTxSignatures(txRequest, serializedTx, signatures) {
  if (!txRequest) return;
  var signature_index = txRequest.signature_index,
      signature = txRequest.signature,
      serialized_tx = txRequest.serialized_tx;

  if (serialized_tx) {
    serializedTx.push(serialized_tx);
  }

  if (typeof signature_index === 'number') {
    if (!signature) {
      throw _constants.ERRORS.TypedError('Runtime', 'saveTxSignatures: Unexpected null in trezor:TxRequestSerialized signature.');
    }

    signatures[signature_index] = signature;
  }
};

var processTxRequest = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(props) {
    var typedCall, txRequest, refTxs, inputs, outputs, serializedTx, signatures, _yield$requestTxAck, message;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            typedCall = props.typedCall, txRequest = props.txRequest, refTxs = props.refTxs, inputs = props.inputs, outputs = props.outputs, serializedTx = props.serializedTx, signatures = props.signatures;
            saveTxSignatures(txRequest.serialized, serializedTx, signatures);

            if (!(txRequest.request_type === 'TXFINISHED')) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", Promise.resolve({
              signatures: signatures,
              serializedTx: serializedTx.join('')
            }));

          case 4:
            _context.next = 6;
            return requestTxAck(props);

          case 6:
            _yield$requestTxAck = _context.sent;
            message = _yield$requestTxAck.message;
            return _context.abrupt("return", processTxRequest({
              typedCall: typedCall,
              txRequest: message,
              refTxs: refTxs,
              inputs: inputs,
              outputs: outputs,
              serializedTx: serializedTx,
              signatures: signatures
            }));

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function processTxRequest(_x) {
    return _ref3.apply(this, arguments);
  };
}();

var _default = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(typedCall, inputs, outputs, refTxsArray, options, coinInfo) {
    var refTxs, _yield$typedCall, message;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            refTxs = {};
            refTxsArray.forEach(function (tx) {
              refTxs[tx.hash.toLowerCase()] = tx;
            });
            _context2.next = 4;
            return typedCall('SignTx', 'TxRequest', _objectSpread(_objectSpread({}, options), {}, {
              inputs_count: inputs.length,
              outputs_count: outputs.length,
              coin_name: coinInfo.name
            }));

          case 4:
            _yield$typedCall = _context2.sent;
            message = _yield$typedCall.message;
            return _context2.abrupt("return", processTxRequest({
              typedCall: typedCall,
              txRequest: message,
              refTxs: refTxs,
              inputs: inputs,
              outputs: outputs,
              serializedTx: [],
              signatures: []
            }));

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x2, _x3, _x4, _x5, _x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();

exports["default"] = _default;