"use strict";

/*
Passing messages from background script to popup
*/
var port = chrome.runtime.connect({
  name: 'trezor-connect'
});
port.onMessage.addListener(function (message) {
  window.postMessage(message, window.location.origin);
});
port.onDisconnect.addListener(function () {
  port = null;
});
/*
Passing messages from popup to background script
*/

window.addEventListener('message', function (event) {
  if (port && event.source === window && event.data) {
    port.postMessage({
      data: event.data
    });
  }
});