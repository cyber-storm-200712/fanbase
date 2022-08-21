"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _debug = require("./debug");

var _log = (0, _debug.initLog)('InteractionTimeout');

var InteractionTimeout = /*#__PURE__*/function () {
  function InteractionTimeout(seconds) {
    (0, _defineProperty2["default"])(this, "timeout", null);
    (0, _defineProperty2["default"])(this, "seconds", 0);

    if (seconds) {
      this.seconds = seconds;
    }
  }

  var _proto = InteractionTimeout.prototype;

  /**
   * Start the interaction timer.
   * The timer will fire the cancel function once reached
   * @param {function} cancelFn Function called once the timeout is reached
   * @param {number} seconds Optional parameter to override the seconds property
   * @returns {void}
   */
  _proto.start = function start(cancelFn, seconds) {
    var time = seconds || this.seconds; // Not worth running for less than a second

    if (time < 1) {
      return;
    } // Clear any previous timeouts set (reset)


    this.stop();

    _log.log("starting interaction timeout for " + time + " seconds");

    this.timeout = setTimeout(function () {
      _log.log('interaction timed out');

      cancelFn();
    }, 1000 * time);
  }
  /**
   * Stop the interaction timer
   * @returns {void}
   */
  ;

  _proto.stop = function stop() {
    if (this.timeout) {
      _log.log('clearing interaction timeout');

      clearTimeout(this.timeout);
    }
  };

  (0, _createClass2["default"])(InteractionTimeout, [{
    key: "seconds",
    get: function get() {
      return this.seconds;
    },
    set: function set(seconds) {
      this.seconds = seconds;
    }
  }]);
  return InteractionTimeout;
}();

exports["default"] = InteractionTimeout;