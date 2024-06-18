import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Divider, Grid, TextField } from "@mui/material";

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
  handleClose: () => void;
  submitReport: (reason: any, other: string) => void;
}

const reportOptions: OptionType[] = [
  { value: "Fake collection" },
  { value: "Explicit and sensitive content" },
  { value: "Spam" },
  { value: "Might be stolen" },
  { value: "Other" },
];

export default function ReportModal({
  show,
  handleClose,
  submitReport,
}: Props) {
  const [reason, setReason] = React.useState("");
  const [other, setOther] = React.useState("");

  return (
    <Modal open={show} onClose={handleClose}>
      <Box sx={style as any}>
        <Typography variant="h6" component="h2" gutterBottom mb={3}>
          Report this item
        </Typography>
        <Box mb={3}>
          <CreatableAutocomplete
            options={reportOptions}
            label="Select a reason"
            value={reason}
            setValue={setReason}
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
        {reason['value'] === "Other" && (
          <Box mb={3}>
            <TextField
              fullWidth
              label="Additional Details"
              color="primary"
              multiline
              rows={3}
              value={other}
              InputProps={{
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
              onChange={(e) => setOther(e.target.value)}
            />
          </Box>
        )}
        <Divider />
        <Grid mt={2} container justifyContent="flex-end">
          <Button variant="outlined" color="primary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            style={{ marginLeft: 12 }}
            variant="contained"
            color="primary"
            disabled={!reason}
            onClick={() => submitReport(reason, other)}
          >
            Submit
          </Button>
        </Grid>
      </Box>
    </Modal>
  );
}
