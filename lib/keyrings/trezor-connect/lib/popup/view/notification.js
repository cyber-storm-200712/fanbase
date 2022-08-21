"use strict";

exports.__esModule = true;
exports.showBackupNotification = exports.showBridgeUpdateNotification = exports.showFirmwareUpdateNotification = void 0;

var _common = require("./common");

var showFirmwareUpdateNotification = function showFirmwareUpdateNotification(device) {
  var container = document.getElementsByClassName('notification')[0];
  var warning = container.querySelector('.firmware-update-notification');

  if (warning) {
    // already exists
    return;
  }

  if (!device.features) return;
  if (!device.firmwareRelease) return;

  var view = _common.views.getElementsByClassName('firmware-update-notification');

  var notification = document.createElement('div');
  notification.className = 'firmware-update-notification notification-item';
  var viewItem = view.item(0);

  if (viewItem) {
    notification.innerHTML = viewItem.innerHTML;
  }

  var button = notification.getElementsByClassName('notification-button')[0];
  button.setAttribute('href', 'https://suite.trezor.io/web/firmware/');
  container.appendChild(notification);
  var close = notification.querySelector('.close-icon');

  if (close) {
    close.addEventListener('click', function () {
      container.removeChild(notification);
    });
  }
};

exports.showFirmwareUpdateNotification = showFirmwareUpdateNotification;

var showBridgeUpdateNotification = function showBridgeUpdateNotification() {
  var container = document.getElementsByClassName('notification')[0];
  var warning = container.querySelector('.bridge-update-notification');

  if (warning) {
    // already exists
    return;
  }

  var view = _common.views.getElementsByClassName('bridge-update-notification');

  var notification = document.createElement('div');
  notification.className = 'bridge-update-notification notification-item';
  var viewItem = view.item(0);

  if (viewItem) {
    notification.innerHTML = viewItem.innerHTML;
  }

  container.appendChild(notification);
  var close = notification.querySelector('.close-icon');

  if (close) {
    close.addEventListener('click', function () {
      container.removeChild(notification);
    });
  }
};

exports.showBridgeUpdateNotification = showBridgeUpdateNotification;

var showBackupNotification = function showBackupNotification(_device) {
  var container = document.getElementsByClassName('notification')[0];
  var warning = container.querySelector('.backup-notification');

  if (warning) {
    // already exists
    return;
  }

  var view = _common.views.getElementsByClassName('backup-notification');

  var notification = document.createElement('div');
  notification.className = 'backup-notification notification-item';
  var viewItem = view.item(0);

  if (viewItem) {
    notification.innerHTML = viewItem.innerHTML;
  }

  container.appendChild(notification);
  var close = notification.querySelector('.close-icon');

  if (close) {
    close.addEventListener('click', function () {
      container.removeChild(notification);
    });
  }
};

exports.showBackupNotification = showBackupNotification;