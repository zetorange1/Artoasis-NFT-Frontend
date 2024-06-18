import Card from "@mui/material/Card";
import { styled } from "@mui/system";

const WhiteCard = styled(Card)(({ theme }) => ({
  background: "white",
  color: theme.palette.primary.main,
}));

export default WhiteCard;
