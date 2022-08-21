"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _CoinInfo = require("../../data/CoinInfo");

var _pathUtils = require("../../utils/pathUtils");

var helper = _interopRequireWildcard(require("./helpers/stellarSignTx"));

var _constants = require("../../constants");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var StellarSignTransactionFeatures = Object.freeze({
  manageBuyOffer: ['1.10.4', '2.4.3'],
  pathPaymentStrictSend: ['1.10.4', '2.4.3']
});

var StellarSignTransaction = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(StellarSignTransaction, _AbstractMethod);

  function StellarSignTransaction() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = StellarSignTransaction.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read', 'write'];
    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, (0, _CoinInfo.getMiscNetwork)('Stellar'), this.firmwareRange);
    this.info = 'Sign Stellar transaction';
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'path',
      required: true
    }, {
      name: 'networkPassphrase',
      type: 'string',
      required: true
    }, {
      name: 'transaction',
      required: true
    }]);
    var path = (0, _pathUtils.validatePath)(payload.path, 3); // incoming data should be in stellar-sdk format

    var transaction = payload.transaction;
    this.params = {
      path: path,
      networkPassphrase: payload.networkPassphrase,
      transaction: transaction
    };
  };

  _proto._isFeatureSupported = function _isFeatureSupported(feature) {
    return this.device.atLeast(StellarSignTransactionFeatures[feature]);
  };

  _proto._ensureFeatureIsSupported = function _ensureFeatureIsSupported(feature) {
    if (!this._isFeatureSupported(feature)) {
      throw _constants.ERRORS.TypedError('Method_InvalidParameter', "Feature " + feature + " not supported by device firmware");
    }
  };

  _proto._ensureFirmwareSupportsParams = function _ensureFirmwareSupportsParams() {
    var params = this.params;

    if (params.transaction.operations && params.transaction.operations.find(function (o) {
      return o.type === 'manageBuyOffer';
    })) {
      this._ensureFeatureIsSupported('manageBuyOffer');
    }

    if (params.transaction.operations && params.transaction.operations.find(function (o) {
      return o.type === 'pathPaymentStrictSend';
    })) {
      this._ensureFeatureIsSupported('pathPaymentStrictSend');
    }
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var response;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this._ensureFirmwareSupportsParams();

              _context.next = 3;
              return helper.stellarSignTx(this.device.getCommands().typedCall.bind(this.device.getCommands()), this.params.path, this.params.networkPassphrase, this.params.transaction);

            case 3:
              response = _context.sent;
              return _context.abrupt("return", {
                publicKey: response.public_key,
                signature: response.signature
              });

            case 5:
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

  return StellarSignTransaction;
}(_AbstractMethod2["default"]);

exports["default"] = StellarSignTransaction;