"use strict";

exports.__esModule = true;

var _inputs = require("./inputs");

Object.keys(_inputs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _inputs[key]) return;
  exports[key] = _inputs[key];
});

var _outputs = require("./outputs");

Object.keys(_outputs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _outputs[key]) return;
  exports[key] = _outputs[key];
});

var _refTx = require("./refTx");

Object.keys(_refTx).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _refTx[key]) return;
  exports[key] = _refTx[key];
});