"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _utxoLib = require("@trezor/utxo-lib");

var _Fees = _interopRequireDefault(require("./Fees"));

var _BlockchainLink = _interopRequireDefault(require("../../../backend/BlockchainLink"));

var _pathUtils = require("../../../utils/pathUtils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var TransactionComposer = /*#__PURE__*/function () {
  function TransactionComposer(options) {
    var _this = this;

    (0, _defineProperty2["default"])(this, "blockHeight", 0);
    (0, _defineProperty2["default"])(this, "composed", {});
    this.account = options.account;
    this.outputs = options.outputs;
    this.coinInfo = options.coinInfo;
    this.blockHeight = 0;
    this.baseFee = options.baseFee || 0;
    this.skipPermutation = options.skipPermutation || false;
    this.feeLevels = new _Fees["default"](options.coinInfo); // map to @trezor/utxo-lib/compose format

    var addresses = options.account.addresses;
    var allAddresses = !addresses ? [] : addresses.used.concat(addresses.unused).concat(addresses.change).map(function (a) {
      return a.address;
    });
    this.utxos = options.utxo.flatMap(function (u) {
      // exclude amounts lower than dust limit if they are NOT required
      if (!u.required && new _bignumber["default"](u.amount).lte(_this.coinInfo.dustLimit)) return [];
      var addressPath = (0, _pathUtils.getHDPath)(u.path);
      return {
        index: u.vout,
        transactionHash: u.txid,
        value: u.amount,
        addressPath: [addressPath[3], addressPath[4]],
        height: u.blockHeight,
        tsize: 0,
        // doesn't matter
        vsize: 0,
        // doesn't matter
        coinbase: typeof u.coinbase === 'boolean' ? u.coinbase : false,
        // decide it it can be spent immediately (false) or after 100 conf (true)
        own: allAddresses.indexOf(u.address) >= 0,
        // decide if it can be spent immediately (own) or after 6 conf (not own)
        required: u.required
      };
    });
  }

  var _proto = TransactionComposer.prototype;

  _proto.init = /*#__PURE__*/function () {
    var _init = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(blockchain) {
      var _yield$blockchain$get, blockHeight;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return blockchain.getNetworkInfo();

            case 2:
              _yield$blockchain$get = _context.sent;
              blockHeight = _yield$blockchain$get.blockHeight;
              this.blockHeight = blockHeight;
              _context.next = 7;
              return this.feeLevels.load(blockchain);

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function init(_x) {
      return _init.apply(this, arguments);
    }

    return init;
  }() // Composing fee levels for SelectFee view in popup
  ;

  _proto.composeAllFeeLevels = function composeAllFeeLevels() {
    var _this2 = this;

    var levels = this.feeLevels.levels;
    if (this.utxos.length < 1) return false;
    this.composed = {};
    var atLeastOneValid = false;
    levels.forEach(function (level) {
      if (level.feePerUnit !== '0') {
        var tx = _this2.compose(level.feePerUnit);

        if (tx.type === 'final') {
          atLeastOneValid = true;
        }

        _this2.composed[level.label] = tx;
      }
    });

    if (!atLeastOneValid) {
      var lastLevel = levels[levels.length - 1];
      var lastFee = new _bignumber["default"](lastLevel.feePerUnit);

      while (lastFee.gt(this.coinInfo.minFee) && this.composed.custom === undefined) {
        lastFee = lastFee.minus(1);
        var tx = this.compose(lastFee.toString());

        if (tx.type === 'final') {
          this.feeLevels.updateCustomFee(lastFee.toString());
          this.composed.custom = tx;
          return true;
        }
      }

      return false;
    }

    return true;
  };

  _proto.composeCustomFee = function composeCustomFee(fee) {
    var tx = this.compose(fee);
    this.composed.custom = tx;

    if (tx.type === 'final') {
      this.feeLevels.updateCustomFee(tx.feePerByte);
    } else {
      this.feeLevels.updateCustomFee(fee);
    }
  };

  _proto.getFeeLevelList = function getFeeLevelList() {
    var _this3 = this;

    var list = [];
    var levels = this.feeLevels.levels;
    levels.forEach(function (level) {
      var tx = _this3.composed[level.label];

      if (tx && tx.type === 'final') {
        list.push({
          name: level.label,
          fee: tx.fee,
          feePerByte: level.feePerUnit,
          minutes: level.blocks * _this3.coinInfo.blocktime,
          total: tx.totalSpent
        });
      } else {
        list.push({
          name: level.label,
          fee: '0',
          disabled: true
        });
      }
    });
    return list;
  };

  _proto.compose = function compose(feeRate) {
    var account = this.account,
        coinInfo = this.coinInfo,
        baseFee = this.baseFee;
    var addresses = account.addresses;
    if (!addresses) return {
      type: 'error',
      error: 'ADDRESSES-NOT-SET'
    }; // find not used change address or fallback to the last in the list

    var changeAddress = addresses.change.find(function (a) {
      return !a.transfers;
    }) || addresses.change[addresses.change.length - 1];
    var changeId = (0, _pathUtils.getHDPath)(changeAddress.path).slice(-1)[0]; // get address id from the path
    // const inputAmounts = coinInfo.segwit || coinInfo.forkid !== null || coinInfo.network.consensusBranchId !== null;

    var enhancement = {
      baseFee: baseFee,
      floorBaseFee: false,
      dustOutputFee: 0
    }; // DOGE changed fee policy and requires:

    if (coinInfo.shortcut === 'DOGE') {
      enhancement.dustOutputFee = 1000000; // 0.01 DOGE for every output lower than dust (dust = 0.01 DOGE)
    }

    return (0, _utxoLib.composeTx)(_objectSpread({
      txType: account.type,
      utxos: this.utxos,
      outputs: this.outputs,
      height: this.blockHeight,
      feeRate: feeRate,
      skipPermutation: this.skipPermutation,
      basePath: account.address_n,
      network: coinInfo.network,
      changeId: changeId,
      changeAddress: changeAddress.address,
      dustThreshold: coinInfo.dustLimit
    }, enhancement));
  };

  _proto.dispose = function dispose() {// TODO
  };

  return TransactionComposer;
}();

exports["default"] = TransactionComposer;