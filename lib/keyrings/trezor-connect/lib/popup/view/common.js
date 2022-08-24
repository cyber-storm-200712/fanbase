"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.postMessageToParent = exports.postMessage = exports.initMessageChannel = exports.getIframeElement = exports.showView = exports.clearView = exports.createTooltip = exports.setOperation = exports.iframe = exports.views = exports.container = exports.header = void 0;

var _DataManager = _interopRequireDefault(require("../../data/DataManager"));

var _constants = require("../../constants");

var header = document.getElementsByTagName('header')[0];
exports.header = header;
var container = document.getElementById('container');
exports.container = container;
var views = document.getElementById('views'); // eslint-disable-next-line import/no-mutable-exports

exports.views = views;
var iframe; // TODO: Window type

exports.iframe = iframe;
var channel = new MessageChannel(); // used in direct element communication (iframe.postMessage)

var broadcast = null;

var setOperation = function setOperation(operation) {
  var infoPanel = document.getElementsByClassName('info-panel')[0];
  var operationEl = infoPanel.getElementsByClassName('operation')[0];
  var originEl = infoPanel.getElementsByClassName('origin')[0];
  operationEl.innerHTML = operation;
  originEl.innerText = _DataManager["default"].getSettings('hostLabel') || _DataManager["default"].getSettings('origin');

  var icon = _DataManager["default"].getSettings('hostIcon');

  if (icon) {
    var iconContainers = document.getElementsByClassName('service-info');

    for (var i = 0; i < iconContainers.length; i++) {
      iconContainers[i].innerHTML = "<img src=\"" + icon + "\" alt=\"\" />";
    }
  }
};

exports.setOperation = setOperation;

var createTooltip = function createTooltip(text) {
  var tooltip = document.createElement('div');
  tooltip.setAttribute('tooltip', text);
  tooltip.setAttribute('tooltip-position', 'bottom');
  return tooltip;
};

exports.createTooltip = createTooltip;

var clearView = function clearView() {
  container.innerHTML = '';
};

exports.clearView = clearView;

var showView = function showView(className) {
  clearView();
  var view = views.getElementsByClassName(className);

  if (view) {
    var viewItem = view.item(0);

    if (viewItem) {
      container.innerHTML = viewItem.outerHTML;
    }
  } else {
    var unknown = views.getElementsByClassName('unknown-view');
    var unknownItem = unknown.item(0);

    if (unknownItem) {
      container.innerHTML = unknownItem.outerHTML;
    }
  }

  return container;
};

exports.showView = showView;

var getIframeElement = function getIframeElement() {
  // try find iframe in opener window
  if (!window.opener) return null;
  var frames = window.opener.frames;
  if (!frames) return null; // electron will return undefined

  for (var i = 0; i < frames.length; i++) {
    try {
      // try to get iframe origin, this action will not fail ONLY if the origins of iframe and popup are the same
      if (frames[i].location.host === window.location.host) {
        exports.iframe = iframe = frames[i];
      }
    } catch (error) {// do nothing, try next entry
    }
  }

  return iframe;
}; // initialize message channel with iframe element


exports.getIframeElement = getIframeElement;

var initMessageChannel = function initMessageChannel(id, handler) {
  var hasIframe = getIframeElement();

  if (id && typeof BroadcastChannel !== 'undefined') {
    try {
      broadcast = new BroadcastChannel(id);
      broadcast.onmessage = handler;
    } catch (error) {// silent error. use MessageChannel as fallback communication
    }

    return;
  }

  if (!hasIframe) {
    throw _constants.ERRORS.TypedError('Popup_ConnectionMissing');
  }

  channel.port1.onmessage = handler;
}; // this method can be used from anywhere


exports.initMessageChannel = initMessageChannel;

var postMessage = function postMessage(message) {
  if (!broadcast && !iframe) {
    throw _constants.ERRORS.TypedError('Popup_ConnectionMissing');
  }

  if (broadcast) {
    broadcast.postMessage(message);
    return;
  } // First message to iframe, MessageChannel port needs to set here


  if (message.type && message.type === _constants.POPUP.HANDSHAKE) {
    iframe.postMessage(message, window.location.origin, [channel.port2]);
    return;
  }

  iframe.postMessage(message, window.location.origin);
};

exports.postMessage = postMessage;

var postMessageToParent = function postMessageToParent(message) {
  if (window.opener) {
    // post message to parent and wait for POPUP.INIT message
    window.opener.postMessage(message, '*');
  } else {
    // webextensions doesn't have "window.opener" reference and expect this message in "content-script" above popup [see: ./src/plugins/webextension/trezor-content-script.js]
    // future communication channel with webextension iframe will be "ChromePort"
    // and electron (electron which uses connect hosted outside)
    // https://github.com/electron/electron/issues/7228
    window.postMessage(message, window.location.origin);
  }
};

exports.postMessageToParent = postMessageToParent;