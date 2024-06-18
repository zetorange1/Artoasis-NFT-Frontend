import React, { useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { Box, Button, Fade, MenuItem, Select } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import { setOpera } from "../../helper/web3";
import { config } from "../../config";
import EthereumSVG from "../../assets/svg/ethereum.svg";
import FantomSVG from "../../assets/svg/fantom.svg";
import { allowedNetworks, networkNameMap } from "../../constants/network";

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
  },
}));

export interface MobileMenuProps {
  searchValue?: string;
  isValidator: boolean;
  isOwner: boolean;
  searchTerm: (value: string) => void;
  handleSearch?: (event: React.KeyboardEvent) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = (props) => {
  const { searchValue, isValidator, isOwner, searchTerm, handleSearch } = props;
  const { address, loading, connect, disconnect, chainId } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const MenuToggle = () => {
    return (
      <Box style={{ cursor: "pointer", color: "white" }} onClick={toggle}>
        {isOpen ? (
          <CloseIcon style={{ fontSize: "2rem" }} />
        ) : (
          <MenuIcon style={{ fontSize: "2rem" }} />
        )}
      </Box>
    );
  };

  const handleNetworkMenuChange = (event: any) => {
    setOpera(event.target.value);
  };

  return (
    <>
      <MenuToggle />
      <Fade in={isOpen}>
        <Grid
          container
          position="fixed"
          left="0"
          top="76px"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-around"
          bgcolor="#091A2B"
          spacing={1}
          padding={1}
          zIndex={1}
        >
          <Grid item>
            <Search style={{ borderRadius: 24 }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search by address…"
                inputProps={{ "aria-label": "search" }}
                value={searchValue}
                onChange={(e) => searchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </Search>
          </Grid>
          <Grid item>
            <Button color="primary">
              <Link
                to="/explorer"
                style={{ color: "white", textDecoration: "none" }}
                onClick={toggle}
              >
                Explorer
              </Link>
            </Button>
          </Grid>
          {address ? (
            <>
              <Grid item>
                <Button color="primary">
                  <Link
                    to={`/address/${address}`}
                    style={{ color: "white", textDecoration: "none" }}
                    onClick={toggle}
                  >
                    Profile
                  </Link>
                </Button>
              </Grid>
              <Grid item>
                <Button color="primary">
                  <Link
                    to="/create"
                    style={{ color: "white", textDecoration: "none" }}
                    onClick={toggle}
                  >
                    Mint
                  </Link>
                </Button>
              </Grid>
              <Grid item>
                <Button color="primary">
                  <Link
                    to="/collections"
                    style={{ color: "white", textDecoration: "none" }}
                    onClick={toggle}
                  >
                    Collections
                  </Link>
                </Button>
              </Grid>
              {isValidator && (
                <Grid item>
                  <Button color="primary">
                    <Link
                      to="/validation"
                      style={{ color: "white", textDecoration: "none" }}
                      onClick={toggle}
                    >
                      Validation
                    </Link>
                  </Button>
                </Grid>
              )}
              {isOwner && (
                <Grid item>
                  <Button color="primary">
                    <Link
                      to="/track"
                      style={{ color: "white", textDecoration: "none" }}
                      onClick={toggle}
                    >
                      Track
                    </Link>
                  </Button>
                </Grid>
              )}
              <Grid item>
                <Button
                  style={{ color: "white" }}
                  onClick={() => {
                    disconnect();
                    toggle();
                  }}
                >
                  Disconnect
                </Button>
              </Grid>
            </>
          ) : (
            <Grid item>
              <Button
                style={{ color: "white" }}
                disabled={loading}
                onClick={() => {
                  connect();
                  toggle();
                }}
              >
                Connect
              </Button>
            </Grid>
          )}
          <Grid item>
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
        </Grid>
      </Fade>
    </>
  );
};

export default MobileMenu;
