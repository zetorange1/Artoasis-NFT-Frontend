import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Divider, Grid } from "@mui/material";

import CreatableAutocomplete from "../CreatableAutocomplete";


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

interface OptionType {
  value: string;
}

interface Props {
  show: boolean;
  categoryOptions: OptionType[];
  handleClose: () => void;
  setCategory: (category: string) => void;
}

export default function CategoryModal({
  show,
  categoryOptions,
  handleClose,
  setCategory,
}: Props) {
  const [value, setValue] = React.useState("");

  return (
    <Modal open={show} onClose={handleClose}>
      <Box sx={style as any}>
        <Typography variant="h6" component="h2" gutterBottom mb={3}>
          Category
        </Typography>
        <Box mb={3}>
          <CreatableAutocomplete
            options={categoryOptions}
            label="Set the Category"
            value={value}
            setValue={setValue}
            InputLabelProps={{
              style: {
                color: "#555",
              },
            }}
            OptionsProps={{
              style: {
                background: "white",
                color: "black",
              },
            }}
            darkTheme={false}
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
            onClick={() => setCategory(value)}
          >
            Submit
          </Button>
        </Grid>
      </Box>
    </Modal>
  );
}
