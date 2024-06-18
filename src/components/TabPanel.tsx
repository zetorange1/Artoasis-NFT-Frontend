import { Box } from "@mui/material";
import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren<any> {
  value: number;
  index: number;
}

export default function TabPanel(props: Props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box py={3} px={2}>
          {children}
        </Box>
      )}
    </div>
  );
}
