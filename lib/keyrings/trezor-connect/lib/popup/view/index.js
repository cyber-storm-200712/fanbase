"use strict";

exports.__esModule = true;
exports.firmwareNotCompatible = exports.firmwareNotSupported = exports.firmwareRequiredUpdate = exports.passphraseOnDeviceView = exports.initBrowserView = exports.initConfirmationView = exports.initPermissionsView = exports.requestButton = exports.updateCustomFee = exports.selectFee = exports.selectAccount = exports.selectDevice = exports.initWordView = exports.initInvalidPassphraseView = exports.initPassphraseView = exports.initPinView = exports.postMessage = exports.showView = void 0;

var _common = require("./common");

exports.showView = _common.showView;
exports.postMessage = _common.postMessage;

var _pin = require("./pin");

exports.initPinView = _pin.initPinView;

var _passphrase = require("./passphrase");

exports.initPassphraseView = _passphrase.initPassphraseView;

var _invalidPassphrase = require("./invalidPassphrase");

exports.initInvalidPassphraseView = _invalidPassphrase.initInvalidPassphraseView;

var _word = require("./word");

exports.initWordView = _word.initWordView;

var _selectDevice = require("./selectDevice");

exports.selectDevice = _selectDevice.selectDevice;

var _selectAccount = require("./selectAccount");

exports.selectAccount = _selectAccount.selectAccount;

var _selectFee = require("./selectFee");

exports.selectFee = _selectFee.selectFee;
exports.updateCustomFee = _selectFee.updateCustomFee;

var _requestButton = require("./requestButton");

exports.requestButton = _requestButton.requestButton;

var _permissions = require("./permissions");

exports.initPermissionsView = _permissions.initPermissionsView;

var _confirmation = require("./confirmation");

exports.initConfirmationView = _confirmation.initConfirmationView;

var _browser = require("./browser");

exports.initBrowserView = _browser.initBrowserView;

var _passphraseOnDevice = require("./passphraseOnDevice");

exports.passphraseOnDeviceView = _passphraseOnDevice.passphraseOnDeviceView;

var _firmwareRequiredUpdate = require("./firmwareRequiredUpdate");

exports.firmwareRequiredUpdate = _firmwareRequiredUpdate.firmwareRequiredUpdate;

var _firmwareNotSupported = require("./firmwareNotSupported");

exports.firmwareNotSupported = _firmwareNotSupported.firmwareNotSupported;

var _firmwareNotCompatible = require("./firmwareNotCompatible");

exports.firmwareNotCompatible = _firmwareNotCompatible.firmwareNotCompatible;