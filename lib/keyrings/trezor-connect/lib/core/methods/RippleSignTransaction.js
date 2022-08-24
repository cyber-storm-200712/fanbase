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

var RippleSignTransaction = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(RippleSignTransaction, _AbstractMethod);

  function RippleSignTransaction() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = RippleSignTransaction.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read', 'write'];
    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, (0, _CoinInfo.getMiscNetwork)('Ripple'), this.firmwareRange);
    this.info = 'Sign Ripple transaction';
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'path',
      required: true
    }, {
      name: 'transaction',
      required: true
    }]);
    var path = (0, _pathUtils.validatePath)(payload.path, 5); // incoming data should be in ripple-sdk format

    var transaction = payload.transaction;
    (0, _paramsValidator.validateParams)(transaction, [{
      name: 'fee',
      type: 'uint'
    }, {
      name: 'flags',
      type: 'number'
    }, {
      name: 'sequence',
      type: 'number'
    }, {
      name: 'maxLedgerVersion',
      type: 'number'
    }, {
      name: 'payment',
      type: 'object'
    }]);
    (0, _paramsValidator.validateParams)(transaction.payment, [{
      name: 'amount',
      type: 'uint',
      required: true
    }, {
      name: 'destination',
      type: 'string',
      required: true
    }, {
      name: 'destinationTag',
      type: 'number'
    }]);
    this.params = {
      address_n: path,
      fee: transaction.fee,
      flags: transaction.flags,
      sequence: transaction.sequence,
      last_ledger_sequence: transaction.maxLedgerVersion,
      payment: {
        amount: transaction.payment.amount,
        destination: transaction.payment.destination,
        destination_tag: transaction.payment.destinationTag
      }
    };
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var cmd, _yield$cmd$typedCall, message;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              cmd = this.device.getCommands();
              _context.next = 3;
              return cmd.typedCall('RippleSignTx', 'RippleSignedTx', this.params);

            case 3:
              _yield$cmd$typedCall = _context.sent;
              message = _yield$cmd$typedCall.message;
              return _context.abrupt("return", {
                serializedTx: message.serialized_tx,
                signature: message.signature
              });

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  return RippleSignTransaction;
}(_AbstractMethod2["default"]);

exports["default"] = RippleSignTransaction;