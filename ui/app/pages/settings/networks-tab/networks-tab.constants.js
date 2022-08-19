import {
  MAINNET,
  ROPSTEN,
  RINKEBY,
  GOERLI,
  MAINNET_CHAIN_ID,
  ROPSTEN_CHAIN_ID,
  RINKEBY_CHAIN_ID,
  GOERLI_CHAIN_ID
} from '../../../../../shared/constants/network';

const defaultNetworksData = [
  {
    labelKey: MAINNET,
    iconColor: '#29B6AF',
    providerType: MAINNET,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    chainId: MAINNET_CHAIN_ID,
    ticker: 'ETH',
    blockExplorerUrl: 'https://etherscan.io/',
  },
  {
    labelKey: ROPSTEN,
    iconColor: '#29B6AF',
    providerType: ROPSTEN,
    rpcUrl: 'https://ropsten.infura.io/v3/',
    chainId: ROPSTEN_CHAIN_ID,
    ticker: 'ETH',
    blockExplorerUrl: 'https://ropsten.etherscan.io/',
  },
  {
    labelKey: RINKEBY,
    iconColor: '#29B6AF',
    providerType: RINKEBY,
    rpcUrl: 'https://rinkeby.infura.io/v3/',
    chainId: RINKEBY_CHAIN_ID,
    ticker: 'ETH',
    blockExplorerUrl: 'https://rinkeby.etherscan.io/',
  },
  {
    labelKey: GOERLI,
    iconColor: '#29B6AF',
    providerType: GOERLI,
    rpcUrl: 'https://goerli.infura.io/v3/',
    chainId: GOERLI_CHAIN_ID,
    ticker: 'ETH',
    blockExplorerUrl: 'https://goerli.etherscan.io/',
  }
];

export { defaultNetworksData };
