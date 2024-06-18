export const config = {
  nftFantomContractAddress: process.env.REACT_APP_FANTOM_MEDIA_ADDRESS || "",
  marketFantomContractAddress: process.env.REACT_APP_FANTOM_MARKET_ADDRESS || "",
  validatorFantomAddress: process.env.REACT_APP_FANTOM_VALIDATOR_ADDRESS || "",
  collectionsFantomAddress: process.env.REACT_APP_FANTOM_COLLECTIONS_ADDRESS || "",
  nftEthereumContractAddress: process.env.REACT_APP_ETHEREUM_MEDIA_ADDRESS || "",
  marketEthereumContractAddress: process.env.REACT_APP_ETHEREUM_MARKET_ADDRESS || "",
  validatorEthereumAddress: process.env.REACT_APP_ETHEREUM_VALIDATOR_ADDRESS || "",
  collectionsEthereumAddress: process.env.REACT_APP_ETHEREUM_COLLECTIONS_ADDRESS || "",
  currencies: {
    FTM: {
      address: "0x000000000000000000000000000000000000dead",
    },
  },
  fantomChainId: +(process.env.REACT_APP_FANTOM_CHAIN_ID || 250),
  ethereumChainId: +(process.env.REACT_APP_ETHEREUM_CHAIN_ID || 1),
  network: process.env.REACT_APP_NETWORK || "",
  subgraphFantomURL: process.env.REACT_APP_FANTOM_SUBGRAPH_URL || "",
  subgraphEthereumURL: process.env.REACT_APP_ETHEREUM_SUBGRAPH_URL || "",
  contractFantomChain: process.env.REACT_APP_FANTOM_NETWORK_RPC || "",
  contractEthereumChain: process.env.REACT_APP_ETHEREUM_NETWORK_RPC || "",
  nftStorageKey: process.env.REACT_APP_NFT_STORAGE_KEY || "",
  COINGECKO_API_URL: process.env.REACT_APP_COINGECKO_API_URL || "",
  COVALENT_API: {
    baseUrl: process.env.REACT_APP_COVALENT_API_URL || "",
    key: process.env.REACT_APP_COVALENT_API_KEY || "",
  },
  backendUrl: process.env.REACT_APP_BACKEND_URL || "",
  ftmscanKey: process.env.REACT_APP_FTMSCAN_API_KEY || "",
  ftmscanUrl: process.env.REACT_APP_FTMSCAN_URL || "",
  etherscanKey: process.env.REACT_APP_ETHERSCAN_API_KEY || "",
  etherscanUrl: process.env.REACT_APP_ETHERSCAN_URL || "",
  FANTOM_WSS_PROVIDER_URL:
    process.env.REACT_APP_FANTOM_WSS_PROVIDER_URL ||
    "wss://ws.fantom.network/",
  ETHEREUM_WSS_PROVIDER_URL:
    process.env.REACT_APP_ETHEREUM_WSS_PROVIDER_URL ||
    "wss://ws.fantom.network/",
};
