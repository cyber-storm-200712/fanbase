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

var _Discovery = _interopRequireDefault(require("./helpers/Discovery"));

var _paramsValidator = require("./helpers/paramsValidator");

var pathUtils = _interopRequireWildcard(require("../../utils/pathUtils"));

var _promiseUtils = require("../../utils/promiseUtils");

var _constants = require("../../constants");

var _CoinInfo = require("../../data/CoinInfo");

var _formatUtils = require("../../utils/formatUtils");

var _BlockchainLink = require("../../backend/BlockchainLink");

var _TransactionComposer = _interopRequireDefault(require("./tx/TransactionComposer"));

var _tx = require("./tx");

var _signtx = _interopRequireDefault(require("./helpers/signtx"));

var _signtxLegacy = _interopRequireDefault(require("./helpers/signtx-legacy"));

var _signtxVerify = require("./helpers/signtxVerify");

var _builder = require("../../message/builder");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var ComposeTransaction = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(ComposeTransaction, _AbstractMethod);

  function ComposeTransaction() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = ComposeTransaction.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read', 'write'];
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'outputs',
      type: 'array',
      required: true
    }, {
      name: 'coin',
      type: 'string',
      required: true
    }, {
      name: 'push',
      type: 'boolean'
    }, {
      name: 'account',
      type: 'object'
    }, {
      name: 'feeLevels',
      type: 'array'
    }, {
      name: 'baseFee',
      type: 'number'
    }, {
      name: 'floorBaseFee',
      type: 'boolean'
    }, {
      name: 'sequence',
      type: 'number'
    }, {
      name: 'skipPermutation',
      type: 'boolean'
    }]);
    var coinInfo = (0, _CoinInfo.getBitcoinNetwork)(payload.coin);

    if (!coinInfo) {
      throw _constants.ERRORS.TypedError('Method_UnknownCoin');
    } // validate backend


    (0, _BlockchainLink.isBackendSupported)(coinInfo); // set required firmware from coinInfo support

    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, coinInfo, this.firmwareRange); // validate each output and transform into @trezor/utxo-lib/compose format

    var outputs = [];
    var total = new _bignumber["default"](0);
    payload.outputs.forEach(function (out) {
      var output = (0, _tx.validateHDOutput)(out, coinInfo);

      if (typeof output.amount === 'string') {
        total = total.plus(output.amount);
      }

      outputs.push(output);
    });
    var sendMax = outputs.find(function (o) {
      return o.type === 'send-max';
    }) !== undefined; // there should be only one output when using send-max option
    // if (sendMax && outputs.length > 1) {
    //     throw ERRORS.TypedError('Method_InvalidParameter', 'Only one output allowed when using "send-max" option');
    // }
    // if outputs contains regular items
    // check if total amount is not lower than dust limit
    // if (outputs.find(o => o.type === 'complete') !== undefined && total.lte(coinInfo.dustLimit)) {
    //     throw error 'Total amount is too low';
    // }

    if (sendMax) {
      this.info = 'Send maximum amount';
    } else {
      this.info = "Send " + (0, _formatUtils.formatAmount)(total.toString(), coinInfo);
    }

    this.useDevice = !payload.account && !payload.feeLevels;
    this.useUi = this.useDevice;
    this.params = {
      outputs: outputs,
      coinInfo: coinInfo,
      account: payload.account,
      feeLevels: payload.feeLevels,
      baseFee: payload.baseFee,
      floorBaseFee: payload.floorBaseFee,
      sequence: payload.sequence,
      skipPermutation: payload.skipPermutation,
      push: typeof payload.push === 'boolean' ? payload.push : false
    };
  };

  _proto.precompose = /*#__PURE__*/function () {
    var _precompose = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(account, feeLevels) {
      var _this = this;

      var _this$params, coinInfo, outputs, baseFee, skipPermutation, address_n, composer, blockchain;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _this$params = this.params, coinInfo = _this$params.coinInfo, outputs = _this$params.outputs, baseFee = _this$params.baseFee, skipPermutation = _this$params.skipPermutation;
              address_n = pathUtils.validatePath(account.path);
              composer = new _TransactionComposer["default"]({
                account: {
                  type: pathUtils.getAccountType(address_n),
                  label: 'Account',
                  descriptor: account.path,
                  address_n: address_n,
                  addresses: account.addresses
                },
                utxo: account.utxo,
                coinInfo: coinInfo,
                outputs: outputs,
                baseFee: baseFee,
                skipPermutation: skipPermutation
              }); // This is mandatory, @trezor/utxo-lib/compose expects current block height
              // TODO: make it possible without it (offline composing)

              _context.next = 5;
              return (0, _BlockchainLink.initBlockchain)(this.params.coinInfo, this.postMessage);

            case 5:
              blockchain = _context.sent;
              _context.next = 8;
              return composer.init(blockchain);

            case 8:
              return _context.abrupt("return", feeLevels.map(function (level) {
                composer.composeCustomFee(level.feePerUnit);

                var tx = _objectSpread({}, composer.composed.custom); // needs to spread otherwise flow has a problem with ComposeResult vs PrecomposedTransaction (max could be undefined)


                // needs to spread otherwise flow has a problem with ComposeResult vs PrecomposedTransaction (max could be undefined)
                if (tx.type === 'final') {
                  var inputs = tx.transaction.inputs.map(function (inp) {
                    return (0, _tx.inputToTrezor)(inp, _this.params.sequence || 0xffffffff);
                  });
                  var _tx$transaction$outpu = tx.transaction.outputs,
                      sorted = _tx$transaction$outpu.sorted,
                      permutation = _tx$transaction$outpu.permutation;
                  var txOutputs = sorted.map(function (out) {
                    return (0, _tx.outputToTrezor)(out, coinInfo);
                  });
                  return {
                    type: 'final',
                    max: tx.max,
                    totalSpent: tx.totalSpent,
                    fee: tx.fee,
                    feePerByte: tx.feePerByte,
                    bytes: tx.bytes,
                    transaction: {
                      inputs: inputs,
                      outputs: txOutputs,
                      outputsPermutation: permutation
                    }
                  };
                }

                return tx;
              }));

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function precompose(_x, _x2) {
      return _precompose.apply(this, arguments);
    }

    return precompose;
  }();

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var _yield$this$selectAcc, account, utxo, response;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(this.params.account && this.params.feeLevels)) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt("return", this.precompose(this.params.account, this.params.feeLevels));

            case 2:
              _context2.next = 4;
              return this.selectAccount();

            case 4:
              _yield$this$selectAcc = _context2.sent;
              account = _yield$this$selectAcc.account;
              utxo = _yield$this$selectAcc.utxo;
              _context2.next = 9;
              return this.selectFee(account, utxo);

            case 9:
              response = _context2.sent;

              if (this.discovery) {
                _context2.next = 12;
                break;
              }

              throw _constants.ERRORS.TypedError('Runtime', 'ComposeTransaction: selectFee response received after dispose');

            case 12:
              if (!(typeof response === 'string')) {
                _context2.next = 14;
                break;
              }

              return _context2.abrupt("return", this.run());

            case 14:
              return _context2.abrupt("return", response);

            case 15:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  _proto.selectAccount = /*#__PURE__*/function () {
    var _selectAccount = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var _this2 = this;

      var coinInfo, blockchain, dfd, _discovery, _uiResp, _account, _utxo, discovery, uiResp, account, utxo;

      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              coinInfo = this.params.coinInfo;
              _context3.next = 3;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 3:
              blockchain = _context3.sent;
              dfd = this.createUiPromise(_constants.UI.RECEIVE_ACCOUNT, this.device);

              if (!(this.discovery && this.discovery.completed)) {
                _context3.next = 16;
                break;
              }

              _discovery = this.discovery;
              this.postMessage((0, _builder.UiMessage)(_constants.UI.SELECT_ACCOUNT, {
                type: 'end',
                coinInfo: coinInfo,
                accountTypes: _discovery.types.map(function (t) {
                  return t.type;
                }),
                accounts: _discovery.accounts
              }));
              _context3.next = 10;
              return dfd.promise;

            case 10:
              _uiResp = _context3.sent;
              _account = _discovery.accounts[_uiResp.payload];
              _context3.next = 14;
              return blockchain.getAccountUtxo(_account.descriptor);

            case 14:
              _utxo = _context3.sent;
              return _context3.abrupt("return", {
                account: _account,
                utxo: _utxo
              });

            case 16:
              // initialize backend
              discovery = this.discovery || new _Discovery["default"]({
                blockchain: blockchain,
                commands: this.device.getCommands()
              });
              this.discovery = discovery;
              discovery.on('progress', function (accounts) {
                _this2.postMessage((0, _builder.UiMessage)(_constants.UI.SELECT_ACCOUNT, {
                  type: 'progress',
                  // preventEmpty: true,
                  coinInfo: coinInfo,
                  accounts: accounts
                }));
              });
              discovery.on('complete', function () {
                _this2.postMessage((0, _builder.UiMessage)(_constants.UI.SELECT_ACCOUNT, {
                  type: 'end',
                  coinInfo: coinInfo
                }));
              }); // get accounts with addresses (tokens)

              discovery.start('tokens')["catch"](function (error) {
                // catch error from discovery process
                dfd.reject(error);
              }); // set select account view
              // this view will be updated from discovery events

              this.postMessage((0, _builder.UiMessage)(_constants.UI.SELECT_ACCOUNT, {
                type: 'start',
                accountTypes: discovery.types.map(function (t) {
                  return t.type;
                }),
                coinInfo: coinInfo
              })); // wait for user action

              _context3.next = 24;
              return dfd.promise;

            case 24:
              uiResp = _context3.sent;
              discovery.removeAllListeners();
              discovery.stop();

              if (discovery.completed) {
                _context3.next = 30;
                break;
              }

              _context3.next = 30;
              return (0, _promiseUtils.resolveAfter)(501);

            case 30:
              account = discovery.accounts[uiResp.payload];
              this.params.coinInfo = (0, _CoinInfo.fixCoinInfoNetwork)(this.params.coinInfo, account.address_n);
              _context3.next = 34;
              return blockchain.getAccountUtxo(account.descriptor);

            case 34:
              utxo = _context3.sent;
              return _context3.abrupt("return", {
                account: account,
                utxo: utxo
              });

            case 36:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function selectAccount() {
      return _selectAccount.apply(this, arguments);
    }

    return selectAccount;
  }();

  _proto.selectFee = /*#__PURE__*/function () {
    var _selectFee = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(account, utxo) {
      var _this$params2, coinInfo, outputs, blockchain, composer, hasFunds;

      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _this$params2 = this.params, coinInfo = _this$params2.coinInfo, outputs = _this$params2.outputs; // get backend instance (it should be initialized before)

              _context4.next = 3;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 3:
              blockchain = _context4.sent;
              composer = new _TransactionComposer["default"]({
                account: account,
                utxo: utxo,
                coinInfo: coinInfo,
                outputs: outputs
              });
              _context4.next = 7;
              return composer.init(blockchain);

            case 7:
              // try to compose multiple transactions with different fee levels
              // check if any of composed transactions is valid
              hasFunds = composer.composeAllFeeLevels();

              if (hasFunds) {
                _context4.next = 13;
                break;
              }

              // show error view
              this.postMessage((0, _builder.UiMessage)(_constants.UI.INSUFFICIENT_FUNDS)); // wait few seconds...

              _context4.next = 12;
              return (0, _promiseUtils.resolveAfter)(2000, null);

            case 12:
              return _context4.abrupt("return", 'change-account');

            case 13:
              // set select account view
              // this view will be updated from discovery events
              this.postMessage((0, _builder.UiMessage)(_constants.UI.SELECT_FEE, {
                feeLevels: composer.getFeeLevelList(),
                coinInfo: this.params.coinInfo
              })); // wait for user action

              return _context4.abrupt("return", this._selectFeeUiResponse(composer));

            case 15:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function selectFee(_x3, _x4) {
      return _selectFee.apply(this, arguments);
    }

    return selectFee;
  }();

  _proto._selectFeeUiResponse = /*#__PURE__*/function () {
    var _selectFeeUiResponse2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(composer) {
      var resp;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return this.createUiPromise(_constants.UI.RECEIVE_FEE, this.device).promise;

            case 2:
              resp = _context5.sent;
              _context5.t0 = resp.payload.type;
              _context5.next = _context5.t0 === 'compose-custom' ? 6 : _context5.t0 === 'send' ? 9 : 10;
              break;

            case 6:
              // recompose custom fee level with requested value
              composer.composeCustomFee(resp.payload.value);
              this.postMessage((0, _builder.UiMessage)(_constants.UI.UPDATE_CUSTOM_FEE, {
                feeLevels: composer.getFeeLevelList(),
                coinInfo: this.params.coinInfo
              })); // wait for user action

              return _context5.abrupt("return", this._selectFeeUiResponse(composer));

            case 9:
              return _context5.abrupt("return", this._sign(composer.composed[resp.payload.value]));

            case 10:
              return _context5.abrupt("return", 'change-account');

            case 11:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function _selectFeeUiResponse(_x5) {
      return _selectFeeUiResponse2.apply(this, arguments);
    }

    return _selectFeeUiResponse;
  }();

  _proto._sign = /*#__PURE__*/function () {
    var _sign2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(tx) {
      var _this3 = this;

      var coinInfo, options, inputs, outputs, refTxs, refTxsIds, blockchain, rawTxs, signTxMethod, response, _blockchain, txid;

      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (!(tx.type !== 'final')) {
                _context6.next = 2;
                break;
              }

              throw _constants.ERRORS.TypedError('Runtime', 'ComposeTransaction: Trying to sign unfinished tx');

            case 2:
              coinInfo = this.params.coinInfo;
              options = {};

              if (coinInfo.network.consensusBranchId) {
                // zcash, TODO: get constants from blockbook: https://github.com/trezor/trezor-suite/issues/3749
                options.overwintered = true;
                options.version = 4;
                options.version_group_id = 0x892f2085;
                options.branch_id = 0xe9ff75a6;
              }

              if (coinInfo.hasTimestamp) {
                // peercoin, capricoin
                options.timestamp = Math.round(new Date().getTime() / 1000);
              }

              inputs = tx.transaction.inputs.map(function (inp) {
                return (0, _tx.inputToTrezor)(inp, _this3.params.sequence || 0xffffffff);
              });
              outputs = tx.transaction.outputs.sorted.map(function (out) {
                return (0, _tx.outputToTrezor)(out, coinInfo);
              });
              refTxs = [];
              refTxsIds = (0, _tx.getReferencedTransactions)(inputs);

              if (!(refTxsIds.length > 0)) {
                _context6.next = 18;
                break;
              }

              _context6.next = 13;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 13:
              blockchain = _context6.sent;
              _context6.next = 16;
              return blockchain.getTransactions(refTxsIds);

            case 16:
              rawTxs = _context6.sent;
              refTxs = (0, _tx.transformReferencedTransactions)(rawTxs, coinInfo);

            case 18:
              signTxMethod = !this.device.unavailableCapabilities.replaceTransaction ? _signtx["default"] : _signtxLegacy["default"];
              _context6.next = 21;
              return signTxMethod(this.device.getCommands().typedCall.bind(this.device.getCommands()), inputs, outputs, refTxs, options, coinInfo);

            case 21:
              response = _context6.sent;
              _context6.next = 24;
              return (0, _signtxVerify.verifyTx)(this.device.getCommands().getHDNode.bind(this.device.getCommands()), inputs, outputs, response.serializedTx, coinInfo);

            case 24:
              if (!this.params.push) {
                _context6.next = 32;
                break;
              }

              _context6.next = 27;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 27:
              _blockchain = _context6.sent;
              _context6.next = 30;
              return _blockchain.pushTransaction(response.serializedTx);

            case 30:
              txid = _context6.sent;
              return _context6.abrupt("return", _objectSpread(_objectSpread({}, response), {}, {
                txid: txid
              }));

            case 32:
              return _context6.abrupt("return", response);

            case 33:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function _sign(_x6) {
      return _sign2.apply(this, arguments);
    }

    return _sign;
  }();

  _proto.dispose = function dispose() {
    var discovery = this.discovery;

    if (discovery) {
      discovery.stop();
      discovery.removeAllListeners();
      this.discovery = undefined;
    }
  };

  return ComposeTransaction;
}(_AbstractMethod2["default"]);

exports["default"] = ComposeTransaction;