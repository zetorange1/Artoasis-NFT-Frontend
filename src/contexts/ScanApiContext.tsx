import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

import { config } from "../config";
import { normalizeNFT } from "../helper/utils";
import axios from "axios";
import { INft } from "../types";
import { useContracts } from "./Web3Context";
import { useAuthContext } from "./AuthContext";

interface ScanApiContextInterface {
  getNftsByIds: (nftList: Array<any>) => Promise<{ data: INft[] }>;
  getOneExternalNft: (tokenAddress: string, tokenId: string) => any;
  getExternalNfts: (address: string) => Promise<any>;
  getExternalNftActivites: (tokenAddress: any, tokenId: any) => any;
  fillNFTMetadata: (tokenAddress: any, tokenId: any, nft?: any) => any;
}

export const ScanApiContext = createContext<ScanApiContextInterface>({
  fillNFTMetadata: () => null as any,
  getNftsByIds: async (nftList: Array<any>) => {
    console.log("Fetch NFTs by Ids ", nftList);
    return { data: [] };
  },
  getOneExternalNft: async (tokenAddress: string, tokenId: string) => {
    console.log(
      `Get one external NFT of ${tokenAddress} address and ${tokenId} id`
    );
    return {};
  },
  getExternalNfts: async (address: string) => {
    console.log("Get external NFTs of", address);
    return {};
  },
  getExternalNftActivites: (tokenAddress: any, tokenId: any) => {
    console.log(
      `Get external NFT activities of address ${tokenAddress} and tokenid ${tokenId}`
    );
    return {};
  },
});

export const ScanApiProvider = ({ children }: PropsWithChildren<any>) => {
  const { chainId } = useAuthContext();
  const { nftContractAddress, web3, getERC721Contract } = useContracts();
  const [scanKey, setScanKey] = useState(config.ftmscanKey);

  const apiHandler = useMemo(() => {
    if (!chainId) return;

    const baseURL =
      parseInt(chainId) === config.ethereumChainId
        ? config.etherscanUrl
        : config.ftmscanUrl;
    setScanKey(
      parseInt(chainId) === config.ethereumChainId
        ? config.etherscanKey
        : config.ftmscanKey
    );
    return axios.create({
      baseURL: baseURL,
    });
  }, [chainId]);

  const getRequest = (query) => {
    return new Promise(function (resolve, reject) {
      apiHandler
        ?.get("/api?", {
          params: query,
        })
        .then(function (response) {
          var data = response.data;

          // eslint-disable-next-line
          if (data.status && data.status != 1) {
            let returnMessage = data.message || "NOTOK";
            if (data.result && typeof data.result === "string") {
              returnMessage = data.result;
            } else if (data.message && typeof data.message === "string") {
              returnMessage = data.message;
            }

            return reject(returnMessage);
          }

          if (data.error) {
            var message = data.error;

            if (typeof data.error === "object" && data.error.message) {
              message = data.error.message;
            }

            return reject(new Error(message));
          }

          resolve(data);
        })
        .catch(function (error) {
          return reject(new Error(error));
        });
    });
  };

  const getNftTransactions = (address: string) => {
    const module = "account";
    const action = "tokennfttx";
    const apikey = scanKey;
    const query = {
      module,
      action,
      address,
      apikey,
    };
    return getRequest(query);
  };

  const fillNFTMetadata = async (
    tokenAddress: string,
    tokenId: string,
    nft: any = {
      name: "",
      description: "",
      image: "",
      owner: "",
      creator: "",
      createdAtTimestamp: "",
      price: 0,
      currentBid: undefined,
      tokenURI: "",
      favorites: [],
      category: [],
    }
  ) => {
    if (!tokenAddress || !tokenId) {
      return;
    }
    tokenAddress = tokenAddress.toLowerCase();

    nft.id = `${tokenAddress}-${tokenId}`;
    nft.tokenId = tokenId;
    nft.tokenAddress = tokenAddress;

    if (nft.name && nft.description && nft.image) {
      return nft;
    }

    const erc721 = getERC721Contract(tokenAddress);

    if (!web3 || !erc721) {
      return nft;
    }

    try {
      const [metadataURI, tokenOwner] = await Promise.all([
        erc721.methods.tokenURI(tokenId).call(),
        erc721.methods.ownerOf(tokenId).call(),
      ]);

      if (!metadataURI) {
        return nft;
      }
      const metadata = normalizeNFT(
        await fetch(
          (metadataURI as string)
            .replace("ipfs://ipfs://", "https://ipfs.io/ipfs/")
            .replace("ipfs://", "https://ipfs.io/ipfs/")
        ).then((res) => res.json())
      );
      nft.name = metadata.name;
      nft.description = metadata.description;
      nft.image = metadata.image;
      nft.owner = tokenOwner;
    } catch (err) {
      console.error("Scan API NFT:", err);
      console.log("Scan API NFT:", nft);
    }
    return normalizeNFT(nft);
  };

  const getNftsByIds = async (
    nftList: { tokenAddress: string; tokenId: string }[]
  ): Promise<{ data: INft[] }> => {
    if (!web3) {
      return { data: [] };
    }
    return {
      data: await Promise.all(
        nftList.map((nft) => fillNFTMetadata(nft.tokenAddress, nft.tokenId))
      ),
    };
  };

  const getOneExternalNft = async (tokenAddress: string, tokenId: string) => {
    const nft = await fillNFTMetadata(tokenAddress, tokenId);
    return normalizeNFT(nft);
  };

  const getExternalNfts = async (address) => {
    const nftTxs: any = await getNftTransactions(address);
    let nftList: string[] = [];

    const removeItem = (item, ary) => {
      const idx = ary.indexOf(item);
      if (idx !== -1) {
        ary.splice(idx, 1);
      }
    };

    for (const tx of nftTxs.result) {
      if (
        tx.contractAddress.toLowerCase() === nftContractAddress.toLowerCase()
      ) {
        continue;
      }

      if (tx.to.toLowerCase() === address.toLowerCase()) {
        nftList.push(tx.contractAddress.toLowerCase() + ":" + tx.tokenID);
      } else if (tx.from.toLowerCase() === address.toLowerCase()) {
        removeItem(
          tx.contractAddress.toLowerCase() + ":" + tx.tokenID,
          nftList
        );
      }
    }

    return getNftsByIds(
      nftList.map((nft) => {
        const [tokenAddress, tokenId] = nft.split(":");
        return { tokenAddress, tokenId };
      })
    );
  };

  const getExternalNftActivites = async (tokenAddress: any, tokenId: any) => {
    const module = "account";
    const action = "tokennfttx";
    const contractaddress = tokenAddress;
    const apikey = scanKey;
    const sort = "desc";
    const query = {
      module,
      action,
      contractaddress,
      apikey,
      sort,
    };
    const { result: transactions }: any = await getRequest(query);
    return (
      transactions
        // eslint-disable-next-line
        .filter((tx) => tx.tokenID == tokenId)
        .map((tx) => {
          return {
            id: `${tokenAddress}-${tokenId}-${tx.hash}-${tx.nonce}`,
            from: {
              id: tx.from,
            },
            to: {
              id: tx.to,
            },
            amount: null,
            token: {
              id: `${tokenAddress}-${tokenId}`,
            },
            createdAtTimestamp: tx.timeStamp,
            event:
              tx.from === "0x0000000000000000000000000000000000000000"
                ? "Mint"
                : "Transfer",
          };
        })
    );
  };

  return (
    <ScanApiContext.Provider
      value={{
        getNftsByIds,
        getOneExternalNft,
        getExternalNfts,
        getExternalNftActivites,
        fillNFTMetadata,
      }}
    >
      {children}
    </ScanApiContext.Provider>
  );
};

export const useScanApiContext = () => useContext(ScanApiContext);
