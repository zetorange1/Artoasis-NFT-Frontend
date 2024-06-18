import { memo, useEffect, useMemo, useState } from "react";
import { styled } from "@mui/material/styles";
import { useHistory } from "react-router";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import CardActions from "@mui/material/CardActions";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ContentCopy, SwapHoriz } from "@mui/icons-material";
import { Chip, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import Web3 from "web3";

import { INft, NftStatus } from "../../types";
import ApiService from "../../helper/api";
import { useSnackbar } from "../../contexts/Snackbar";
import Fantom from "../../assets/svg/fantom.svg";
import Ethereum from "../../assets/svg/ethereum.svg";
import { useContracts } from "../../contexts/Web3Context";
import TransferModal from "../NFT/TransferModal";
import { stringToColor } from "../../helper/utils";
import { config } from "../../config";
import { useAuthContext } from "../../contexts/AuthContext";

const NftCard = styled(Card)({
  width: "100%",
});

const ActionMenu = styled(Menu)({
  "& .MuiPaper-root": {
    background: "white",
    borderRadius: 2,
  },
});

const ActionMenuItem = styled(MenuItem)(({ theme }) => ({
  color: theme.palette.primary.main,
  minWidth: 200,
  paddingTop: 12,
  paddingBottom: 12,
}));

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.3),
}));

interface Props {
  nft: INft;
  onFavorite?: () => void;
  validator?: boolean;
  showStatus?: boolean;
}

export default memo(
  ({
    nft,
    onFavorite = () => null,
    validator = false,
    showStatus = false,
  }: Props) => {
    const history = useHistory();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    const [favorites, setFavorites] = useState<string[]>([]);
    const [category, setCategory] = useState<string[]>([]);
    const [visible, setVisible] = useState<boolean>(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const { address, chainId } = useAuthContext();
    const { address: addressParam } = useParams<any>();
    const { showSnackbar } = useSnackbar();
    const {
      contracts: { market },
      wrongNetwork,
    } = useContracts();

    const favorited = useMemo(
      () => favorites.includes(address?.toLowerCase()),
      [address, favorites]
    );

    const query = {
      token_id: nft.tokenId,
      token_address: nft.tokenAddress,
    };

    const isMine = useMemo(
      () =>
        address?.toLowerCase() ===
        (nft.owner ? nft?.owner?.toLowerCase() : addressParam?.toLowerCase()),
      [address, nft, addressParam]
    );

    const favorite = () => {
      if (!address) {
        return;
      }
      try {
        if (favorited) {
          ApiService.delFavorite(query, address).then(() => {
            setFavorites(favorites.filter((f) => f !== address.toLowerCase()));
            onFavorite();
          });
        } else {
          ApiService.postFavorite(query, address, chainId).then(() => {
            setFavorites([...favorites, address.toLowerCase()]);
            onFavorite();
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    const copyLink = () => {
      navigator.clipboard.writeText(
        `${window.origin}/nft/${nft.tokenAddress}/${nft.tokenId}`
      );
      handleClose();
      showSnackbar({
        severity: "success",
        message: "Link Copied!",
      });
    };

    const handleImageLoad = () => {
      setVisible(true);
    };

    const transfer = async (to: string) => {
      if (!nft || !address) {
        return;
      }
      if (wrongNetwork) {
        showSnackbar({
          severity: "error",
          message: "Please switch to Fantom Opera Chain",
        });
        return;
      }
      setShowTransfer(false);
      handleClose();
      showSnackbar({
        severity: "info",
        message: "Transaction is in pending...",
      });

      try {
        await market?.methods
          .transfer(address, to, nft.tokenAddress, `${nft.tokenId}`)
          .estimateGas({ from: address });
        await market?.methods
          .transfer(address, to, nft.tokenAddress, `${nft.tokenId}`)
          .send({ from: address, gasPrice: Web3.utils.toWei("300", "gwei") });
        showSnackbar({
          severity: "success",
          message: "The NFT has been transferred",
        });
      } catch (err) {
        console.error(err);
        showSnackbar({
          severity: "error",
          message: "Failed to transfer",
        });
        return;
      }
    };

    const handleTransfer = () => {
      setShowTransfer(true);
      handleClose();
    };

    useEffect(() => {
      if (validator) {
        return;
      }
      setFavorites(nft.favorites || []);
      setCategory(nft.category ? nft.category.map((c) => c.name) : []);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nft]);

    const price = useMemo(() => {
      if (!nft) {
        return 0;
      }
      return nft.price || 0;
    }, [nft]);

    return (
      <NftCard>
        <CardActionArea
          onClick={() =>
            validator
              ? null
              : history.push(`/nft/${nft.tokenAddress}/${nft.tokenId}`)
          }
        >
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            height={300}
          >
            {!visible && <CircularProgress />}
            <img
              src={nft.image}
              height="300px"
              alt={nft.name}
              onLoad={handleImageLoad}
              style={{ display: visible ? "block" : "none" }}
            />
          </Grid>
        </CardActionArea>
        <CardContent>
          <Grid container justifyContent="space-between">
            <Typography className="ff-primary">{nft.name}</Typography>
          </Grid>
          <Typography
            gutterBottom
            style={{
              textOverflow: "ellipsis",
              lineHeight: "24px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              fontSize: 18,
            }}
          >
            {nft.description || "-"}
          </Typography>
          {category.length ? (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {category.map((c) => (
                <ListItem key={c}>
                  <Chip
                    size="small"
                    label={c}
                    style={{ background: stringToColor(c) }}
                  />
                </ListItem>
              ))}
            </ul>
          ) : (
            <div style={{ height: 30 }} />
          )}
          {showStatus && (
            <Grid mt={2}>
              <Chip
                label={nft.status.toUpperCase()}
                color={
                  nft.status === NftStatus.PENDING
                    ? "warning"
                    : nft.status === NftStatus.DECLINED
                    ? "error"
                    : "success"
                }
              />
            </Grid>
          )}
          <TransferModal
            show={showTransfer}
            handleClose={() => setShowTransfer(false)}
            send={transfer}
          />
        </CardContent>
        <Divider style={{ borderWidth: 1 }} />
        <CardActions>
          <Grid container justifyContent="space-between" alignItems="center">
            <IconButton color="bright" onClick={handleClick}>
              <MoreHoriz />
            </IconButton>
            {isMine && nft.reported && (
              <Typography color="red">Reported</Typography>
            )}
            <Grid item display="flex" alignItems="center">
              <Grid container mr={1} wrap="nowrap">
                <img
                  src={
                    parseInt(chainId) === config.ethereumChainId
                      ? Ethereum
                      : Fantom
                  }
                  width={parseInt(chainId) === config.ethereumChainId ? 14 : 24}
                  alt=""
                />
                <Typography ml={1} className="ff-primary">
                  {price}
                </Typography>
              </Grid>
              {!validator && (
                <Grid container alignItems="center" wrap="nowrap">
                  <IconButton
                    color={favorited ? "error" : "bright"}
                    onClick={favorite}
                  >
                    {favorited ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                  <Typography className="ff-primary">
                    {favorites.length}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
          <ActionMenu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <ActionMenuItem onClick={copyLink}>
              <ContentCopy />
              <Typography style={{ marginLeft: 12 }} className="ff-primary">
                Copy Link
              </Typography>
            </ActionMenuItem>
            {isMine && (
              <ActionMenuItem onClick={handleTransfer}>
                <SwapHoriz />
                <Typography style={{ marginLeft: 12 }} className="ff-primary">
                  Transfer
                </Typography>
              </ActionMenuItem>
            )}
          </ActionMenu>
        </CardActions>
      </NftCard>
    );
  }
);
