"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.cloneCoinInfo = cloneCoinInfo;
exports.getAllNetworks = exports.getUniqueNetworks = exports.parseCoinsJson = exports.getCoinName = exports.getCoinInfo = exports.getCoinInfoByHash = exports.fixCoinInfoNetwork = exports.getBech32Network = exports.getSegwitNetwork = exports.getMiscNetwork = exports.getEthereumNetwork = exports.getBitcoinNetwork = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _constants = require("../constants");

var _pathUtils = require("../utils/pathUtils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var bitcoinNetworks = [];
var ethereumNetworks = [];
var miscNetworks = [];

function cloneCoinInfo(info) {
  var jsonString = JSON.stringify(info);

  if (jsonString === undefined) {
    // jsonString === undefined IF and only IF obj === undefined
    // therefore no need to clone
    return info;
  }

  return JSON.parse(jsonString);
}

var getBitcoinNetwork = function getBitcoinNetwork(pathOrName) {
  var networks = cloneCoinInfo(bitcoinNetworks);

  if (typeof pathOrName === 'string') {
    var name = pathOrName.toLowerCase();
    return networks.find(function (n) {
      return n.name.toLowerCase() === name || n.shortcut.toLowerCase() === name || n.label.toLowerCase() === name;
    });
  }

  var slip44 = (0, _pathUtils.fromHardened)(pathOrName[1]);
  return networks.find(function (n) {
    return n.slip44 === slip44;
  });
};

exports.getBitcoinNetwork = getBitcoinNetwork;

var getEthereumNetwork = function getEthereumNetwork(pathOrName) {
  var networks = cloneCoinInfo(ethereumNetworks);

  if (typeof pathOrName === 'string') {
    var name = pathOrName.toLowerCase();
    return networks.find(function (n) {
      return n.name.toLowerCase() === name || n.shortcut.toLowerCase() === name;
    });
  }

  var slip44 = (0, _pathUtils.fromHardened)(pathOrName[1]);
  return networks.find(function (n) {
    return n.slip44 === slip44;
  });
};

exports.getEthereumNetwork = getEthereumNetwork;

var getMiscNetwork = function getMiscNetwork(pathOrName) {
  var networks = cloneCoinInfo(miscNetworks);

  if (typeof pathOrName === 'string') {
    var name = pathOrName.toLowerCase();
    return networks.find(function (n) {
      return n.name.toLowerCase() === name || n.shortcut.toLowerCase() === name;
    });
  }

  var slip44 = (0, _pathUtils.fromHardened)(pathOrName[1]);
  return networks.find(function (n) {
    return n.slip44 === slip44;
  });
};
/*
 * Bitcoin networks
 */


exports.getMiscNetwork = getMiscNetwork;

var getSegwitNetwork = function getSegwitNetwork(coin) {
  if (coin.segwit && typeof coin.xPubMagicSegwit === 'number') {
    return _objectSpread(_objectSpread({}, coin.network), {}, {
      bip32: _objectSpread(_objectSpread({}, coin.network.bip32), {}, {
        "public": coin.xPubMagicSegwit
      })
    });
  }

  return null;
};

exports.getSegwitNetwork = getSegwitNetwork;

var getBech32Network = function getBech32Network(coin) {
  if (coin.segwit && typeof coin.xPubMagicSegwitNative === 'number') {
    return _objectSpread(_objectSpread({}, coin.network), {}, {
      bip32: _objectSpread(_objectSpread({}, coin.network.bip32), {}, {
        "public": coin.xPubMagicSegwitNative
      })
    });
  }

  return null;
}; // fix coinInfo network values from path (segwit/legacy)


exports.getBech32Network = getBech32Network;

var fixCoinInfoNetwork = function fixCoinInfoNetwork(ci, path) {
  var coinInfo = cloneCoinInfo(ci);

  if (path[0] === (0, _pathUtils.toHardened)(84)) {
    var bech32Network = getBech32Network(coinInfo);

    if (bech32Network) {
      coinInfo.network = bech32Network;
    }
  } else if (path[0] === (0, _pathUtils.toHardened)(49)) {
    var segwitNetwork = getSegwitNetwork(coinInfo);

    if (segwitNetwork) {
      coinInfo.network = segwitNetwork;
    }
  } else {
    coinInfo.segwit = false;
  }

  return coinInfo;
};

exports.fixCoinInfoNetwork = fixCoinInfoNetwork;

var detectBtcVersion = function detectBtcVersion(data) {
  if (data.subversion == null) {
    return 'btc';
  }

  if (data.subversion.startsWith('/Bitcoin ABC')) {
    return 'bch';
  }

  if (data.subversion.startsWith('/Bitcoin Cash')) {
    return 'bch';
  }

  if (data.subversion.startsWith('/Bitcoin Gold')) {
    return 'btg';
  }

  return 'btc';
};

var getCoinInfoByHash = function getCoinInfoByHash(hash, networkInfo) {
  var networks = cloneCoinInfo(bitcoinNetworks);
  var result = networks.find(function (info) {
    return hash.toLowerCase() === info.hashGenesisBlock.toLowerCase();
  });

  if (!result) {
    throw _constants.ERRORS.TypedError('Method_UnknownCoin', "Coin info not found for hash: " + hash + " " + networkInfo.hashGenesisBlock);
  }

  if (result.isBitcoin) {
    var btcVersion = detectBtcVersion(networkInfo);
    var fork;

    if (btcVersion === 'bch') {
      fork = networks.find(function (info) {
        return info.name === 'Bcash';
      });
    } else if (btcVersion === 'btg') {
      fork = networks.find(function (info) {
        return info.name === 'Bgold';
      });
    }

    if (fork) {
      return fork;
    }

    throw _constants.ERRORS.TypedError('Method_UnknownCoin', "Coin info not found for hash: " + hash + " " + networkInfo.hashGenesisBlock + " BTC version:" + btcVersion);
  }

  return result;
};

exports.getCoinInfoByHash = getCoinInfoByHash;

var getCoinInfo = function getCoinInfo(currency) {
  return getBitcoinNetwork(currency) || getEthereumNetwork(currency) || getMiscNetwork(currency);
};

exports.getCoinInfo = getCoinInfo;

var getCoinName = function getCoinName(path) {
  var slip44 = (0, _pathUtils.fromHardened)(path[1]);
  var network = ethereumNetworks.find(function (n) {
    return n.slip44 === slip44;
  });
  return network ? network.name : 'Unknown coin';
};

exports.getCoinName = getCoinName;

var parseBitcoinNetworksJson = function parseBitcoinNetworksJson(json) {
  Object.keys(json).forEach(function (key) {
    var coin = json[key];
    var shortcut = coin.coin_shortcut;
    var isBitcoin = shortcut === 'BTC' || shortcut === 'TEST';
    var hasTimestamp = shortcut === 'CPC' || shortcut === 'PPC' || shortcut === 'tPPC';
    var network = {
      messagePrefix: coin.signed_message_header,
      bech32: coin.bech32_prefix,
      bip32: {
        "public": coin.xpub_magic,
        "private": coin.xprv_magic
      },
      pubKeyHash: coin.address_type,
      scriptHash: coin.address_type_p2sh,
      forkId: coin.fork_id,
      consensusBranchId: coin.consensus_branch_id,
      // zcash, komodo
      wif: 0 // doesn't matter, for type correctness

    };
    bitcoinNetworks.push({
      type: 'bitcoin',
      // address_type in Network
      // address_type_p2sh in Network
      // bech32_prefix in Network
      // consensus_branch_id in Network
      // bip115: not used
      // bitcore: not used,
      // blockbook: not used,
      blockchainLink: coin.blockchain_link,
      blocktime: Math.round(coin.blocktime_seconds / 60),
      cashAddrPrefix: coin.cashaddr_prefix,
      label: coin.coin_label,
      name: coin.coin_name,
      shortcut: shortcut,
      // cooldown not used
      curveName: coin.curve_name,
      // decred not used
      defaultFees: coin.default_fee_b,
      dustLimit: coin.dust_limit,
      forceBip143: coin.force_bip143,
      // forkid in Network
      // github not used
      hashGenesisBlock: coin.hash_genesis_block,
      // key not used
      // maintainer not used
      maxAddressLength: coin.max_address_length,
      maxFeeSatoshiKb: coin.maxfee_kb,
      minAddressLength: coin.min_address_length,
      minFeeSatoshiKb: coin.minfee_kb,
      // name: same as coin_label
      segwit: coin.segwit,
      // signed_message_header in Network
      slip44: coin.slip44,
      support: coin.support,
      // uri_prefix not used
      // version_group_id not used
      // website not used
      // xprv_magic in Network
      xPubMagic: coin.xpub_magic,
      xPubMagicSegwitNative: coin.xpub_magic_segwit_native,
      xPubMagicSegwit: coin.xpub_magic_segwit_p2sh,
      taproot: coin.taproot,
      // custom
      network: network,
      // bitcoinjs network
      isBitcoin: isBitcoin,
      hasTimestamp: hasTimestamp,
      maxFee: Math.round(coin.maxfee_kb / 1000),
      minFee: Math.round(coin.minfee_kb / 1000),
      // used in backend ?
      blocks: Math.round(coin.blocktime_seconds / 60),
      decimals: coin.decimals
    });
  });
};

var parseEthereumNetworksJson = function parseEthereumNetworksJson(json) {
  Object.keys(json).forEach(function (key) {
    var network = json[key];
    ethereumNetworks.push({
      type: 'ethereum',
      blockchainLink: network.blockchain_link,
      blocktime: -1,
      // unknown
      chain: network.chain,
      chainId: network.chain_id,
      // key not used
      defaultFees: [{
        label: 'normal',
        feePerUnit: '5000000000',
        feeLimit: '21000'
      }],
      minFee: 1,
      maxFee: 10000,
      label: network.name,
      name: network.name,
      shortcut: network.shortcut,
      rskip60: network.rskip60,
      slip44: network.slip44,
      support: network.support,
      // url not used
      network: undefined,
      decimals: 16
    });
  });
};

var parseMiscNetworksJSON = function parseMiscNetworksJSON(json, type) {
  Object.keys(json).forEach(function (key) {
    var network = json[key];
    var minFee = -1; // unknown

    var maxFee = -1; // unknown

    var defaultFees = {
      Normal: -1
    }; // unknown

    var shortcut = network.shortcut.toLowerCase();

    if (shortcut === 'xrp' || shortcut === 'txrp') {
      minFee = 10;
      maxFee = 10000;
      defaultFees = {
        Normal: 12
      };
    }

    if (shortcut === 'ada' || shortcut === 'tada') {
      minFee = 44; // max tx size * lovelace per byte + base fee

      maxFee = 16384 * 44 + 155381;
      defaultFees = {
        Normal: 44
      };
    }

    miscNetworks.push({
      type: type || 'misc',
      blockchainLink: network.blockchain_link,
      blocktime: -1,
      curve: network.curve,
      defaultFees: defaultFees,
      minFee: minFee,
      maxFee: maxFee,
      label: network.name,
      name: network.name,
      shortcut: network.shortcut,
      slip44: network.slip44,
      support: network.support,
      network: undefined,
      decimals: network.decimals
    });
  });
};

var parseCoinsJson = function parseCoinsJson(json) {
  Object.keys(json).forEach(function (key) {
    switch (key) {
      case 'bitcoin':
        return parseBitcoinNetworksJson(json[key]);

      case 'eth':
        return parseEthereumNetworksJson(json[key]);

      case 'misc':
        return parseMiscNetworksJSON(json[key]);

      case 'nem':
        return parseMiscNetworksJSON(json[key], 'nem');
      // no default
    }
  });
};

exports.parseCoinsJson = parseCoinsJson;

var getUniqueNetworks = function getUniqueNetworks(networks) {
  return networks.reduce(function (result, info) {
    if (!info || result.find(function (i) {
      return i.shortcut === info.shortcut;
    })) return result;
    return result.concat(info);
  }, []);
};

exports.getUniqueNetworks = getUniqueNetworks;

var getAllNetworks = function getAllNetworks() {
  return [].concat(bitcoinNetworks).concat(ethereumNetworks).concat(miscNetworks);
};

exports.getAllNetworks = getAllNetworks;