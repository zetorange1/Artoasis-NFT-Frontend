import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router } from "react-router-dom";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Web3Provider } from "./contexts/Web3Context";
import ThemeProvider from "./theme";
import { AuthProvider } from "./contexts/AuthContext";
import { SubGraphContextProvider } from "./contexts/SubGraphContext";
import { SnackbarProvider } from "./contexts/Snackbar";
import { ScanApiProvider } from "./contexts/ScanApiContext";

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <ThemeProvider>
      <SnackbarProvider>
        <Router>
          <AuthProvider>
            <Web3Provider>
              <ScanApiProvider>
                <SubGraphContextProvider>
                  <App />
                </SubGraphContextProvider>
              </ScanApiProvider>
            </Web3Provider>
          </AuthProvider>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
