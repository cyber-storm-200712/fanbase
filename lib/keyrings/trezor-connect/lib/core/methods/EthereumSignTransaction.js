"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _pathUtils = require("../../utils/pathUtils");

var _CoinInfo = require("../../data/CoinInfo");

var _ethereumUtils = require("../../utils/ethereumUtils");

var _formatUtils = require("../../utils/formatUtils");

var helper = _interopRequireWildcard(require("./helpers/ethereumSignTx"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// const strip: <T>(value: T) => T = value => {
var strip = function strip(value) {
  if (typeof value === 'string') {
    var stripped = (0, _formatUtils.stripHexPrefix)(value); // pad left even

    if (stripped.length % 2 !== 0) {
      stripped = "0" + stripped;
    }

    return stripped;
  }

  if (Array.isArray(value)) {
    return value.map(strip);
  }

  if (typeof value === 'object') {
    return Object.entries(value).reduce(function (acc, _ref) {
      var _objectSpread2;

      var k = _ref[0],
          v = _ref[1];
      return _objectSpread(_objectSpread({}, acc), {}, (_objectSpread2 = {}, _objectSpread2[k] = strip(v), _objectSpread2));
    }, {});
  }

  return value;
};

var EthereumSignTx = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(EthereumSignTx, _AbstractMethod);

  function EthereumSignTx() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = EthereumSignTx.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read', 'write'];
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'path',
      required: true
    }, {
      name: 'transaction',
      required: true
    }]);
    var path = (0, _pathUtils.validatePath)(payload.path, 3);
    var network = (0, _CoinInfo.getEthereumNetwork)(path);
    this.info = (0, _ethereumUtils.getNetworkLabel)('Sign #NETWORK transaction', network); // incoming transaction should be in EthereumTx format
    // https://github.com/ethereumjs/ethereumjs-tx

    var tx = payload.transaction;
    var isEIP1559 = tx.maxFeePerGas && tx.maxPriorityFeePerGas; // get firmware range depending on used transaction type
    // eip1559 is possible since 2.4.2

    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(isEIP1559 ? 'eip1559' : this.name, network, this.firmwareRange);
    var schema = isEIP1559 ? [{
      name: 'to',
      type: 'string',
      required: true
    }, {
      name: 'value',
      type: 'string',
      required: true
    }, {
      name: 'gasLimit',
      type: 'string',
      required: true
    }, {
      name: 'maxFeePerGas',
      type: 'string',
      required: true
    }, {
      name: 'maxPriorityFeePerGas',
      type: 'string',
      required: true
    }, {
      name: 'nonce',
      type: 'string',
      required: true
    }, {
      name: 'data',
      type: 'string'
    }, {
      name: 'chainId',
      type: 'number',
      required: true
    }] : [{
      name: 'to',
      type: 'string',
      required: true
    }, {
      name: 'value',
      type: 'string',
      required: true
    }, {
      name: 'gasLimit',
      type: 'string',
      required: true
    }, {
      name: 'gasPrice',
      type: 'string',
      required: true
    }, {
      name: 'nonce',
      type: 'string',
      required: true
    }, {
      name: 'data',
      type: 'string'
    }, {
      name: 'chainId',
      type: 'number'
    }, {
      name: 'txType',
      type: 'number'
    }];
    (0, _paramsValidator.validateParams)(tx, schema); // Since FW 2.4.3+ chainId will be required
    // TODO: this should be removed after next major/minor version (or after few months)
    // TODO: add "required: true" to chainId validation

    if (typeof tx.chainId !== 'number') {
      // eslint-disable-next-line no-console
      console.warn('TrezorConnect.ethereumSignTransaction: Missing chainId parameter!');
    }

    this.params = {
      path: path,
      tx: _objectSpread({
        type: isEIP1559 ? 'eip1559' : 'legacy'
      }, strip(tx))
    };
  };

  _proto.run = function run() {
    var tx = this.params.tx;
    return tx.type === 'eip1559' ? helper.ethereumSignTxEIP1559(this.device.getCommands().typedCall.bind(this.device.getCommands()), this.params.path, tx.to, tx.value, tx.gasLimit, tx.maxFeePerGas, tx.maxPriorityFeePerGas, tx.nonce, tx.chainId, tx.data, tx.accessList) : helper.ethereumSignTx(this.device.getCommands().typedCall.bind(this.device.getCommands()), this.params.path, tx.to, tx.value, tx.gasLimit, tx.gasPrice, tx.nonce, tx.chainId, tx.data, tx.txType);
  };

  return EthereumSignTx;
}(_AbstractMethod2["default"]);

exports["default"] = EthereumSignTx;