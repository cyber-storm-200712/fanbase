"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _pathUtils = require("../../utils/pathUtils");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _builder = require("../../message/builder");

var _CoinInfo = require("../../data/CoinInfo");

var _accountUtils = require("../../utils/accountUtils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var GetPublicKey = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(GetPublicKey, _AbstractMethod);

  function GetPublicKey() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _AbstractMethod.call.apply(_AbstractMethod, [this].concat(args)) || this;
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "params", []);
    return _this;
  }

  var _proto = GetPublicKey.prototype;

  _proto.init = function init() {
    var _this2 = this;

    this.requiredPermissions = ['read'];
    this.info = 'Export public key'; // create a bundle with only one batch if bundle doesn't exists

    this.hasBundle = !!this.payload.bundle;
    var payload = !this.payload.bundle ? _objectSpread(_objectSpread({}, this.payload), {}, {
      bundle: [this.payload]
    }) : this.payload; // validate bundle type

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'bundle',
      type: 'array'
    }]);
    payload.bundle.forEach(function (batch) {
      // validate incoming parameters for each batch
      (0, _paramsValidator.validateParams)(batch, [{
        name: 'path',
        required: true
      }, {
        name: 'coin',
        type: 'string'
      }, {
        name: 'crossChain',
        type: 'boolean'
      }, {
        name: 'showOnTrezor',
        type: 'boolean'
      }]);
      var coinInfo;

      if (batch.coin) {
        coinInfo = (0, _CoinInfo.getBitcoinNetwork)(batch.coin);
      }

      var path = (0, _pathUtils.validatePath)(batch.path, coinInfo ? 3 : 0);

      if (coinInfo && !batch.crossChain) {
        (0, _paramsValidator.validateCoinPath)(coinInfo, path);
      } else if (!coinInfo) {
        coinInfo = (0, _CoinInfo.getBitcoinNetwork)(path);
      }

      var showOnTrezor = false;

      if (Object.prototype.hasOwnProperty.call(batch, 'showOnTrezor')) {
        showOnTrezor = batch.showOnTrezor;
      }

      _this2.params.push({
        address_n: path,
        coinInfo: coinInfo,
        show_display: showOnTrezor
      }); // set required firmware from coinInfo support


      if (coinInfo) {
        _this2.firmwareRange = (0, _paramsValidator.getFirmwareRange)(_this2.name, coinInfo, _this2.firmwareRange);
      }
    });
  };

  _proto.confirmation = /*#__PURE__*/function () {
    var _confirmation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var uiPromise, label, uiResp;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!this.confirmed) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", true);

            case 2:
              _context.next = 4;
              return this.getPopupPromise().promise;

            case 4:
              // initialize user response promise
              uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

              if (this.params.length > 1) {
                label = 'Export multiple public keys';
              } else {
                label = (0, _accountUtils.getPublicKeyLabel)(this.params[0].address_n, this.params[0].coinInfo);
              } // request confirmation view


              this.postMessage((0, _builder.UiMessage)(UI.REQUEST_CONFIRMATION, {
                view: 'export-xpub',
                label: label
              })); // wait for user action

              _context.next = 9;
              return uiPromise.promise;

            case 9:
              uiResp = _context.sent;
              this.confirmed = uiResp.payload;
              return _context.abrupt("return", this.confirmed);

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function confirmation() {
      return _confirmation.apply(this, arguments);
    }

    return confirmation;
  }();

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var responses, cmd, i, batch, response;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              responses = [];
              cmd = this.device.getCommands();
              i = 0;

            case 3:
              if (!(i < this.params.length)) {
                _context2.next = 13;
                break;
              }

              batch = this.params[i];
              _context2.next = 7;
              return cmd.getHDNode(batch.address_n, batch.coinInfo, true, batch.show_display);

            case 7:
              response = _context2.sent;
              responses.push(response);

              if (this.hasBundle) {
                // send progress
                this.postMessage((0, _builder.UiMessage)(UI.BUNDLE_PROGRESS, {
                  progress: i,
                  response: response
                }));
              }

            case 10:
              i++;
              _context2.next = 3;
              break;

            case 13:
              return _context2.abrupt("return", this.hasBundle ? responses : responses[0]);

            case 14:
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

  return GetPublicKey;
}(_AbstractMethod2["default"]);

exports["default"] = GetPublicKey;