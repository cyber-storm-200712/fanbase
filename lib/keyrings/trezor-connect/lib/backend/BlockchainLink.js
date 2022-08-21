"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.dispose = exports.initBlockchain = exports.isBackendSupported = exports.setCustomBackend = exports.findBackend = exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _blockchainLink = _interopRequireDefault(require("@trezor/blockchain-link"));

var _builder = require("../message/builder");

var _constants = require("../constants");

var _workers = require("../env/node/workers");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var getWorker = function getWorker(type) {
  switch (type) {
    case 'blockbook':
      return _workers.BlockbookWorker;

    case 'ripple':
      return _workers.RippleWorker;

    case 'blockfrost':
      return _workers.BlockfrostWorker;

    default:
      return null;
  }
};

var Blockchain = /*#__PURE__*/function () {
  function Blockchain(options) {
    (0, _defineProperty2["default"])(this, "feeForBlock", []);
    (0, _defineProperty2["default"])(this, "feeTimestamp", 0);
    this.coinInfo = options.coinInfo;
    this.postMessage = options.postMessage;
    var settings = options.coinInfo.blockchainLink;

    if (!settings) {
      throw _constants.ERRORS.TypedError('Backend_NotSupported');
    }

    var worker = getWorker(settings.type);

    if (!worker) {
      throw _constants.ERRORS.TypedError('Backend_WorkerMissing', "BlockchainLink worker not found " + settings.type);
    }

    this.link = new _blockchainLink["default"]({
      name: this.coinInfo.shortcut,
      worker: worker,
      server: settings.url,
      debug: false
    });
  }

  var _proto = Blockchain.prototype;

  _proto.onError = function onError(error) {
    this.link.dispose();
    this.postMessage((0, _builder.BlockchainMessage)(_constants.BLOCKCHAIN.ERROR, {
      coin: this.coinInfo,
      error: error.message,
      code: error.code
    }));
    removeBackend(this); // eslint-disable-line no-use-before-define
  };

  _proto.init = /*#__PURE__*/function () {
    var _init = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var _this = this;

      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              this.link.on('connected', /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
                var info, shortcut;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return _this.link.getInfo();

                      case 2:
                        info = _context.sent;
                        // There is no `rippled` setting that defines which network it uses neither mainnet or testnet
                        // see: https://xrpl.org/parallel-networks.html
                        shortcut = _this.coinInfo.shortcut === 'tXRP' ? 'XRP' : _this.coinInfo.shortcut;

                        if (!(info.shortcut.toLowerCase() !== shortcut.toLowerCase())) {
                          _context.next = 7;
                          break;
                        }

                        _this.onError(_constants.ERRORS.TypedError('Backend_Invalid'));

                        return _context.abrupt("return");

                      case 7:
                        // eslint-disable-next-line no-use-before-define
                        setPreferredBacked(_this.coinInfo, info.url);

                        _this.postMessage((0, _builder.BlockchainMessage)(_constants.BLOCKCHAIN.CONNECT, _objectSpread({
                          coin: _this.coinInfo
                        }, info)));

                      case 9:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              })));
              this.link.on('disconnected', function () {
                _this.onError(_constants.ERRORS.TypedError('Backend_Disconnected'));
              });
              this.link.on('error', function (error) {
                _this.onError(_constants.ERRORS.TypedError('Backend_Error', error.message));
              });
              _context2.prev = 3;
              _context2.next = 6;
              return this.link.connect();

            case 6:
              _context2.next = 12;
              break;

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](3);
              this.onError(_constants.ERRORS.TypedError('Backend_Error', _context2.t0.message));
              throw _context2.t0;

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[3, 8]]);
    }));

    function init() {
      return _init.apply(this, arguments);
    }

    return init;
  }();

  _proto.getTransactions = function getTransactions(txs) {
    var _this2 = this;

    return Promise.all(txs.map(function (id) {
      return _this2.link.getTransaction(id);
    }));
  };

  _proto.getCurrentFiatRates = function getCurrentFiatRates(params) {
    return this.link.getCurrentFiatRates(params);
  };

  _proto.getFiatRatesForTimestamps = function getFiatRatesForTimestamps(params) {
    return this.link.getFiatRatesForTimestamps(params);
  };

  _proto.getAccountBalanceHistory = function getAccountBalanceHistory(params) {
    return this.link.getAccountBalanceHistory(params);
  };

  _proto.getNetworkInfo = function getNetworkInfo() {
    return this.link.getInfo();
  };

  _proto.getAccountInfo = function getAccountInfo(request) {
    return this.link.getAccountInfo(request);
  };

  _proto.getAccountUtxo = function getAccountUtxo(descriptor) {
    return this.link.getAccountUtxo(descriptor);
  };

  _proto.estimateFee = /*#__PURE__*/function () {
    var _estimateFee = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(request) {
      var _this3 = this;

      var blocks, now, outdated, unknownBlocks, fees;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              blocks = request.blocks;

              if (!blocks) {
                _context3.next = 12;
                break;
              }

              now = Date.now();
              outdated = now - this.feeTimestamp > 20 * 60 * 1000;
              unknownBlocks = blocks.filter(function () {
                return typeof _this3.feeForBlock !== 'string';
              });

              if (!outdated && unknownBlocks.length < 1) {// return cached
              } // get new values


              _context3.next = 8;
              return this.link.estimateFee(request);

            case 8:
              fees = _context3.sent;
              // cache blocks for future use
              blocks.forEach(function (block, index) {
                _this3.feeForBlock[block] = fees[index];
              });
              this.feeTimestamp = now;
              return _context3.abrupt("return", fees);

            case 12:
              return _context3.abrupt("return", this.link.estimateFee(request));

            case 13:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function estimateFee(_x) {
      return _estimateFee.apply(this, arguments);
    }

    return estimateFee;
  }();

  _proto.subscribe = /*#__PURE__*/function () {
    var _subscribe = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(accounts) {
      var _this4 = this;

      var blockSubscription;
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              // set block listener if it wasn't set before
              if (this.link.listenerCount('block') === 0) {
                this.link.on('block', function (block) {
                  _this4.postMessage((0, _builder.BlockchainMessage)(_constants.BLOCKCHAIN.BLOCK, _objectSpread({
                    coin: _this4.coinInfo
                  }, block)));
                });
              } // set notification listener if it wasn't set before


              if (this.link.listenerCount('notification') === 0) {
                this.link.on('notification', function (notification) {
                  _this4.postMessage((0, _builder.BlockchainMessage)(_constants.BLOCKCHAIN.NOTIFICATION, {
                    coin: _this4.coinInfo,
                    notification: notification
                  }));
                });
              }

              _context4.next = 4;
              return this.link.subscribe({
                type: 'block'
              });

            case 4:
              blockSubscription = _context4.sent;

              if (accounts) {
                _context4.next = 7;
                break;
              }

              return _context4.abrupt("return", blockSubscription);

            case 7:
              return _context4.abrupt("return", this.link.subscribe({
                type: 'accounts',
                accounts: accounts
              }));

            case 8:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function subscribe(_x2) {
      return _subscribe.apply(this, arguments);
    }

    return subscribe;
  }();

  _proto.subscribeFiatRates = function subscribeFiatRates(_currency) {
    var _this5 = this;

    // set block listener if it wasn't set before
    if (this.link.listenerCount('fiatRates') === 0) {
      this.link.on('fiatRates', function (_ref2) {
        var rates = _ref2.rates;

        _this5.postMessage((0, _builder.BlockchainMessage)(_constants.BLOCKCHAIN.FIAT_RATES_UPDATE, {
          coin: _this5.coinInfo,
          rates: rates
        }));
      });
    }

    return this.link.subscribe({
      type: 'fiatRates'
    });
  };

  _proto.unsubscribe = /*#__PURE__*/function () {
    var _unsubscribe = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(accounts) {
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (accounts) {
                _context5.next = 7;
                break;
              }

              this.link.removeAllListeners('block');
              this.link.removeAllListeners('fiatRates');
              this.link.removeAllListeners('notification'); // remove all subscriptions

              _context5.next = 6;
              return this.link.unsubscribe({
                type: 'fiatRates'
              });

            case 6:
              return _context5.abrupt("return", this.link.unsubscribe({
                type: 'block'
              }));

            case 7:
              return _context5.abrupt("return", this.link.unsubscribe({
                type: 'accounts',
                accounts: accounts
              }));

            case 8:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function unsubscribe(_x3) {
      return _unsubscribe.apply(this, arguments);
    }

    return unsubscribe;
  }();

  _proto.unsubscribeFiatRates = function unsubscribeFiatRates() {
    this.link.removeAllListeners('fiatRates');
    return this.link.unsubscribe({
      type: 'fiatRates'
    });
  };

  _proto.pushTransaction = function pushTransaction(tx) {
    return this.link.pushTransaction(tx);
  };

  _proto.disconnect = function disconnect() {
    this.link.removeAllListeners();
    this.link.disconnect();
    this.onError(_constants.ERRORS.TypedError('Backend_Disconnected'));
  };

  return Blockchain;
}();

exports["default"] = Blockchain;
var instances = [];
var customBackends = {};
var preferredBackends = {};

var removeBackend = function removeBackend(backend) {
  var index = instances.indexOf(backend);

  if (index >= 0) {
    instances.splice(index, 1);
  }
};

var findBackend = function findBackend(name) {
  for (var i = 0; i < instances.length; i++) {
    if (instances[i].coinInfo.name === name) {
      return instances[i];
    }
  }

  return null;
}; // keep backend as a preferred once connection is successfully made
// switching between urls could lead to side effects (mempool differences, non existing/missing pending transactions)


exports.findBackend = findBackend;

var setPreferredBacked = function setPreferredBacked(coinInfo, url) {
  if (!url) {
    delete preferredBackends[coinInfo.shortcut];
  } else if (coinInfo.blockchainLink) {
    coinInfo.blockchainLink.url = [url];
    preferredBackends[coinInfo.shortcut] = coinInfo;
  }
};

var setCustomBackend = function setCustomBackend(coinInfo, blockchainLink) {
  setPreferredBacked(coinInfo); // reset preferred backend

  if (!blockchainLink || blockchainLink.url.length === 0) {
    delete customBackends[coinInfo.shortcut];
  } else {
    customBackends[coinInfo.shortcut] = coinInfo;
    customBackends[coinInfo.shortcut].blockchainLink = blockchainLink;
  }
};

exports.setCustomBackend = setCustomBackend;

var isBackendSupported = function isBackendSupported(coinInfo) {
  var info = customBackends[coinInfo.shortcut] || coinInfo;

  if (!info.blockchainLink) {
    throw _constants.ERRORS.TypedError('Backend_NotSupported');
  }
};

exports.isBackendSupported = isBackendSupported;

var initBlockchain = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(coinInfo, postMessage) {
    var backend;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            backend = findBackend(coinInfo.name);

            if (backend) {
              _context6.next = 14;
              break;
            }

            backend = new Blockchain({
              coinInfo: preferredBackends[coinInfo.shortcut] || customBackends[coinInfo.shortcut] || coinInfo,
              postMessage: postMessage
            });
            instances.push(backend);
            _context6.prev = 4;
            _context6.next = 7;
            return backend.init();

          case 7:
            _context6.next = 14;
            break;

          case 9:
            _context6.prev = 9;
            _context6.t0 = _context6["catch"](4);
            removeBackend(backend);
            setPreferredBacked(coinInfo); // reset preferred backend

            throw _context6.t0;

          case 14:
            return _context6.abrupt("return", backend);

          case 15:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[4, 9]]);
  }));

  return function initBlockchain(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
}();

exports.initBlockchain = initBlockchain;

var dispose = function dispose() {
  while (instances.length > 0) {
    instances[0].disconnect();
  }
};

exports.dispose = dispose;