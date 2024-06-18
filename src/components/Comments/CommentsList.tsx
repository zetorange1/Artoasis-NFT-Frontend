import { Grid } from "@mui/material";
import { useComments } from "./CommentsContext";
import { IComment } from "../../types/interfaces/Comment";
import Comment from "./Comment";

interface Props {
  parentComment?: IComment;
}

export default function CommentsList({ parentComment }: Props) {
  const { comments } = useComments();
  const displayComments = comments.filter((c) =>
    parentComment ? c.parent === parentComment.id : !c.parent
  );

  return (
    <Grid>
      {displayComments.map((c) => (
        <Comment key={c.created_at} comment={c} />
      ))}
    </Grid>
  );
}
