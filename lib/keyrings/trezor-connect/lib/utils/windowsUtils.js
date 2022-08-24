"use strict";

exports.__esModule = true;
exports.escapeHtml = exports.sendMessageToOpener = exports.sendMessage = void 0;

// send message from iframe to parent
var sendMessage = function sendMessage(message, origin) {
  return window.parent.postMessage(message, origin);
}; // send message from popup to parent


exports.sendMessage = sendMessage;

var sendMessageToOpener = function sendMessageToOpener(message, origin) {
  if (window.opener) {
    return window.opener.postMessage(message, origin);
  } // webextensions are expecting this message in "content-script" which is running in "this.window", above this script


  window.postMessage(message, window.location.origin);
}; // browser built-in functionality to quickly and safely escape the string


exports.sendMessageToOpener = sendMessageToOpener;

var escapeHtml = function escapeHtml(payload) {
  if (!payload) return;

  try {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(JSON.stringify(payload)));
    return JSON.parse(div.innerHTML);
  } catch (error) {// do nothing
  }
};

exports.escapeHtml = escapeHtml;