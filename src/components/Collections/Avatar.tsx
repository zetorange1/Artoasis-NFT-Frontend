import { styled } from "@mui/system";
import { Avatar as MuiAvatar, Box, Grid, IconButton } from "@mui/material";
import { memo, useRef } from "react";
import EditIcon from "@mui/icons-material/Edit";

const AvatarContainer = styled(Box)({
  width: 128,
  height: 128,
  position: "absolute",
  top: -70,
  left: "calc(50% - 60px)",
});

const Overlay = styled(Grid)({
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  transition: "all linear 0.2s",
  display: "none",
  backgroundColor: "rgba(0,0,0,0)",
  borderRadius: "50%",
});

const AvatarContent = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
  "&:hover": {
    ".overlay": {
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex",
    },
  },
});

const UserAvatar = styled(MuiAvatar)({
  position: "absolute",
  top: 0,
  left: 0,
  width: 128,
  height: 128,
  fontSize: 36,
  borderRadius: 4,
});

export default memo<any>(({ address, user, update }) => {
  const isMe = address?.toLowerCase() === user?.address?.toLowerCase();
  const ref = useRef<HTMLInputElement>(null);

  const changeAvatar = () => {
    if (ref.current) {
      ref.current.value = "";
      ref.current.click();
    }
  };

  const uploadAvatar = () => {
    if (!ref || !ref.current || !ref.current.files) {
      return;
    }
    update(ref.current.files[0]);
  };

  return (
    <AvatarContainer>
      <AvatarContent>
        <UserAvatar src={user.avatar || ""} alt={user.name}>
          {user.name ? user.name[0] : ""}
        </UserAvatar>
        {isMe && (
          <Overlay
            className="overlay"
            container
            alignItems="center"
            justifyContent="center"
          >
            <IconButton onClick={changeAvatar}>
              <EditIcon style={{ color: "white" }} />
            </IconButton>
            <input
              ref={ref}
              hidden
              type="file"
              multiple={false}
              accept="image/*"
              onChange={uploadAvatar}
            />
          </Overlay>
        )}
      </AvatarContent>
    </AvatarContainer>
  );
});
