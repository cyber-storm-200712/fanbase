"use strict";

exports.__esModule = true;
exports.getBridgeInfo = exports.parseBridgeJSON = void 0;
var info = {
  version: [],
  directory: '',
  packages: [],
  changelog: ''
}; // Parse JSON loaded from config.assets.bridge

var parseBridgeJSON = function parseBridgeJSON(json) {
  // $FlowIssue indexer property is missing in `JSON`
  var latest = json[0];
  var version = latest.version.join('.');
  var data = JSON.parse(JSON.stringify(latest).replace(/{version}/g, version));
  var directory = data.directory;
  var packages = data.packages.map(function (p) {
    return {
      name: p.name,
      platform: p.platform,
      url: "" + directory + p.url,
      signature: p.signature ? "" + directory + p.signature : undefined
    };
  });
  info.version = data.version;
  info.directory = directory;
  info.packages = packages;
  return info;
};

exports.parseBridgeJSON = parseBridgeJSON;

var getBridgeInfo = function getBridgeInfo() {
  return info;
};

exports.getBridgeInfo = getBridgeInfo;