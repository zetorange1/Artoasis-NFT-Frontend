import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { memo } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/Snackbar";

interface Props {
  link: string;
}

export default memo(({ link }: Props) => {
  const { address } = useAuthContext();
  const { showSnackbar } = useSnackbar();
  const referralLink = `${link}?referral=${address}`;

  const copy = () => {
    navigator.clipboard.writeText(referralLink);
    showSnackbar({
      severity: "success",
      message: "Copied!",
    });
  };

  return (
    <TextField
      value={referralLink}
      color="bright"
      InputProps={{
        readOnly: true,
        endAdornment: (
          <IconButton color="secondary" onClick={copy}>
            <ContentCopyIcon />
          </IconButton>
        ),
        className: "ff-primary",
      }}
      label="Referral Link"
    />
  );
});
