import { useEffect, useState } from "react";
import moment from "moment";
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import HelpIcon from "@mui/icons-material/HelpOutline";
import { styled } from "@mui/material/styles";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";

import { useContracts } from "../contexts/Web3Context";
import ApiService from "../helper/api";
import { minimizeAddress } from "../helper/utils";
import { Link } from "react-router-dom";

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

export const Track = () => {
  const { isOwner } = useContracts();
  const [loading, setLoading] = useState(false);
  const [trackData, setTrackData] = useState<any[]>([]);

  const fetchTrackData = async () => {
    setLoading(true);
    try {
      const { results: trackData } = await ApiService.getTrackAction();
      setTrackData(trackData);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isOwner) {
      setTrackData([]);
      return;
    }

    fetchTrackData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner]);

  return !isOwner ? (
    <Typography color="white">
      You dont have permission to view this page
    </Typography>
  ) : (
    <Grid container mb={3} justifyContent="space-between">
      {loading ? (
        <CircularProgress color="secondary" />
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Validator</TableCell>
                <TableCell align="center">Action</TableCell>
                <TableCell align="center">Target</TableCell>
                <TableCell align="center">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trackData.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row" align="center">
                    <Link
                      to={`/address/${row.actor}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography color="secondary">
                        {row.actor_name || minimizeAddress(row.actor, 6, -4)}
                      </Typography>
                    </Link>
                  </TableCell>
                  <TableCell align="center">{row.activity}</TableCell>
                  <TableCell align="center">
                    {row.target.startsWith("0x") ? (
                      <Link
                        to={`/nft/${row.target.split("_")[0]}/${
                          row.target.split("_")[1]
                        }`}
                        style={{ textDecoration: "none" }}
                      >
                        <Typography color="secondary">NFT</Typography>
                      </Link>
                    ) : (
                      <Grid container justifyContent="center">
                        <Grid item>
                          <Typography>Comment</Typography>
                        </Grid>
                        <Grid item>
                          <NoMaxWidthTooltip title={row.comment_content}>
                            <HelpIcon fontSize="small" />
                          </NoMaxWidthTooltip>
                        </Grid>
                      </Grid>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {moment(row.created_at).format("MM/DD/YYYY HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Grid>
  );
};

export default Track;
