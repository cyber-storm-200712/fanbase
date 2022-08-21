"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _randombytes = _interopRequireDefault(require("randombytes"));

var _constants = require("../constants");

var hdnodeUtils = _interopRequireWildcard(require("../utils/hdnodeUtils"));

var _pathUtils = require("../utils/pathUtils");

var _accountUtils = require("../utils/accountUtils");

var _versionUtils = require("../utils/versionUtils");

var _CoinInfo = require("../data/CoinInfo");

var PROTO = _interopRequireWildcard(require("../types/trezor/protobuf"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var assertType = function assertType(res, resType) {
  var splitResTypes = resType.split('|');

  if (!splitResTypes.includes(res.type)) {
    throw _constants.ERRORS.TypedError('Runtime', "assertType: Response of unexpected type: " + res.type + ". Should be " + resType);
  }
};

var generateEntropy = function generateEntropy(len) {
  try {
    return (0, _randombytes["default"])(len);
  } catch (err) {
    throw _constants.ERRORS.TypedError('Runtime', 'generateEntropy: Environment does not support crypto random');
  }
};

var filterForLog = function filterForLog(type, msg) {
  var blacklist = {// PassphraseAck: {
    //     passphrase: '(redacted...)',
    // },
    // CipheredKeyValue: {
    //     value: '(redacted...)',
    // },
    // GetPublicKey: {
    //     address_n: '(redacted...)',
    // },
    // PublicKey: {
    //     node: '(redacted...)',
    //     xpub: '(redacted...)',
    // },
    // DecryptedMessage: {
    //     message: '(redacted...)',
    //     address: '(redacted...)',
    // },
  };

  if (type in blacklist) {
    return _objectSpread(_objectSpread({}, msg), blacklist[type]);
  }

  return msg;
};

var DeviceCommands = /*#__PURE__*/function () {
  // see DeviceCommands.cancel
  function DeviceCommands(device, transport, sessionId) {
    this.device = device;
    this.transport = transport;
    this.sessionId = sessionId;
    this.debug = false;
    this.disposed = false;
  }

  var _proto = DeviceCommands.prototype;

  _proto.dispose = function dispose() {
    this.disposed = true;
    this._cancelableRequest = undefined;
  };

  _proto.isDisposed = function isDisposed() {
    return this.disposed;
  };

  _proto.getPublicKey = /*#__PURE__*/function () {
    var _getPublicKey = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(address_n, coin_name, script_type, show_display) {
      var response;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (coin_name === void 0) {
                coin_name = 'Bitcoin';
              }

              _context.next = 3;
              return this.typedCall('GetPublicKey', 'PublicKey', {
                address_n: address_n,
                coin_name: coin_name,
                script_type: script_type,
                show_display: show_display
              });

            case 3:
              response = _context.sent;
              return _context.abrupt("return", response.message);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function getPublicKey(_x, _x2, _x3, _x4) {
      return _getPublicKey.apply(this, arguments);
    }

    return getPublicKey;
  }() // Validation of xpub
  ;

  _proto.getHDNode =
  /*#__PURE__*/
  function () {
    var _getHDNode = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(path, coinInfo, validation, showOnTrezor) {
      var network, scriptType, publicKey, suffix, childPath, resKey, childKey, response;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (validation === void 0) {
                validation = true;
              }

              if (showOnTrezor === void 0) {
                showOnTrezor = false;
              }

              if (!(!this.device.atLeast(['1.7.2', '2.0.10']) || !coinInfo)) {
                _context2.next = 4;
                break;
              }

              return _context2.abrupt("return", this.getBitcoinHDNode(path, coinInfo));

            case 4:
              if ((0, _pathUtils.isMultisigPath)(path)) {
                network = coinInfo.network;
              } else if ((0, _pathUtils.isSegwitPath)(path)) {
                network = (0, _CoinInfo.getSegwitNetwork)(coinInfo);
              } else if ((0, _pathUtils.isBech32Path)(path)) {
                network = (0, _CoinInfo.getBech32Network)(coinInfo);
              }

              scriptType = (0, _pathUtils.getScriptType)(path);

              if (!network) {
                network = coinInfo.network;

                if (scriptType !== 'SPENDADDRESS') {
                  scriptType = undefined;
                }
              }

              if (!(showOnTrezor || !validation)) {
                _context2.next = 13;
                break;
              }

              _context2.next = 10;
              return this.getPublicKey(path, coinInfo.name, scriptType, showOnTrezor);

            case 10:
              publicKey = _context2.sent;
              _context2.next = 22;
              break;

            case 13:
              suffix = 0;
              childPath = path.concat([suffix]);
              _context2.next = 17;
              return this.getPublicKey(path, coinInfo.name, scriptType);

            case 17:
              resKey = _context2.sent;
              _context2.next = 20;
              return this.getPublicKey(childPath, coinInfo.name, scriptType);

            case 20:
              childKey = _context2.sent;
              publicKey = hdnodeUtils.xpubDerive(resKey, childKey, suffix, network, coinInfo.network);

            case 22:
              response = {
                path: path,
                serializedPath: (0, _pathUtils.getSerializedPath)(path),
                childNum: publicKey.node.child_num,
                xpub: publicKey.xpub,
                chainCode: publicKey.node.chain_code,
                publicKey: publicKey.node.public_key,
                fingerprint: publicKey.node.fingerprint,
                depth: publicKey.node.depth
              };

              if (network !== coinInfo.network) {
                response.xpubSegwit = response.xpub;
                response.xpub = hdnodeUtils.convertXpub(publicKey.xpub, network, coinInfo.network);
              }

              return _context2.abrupt("return", response);

            case 25:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function getHDNode(_x5, _x6, _x7, _x8) {
      return _getHDNode.apply(this, arguments);
    }

    return getHDNode;
  }() // deprecated
  // legacy method (below FW 1.7.2 & 2.0.10), remove it after next "required" FW update.
  // keys are exported in BTC format and converted to proper format in hdnodeUtils
  // old firmware didn't return keys with proper prefix (ypub, Ltub.. and so on)
  ;

  _proto.getBitcoinHDNode =
  /*#__PURE__*/
  function () {
    var _getBitcoinHDNode = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(path, coinInfo, validation) {
      var publicKey, suffix, childPath, resKey, childKey, response, bech32Network, segwitNetwork;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (validation === void 0) {
                validation = true;
              }

              if (validation) {
                _context3.next = 7;
                break;
              }

              _context3.next = 4;
              return this.getPublicKey(path);

            case 4:
              publicKey = _context3.sent;
              _context3.next = 16;
              break;

            case 7:
              suffix = 0;
              childPath = path.concat([suffix]);
              _context3.next = 11;
              return this.getPublicKey(path);

            case 11:
              resKey = _context3.sent;
              _context3.next = 14;
              return this.getPublicKey(childPath);

            case 14:
              childKey = _context3.sent;
              publicKey = hdnodeUtils.xpubDerive(resKey, childKey, suffix);

            case 16:
              response = {
                path: path,
                serializedPath: (0, _pathUtils.getSerializedPath)(path),
                childNum: publicKey.node.child_num,
                xpub: coinInfo ? hdnodeUtils.convertBitcoinXpub(publicKey.xpub, coinInfo.network) : publicKey.xpub,
                chainCode: publicKey.node.chain_code,
                publicKey: publicKey.node.public_key,
                fingerprint: publicKey.node.fingerprint,
                depth: publicKey.node.depth
              }; // if requested path is a segwit or bech32
              // convert xpub to new format

              if (coinInfo) {
                bech32Network = (0, _CoinInfo.getBech32Network)(coinInfo);
                segwitNetwork = (0, _CoinInfo.getSegwitNetwork)(coinInfo);

                if (bech32Network && (0, _pathUtils.isBech32Path)(path)) {
                  response.xpubSegwit = hdnodeUtils.convertBitcoinXpub(publicKey.xpub, bech32Network);
                } else if (segwitNetwork && (0, _pathUtils.isSegwitPath)(path)) {
                  response.xpubSegwit = hdnodeUtils.convertBitcoinXpub(publicKey.xpub, segwitNetwork);
                }
              }

              return _context3.abrupt("return", response);

            case 19:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function getBitcoinHDNode(_x9, _x10, _x11) {
      return _getBitcoinHDNode.apply(this, arguments);
    }

    return getBitcoinHDNode;
  }();

  _proto.getAddress = /*#__PURE__*/function () {
    var _getAddress = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(_ref, coinInfo) {
      var address_n, show_display, multisig, script_type, response;
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              address_n = _ref.address_n, show_display = _ref.show_display, multisig = _ref.multisig, script_type = _ref.script_type;

              if (!script_type) {
                script_type = (0, _pathUtils.getScriptType)(address_n);

                if (script_type === 'SPENDMULTISIG' && !multisig) {
                  script_type = 'SPENDADDRESS';
                }
              }

              if (multisig && multisig.pubkeys) {
                // convert xpub strings to HDNodeTypes
                multisig.pubkeys.forEach(function (pk) {
                  if (typeof pk.node === 'string') {
                    pk.node = hdnodeUtils.xpubToHDNodeType(pk.node, coinInfo.network);
                  }
                });
              }

              _context4.next = 5;
              return this.typedCall('GetAddress', 'Address', {
                address_n: address_n,
                coin_name: coinInfo.name,
                show_display: show_display,
                multisig: multisig,
                script_type: script_type || 'SPENDADDRESS'
              });

            case 5:
              response = _context4.sent;
              return _context4.abrupt("return", {
                path: address_n,
                serializedPath: (0, _pathUtils.getSerializedPath)(address_n),
                address: response.message.address
              });

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function getAddress(_x12, _x13) {
      return _getAddress.apply(this, arguments);
    }

    return getAddress;
  }();

  _proto.ethereumGetAddress = /*#__PURE__*/function () {
    var _ethereumGetAddress = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(_ref2) {
      var address_n, show_display, response;
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              address_n = _ref2.address_n, show_display = _ref2.show_display;
              _context5.next = 3;
              return this.typedCall('EthereumGetAddress', 'EthereumAddress', {
                address_n: address_n,
                show_display: show_display
              });

            case 3:
              response = _context5.sent;
              return _context5.abrupt("return", {
                path: address_n,
                serializedPath: (0, _pathUtils.getSerializedPath)(address_n),
                address: response.message.address
              });

            case 5:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function ethereumGetAddress(_x14) {
      return _ethereumGetAddress.apply(this, arguments);
    }

    return ethereumGetAddress;
  }();

  _proto.ethereumGetPublicKey = /*#__PURE__*/function () {
    var _ethereumGetPublicKey = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(_ref3) {
      var address_n, show_display, suffix, childPath, resKey, childKey, publicKey;
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              address_n = _ref3.address_n, show_display = _ref3.show_display;

              if (this.device.atLeast(['1.8.1', '2.1.0'])) {
                _context6.next = 3;
                break;
              }

              return _context6.abrupt("return", this.getHDNode(address_n));

            case 3:
              suffix = 0;
              childPath = address_n.concat([suffix]);
              _context6.next = 7;
              return this.typedCall('EthereumGetPublicKey', 'EthereumPublicKey', {
                address_n: address_n,
                show_display: show_display
              });

            case 7:
              resKey = _context6.sent;
              _context6.next = 10;
              return this.typedCall('EthereumGetPublicKey', 'EthereumPublicKey', {
                address_n: childPath,
                show_display: false
              });

            case 10:
              childKey = _context6.sent;
              publicKey = hdnodeUtils.xpubDerive(resKey.message, childKey.message, suffix);
              return _context6.abrupt("return", {
                path: address_n,
                serializedPath: (0, _pathUtils.getSerializedPath)(address_n),
                childNum: publicKey.node.child_num,
                xpub: publicKey.xpub,
                chainCode: publicKey.node.chain_code,
                publicKey: publicKey.node.public_key,
                fingerprint: publicKey.node.fingerprint,
                depth: publicKey.node.depth
              });

            case 13:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function ethereumGetPublicKey(_x15) {
      return _ethereumGetPublicKey.apply(this, arguments);
    }

    return ethereumGetPublicKey;
  }();

  _proto.getDeviceState = function getDeviceState(networkType) {
    // cardano backwards compatibility. we only need this for firmware before initialize.derive_cardano message was introduced
    if (!this.device.atLeast('2.4.3')) {
      return this._getAddressForNetworkType(networkType);
    } // skipping network type parameter intentionally


    return this._getAddressForNetworkType(); // bitcoin.crypto.hash256(Buffer.from(secret, 'binary')).toString('hex');
  } // Sends an async message to the opened device.
  ;

  _proto.call =
  /*#__PURE__*/
  function () {
    var _call = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(type, msg) {
      var logMessage, res, _logMessage;

      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (msg === void 0) {
                msg = {};
              }

              if (this.debug) {
                logMessage = filterForLog(type, msg); // eslint-disable-next-line no-console

                console.log('[DeviceCommands] [call] Sending', type, logMessage, this.transport);
              }

              _context7.prev = 2;
              this.callPromise = this.transport.call(this.sessionId, type, msg, false);
              _context7.next = 6;
              return this.callPromise;

            case 6:
              res = _context7.sent;
              _logMessage = filterForLog(res.type, res.message);

              if (this.debug) {
                // eslint-disable-next-line no-console
                console.log('[DeviceCommands] [call] Received', res.type, _logMessage);
              }

              return _context7.abrupt("return", res);

            case 12:
              _context7.prev = 12;
              _context7.t0 = _context7["catch"](2);

              if (this.debug) {
                // eslint-disable-next-line no-console
                console.warn('[DeviceCommands] [call] Received error', _context7.t0);
              } // TODO: throw trezor error


              throw _context7.t0;

            case 16:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this, [[2, 12]]);
    }));

    function call(_x16, _x17) {
      return _call.apply(this, arguments);
    }

    return call;
  }();

  _proto.typedCall = /*#__PURE__*/function () {
    var _typedCall = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(type, resType, msg) {
      var response;
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              if (!this.disposed) {
                _context8.next = 2;
                break;
              }

              throw _constants.ERRORS.TypedError('Runtime', 'typedCall: DeviceCommands already disposed');

            case 2:
              _context8.next = 4;
              return this._commonCall(type, msg);

            case 4:
              response = _context8.sent;
              _context8.prev = 5;
              assertType(response, resType);
              _context8.next = 14;
              break;

            case 9:
              _context8.prev = 9;
              _context8.t0 = _context8["catch"](5);
              _context8.next = 13;
              return this.transport.read(this.sessionId, false);

            case 13:
              throw _context8.t0;

            case 14:
              return _context8.abrupt("return", response);

            case 15:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this, [[5, 9]]);
    }));

    function typedCall(_x18, _x19, _x20) {
      return _typedCall.apply(this, arguments);
    }

    return typedCall;
  }();

  _proto._commonCall = /*#__PURE__*/function () {
    var _commonCall2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(type, msg) {
      var resp;
      return _regenerator["default"].wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return this.call(type, msg);

            case 2:
              resp = _context9.sent;
              return _context9.abrupt("return", this._filterCommonTypes(resp));

            case 4:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));

    function _commonCall(_x21, _x22) {
      return _commonCall2.apply(this, arguments);
    }

    return _commonCall;
  }();

  _proto._filterCommonTypes = function _filterCommonTypes(res) {
    var _this = this;

    if (res.type === 'Failure') {
      var code = res.message.code;
      var message = res.message.message; // Model One does not send any message in firmware update
      // https://github.com/trezor/trezor-firmware/issues/1334

      if (code === 'Failure_FirmwareError' && !message) {
        message = 'Firmware installation failed';
      } // Failure_ActionCancelled message could be also missing
      // https://github.com/trezor/connect/issues/865


      if (code === 'Failure_ActionCancelled' && !message) {
        message = 'Action cancelled by user';
      } // pass code and message from firmware error


      return Promise.reject(new _constants.ERRORS.TrezorError(code, message));
    }

    if (res.type === 'Features') {
      return Promise.resolve(res);
    }

    if (res.message.code === '_Deprecated_ButtonRequest_PassphraseType') {
      // for backwards compatibility stick to old message type
      // which was part of protobuf in versions < 2.3.0
      res.message.code = 'ButtonRequest_PassphraseType';
    }

    if (res.type === 'ButtonRequest') {
      if (res.message.code === 'ButtonRequest_PassphraseEntry') {
        this.device.emit(_constants.DEVICE.PASSPHRASE_ON_DEVICE, this.device);
      } else {
        this.device.emit(_constants.DEVICE.BUTTON, this.device, res.message);
      }

      return this._commonCall('ButtonAck', {});
    }

    if (res.type === 'EntropyRequest') {
      return this._commonCall('EntropyAck', {
        entropy: generateEntropy(32).toString('hex')
      });
    }

    if (res.type === 'PinMatrixRequest') {
      return this._promptPin(res.message.type).then(function (pin) {
        return _this._commonCall('PinMatrixAck', {
          pin: pin
        });
      }, function () {
        return _this._commonCall('Cancel', {});
      });
    }

    if (res.type === 'PassphraseRequest') {
      var state = this.device.getInternalState();
      var legacy = this.device.useLegacyPassphrase();
      var legacyT1 = legacy && this.device.isT1(); // T1 fw lower than 1.9.0, passphrase is cached in internal state

      if (legacyT1 && typeof state === 'string') {
        return this._commonCall('PassphraseAck', {
          passphrase: state
        });
      } // TT fw lower than 2.3.0, entering passphrase on device


      if (legacy && res.message._on_device) {
        this.device.emit(_constants.DEVICE.PASSPHRASE_ON_DEVICE, this.device);
        return this._commonCall('PassphraseAck', {
          _state: state
        });
      }

      return this._promptPassphrase().then(function (response) {
        var passphrase = response.passphrase,
            passphraseOnDevice = response.passphraseOnDevice,
            cache = response.cache;

        if (legacyT1) {
          _this.device.setInternalState(cache ? passphrase : undefined);

          return _this._commonCall('PassphraseAck', {
            passphrase: passphrase
          });
        }

        if (legacy) {
          return _this._commonCall('PassphraseAck', {
            passphrase: passphrase,
            _state: state
          });
        }

        return !passphraseOnDevice ? _this._commonCall('PassphraseAck', {
          passphrase: passphrase
        }) : _this._commonCall('PassphraseAck', {
          on_device: true
        });
      }, function (err) {
        return _this._commonCall('Cancel', {})["catch"](function (e) {
          throw err || e;
        });
      });
    } // TT fw lower than 2.3.0, device send his current state
    // new passphrase design set this value from `features.session_id`


    if (res.type === 'Deprecated_PassphraseStateRequest') {
      var _state = res.message.state;
      this.device.setInternalState(_state);
      return this._commonCall('Deprecated_PassphraseStateAck', {});
    }

    if (res.type === 'WordRequest') {
      return this._promptWord(res.message.type).then(function (word) {
        return _this._commonCall('WordAck', {
          word: word
        });
      }, function () {
        return _this._commonCall('Cancel', {});
      });
    }

    return Promise.resolve(res);
  };

  _proto._getAddressForNetworkType = /*#__PURE__*/function () {
    var _getAddressForNetworkType2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10(networkType) {
      var _yield$this$typedCall, message, _yield$this$typedCall2, _message;

      return _regenerator["default"].wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.t0 = networkType;
              _context10.next = _context10.t0 === _constants.NETWORK.TYPES.cardano ? 3 : 8;
              break;

            case 3:
              _context10.next = 5;
              return this.typedCall('CardanoGetAddress', 'CardanoAddress', {
                // $FlowIssue TEMP proto, address_n_staking missing
                address_parameters: {
                  address_type: 8,
                  // Byron
                  address_n: [(0, _pathUtils.toHardened)(44), (0, _pathUtils.toHardened)(1815), (0, _pathUtils.toHardened)(0), 0, 0]
                },
                protocol_magic: 42,
                network_id: 0,
                // derivation type doesn't really matter as it is not recognized by older firmwares.
                // but it is a required field withing protobuf definitions so we must provide something here
                derivation_type: 2 // icarus_trezor

              });

            case 5:
              _yield$this$typedCall = _context10.sent;
              message = _yield$this$typedCall.message;
              return _context10.abrupt("return", message.address);

            case 8:
              _context10.next = 10;
              return this.typedCall('GetAddress', 'Address', {
                address_n: [(0, _pathUtils.toHardened)(44), (0, _pathUtils.toHardened)(1), (0, _pathUtils.toHardened)(0), 0, 0],
                coin_name: 'Testnet',
                script_type: 'SPENDADDRESS'
              });

            case 10:
              _yield$this$typedCall2 = _context10.sent;
              _message = _yield$this$typedCall2.message;
              return _context10.abrupt("return", _message.address);

            case 13:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));

    function _getAddressForNetworkType(_x23) {
      return _getAddressForNetworkType2.apply(this, arguments);
    }

    return _getAddressForNetworkType;
  }();

  _proto._promptPin = function _promptPin(type) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      if (_this2.device.listenerCount(_constants.DEVICE.PIN) > 0) {
        _this2._cancelableRequest = reject;

        _this2.device.emit(_constants.DEVICE.PIN, _this2.device, type, function (err, pin) {
          _this2._cancelableRequest = undefined;

          if (err || pin == null) {
            reject(err);
          } else {
            resolve(pin);
          }
        });
      } else {
        // eslint-disable-next-line no-console
        console.warn('[DeviceCommands] [call] PIN callback not configured, cancelling request');
        reject(_constants.ERRORS.TypedError('Runtime', '_promptPin: PIN callback not configured'));
      }
    });
  };

  _proto._promptPassphrase = function _promptPassphrase() {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      if (_this3.device.listenerCount(_constants.DEVICE.PASSPHRASE) > 0) {
        _this3._cancelableRequest = reject;

        _this3.device.emit(_constants.DEVICE.PASSPHRASE, _this3.device, function (response, error) {
          _this3._cancelableRequest = undefined;

          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        });
      } else {
        // eslint-disable-next-line no-console
        console.warn('[DeviceCommands] [call] Passphrase callback not configured, cancelling request');
        reject(_constants.ERRORS.TypedError('Runtime', '_promptPassphrase: Passphrase callback not configured'));
      }
    });
  };

  _proto._promptWord = function _promptWord(type) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      _this4._cancelableRequest = reject;

      _this4.device.emit(_constants.DEVICE.WORD, _this4.device, type, function (err, word) {
        _this4._cancelableRequest = undefined;

        if (err || word == null) {
          reject(err);
        } else {
          resolve(word.toLocaleLowerCase());
        }
      });
    });
  };

  _proto.getAccountDescriptor = /*#__PURE__*/function () {
    var _getAccountDescriptor = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11(coinInfo, indexOrPath, derivationType) {
      var address_n, resp, _resp, _yield$this$typedCall3, message, _yield$this$typedCall4, _message2;

      return _regenerator["default"].wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              address_n = Array.isArray(indexOrPath) ? indexOrPath : (0, _accountUtils.getAccountAddressN)(coinInfo, indexOrPath);

              if (!(coinInfo.type === 'bitcoin')) {
                _context11.next = 7;
                break;
              }

              _context11.next = 4;
              return this.getHDNode(address_n, coinInfo, false);

            case 4:
              resp = _context11.sent;

              if ((0, _pathUtils.isTaprootPath)(address_n)) {
                // wrap regular xpub into bitcoind native descriptor
                resp.xpubSegwit = "tr([5c9e228d/86'/" + (0, _pathUtils.fromHardened)(address_n[1]) + "'/" + (0, _pathUtils.fromHardened)(address_n[2]) + "']" + resp.xpub + "/<0;1>/*)";
              }

              return _context11.abrupt("return", {
                descriptor: resp.xpubSegwit || resp.xpub,
                legacyXpub: resp.xpub,
                address_n: address_n
              });

            case 7:
              if (!(coinInfo.type === 'ethereum')) {
                _context11.next = 12;
                break;
              }

              _context11.next = 10;
              return this.ethereumGetAddress({
                address_n: address_n
              });

            case 10:
              _resp = _context11.sent;
              return _context11.abrupt("return", {
                descriptor: _resp.address,
                address_n: address_n
              });

            case 12:
              if (!(coinInfo.shortcut === 'ADA' || coinInfo.shortcut === 'tADA')) {
                _context11.next = 20;
                break;
              }

              if (!(typeof derivationType === 'undefined')) {
                _context11.next = 15;
                break;
              }

              throw new Error('Derivation type is not specified');

            case 15:
              _context11.next = 17;
              return this.typedCall('CardanoGetPublicKey', 'CardanoPublicKey', {
                address_n: address_n,
                // $FlowIssue - is specified
                derivation_type: derivationType
              });

            case 17:
              _yield$this$typedCall3 = _context11.sent;
              message = _yield$this$typedCall3.message;
              return _context11.abrupt("return", {
                descriptor: message.xpub,
                address_n: address_n
              });

            case 20:
              if (!(coinInfo.shortcut === 'XRP' || coinInfo.shortcut === 'tXRP')) {
                _context11.next = 26;
                break;
              }

              _context11.next = 23;
              return this.typedCall('RippleGetAddress', 'RippleAddress', {
                address_n: address_n
              });

            case 23:
              _yield$this$typedCall4 = _context11.sent;
              _message2 = _yield$this$typedCall4.message;
              return _context11.abrupt("return", {
                descriptor: _message2.address,
                address_n: address_n
              });

            case 26:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    }));

    function getAccountDescriptor(_x24, _x25, _x26) {
      return _getAccountDescriptor.apply(this, arguments);
    }

    return getAccountDescriptor;
  }() // TODO: implement whole "cancel" logic in "trezor-link"
  ;

  _proto.cancel =
  /*#__PURE__*/
  function () {
    var _cancel = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12() {
      var _this$transport, activeName, version;

      return _regenerator["default"].wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              if (!this._cancelableRequest) {
                _context12.next = 4;
                break;
              }

              this._cancelableRequest();

              this._cancelableRequest = undefined;
              return _context12.abrupt("return");

            case 4:
              /**
               * Bridge version =< 2.0.28 has a bug that doesn't permit it to cancel
               * user interactions in progress, so we have to do it manually.
               */
              _this$transport = this.transport, activeName = _this$transport.activeName, version = _this$transport.version;

              if (!(activeName && activeName === 'BridgeTransport' && (0, _versionUtils.versionCompare)(version, '2.0.28') < 1)) {
                _context12.next = 8;
                break;
              }

              _context12.next = 8;
              return this.device.legacyForceRelease();

            case 8:
              this.transport.post(this.sessionId, 'Cancel', {}, false);

            case 9:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12, this);
    }));

    function cancel() {
      return _cancel.apply(this, arguments);
    }

    return cancel;
  }();

  return DeviceCommands;
}();

exports["default"] = DeviceCommands;