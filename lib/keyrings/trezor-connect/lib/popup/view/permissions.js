"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.initPermissionsView = void 0;

var _builder = require("../../message/builder");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _DataManager = _interopRequireDefault(require("../../data/DataManager"));

var _common = require("./common");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var getPermissionText = function getPermissionText(permissionType, _deviceName) {
  switch (permissionType) {
    case 'read':
      return 'Read public keys from Trezor device';

    case 'read-meta':
      return 'Read metadata from Trezor device';

    case 'write':
      return 'Prepare Trezor device for transaction and data signing';

    case 'write-meta':
      return 'Write metadata to Trezor device';

    case 'management':
      return 'Modify device settings';

    case 'custom-message':
      return 'Run custom operations';

    default:
      return '';
  }
};

var getPermissionTooltipText = function getPermissionTooltipText(permissionType) {
  switch (permissionType) {
    case 'read':
      return 'Permission needed to load public information from your device.';

    case 'write':
      return 'Permission needed to execute operations, such as composing a transaction, after your confirmation.';

    case 'management':
      return 'Permission needed to change device settings, such as PIN, passphrase, label or seed.';

    case 'custom-message':
      return 'Development tool. Use at your own risk. Allows service to send arbitrary data to your Trezor device.';

    default:
      return '';
  }
};

var createPermissionItem = function createPermissionItem(permissionText, tooltipText) {
  var permissionItem = document.createElement('div');
  permissionItem.className = 'permission-item'; // Tooltip

  if (tooltipText !== '') {
    var tooltip = (0, _common.createTooltip)(tooltipText);
    permissionItem.appendChild(tooltip);
  } //
  // Permission content (icon & text)


  var contentDiv = document.createElement('div');
  contentDiv.className = 'content';
  var infoIcon = document.createElement('span');
  infoIcon.className = 'info-icon';
  var permissionTextSpan = document.createElement('span');
  permissionTextSpan.innerText = permissionText;
  contentDiv.appendChild(infoIcon);
  contentDiv.appendChild(permissionTextSpan);
  permissionItem.appendChild(contentDiv); //

  return permissionItem;
};

var initPermissionsView = function initPermissionsView(payload) {
  (0, _common.showView)('permissions');

  var h3 = _common.container.getElementsByTagName('h3')[0];

  var hostName = h3.getElementsByClassName('host-name')[0];

  var permissionsList = _common.container.getElementsByClassName('permissions-list')[0];

  var confirmButton = _common.container.getElementsByClassName('confirm')[0];

  var cancelButton = _common.container.getElementsByClassName('cancel')[0];

  var rememberCheckbox = _common.container.getElementsByClassName('remember-permissions')[0];

  hostName.innerText = _DataManager["default"].getSettings('hostLabel') || _DataManager["default"].getSettings('origin');

  if (payload && Array.isArray(payload.permissions)) {
    payload.permissions.forEach(function (p) {
      var permissionText = getPermissionText(p, payload.device.label);
      var tooltipText = getPermissionTooltipText(p);
      var permissionItem = createPermissionItem(permissionText, tooltipText);
      permissionsList.appendChild(permissionItem);
    });
  }

  confirmButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_PERMISSION, {
      remember: rememberCheckbox && rememberCheckbox.checked,
      granted: true
    }));
    (0, _common.showView)('loader');
  };

  cancelButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_PERMISSION, {
      remember: rememberCheckbox && rememberCheckbox.checked,
      granted: false
    }));
    (0, _common.showView)('loader');
  };

  rememberCheckbox.onchange = function (e) {
    confirmButton.innerText = e.target.checked ? 'Always allow for this service' : 'Allow once for this session';
  };
};

exports.initPermissionsView = initPermissionsView;