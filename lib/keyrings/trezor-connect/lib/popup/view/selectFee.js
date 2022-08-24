"use strict";

exports.__esModule = true;
exports.selectFee = exports.updateCustomFee = void 0;

var _builder = require("../../message/builder");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _common = require("./common");

var _formatUtils = require("../../utils/formatUtils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var fees = []; // reference to currently selected button

var selectedFee;
/*
 * Update custom fee view.
 */

var updateCustomFee = function updateCustomFee(payload) {
  var custom = _common.container.getElementsByClassName('custom-fee')[0];

  var opener = _common.container.getElementsByClassName('opener')[0];

  var customFeeLabel = opener.getElementsByClassName('fee-info')[0];

  if (custom.className.indexOf('active') < 0) {
    return;
  } // replace values


  fees.splice(0, fees.length); // add new fees from message

  fees.push.apply(fees, payload.feeLevels);
  var customFee = fees.find(function (f) {
    return f.name === 'custom';
  });

  if (customFee) {
    if (customFee.fee === '0') {
      customFeeLabel.innerHTML = 'Insufficient funds';
    } else {
      customFeeLabel.innerHTML = "\n                <span class=\"fee-amount\">" + (0, _formatUtils.formatAmount)(customFee.fee, payload.coinInfo) + "</span>\n                <span class=\"fee-time\">" + (0, _formatUtils.formatTime)(customFee.minutes) + "</span>\n            ";
    }
  } // eslint-disable-next-line no-use-before-define


  validation(payload.coinInfo);
};

exports.updateCustomFee = updateCustomFee;

var validation = function validation(coinInfo) {
  var sendButton = _common.container.getElementsByClassName('send-button')[0];

  if (!selectedFee) {
    sendButton.setAttribute('disabled', 'disabled');
    sendButton.innerHTML = 'Send';
    return;
  }

  var selectedName = selectedFee.getAttribute('data-fee') || 'custom';
  var selectedValue = fees.find(function (f) {
    return f.name === selectedName;
  });

  if (selectedValue && selectedValue.fee !== '0') {
    sendButton.removeAttribute('disabled');
    sendButton.innerHTML = "Send " + (0, _formatUtils.formatAmount)(selectedValue.total, coinInfo);
  } else {
    sendButton.setAttribute('disabled', 'disabled');
    sendButton.innerHTML = 'Send';
  }
};
/*
 * Show select fee view.
 */


var selectFee = function selectFee(data) {
  if (!data || !Array.isArray(data.feeLevels)) return; // TODO: back to accounts?

  (0, _common.showView)('select-fee'); // remove old references

  selectedFee = null;
  fees.splice(0, fees.length); // add new fees from message

  fees.push.apply(fees, data.feeLevels); // build innerHTML string with fee buttons

  var feesComponents = [];
  fees.forEach(function (level) {
    // ignore custom
    if (level.name === 'custom') return;
    var feeName = level.name;

    if (level.name === 'normal' && level.fee !== '0') {
      feeName = "<span>" + level.name + "</span>\n                <span class=\"fee-subtitle\">recommended</span>";
    }

    if (level.fee !== '0') {
      feesComponents.push("\n                <button data-fee=\"" + level.name + "\" class=\"list\">\n                    <span class=\"fee-title\">" + feeName + "</span>\n                    <span class=\"fee-info\">\n                        <span class=\"fee-amount\">" + (0, _formatUtils.formatAmount)(level.fee, data.coinInfo) + "</span>\n                        <span class=\"fee-time\">" + (0, _formatUtils.formatTime)(level.minutes) + "</span>\n                    </span>\n                </button>\n            ");
    } else {
      feesComponents.push("\n                <button disabled class=\"list\">\n                    <span class=\"fee-title\">" + feeName + "</span>\n                    <span class=\"fee-info\">Insufficient funds</span>\n                </button>\n            ");
    }
  });

  var feeList = _common.container.getElementsByClassName('select-fee-list')[0]; // append custom fee button


  feesComponents.push(feeList.innerHTML); // render all buttons

  feeList.innerHTML = feesComponents.join(''); // references to html elements

  var sendButton = _common.container.getElementsByClassName('send-button')[0];

  var opener = _common.container.getElementsByClassName('opener')[0];

  var customFeeLabel = opener.getElementsByClassName('fee-info')[0];

  var onFeeSelect = function onFeeSelect(event) {
    if (event.currentTarget instanceof HTMLElement) {
      if (selectedFee) {
        selectedFee.classList.remove('active');
      }

      selectedFee = event.currentTarget;
      selectedFee.classList.add('active');
      validation(data.coinInfo);
    }
  }; // find all buttons which has composed transaction and add click event listener to it


  var feeButtons = feeList.querySelectorAll('[data-fee]');

  for (var i = 0; i < feeButtons.length; i++) {
    feeButtons.item(i).addEventListener('click', onFeeSelect);
  } // custom fee button logic


  var composingTimeout = 0;

  opener.onclick = function () {
    if (opener.className.indexOf('active') >= 0) return;

    if (selectedFee) {
      selectedFee.classList.remove('active');
    }

    var composedCustomFee = fees.find(function (f) {
      return f.name === 'custom';
    });
    var customFeeDefaultValue = '0';

    if (!composedCustomFee) {
      if (selectedFee) {
        var selectedName = selectedFee.getAttribute('data-fee');
        var selectedValue = fees.find(function (f) {
          return f.name === selectedName;
        });

        if (selectedValue && selectedValue.fee !== '0') {
          customFeeDefaultValue = selectedValue.feePerByte;
        }
      }

      if (!customFeeDefaultValue === '0') {
        customFeeDefaultValue = '1'; // TODO: get normal
      }
    } else if (composedCustomFee.fee !== '0') {
      customFeeDefaultValue = composedCustomFee.feePerByte;
    }

    opener.classList.add('active');
    selectedFee = opener; // eslint-disable-next-line no-use-before-define

    focusInput(customFeeDefaultValue);
  };

  var focusInput = function focusInput(defaultValue) {
    var input = _common.container.getElementsByTagName('input')[0];

    setTimeout(function () {
      // eslint-disable-next-line no-use-before-define
      input.oninput = handleCustomFeeChange;

      if (defaultValue) {
        input.value = defaultValue.toString();
        var event = document.createEvent('Event');
        event.initEvent('input', true, true);
        input.dispatchEvent(event);
      }

      input.focus();
    }, 1);
  };

  var minFee = data.coinInfo.minFeeSatoshiKb / 1000;
  var maxFee = data.coinInfo.maxFeeSatoshiKb / 1000;

  var handleCustomFeeChange = function handleCustomFeeChange(event) {
    window.clearTimeout(composingTimeout);
    sendButton.setAttribute('disabled', 'disabled'); // $FlowIssue value not found on Event target

    var value = event.currentTarget.value;
    var valueNum = parseInt(value, 10);

    if (Number.isNaN(valueNum)) {
      if (value.length > 0) {
        customFeeLabel.innerHTML = 'Incorrect fee';
      } else {
        customFeeLabel.innerHTML = 'Missing fee';
      }
    } else if (valueNum.toString() !== value) {
      customFeeLabel.innerHTML = 'Incorrect fee';
    } else if (valueNum < minFee) {
      customFeeLabel.innerHTML = 'Fee is too low';
    } else if (valueNum > maxFee) {
      customFeeLabel.innerHTML = 'Fee is too big';
    } else {
      customFeeLabel.innerHTML = 'Composing...';

      var composeCustomFeeTimeoutHandler = function composeCustomFeeTimeoutHandler() {
        (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_FEE, {
          type: 'compose-custom',
          value: value
        }));
      };

      composingTimeout = window.setTimeout(composeCustomFeeTimeoutHandler, 800);
    }
  };

  var changeAccountButton = _common.container.getElementsByClassName('back-button')[0];

  changeAccountButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_FEE, {
      type: 'change-account'
    }));
    (0, _common.showView)('loader');
  };

  sendButton.onclick = function () {
    if (!selectedFee) return;
    var selectedName = selectedFee.getAttribute('data-fee');
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_FEE, {
      type: 'send',
      value: selectedName || 'custom'
    }));
    (0, _common.showView)('loader');
  }; // select default fee level


  var defaultLevel = feeList.querySelectorAll('[data-fee="normal"]')[0];

  if (defaultLevel) {
    defaultLevel.click();
  } else {
    // normal level not available, try to select first active button or custom fee
    var allLevels = feeList.querySelectorAll('.list');

    for (var _i = 0; _i < allLevels.length; _i++) {
      if (!allLevels[_i].hasAttribute('disabled')) {
        allLevels[_i].click();

        break;
      }
    }
  }
};

exports.selectFee = selectFee;