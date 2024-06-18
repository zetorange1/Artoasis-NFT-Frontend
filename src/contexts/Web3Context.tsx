import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";

import mediaABI from "../contracts/abis/Media.json";
import marketABI from "../contracts/abis/Market.json";
// import erc721ABI from "../contracts/abis/erc721.json";
import validatorABI from "../contracts/abis/Validator.json";
import collectionsABI from "../contracts/abis/Collections.json";

import { config } from "../config";
import { useSnackbar } from "./Snackbar";
import { sameAddress } from "../helper/utils";
import { useAuthContext } from "./AuthContext";

interface Contracts {
  media?: Contract;
  market?: Contract;
  validator?: Contract;
  collections?: Contract;
}
interface Web3ContextValue {
  web3?: Web3;
  contracts: Contracts;
  wrongNetwork: boolean;
  isValidator: boolean;
  isOwner: boolean;
  rpcURI: string;
  nftContractAddress: string;
  marketContractAddress: string;
  validatorAddress: string;
  collectionsAddress: string;
  currency: string;
  getERC721Contract: (address: string) => Contract | null;
}

export const Web3Context = createContext<Web3ContextValue>({
  wrongNetwork: false,
  contracts: {},
  isValidator: false,
  isOwner: false,
  rpcURI: "",
  nftContractAddress: "",
  marketContractAddress: "",
  validatorAddress: "",
  collectionsAddress: "",
  currency: "FTM",
  getERC721Contract: (address: string) => null as any,
});

export const Web3Provider = ({ children }: PropsWithChildren<any>) => {
  const { chainId, address } = useAuthContext();
  const { showSnackbar } = useSnackbar();
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [web3, setWeb3] = useState<Web3>();
  const [isValidator, setIsValidator] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [contracts, setContracts] = useState<Contracts>({});
  const [rpcURI, setRPCURI] = useState(
    chainId === config.ethereumChainId
      ? config.contractEthereumChain
      : config.contractFantomChain
  );
  const [nftContractAddress, setNFTContractAddress] = useState(
    chainId === config.ethereumChainId
      ? config.nftEthereumContractAddress
      : config.nftFantomContractAddress
  );
  const [marketContractAddress, setMarketContractAddress] = useState(
    chainId === config.ethereumChainId
      ? config.marketEthereumContractAddress
      : config.marketFantomContractAddress
  );
  const [validatorAddress, setValidatorAddress] = useState(
    chainId === config.ethereumChainId
      ? config.validatorEthereumAddress
      : config.validatorFantomAddress
  );
  const [collectionsAddress, setCollectionsAddress] = useState(
    chainId === config.ethereumChainId
      ? config.collectionsEthereumAddress
      : config.collectionsFantomAddress
  );
  const [currency, setCurrency] = useState(
    chainId === config.ethereumChainId ? "ETH" : "FTM"
  );

  const getNetworkData = () => {
    const data = {
      rpcURI: config.contractFantomChain,
      websocketURI: config.FANTOM_WSS_PROVIDER_URL,
      nftContractAddress: config.nftFantomContractAddress,
      marketContractAddress: config.marketFantomContractAddress,
      validatorAddress: config.validatorFantomAddress,
      collectionsAddress: config.collectionsFantomAddress,
      currency: "FTM",
    };

    if (parseInt(chainId) === config.ethereumChainId) {
      data.rpcURI = config.contractEthereumChain;
      data.websocketURI = config.ETHEREUM_WSS_PROVIDER_URL;
      data.nftContractAddress = config.nftEthereumContractAddress;
      data.marketContractAddress = config.marketEthereumContractAddress;
      data.validatorAddress = config.validatorEthereumAddress;
      data.collectionsAddress = config.collectionsEthereumAddress;
      data.currency = "ETH";
    }
    return data;
  };

  useEffect(() => {
    if (!chainId) {
      return;
    }
    if (
      parseInt(chainId) !== config.fantomChainId &&
      parseInt(chainId) !== config.ethereumChainId
    ) {
      showSnackbar({
        severity: "error",
        message: "Wrong network",
      });
      setWrongNetwork(true);
      return;
    }
    setWrongNetwork(false);

    const data = getNetworkData();

    setRPCURI(data.rpcURI);
    setNFTContractAddress(data.nftContractAddress);
    setMarketContractAddress(data.marketContractAddress);
    setValidatorAddress(data.validatorAddress);
    setCollectionsAddress(data.collectionsAddress);
    setCurrency(data.currency);

    const instance = new Web3(data.rpcURI);

    instance.eth.setProvider(Web3.givenProvider);
    setWeb3(instance);

    const media = new instance.eth.Contract(
      mediaABI as any,
      data.nftContractAddress
    );
    const market = new instance.eth.Contract(
      marketABI as any,
      data.marketContractAddress
    );
    const validator = new instance.eth.Contract(
      validatorABI as any,
      data.validatorAddress
    );
    const collections = new instance.eth.Contract(
      collectionsABI as any,
      data.collectionsAddress
    );

    const fetchRole = async () => {
      if (!address) {
        setIsOwner(false);
        setIsValidator(false);
        return;
      }
      const ownerAddress = await validator.methods.owner().call();
      const isValidator = await validator.methods.validators(address).call();

      if (sameAddress(ownerAddress, address)) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
      if (sameAddress(ownerAddress, address) || isValidator) {
        setIsValidator(true);
      } else {
        setIsValidator(false);
      }
    };

    fetchRole();

    setContracts({
      media,
      market,
      validator,
      collections,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, address]);

  const getERC721Contract = (address: string) => {
    const data = getNetworkData();
    const instance = new Web3(data.rpcURI);

    if (!wrongNetwork) {
      instance.setProvider(Web3.givenProvider);
    }
    const erc721 = new instance.eth.Contract(mediaABI as any, address);
    return erc721;
  };

  return (
    <Web3Context.Provider
      value={{
        web3,
        contracts,
        wrongNetwork,
        isValidator,
        isOwner,
        rpcURI,
        nftContractAddress,
        marketContractAddress,
        validatorAddress,
        collectionsAddress,
        currency,
        getERC721Contract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useContracts = () => useContext(Web3Context);
