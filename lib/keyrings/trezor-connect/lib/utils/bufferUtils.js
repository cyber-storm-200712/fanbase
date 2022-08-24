"use strict";

exports.__esModule = true;
exports.reverseBuffer = void 0;

var reverseBuffer = function reverseBuffer(buf) {
  var copy = Buffer.alloc(buf.length);
  buf.copy(copy);
  [].reverse.call(copy);
  return copy;
};

exports.reverseBuffer = reverseBuffer;