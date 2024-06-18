import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Grid, InputAdornment, TextField } from "@mui/material";

import Fantom from "../../assets/fantom.png";
import Ethereum from "../../assets/ethereum.png";
import { IBid } from "../../types";
import { useContracts } from "../../contexts/Web3Context";
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
  handleClose: () => void;
  placeOffer: (price: string) => void;
  currentBid: IBid;
  address: string;
  chainId: string;
}

export default function PlaceOfferModal({
  show,
  handleClose,
  placeOffer,
  currentBid,
  address,
  chainId,
}: Props) {
  const [value, setValue] = React.useState("");
  const bidAmount = currentBid ? currentBid.amount : 0;
  const { currency } = useContracts();

  return (
    <Modal open={show} onClose={handleClose}>
      <Box sx={style as any}>
        <Typography variant="h6" component="h2" gutterBottom mb={3}>
          Offer
        </Typography>
        <Box mb={3}>
          <TextField
            fullWidth
            label="Set the amount"
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
            FormHelperTextProps={{
              style: {
                color: "#555",
              },
            }}
            helperText={
              currentBid
                ? `Your bid should be bigger than ${currentBid.amount} ${currency}`
                : ""
            }
          />
        </Box>
        <Grid mt={2} container justifyContent="flex-end">
          <Button variant="outlined" color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            style={{ marginLeft: 12 }}
            variant="contained"
            color="primary"
            disabled={!value || +value <= bidAmount}
            onClick={() => placeOffer(value)}
          >
            Submit
          </Button>
        </Grid>
      </Box>
    </Modal>
  );
}
