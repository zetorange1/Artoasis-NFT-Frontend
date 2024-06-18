import {
  createContext,
  Dispatch,
  forwardRef,
  useState,
  SetStateAction,
  useContext,
} from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

export const SnackbarContext = createContext<{
  showSnackbar: Dispatch<
    SetStateAction<{ severity: string; message: string } | null>
  >;
}>({
  showSnackbar: (() => {}) as any,
});

const Alert: any = forwardRef((props, ref: any) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState<{
    severity: string;
    message: string;
  } | null>(null);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar(null);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar: setSnackbar }}>
      {children}
      <Snackbar open={!!snackbar} autoHideDuration={4000} onClose={handleClose}>
        {
          <Alert
            onClose={handleClose}
            severity={snackbar?.severity}
            sx={{ width: "100%" }}
          >
            {snackbar?.message}
          </Alert>
        }
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
