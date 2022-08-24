"use strict";

exports.__esModule = true;
exports.initPinView = void 0;

var _builder = require("../../message/builder");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _common = require("./common");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var isSubmitButtonDisabled = function isSubmitButtonDisabled(isDisabled) {
  var submitButton = _common.container.getElementsByClassName('submit')[0];

  if (isDisabled) {
    submitButton.setAttribute('disabled', 'disabled');
  } else {
    submitButton.removeAttribute('disabled');
  }
};

var submit = function submit() {
  var button = _common.container.getElementsByClassName('submit')[0];

  button.click();
};

var addPin = function addPin(val) {
  var input = _common.container.getElementsByClassName('pin-input')[0];

  var maxInputLength = 9;

  if (input.value.length < maxInputLength) {
    input.value += val;

    if (input.value.length > 0) {
      isSubmitButtonDisabled(false);
    }
  }
};

var backspacePin = function backspacePin() {
  var input = _common.container.getElementsByClassName('pin-input')[0];

  var pin = input.value;
  input.value = pin.substring(0, pin.length - 1);

  if (!input.value) {
    isSubmitButtonDisabled(true);
  }
};

var pinKeyboardHandler = function pinKeyboardHandler(event) {
  event.preventDefault();

  switch (event.keyCode) {
    case 13:
      // enter,
      submit();
      break;
    // backspace

    case 8:
      backspacePin();
      break;
    // numeric and numpad

    case 49:
    case 97:
      addPin(1);
      break;

    case 50:
    case 98:
      addPin(2);
      break;

    case 51:
    case 99:
      addPin(3);
      break;

    case 52:
    case 100:
      addPin(4);
      break;

    case 53:
    case 101:
      addPin(5);
      break;

    case 54:
    case 102:
      addPin(6);
      break;

    case 55:
    case 103:
      addPin(7);
      break;

    case 56:
    case 104:
      addPin(8);
      break;

    case 57:
    case 105:
      addPin(9);
      break;
    // no default
  }
};

var initPinView = function initPinView(payload) {
  (0, _common.showView)('pin');

  var deviceName = _common.container.getElementsByClassName('device-name')[0];

  var input = _common.container.getElementsByClassName('pin-input')[0];

  var enter = _common.container.getElementsByClassName('submit')[0];

  var backspace = _common.container.getElementsByClassName('pin-backspace')[0];

  var buttons = _common.container.querySelectorAll('[data-value]');

  deviceName.innerText = payload.device.label;

  for (var i = 0; i < buttons.length; i++) {
    buttons.item(i).addEventListener('click', function (event) {
      if (event.target instanceof HTMLElement) {
        var val = event.target.getAttribute('data-value');

        if (val) {
          addPin(+val);
        }
      }
    });
  }

  backspace.addEventListener('click', backspacePin);
  enter.addEventListener('click', function () {
    if (input.value.length > 0) {
      window.removeEventListener('keydown', pinKeyboardHandler, false);
      (0, _common.showView)('loader');
      (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_PIN, input.value));
    }
  });
  window.addEventListener('keydown', pinKeyboardHandler, false);
};

exports.initPinView = initPinView;