export const MAINNET = 'main';
export const ROPSTEN = 'ropsten';
export const RINKEBY = 'rinkeby';
export const GOERLI = 'goerli';

export const NETWORK_TYPE_RPC = 'rpc';

export const MAINNET_NETWORK_ID = '1';
export const ROPSTEN_NETWORK_ID = '3';
export const RINKEBY_NETWORK_ID = '4';
export const GOERLI_NETWORK_ID = '5';
export const LOCALHOST_NETWORK_ID = '1337';

export const MAINNET_CHAIN_ID = '0x1';
export const ROPSTEN_CHAIN_ID = '0x3';
export const RINKEBY_CHAIN_ID = '0x4';
export const GOERLI_CHAIN_ID = '0x5';
export const LOCALHOST_CHAIN_ID = '0x539';

export const MAINNET_RPC_URL = 'https://mainnet.infura.io/v3/';
export const ROPSTEN_RPC_URL = 'https://ropsten.infura.io/v3/';
export const RINKEBY_RPC_URL = 'https://rinkeby.infura.io/v3/';
export const GOERLI_RPC_URL = 'https://goerli.infura.io/v3/';
export const LOCALHOST_RPC_URL = 'http://localhost:8545';

/**
 * The largest possible chain ID we can handle.
 * Explanation: https://gist.github.com/rekmarks/a47bd5f2525936c4b8eee31a16345553
 */
export const MAX_SAFE_CHAIN_ID = 4503599627370476;

export const MAINNET_DISPLAY_NAME = 'Ethereum Mainnet';
export const ROPSTEN_DISPLAY_NAME = 'Ropsten';
export const RINKEBY_DISPLAY_NAME = 'Rinkeby';
export const GOERLI_DISPLAY_NAME = 'Goerli';

export const ETH_SYMBOL = 'ETH';

export const INFURA_PROVIDER_TYPES = [MAINNET, ROPSTEN, RINKEBY, GOERLI];

export const TEST_CHAINS = [
  ROPSTEN_CHAIN_ID,
  RINKEBY_CHAIN_ID,
  GOERLI_CHAIN_ID,
];

export const NETWORK_TYPE_TO_ID_MAP = {
  [ROPSTEN]: { networkId: ROPSTEN_NETWORK_ID, chainId: ROPSTEN_CHAIN_ID },
  [RINKEBY]: { networkId: RINKEBY_NETWORK_ID, chainId: RINKEBY_CHAIN_ID },
  [GOERLI]: { networkId: GOERLI_NETWORK_ID, chainId: GOERLI_CHAIN_ID },
  [MAINNET]: { networkId: MAINNET_NETWORK_ID, chainId: MAINNET_CHAIN_ID },
};

export const NETWORK_TO_NAME_MAP = {
  [MAINNET]: MAINNET_DISPLAY_NAME,
  [ROPSTEN]: ROPSTEN_DISPLAY_NAME,
  [RINKEBY]: RINKEBY_DISPLAY_NAME,
  [GOERLI]: GOERLI_DISPLAY_NAME,

  [ROPSTEN_NETWORK_ID]: ROPSTEN_DISPLAY_NAME,
  [RINKEBY_NETWORK_ID]: RINKEBY_DISPLAY_NAME,
  [GOERLI_NETWORK_ID]: GOERLI_DISPLAY_NAME,
  [MAINNET_NETWORK_ID]: MAINNET_DISPLAY_NAME,

  [ROPSTEN_CHAIN_ID]: ROPSTEN_DISPLAY_NAME,
  [RINKEBY_CHAIN_ID]: RINKEBY_DISPLAY_NAME,
  [GOERLI_CHAIN_ID]: GOERLI_DISPLAY_NAME,
  [MAINNET_CHAIN_ID]: MAINNET_DISPLAY_NAME,
};

export const CHAIN_ID_TO_TYPE_MAP = Object.entries(
  NETWORK_TYPE_TO_ID_MAP,
).reduce((chainIdToTypeMap, [networkType, { chainId }]) => {
  chainIdToTypeMap[chainId] = networkType;
  return chainIdToTypeMap;
}, {});

export const CHAIN_ID_TO_NETWORK_ID_MAP = Object.values(
  NETWORK_TYPE_TO_ID_MAP,
).reduce((chainIdToNetworkIdMap, { chainId, networkId }) => {
  chainIdToNetworkIdMap[chainId] = networkId;
  return chainIdToNetworkIdMap;
}, {});

export const CHAIN_ID_TO_RPC_URL_MAP = {
  [MAINNET_CHAIN_ID]: MAINNET_RPC_URL,
  [ROPSTEN_CHAIN_ID]: ROPSTEN_RPC_URL,
  [RINKEBY_CHAIN_ID]: RINKEBY_RPC_URL,
  [GOERLI_CHAIN_ID]: GOERLI_RPC_URL,
  [LOCALHOST_CHAIN_ID]: LOCALHOST_RPC_URL,
};
