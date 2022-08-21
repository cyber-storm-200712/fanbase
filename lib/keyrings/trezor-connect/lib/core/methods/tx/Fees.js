"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _BlockchainLink = _interopRequireDefault(require("../../../backend/BlockchainLink"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// this is workaround for the lack of information from 'trezor-common'
// we need to declare what does "high/normal/low" mean in block time (eg: normal BTC = 6 blocks = ~1 hour)
// coins other than BTC usually got 2 levels maximum (high/low) and we should consider to remove other levels from 'trezor-common'
var BLOCKS = {
  btc: {
    // blocktime ~ 600sec.
    high: 1,
    normal: 6,
    economy: 36,
    low: 144
  },
  bch: {
    // blocktime ~ 600sec.
    high: 1,
    normal: 5,
    economy: 10,
    low: 10
  },
  btg: {
    // blocktime ~ 600sec.
    high: 1,
    normal: 5,
    economy: 10,
    low: 10
  },
  dgb: {
    // blocktime ~ 20sec.
    high: 1,
    normal: 15,
    economy: 30,
    low: 60
  }
};

var getDefaultBlocks = function getDefaultBlocks(shortcut, label) {
  return BLOCKS[shortcut] && BLOCKS[shortcut][label] ? BLOCKS[shortcut][label] : -1;
}; // -1 for unknown


var feePerKB = function feePerKB(fee) {
  var bn = new _bignumber["default"](fee);
  if (bn.isNaN() || bn.lte('0')) return;
  return bn.div(1000).integerValue(_bignumber["default"].ROUND_HALF_CEIL).toString(); // return bn.toString();
};

var fillGap = function fillGap(from, step, size) {
  var fill = [];

  for (var i = from + step; i <= from + size; i += step) {
    fill.push(i);
  }

  return fill;
};

var findLowest = function findLowest(blocks) {
  var unique = [];
  blocks.forEach(function (item) {
    if (typeof item === 'string' && unique.indexOf(item) < 0) {
      unique.push(item);
    }
  });
  return unique[unique.length - 1];
};

var findNearest = function findNearest(requested, blocks) {
  var len = blocks.length;
  var knownValue = blocks[requested]; // return first occurrence of requested block value

  if (typeof knownValue === 'string') return knownValue;
  var lastKnownValue = blocks.slice().reverse().find(function (item) {
    return typeof item === 'string';
  });
  if (!lastKnownValue) return;
  var lastKnownIndex = blocks.indexOf(lastKnownValue); // there is no information for this block entry

  if (requested >= lastKnownIndex) {
    // requested block is greater than known range
    // return first occurrence of the lowest known fee
    return lastKnownValue;
  } // try to find nearest lower value


  var index = requested;

  while (typeof blocks[index] !== 'string' && index < len) {
    index++;
  }

  return blocks[index];
};

var findBlocksForFee = function findBlocksForFee(feePerUnit, blocks) {
  var bn = new _bignumber["default"](feePerUnit); // find first occurrence of value lower or equal than requested

  var lower = blocks.find(function (b) {
    return typeof b === 'string' && bn.gte(b);
  });
  if (!lower) return -1; // if not found get latest know value

  return blocks.indexOf(lower);
};

var FeeLevels = /*#__PURE__*/function () {
  function FeeLevels(coinInfo) {
    (0, _defineProperty2["default"])(this, "blocks", []);
    this.coinInfo = coinInfo;
    var shortcut = coinInfo.shortcut.toLowerCase();

    if (coinInfo.type === 'ethereum') {
      // unlike the others, ethereum got additional value "feeLimit" in coinInfo (Gas limit)
      this.levels = coinInfo.defaultFees.map(function (level) {
        return _objectSpread(_objectSpread({}, level), {}, {
          blocks: -1 // blocks unknown

        });
      });
      return;
    } // sort fee levels from coinInfo
    // and transform in to FeeLevel object


    var keys = Object.keys(coinInfo.defaultFees);
    this.levels = keys.sort(function (levelA, levelB) {
      return coinInfo.defaultFees[levelB] - coinInfo.defaultFees[levelA];
    }).map(function (level) {
      var label = level.toLowerCase(); // string !== 'high' | 'normal'....

      var blocks = getDefaultBlocks(shortcut, label); // TODO: get this value from trezor-common

      return {
        label: label,
        feePerUnit: coinInfo.defaultFees[level].toString(),
        blocks: blocks
      };
    });
  }

  var _proto = FeeLevels.prototype;

  _proto.loadMisc = /*#__PURE__*/function () {
    var _loadMisc = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(blockchain) {
      var _yield$blockchain$est, response;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return blockchain.estimateFee({
                blocks: [1]
              });

            case 3:
              _yield$blockchain$est = _context.sent;
              response = _yield$blockchain$est[0];
              // misc coins should have only one FeeLevel (normal)
              this.levels[0] = _objectSpread(_objectSpread(_objectSpread({}, this.levels[0]), response), {}, {
                // validate `feePerUnit` from the backend
                // should be lower than `coinInfo.maxFee` and higher than `coinInfo.minFee`
                // xrp sends values from 1 to very high number occasionally
                // see: https://github.com/trezor/trezor-suite/blob/develop/packages/blockchain-link/src/workers/ripple/index.ts#L316
                feePerUnit: Math.min(this.coinInfo.maxFee, Math.max(this.coinInfo.minFee, parseInt(response.feePerUnit, 10))).toString()
              });
              _context.next = 10;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](0);

            case 10:
              return _context.abrupt("return", this.levels);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 8]]);
    }));

    function loadMisc(_x) {
      return _loadMisc.apply(this, arguments);
    }

    return loadMisc;
  }();

  _proto.load = /*#__PURE__*/function () {
    var _load = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(blockchain) {
      var _this = this;

      var blocks, response, lowest;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (!(this.coinInfo.type !== 'bitcoin')) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt("return", this.loadMisc(blockchain));

            case 2:
              // only for bitcoin-like
              blocks = fillGap(0, 1, 10);

              if (this.levels.length > 1) {
                // multiple levels
                blocks = this.levels.map(function (l) {
                  return l.blocks;
                }).reduce(function (result, bl) {
                  // return first value
                  if (result.length === 0) return result.concat([bl]); // get previous block request

                  var from = result[result.length - 1]; // calculate gap between previous and current

                  var gap = bl - from; // if gap is lower than 30 blocks (normal and economy)
                  // fill every block in range
                  // otherwise fill every 6th block (1h)

                  var incr = gap <= 30 ? 1 : 6;
                  var fill = fillGap(from, incr, gap); // add to result

                  return result.concat(fill);
                }, []);
              }

              _context2.prev = 4;
              _context2.next = 7;
              return blockchain.estimateFee({
                blocks: blocks
              });

            case 7:
              response = _context2.sent;
              response.forEach(function (r, i) {
                _this.blocks[blocks[i]] = feePerKB(r.feePerUnit);
              });

              if (this.levels.length === 1) {
                lowest = findLowest(this.blocks);

                if (typeof lowest === 'string') {
                  this.levels[0].blocks = this.blocks.indexOf(lowest);
                  this.levels[0].feePerUnit = lowest;
                }
              } else {
                this.levels.forEach(function (l) {
                  var updatedValue = findNearest(l.blocks, _this.blocks);

                  if (typeof updatedValue === 'string') {
                    l.blocks = _this.blocks.indexOf(updatedValue);
                    l.feePerUnit = updatedValue;
                  }
                });
              }

              _context2.next = 14;
              break;

            case 12:
              _context2.prev = 12;
              _context2.t0 = _context2["catch"](4);

            case 14:
              return _context2.abrupt("return", this.levels);

            case 15:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[4, 12]]);
    }));

    function load(_x2) {
      return _load.apply(this, arguments);
    }

    return load;
  }();

  _proto.updateCustomFee = function updateCustomFee(feePerUnit) {
    // remove "custom" level from list
    this.levels = this.levels.filter(function (l) {
      return l.label !== 'custom';
    }); // recreate "custom" level

    var blocks = findBlocksForFee(feePerUnit, this.blocks);
    this.levels.push({
      label: 'custom',
      feePerUnit: feePerUnit,
      blocks: blocks
    });
  };

  return FeeLevels;
}();

exports["default"] = FeeLevels;