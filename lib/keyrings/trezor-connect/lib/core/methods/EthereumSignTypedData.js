"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _AbstractMethod2 = _interopRequireDefault(require("./AbstractMethod"));

var _paramsValidator = require("./helpers/paramsValidator");

var _pathUtils = require("../../utils/pathUtils");

var _CoinInfo = require("../../data/CoinInfo");

var _ethereumUtils = require("../../utils/ethereumUtils");

var _constants = require("../../constants");

var _ethereumSignTypedData = require("./helpers/ethereumSignTypedData");

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var EthereumSignTypedData = /*#__PURE__*/function (_AbstractMethod) {
  (0, _inheritsLoose2["default"])(EthereumSignTypedData, _AbstractMethod);

  function EthereumSignTypedData() {
    return _AbstractMethod.apply(this, arguments) || this;
  }

  var _proto = EthereumSignTypedData.prototype;

  _proto.init = function init() {
    this.requiredPermissions = ['read', 'write'];
    var payload = this.payload; // validate incoming parameters

    (0, _paramsValidator.validateParams)(payload, [{
      name: 'path',
      required: true
    }, {
      name: 'metamask_v4_compat',
      type: 'boolean'
    }, // model T
    {
      name: 'data',
      type: 'object'
    }, // model One
    {
      name: 'domain_separator_hash',
      type: 'string'
    }, {
      name: 'message_hash',
      type: 'string'
    }]);
    var path = (0, _pathUtils.validatePath)(payload.path, 3);
    var network = (0, _CoinInfo.getEthereumNetwork)(path);
    this.firmwareRange = (0, _paramsValidator.getFirmwareRange)(this.name, network, this.firmwareRange);
    this.info = (0, _ethereumUtils.getNetworkLabel)('Sign #NETWORK typed data', network);
    this.params = {
      path: path,
      address_n: path,
      metamask_v4_compat: payload.metamask_v4_compat,
      domain_separator_hash: payload.domain_separator_hash || '',
      message_hash: payload.message_hash || '',
      data: payload.data || undefined
    };
  };

  _proto.run = /*#__PURE__*/function () {
    var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var cmd, address_n, _this$params, domain_separator_hash, message_hash, _response, _response$message, _address, _signature, _this$params2, data, metamask_v4_compat, types, primaryType, domain, message, response, typeDefinitionName, typeDefinition, dataStruckAck, member_path, memberData, memberTypeName, rootIndex, nestedMemberPath, _iterator, _step, index, memberTypeDefinition, encodedData, _response$message2, address, signature;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              cmd = this.device.getCommands();
              address_n = this.params.address_n;

              if (!(this.device.features.model === '1')) {
                _context.next = 10;
                break;
              }

              (0, _paramsValidator.validateParams)(this.params, [{
                name: 'domain_separator_hash',
                type: 'string',
                required: true
              }, {
                name: 'message_hash',
                type: 'string',
                required: true
              }]);
              _this$params = this.params, domain_separator_hash = _this$params.domain_separator_hash, message_hash = _this$params.message_hash; // For Model 1 we use EthereumSignTypedHash

              _context.next = 7;
              return cmd.typedCall('EthereumSignTypedHash', 'EthereumTypedDataSignature', {
                address_n: address_n,
                domain_separator_hash: domain_separator_hash,
                message_hash: message_hash
              });

            case 7:
              _response = _context.sent;
              _response$message = _response.message, _address = _response$message.address, _signature = _response$message.signature;
              return _context.abrupt("return", {
                address: _address,
                signature: "0x" + _signature
              });

            case 10:
              (0, _paramsValidator.validateParams)(this.params, [{
                name: 'data',
                type: 'object',
                required: true
              }]);
              _this$params2 = this.params, data = _this$params2.data, metamask_v4_compat = _this$params2.metamask_v4_compat; // $FlowIssue

              types = data.types, primaryType = data.primaryType, domain = data.domain, message = data.message; // For Model T we use EthereumSignTypedData

              _context.next = 15;
              return cmd.typedCall('EthereumSignTypedData', // $FlowIssue typedCall problem with unions in response, TODO: accept unions
              'EthereumTypedDataStructRequest|EthereumTypedDataValueRequest|EthereumTypedDataSignature', {
                address_n: address_n,
                primary_type: primaryType,
                metamask_v4_compat: metamask_v4_compat
              });

            case 15:
              response = _context.sent;

            case 16:
              if (!(response.type === 'EthereumTypedDataStructRequest')) {
                _context.next = 27;
                break;
              }

              // $FlowIssue disjoint union Refinements not working, TODO: check if new Flow versions fix this
              typeDefinitionName = response.message.name;
              typeDefinition = types[typeDefinitionName];

              if (!(typeDefinition === undefined)) {
                _context.next = 21;
                break;
              }

              throw _constants.ERRORS.TypedError('Runtime', "Type " + typeDefinitionName + " was not defined in types object");

            case 21:
              dataStruckAck = {
                members: typeDefinition.map(function (_ref) {
                  var name = _ref.name,
                      typeName = _ref.type;
                  return {
                    name: name,
                    type: (0, _ethereumSignTypedData.getFieldType)(typeName, types)
                  };
                })
              };
              _context.next = 24;
              return cmd.typedCall('EthereumTypedDataStructAck', // $FlowIssue typedCall problem with unions in response, TODO: accept unions
              'EthereumTypedDataStructRequest|EthereumTypedDataValueRequest|EthereumTypedDataSignature', dataStruckAck);

            case 24:
              response = _context.sent;
              _context.next = 16;
              break;

            case 27:
              if (!(response.type === 'EthereumTypedDataValueRequest')) {
                _context.next = 50;
                break;
              }

              // $FlowIssue disjoint union Refinements not working, TODO: check if new Flow versions fix this
              member_path = response.message.member_path;
              memberData = void 0;
              memberTypeName = void 0;
              rootIndex = member_path[0], nestedMemberPath = member_path.slice(1);
              _context.t0 = rootIndex;
              _context.next = _context.t0 === 0 ? 35 : _context.t0 === 1 ? 38 : 41;
              break;

            case 35:
              memberData = domain;
              memberTypeName = 'EIP712Domain';
              return _context.abrupt("break", 42);

            case 38:
              memberData = message;
              memberTypeName = primaryType;
              return _context.abrupt("break", 42);

            case 41:
              throw _constants.ERRORS.TypedError('Runtime', 'Root index can only be 0 or 1');

            case 42:
              // It can be asking for a nested structure (the member path being [X, Y, Z, ...])
              for (_iterator = _createForOfIteratorHelperLoose(nestedMemberPath); !(_step = _iterator()).done;) {
                index = _step.value;

                if (Array.isArray(memberData)) {
                  memberTypeName = (0, _ethereumSignTypedData.parseArrayType)(memberTypeName).entryTypeName;
                  memberData = memberData[index];
                } else if (typeof memberData === 'object' && memberData !== null) {
                  memberTypeDefinition = types[memberTypeName][index];
                  memberTypeName = memberTypeDefinition.type;
                  memberData = memberData[memberTypeDefinition.name];
                } else {// TODO: what to do when the value is missing (for example in recursive types)?
                }
              }

              encodedData = void 0; // If we were asked for a list, first sending its length and we will be receiving
              // requests for individual elements later

              if (Array.isArray(memberData)) {
                // Sending the length as uint16
                encodedData = (0, _ethereumSignTypedData.encodeData)('uint16', memberData.length);
              } else {
                encodedData = (0, _ethereumSignTypedData.encodeData)(memberTypeName, memberData);
              } // $FlowIssue with `await` and Promises: https://github.com/facebook/flow/issues/5294, TODO: Update flow


              _context.next = 47;
              return cmd.typedCall('EthereumTypedDataValueAck', // $FlowIssue typedCall problem with unions in response, TODO: accept unions
              'EthereumTypedDataValueRequest|EthereumTypedDataSignature', {
                value: encodedData
              });

            case 47:
              response = _context.sent;
              _context.next = 27;
              break;

            case 50:
              // $FlowIssue disjoint union Refinements not working, TODO: check if new Flow versions fix this
              _response$message2 = response.message, address = _response$message2.address, signature = _response$message2.signature;
              return _context.abrupt("return", {
                address: address,
                signature: "0x" + signature
              });

            case 52:
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

  return EthereumSignTypedData;
}(_AbstractMethod2["default"]);

exports["default"] = EthereumSignTypedData;