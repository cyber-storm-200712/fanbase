"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.initWordView = void 0;

var _builder = require("../../message/builder");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _common = require("./common");

var _bip = _interopRequireDefault(require("../../utils/bip39"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var initWordPlainView = function initWordPlainView(payload) {
  (0, _common.showView)('word-plain');

  var deviceName = _common.container.getElementsByClassName('device-name')[0];

  var datalist = _common.container.getElementsByClassName('bip-words')[0];

  var input = _common.container.getElementsByClassName('word-input')[0];

  deviceName.innerText = payload.device.label;

  var clearWord = function clearWord() {
    input.value = '';
    input.focus();
  };

  var submit = function submit() {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_WORD, input.value));
    clearWord(); // eslint-disable-next-line no-use-before-define

    window.removeEventListener('keydown', wordKeyboardHandler);
  };

  var wordKeyboardHandler = function wordKeyboardHandler(event) {
    switch (event.keyCode) {
      case 13: // enter,

      case 9:
        // tab
        event.preventDefault();
        submit();
        break;
      // no default
    }
  };

  _bip["default"].forEach(function (word) {
    var item = document.createElement('option');
    item.value = word;
    datalist.appendChild(item);
  });

  input.focus();
  window.addEventListener('keydown', wordKeyboardHandler, false);
};

var initWordMatrixView = function initWordMatrixView(payload) {
  (0, _common.showView)('word-matrix');

  var submit = function submit(val) {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_WORD, val)); // eslint-disable-next-line no-use-before-define

    window.addEventListener('keydown', keyboardHandler, true);
  };

  var keyboardHandler = function keyboardHandler(event) {
    event.preventDefault();

    switch (event.keyCode) {
      // numeric and numpad
      case 49:
      case 97:
        submit('1');
        break;

      case 50:
      case 98:
        submit('2');
        break;

      case 51:
      case 99:
        submit('3');
        break;

      case 52:
      case 100:
        submit('4');
        break;

      case 53:
      case 101:
        submit('5');
        break;

      case 54:
      case 102:
        submit('6');
        break;

      case 55:
      case 103:
        submit('7');
        break;

      case 56:
      case 104:
        submit('8');
        break;

      case 57:
      case 105:
        submit('9');
        break;
      // no default
    }
  };

  var deviceName = _common.container.getElementsByClassName('device-name')[0];

  var buttons = _common.container.querySelectorAll('[data-value]');

  deviceName.innerText = payload.device.label;

  for (var i = 0; i < buttons.length; i++) {
    buttons.item(i).addEventListener('click', function (event) {
      if (event.target instanceof HTMLElement) {
        var val = event.target.getAttribute('data-value');

        if (val) {
          submit(val);
        }
      }
    });
  }

  var wordsOnRight = _common.container.getElementsByClassName('word-right');

  var wordsOnRightDisplay = payload.type !== 'WordRequestType_Matrix9' ? 'none' : 'initial';

  for (var _i = 0; _i < wordsOnRight.length; _i++) {
    wordsOnRight[_i].style.display = wordsOnRightDisplay;
  }

  window.addEventListener('keydown', keyboardHandler, true);
};

var initWordView = function initWordView(payload) {
  if (payload.type === 'WordRequestType_Plain') {
    initWordPlainView(payload);
  } else {
    initWordMatrixView(payload);
  }
};

exports.initWordView = initWordView;