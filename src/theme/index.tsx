import { createTheme, ThemeProvider } from "@mui/material/styles";
import { PropsWithChildren } from "react";

const theme = createTheme({
  palette: {
    text: {
      primary: "#ffffff",
      secondary: "#31FD00",
      disabled: "#ececec",
    },
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#31FD00",
    },
    background: {
      default: "#37392B",
      paper: "#000000",
    },
    bright: {
      main: "#fff",
      contrastText: "#fff",
    },
  },
  typography: {
    fontFamily: "Mitr",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          "&.Mui-disabled": {
            backgroundColor: "revert",
            opacity: 0.5,
          },
          "&.MuiButton-containedBright": {
            color: "#091A2B",
          },
        },
        contained: {
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "white",
          "&.Mui-selected": {
            color: "white",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiFormLabel-colorBright": {
            color: "white",
          },
          "& .MuiInputBase-colorBright .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "white",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#37392B",
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          fontFamily: "Rubik",
        },
      },
    },
  },
});

declare module "@mui/material/styles" {
  interface Palette {
    bright: Palette["primary"];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    bright?: PaletteOptions["primary"];
  }
}

// Update the Button's color prop options
declare module "@mui/material/TextField" {
  interface TextFieldPropsColorOverrides {
    bright: true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    bright: true;
  }
}

declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides {
    bright: true;
  }
}

export default function Palette({ children }: PropsWithChildren<{}>) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
