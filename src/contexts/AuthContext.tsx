import { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useHistory, useLocation } from "react-router-dom";
import { MoralisProvider } from "react-moralis";

import { useSnackbar } from "./Snackbar";
import ApiService from "../helper/api";
import { config } from "../config";
import { setOpera } from "../helper/web3";

export const AuthContext = createContext<any>({
  address: null,
  connect: () => null,
  loading: false,
  disconnect: () => null,
  chainId: null,
  user: null,
  setUser: () => null,
});

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: {
        [config.fantomChainId]: config.contractFantomChain,
        [config.ethereumChainId]: config.contractEthereumChain,
      },
    },
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions, // required
});

export const AuthProvider = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chainId, setChainId] = useState<number | null>();
  const { showSnackbar } = useSnackbar();
  const [user, setUser] = useState<any>(null);
  const history = useHistory();
  const location = useLocation();

  const subscribeProvider = (provider) => {
    provider.on("disconnect", (error) => {
      setChainId(config.fantomChainId);
      setAddress(null);
    });
    provider.on("accountsChanged", (accounts) => {
      setAddress(accounts[0]);
      showSnackbar({
        severity: "info",
        message: "Switching the account",
      });
    });
    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
      window.location.reload();
    });
  };

  const fetchUser = async () => {
    setUser(null);

    try {
      const { data } = await ApiService.getUser(address);
      setUser(data);
    } catch (err: any) {
      console.error(err?.response);

      if (err.response?.status === 404) {
        ApiService.createUser(address)
          .then((res) => setUser(res.data))
          .catch((err) => {
            console.error(err);
          });
      }
    }
  };

  const connect = async (navigate = true) => {
    if (address) {
      return;
    }
    setLoading(true);

    try {
      let web3 = new Web3(Web3.givenProvider);

      if (!web3.currentProvider) {
        showSnackbar({
          severity: "error",
          message: '"No provider was found"',
        });
        setLoading(false);
        return;
      }
      const provider = await web3Modal.connect();
      web3 = new Web3(provider);
      subscribeProvider(provider);

      const accounts = await web3.eth.getAccounts();
      const chain = await web3.eth.getChainId();

      if (chain !== config.fantomChainId && chain !== config.ethereumChainId) {
        setChainId(config.fantomChainId);
        setAddress(null);
        setOpera();
        setLoading(false);
        return;
      }

      setAddress(accounts[0]);
      setChainId(chain);

      await ApiService.getToken(accounts[0]);
      if (navigate) {
        history.push("/profile");
      } else if (!localStorage.getItem("token")) {
        // await ApiService.getToken(accounts[0]);
      }
    } catch (err) {
      console.error(err);
      showSnackbar({
        severity: "error",
        message: "Failed to connect",
      });
    }
    setLoading(false);
  };

  const disconnect = () => {
    web3Modal.clearCachedProvider();
    setAddress(null);
    setUser(null);
    setChainId(config.fantomChainId);

    if (location.pathname.includes("/profile")) {
      history.push("/");
    }
  };

  useEffect(() => {
    if (!address) {
      setUser(null);
    } else {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect(false);
    } else {
      setChainId(config.fantomChainId);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider
      value={{ address, loading, connect, disconnect, chainId, user, setUser }}
    >
      <MoralisProvider
        serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL || ""}
        appId={process.env.REACT_APP_MORALIS_APPLICATION_ID || ""}
      >
        {children}
      </MoralisProvider>
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
