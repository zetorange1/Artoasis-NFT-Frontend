import { Box, Grid, Typography } from "@mui/material";
import { INft } from "../../types";
import CommentInput from "./CommentInput";
import { CommentsContext, CommentsProvider } from "./CommentsContext";
import CommentsList from "./CommentsList";

interface Props {
  nft?: INft;
  currentUser: string;
}

export default function Comments({ nft, currentUser }: Props) {
  return (
    <CommentsProvider nft={nft}>
      {currentUser && nft && (
        <CommentInput tokenId={nft?.tokenId} tokenAddress={nft?.tokenAddress} />
      )}
      <Box mt={3}>
        <CommentsContext.Consumer>
          {({ comments }) =>
            comments.filter((c) => !c.parent).length ? (
              <Grid container borderBottom={"1px solid white"} pb={1} mb={2}>
                <Typography color="white" variant="h6">
                  {comments.filter((c) => !c.parent).length} Comments
                </Typography>
              </Grid>
            ) : (
              <></>
            )
          }
        </CommentsContext.Consumer>
        <CommentsList parentComment={undefined} />
      </Box>
    </CommentsProvider>
  );
}
