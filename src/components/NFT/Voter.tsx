import { Button, ButtonGroup, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";

import ApiService from "../../helper/api";
import { useAuthContext } from "../../contexts/AuthContext";

interface Props {
  tokenId: string;
  tokenAddress: string;
}

export default function Voter({ tokenAddress, tokenId }: Props) {
  const [votes, setVotes] = useState<any[]>([]);
  const { address } = useAuthContext();

  const fetchVotes = () => {
    ApiService.getNftVotes(tokenId, tokenAddress).then((res) => {
      setVotes(res.data);
    });
  };

  useEffect(() => {
    fetchVotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId, tokenAddress]);

  const vote = (upvote: boolean) => {
    if (!address) {
      return;
    }
    try {
      ApiService.voteNft(tokenId, tokenAddress, address, upvote).then(() => {
        fetchVotes();
      });
    } catch (err) {
      console.error(err);
    }
  };

  const rating =
    votes.filter((v) => v.upvote).length -
    votes.filter((v) => !v.upvote).length;

  return (
    <ButtonGroup variant="contained" style={{ marginTop: 12 }} fullWidth>
      <Button style={{ background: "white" }} onClick={() => vote(true)}>
        <ThumbUpAltIcon color="success" />
      </Button>
      <Button style={{ background: "white", color: "black" }}>
        <Typography color="primary" className="ff-primary">
          {rating}
        </Typography>
      </Button>
      <Button style={{ background: "white" }} onClick={() => vote(false)}>
        <ThumbDownAltIcon color="error" />
      </Button>
    </ButtonGroup>
  );
}
