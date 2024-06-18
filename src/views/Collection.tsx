/* eslint-disable react-hooks/exhaustive-deps */
import {
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  FilterList,
  GridView,
  Timeline,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Volumes from "../components/Collection/Volumes";
import { useSnackbar } from "../contexts/Snackbar";
import ApiService from "../helper/api";
import {
  minimizeAddress,
  mixNFTMetadatas,
  normalizeNFT,
  parseMoralisNFT,
} from "../helper/utils";
import { useAuthContext } from "../contexts/AuthContext";
import { useMoralis } from "react-moralis";
import Web3 from "web3";
import Activities from "../components/Activities";
import { useScanApiContext } from "../contexts/ScanApiContext";
import Nft from "../components/Collections/Nft";
import { useContracts } from "../contexts/Web3Context";

const rangeOptions = [
  {
    value: 30,
    label: "1 Day Volume",
  },
  {
    value: 7,
    label: "1 Week Volume",
  },
  {
    value: 30,
    label: "1 Month Volume",
  },
  {
    value: 30,
    label: "3 Month Volume",
  },
];

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2, 1),
  // necessary for content to be below app bar
  justifyContent: "space-between",
  width: "100%",
}));

const Drawer = styled("div", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ open, theme }) => ({
  width: open ? "360px" : "48px",
  position: "sticky",
  top: "100px",
  transition: theme.transitions.create("all", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  background: "var(--shadow-color)",
}));

const Main = styled("div", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  width: `calc(100% - ${open ? 360 : 48}px)`,
  padding: theme.spacing(3),
  transition: theme.transitions.create("all", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    transition: theme.transitions.create("all", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const FilterAccordion = styled(Accordion)({
  background: "var(--shadow-color)",
});

export default function Collection() {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const { fillNFTMetadata } = useScanApiContext();
  const [collection, setCollection] = useState<any>(null);
  const { address: collectionAddress } = useParams<{ address: string }>();
  const [selectedTab, setSelectedTab] = useState(0);
  const [openFilter, setOpenFilter] = useState(true);
  const [nfts, setNfts] = useState<any[]>([]);
  const { chainId } = useAuthContext();
  const { Moralis } = useMoralis();
  const [activities, setActivities] = useState<any[]>([]);
  const [owners, setOwners] = useState(0);
  const { getERC721Contract } = useContracts();
  const [filter, setFilter] = useState<{
    min?: number;
    max?: number;
  }>({
    min: undefined,
    max: undefined,
  });

  const floorPrice = useMemo(() => {
    const prices = activities
      .filter((act) => act.event === "Price Set")
      .map((act) => act.amount);
    const min = prices.length ? Math.min(...prices) : 0;
    return min || 0;
  }, [activities]);
  const totalVolume = useMemo(
    () =>
      activities.length
        ? activities
            .filter((act) => act.event === "Sale")
            .map((act) => act.amount || 0)
            .reduce((a, b) => a + b, 0)
        : 0,
    [activities]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const fetchCollection = async () => {
    setLoading(true);

    try {
      const erc721 = getERC721Contract(collectionAddress);

      const res = await Promise.all([
        ApiService.getCollection(collectionAddress),
        Moralis.Web3API.token.getNFTOwners({
          chain: Web3.utils.toHex(chainId) as any,
          address: collectionAddress,
        }),
        ApiService.getCollectionActivities(collectionAddress),
        ApiService.getCollectionNFTs(collectionAddress),
        erc721?.methods.owner().call(),
      ]);

      if (!res[0]) {
        showSnackbar({
          severity: "error",
          message: "Non-existing collection",
        });
      } else {
        const moralisNFTs = await Promise.all(
          (res[1].result || []).map(parseMoralisNFT)
        );
        const nftMetadatas = await Promise.all(
          moralisNFTs.map((nft) =>
            fillNFTMetadata(nft.tokenAddress, nft.tokenId, nft)
          )
        );
        res[3] = res[3].map(normalizeNFT);
        const collectionOwner = await ApiService.getUser(res[4]);
        const nftResult = mixNFTMetadatas(nftMetadatas, res[3]);

        console.log(moralisNFTs, res[3]);

        setCollection({
          ...res[0],
          owner: collectionOwner.data,
        });
        setNfts(nftResult);
        setActivities(
          res[2].sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp)
        );
        setOwners(
          Array.from(new Set(res[1].result?.map((item) => item.owner_of) || []))
            .length
        );
      }
    } catch (err) {
      console.error(err);
      showSnackbar({
        severity: "error",
        message: "Failed to load the collection, please try again later",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!chainId || isNaN(chainId)) {
      return;
    }
    fetchCollection();
  }, [collectionAddress, chainId]);

  const displayNfts = useMemo(() => {
    let result = nfts;

    if (filter.min) {
      result = result.filter((item) => +item.price >= +(filter.min as any));
    }

    if (filter.max) {
      result = result.filter((item) => +item.price <= +(filter.max as any));
    }
    return result;
  }, [filter, nfts]);

  return loading ? (
    <Grid container p={4} justifyContent="center">
      <CircularProgress color="secondary" />
    </Grid>
  ) : collection ? (
    <div>
      <Box
        height={300}
        style={{
          backgroundImage: `url(${collection.bannerImage})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Box position="relative">
        <img
          src={collection.thumbnailImage}
          style={{
            position: "absolute",
            left: "calc(50% - 100px)",
            top: "-100px",
            borderRadius: 4,
          }}
          width="200px"
          height="200px"
          alt=""
        />
        <Container maxWidth="xl" style={{ paddingTop: 24, paddingBottom: 24 }}>
          <Typography
            mt={"100px"}
            color="white"
            variant="h5"
            gutterBottom
            fontWeight="bold"
            style={{ display: "flex" }}
          >
            Owned by
            <Link
              to={`/address/${collection.owner.address}`}
              style={{ textDecoration: "none" }}
            >
              <Typography
                color="secondary"
                fontWeight="bold"
                variant="h5"
                style={{ textDecoration: "underline" }}
                ml={1}
              >
                {collection.owner.name ||
                  minimizeAddress(collection.owner.address)}
              </Typography>
            </Link>
          </Typography>
          <Typography
            color="secondary"
            variant="h4"
            fontWeight="bold"
            gutterBottom
          >
            {collection.nftName}
          </Typography>
          <Typography color="white" mb={4} className="ff-primary">
            {collection.projectDescription}
          </Typography>
          <Volumes
            data={{
              items: nfts.length,
              owners,
              floorPrice,
              totalVolume,
            }}
          />
        </Container>
        <Box pt={3}>
          <Tabs
            textColor="secondary"
            indicatorColor="secondary"
            value={selectedTab}
            onChange={handleTabChange}
            centered
          >
            <Tab
              label="Items"
              value={0}
              icon={<GridView />}
              iconPosition="start"
            />
            <Tab
              label="Activities"
              value={1}
              icon={<Timeline />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
        <Box display="flex" borderTop="1px solid #ececec">
          <Drawer open={openFilter}>
            {openFilter ? (
              <>
                <DrawerHeader>
                  <Grid container alignItems="center">
                    <FilterList style={{ color: "white" }} />
                    <Typography color="white" ml={2} className="ff-label">
                      Filter
                    </Typography>
                  </Grid>
                  <IconButton
                    onClick={() => setOpenFilter(false)}
                    color="bright"
                  >
                    <ChevronLeft />
                  </IconButton>
                </DrawerHeader>
                <FilterAccordion disableGutters>
                  <AccordionSummary
                    expandIcon={<ExpandMore style={{ color: "white" }} />}
                  >
                    <Typography className="ff-label">Price</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid
                      container
                      wrap="nowrap"
                      alignItems="center"
                      spacing={1}
                      mb={2}
                    >
                      <Grid item xs={6}>
                        <TextField
                          label="Min"
                          color="bright"
                          type="number"
                          name="min"
                          variant="standard"
                          fullWidth
                          value={filter.min}
                          onChange={(e) =>
                            setFilter((v) => ({
                              ...v,
                              min: e.target.value ? +e.target.value : undefined,
                            }))
                          }
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Max"
                          color="bright"
                          type="number"
                          name="max"
                          variant="standard"
                          fullWidth
                          value={filter.max}
                          onChange={(e) =>
                            setFilter((v) => ({
                              ...v,
                              max: e.target.value ? +e.target.value : undefined,
                            }))
                          }
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </FilterAccordion>
                {/* <FilterAccordion disableGutters>
                  <AccordionSummary
                    expandIcon={<ExpandMore style={{ color: "white" }} />}
                  >
                    <Typography className="ff-label">Volume Range</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      select
                      // value={range}
                      label="Volume"
                      color="secondary"
                      style={{ minWidth: 200 }}
                      fullWidth
                    >
                      {rangeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </AccordionDetails>
                </FilterAccordion> */}
              </>
            ) : (
              <Grid
                container
                justifyContent="center"
                alignItems="start"
                py={1}
                height="100%"
              >
                <IconButton
                  onClick={() => setOpenFilter(true)}
                  color="secondary"
                >
                  <ChevronRight />
                </IconButton>
              </Grid>
            )}
          </Drawer>
          <Main open={openFilter}>
            <Grid
              display={selectedTab === 0 ? "flex" : "none"}
              container
              spacing={1}
            >
              {displayNfts.map((nft) => (
                <Grid item key={nft.token_id} xs={12} sm={6} md={4} lg={3}>
                  <Nft nft={nft} />
                </Grid>
              ))}
            </Grid>
            <Box display={selectedTab === 1 ? "block" : "none"}>
              <Activities activities={activities} showNFT />
            </Box>
          </Main>
        </Box>
      </Box>
    </div>
  ) : (
    <Grid container p={4}>
      <Typography color="white">
        The collection doesn't exist or something went wrong. Please try again
        later
      </Typography>
    </Grid>
  );
}
