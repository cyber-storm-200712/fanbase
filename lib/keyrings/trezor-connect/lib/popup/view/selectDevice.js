"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.selectDevice = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _builder = require("../../message/builder");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var POPUP = _interopRequireWildcard(require("../../constants/popup"));

var _errors = require("../../constants/errors");

var _common = require("./common");

var _DataManager = _interopRequireDefault(require("../../data/DataManager"));

var _browserUtils = require("../../env/browser/browserUtils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var initWebUsbButton = function initWebUsbButton(webusb, showLoader) {
  if (!webusb) return;

  var webusbContainer = _common.container.getElementsByClassName('webusb')[0];

  webusbContainer.style.display = 'flex';
  var button = webusbContainer.getElementsByTagName('button')[0];

  if (!_common.iframe) {
    button.innerHTML = '<span class="plus"></span><span class="text">Pair devices</span>';
  }

  var usb = _common.iframe ? _common.iframe.clientInformation.usb : null;

  var onClick = /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (usb) {
                _context.next = 3;
                break;
              }

              window.postMessage({
                type: POPUP.EXTENSION_USB_PERMISSIONS
              }, window.location.origin);
              return _context.abrupt("return");

            case 3:
              _context.prev = 3;
              _context.next = 6;
              return usb.requestDevice({
                filters: _DataManager["default"].getConfig().webusb
              });

            case 6:
              if (showLoader) {
                (0, _common.showView)('loader');
              }

              _context.next = 11;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](3);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[3, 9]]);
    }));

    return function onClick() {
      return _ref.apply(this, arguments);
    };
  }();

  button.onclick = onClick;
};

var selectDevice = function selectDevice(payload) {
  if (!payload) return;

  if (!payload.devices || !Array.isArray(payload.devices) || payload.devices.length === 0) {
    // No device connected
    (0, _common.showView)('connect');
    initWebUsbButton(payload.webusb, true);
    return;
  }

  (0, _common.showView)('select-device');
  initWebUsbButton(payload.webusb, false); // If only 'remember device for now' toggle and no webusb button is available
  // show it right under the table

  if (!payload.webusb) {
    var wrapper = _common.container.getElementsByClassName('wrapper')[0];

    wrapper.style.justifyContent = 'normal';
  } // Populate device list


  var deviceList = _common.container.getElementsByClassName('select-device-list')[0]; // deviceList.innerHTML = '';


  var rememberCheckbox = _common.container.getElementsByClassName('remember-device')[0]; // Show readable devices first


  payload.devices.sort(function (d1, d2) {
    if (d1.type === 'unreadable' && d2.type !== 'unreadable') {
      return 1;
    }

    if (d1.type !== 'unreadable' && d2.type === 'unreadable') {
      return -1;
    }

    return 0;
  });
  payload.devices.forEach(function (device) {
    var deviceButton = document.createElement('button');
    deviceButton.className = 'list';

    if (device.type !== 'unreadable') {
      deviceButton.addEventListener('click', function () {
        (0, _common.postMessage)((0, _builder.UiMessage)(UI.RECEIVE_DEVICE, {
          remember: rememberCheckbox && rememberCheckbox.checked,
          device: device
        }));
        (0, _common.showView)('loader');
      });
    }

    var deviceIcon = document.createElement('span');
    deviceIcon.className = 'icon';

    if (device.features) {
      if (device.features.major_version === 2) {
        deviceIcon.classList.add('model-t');
      }
    }

    var deviceName = document.createElement('span');
    deviceName.className = 'device-name';
    deviceName.textContent = device.label;
    var wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    wrapper.appendChild(deviceIcon);
    wrapper.appendChild(deviceName);
    deviceButton.appendChild(wrapper);

    if (device.type !== 'acquired' || device.status === 'occupied') {
      deviceButton.classList.add('device-explain');
      var explanation = document.createElement('div');
      explanation.className = 'explain'; // handle unreadable device

      if (device.type === 'unreadable') {
        var os = (0, _browserUtils.getOS)(); // default explanation: contact support

        var explanationContent = 'Please <a href="https://trezor.io/support/" target="_blank" rel="noreferrer noopener" onclick="window.closeWindow();">contact support.</a>'; // linux + LIBUSB_ERROR handling

        if (os === 'linux' && device.error.indexOf(_errors.LIBUSB_ERROR_MESSAGE) >= 0) {
          explanationContent = 'Please install <a href="https://suite.trezor.io/web/udev/" target="_blank" rel="noreferrer noopener" onclick="window.closeWindow();">Udev rules</a> to use Trezor device.';
        } // webusb error handling (top priority)


        if (payload.webusb) {
          explanationContent = 'Please install <a href="https://suite.trezor.io/web/bridge/" target="_blank" rel="noreferrer noopener" onclick="window.closeWindow();">Bridge</a> to use Trezor device.';
        }

        deviceButton.disabled = true;
        deviceIcon.classList.add('unknown');
        deviceName.textContent = 'Unrecognized device';
        explanation.innerHTML = device.error + "<br />" + explanationContent;
      }

      if (device.type === 'unacquired' || device.status === 'occupied') {
        deviceName.textContent = 'Inactive device';
        deviceButton.classList.add('unacquired');
        explanation.classList.add('unacquired');
        explanation.innerHTML = 'Click to activate. This device is used by another application.';

        if (device.type === 'acquired') {
          deviceName.textContent = device.label;
        }
      }

      deviceButton.appendChild(explanation);
    }

    deviceList.appendChild(deviceButton);
  });
};

exports.selectDevice = selectDevice;