"use strict";

exports.__esModule = true;
exports.initInvalidPassphraseView = void 0;

var _builder = require("../../message/builder");

var UI = _interopRequireWildcard(require("../../constants/ui"));

var _common = require("./common");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var initInvalidPassphraseView = function initInvalidPassphraseView(_payload) {
  (0, _common.showView)('invalid-passphrase');

  var retryButton = _common.container.getElementsByClassName('retry')[0];

  var useCurrentButton = _common.container.getElementsByClassName('useCurrent')[0];

  retryButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.INVALID_PASSPHRASE_ACTION, true));
    (0, _common.showView)('loader');
  };

  useCurrentButton.onclick = function () {
    (0, _common.postMessage)((0, _builder.UiMessage)(UI.INVALID_PASSPHRASE_ACTION, false));
    (0, _common.showView)('loader');
  };
};

exports.initInvalidPassphraseView = initInvalidPassphraseView;