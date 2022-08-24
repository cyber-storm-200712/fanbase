"use strict";

exports.__esModule = true;
exports.outputToTrezor = exports.validateHDOutput = exports.validateTrezorOutputs = void 0;

var _pathUtils = require("../../../utils/pathUtils");

var _addressUtils = require("../../../utils/addressUtils");

var _hdnodeUtils = require("../../../utils/hdnodeUtils");

var _paramsValidator = require("../helpers/paramsValidator");

var _constants = require("../../../constants");

/** *****
 * SignTransaction: validation
 ****** */
var validateTrezorOutputs = function validateTrezorOutputs(outputs, coinInfo) {
  var trezorOutputs = outputs.map(_pathUtils.fixPath).map(_hdnodeUtils.convertMultisigPubKey.bind(null, coinInfo.network));
  trezorOutputs.forEach(function (output) {
    (0, _paramsValidator.validateParams)(output, [{
      name: 'address_n',
      type: 'array'
    }, {
      name: 'address',
      type: 'string'
    }, {
      name: 'amount',
      type: 'uint'
    }, {
      name: 'op_return_data',
      type: 'string'
    }, {
      name: 'multisig',
      type: 'object'
    }]);

    if (Object.prototype.hasOwnProperty.call(output, 'address_n') && Object.prototype.hasOwnProperty.call(output, 'address')) {
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Cannot use address and address_n in one output');
    }

    if (output.address_n) {
      var scriptType = (0, _pathUtils.getOutputScriptType)(output.address_n);
      if (output.script_type !== scriptType) throw _constants.ERRORS.TypedError('Method_InvalidParameter', "Output change script_type should be set to " + scriptType);
    }

    if (typeof output.address === 'string' && !(0, _addressUtils.isValidAddress)(output.address, coinInfo)) {
      // validate address with coin info
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', "Invalid " + coinInfo.label + " output address " + output.address);
    }
  });
  return trezorOutputs;
};
/** *****
 * ComposeTransaction: validation
 ****** */


exports.validateTrezorOutputs = validateTrezorOutputs;

var validateHDOutput = function validateHDOutput(output, coinInfo) {
  var validateAddress = function validateAddress(address) {
    if (!address || !(0, _addressUtils.isValidAddress)(address, coinInfo)) {
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', "Invalid " + coinInfo.label + " output address format");
    }
  };

  switch (output.type) {
    case 'opreturn':
      (0, _paramsValidator.validateParams)(output, [{
        name: 'dataHex',
        type: 'string'
      }]);
      return {
        type: 'opreturn',
        dataHex: output.dataHex || ''
      };

    case 'send-max':
      (0, _paramsValidator.validateParams)(output, [{
        name: 'address',
        type: 'string',
        required: true
      }]);
      validateAddress(output.address);
      return {
        type: 'send-max',
        address: output.address
      };

    case 'noaddress':
      (0, _paramsValidator.validateParams)(output, [{
        name: 'amount',
        type: 'uint',
        required: true
      }]);
      return {
        type: 'noaddress',
        amount: output.amount
      };

    case 'send-max-noaddress':
      return {
        type: 'send-max-noaddress'
      };

    default:
      (0, _paramsValidator.validateParams)(output, [{
        name: 'amount',
        type: 'uint',
        required: true
      }, {
        name: 'address',
        type: 'string',
        required: true
      }]);
      validateAddress(output.address);
      return {
        type: 'complete',
        // $FlowIssue missing address will fail in validation above
        address: output.address,
        amount: output.amount
      };
  }
};
/** *****
 * Transform from @trezor/utxo-lib format to Trezor
 ****** */


exports.validateHDOutput = validateHDOutput;

var outputToTrezor = function outputToTrezor(output, _coinInfo) {
  if (output.opReturnData) {
    if (output.value) {
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'opReturn output should not contains value');
    }

    return {
      amount: '0',
      op_return_data: output.opReturnData.toString('hex'),
      script_type: 'PAYTOOPRETURN'
    };
  }

  if (!output.address && !output.path) {
    throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Both address and path of an output cannot be null.');
  }

  if (output.path) {
    return {
      address_n: output.path,
      amount: output.value,
      script_type: (0, _pathUtils.getOutputScriptType)(output.path)
    };
  }

  var address = output.address,
      value = output.value;

  if (typeof address !== 'string') {
    throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Wrong output address type, should be string');
  }

  return {
    address: address,
    amount: value,
    script_type: 'PAYTOADDRESS'
  };
};

exports.outputToTrezor = outputToTrezor;