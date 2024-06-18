import { INft } from "../types";

export const convertToTitle = (str: string) =>
  (str.charAt(0).toUpperCase() + str.slice(1))
    .replace(/[A-Z]/g, (letter) => ` ${letter}`)
    .trim();

export const minimizeAddress = (address: string, start = 14, end = -11) =>
  address ? `${address.substr(0, start)}...${address.substr(end)}` : "";

export const normalizeNFT = (nft: INft): INft => {
  const tokenAddress = (
    nft.tokenAddress ||
    nft.token_address ||
    ""
  )?.toLowerCase();
  const tokenId = `${nft.tokenId || nft.token_id || ""}`.toLowerCase();

  return {
    ...nft,
    image: nft.image?.replace("ipfs://", "https://ipfs.io/ipfs/"),
    tokenAddress,
    tokenId,
    id: nft.id || `${nft.token_address}-${nft.token_id}`,
  };
};

export const parseMoralisNFT = async (nft: any) => {
  if (!nft.metadata) {
    if (nft.token_uri) {
      try {
        nft.metadata = await fetch(
          nft.token_uri
            .replace("ipfs://ipfs://", "https://ipfs.io/ipfs/")
            .replace("ipfs://", "https://ipfs.io/ipfs/")
            .replace("ipfs.moralis.io:2053", "ipfs.io")
        ).then((res) => res.json());
      } catch (err) {
        console.log("Moralise NFT Fetch Error:", nft.token_uri);
        nft.metadata = {};
      }
    } else {
      nft.metadata = {};
    }
  } else {
    if (typeof nft.metadata === "string") {
      try {
        nft.metadata = JSON.parse(nft.metadata);
      } catch (err) {
        console.log("Moralise NFT Parse Error:", nft.metadata);
        nft.metadata = {};
      }
    }
  }
  nft = {
    ...nft,
    ...nft.metadata,
    owner: nft.owner_of,
  };
  return normalizeNFT(nft);
};

export const mixNFTMetadata = (item1: INft, item2: INft) => {
  if (!item1 || !item2) {
    return item1 || item2;
  }
  const price = item1.price || item2.price;
  const currentBid = item1.currentBid || item2.currentBid;
  const owner = item1.owner || item2.owner || "";
  const image = item1.image || item2.image || "";
  const name = item1.name || item2.name || "";
  const description = item1.description || item2.description || "";
  const category = item1.category?.length
    ? item1.category
    : item2.category || [];
  const favorites = item1.favorites?.length
    ? item1.favorites
    : item2.favorites || [];

  return {
    ...item1,
    ...item2,
    name,
    description,
    price,
    currentBid,
    owner,
    image,
    category,
    favorites,
  };
};

export const mixNFTMetadatas = (source, external, exclude = false) => {
  const result = source.map((item) => {
    const existing = external.find((item1) => item.id === item1.id);
    return mixNFTMetadata(item, existing);
  });

  if (exclude) {
    return result;
  }

  const additional = external.filter(
    (item) => !result.find((item1) => item.id === item1.id)
  );

  return [...result, ...additional];
};

export const wait = (time: number = 5000) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const sameAddress = (addr1: string, addr2: string) =>
  addr1?.toLowerCase() === addr2?.toLowerCase();

export const stringToColor = (stringInput: string) => {
  let stringUniqueHash = [...(stringInput as any)].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `hsl(${stringUniqueHash % 360}, 95%, 35%)`;
};
