import {
  Grid,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import moment from "moment";

import { IActivity } from "../../types";
import { minimizeAddress, sameAddress } from "../../helper/utils";
import { Link } from "react-router-dom";
import { memo, useState } from "react";
import { useContracts } from "../../contexts/Web3Context";

interface Props {
  activities: IActivity[];
  showNFT?: boolean;
}

export default memo(({ activities, showNFT = false }: Props) => {
  const [page, setPage] = useState(1);
  const { marketContractAddress, currency } = useContracts();

  const onPageChange = (event: React.ChangeEvent<unknown>, selPage: number) => {
    setPage(selPage);
  };

  return activities.length ? (
    <TableContainer>
      <Table sx={{ width: "100%" }}>
        <TableHead>
          <TableRow>
            <TableCell>Event</TableCell>
            {showNFT && <TableCell align="right">Item</TableCell>}
            <TableCell align="right">From</TableCell>
            <TableCell align="right">To</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity) => (
            <TableRow
              key={activity.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Typography fontSize={12}>{activity.event}</Typography>
              </TableCell>
              {showNFT && (
                <TableCell align="right">
                  <Grid container alignItems="center" justifyContent="flex-end">
                    <img src={activity.token.image} alt="" width={48} />
                    <Link
                      to={`/nft/${activity.token.tokenAddress}/${activity.token.tokenId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography
                        ml={2}
                        color="secondary"
                        className="ff-primary"
                      >
                        {activity.token.name}
                      </Typography>
                    </Link>
                  </Grid>
                </TableCell>
              )}
              <TableCell align="right">
                {sameAddress(activity.fromUser, marketContractAddress) ? (
                  <Typography color="secondary">Contract</Typography>
                ) : (
                  <Link
                    to={`/address/${activity.fromUser}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography color="secondary" className="ff-primary">
                      {minimizeAddress(activity.fromUser, 6, -4)}
                    </Typography>
                  </Link>
                )}
              </TableCell>
              <TableCell align="right">
                {activity.toUser && (
                  <Link
                    to={`/address/${activity.toUser}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography color="secondary" className="ff-primary">
                      {minimizeAddress(activity.toUser, 6, -4)}
                    </Typography>
                  </Link>
                )}
              </TableCell>
              <TableCell align="right" className="ff-primary">
                {activity.amount ? `${activity.amount} ${currency}` : ""}
              </TableCell>
              <TableCell align="right" className="ff-primary">
                {moment(+activity.createdAtTimestamp * 1000).format(
                  "MMM DD, YYYY HH:mm"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Stack spacing={2} alignItems="center" mt={3}>
        <Pagination
          count={1}
          page={page}
          onChange={onPageChange}
          variant="outlined"
          shape="rounded"
          showFirstButton
          showLastButton
          color="secondary"
        />
      </Stack>
    </TableContainer>
  ) : (
    <>No records</>
  );
});
