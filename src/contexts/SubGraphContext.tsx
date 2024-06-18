import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { ApolloClient, InMemoryCache } from "@apollo/client";

import { config } from "../config";
import { useAuthContext } from "./AuthContext";

const SubGraphContext = createContext<{ client: ApolloClient<any> | null }>({
  client: null,
});

export const SubGraphContextProvider = ({
  children,
}: PropsWithChildren<any>) => {
  const { chainId } = useAuthContext();
  const [client, setClient] = useState<ApolloClient<any> | null>(null);

  useEffect(() => {
    if (!chainId) {
      setClient(null);
      return;
    }
    setClient(
      new ApolloClient<any>({
        cache: new InMemoryCache(),
        uri:
          +chainId === +config.ethereumChainId
            ? config.subgraphEthereumURL
            : config.subgraphFantomURL,
        defaultOptions: {
          query: {
            fetchPolicy: "no-cache",
          },
        },
      })
    );
  }, [chainId]);

  return (
    <SubGraphContext.Provider value={{ client }}>
      {children}
    </SubGraphContext.Provider>
  );
};

export const useSubGraph = () => useContext(SubGraphContext);
