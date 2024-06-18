import { Backdrop, CircularProgress } from "@mui/material";

interface Props {
  show: boolean;
}

export default function OverlayLoading({ show }: Props) {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={show}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
