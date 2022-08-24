"use strict";

exports.__esModule = true;
exports.initPassphraseView = void 0;

var _builder = require("../../message/builder");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _common = require("./common");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var initPassphraseView = function initPassphraseView(payload) {
  (0, _common.showView)('passphrase');

  var view = _common.container.getElementsByClassName('passphrase')[0];

  var deviceNameSpan = _common.container.getElementsByClassName('device-name')[0];

  var input1 = _common.container.getElementsByClassName('pass')[0];

  var input2 = _common.container.getElementsByClassName('pass-check')[0];

  var toggle = _common.container.getElementsByClassName('show-passphrase')[0];

  var enter = _common.container.getElementsByClassName('submit')[0];

  var inputType = 'password';
  var _payload$device = payload.device,
      label = _payload$device.label,
      features = _payload$device.features;
  deviceNameSpan.innerText = label;
  var passphraseOnDevice = features && features.capabilities && features.capabilities.includes('Capability_PassphraseEntry');
  /* Functions */

  var validation = function validation() {
    if (input1.value !== input2.value) {
      enter.disabled = true;
      view.classList.add('not-valid');
    } else {
      enter.disabled = false;
      view.classList.remove('not-valid');
    }
  };

  var toggleInputFontStyle = function toggleInputFontStyle(input) {
    if (inputType === 'text') {
      // input.classList.add('text');
      input.setAttribute('type', 'text'); // Since passphrase is visible there's no need to force user to fill the passphrase twice
      // - disable input2
      // - write automatically into input2 as the user is writing into input1 (listen to input event)

      input2.disabled = true;
      input2.value = input1.value;
      validation();
    } else if (inputType === 'password') {
      // input.classList.remove('text');
      input.setAttribute('type', 'password');
      input2.disabled = false;
      input2.value = '';
      validation();
    }
  };

  var handleToggleClick = function handleToggleClick() {
    inputType = inputType === 'text' ? 'password' : 'text';
    toggleInputFontStyle(input1);
    toggleInputFontStyle(input2);
  };

  var handleWindowKeydown = function handleWindowKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      enter.click();
    }
  };

  var handleEnterClick = function handleEnterClick() {
    input1.blur();
    input2.blur();
    window.removeEventListener('keydown', handleWindowKeydown);
    (0, _common.showView)('loader');
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_PASSPHRASE, {
      value: input1.value,
      save: true
    }));
  };
  /* Functions: END */


  input1.addEventListener('input', function () {
    validation();

    if (inputType === 'text') {
      input2.value = input1.value;
      validation();
    }
  }, false);
  input2.addEventListener('input', validation, false);
  toggle.addEventListener('click', handleToggleClick);
  enter.addEventListener('click', handleEnterClick);
  window.addEventListener('keydown', handleWindowKeydown, false);

  if (passphraseOnDevice) {
    var onDevice = _common.container.getElementsByClassName('passphraseOnDevice')[0];

    onDevice.style.display = 'block';
    onDevice.addEventListener('click', function () {
      window.removeEventListener('keydown', handleWindowKeydown);
      (0, _common.showView)('loader');
      (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_PASSPHRASE, {
        value: '',
        passphraseOnDevice: true,
        save: true
      }));
    });
  }

  input1.focus();
};

exports.initPassphraseView = initPassphraseView;