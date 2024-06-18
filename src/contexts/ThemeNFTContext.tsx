import { createContext, PropsWithChildren, useContext, useState } from "react";

interface ThemeNFTContextValue {
  selectedWidget: string;
  selectWidget: (widget: string) => void;
}

export const ThemeNFTContext = createContext<ThemeNFTContextValue>({
  selectedWidget: "",
  selectWidget: () => {},
});

export const ThemeNFTContextProvider = ({
  children,
}: PropsWithChildren<any>) => {
  const [selectedWidget, setSelectedWidget] = useState("");

  return (
    <ThemeNFTContext.Provider
      value={{ selectWidget: setSelectedWidget, selectedWidget }}
    >
      {children}
    </ThemeNFTContext.Provider>
  );
};

export const useThemeNftContext = () => useContext(ThemeNFTContext);
