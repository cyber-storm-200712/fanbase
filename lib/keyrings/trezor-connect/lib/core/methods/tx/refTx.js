"use strict";

exports.__esModule = true;
exports.validateReferencedTransactions = exports.transformReferencedTransactions = exports.transformOrigTransactions = exports.getOrigTransactions = exports.getReferencedTransactions = void 0;

var _utxoLib = require("@trezor/utxo-lib");

var _bufferUtils = require("../../../utils/bufferUtils");

var _pathUtils = require("../../../utils/pathUtils");

var _paramsValidator = require("../helpers/paramsValidator");

var _errors = require("../../../constants/errors");

// local modules
// Get array of unique referenced transactions ids
var getReferencedTransactions = function getReferencedTransactions(inputs) {
  var result = [];
  inputs.forEach(function (input) {
    if (input.prev_hash && !result.includes(input.prev_hash)) {
      result.push(input.prev_hash);
    }
  });
  return result;
}; // Get array of unique original transactions ids (used in rbf)


exports.getReferencedTransactions = getReferencedTransactions;

var getOrigTransactions = function getOrigTransactions(inputs, outputs) {
  var result = [];
  inputs.forEach(function (input) {
    if (input.orig_hash && !result.includes(input.orig_hash)) {
      result.push(input.orig_hash);
    }
  });
  outputs.forEach(function (output) {
    if (output.orig_hash && !result.includes(output.orig_hash)) {
      result.push(output.orig_hash);
    }
  });
  return result;
}; // BitcoinJsTransaction returns input.witness as Buffer[]
// expected hex response format:
// chunks size + (chunk[i].size + chunk[i])
// TODO: this code should be implemented in BitcoinJsTransaction (@trezor/utxo-lib)


exports.getOrigTransactions = getOrigTransactions;

var getWitness = function getWitness(witness) {
  if (!Array.isArray(witness)) return;

  var getChunkSize = function getChunkSize(n) {
    var buf = Buffer.allocUnsafe(1);
    buf.writeUInt8(n);
    return buf;
  };

  var chunks = witness.reduce(function (arr, chunk) {
    return arr.concat([getChunkSize(chunk.length), chunk]);
  }, [getChunkSize(witness.length)]);
  return Buffer.concat(chunks).toString('hex');
}; // extend refTx object with optional data


var enhanceTransaction = function enhanceTransaction(refTx, srcTx) {
  var extraData = srcTx.getExtraData();

  if (extraData) {
    refTx.extra_data = extraData.toString('hex');
  }

  var specific = srcTx.getSpecificData();

  if (specific) {
    if (specific.type === 'zcash' && specific.versionGroupId && refTx.version >= 3) {
      refTx.version_group_id = specific.versionGroupId;
    }

    if (specific.type === 'dash' && srcTx.type && srcTx.version >= 3) {
      refTx.version |= srcTx.type << 16;
    }
  }

  return refTx;
}; // Find inputs used for current sign tx process related to referenced transaction
// related inputs and outputs needs more info (address_n, amount, script_type, witness)
// const findAddressN = (vinVout?: TxInputType[] | TxOutputType[], txid: string, index: number) => {
//     if (!vinVout) return;
//     const utxo = vinVout.find(o => o.orig_index === index && o.orig_hash === txid && o.address_n);
//     return utxo ? utxo.address_n : undefined;
// };
// Transform orig transactions from Blockbook (blockchain-link) to Trezor format


var transformOrigTransactions = function transformOrigTransactions(txs, coinInfo, addresses) {
  return txs.flatMap(function (raw) {
    if (coinInfo.type !== 'bitcoin' || raw.type !== 'blockbook' || !addresses) return [];
    var _raw$tx = raw.tx,
        hex = _raw$tx.hex,
        vin = _raw$tx.vin,
        vout = _raw$tx.vout;

    var tx = _utxoLib.Transaction.fromHex(hex, {
      network: coinInfo.network
    });

    var inputAddresses = addresses.used.concat(addresses.change).concat(addresses.unused); // inputs, required by TXORIGINPUT (TxAckInput) request from Trezor

    var inputsMap = function inputsMap(input, i) {
      // TODO: is vin[i] a correct way? order in Bitcoinjs
      var address = vin[i].addresses.join(''); // controversial: is there a possibility to have more than 1 address in this tx? multisig?

      var inputAddress = inputAddresses.find(function (addr) {
        return addr.address === address;
      });
      var address_n = inputAddress ? (0, _pathUtils.getHDPath)(inputAddress.path) : []; // TODO: is fallback necessary?

      return {
        address_n: address_n,
        prev_hash: (0, _bufferUtils.reverseBuffer)(input.hash).toString('hex'),
        prev_index: input.index,
        script_sig: input.script.toString('hex'),
        sequence: input.sequence,
        script_type: (0, _pathUtils.getScriptType)(address_n),
        multisig: undefined,
        // TODO
        amount: vin[i].value,
        decred_tree: undefined,
        // TODO
        witness: tx.hasWitnesses() ? getWitness(input.witness) : undefined,
        ownership_proof: undefined,
        // TODO
        commitment_data: undefined // TODO

      };
    }; // outputs, required by TXORIGOUTPUT (TxAckOutput) request from Trezor


    var outputsMap = function outputsMap(output, i) {
      if (!vout[i].isAddress) {
        var _BitcoinJsPayments$em = _utxoLib.payments.embed({
          output: output.script
        }),
            data = _BitcoinJsPayments$em.data;

        return {
          script_type: 'PAYTOOPRETURN',
          amount: '0',
          op_return_data: data ? data.shift().toString('hex') : '' // shift OP code

        };
      } // TODO: is vout[i] a correct way? order in Bitcoinjs


      var address = vout[i].addresses.join(''); // controversial: is there a possibility to have more than 1 address in this tx? multisig?

      var changeAddress = addresses.change.find(function (addr) {
        return addr.address === address;
      });
      var address_n = changeAddress && (0, _pathUtils.getHDPath)(changeAddress.path);
      var amount = typeof output.value === 'number' ? output.value.toString() : output.value; // console.warn('OUT ADDR', BitcoinJSAddress.fromOutputScript(output.script, coinInfo.network), address);

      return address_n ? {
        address_n: address_n,
        amount: amount,
        script_type: (0, _pathUtils.getOutputScriptType)(address_n)
      } : {
        address: address,
        amount: amount,
        script_type: 'PAYTOADDRESS'
      };
    };

    var refTx = {
      version: tx.version,
      hash: tx.getId(),
      inputs: tx.ins.map(inputsMap),
      outputs: tx.outs.map(outputsMap),
      lock_time: tx.locktime,
      timestamp: tx.timestamp,
      expiry: tx.expiry
    };
    return enhanceTransaction(refTx, tx);
  });
}; // Transform referenced transactions from Blockbook (blockchain-link) to Trezor format


exports.transformOrigTransactions = transformOrigTransactions;

var transformReferencedTransactions = function transformReferencedTransactions(txs, coinInfo) {
  return txs.flatMap(function (raw) {
    if (coinInfo.type !== 'bitcoin' || raw.type !== 'blockbook') return [];
    var hex = raw.tx.hex;

    var tx = _utxoLib.Transaction.fromHex(hex, {
      network: coinInfo.network
    }); // inputs, required by TXINPUT (TxAckPrevInput) request from Trezor


    var inputsMap = function inputsMap(input) {
      return {
        prev_index: input.index,
        sequence: input.sequence,
        prev_hash: (0, _bufferUtils.reverseBuffer)(input.hash).toString('hex'),
        script_sig: input.script.toString('hex')
      };
    }; // map bin_outputs, required by TXOUTPUT (TxAckPrevOutput) request from Trezor


    var binOutputsMap = function binOutputsMap(output) {
      return {
        amount: typeof output.value === 'number' ? output.value.toString() : output.value,
        script_pubkey: output.script.toString('hex')
      };
    };

    var refTx = {
      version: tx.version,
      hash: tx.getId(),
      inputs: tx.ins.map(inputsMap),
      bin_outputs: tx.outs.map(binOutputsMap),
      lock_time: tx.locktime,
      timestamp: tx.timestamp,
      expiry: tx.expiry
    };
    return enhanceTransaction(refTx, tx);
  });
}; // Validate referenced transactions provided by the user.
// Data sent as response to TxAck needs to be strict.
// They should not contain any fields unknown/unexpected by protobuf.


exports.transformReferencedTransactions = transformReferencedTransactions;

var validateReferencedTransactions = function validateReferencedTransactions(txs, inputs, outputs) {
  if (!Array.isArray(txs) || txs.length === 0) return; // allow empty, they will be downloaded later...
  // collect sets of transactions defined by inputs/outputs

  var refTxs = getReferencedTransactions(inputs);
  var origTxs = getOrigTransactions(inputs, outputs); // NOTE: origTxs are used in RBF

  var transformedTxs = txs.map(function (tx) {
    // validate common fields
    // TODO: detailed params validation will be addressed in https://github.com/trezor/connect/pull/782
    // currently it's 1:1 with previous validation in SignTransaction.js method
    (0, _paramsValidator.validateParams)(tx, [{
      name: 'hash',
      type: 'string',
      required: true
    }, {
      name: 'inputs',
      type: 'array',
      required: true
    }, {
      name: 'version',
      type: 'number',
      required: true
    }, {
      name: 'lock_time',
      type: 'number',
      required: true
    }, {
      name: 'extra_data',
      type: 'string'
    }, {
      name: 'timestamp',
      type: 'number'
    }, {
      name: 'version_group_id',
      type: 'number'
    }]); // check if referenced transaction is in expected format (RBF)

    if (origTxs.includes(tx.hash)) {
      // validate specific fields of origTx
      // protobuf.TxInput
      (0, _paramsValidator.validateParams)(tx, [{
        name: 'outputs',
        type: 'array',
        required: true
      }]); // TODO: detailed validation will be addressed in #782

      return tx;
    } // validate specific fields of refTx


    (0, _paramsValidator.validateParams)(tx, [{
      name: 'bin_outputs',
      type: 'array',
      required: true
    }]);
    tx.inputs.forEach(function (input) {
      (0, _paramsValidator.validateParams)(input, [{
        name: 'prev_hash',
        type: 'string',
        required: true
      }, {
        name: 'prev_index',
        type: 'number',
        required: true
      }, {
        name: 'script_sig',
        type: 'string',
        required: true
      }, {
        name: 'sequence',
        type: 'number',
        required: true
      }, {
        name: 'decred_tree',
        type: 'number'
      }]);
    });
    return {
      hash: tx.hash,
      version: tx.version,
      extra_data: tx.extra_data,
      lock_time: tx.lock_time,
      timestamp: tx.timestamp,
      version_group_id: tx.version_group_id,
      expiry: tx.expiry,
      // make exact protobuf.PrevInput
      inputs: tx.inputs.map(function (input) {
        return {
          prev_hash: input.prev_hash,
          prev_index: input.prev_index,
          // $FlowIssue: PrevInput/TxInput union, validated above, TODO: will be addressed in #782
          script_sig: input.script_sig,
          // $FlowIssue: PrevInput/TxInput union, validated above, TODO: will be addressed #782
          sequence: input.sequence,
          decred_tree: input.decred_tree
        };
      }),
      // make exact protobuf.TxOutputBinType
      // $FlowIssue, bin_inputs presence validated above, TODO: will be addressed in #782
      bin_outputs: tx.bin_outputs.map(function (output) {
        return {
          amount: output.amount,
          script_pubkey: output.script_pubkey,
          decred_script_version: output.decred_script_version
        };
      })
    };
  }); // check if all required transactions defined by inputs/outputs were provided

  refTxs.concat(origTxs).forEach(function (hash) {
    if (!transformedTxs.find(function (tx) {
      return tx.hash === hash;
    })) {
      throw (0, _errors.TypedError)('Method_InvalidParameter', "refTx: " + hash + " not provided");
    }
  });
  return transformedTxs;
};

exports.validateReferencedTransactions = validateReferencedTransactions;