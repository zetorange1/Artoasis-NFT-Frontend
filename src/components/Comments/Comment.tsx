import {
  Avatar,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import ThumbUpOffAlt from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";

import moment from "moment";
import { useState } from "react";

import { minimizeAddress, sameAddress } from "../../helper/utils";
import { IComment } from "../../types/interfaces/Comment";
import { useAuthContext } from "../../contexts/AuthContext";
import CommentInput from "./CommentInput";
import CommentsList from "./CommentsList";
import ApiService from "../../helper/api";
import { useComments } from "./CommentsContext";

interface Props {
  comment: IComment;
}

export default function Comment({ comment }: Props) {
  const { address, connect } = useAuthContext();
  const [showReply, setShowReply] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const [rating, setRating] = useState(
    comment ? comment.upvotes_count - comment.downvotes_count : 0
  );
  const [loading, setLoading] = useState(false);
  const { deleteComment, validator } = useComments();

  const toggleReply = () => {
    if (address) {
      setShowReply(true);
    } else {
      connect();
    }
  };

  const onDeleteComment = async () => {
    setLoading(true);

    try {
      await deleteComment(comment);
    } catch (err) {}
    setLoading(false);
  };

  const vote = async (upvote: boolean) => {
    if (!comment || !address) {
      return;
    }
    await ApiService.voteComment(address, comment.id as number, upvote);
    const { data } = await ApiService.getComment(comment.id);
    setRating(data.upvotes_count - data.downvotes_count);
  };

  return (
    <Box
      py={1}
      pt={2}
      borderBottom={comment.parent ? "" : "1px solid rgba(255,255,255,0.3)"}
      pl={comment.parent ? 2 : 0}
    >
      <Grid container alignItems="center" spacing={1} mb={2}>
        <Grid item>
          {comment.author_detail?.avatar ? (
            <Avatar
              sx={{ width: 24, height: 24 }}
              src={comment.author_detail.avatar}
            />
          ) : (
            <Avatar sx={{ width: 24, height: 24 }}>
              <PersonIcon fontSize="small" />
            </Avatar>
          )}
        </Grid>
        <Grid item>
          <Link
            to={`/address/${comment.author}`}
            style={{ textDecoration: "none" }}
          >
            <Typography color="secondary">
              {comment.author_detail?.name ||
                minimizeAddress(comment.author, 6, -4)}
            </Typography>
          </Link>
        </Grid>
        <Grid item ml={2}>
          <Typography color="white" variant="caption">
            {moment(comment.created_at).format("MM/DD/YYYY HH:mm")}
          </Typography>
        </Grid>
        {loading && (
          <Grid item ml={2}>
            <CircularProgress color="secondary" />
          </Grid>
        )}
      </Grid>

      <Box
        borderLeft={comment.parent ? "1px solid rgba(255,255,255,0.1)" : ""}
        pl={comment.parent ? 2 : 0}
        ml={comment.parent ? "10px" : 0}
      >
        <Typography color="white">{comment.content}</Typography>
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          mt={1}
        >
          <Grid item>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => vote(true)}
                >
                  <ThumbUpOffAlt fontSize="small" />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography color="white">{rating}</Typography>
              </Grid>
              <Grid item>
                <IconButton
                  size="small"
                  color="secondary"
                  onClick={() => vote(false)}
                >
                  <ThumbDownOffAltIcon fontSize="small" />
                </IconButton>
              </Grid>
              {!!comment.reply_count && (
                <Grid item>
                  <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    onClick={() => setShowChildren(!showChildren)}
                  >
                    {showChildren ? "Collapse Replies" : "Expand Replies"}{" "}
                    {comment.reply_count}
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item>
            <Grid container alignItems="center" spacing={2}>
              {(sameAddress(address, comment.author) || validator) && (
                <>
                  <Grid item>
                    <Button
                      color="error"
                      onClick={onDeleteComment}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </Grid>
                </>
              )}
              {!showReply && (
                <Grid item>
                  <Button
                    color="secondary"
                    onClick={toggleReply}
                    disabled={loading}
                  >
                    Reply
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
        {showReply && (
          <Box pl={3} mt={2}>
            <CommentInput
              tokenId={comment.token_id}
              tokenAddress={comment.token_address}
              parent={comment}
              onCommentSave={() => setShowReply(false)}
              onCancel={() => setShowReply(false)}
            />
          </Box>
        )}
        {showChildren && (
          <Box mt={3}>
            <CommentsList parentComment={comment} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
