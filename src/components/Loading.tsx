import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import { memo } from "react";

const Wrapper = styled("div")({
  position: "fixed",
  background: "rgba(255, 255, 255, 0.5)",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const Loading = memo(() => {
  return (
    <div style={{ height: "100vh" }}>
      <Wrapper>
        <CircularProgress color="secondary" />
      </Wrapper>
    </div>
  );
});

export default Loading;
