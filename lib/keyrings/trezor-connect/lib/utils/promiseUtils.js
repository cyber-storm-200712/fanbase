"use strict";

exports.__esModule = true;
exports.resolveAfter = void 0;

var resolveAfter = function resolveAfter(msec, value) {
  return new Promise(function (resolve) {
    setTimeout(resolve, msec, value);
  });
};

exports.resolveAfter = resolveAfter;