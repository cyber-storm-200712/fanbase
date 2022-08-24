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

var _protobuf = require("../../types/trezor/protobuf");

var CardanoGetNativeScriptHash = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(CardanoGetNativeScriptHash, _AbstractMethod);

  function CardanoGetNativeScriptHash() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = CardanoGetNativeScriptHash.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read'];
    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, (0, _CoinInfo.getMiscNetwork)('Cardano'), this.firmwareRange);
    this.info = 'Get Cardano native script hash';
    var payload = this.payload;
    (0, _paramsValidator.validateParams)(payload, [{
      name: 'script',
      type: 'object',
      required: true
    }, {
      name: 'displayFormat',
      type: 'number',
      required: true
    }, {
      name: 'derivationType',
      type: 'number'
    }]);
    this.validateScript(payload.script);
    this.params = {
      script: this.scriptToProto(payload.script),
      display_format: payload.displayFormat,
      derivation_type: typeof payload.derivationType !== 'undefined' ? payload.derivationType : _protobuf.Enum_CardanoDerivationType.ICARUS_TREZOR
    };
  };

  _proto.validateScript = function validateScript(script) {
    var _this = this;

    (0, _paramsValidator.validateParams)(script, [{
      name: 'type',
      type: 'number',
      required: true
    }, {
      name: 'scripts',
      type: 'array',
      allowEmpty: true
    }, {
      name: 'keyHash',
      type: 'string'
    }, {
      name: 'requiredSignaturesCount',
      type: 'number'
    }, {
      name: 'invalidBefore',
      type: 'uint'
    }, {
      name: 'invalidHereafter',
      type: 'uint'
    }]);

    if (script.keyPath) {
      (0, _pathUtils.validatePath)(script.keyPath, 3);
    }

    if (script.scripts) {
      script.scripts.forEach(function (nestedScript) {
        _this.validateScript(nestedScript);
      });
    }
  };

  _proto.scriptToProto = function scriptToProto(script) {
    var _this2 = this;

    var scripts = [];

    if (script.scripts) {
      scripts = script.scripts.map(function (nestedScript) {
        return _this2.scriptToProto(nestedScript);
      });
    }

    var keyPath = [];

    if (script.keyPath) {
      keyPath = (0, _pathUtils.validatePath)(script.keyPath, 3);
    }

    return {
      type: script.type,
      scripts: scripts,
      key_hash: script.keyHash,
      key_path: keyPath,
      required_signatures_count: script.requiredSignaturesCount,
      invalid_before: script.invalidBefore,
      invalid_hereafter: script.invalidHereafter
    };
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var _yield$this$device$ge, message;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.device.getCommands().typedCall('CardanoGetNativeScriptHash', 'CardanoNativeScriptHash', {
                script: this.params.script,
                display_format: this.params.display_format,
                derivation_type: this.params.derivation_type
              });

            case 2:
              _yield$this$device$ge = _context.sent;
              message = _yield$this$device$ge.message;
              return _context.abrupt("return", {
                scriptHash: message.script_hash
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

  return CardanoGetNativeScriptHash;
}(_AbstractMethod2["default"]);

exports["default"] = CardanoGetNativeScriptHash;