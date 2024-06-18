import {
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { ContentCopy, Refresh } from "@mui/icons-material";
import { styled } from "@mui/system";
import moment from "moment";

import { minimizeAddress } from "../../helper/utils";
import Avatar from "./Avatar";
import { useSnackbar } from "../../contexts/Snackbar";
import ReferralLink from "../ui/ReferralLink";

const ProfileCard = styled(Card)({
  minWidth: "45%",
  paddingTop: 64,
  paddingLeft: 36,
  paddingRight: 36,
  position: "relative",
  overflow: "visible",
  "@media (max-width: 1280px)": {
    minWidth: "80%",
  },
});

export default function Profile({
  user,
  address,
  currentUserAddress,
  saveProfile,
  onUpdate,
  onRefresh,
  editing,
  setEditing,
  updateAvatar,
}) {
  const isMine = address?.toLowerCase() === currentUserAddress?.toLowerCase();
  const { showSnackbar } = useSnackbar();

  const copy = () => {
    navigator.clipboard.writeText(address);
    showSnackbar({
      severity: "success",
      message: "Copied!",
    });
  };

  return (
    <ProfileCard className="shadow-widget">
      <CardContent style={{ textAlign: "center" }}>
        <Avatar
          user={user}
          address={currentUserAddress}
          update={updateAvatar}
        />

        <Grid container alignItems="center" justifyContent="center">
          {editing ? (
            <Grid container alignItems="center" justifyContent="center" mb={2}>
              <TextField
                color="secondary"
                variant="standard"
                value={user.name}
                placeholder="Name"
                InputProps={{
                  style: {
                    textAlign: "center",
                  },
                  endAdornment: (
                    <IconButton color="secondary" onClick={saveProfile}>
                      <SaveIcon />
                    </IconButton>
                  ),
                }}
                onChange={(e) =>
                  onUpdate({
                    ...user,
                    name: e.target.value,
                  })
                }
              />
            </Grid>
          ) : (
            <Typography variant="h5" gutterBottom>
              {user?.name || "Unnamed"}
            </Typography>
          )}

          {isMine && !editing && (
            <IconButton
              className="edit-button"
              onClick={() => setEditing(true)}
            >
              <EditIcon style={{ color: "white" }} />
            </IconButton>
          )}
        </Grid>
        <Grid container justifyContent="center" alignItems="center" my={1}>
          <Typography
            variant="body2"
            lineHeight="1"
            style={{ marginRight: 12 }}
            className="ff-primary"
          >
            {minimizeAddress(address, 7, -4)}
          </Typography>
          <IconButton onClick={copy}>
            <ContentCopy color="secondary" fontSize="small" />
          </IconButton>
          <IconButton onClick={onRefresh}>
            <Refresh color="secondary" />
          </IconButton>
        </Grid>
        {user.created_at && (
          <Typography className="ff-primary" variant="body1" gutterBottom>
            Joined {moment(user.created_at).format("MMM Do YYYY")}
          </Typography>
        )}
        <Grid container justifyContent="center" mt={3}>
          <ReferralLink link={`${window.origin}/address/${address}`} />
        </Grid>
      </CardContent>
    </ProfileCard>
  );
}
