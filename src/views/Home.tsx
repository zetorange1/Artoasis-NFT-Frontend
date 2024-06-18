import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { ReactComponent as BackgroundLogoSVG } from "../assets/svg/background_logo.svg";
import backgroundimg from "../assets/svg/background.svg";
import { Link } from "react-router-dom";

const WrapperBox = styled(Box)(({ theme }) => ({
  position: "relative",
}));

const WrapperGrid = styled(Grid)(({ theme }) => ({
  justifyContent: "center",
}));

const BuyOpenButton = styled(Button)(({ theme }) => ({
  backgroundColor: "white",
  color: "black",
  fontWeight: "bold",
  fontSize: "1.5rem",
  textTransform: "initial",
  marginTop: "30px",
  borderRadius: "20px",
  paddingLeft: "40px",
  paddingRight: "40px",

  "&:hover": {
    backgroundColor: "grey",
  },

  [theme.breakpoints.down(500)]: {
    fontSize: "0.7rem",
  },
  [theme.breakpoints.down(400)]: {
    fontSize: "0.5rem",
  },
}));

const SubTitleTag = styled(Typography)(({ theme }) => ({
  fontSize: "23px",

  [theme.breakpoints.down(415)]: {
    fontSize: "14px",
  },
  [theme.breakpoints.down(400)]: {
    fontSize: "12px",
  },
}));

const BgSVGWrapper = styled("div")(({ theme }) => ({
  marginTop: "100px",

  [theme.breakpoints.down(1200)]: {
    marginTop: "80px",
  },
}));

const CustomBgSVG = styled(BackgroundLogoSVG)(({ theme }) => ({
  width: "330px",

  [theme.breakpoints.down(1250)]: {
    display: "none",
  },
}));

export default function Home() {
  return (
    <WrapperBox>
      <Container
        maxWidth="xl"
        style={{ display: "flex", height: "calc(100vh - 74px)" }}
      >
        <WrapperGrid
          container
          flexDirection="row"
          alignItems="center"
          position="relative"
        >
          <Grid item>
            <Grid
              container
              flexDirection="column"
              textAlign="center"
              spacing={2}
            >
              <Grid item>
                <Typography
                  variant="h3"
                  color="white"
                  letterSpacing="0"
                  fontWeight="500"
                  fontSize="2.5rem"
                >
                  All your NFTs in one place
                </Typography>
              </Grid>
              <Grid item>
                <Grid
                  container
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  textAlign="center"
                  spacing={2}
                >
                  <Grid item>
                    <SubTitleTag variant="h5" color="#31FD00" letterSpacing="0">
                      The ultimate NFT crosschain Marketplace <br />
                      and creation tool
                    </SubTitleTag>
                  </Grid>
                  <Grid item>
                    <BuyOpenButton variant="contained">
                      <Link
                        to="/explorer"
                        style={{ color: "black", textDecoration: "none" }}
                      >
                        Enter the Oasis
                      </Link>
                    </BuyOpenButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </WrapperGrid>
      </Container>
    </WrapperBox>
  );
}
