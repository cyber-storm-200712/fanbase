"use strict";

exports.__esModule = true;
exports.selectAccount = void 0;

var _builder = require("../../message/builder");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _common = require("./common");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var setHeader = function setHeader(payload) {
  var h3 = _common.container.getElementsByTagName('h3')[0];

  if (payload.type === 'end') {
    h3.innerHTML = "Select " + payload.coinInfo.label + " account";
  } else {
    h3.innerHTML = "Loading " + payload.coinInfo.label + " accounts...";
  }
};

var selectAccount = function selectAccount(payload) {
  if (!payload) return;
  var accountTypes = payload.accountTypes,
      defaultAccountType = payload.defaultAccountType,
      accounts = payload.accounts; // first render
  // show "select-account" view
  // configure tabs

  if (Array.isArray(accountTypes)) {
    (0, _common.showView)('select-account'); // setHeader(payload);

    if (accountTypes.length > 1) {
      (function () {
        var tabs = _common.container.getElementsByClassName('tabs')[0];

        tabs.style.display = 'flex';

        var selectAccountContainer = _common.container.getElementsByClassName('select-account')[0];

        var buttons = tabs.getElementsByClassName('tab-selection');
        var firstGroupHeader = tabs.children[0].innerHTML; // store default label (Accounts)

        var selectedType = defaultAccountType || (accountTypes.includes('p2sh') ? 'p2sh' : 'p2wpkh');
        selectAccountContainer.className = "select-account " + selectedType;

        if (accountTypes.includes('p2sh')) {
          var bech32warn = _common.container.getElementsByClassName('bech32-warning')[0];

          bech32warn.removeAttribute('style'); // remove default 'display: none' from element
        }

        var _loop = function _loop(_i) {
          var button = buttons[_i];
          var type = button.getAttribute('data-tab');

          if (type && accountTypes.indexOf(type) >= 0) {
            button.onclick = function () {
              selectAccountContainer.className = "select-account " + type;
            };
          } else {
            tabs.removeChild(button);
            _i--;
          }

          i = _i;
        };

        for (var i = 0; i < buttons.length; i++) {
          _loop(i);
        }

        tabs.children[0].innerHTML = firstGroupHeader; // switch first label to default
      })();
    }
  } // set header


  setHeader(payload);
  if (!accounts) return;
  var buttons = {
    p2wpkh: _common.container.querySelectorAll('.select-account-list.p2wpkh')[0],
    p2tr: _common.container.querySelectorAll('.select-account-list.p2tr')[0],
    p2sh: _common.container.querySelectorAll('.select-account-list.p2sh')[0],
    p2pkh: _common.container.querySelectorAll('.select-account-list.p2pkh')[0]
  };

  var handleClick = function handleClick(event) {
    if (!(event.currentTarget instanceof HTMLElement)) return;
    var index = event.currentTarget.getAttribute('data-index');
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_ACCOUNT, parseInt(index, 10)));
    (0, _common.showView)('loader');
  };

  var removeEmptyButton = function removeEmptyButton(buttonContainer) {
    var defaultButton = buttonContainer.querySelectorAll('.account-default')[0];

    if (defaultButton) {
      buttonContainer.removeChild(defaultButton);
    }
  };

  var updateButtonValue = function updateButtonValue(button, account) {
    if (button.innerHTML.length < 1) {
      button.innerHTML = "\n                <span class=\"account-title\"></span>\n                <span class=\"account-status\"></span>";
    }

    var title = button.getElementsByClassName('account-title')[0];
    var status = button.getElementsByClassName('account-status')[0];
    title.innerHTML = account.label;

    if (typeof account.balance !== 'string') {
      status.innerHTML = 'Loading...';
      button.setAttribute('disabled', 'disabled');
    } else {
      status.innerHTML = account.empty ? 'New account' : account.balance;
      var buttonDisabled = payload.preventEmpty && account.empty;

      if (buttonDisabled) {
        button.setAttribute('disabled', 'disabled');
      } else {
        button.removeAttribute('disabled');
        button.addEventListener('click', handleClick, false);
      }
    }
  };

  accounts.forEach(function (account, index) {
    var buttonContainer = buttons[account.type];
    var existed = buttonContainer.querySelectorAll("[data-index=\"" + index + "\"]")[0];

    if (!existed) {
      var button = document.createElement('button');
      button.className = 'list';
      button.setAttribute('data-index', index.toString());
      updateButtonValue(button, account);
      removeEmptyButton(buttonContainer);
      buttonContainer.appendChild(button);
    } else {
      updateButtonValue(existed, account);
    }
  });
};

exports.selectAccount = selectAccount;