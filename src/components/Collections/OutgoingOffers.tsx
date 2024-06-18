import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import { useScanApiContext } from "../../contexts/ScanApiContext";

import { useSnackbar } from "../../contexts/Snackbar";
import { useContracts } from "../../contexts/Web3Context";
import ApiService from "../../helper/api";
import { minimizeAddress, normalizeNFT } from "../../helper/utils";
import { IBid } from "../../types";

interface Props {
  address: string;
}

export default function OutgoingOffers({ address }: Props) {
  const { currency } = useContracts();
  const { getNftsByIds } = useScanApiContext();
  const [offers, setOffers] = useState<IBid[]>([]);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { chainId } = useAuthContext();

  useEffect(() => {
    setLoading(true);
    ApiService.getOutgoingOffers(address.toLowerCase(), chainId)
      .then(async (res) => {
        const data: IBid[] = await Promise.all(
          res.results.map(async (bid: IBid) => {
            const newBid = {
              ...bid,
              createdAt: moment(+bid.createdAtTimestamp * 1000).format(
                "MMM DD, YYYY"
              ),
            };
            if (newBid.token && newBid.token.image && newBid.token.name) {
              newBid.token = normalizeNFT(bid.token);
              return newBid;
            }

            try {
              const {
                data: [external],
              } = await getNftsByIds([
                {
                  tokenAddress: bid.token.tokenAddress,
                  tokenId: bid.token.tokenId,
                },
              ]);
              newBid.token.name = external.name;
              newBid.token.image = external.image;
            } catch (err) {
              console.error(err);
            }
            return newBid;
          })
        );
        setOffers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        showSnackbar({
          severity: "error",
          message: "Failed to load the offers",
        });
        setOffers([]);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [address, showSnackbar]);

  return (
    <>
      {loading ? (
        <Box py={3}>
          <CircularProgress color="secondary" />
        </Box>
      ) : offers.length ? (
        <></>
      ) : (
        <Typography color="white">No Incoming Offers</Typography>
      )}
      {offers.length > 0 && (
        <Paper>
          <TableContainer>
            <Table sx={{ width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell>Token</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Created At</TableCell>
                  <TableCell align="right">Owner</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((bid) => (
                  <TableRow
                    key={bid.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Grid container alignItems="center">
                        <img src={bid.token.image} alt="" width={48} />
                        <Link
                          to={`/nft/${bid.token.tokenAddress}/${bid.token.tokenId}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Typography ml={2} color="secondary">
                            {bid.token.name}
                          </Typography>
                        </Link>
                      </Grid>
                    </TableCell>
                    <TableCell align="right">
                      {bid.amount} {currency}
                    </TableCell>
                    <TableCell align="right">{bid.createdAt}</TableCell>
                    <TableCell align="right">
                      <Link
                        to={`/address/${bid.nftOwner.address}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Typography color="secondary">
                          {bid.nftOwner?.name ||
                            minimizeAddress(bid.nftOwner.address, 6, -4)}
                        </Typography>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );
}
