import { config } from "../config";

export const setOpera = async (cId = config.fantomChainId) => {
  const ethereum = window.ethereum;
  const chainId = "0x" + BigInt(cId).toString(16);
  const rpcUrl = config.contractFantomChain;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (err) {
    if ((err as any).code === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId,
              rpcUrl,
            },
          ],
        });
      } catch (err) {
        throw err;
      }
    }
    throw err;
  }
};
