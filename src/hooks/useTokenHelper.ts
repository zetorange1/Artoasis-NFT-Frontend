import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Web3Context } from "../contexts/Web3Context";
import { NFTStorage } from "nft.storage";
import { config } from "../config";
// import { normalizeNFT } from "../helper/utils";
// import { INft } from "../types";

const client = new NFTStorage({ token: config.nftStorageKey });

export default function useTokenHelper() {
  const { getERC721Contract } = useContext(Web3Context);
  const { address } = useContext(AuthContext);

  const stripIpfsUriPrefix = (cidOrURI: string) => {
    if (cidOrURI.startsWith("ipfs://")) {
      return cidOrURI.slice("ipfs://".length);
    }
    return cidOrURI;
  };

  const uploadImageToIpfs = async (
    name: string,
    description: string,
    file: File
  ) => {
    const metadata = await client.store({
      name,
      image: file as any,
      description,
      decimals: 0,
    });
    return metadata;
  };

  const uploadJsonToIpfs = async (
    name: string,
    description: string,
    json: any
  ) => {
    const metadata = await client.store({
      name,
      image: new Blob([]),
      description,
      decimals: 0,
      json,
    } as any);
    return metadata;
  };

  const mintToken = async (
    metadataURI: string,
    ask: string,
    contractAddress: string
  ) => {
    const contract = getERC721Contract(contractAddress);
    metadataURI = stripIpfsUriPrefix(metadataURI);
    const tokenId = await contract?.methods
      .mintToken(metadataURI, ask)
      .send({ from: address });
    return tokenId;
  };

  // const getNFTMetadata = async (tokenId: string): Promise<INft> => {
  //   const metadataURI = await media?.methods.tokenURI(tokenId).call();
  //   const metadata = await fetch(
  //     (metadataURI as string).replace("ipfs://", "https://ipfs.io/ipfs/")
  //   ).then((res) => res.json());
  //   return normalizeNFT(metadata);
  // };

  return {
    mintToken,
    uploadImageToIpfs,
    // getNFTMetadata,
    uploadJsonToIpfs,
  };
}
