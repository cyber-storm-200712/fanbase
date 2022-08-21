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

var _CoinInfo = require("../../data/CoinInfo");

var _pathUtils = require("../../utils/pathUtils");

var _cardanoAddressParameters = require("./helpers/cardanoAddressParameters");

var _constants = require("../../constants");

var _builder = require("../../message/builder");

var _cardano = require("../../types/networks/cardano");

var _protobuf = require("../../types/trezor/protobuf");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var CardanoGetAddress = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(CardanoGetAddress, _AbstractMethod);

  function CardanoGetAddress() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _AbstractMethod.call.apply(_AbstractMethod, [this].concat(args)) || this;
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "params", []);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "progress", 0);
    return _this;
  }

  var _proto = CardanoGetAddress.prototype;

  _proto.init = function init() {
    var _this2 = this;

    this.requiredPermissions = ['read'];
    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, (0, _CoinInfo.getMiscNetwork)('Cardano'), this.firmwareRange); // create a bundle with only one batch if bundle doesn't exists

    this.hasBundle = !!this.payload.bundle;
    var payload = !this.payload.bundle ? _objectSpread(_objectSpread({}, this.payload), {}, {
      bundle: [this.payload]
    }) : this.payload; // validate bundle type

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'bundle',
      type: 'array'
    }, {
      name: 'useEventListener',
      type: 'boolean'
    }]);
    payload.bundle.forEach(function (batch) {
      // validate incoming parameters for each batch
      (0, _paramsValidator.validateParams)(batch, [{
        name: 'addressParameters',
        type: 'object',
        required: true
      }, {
        name: 'networkId',
        type: 'number',
        required: true
      }, {
        name: 'protocolMagic',
        type: 'number',
        required: true
      }, {
        name: 'derivationType',
        type: 'number'
      }, {
        name: 'address',
        type: 'string'
      }, {
        name: 'showOnTrezor',
        type: 'boolean'
      }]);
      (0, _cardanoAddressParameters.validateAddressParameters)(batch.addressParameters);
      var showOnTrezor = true;

      if (Object.prototype.hasOwnProperty.call(batch, 'showOnTrezor')) {
        showOnTrezor = batch.showOnTrezor;
      }

      _this2.params.push({
        address_parameters: (0, _cardanoAddressParameters.addressParametersToProto)(batch.addressParameters),
        address: batch.address,
        protocol_magic: batch.protocolMagic,
        network_id: batch.networkId,
        derivation_type: typeof batch.derivationType !== 'undefined' ? batch.derivationType : _protobuf.Enum_CardanoDerivationType.ICARUS_TREZOR,
        show_display: showOnTrezor
      });
    });
    var useEventListener = payload.useEventListener && this.params.length === 1 && typeof this.params[0].address === 'string' && this.params[0].show_display;
    this.confirmed = useEventListener;
    this.useUi = !useEventListener; // set info

    if (this.params.length === 1) {
      this.info = "Export Cardano address for account #" + ((0, _pathUtils.fromHardened)(this.params[0].address_parameters.address_n[2]) + 1);
    } else {
      this.info = 'Export multiple Cardano addresses';
    }
  };

  _proto.getButtonRequestData = function getButtonRequestData(code) {
    if (code === 'ButtonRequest_Address') {
      var data = {
        type: 'address',
        serializedPath: (0, _pathUtils.getSerializedPath)(this.params[this.progress].address_parameters.address_n),
        address: this.params[this.progress].address || 'not-set'
      };
      return data;
    }

    return null;
  };

  _proto.confirmation = /*#__PURE__*/function () {
    var _confirmation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var uiPromise, uiResp;
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
              uiPromise = this.createUiPromise(_constants.UI.RECEIVE_CONFIRMATION, this.device); // request confirmation view

              this.postMessage((0, _builder.UiMessage)(_constants.UI.REQUEST_CONFIRMATION, {
                view: 'export-address',
                label: this.info
              })); // wait for user action

              _context.next = 8;
              return uiPromise.promise;

            case 8:
              uiResp = _context.sent;
              this.confirmed = uiResp.payload;
              return _context.abrupt("return", this.confirmed);

            case 11:
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
  }();

  _proto._call = /*#__PURE__*/function () {
    var _call2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(_ref) {
      var address_parameters, protocol_magic, network_id, derivation_type, show_display, cmd, response;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              address_parameters = _ref.address_parameters, protocol_magic = _ref.protocol_magic, network_id = _ref.network_id, derivation_type = _ref.derivation_type, show_display = _ref.show_display;
              cmd = this.device.getCommands();
              _context3.next = 4;
              return cmd.typedCall('CardanoGetAddress', 'CardanoAddress', {
                address_parameters: address_parameters,
                protocol_magic: protocol_magic,
                network_id: network_id,
                derivation_type: derivation_type,
                show_display: show_display
              });

            case 4:
              response = _context3.sent;
              return _context3.abrupt("return", response.message);

            case 6:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function _call(_x) {
      return _call2.apply(this, arguments);
    }

    return _call;
  }();

  _proto._ensureFirmwareSupportsBatch = function _ensureFirmwareSupportsBatch(batch) {
    var SCRIPT_ADDRESSES_TYPES = [_cardano.CardanoAddressType.BASE_SCRIPT_KEY, _cardano.CardanoAddressType.BASE_KEY_SCRIPT, _cardano.CardanoAddressType.BASE_SCRIPT_SCRIPT, _cardano.CardanoAddressType.POINTER_SCRIPT, _cardano.CardanoAddressType.ENTERPRISE_SCRIPT, _cardano.CardanoAddressType.REWARD_SCRIPT];

    if (SCRIPT_ADDRESSES_TYPES.includes(batch.address_parameters.address_type)) {
      if (!this.device.atLeast(['0', '2.4.3'])) {
        throw _constants.ERRORS.TypedError('Method_InvalidParameter', "Address type not supported by device firmware");
      }
    }
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
      var responses, i, batch, silent, response;
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              responses = [];
              i = 0;

            case 2:
              if (!(i < this.params.length)) {
                _context4.next = 25;
                break;
              }

              batch = this.params[i];

              this._ensureFirmwareSupportsBatch(batch);

              batch.address_parameters = (0, _cardanoAddressParameters.modifyAddressParametersForBackwardsCompatibility)(this.device, batch.address_parameters); // silently get address and compare with requested address
              // or display as default inside popup

              if (!batch.show_display) {
                _context4.next = 16;
                break;
              }

              _context4.next = 9;
              return this._call(_objectSpread(_objectSpread({}, batch), {}, {
                show_display: false
              }));

            case 9:
              silent = _context4.sent;

              if (!(typeof batch.address === 'string')) {
                _context4.next = 15;
                break;
              }

              if (!(batch.address !== silent.address)) {
                _context4.next = 13;
                break;
              }

              throw _constants.ERRORS.TypedError('Method_AddressNotMatch');

            case 13:
              _context4.next = 16;
              break;

            case 15:
              batch.address = silent.address;

            case 16:
              _context4.next = 18;
              return this._call(batch);

            case 18:
              response = _context4.sent;
              responses.push({
                addressParameters: (0, _cardanoAddressParameters.addressParametersFromProto)(batch.address_parameters),
                protocolMagic: batch.protocol_magic,
                networkId: batch.network_id,
                serializedPath: (0, _pathUtils.getSerializedPath)(batch.address_parameters.address_n),
                serializedStakingPath: (0, _pathUtils.getSerializedPath)(batch.address_parameters.address_n_staking),
                address: response.address
              });

              if (this.hasBundle) {
                // send progress
                this.postMessage((0, _builder.UiMessage)(_constants.UI.BUNDLE_PROGRESS, {
                  progress: i,
                  response: response
                }));
              }

              this.progress++;

            case 22:
              i++;
              _context4.next = 2;
              break;

            case 25:
              return _context4.abrupt("return", this.hasBundle ? responses : responses[0]);

            case 26:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function run() {
      return _run.apply(this, arguments);
    }

    return run;
  }();

  return CardanoGetAddress;
}(_AbstractMethod2["default"]);

exports["default"] = CardanoGetAddress;