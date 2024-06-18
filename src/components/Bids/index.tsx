import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import moment from "moment";
import { Link } from "react-router-dom";

import { INft, IBid } from "../../types";
import { minimizeAddress } from "../../helper/utils";
import { useContracts } from "../../contexts/Web3Context";

interface Props {
  nft: INft;
  address: string;
  accept: (bid: IBid) => void;
  cancel: (bid: IBid) => void;
  loading: boolean;
}

export default function Bids({ nft, address, accept, cancel, loading }: Props) {
  const bids = nft.currentBid ? [nft.currentBid] : [];
  const owner = address?.toLowerCase() === nft.owner?.toLowerCase();
  const { currency } = useContracts();

  return (
    <TableContainer>
      <Table sx={{ width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell>Price</TableCell>
            <TableCell align="right">Created</TableCell>
            <TableCell align="right">From</TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bids.map((bid) => (
            <TableRow
              key={bid.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {bid.amount} {currency}
              </TableCell>
              <TableCell align="right">
                {moment(+bid.createdAtTimestamp * 1000).format("MMM DD, YYYY")}
              </TableCell>
              <TableCell align="right">
                <Link
                  to={`/address/${bid.bidder.address}`}
                  style={{ textDecoration: "none" }}
                >
                  <Typography color="secondary">
                    {bid.bidder.name ||
                      minimizeAddress(bid.bidder.address, 6, -4)}
                  </Typography>
                </Link>
              </TableCell>
              <TableCell align="right">
                {owner ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={loading}
                    onClick={() => accept(bid)}
                  >
                    Accept
                  </Button>
                ) : (
                  bid.bidder.address.toLowerCase() ===
                    address?.toLowerCase() && (
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={loading}
                      onClick={() => cancel(bid)}
                    >
                      Cancel
                    </Button>
                  )
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
