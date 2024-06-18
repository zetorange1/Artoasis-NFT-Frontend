import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Divider, Grid, InputAdornment, TextField } from "@mui/material";
import Fantom from "../../assets/fantom.png";
import Ethereum from "../../assets/ethereum.png";
import { config } from "../../config";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  borderRadius: 4,
  boxShadow: 24,
  p: 2,
};

interface Props {
  show: boolean;
  chainId: string;
  handleClose: () => void;
  setPrice: (price: string) => void;
}

export default function PriceModal({
  show,
  chainId,
  handleClose,
  setPrice,
}: Props) {
  const [value, setValue] = React.useState("");

  return (
    <Modal open={show} onClose={handleClose}>
      <Box sx={style as any}>
        <Typography variant="h6" component="h2" gutterBottom mb={3}>
          Price
        </Typography>
        <Box mb={3}>
          <TextField
            fullWidth
            label="Set the Price"
            color="primary"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <img
                    src={
                      parseInt(chainId) === config.ethereumChainId
                        ? Ethereum
                        : Fantom
                    }
                    width={24}
                    alt=""
                  />
                </InputAdornment>
              ),
              color: "primary",
              style: {
                color: "black",
              },
            }}
            InputLabelProps={{
              style: {
                color: "#555",
              },
            }}
          />
        </Box>
        <Divider />
        <Grid mt={2} container justifyContent="flex-end">
          <Button variant="outlined" color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            style={{ marginLeft: 12 }}
            variant="contained"
            color="primary"
            disabled={!value}
            onClick={() => setPrice(value)}
          >
            Submit
          </Button>
        </Grid>
      </Box>
    </Modal>
  );
}
