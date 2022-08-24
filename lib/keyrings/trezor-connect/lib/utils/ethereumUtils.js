"use strict";

exports.__esModule = true;
exports.getNetworkLabel = void 0;

var getNetworkLabel = function getNetworkLabel(label, network) {
  if (network) {
    var name = network.name.toLowerCase().indexOf('testnet') >= 0 ? 'Testnet' : network.name;
    return label.replace('#NETWORK', name);
  }

  return label.replace('#NETWORK', '');
};

exports.getNetworkLabel = getNetworkLabel;