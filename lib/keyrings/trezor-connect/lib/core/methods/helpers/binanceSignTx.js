"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.signTx = exports.validate = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _constants = require("../../../constants");

var _paramsValidator = require("./paramsValidator");

var _excluded = ["type"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var processTxRequest = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(typedCall, messages, index) {
    var _messages$index, type, params, lastOp, response;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _messages$index = messages[index], type = _messages$index.type, params = (0, _objectWithoutPropertiesLoose2["default"])(_messages$index, _excluded);
            lastOp = index + 1 >= messages.length;

            if (!lastOp) {
              _context.next = 7;
              break;
            }

            _context.next = 5;
            return typedCall(type, 'BinanceSignedTx', params);

          case 5:
            response = _context.sent;
            return _context.abrupt("return", response.message);

          case 7:
            _context.next = 9;
            return typedCall(type, 'BinanceTxRequest', params);

          case 9:
            index++;
            return _context.abrupt("return", processTxRequest(typedCall, messages, index));

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function processTxRequest(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}(); // validate and translate params to protobuf


var validate = function validate(tx) {
  (0, _paramsValidator.validateParams)(tx, [{
    name: 'chain_id',
    type: 'string',
    required: true
  }, {
    name: 'account_number',
    type: 'number'
  }, {
    name: 'memo',
    type: 'string'
  }, {
    name: 'sequence',
    type: 'number'
  }, {
    name: 'source',
    type: 'number'
  }, {
    name: 'message',
    type: 'object'
  }]);
  var preparedTx = {
    chain_id: tx.chain_id,
    account_number: tx.account_number || 0,
    memo: tx.memo,
    sequence: tx.sequence || 0,
    source: tx.source || 0,
    messages: []
  };
  var transfer = tx.transfer,
      placeOrder = tx.placeOrder,
      cancelOrder = tx.cancelOrder;

  if (transfer) {
    (0, _paramsValidator.validateParams)(transfer, [{
      name: 'inputs',
      type: 'array',
      required: true
    }, {
      name: 'outputs',
      type: 'array',
      required: true
    }]);
    preparedTx.messages.push(_objectSpread(_objectSpread({}, transfer), {}, {
      type: 'BinanceTransferMsg'
    }));
  }

  if (placeOrder) {
    (0, _paramsValidator.validateParams)(placeOrder, [{
      name: 'id',
      type: 'string'
    }, {
      name: 'ordertype',
      type: 'number'
    }, {
      name: 'price',
      type: 'number'
    }, {
      name: 'quantity',
      type: 'number'
    }, {
      name: 'sender',
      type: 'string'
    }, {
      name: 'side',
      type: 'number'
    }]);
    preparedTx.messages.push(_objectSpread(_objectSpread({}, placeOrder), {}, {
      type: 'BinanceOrderMsg'
    }));
  }

  if (cancelOrder) {
    (0, _paramsValidator.validateParams)(cancelOrder, [{
      name: 'refid',
      type: 'string',
      required: true
    }, {
      name: 'sender',
      type: 'string',
      required: true
    }, {
      name: 'symbol',
      type: 'string',
      required: true
    }]);
    preparedTx.messages.push(_objectSpread(_objectSpread({}, cancelOrder), {}, {
      type: 'BinanceCancelMsg'
    }));
  }

  if (preparedTx.messages.length < 1) {
    throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Transaction does not have any message');
  }

  return preparedTx;
};

exports.validate = validate;

var signTx = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(typedCall, address_n, tx) {
    var account_number, chain_id, memo, sequence, source, messages, msg_count;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            account_number = tx.account_number, chain_id = tx.chain_id, memo = tx.memo, sequence = tx.sequence, source = tx.source, messages = tx.messages;
            msg_count = messages.length;
            _context2.next = 4;
            return typedCall('BinanceSignTx', 'BinanceTxRequest', {
              address_n: address_n,
              msg_count: msg_count,
              account_number: account_number,
              chain_id: chain_id,
              memo: memo,
              sequence: sequence,
              source: source
            });

          case 4:
            return _context2.abrupt("return", processTxRequest(typedCall, messages, 0));

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function signTx(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

exports.signTx = signTx;