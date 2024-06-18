import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  AppBar,
  Box,
  Container,
  Divider,
  Select,
  Tab,
  Tabs,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import Web3 from "web3";

import Logo from "../assets/svg/ao-logo.svg";

import { minimizeAddress } from "../helper/utils";
import { useSnackbar } from "../contexts/Snackbar";
import MobileMenu from "./components/MobileMenu";
import { useContracts } from "../contexts/Web3Context";
import { useAuthContext } from "../contexts/AuthContext";
import { config } from "../config";
import { setOpera } from "../helper/web3";
import EthereumSVG from "../assets/svg/ethereum.svg";
import FantomSVG from "../assets/svg/fantom.svg";
import { allowedNetworks, networkNameMap } from "../constants/network";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "20ch",
      "&:focus": {
        width: "30ch",
      },
    },
    "&::-webkit-input-placeholder": {
      fontFamily: "Press Start 2P !important",
    },
  },
}));

const ActionMenuItem = styled(MenuItem)(({ theme }) => ({
  color: theme.palette.primary.main,
  minWidth: 200,
  paddingTop: 12,
  paddingBottom: 12,
}));

const ActionMenu = styled(Menu)({
  "& .MuiPaper-root": {
    background: "white",
    borderRadius: 2,
  },
});

function LinkTab(props) {
  return (
    <Tab
      component={Link}
      style={{ padding: "29px 8px", fontSize: 12 }}
      {...props}
    />
  );
}

export const Header = () => {
  const { address, loading, connect, disconnect, chainId } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [term, setTerm] = useState("");
  const location = useLocation();
  const history = useHistory();
  const { showSnackbar } = useSnackbar();
  const { isValidator, isOwner } = useContracts();

  const [page, setPage] = useState(0);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    handleClose();
    disconnect();
  };

  const handleChange = (event, newValue) => {
    setPage(newValue);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") {
      return;
    }

    if (Web3.utils.isAddress(term)) {
      history.push(`/address/${term}`);
      setTerm("");
    } else {
      showSnackbar({ severity: "error", message: "Invalid Address" });
    }
  };

  const handleNetworkMenuChange = (event: any) => {
    setOpera(event.target.value);
  };

  useEffect(() => {
    let currentTab = -1;

    switch (location.pathname) {
      case "/explorer":
        currentTab = 0;
        break;
      case "/create":
        currentTab = 1;
        break;
      case "/validation":
        currentTab = 2;
        break;
      case "/track":
        currentTab = 3;
        break;
      case "/collections":
        currentTab = 4;
        break;
    }
    setPage(currentTab);
  }, [location.pathname, address]);

  return (
    <AppBar
      position="fixed"
      style={{
        borderBottom: "2px solid var(--shadow-color)",
        boxShadow: "none",
      }}
    >
      <Container maxWidth="xl">
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          height="76px"
        >
          <Grid item>
            <Link to="/" style={{ textDecoration: "none", color: "unset" }}>
              <Grid container alignItems="center">
                <img src={Logo} width={200} alt="Art Oasis" />
              </Grid>
            </Link>
          </Grid>

          <Grid item display={{ xs: "block", lg: "none" }}>
            <MobileMenu
              searchValue={term}
              isValidator={isValidator}
              isOwner={isOwner}
              searchTerm={setTerm}
              handleSearch={handleSearchKeyDown}
            />
          </Grid>

          <Grid item display={{ xs: "none", lg: "flex" }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search by address…"
                inputProps={{ "aria-label": "search" }}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </Search>
          </Grid>

          <Grid item display={{ xs: "none", lg: "flex" }}>
            {address ? (
              <Grid container alignItems="center">
                <Tabs
                  indicatorColor="secondary"
                  value={page}
                  onChange={handleChange}
                  aria-label="headers"
                >
                  <LinkTab
                    style={{ display: "none" }}
                    label="Other"
                    to="/"
                    value={-1}
                  />
                  <LinkTab label="Explorer" to="/explorer" value={0} />
                  <LinkTab
                    label="&nbsp;&nbsp;Collections&nbsp;&nbsp;"
                    to="/collections"
                    value={4}
                  />
                  <LinkTab label="Mint" to="/create" value={1} />
                  {isValidator && (
                    <LinkTab label="Validation" to="/validation" value={2} />
                  )}
                  {isOwner && <LinkTab label="Track" to="/track" value={3} />}
                </Tabs>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleClick}
                  style={{ marginLeft: 24, fontSize: 13 }}
                >
                  {minimizeAddress(address, 4, -4)}
                </Button>
                <ActionMenu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                >
                  <Link
                    to="/profile"
                    style={{ textDecoration: "none", color: "#000" }}
                  >
                    <ActionMenuItem style={{ fontSize: 13 }}>
                      Profile
                    </ActionMenuItem>
                  </Link>
                  <Divider />
                  <ActionMenuItem
                    onClick={() => {
                      handleDisconnect();
                    }}
                    style={{ fontSize: 13 }}
                  >
                    Disconnect
                  </ActionMenuItem>
                </ActionMenu>
                <Box ml={2} height="100%">
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={chainId || -1}
                    label="Age"
                    onChange={handleNetworkMenuChange}
                    variant="standard"
                    sx={{
                      height: "100%",
                      "&:hover, :hover:not(.Mui-disabled):before, :after": {
                        borderBottom: "1px solid #31FD00",
                      },
                    }}
                    MenuProps={{
                      sx: {
                        marginTop: "21px",
                      },
                    }}
                    renderValue={(value) => {
                      return (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <img
                            src={
                              value === config.fantomChainId
                                ? FantomSVG
                                : EthereumSVG
                            }
                            width={value === config.fantomChainId ? 18 : 14}
                            alt=""
                          />
                          {networkNameMap[value]}
                        </Box>
                      );
                    }}
                  >
                    {allowedNetworks.map((n) => (
                      <MenuItem value={n.chainId}>{n.name}</MenuItem>
                    ))}
                  </Select>
                </Box>
              </Grid>
            ) : (
              <Grid container alignItems="center">
                <Tabs
                  indicatorColor="secondary"
                  value={page}
                  onChange={handleChange}
                  aria-label="headers"
                >
                  <LinkTab label="Explorer" to="/explorer" value={0} />
                </Tabs>
                <Button
                  variant="outlined"
                  color="secondary"
                  style={{ marginLeft: 36 }}
                  disabled={loading}
                  onClick={connect}
                >
                  Connect
                </Button>
                <Box ml={2} height="100%">
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={chainId || -1}
                    onChange={handleNetworkMenuChange}
                    variant="standard"
                    sx={{
                      height: "100%",
                      "&:hover, :hover:not(.Mui-disabled):before, :after": {
                        borderBottom: "1px solid #31FD00",
                      },
                    }}
                    MenuProps={{
                      sx: {
                        marginTop: "21px",
                      },
                    }}
                    renderValue={(value) => {
                      return (
                        <Box sx={{ display: "flex", gap: 1, fontSize: 13 }}>
                          {(value === config.ethereumChainId ||
                            value === config.fantomChainId) && (
                            <img
                              src={
                                value === config.ethereumChainId
                                  ? EthereumSVG
                                  : FantomSVG
                              }
                              width={value === config.fantomChainId ? 18 : 14}
                              alt=""
                            />
                          )}
                          {value !== config.ethereumChainId &&
                          value !== config.fantomChainId
                            ? "UnSupported Network"
                            : networkNameMap[value]}
                        </Box>
                      );
                    }}
                  >
                    {allowedNetworks.map((n) => (
                      <MenuItem value={n.chainId}>{n.name}</MenuItem>
                    ))}
                  </Select>
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </AppBar>
  );
};
