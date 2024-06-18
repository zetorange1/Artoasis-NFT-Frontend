import { useEffect, useState } from "react";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import useInfiniteScroll from "react-infinite-scroll-hook";

import { useContracts } from "../../contexts/Web3Context";
import { normalizeNFT } from "../../helper/utils";
import ApiService from "../../helper/api";
import Filter from "./Filter";
import { INft, NftStatus } from "../../types";
import Nft from "../Collections/Nft";
import { useScanApiContext } from "../../contexts/ScanApiContext";
import { useAuthContext } from "../../contexts/AuthContext";

export const Explorer = () => {
  const { nftContractAddress } = useContracts();
  const { chainId } = useAuthContext();
  const { getNftsByIds } = useScanApiContext();
  const [nfts, setNfts] = useState<INft[]>([]);
  const [nftsCount, setNftsCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ min: 0, max: 0, category_ids: "" });

  const normalizeExternalNfts = async (allNfts) => {
    const { data: externalNfts } = await getNftsByIds(
      allNfts
        .filter(
          (nft) =>
            nft.token_address.toLowerCase() !== nftContractAddress.toLowerCase()
        )
        .map((nft) => {
          return { tokenAddress: nft.token_address, tokenId: nft.token_id };
        })
    );
    externalNfts.forEach((externalNft: any) => {
      let nft: any = allNfts.find((el: any) => el.id === externalNft.id);

      if (nft) {
        nft.name = externalNft.name;
        nft.description = externalNft.description;
        nft.image = externalNft.image;
      }
    });
    return allNfts;
  };

  const fetchNfts = async () => {
    setLoading(true);
    await fetchFilteredNfts(filter.min, filter.max, filter.category_ids);
    setLoading(false);
  };

  const fetchFilteredNfts = async (
    min,
    max,
    category_ids,
    page = 1,
    refresh = true
  ) => {
    if (!chainId || isNaN(chainId)) {
      return;
    }
    setLoading(true);

    try {
      const {
        results: apiNfts,
        count: nfts_count,
        next,
      } = await ApiService.filterNftsAPI(
        min,
        max,
        category_ids,
        parseInt(chainId),
        page,
        false,
        true,
        NftStatus.APPROVED
      );

      const filteredNfts = apiNfts.map((nft) => normalizeNFT(nft));

      const normalizedNfts = await normalizeExternalNfts(filteredNfts);

      if (refresh) {
        setNfts(normalizedNfts);
      } else {
        const loadedNfts = [...nfts, ...normalizedNfts];
        setNfts(loadedNfts);
      }
      setHasNextPage(next !== null);
      setNftsCount(nfts_count);
      setFilter({
        min,
        max,
        category_ids,
      });
      setPage(page);
    } catch (err) {
      console.error(err);
      setHasNextPage(false);
    }
    setLoading(false);
  };

  const apply = (filter, categories) => {
    const category_ids = categories.join(",");
    fetchFilteredNfts(filter.min, filter.max, category_ids);
  };

  const loadMoreNft = () => {
    const nextPage = page + 1;
    fetchFilteredNfts(
      filter.min,
      filter.max,
      filter.category_ids,
      nextPage,
      false
    );
  };

  useEffect(() => {
    if (!chainId || isNaN(chainId)) {
      return;
    }
    fetchNfts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  const [infiniteRef] = useInfiniteScroll({
    loading,
    hasNextPage: hasNextPage,
    onLoadMore: loadMoreNft,
  });

  return (
    <Box>
      <Box component="main" p={3}>
        <Grid container alignItems="center" justifyContent="flex-end" mb={3}>
          <Filter apply={apply} />
        </Grid>
        <Grid container alignItems="center" mb={3}>
          {!loading && (
            <Typography color="white">{nftsCount} results</Typography>
          )}
        </Grid>

        <Grid container spacing={1}>
          {nfts.map((nft) => (
            <Grid
              item
              key={`${nft.tokenId}-${nft.tokenAddress}`}
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <Nft nft={nft} />
            </Grid>
          ))}

          {hasNextPage && (
            <Grid
              container
              py={3}
              justifyContent="center"
              alignItems="center"
              ref={infiniteRef}
            >
              {loading && <CircularProgress color="secondary" />}
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Explorer;
