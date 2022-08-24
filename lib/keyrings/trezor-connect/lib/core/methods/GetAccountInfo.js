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

var _Discovery = _interopRequireDefault(require("./helpers/Discovery"));

var _paramsValidator = require("./helpers/paramsValidator");

var _pathUtils = require("../../utils/pathUtils");

var _accountUtils = require("../../utils/accountUtils");

var _promiseUtils = require("../../utils/promiseUtils");

var _CoinInfo = require("../../data/CoinInfo");

var _constants = require("../../constants");

var _builder = require("../../message/builder");

var _BlockchainLink = require("../../backend/BlockchainLink");

var _protobuf = require("../../types/trezor/protobuf");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var GetAccountInfo = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(GetAccountInfo, _AbstractMethod);

  function GetAccountInfo() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _AbstractMethod.call.apply(_AbstractMethod, [this].concat(args)) || this;
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "disposed", false);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "discovery", undefined);
    return _this;
  }

  var _proto = GetAccountInfo.prototype;

  _proto.init = function init() {
    var _this2 = this;

    this.requiredPermissions = ['read'];
    this.info = 'Export account info';
    this.useDevice = true;
    this.useUi = true; // assume that device will not be used

    var willUseDevice = false; // create a bundle with only one batch if bundle doesn't exists

    this.hasBundle = !!this.payload.bundle;
    var payload = !this.payload.bundle ? _objectSpread(_objectSpread({}, this.payload), {}, {
      bundle: [this.payload]
    }) : this.payload; // validate bundle type

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'bundle',
      type: 'array'
    }, {
      name: 'derivationType',
      type: 'number'
    }]);
    this.params = payload.bundle.map(function (batch) {
      // validate incoming parameters
      (0, _paramsValidator.validateParams)(batch, [{
        name: 'coin',
        type: 'string',
        required: true
      }, {
        name: 'descriptor',
        type: 'string'
      }, {
        name: 'path',
        type: 'string'
      }, {
        name: 'details',
        type: 'string'
      }, {
        name: 'tokens',
        type: 'string'
      }, {
        name: 'page',
        type: 'number'
      }, {
        name: 'pageSize',
        type: 'number'
      }, {
        name: 'from',
        type: 'number'
      }, {
        name: 'to',
        type: 'number'
      }, {
        name: 'contractFilter',
        type: 'string'
      }, {
        name: 'gap',
        type: 'number'
      }, {
        name: 'marker',
        type: 'object'
      }, {
        name: 'defaultAccountType',
        type: 'string'
      }]); // validate coin info

      var coinInfo = (0, _CoinInfo.getCoinInfo)(batch.coin);

      if (!coinInfo) {
        throw _constants.ERRORS.TypedError('Method_UnknownCoin');
      } // validate backend


      (0, _BlockchainLink.isBackendSupported)(coinInfo); // validate path if exists

      var address_n = [];

      if (batch.path) {
        address_n = (0, _pathUtils.validatePath)(batch.path, 3); // since there is no descriptor device will be used

        willUseDevice = typeof batch.descriptor !== 'string';
      }

      if (!batch.path && !batch.descriptor) {
        if (payload.bundle.length > 1) {
          throw Error('Discovery for multiple coins in not supported');
        } // device will be used in Discovery


        willUseDevice = true;
      } // set firmware range


      _this2.firmwareRange = (0, _paramsValidator.getFirmwareRange)(_this2.name, coinInfo, _this2.firmwareRange);
      return _objectSpread(_objectSpread({}, batch), {}, {
        address_n: address_n,
        coinInfo: coinInfo
      });
    });
    this.useDevice = willUseDevice;
    this.useUi = willUseDevice;
    this.derivationType = typeof payload.derivationType !== 'undefined' ? payload.derivationType : _protobuf.Enum_CardanoDerivationType.ICARUS_TREZOR;
  };

  _proto.confirmation = /*#__PURE__*/function () {
    var _confirmation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var uiPromise, keys, str, uiResp;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.getPopupPromise().promise;

            case 2:
              // initialize user response promise
              uiPromise = this.createUiPromise(_constants.UI.RECEIVE_CONFIRMATION, this.device);

              if (this.params.length === 1 && !this.params[0].path && !this.params[0].descriptor) {
                // request confirmation view
                this.postMessage((0, _builder.UiMessage)(_constants.UI.REQUEST_CONFIRMATION, {
                  view: 'export-account-info',
                  label: "Export info for " + this.params[0].coinInfo.label + " account of your selection",
                  customConfirmButton: {
                    label: 'Proceed to account selection',
                    className: 'not-empty-css'
                  }
                }));
              } else {
                keys = {};
                this.params.forEach(function (b) {
                  if (!keys[b.coinInfo.label]) {
                    keys[b.coinInfo.label] = {
                      coinInfo: b.coinInfo,
                      values: []
                    };
                  }

                  keys[b.coinInfo.label].values.push(b.descriptor || b.address_n);
                }); // prepare html for popup

                str = [];
                Object.keys(keys).forEach(function (k, _i, _a) {
                  var details = keys[k];
                  details.values.forEach(function (acc) {
                    // if (i === 0) str += this.params.length > 1 ? ': ' : ' ';
                    // if (i > 0) str += ', ';
                    str.push('<span>');
                    str.push(k);
                    str.push(' ');

                    if (typeof acc === 'string') {
                      str.push(acc);
                    } else {
                      str.push((0, _accountUtils.getAccountLabel)(acc, details.coinInfo));
                    }

                    str.push('</span>');
                  });
                });
                this.postMessage((0, _builder.UiMessage)(_constants.UI.REQUEST_CONFIRMATION, {
                  view: 'export-account-info',
                  label: "Export info for: " + str.join('')
                }));
              } // wait for user action


              _context.next = 6;
              return uiPromise.promise;

            case 6:
              uiResp = _context.sent;
              return _context.abrupt("return", uiResp.payload);

            case 8:
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

  _proto.noBackupConfirmation = /*#__PURE__*/function () {
    var _noBackupConfirmation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var uiPromise, uiResp;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.getPopupPromise().promise;

            case 2:
              // initialize user response promise
              uiPromise = this.createUiPromise(_constants.UI.RECEIVE_CONFIRMATION, this.device); // request confirmation view

              this.postMessage((0, _builder.UiMessage)(_constants.UI.REQUEST_CONFIRMATION, {
                view: 'no-backup'
              })); // wait for user action

              _context2.next = 6;
              return uiPromise.promise;

            case 6:
              uiResp = _context2.sent;
              return _context2.abrupt("return", uiResp.payload);

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function noBackupConfirmation() {
      return _noBackupConfirmation.apply(this, arguments);
    }

    return noBackupConfirmation;
  }() // override AbstractMethod function
  // this is a special case where we want to check firmwareRange in bundle
  // and return error with bundle indexes
  ;

  _proto.checkFirmwareRange =
  /*#__PURE__*/
  function () {
    var _checkFirmwareRange = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(isUsingPopup) {
      var defaultRange, invalid, i, exception;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!(isUsingPopup || this.params.length === 1)) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return", _AbstractMethod.prototype.checkFirmwareRange.call(this, isUsingPopup));

            case 2:
              // for trusted mode check each batch and return error with invalid bundle indexes
              defaultRange = {
                '1': {
                  min: '1.0.0',
                  max: '0'
                },
                '2': {
                  min: '2.0.0',
                  max: '0'
                }
              }; // find invalid ranges

              invalid = [];
              i = 0;

            case 5:
              if (!(i < this.params.length)) {
                _context3.next = 14;
                break;
              }

              // set FW range for current batch
              this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, this.params[i].coinInfo, defaultRange);
              _context3.next = 9;
              return _AbstractMethod.prototype.checkFirmwareRange.call(this, false);

            case 9:
              exception = _context3.sent;

              if (exception) {
                invalid.push({
                  index: i,
                  exception: exception,
                  coin: this.params[i].coin
                });
              }

            case 11:
              i++;
              _context3.next = 5;
              break;

            case 14:
              if (!(invalid.length > 0)) {
                _context3.next = 16;
                break;
              }

              throw _constants.ERRORS.TypedError('Method_Discovery_BundleException', JSON.stringify(invalid));

            case 16:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function checkFirmwareRange(_x) {
      return _checkFirmwareRange.apply(this, arguments);
    }

    return checkFirmwareRange;
  }();

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
      var _this3 = this;

      var responses, sendProgress, i, request, address_n, descriptor, legacyXpub, accountDescriptor, blockchain, info, utxo, account;
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!(this.params.length === 1 && !this.params[0].address_n && !this.params[0].descriptor)) {
                _context4.next = 2;
                break;
              }

              return _context4.abrupt("return", this.discover(this.params[0]));

            case 2:
              responses = [];

              sendProgress = function sendProgress(progress, response, error) {
                if (!_this3.hasBundle || _this3.device && _this3.device.getCommands().disposed) return; // send progress to UI

                _this3.postMessage((0, _builder.UiMessage)(_constants.UI.BUNDLE_PROGRESS, {
                  progress: progress,
                  response: response,
                  error: error
                }));
              };

              i = 0;

            case 5:
              if (!(i < this.params.length)) {
                _context4.next = 68;
                break;
              }

              request = this.params[i];
              address_n = request.address_n;
              descriptor = request.descriptor;
              legacyXpub = void 0;

              if (!this.disposed) {
                _context4.next = 12;
                break;
              }

              return _context4.abrupt("break", 68);

            case 12:
              if (!(address_n && typeof descriptor !== 'string')) {
                _context4.next = 29;
                break;
              }

              _context4.prev = 13;
              _context4.next = 16;
              return this.device.getCommands().getAccountDescriptor(request.coinInfo, address_n, this.derivationType);

            case 16:
              accountDescriptor = _context4.sent;

              if (accountDescriptor) {
                descriptor = accountDescriptor.descriptor;
                legacyXpub = accountDescriptor.legacyXpub;
              }

              _context4.next = 29;
              break;

            case 20:
              _context4.prev = 20;
              _context4.t0 = _context4["catch"](13);

              if (!this.hasBundle) {
                _context4.next = 28;
                break;
              }

              responses.push(null);
              sendProgress(i, null, _context4.t0.message); // eslint-disable-next-line no-continue

              return _context4.abrupt("continue", 65);

            case 28:
              throw _context4.t0;

            case 29:
              if (!this.disposed) {
                _context4.next = 31;
                break;
              }

              return _context4.abrupt("break", 68);

            case 31:
              _context4.prev = 31;

              if (!(typeof descriptor !== 'string')) {
                _context4.next = 34;
                break;
              }

              throw _constants.ERRORS.TypedError('Runtime', 'GetAccountInfo: descriptor not found');

            case 34:
              _context4.next = 36;
              return (0, _BlockchainLink.initBlockchain)(request.coinInfo, this.postMessage);

            case 36:
              blockchain = _context4.sent;

              if (!this.disposed) {
                _context4.next = 39;
                break;
              }

              return _context4.abrupt("break", 68);

            case 39:
              _context4.next = 41;
              return blockchain.getAccountInfo({
                descriptor: descriptor,
                details: request.details,
                tokens: request.tokens,
                page: request.page,
                pageSize: request.pageSize,
                from: request.from,
                to: request.to,
                contractFilter: request.contractFilter,
                gap: request.gap,
                marker: request.marker
              });

            case 41:
              info = _context4.sent;

              if (!this.disposed) {
                _context4.next = 44;
                break;
              }

              return _context4.abrupt("break", 68);

            case 44:
              utxo = void 0;

              if (!((0, _accountUtils.isUtxoBased)(request.coinInfo) && typeof request.details === 'string' && request.details !== 'basic')) {
                _context4.next = 49;
                break;
              }

              _context4.next = 48;
              return blockchain.getAccountUtxo(descriptor);

            case 48:
              utxo = _context4.sent;

            case 49:
              if (!this.disposed) {
                _context4.next = 51;
                break;
              }

              return _context4.abrupt("break", 68);

            case 51:
              // add account to responses
              account = _objectSpread(_objectSpread({
                path: request.path
              }, info), {}, {
                descriptor: descriptor,
                // override descriptor (otherwise eth checksum is lost)
                legacyXpub: legacyXpub,
                utxo: utxo
              });
              responses.push(account);
              sendProgress(i, account);
              _context4.next = 65;
              break;

            case 56:
              _context4.prev = 56;
              _context4.t1 = _context4["catch"](31);

              if (!this.hasBundle) {
                _context4.next = 64;
                break;
              }

              responses.push(null);
              sendProgress(i, null, _context4.t1.message); // eslint-disable-next-line no-continue

              return _context4.abrupt("continue", 65);

            case 64:
              throw _context4.t1;

            case 65:
              i++;
              _context4.next = 5;
              break;

            case 68:
              if (!this.disposed) {
                _context4.next = 70;
                break;
              }

              return _context4.abrupt("return", new Promise(function () {}));

            case 70:
              return _context4.abrupt("return", this.hasBundle ? responses : responses[0]);

            case 71:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this, [[13, 20], [31, 56]]);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  _proto.discover = /*#__PURE__*/function () {
    var _discover = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(request) {
      var _this4 = this;

      var coinInfo, defaultAccountType, blockchain, dfd, discovery, uiResp, account, info, utxo;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              coinInfo = request.coinInfo, defaultAccountType = request.defaultAccountType;
              _context5.next = 3;
              return (0, _BlockchainLink.initBlockchain)(coinInfo, this.postMessage);

            case 3:
              blockchain = _context5.sent;
              dfd = this.createUiPromise(_constants.UI.RECEIVE_ACCOUNT, this.device);
              discovery = new _Discovery["default"]({
                blockchain: blockchain,
                commands: this.device.getCommands(),
                derivationType: this.derivationType
              });
              discovery.on('progress', function (accounts) {
                _this4.postMessage((0, _builder.UiMessage)(_constants.UI.SELECT_ACCOUNT, {
                  type: 'progress',
                  coinInfo: coinInfo,
                  accounts: accounts
                }));
              });
              discovery.on('complete', function () {
                _this4.postMessage((0, _builder.UiMessage)(_constants.UI.SELECT_ACCOUNT, {
                  type: 'end',
                  coinInfo: coinInfo
                }));
              }); // catch error from discovery process

              discovery.start()["catch"](function (error) {
                dfd.reject(error);
              }); // set select account view
              // this view will be updated from discovery events

              this.postMessage((0, _builder.UiMessage)(_constants.UI.SELECT_ACCOUNT, {
                type: 'start',
                accountTypes: discovery.types.map(function (t) {
                  return t.type;
                }),
                defaultAccountType: defaultAccountType,
                coinInfo: coinInfo
              })); // wait for user action

              _context5.next = 12;
              return dfd.promise;

            case 12:
              uiResp = _context5.sent;
              discovery.stop();
              account = discovery.accounts[uiResp.payload];

              if (discovery.completed) {
                _context5.next = 18;
                break;
              }

              _context5.next = 18;
              return (0, _promiseUtils.resolveAfter)(501);

            case 18:
              _context5.next = 20;
              return blockchain.getAccountInfo({
                descriptor: account.descriptor,
                details: request.details,
                tokens: request.tokens,
                page: request.page,
                pageSize: request.pageSize,
                from: request.from,
                to: request.to,
                contractFilter: request.contractFilter,
                gap: request.gap,
                marker: request.marker
              });

            case 20:
              info = _context5.sent;

              if (!((0, _accountUtils.isUtxoBased)(coinInfo) && typeof request.details === 'string' && request.details !== 'basic')) {
                _context5.next = 25;
                break;
              }

              _context5.next = 24;
              return blockchain.getAccountUtxo(account.descriptor);

            case 24:
              utxo = _context5.sent;

            case 25:
              return _context5.abrupt("return", _objectSpread(_objectSpread({
                path: (0, _pathUtils.getSerializedPath)(account.address_n)
              }, info), {}, {
                utxo: utxo
              }));

            case 26:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function discover(_x2) {
      return _discover.apply(this, arguments);
    }

    return discover;
  }();

  _proto.dispose = function dispose() {
    this.disposed = true;
    var discovery = this.discovery;

    if (discovery) {
      discovery.removeAllListeners();
      discovery.stop();
    }
  };

  return GetAccountInfo;
}(_AbstractMethod2["default"]);

exports["default"] = GetAccountInfo;