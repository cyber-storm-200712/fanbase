"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createTx = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var bs58check = _interopRequireWildcard(require("bs58check"));

var _constants = require("../../../constants");

var _paramsValidator = require("./paramsValidator");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var PREFIX = {
  B: new Uint8Array([1, 52]),
  tz1: new Uint8Array([6, 161, 159]),
  tz2: new Uint8Array([6, 161, 161]),
  tz3: new Uint8Array([6, 161, 164]),
  KT1: new Uint8Array([2, 90, 121]),
  edpk: new Uint8Array([13, 15, 37, 217]),
  sppk: new Uint8Array([3, 254, 226, 86]),
  p2pk: new Uint8Array([3, 178, 139, 127])
};

var bs58checkDecode = function bs58checkDecode(prefix, enc) {
  return bs58check.decode(enc).slice(prefix.length);
};

var concatArray = function concatArray(first, second) {
  var result = new Uint8Array(first.length + second.length);
  result.set(first);
  result.set(second, first.length);
  return result;
}; // convert publicKeyHash to buffer


var publicKeyHash2buffer = function publicKeyHash2buffer(publicKeyHash) {
  switch (publicKeyHash.substr(0, 3)) {
    case 'tz1':
      return {
        originated: 0,
        hash: concatArray(new Uint8Array([0]), bs58checkDecode(PREFIX.tz1, publicKeyHash))
      };

    case 'tz2':
      return {
        originated: 0,
        hash: concatArray(new Uint8Array([1]), bs58checkDecode(PREFIX.tz2, publicKeyHash))
      };

    case 'tz3':
      return {
        originated: 0,
        hash: concatArray(new Uint8Array([2]), bs58checkDecode(PREFIX.tz3, publicKeyHash))
      };

    case 'KT1':
      return {
        originated: 1,
        hash: concatArray(bs58checkDecode(PREFIX.KT1, publicKeyHash), new Uint8Array([0]))
      };

    default:
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Wrong Tezos publicKeyHash address');
  }
}; // convert publicKeyHash to buffer


var publicKey2buffer = function publicKey2buffer(publicKey) {
  switch (publicKey.substr(0, 4)) {
    case 'edpk':
      return concatArray(new Uint8Array([0]), bs58checkDecode(PREFIX.edpk, publicKey));

    case 'sppk':
      return concatArray(new Uint8Array([1]), bs58checkDecode(PREFIX.sppk, publicKey));

    case 'p2pk':
      return concatArray(new Uint8Array([2]), bs58checkDecode(PREFIX.p2pk, publicKey));

    default:
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Wrong Tezos publicKey');
  }
};

var createTx = function createTx(address_n, branch, operation) {
  var message = {
    address_n: address_n,
    branch: bs58checkDecode(PREFIX.B, branch)
  }; // reveal public key

  if (operation.reveal) {
    var reveal = operation.reveal; // validate reveal parameters

    (0, _paramsValidator.validateParams)(reveal, [{
      name: 'source',
      type: 'string',
      required: true
    }, {
      name: 'public_key',
      type: 'string',
      required: true
    }, {
      name: 'fee',
      type: 'uint',
      required: true
    }, {
      name: 'counter',
      type: 'number',
      required: true
    }, {
      name: 'gas_limit',
      type: 'number',
      required: true
    }, {
      name: 'storage_limit',
      type: 'number',
      required: true
    }]);
    message = _objectSpread(_objectSpread({}, message), {}, {
      reveal: {
        source: publicKeyHash2buffer(reveal.source).hash,
        public_key: publicKey2buffer(reveal.public_key),
        fee: reveal.fee,
        counter: reveal.counter,
        gas_limit: reveal.gas_limit,
        storage_limit: reveal.storage_limit
      }
    });
  } // transaction


  if (operation.transaction) {
    var transaction = operation.transaction; // validate transaction parameters

    (0, _paramsValidator.validateParams)(transaction, [{
      name: 'source',
      type: 'string',
      required: true
    }, {
      name: 'destination',
      type: 'string',
      required: true
    }, {
      name: 'amount',
      type: 'uint',
      required: true
    }, {
      name: 'counter',
      type: 'number',
      required: true
    }, {
      name: 'fee',
      type: 'uint',
      required: true
    }, {
      name: 'gas_limit',
      type: 'number',
      required: true
    }, {
      name: 'storage_limit',
      type: 'number',
      required: true
    }]);
    message = _objectSpread(_objectSpread({}, message), {}, {
      transaction: {
        source: publicKeyHash2buffer(transaction.source).hash,
        destination: {
          tag: publicKeyHash2buffer(transaction.destination).originated,
          hash: publicKeyHash2buffer(transaction.destination).hash
        },
        amount: transaction.amount,
        counter: transaction.counter,
        fee: transaction.fee,
        gas_limit: transaction.gas_limit,
        storage_limit: transaction.storage_limit
      }
    }); //  add parameters to transaction

    if (Object.prototype.hasOwnProperty.call(transaction, 'parameters')) {
      message = _objectSpread(_objectSpread({}, message), {}, {
        transaction: _objectSpread(_objectSpread({}, message.transaction), {}, {
          parameters: transaction.parameters
        })
      });
    }

    if (transaction.parameters_manager) {
      var parameters_manager = transaction.parameters_manager;
      (0, _paramsValidator.validateParams)(parameters_manager, [{
        name: 'set_delegate',
        type: 'string',
        required: false
      }, {
        name: 'cancel_delegate',
        type: 'boolean',
        required: false
      }, {
        name: 'transfer',
        type: 'object',
        required: false
      }]);

      if (parameters_manager.set_delegate) {
        message = _objectSpread(_objectSpread({}, message), {}, {
          transaction: _objectSpread(_objectSpread({}, message.transaction), {}, {
            parameters_manager: {
              set_delegate: publicKeyHash2buffer(parameters_manager.set_delegate).hash
            }
          })
        });
      }

      if (Object.prototype.hasOwnProperty.call(parameters_manager, 'cancel_delegate')) {
        message = _objectSpread(_objectSpread({}, message), {}, {
          transaction: _objectSpread(_objectSpread({}, message.transaction), {}, {
            parameters_manager: {
              cancel_delegate: true
            }
          })
        });
      }

      if (parameters_manager.transfer) {
        var transfer = parameters_manager.transfer;
        (0, _paramsValidator.validateParams)(transfer, [{
          name: 'amount',
          type: 'uint',
          required: true
        }, {
          name: 'destination',
          type: 'string',
          required: true
        }]);
        message = _objectSpread(_objectSpread({}, message), {}, {
          transaction: _objectSpread(_objectSpread({}, message.transaction), {}, {
            parameters_manager: {
              transfer: {
                destination: {
                  tag: publicKeyHash2buffer(transfer.destination).originated,
                  hash: publicKeyHash2buffer(transfer.destination).hash
                },
                amount: transfer.amount
              }
            }
          })
        });
      }
    }
  } // origination


  if (operation.origination) {
    var origination = operation.origination; // validate origination parameters

    (0, _paramsValidator.validateParams)(origination, [{
      name: 'source',
      type: 'string',
      required: true
    }, {
      name: 'balance',
      type: 'number',
      required: true
    }, {
      name: 'fee',
      type: 'uint',
      required: true
    }, {
      name: 'counter',
      type: 'number',
      required: true
    }, {
      name: 'gas_limit',
      type: 'number',
      required: true
    }, {
      name: 'storage_limit',
      type: 'number',
      required: true
    }, {
      name: 'script',
      type: 'string',
      required: true
    }]);
    message = _objectSpread(_objectSpread({}, message), {}, {
      origination: {
        source: publicKeyHash2buffer(origination.source).hash,
        balance: origination.balance,
        fee: origination.fee,
        counter: origination.counter,
        gas_limit: origination.gas_limit,
        storage_limit: origination.storage_limit,
        script: origination.script
      }
    });

    if (origination.delegate) {
      message = _objectSpread(_objectSpread({}, message), {}, {
        origination: _objectSpread(_objectSpread({}, message.origination), {}, {
          delegate: publicKeyHash2buffer(origination.delegate).hash
        })
      });
    }
  } // delegation


  if (operation.delegation) {
    var delegation = operation.delegation; // validate delegation parameters

    (0, _paramsValidator.validateParams)(delegation, [{
      name: 'source',
      type: 'string',
      required: true
    }, {
      name: 'delegate',
      type: 'string',
      required: true
    }, {
      name: 'fee',
      type: 'uint',
      required: true
    }, {
      name: 'counter',
      type: 'number',
      required: true
    }, {
      name: 'gas_limit',
      type: 'number',
      required: true
    }, {
      name: 'storage_limit',
      type: 'number',
      required: true
    }]);
    message = _objectSpread(_objectSpread({}, message), {}, {
      delegation: {
        source: publicKeyHash2buffer(delegation.source).hash,
        delegate: publicKeyHash2buffer(delegation.delegate).hash,
        fee: delegation.fee,
        counter: delegation.counter,
        gas_limit: delegation.gas_limit,
        storage_limit: delegation.storage_limit
      }
    });
  }

  return message;
};

exports.createTx = createTx;