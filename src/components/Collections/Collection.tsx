import { CircularProgress, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import ApiService from "../../helper/api";
import { INft } from "../../types";
import Nft from "./Nft";

interface Props {
  nfts: INft[];
  loading?: boolean;
  onFavorite?: (nft: INft) => void;
  showStatus?: boolean;
}

const REPORT_LIMIT = 4;

export function Collection({
  nfts,
  loading = false,
  onFavorite = () => null,
  showStatus,
}: Props) {
  const [updatedNfts, setUpdatedNfts] = useState<any[]>([]);
  const { address, chainId } = useAuthContext();
  const { address: addressParam } = useParams<any>();
  const isMine = address?.toLowerCase() === addressParam?.toLowerCase();

  const fetchReportedNFTs = async () => {
    const reportedNfts = await ApiService.getReportedNfts(chainId);

    let updatedNfts =
      reportedNfts && reportedNfts.reports
        ? nfts.map((nft) => {
            for (const reportedNft of reportedNfts.reports) {
              if (
                reportedNft.count >= REPORT_LIMIT &&
                nft.tokenAddress.toLowerCase() ===
                  reportedNft.token_address.toLowerCase() &&
                nft.tokenId === reportedNft.token_id
              ) {
                nft.reported = true;
              }
            }
            return nft;
          })
        : nfts;

    if (!isMine) {
      updatedNfts = updatedNfts.filter((nft) => nft.reported !== true);
    }
    setUpdatedNfts(updatedNfts);
  };

  useEffect(() => {
    if (!chainId || isNaN(chainId)) {
      return;
    }
    fetchReportedNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfts, chainId]);

  return (
    <>
      {loading && (
        <Grid container py={3} justifyContent="center" alignItems="center">
          <CircularProgress color="secondary" />
        </Grid>
      )}
      <Grid container spacing={1}>
        {updatedNfts.map((nft) => (
          <Grid item key={nft.id} xs={12} sm={6} md={4} lg={3}>
            <Nft
              onFavorite={() => onFavorite(nft)}
              nft={nft}
              showStatus={showStatus}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
