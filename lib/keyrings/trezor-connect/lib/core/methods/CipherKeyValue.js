"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _builder = require("../../message/builder");

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _pathUtils = require("../../utils/pathUtils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var CipherKeyValue = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(CipherKeyValue, _AbstractMethod);

  function CipherKeyValue() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _AbstractMethod.call.apply(_AbstractMethod, [this].concat(args)) || this;
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "params", []);
    return _this;
  }

  var _proto = CipherKeyValue.prototype;

  _proto.init = function init() {
    var _this2 = this;

    this.requiredPermissions = ['read', 'write'];
    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, null, this.firmwareRange);
    this.info = 'Cypher key value';
    this.useEmptyPassphrase = true; // create a bundle with only one batch if bundle doesn't exists

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
        name: 'key',
        type: 'string'
      }, {
        name: 'value',
        type: 'string'
      }, {
        name: 'encrypt',
        type: 'boolean'
      }, {
        name: 'askOnEncrypt',
        type: 'boolean'
      }, {
        name: 'askOnDecrypt',
        type: 'boolean'
      }, {
        name: 'iv',
        type: 'string'
      }]);

      _this2.params.push({
        address_n: (0, _pathUtils.validatePath)(batch.path),
        key: batch.key,
        value: batch.value instanceof Buffer ? batch.value.toString('hex') : batch.value,
        encrypt: batch.encrypt,
        ask_on_encrypt: batch.askOnEncrypt,
        ask_on_decrypt: batch.askOnDecrypt,
        iv: batch.iv instanceof Buffer ? batch.iv.toString('hex') : batch.iv
      });
    });
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var responses, cmd, i, response;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              responses = [];
              cmd = this.device.getCommands();
              i = 0;

            case 3:
              if (!(i < this.params.length)) {
                _context.next = 12;
                break;
              }

              _context.next = 6;
              return cmd.typedCall('CipherKeyValue', 'CipheredKeyValue', this.params[i]);

            case 6:
              response = _context.sent;
              responses.push(response.message);

              if (this.hasBundle) {
                // send progress
                this.postMessage((0, _builder.UiMessage)(UI.BUNDLE_PROGRESS, {
                  progress: i,
                  response: response
                }));
              }

            case 9:
              i++;
              _context.next = 3;
              break;

            case 12:
              return _context.abrupt("return", this.hasBundle ? responses : responses[0]);

            case 13:
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

  return CipherKeyValue;
}(_AbstractMethod2["default"]);

exports["default"] = CipherKeyValue;