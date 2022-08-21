"use strict";

exports.__esModule = true;
exports.inputToTrezor = exports.inputToHD = exports.enhanceTrezorInputs = exports.validateTrezorInputs = void 0;

var _bufferUtils = require("../../../utils/bufferUtils");

var _pathUtils = require("../../../utils/pathUtils");

var _hdnodeUtils = require("../../../utils/hdnodeUtils");

var _paramsValidator = require("../helpers/paramsValidator");

/** *****
 * SignTx: validation
 ****** */
var validateTrezorInputs = function validateTrezorInputs(inputs, coinInfo) {
  return inputs.map(_pathUtils.fixPath).map(_hdnodeUtils.convertMultisigPubKey.bind(null, coinInfo.network)).map(function (input) {
    var useAmount = input.script_type === 'EXTERNAL' || (0, _pathUtils.isSegwitPath)(input.address_n); // since 2.3.5 amount is required for all inputs.
    // this change however is breaking 3rd party implementations
    // missing amount will be delivered by refTx object

    (0, _paramsValidator.validateParams)(input, [{
      name: 'prev_hash',
      type: 'string',
      required: true
    }, {
      name: 'prev_index',
      type: 'number',
      required: true
    }, {
      name: 'amount',
      type: 'uint',
      required: useAmount
    }, {
      name: 'script_type',
      type: 'string'
    }, {
      name: 'sequence',
      type: 'number'
    }, {
      name: 'multisig',
      type: 'object'
    }]);

    if (input.script_type === 'EXTERNAL') {
      (0, _paramsValidator.validateParams)(input, [{
        name: 'script_pubkey',
        type: 'string',
        required: true
      }, {
        name: 'commitment_data',
        type: 'string'
      }, {
        name: 'ownership_proof',
        type: 'string'
      }, {
        name: 'script_sig',
        type: 'string'
      }, {
        name: 'witness',
        type: 'string'
      }]);
    } else {
      (0, _pathUtils.validatePath)(input.address_n);
    }

    return input;
  });
}; // this method exist as a workaround for breaking change described in validateTrezorInputs
// TODO: it could be removed after another major version release.


exports.validateTrezorInputs = validateTrezorInputs;

var enhanceTrezorInputs = function enhanceTrezorInputs(inputs, rawTxs) {
  inputs.forEach(function (input) {
    if (!input.amount) {
      // eslint-disable-next-line no-console
      console.warn('TrezorConnect.singTransaction deprecation: missing input amount.');
      var refTx = rawTxs.find(function (t) {
        return t.tx.txid === input.prev_hash;
      });

      if (refTx && refTx.type === 'blockbook') {
        input.amount = refTx.tx.vout[input.prev_index].value;
      }
    }
  });
};
/** *****
 * Transform from Trezor format to @trezor/utxo-lib/compose, called from SignTx to get refTxs from bitcore
 ****** */


exports.enhanceTrezorInputs = enhanceTrezorInputs;

var inputToHD = function inputToHD(input) {
  return {
    hash: (0, _bufferUtils.reverseBuffer)(Buffer.from(input.prev_hash, 'hex')),
    index: input.prev_index,
    path: input.address_n || [],
    amount: typeof input.amount === 'number' ? input.amount.toString() : input.amount,
    segwit: (0, _pathUtils.isSegwitPath)(input.address_n)
  };
};
/** *****
 * Transform from @trezor/utxo-lib/compose format to Trezor
 ****** */


exports.inputToHD = inputToHD;

var inputToTrezor = function inputToTrezor(input, sequence) {
  var address_n = input.path;
  return {
    address_n: address_n,
    prev_index: input.index,
    prev_hash: (0, _bufferUtils.reverseBuffer)(input.hash).toString('hex'),
    script_type: (0, _pathUtils.getScriptType)(address_n),
    // $FlowIssue: amount in ComposedTxInput type (@trezor/utxo-lib/compose) is declared as optional // TODO
    amount: input.amount,
    sequence: sequence
  };
};

exports.inputToTrezor = inputToTrezor;