import { PropsWithChildren, useEffect, useState } from "react";
import { useParams } from "react-router";
import { styled } from "@mui/system";
import {
  Button,
  Card,
  CircularProgress,
  Grid,
  Typography,
  CardActions,
  IconButton,
  ButtonGroup,
  CardContent,
  Container,
  Box,
} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Web3 from "web3";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import Flag from "@mui/icons-material/Flag";
import LocalOffer from "@mui/icons-material/LocalOffer";
import Refresh from "@mui/icons-material/Refresh";
import RemoveRedEye from "@mui/icons-material/RemoveRedEye";
import Share from "@mui/icons-material/Share";
import _ from "lodash";

import {
  minimizeAddress,
  mixNFTMetadata,
  sameAddress,
} from "../../helper/utils";
import { getCurrencyPrice } from "../../helper/coingecko-api";
import { useContracts } from "../../contexts/Web3Context";
import PriceModal from "../../components/NFT/PriceModal";
import Fantom from "../../assets/fantom.png";
import Ethereum from "../../assets/ethereum.png";
import { INft } from "../../types";
import { normalizeNFT } from "../../helper/utils";
import { IActivity } from "../../types/interfaces/Activity";
import { IBid } from "../../types/interfaces/Bid";
import PlaceOfferModal from "./PlaceOfferModal";
import TransferModal from "./TransferModal";
import Bids from "../Bids";
import Activities from "../Activities";
import ApiService from "../../helper/api";
import { Link } from "react-router-dom";
import { useSnackbar } from "../../contexts/Snackbar";
import ReportModal from "./ReportModal";
import Comments from "../Comments/Comments";
import Voter from "./Voter";
import NftCategoriesControl from "../ui/NftCategoriesControl";
import { useScanApiContext } from "../../contexts/ScanApiContext";
import { useAuthContext } from "../../contexts/AuthContext";
import OverlayLoading from "../ui/OverlayLoading";
import { config } from "../../config";

const NftAccordion = styled((props: PropsWithChildren<any>) => (
  <Accordion disableGutters elevation={0} square {...props}>
    {props.children}
  </Accordion>
))(({ theme }) => ({
  background: theme.palette.primary.main,
  borderBottom: `1px solid #273a4c47 !important`,
  margin: 0,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:last-child": {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  "&:first-of-type": {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  "&:before": {
    display: "none",
  },
}));

const REPORT_LIMIT = 4;

export default function NFT() {
  const { getOneExternalNft } = useScanApiContext();
  const { tokenId, contract: tokenAddress } = useParams<any>();

  const [nft, setNft] = useState<INft>();
  const { address, chainId } = useAuthContext();
  const {
    marketContractAddress,
    contracts: { market },
    getERC721Contract,
    wrongNetwork,
    currency,
  } = useContracts();
  const [loading, setLoading] = useState(false);
  const [ftmPrice, setFtmPrice] = useState(0);
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showPlaceOffer, setShowPlaceOffer] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { showSnackbar } = useSnackbar();
  const [approved, setApproved] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isReported, setIsReported] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [collection, setCollection] = useState<any>(null);

  const favorited = favorites.includes(address?.toLowerCase());
  const query = {
    token_id: tokenId,
    token_address: tokenAddress,
  };

  const showWrongNetworkAlert = () => {
    showSnackbar({
      severity: "error",
      message: "Please switch to Fantom Opera Chain",
    });
  };

  const favorite = () => {
    if (!address) {
      return;
    }
    try {
      if (favorited) {
        ApiService.delFavorite(query, address).then((res) => {
          setFavorites(favorites.filter((f) => f !== address.toLowerCase()));
        });
      } else {
        ApiService.postFavorite(query, address, +chainId).then((res) => {
          setFavorites([...favorites, address.toLowerCase()]);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const approve = async () => {
    if (wrongNetwork) {
      return showWrongNetworkAlert();
    }
    setLoading(true);
    showSnackbar({
      severity: "info",
      message: "Transaction is in pending...",
    });

    try {
      const contract = getERC721Contract(tokenAddress);
      const gasPrice = await contract?.methods
        .approve(marketContractAddress, tokenId)
        .estimateGas({ from: address });
      console.log(gasPrice);
      await contract?.methods
        .setApprovalForAll(marketContractAddress, true)
        .send({
          from: address,
          // gasPrice,
        });
      setApproved(true);
      showSnackbar({
        severity: "success",
        message: "The NFT has been approved",
      });
    } catch (err) {
      showSnackbar({
        severity: "error",
        message: "Failed to approve the nft",
      });
    }

    setLoading(false);
  };

  const fetchApproved = async () => {
    if (!nft || !nft.owner) {
      return;
    }
    const isApproved = await getERC721Contract(tokenAddress)
      ?.methods.isApprovedForAll(nft.owner, marketContractAddress)
      .call();
    setApproved(isApproved);
  };

  const fetchNFT = async () => {
    setFetching(true);

    try {
      const requests: any[] = [
        ApiService.getNft({
          token_address: tokenAddress,
          token_id: tokenId,
        }),
        ApiService.getActivitiesForNft(tokenId, tokenAddress),
        ApiService.getBidsForNft(tokenId, tokenAddress),
        getOneExternalNft(tokenAddress, tokenId),
        ApiService.getCollection(tokenAddress).catch((err) => null),
      ];

      let [
        {
          results: [nft],
        },
        { results: activities },
        {
          results: [bid],
        },
        externalNft,
        collection,
      ] = await Promise.all(requests);

      setCollection(collection);

      console.log("NFT:", nft);
      console.log("External:", externalNft);
      console.log("BID:", bid);

      nft = mixNFTMetadata(nft, externalNft);

      if (!nft) {
        setFetching(false);
        return;
      }
      nft.currentBid = bid;
      const metadata: INft = normalizeNFT(_.cloneDeep(nft));

      setActivities(
        activities.sort(
          (t1, t2) => t2.createdAtTimestamp - t1.createdAtTimestamp
        )
      );

      setNft(metadata);
    } catch (err) {
      console.error(err);
      setNft(undefined);
    }
    setFetching(false);
  };

  const setAsk = async (price: string) => {
    if (!nft || !address) {
      return;
    }
    if (wrongNetwork) {
      return showWrongNetworkAlert();
    }
    setShowPriceModal(false);
    setLoading(true);
    showSnackbar({
      severity: "info",
      message: "Transaction is in pending...",
    });

    try {
      await market?.methods
        .setAsk(
          address,
          tokenAddress,
          `${tokenId}`,
          Web3.utils.toWei(price, "ether").toString()
        )
        .send({
          from: address,
          gasPrice: Web3.utils.toWei("300", "gwei"),
        });
      await ApiService.createNft(
        nft.tokenAddress,
        +nft.tokenId,
        +price,
        categories
      );
      showSnackbar({
        severity: "success",
        message: "Price has been set",
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      showSnackbar({
        severity: "error",
        message: "Failed to set the price",
      });
      return;
    }
    setNft({
      ...nft,
      price: +price,
    } as INft);
    setLoading(false);
  };

  const transfer = async (to: string) => {
    if (!nft || !address) {
      return;
    }
    if (wrongNetwork) {
      return showWrongNetworkAlert();
    }
    setShowTransfer(false);
    setLoading(true);
    showSnackbar({
      severity: "info",
      message: "Transaction is in pending...",
    });

    try {
      await market?.methods
        .transfer(address, to, tokenAddress, `${tokenId}`)
        .estimateGas({ from: address });
      await market?.methods
        .transfer(address, to, tokenAddress, `${tokenId}`)
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
    setNft({
      ...nft,
      owner: to,
    } as INft);
    setApproved(false);
    setLoading(false);
  };

  const placeOffer = async (amount: string) => {
    if (!nft || !address) {
      return;
    }
    if (wrongNetwork) {
      return showWrongNetworkAlert();
    }
    setShowPlaceOffer(false);
    setLoading(true);
    showSnackbar({
      severity: "info",
      message: "Transaction is in pending...",
    });

    const value = Web3.utils.toWei(`${amount}`, "ether").toString();

    try {
      const referral = localStorage.getItem("open-oasis-referral");

      if (referral && !sameAddress(address, referral)) {
        await market?.methods
          .setBidWithReferral(
            tokenAddress,
            tokenId,
            {
              amount: value,
              bidder: address,
            },
            referral
          )
          .send({
            from: address,
            value,
            gasPrice: Web3.utils.toWei("300", "gwei"),
          });
        localStorage.removeItem("open-oasis-referral");
      } else {
        await market?.methods
          .setBid(tokenAddress, tokenId, {
            amount: value,
            bidder: address,
          })
          .send({
            from: address,
            value,
            gasPrice: Web3.utils.toWei("300", "gwei"),
          });
      }

      showSnackbar({
        severity: "success",
        message: "The offer has been sent",
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      showSnackbar({
        severity: "error",
        message: "Failed to place an offer",
      });
      return;
    }
    const nftClone = _.cloneDeep(nft);
    const bid = nftClone.currentBid;

    if (bid) {
      bid.amount = amount;
      bid.createdAtTimestamp = `${Math.floor(Date.now() / 1000)}`;
    } else {
      if (nft.price && +nft.price > 0 && +nft.price <= +amount) {
        nftClone.currentBid = null as any;
        nftClone.owner = address;
        nftClone.price = 0;
        setApproved(false);
      } else {
        nftClone.currentBid = {
          bidder: { address },
          amount,
          createdAtTimestamp: `${Math.floor(Date.now() / 1000)}`,
          id: `${Date.now()}`,
        } as any;
      }
    }
    setNft(nftClone);
    setLoading(false);
  };

  const fetchAllCategories = async () => {
    const categories = await ApiService.getCategories();
    setAllCategories(categories.map((val) => val.name));
  };

  const submitCategory = async (categories) => {
    if (!nft || !address) {
      return;
    }

    try {
      ApiService.submitCategory(query, categories)
        .then(() => {})
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
      showSnackbar({
        severity: "error",
        message: "Failed to set the category",
      });
      return;
    }
  };

  const submitReport = async (reason: any, other: string) => {
    if (!nft || !address) {
      return;
    }
    setShowReportModal(false);
    setLoading(true);
    showSnackbar({
      severity: "info",
      message: "Submitting your report...",
    });

    try {
      ApiService.submitReport(query, address, reason.value, other)
        .then((res) => {
          showSnackbar({
            severity: "success",
            message: "Reported!",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.error(err);
      showSnackbar({
        severity: "error",
        message: "Failed to submit your report.",
      });
      return;
    }
    setLoading(false);
  };

  const accept = async (bid: IBid) => {
    if (!nft || !address) {
      return;
    }
    if (wrongNetwork) {
      return showWrongNetworkAlert();
    }
    setLoading(true);
    showSnackbar({
      severity: "info",
      message: "Transaction is in pending...",
    });

    try {
      await market?.methods
        .acceptBid(address, tokenAddress, tokenId, {
          amount: Web3.utils.toWei(`${bid.amount}`, "ether").toString(),
          bidder: bid.bidder.address,
        })
        .send({
          from: address,
          gasPrice: Web3.utils.toWei("300", "gwei"),
        });
      ApiService.submitPrice(query, 0);
      showSnackbar({
        severity: "success",
        message: "The offer has been accepted",
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      showSnackbar({
        severity: "error",
        message: "Failed to accept an offer",
      });
      return;
    }
    const nftClone = _.cloneDeep(nft);
    nftClone!.owner = bid.bidder.address;
    nftClone!.currentBid = null as any;
    nftClone!.price = null as any;
    setNft(nftClone);
    setApproved(false);
    setLoading(false);
  };

  const cancelBid = async () => {
    if (!nft || !address) {
      return;
    }
    if (wrongNetwork) {
      return showWrongNetworkAlert();
    }
    setLoading(true);
    showSnackbar({
      severity: "info",
      message: "Transaction is in pending...",
    });

    try {
      await market?.methods
        .removeBid(tokenAddress, tokenId, address)
        .send({ from: address, gasPrice: Web3.utils.toWei("300", "gwei") });
      showSnackbar({
        severity: "success",
        message: "Cancelled successfully",
      });
    } catch (err) {
      console.error(err);
      setLoading(false);
      showSnackbar({
        severity: "error",
        message: "Failed to cancel",
      });
      return;
    }
    const nftClone = _.cloneDeep(nft);
    nftClone.currentBid = null as any;
    setNft(nftClone);
    setLoading(false);
  };

  const buy = async () => {
    await placeOffer(nft?.price as any);
  };

  const fetchReportedNFTs = async () => {
    const reportedNfts = await ApiService.getReportedNfts(chainId);
    for (const reportedNft of reportedNfts.reports) {
      if (
        reportedNft.count >= REPORT_LIMIT &&
        reportedNft.token_address.toLowerCase() ===
          tokenAddress.toLowerCase() &&
        reportedNft.token_id === parseInt(tokenId)
      ) {
        setIsReported(true);
      }
    }
  };

  const fetchVisitCount = () => {
    ApiService.getVisits(query)
      .then((res) => {
        setVisitCount(res.data.visits);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const submitVisit = () => {
    if (isMine || !nft || !address) {
      return;
    }
    ApiService.submitVisit(query, address);
  };

  const isMine = nft && address && sameAddress(nft.owner, address);

  useEffect(() => {
    (async function () {
      setFtmPrice(await getCurrencyPrice(currency));
    })();
  }, [currency]);

  useEffect(() => {
    if (tokenAddress && tokenId) {
      fetchNFT();
      fetchAllCategories();
      fetchReportedNFTs();
      fetchVisitCount();

      ApiService.getNft(query)
        .then((res) => {
          setCategories(
            res.results[0]?.category?.map(({ name }) => name) || []
          );
          setFavorites(
            (res.results[0]?.favorites || []).map((u) => u.toLowerCase())
          );
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setNft(undefined);
      setApproved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenAddress, tokenId]);

  useEffect(() => {
    if (!chainId || isNaN(chainId)) {
      return;
    }
    if (!tokenAddress || !tokenId) {
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketContractAddress, tokenAddress, tokenId]);

  useEffect(() => {
    fetchApproved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft]);

  useEffect(() => {
    submitVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, nft]);

  const copyLink = () => {
    try {
      let link = `${window.origin}/nft/${nft?.tokenAddress}/${nft?.tokenId}`;

      if (address) {
        link += `?referral=${address}`;
      }
      navigator.clipboard.writeText(link);

      showSnackbar({
        severity: "success",
        message: "Link Copied!",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const decimalFloat = (floatNum, decimal) =>
    floatNum.toFixed(decimal).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");

  return (
    <Container maxWidth="xl">
      <Box pb={2}>
        <Grid
          container
          alignItems="start"
          justifyContent="center"
          spacing={6}
          mt={2}
        >
          {fetching && <CircularProgress color="secondary" />}
          {!fetching && nft ? (
            <>
              <Grid item xs={12} lg={5}>
                <Card>
                  <CardActions>
                    <Grid container justifyContent="flex-end">
                      <IconButton
                        color={favorited ? "error" : "secondary"}
                        onClick={favorite}
                      >
                        {favorited ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                    </Grid>
                  </CardActions>
                  <Box
                    maxHeight="650px"
                    minHeight="200px"
                    display="flex"
                    justifyContent="center"
                    alignContent="center"
                    position="relative"
                  >
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="100%"
                    >
                      <img
                        src={nft.image}
                        style={{
                          width: "auto",
                          height: "auto",
                          maxWidth: "100%",
                          maxHeight: "100%",
                        }}
                        alt=""
                      />
                    </Box>
                  </Box>
                </Card>
                <Voter tokenId={tokenId} tokenAddress={tokenAddress} />
                <OverlayLoading show={loading} />
              </Grid>
              <Grid item xs={12} lg={7}>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h5" color="secondary" gutterBottom>
                      {nft.name}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <ButtonGroup
                      variant="contained"
                      style={{ background: "white" }}
                    >
                      <IconButton onClick={fetchNFT}>
                        <Refresh />
                      </IconButton>
                      <IconButton onClick={copyLink}>
                        <Share />
                      </IconButton>
                      <IconButton onClick={() => setShowReportModal(true)}>
                        <Flag />
                      </IconButton>
                    </ButtonGroup>
                  </Grid>
                </Grid>
                <Grid
                  container
                  justifyContent="between"
                  pt={3}
                  mb={3}
                  spacing={4}
                >
                  <Grid item display="flex" alignItems="center">
                    <Typography
                      variant="h6"
                      color="white"
                      className="ff-primary"
                    >
                      Owned By
                    </Typography>
                    <Link
                      to={`/address/${nft.owner}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography
                        variant="h6"
                        color="secondary"
                        ml={1}
                        className="ff-primary"
                      >
                        {minimizeAddress(nft.owner, 6, -4)}
                      </Typography>
                    </Link>
                  </Grid>
                  <Grid item display="flex" alignItems="center">
                    <RemoveRedEye style={{ color: "white" }} />
                    <Typography
                      color="white"
                      variant="h6"
                      ml={1}
                      className="ff-primary"
                    >
                      {visitCount} view{visitCount !== 1 && "s"}
                    </Typography>
                  </Grid>
                  <Grid item display="flex" alignItems="center">
                    <Favorite style={{ color: "white" }} />
                    <Typography
                      color="white"
                      variant="h6"
                      ml={1}
                      className="ff-primary"
                    >
                      {favorites.length} favourites
                    </Typography>
                  </Grid>
                </Grid>
                {collection && (
                  <Grid my={2} container>
                    <Typography
                      color="white"
                      variant="h6"
                      mr={1}
                      className="ff-primary"
                    >
                      Collection:
                    </Typography>
                    <Link
                      to={`/collections/${collection.address}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography
                        className="ff-primary"
                        color="secondary"
                        variant="h6"
                      >
                        {collection.nftName}
                      </Typography>
                    </Link>
                  </Grid>
                )}
                <Card style={{ background: "white" }}>
                  <CardContent>
                    <Grid
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6" color="primary" gutterBottom>
                        Current Price
                      </Typography>
                      {isReported && (
                        <Typography color="red">Reported</Typography>
                      )}
                    </Grid>
                    {nft.price ? (
                      <Grid container alignItems="center" spacing={1}>
                        <Grid item lineHeight="1">
                          <img
                            src={
                              parseInt(chainId) === config.ethereumChainId
                                ? Ethereum
                                : Fantom
                            }
                            width={24}
                            height={24}
                            alt=""
                          />
                        </Grid>
                        <Grid item>
                          <Typography
                            variant="h5"
                            color="primary"
                            className="ff-primary"
                          >
                            {nft.price}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography color="primary" className="ff-primary">
                            ($
                            {decimalFloat(ftmPrice * nft.price, 4)})
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography color="primary" variant="body2">
                        No Price
                      </Typography>
                    )}
                    {isMine ? (
                      <>
                        <Grid container mt={1} spacing={2}>
                          {!approved ? (
                            <Grid item>
                              <Button
                                variant="contained"
                                disabled={loading}
                                onClick={() => approve()}
                              >
                                Approve
                              </Button>
                            </Grid>
                          ) : (
                            <>
                              <Grid item>
                                <Button
                                  variant="contained"
                                  onClick={() => setShowPriceModal(true)}
                                  disabled={loading}
                                >
                                  <AccountBalanceWallet
                                    style={{ marginRight: 8 }}
                                  />
                                  Set Price
                                </Button>
                              </Grid>
                              <Grid item>
                                <Button
                                  variant="outlined"
                                  disabled={loading}
                                  onClick={() => setShowTransfer(true)}
                                >
                                  <LocalOffer style={{ marginRight: 8 }} />
                                  Transfer
                                </Button>
                              </Grid>
                            </>
                          )}
                        </Grid>
                        {!approved && (
                          <Typography
                            variant="body2"
                            color="primary"
                            mt={1}
                            className="ff-primary"
                          >
                            Please approve the marketplace to be able to trade
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Grid container mt={1} spacing={2}>
                        {nft.price && (
                          <Grid item>
                            <Button
                              variant="contained"
                              disabled={loading || !approved}
                              onClick={buy}
                            >
                              <AccountBalanceWallet
                                style={{ marginRight: 8 }}
                              />
                              Buy Now
                            </Button>
                          </Grid>
                        )}
                        <Grid item>
                          <Button
                            variant="outlined"
                            disabled={loading || !approved}
                            onClick={() => setShowPlaceOffer(true)}
                          >
                            <LocalOffer style={{ marginRight: 8 }} />
                            Make Offer
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                    <PriceModal
                      show={showPriceModal}
                      chainId={chainId}
                      handleClose={() => setShowPriceModal(false)}
                      setPrice={setAsk}
                    />
                    <PlaceOfferModal
                      address={address}
                      chainId={chainId}
                      currentBid={nft.currentBid}
                      show={showPlaceOffer}
                      handleClose={() => setShowPlaceOffer(false)}
                      placeOffer={placeOffer}
                    />
                    <TransferModal
                      show={showTransfer}
                      handleClose={() => setShowTransfer(false)}
                      send={transfer}
                    />
                    <ReportModal
                      show={showReportModal}
                      handleClose={() => setShowReportModal(false)}
                      submitReport={submitReport}
                    />
                  </CardContent>
                </Card>
                <Box mt={2}>
                  <NftAccordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon style={{ color: "white" }} />}
                    >
                      <Typography className="ff-label" fontSize={13}>
                        Category
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <NftCategoriesControl
                        categories={categories}
                        allCategories={allCategories}
                        editing={isMine}
                        onAddCategory={(c) => {
                          const updated = [...categories, c];
                          setCategories(updated);
                          submitCategory(updated);
                        }}
                        onDeleteCategory={(c) => {
                          const updated = categories.filter(
                            (item) => item !== c
                          );
                          setCategories(updated);
                          submitCategory(updated);
                        }}
                      />
                    </AccordionDetails>
                  </NftAccordion>
                  <NftAccordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon style={{ color: "white" }} />}
                    >
                      <Typography className="ff-label" fontSize={13}>
                        Description
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" className="ff-primary">
                        {nft.description}
                      </Typography>
                    </AccordionDetails>
                  </NftAccordion>
                  <NftAccordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon style={{ color: "white" }} />}
                    >
                      <Typography className="ff-label" fontSize={13}>
                        Offer
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {nft.currentBid ? (
                        <Bids
                          nft={nft}
                          address={address}
                          accept={accept}
                          cancel={cancelBid}
                          loading={loading}
                        />
                      ) : (
                        <Typography variant="body2" className="ff-primary">
                          No Offer
                        </Typography>
                      )}
                    </AccordionDetails>
                  </NftAccordion>
                  <NftAccordion>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon style={{ color: "white" }} />}
                    >
                      <Typography className="ff-label" fontSize={13}>
                        Activities
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Activities activities={activities} />
                    </AccordionDetails>
                  </NftAccordion>
                </Box>
              </Grid>
            </>
          ) : (
            !fetching && (
              <Typography color="white" className="ff-label">
                This NFT doesn't exist
              </Typography>
            )
          )}
        </Grid>
      </Box>
      {nft && <Comments nft={nft} currentUser={address} />}
    </Container>
  );
}
