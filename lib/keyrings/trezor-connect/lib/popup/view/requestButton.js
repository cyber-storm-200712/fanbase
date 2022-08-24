"use strict";

exports.__esModule = true;
exports.requestButton = void 0;

var _common = require("./common");

var toastTimeout;

var showToast = function showToast() {
  var toast = _common.container.querySelectorAll('.toast')[0];

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(function () {
    toast.classList.remove('visible');
  }, 3000);
  toast.classList.add('visible');
};

var showAddressValidation = function showAddressValidation(payload) {
  (0, _common.showView)('check-address');
  var data = payload.data;

  var dataContainer = _common.container.querySelectorAll('.button-request-data')[0];

  if (!data || data.type !== 'address') {
    if (dataContainer.parentNode) {
      dataContainer.parentNode.removeChild(dataContainer);
    }

    return;
  }

  var path = _common.container.querySelectorAll('.path-value')[0];

  var address = _common.container.querySelectorAll('.address-value')[0];

  var clipboard = _common.container.querySelectorAll('.clipboard-button')[0];

  path.innerText = data.serializedPath;
  address.innerText = data.address;

  clipboard.onclick = function () {
    var el = document.createElement('textarea');
    el.value = data.address;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    dataContainer.appendChild(el);
    el.select();
    document.execCommand('copy');
    dataContainer.removeChild(el);
    showToast();
  };
};

var requestButton = function requestButton(payload) {
  if (payload.code === 'ButtonRequest_Address') {
    showAddressValidation(payload);
  } else if (payload.code === 'ButtonRequest_ConfirmOutput') {
    (0, _common.showView)('confirm-output');
  } else {
    (0, _common.showView)('follow-device');
  }
};

exports.requestButton = requestButton;