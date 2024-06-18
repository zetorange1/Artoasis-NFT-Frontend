import {
  Box,
  CircularProgress,
  Grid,
  styled,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useMoralis } from "react-moralis";
import Web3 from "web3";

import { INft, NftStatus } from "../../types";
import { normalizeNFT, parseMoralisNFT } from "../../helper/utils";
import { Collection } from "./Collection";
import ApiService from "../../helper/api";
import Profile from "./Profile";
import { FavoritesList } from "./FavoritesList";
import IncomingOffers from "./IncomingOffers";
import OutgoingOffers from "./OutgoingOffers";
import { useScanApiContext } from "../../contexts/ScanApiContext";
import { useAuthContext } from "../../contexts/AuthContext";

const ProfileTab = styled(Tab)({
  fontFamily: "Rubik !important",
});

export const MyCollections = () => {
  const { fillNFTMetadata } = useScanApiContext();
  const { address: userAddress, chainId } = useAuthContext();
  const { address: addressParam } = useParams<any>();

  const [userLoading, setUserLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [collection, setCollection] = useState<INft[]>([]);
  const [creations, setCreations] = useState<INft[]>([]);
  const [user, setUser] = useState<any>();
  const [editing, setEditing] = useState(false);
  const { Moralis } = useMoralis();

  const currentAddress = useMemo(
    () => addressParam || userAddress,
    [addressParam, userAddress]
  );

  const isMine = useMemo(
    () => userAddress?.toLowerCase() === currentAddress?.toLowerCase(),
    [userAddress, currentAddress]
  );

  const fetchUser = async () => {
    console.log("Fetching User..");
    setUserLoading(true);

    try {
      const res = await ApiService.getUser(currentAddress);
      setUser({
        ...res.data,
        favorited_list: res.data.favorited_list,
      });
    } catch (err: any) {
      console.error(err?.response);
      setUser({
        address: currentAddress,
        name: "",
        favorited_list: [],
        avatar: null,
      });
    }
    setUserLoading(false);
  };

  const fetchNfts = async () => {
    setCollection([]);
    setCreations([]);
    setLoading(true);

    try {
      let [moralisRes, { results: appNFTs }, { results: creations }] =
        await Promise.all([
          Moralis.Web3API.account.getNFTs({
            chain: Web3.utils.toHex(+chainId) as any,
            address: currentAddress,
          }),
          ApiService.filterNftsByAddress(
            currentAddress,
            isMine ? "" : NftStatus.APPROVED,
            chainId
          ),
          ApiService.filterNftsByCreator(
            currentAddress,
            isMine ? "" : NftStatus.APPROVED,
            chainId
          ),
        ]);

      const moralisNFTs = await Promise.all(
        moralisRes.result
          ? moralisRes.result?.map((nft) => parseMoralisNFT(nft))
          : []
      );

      console.log("Moralis:", moralisNFTs);

      appNFTs = appNFTs.map((c) => normalizeNFT(c));

      let owned = moralisNFTs
        .map((nft) => {
          const existing = appNFTs.find((n) => n.id === nft.id);
          const r = existing || nft;

          if (isMine) {
            if (!existing) {
              r.status = NftStatus.PENDING;
            }
          } else {
            if (!existing) {
              return null;
            }
          }
          return r;
        })
        .filter(Boolean);
      owned = await Promise.all(
        owned.map((nft) => fillNFTMetadata(nft.tokenAddress, nft.tokenId, nft))
      );
      creations = creations.map((c) => normalizeNFT(c));
      setCollection(owned);
      setCreations(creations);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const saveProfile = () => {
    setEditing(false);
    ApiService.updateUser(userAddress, {
      name: user.name,
    });
  };

  const updateAvatar = (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    ApiService.updateUser(userAddress, formData)
      .then((user) => setUser(user.data))
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchData = () => {
    fetchNfts();
    fetchUser();
  };

  const onFavorite = (nft: INft) => {
    fetchUser();
  };

  useEffect(() => {
    if (!chainId || isNaN(chainId)) {
      return;
    }

    if (!currentAddress) {
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAddress, chainId]);

  const favoritesList = useMemo(
    () =>
      user?.favorited_list?.filter((item) => +item.chain_id === +chainId) || [],
    [user, chainId]
  );

  return !user ? (
    !userLoading ? (
      <Typography fontSize={28} mt={2} color="white">
        User doesn't exist
      </Typography>
    ) : (
      <Grid container p={4} justifyContent="center">
        <CircularProgress color="secondary" />
      </Grid>
    )
  ) : (
    <Box mt={4} py={4}>
      <Grid container alignItems="center" justifyContent="center" mb={4}>
        <Profile
          user={user}
          address={currentAddress}
          currentUserAddress={userAddress}
          editing={editing}
          setEditing={setEditing}
          saveProfile={saveProfile}
          onUpdate={setUser}
          updateAvatar={updateAvatar}
          onRefresh={fetchData}
        />
      </Grid>
      <Tabs
        indicatorColor="secondary"
        value={tab}
        onChange={(e, v) => setTab(v)}
        scrollButtons="auto"
        variant="scrollable"
        allowScrollButtonsMobile
        TabScrollButtonProps={{
          style: {
            color: "white",
          },
        }}
      >
        <ProfileTab label={`Owned ${collection.length}`} value={0} />
        <ProfileTab label={`Created ${creations.length}`} value={1} />
        <ProfileTab label={`Favorites ${favoritesList.length}`} value={2} />
        <ProfileTab label={"Offers Received"} value={3} />
        <ProfileTab label={"Offers Sent"} value={4} />
      </Tabs>
      <Box mt={2}>
        {tab === 0 && (
          <Collection
            nfts={collection}
            loading={loading}
            onFavorite={onFavorite}
            showStatus={isMine}
          />
        )}
        {tab === 1 && (
          <Collection
            nfts={creations}
            loading={loading}
            onFavorite={onFavorite}
            showStatus={isMine}
          />
        )}
        {tab === 2 && (
          <FavoritesList favorites={favoritesList} onFavorite={onFavorite} />
        )}
        {tab === 3 && <IncomingOffers address={currentAddress} />}
        {tab === 4 && <OutgoingOffers address={currentAddress} />}
      </Box>
    </Box>
  );
};

export default MyCollections;
