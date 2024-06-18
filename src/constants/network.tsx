import { config } from "../config";

export const networkNameMap = {
  [config.fantomChainId]: "Fantom",
  [config.ethereumChainId]: "Ethereum",
};

export const allowedNetworks = [
  {
    name: "Fantom",
    chainId: config.fantomChainId,
  },
  {
    name: "Ethereum",
    chainId: config.ethereumChainId,
  },
];
