"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.initBrowserView = void 0;

var _common = require("./common");

var _builder = require("../../message/builder");

var _DataManager = _interopRequireDefault(require("../../data/DataManager"));

var POPUP = _interopRequireWildcard(require("../../constants/popup"));

var _storage = require("../../storage");

var _browserUtils = require("../../env/browser/browserUtils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var validateBrowser = function validateBrowser() {
  var state = (0, _browserUtils.getBrowserState)(_DataManager["default"].getConfig().supportedBrowsers);

  if (!state.supported) {
    var permitted = (0, _storage.load)(_storage.BROWSER_KEY);
    return !permitted ? state : null;
  }
};

var initBrowserView = function initBrowserView(validation) {
  if (validation === void 0) {
    validation = true;
  }

  if (!validation) {
    (0, _common.showView)('browser-not-supported');

    var buttons = _common.container.getElementsByClassName('buttons')[0];

    if (buttons && buttons.parentNode) {
      buttons.parentNode.removeChild(buttons);
    }

    return;
  }

  var state = validateBrowser();

  if (!state) {
    (0, _common.postMessage)((0, _builder.UiMessage)(POPUP.HANDSHAKE));
    return;
  }

  if (state.mobile) {
    (0, _common.showView)('smartphones-not-supported');
    return;
  }

  (0, _common.showView)('browser-not-supported');

  var h3 = _common.container.getElementsByTagName('h3')[0];

  var ackButton = _common.container.getElementsByClassName('cancel')[0];

  var rememberCheckbox = _common.container.getElementsByClassName('remember-permissions')[0];

  if (state.outdated) {
    h3.innerText = 'Outdated browser';
  }

  ackButton.onclick = function () {
    if (rememberCheckbox && rememberCheckbox.checked) {
      (0, _storage.save)(_storage.BROWSER_KEY, true);
    }

    (0, _common.postMessage)((0, _builder.UiMessage)(POPUP.HANDSHAKE));
    (0, _common.showView)('loader');
  };
};

exports.initBrowserView = initBrowserView;