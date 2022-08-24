"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.verifyTicketTx = exports.verifyTx = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _utxoLib = require("@trezor/utxo-lib");

var _constants = require("../../../constants");

var _pathUtils = require("../../../utils/pathUtils");

var derivePubKeyHash = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(address_n, getHDNode, coinInfo) {
    var _response, node, response;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(address_n.length === 5)) {
              _context.next = 6;
              break;
            }

            _context.next = 3;
            return getHDNode(address_n.slice(0, 4), coinInfo);

          case 3:
            _response = _context.sent;
            node = _utxoLib.bip32.fromBase58(_response.xpub, coinInfo.network);
            return _context.abrupt("return", node.derive(address_n[address_n.length - 1]));

          case 6:
            _context.next = 8;
            return getHDNode(address_n, coinInfo);

          case 8:
            response = _context.sent;
            return _context.abrupt("return", _utxoLib.bip32.fromBase58(response.xpub, coinInfo.network));

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function derivePubKeyHash(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var deriveOutputScript = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(getHDNode, output, coinInfo) {
    var scriptType, node, payment;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!output.multisig) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return");

          case 2:
            if (!output.op_return_data) {
              _context2.next = 4;
              break;
            }

            return _context2.abrupt("return", _utxoLib.payments.embed({
              data: [Buffer.from(output.op_return_data, 'hex')]
            }).output);

          case 4:
            if (!output.address) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt("return", _utxoLib.address.toOutputScript(output.address, coinInfo.network));

          case 6:
            if (output.address_n) {
              _context2.next = 8;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', 'deriveOutputScript: Neither address or address_n is set');

          case 8:
            scriptType = (0, _pathUtils.getOutputScriptType)(output.address_n);
            _context2.next = 11;
            return derivePubKeyHash(output.address_n, getHDNode, coinInfo);

          case 11:
            node = _context2.sent;
            payment = {
              hash: node.identifier,
              network: coinInfo.network
            };

            if (!(scriptType === 'PAYTOADDRESS')) {
              _context2.next = 15;
              break;
            }

            return _context2.abrupt("return", _utxoLib.payments.p2pkh(payment).output);

          case 15:
            if (!(scriptType === 'PAYTOSCRIPTHASH')) {
              _context2.next = 17;
              break;
            }

            return _context2.abrupt("return", _utxoLib.payments.p2sh(payment).output);

          case 17:
            if (!(scriptType === 'PAYTOP2SHWITNESS')) {
              _context2.next = 19;
              break;
            }

            return _context2.abrupt("return", _utxoLib.payments.p2sh({
              redeem: _utxoLib.payments.p2wpkh(payment)
            }).output);

          case 19:
            if (!(scriptType === 'PAYTOWITNESS')) {
              _context2.next = 21;
              break;
            }

            return _context2.abrupt("return", _utxoLib.payments.p2wpkh(payment).output);

          case 21:
            if (!(scriptType === 'PAYTOTAPROOT')) {
              _context2.next = 23;
              break;
            }

            return _context2.abrupt("return", _utxoLib.payments.p2tr({
              pubkey: node.publicKey,
              network: coinInfo.network
            }).output);

          case 23:
            throw _constants.ERRORS.TypedError('Runtime', "deriveOutputScript: Unknown script type " + scriptType);

          case 24:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function deriveOutputScript(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

var verifyTx = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(getHDNode, inputs, outputs, serializedTx, coinInfo) {
    var bitcoinTx, i, scriptB, amount, scriptA;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // deserialize signed transaction
            bitcoinTx = _utxoLib.Transaction.fromHex(serializedTx, {
              network: coinInfo.network
            }); // check inputs and outputs length

            if (!(inputs.length !== bitcoinTx.ins.length)) {
              _context3.next = 3;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', 'verifyTx: Signed transaction inputs invalid length');

          case 3:
            if (!(outputs.length !== bitcoinTx.outs.length)) {
              _context3.next = 5;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', 'verifyTx: Signed transaction outputs invalid length');

          case 5:
            i = 0;

          case 6:
            if (!(i < outputs.length)) {
              _context3.next = 20;
              break;
            }

            scriptB = bitcoinTx.outs[i].script;

            if (!outputs[i].amount) {
              _context3.next = 12;
              break;
            }

            amount = outputs[i].amount;

            if (!(amount !== bitcoinTx.outs[i].value)) {
              _context3.next = 12;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', "verifyTx: Wrong output amount at output " + i + ". Requested: " + amount + ", signed: " + bitcoinTx.outs[i].value);

          case 12:
            _context3.next = 14;
            return deriveOutputScript(getHDNode, outputs[i], coinInfo);

          case 14:
            scriptA = _context3.sent;

            if (!(scriptA && scriptA.compare(scriptB) !== 0)) {
              _context3.next = 17;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', "verifyTx: Output " + i + " scripts differ");

          case 17:
            i++;
            _context3.next = 6;
            break;

          case 20:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function verifyTx(_x7, _x8, _x9, _x10, _x11) {
    return _ref3.apply(this, arguments);
  };
}();

exports.verifyTx = verifyTx;

var verifyTicketTx = /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(getHDNode, inputs, outputs, serializedTx, coinInfo) {
    var bitcoinTx, i, scriptB, output, scriptA, amount, node, _amount;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // deserialize signed transaction
            bitcoinTx = _utxoLib.Transaction.fromHex(serializedTx, {
              network: coinInfo.network
            }); // check inputs and outputs length

            if (!(inputs.length !== bitcoinTx.ins.length)) {
              _context4.next = 3;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', 'verifyTicketTx: Signed transaction inputs invalid length');

          case 3:
            if (!(outputs.length !== bitcoinTx.outs.length || outputs.length !== 3)) {
              _context4.next = 5;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', 'verifyTicketTx: Signed transaction outputs invalid length');

          case 5:
            i = 0;

          case 6:
            if (!(i < outputs.length)) {
              _context4.next = 37;
              break;
            }

            scriptB = bitcoinTx.outs[i].script;
            output = outputs[i];
            scriptA = void 0;

            if (!(i === 0)) {
              _context4.next = 17;
              break;
            }

            amount = output.amount;

            if (!(amount !== bitcoinTx.outs[i].value)) {
              _context4.next = 14;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', "verifyTicketTx: Wrong output amount at output " + i + ". Requested: " + amount + ", signed: " + bitcoinTx.outs[i].value);

          case 14:
            scriptA = _utxoLib.payments.sstxpkh({
              address: output.address,
              network: coinInfo.network
            }).output;
            _context4.next = 32;
            break;

          case 17:
            if (!(i === 1)) {
              _context4.next = 28;
              break;
            }

            if (!output.address) {
              _context4.next = 20;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', "verifyTicketTx: Output 1 should not have address.");

          case 20:
            if (output.address_n) {
              _context4.next = 22;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', "verifyTicketTx: Output 1 should have address_n.");

          case 22:
            _context4.next = 24;
            return derivePubKeyHash(output.address_n, getHDNode, coinInfo);

          case 24:
            node = _context4.sent;
            scriptA = _utxoLib.payments.sstxcommitment({
              hash: node.identifier,
              amount: output.amount.toString(),
              network: coinInfo.network
            }).output;
            _context4.next = 32;
            break;

          case 28:
            _amount = output.amount;

            if (!(_amount !== bitcoinTx.outs[i].value)) {
              _context4.next = 31;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', "verifyTicketTx: Wrong output amount at output " + i + ". Requested: " + _amount + ", signed: " + bitcoinTx.outs[i].value);

          case 31:
            scriptA = _utxoLib.payments.sstxchange({
              address: output.address,
              network: coinInfo.network
            }).output;

          case 32:
            if (!(scriptA && scriptA.compare(scriptB) !== 0)) {
              _context4.next = 34;
              break;
            }

            throw _constants.ERRORS.TypedError('Runtime', "verifyTx: Output " + i + " scripts differ");

          case 34:
            i++;
            _context4.next = 6;
            break;

          case 37:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function verifyTicketTx(_x12, _x13, _x14, _x15, _x16) {
    return _ref4.apply(this, arguments);
  };
}();

exports.verifyTicketTx = verifyTicketTx;