"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _CoinInfo = require("../../data/CoinInfo");

var _pathUtils = require("../../utils/pathUtils");

var _constants = require("../../constants");

var _BlockchainLink = require("../../backend/BlockchainLink");

var _signtx = _interopRequireDefault(require("./helpers/signtx"));

var _signtxLegacy = _interopRequireDefault(require("./helpers/signtx-legacy"));

var _signtxVerify = require("./helpers/signtxVerify");

var _tx = require("./tx");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var SignTransaction = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(SignTransaction, _AbstractMethod);

  function SignTransaction() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = SignTransaction.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read', 'write'];
    this.info = 'Sign transaction';
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'coin',
      type: 'string',
      required: true
    }, {
      name: 'inputs',
      type: 'array',
      required: true
    }, {
      name: 'outputs',
      type: 'array',
      required: true
    }, {
      name: 'refTxs',
      type: 'array',
      allowEmpty: true
    }, {
      name: 'account',
      type: 'object'
    }, {
      name: 'locktime',
      type: 'number'
    }, {
      name: 'timestamp',
      type: 'number'
    }, {
      name: 'version',
      type: 'number'
    }, {
      name: 'expiry',
      type: 'number'
    }, {
      name: 'overwintered',
      type: 'boolean'
    }, {
      name: 'versionGroupId',
      type: 'number'
    }, {
      name: 'branchId',
      type: 'number'
    }, {
      name: 'decredStakingTicket',
      type: 'boolean'
    }, {
      name: 'push',
      type: 'boolean'
    }]);
    var coinInfo = (0, _CoinInfo.getBitcoinNetwork)(payload.coin);

    if (!coinInfo) {
      throw _constants.ERRORS.TypedError('Method_UnknownCoin');
    } // set required firmware from coinInfo support


    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, coinInfo, this.firmwareRange);
    this.info = (0, _pathUtils.getLabel)('Sign #NETWORK transaction', coinInfo);
    var inputs = (0, _tx.validateTrezorInputs)(payload.inputs, coinInfo);
    var outputs = (0, _tx.validateTrezorOutputs)(payload.outputs, coinInfo);
    var refTxs = (0, _tx.validateReferencedTransactions)(payload.refTxs, inputs, outputs);
    var outputsWithAmount = outputs.filter(function (output) {
      return typeof output.amount === 'string' && !Object.prototype.hasOwnProperty.call(output, 'op_return_data');
    });

    if (outputsWithAmount.length > 0) {
      var total = outputsWithAmount.reduce(function (bn, output) {
        return bn.plus(typeof output.amount === 'string' ? output.amount : '0');
      }, new _bignumber["default"](0));

      if (total.lte(coinInfo.dustLimit)) {
        throw _constants.ERRORS.TypedError('Method_InvalidParameter', 'Total amount is below dust limit.');
      }
    }

    this.params = {
      inputs: inputs,
      outputs: payload.outputs,
      refTxs: refTxs,
      addresses: payload.account ? payload.account.addresses : undefined,
      options: {
        lock_time: payload.locktime,
        timestamp: payload.timestamp,
        version: payload.version,
        expiry: payload.expiry,
        overwintered: payload.overwintered,
        version_group_id: payload.versionGroupId,
        branch_id: payload.branchId,
        decred_staking_ticket: payload.decredStakingTicket
      },
      coinInfo: coinInfo,
      push: typeof payload.push === 'boolean' ? payload.push : false
    };

    if (coinInfo.hasTimestamp && !Object.prototype.hasOwnProperty.call(payload, 'timestamp')) {
      var d = new Date();
      this.params.options.timestamp = Math.round(d.getTime() / 1000);
    }
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var device, params, refTxs, useLegacySignProcess, refTxsIds, blockchain, rawTxs, origTxsIds, rawOrigTxs, addresses, accountPath, node, account, origRefTxs, signTxMethod, response, _blockchain, txid;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              device = this.device, params = this.params;
              refTxs = [];
              useLegacySignProcess = device.unavailableCapabilities.replaceTransaction;

              if (params.refTxs) {
                _context.next = 36;
                break;
              }

              // initialize backend
              refTxsIds = (0, _tx.getReferencedTransactions)(params.inputs);

              if (!(refTxsIds.length > 0)) {
                _context.next = 34;
                break;
              }

              // validate backend
              (0, _BlockchainLink.isBackendSupported)(params.coinInfo);
              _context.next = 9;
              return (0, _BlockchainLink.initBlockchain)(params.coinInfo, this.postMessage);

            case 9:
              blockchain = _context.sent;
              _context.next = 12;
              return blockchain.getTransactions(refTxsIds);

            case 12:
              rawTxs = _context.sent;
              (0, _tx.enhanceTrezorInputs)(this.params.inputs, rawTxs);
              refTxs = (0, _tx.transformReferencedTransactions)(rawTxs, params.coinInfo);
              origTxsIds = (0, _tx.getOrigTransactions)(params.inputs, params.outputs);

              if (!(!useLegacySignProcess && origTxsIds.length > 0)) {
                _context.next = 34;
                break;
              }

              _context.next = 19;
              return blockchain.getTransactions(origTxsIds);

            case 19:
              rawOrigTxs = _context.sent;
              addresses = params.addresses; // sender account addresses not provided
              // fetch account info from the blockbook

              if (addresses) {
                _context.next = 32;
                break;
              }

              // TODO: validate inputs address_n's === same account
              accountPath = params.inputs.find(function (i) {
                return i.address_n;
              });

              if (!(!accountPath || !accountPath.address_n)) {
                _context.next = 25;
                break;
              }

              throw _constants.ERRORS.TypedError('Runtime', 'Account not found');

            case 25:
              _context.next = 27;
              return device.getCommands().getHDNode(accountPath.address_n.slice(0, 3), params.coinInfo);

            case 27:
              node = _context.sent;
              _context.next = 30;
              return blockchain.getAccountInfo({
                descriptor: node.xpubSegwit || node.xpub,
                coin: params.coinInfo.name,
                details: 'tokens'
              });

            case 30:
              account = _context.sent;
              addresses = account.addresses;

            case 32:
              origRefTxs = (0, _tx.transformOrigTransactions)(rawOrigTxs, params.coinInfo, addresses);
              refTxs = refTxs.concat(origRefTxs);

            case 34:
              _context.next = 37;
              break;

            case 36:
              refTxs = params.refTxs;

            case 37:
              signTxMethod = !useLegacySignProcess ? _signtx["default"] : _signtxLegacy["default"];
              _context.next = 40;
              return signTxMethod(device.getCommands().typedCall.bind(device.getCommands()), params.inputs, params.outputs, refTxs, params.options, params.coinInfo);

            case 40:
              response = _context.sent;

              if (!params.options.decred_staking_ticket) {
                _context.next = 46;
                break;
              }

              _context.next = 44;
              return (0, _signtxVerify.verifyTicketTx)(device.getCommands().getHDNode.bind(device.getCommands()), params.inputs, params.outputs, response.serializedTx, params.coinInfo);

            case 44:
              _context.next = 48;
              break;

            case 46:
              _context.next = 48;
              return (0, _signtxVerify.verifyTx)(device.getCommands().getHDNode.bind(device.getCommands()), params.inputs, params.outputs, response.serializedTx, params.coinInfo);

            case 48:
              if (!params.push) {
                _context.next = 57;
                break;
              }

              // validate backend
              (0, _BlockchainLink.isBackendSupported)(params.coinInfo);
              _context.next = 52;
              return (0, _BlockchainLink.initBlockchain)(params.coinInfo, this.postMessage);

            case 52:
              _blockchain = _context.sent;
              _context.next = 55;
              return _blockchain.pushTransaction(response.serializedTx);

            case 55:
              txid = _context.sent;
              return _context.abrupt("return", _objectSpread(_objectSpread({}, response), {}, {
                txid: txid
              }));

            case 57:
              return _context.abrupt("return", response);

            case 58:
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

  return SignTransaction;
}(_AbstractMethod2["default"]);

exports["default"] = SignTransaction;