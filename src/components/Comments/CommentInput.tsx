import { Box, Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useSnackbar } from "../../contexts/Snackbar";
import ApiService from "../../helper/api";
import { IComment } from "../../types/interfaces/Comment";
import { useComments } from "./CommentsContext";

interface Props {
  text?: string;
  parent?: IComment;
  tokenAddress: string;
  tokenId: string;
  onCommentSave?: () => void;
  onCancel?: () => void;
}

export default function CommentInput({
  text = "",
  parent,
  tokenAddress,
  tokenId,
  onCommentSave,
  onCancel,
}: Props) {
  const [value, setValue] = useState(text);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { address } = useAuthContext();
  const { fetchComments } = useComments();

  const onSave = async (text: string) => {
    setLoading(true);

    try {
      await ApiService.createComment({
        token_address: tokenAddress,
        token_id: tokenId,
        parent: parent ? parent.id : "",
        content: text,
        author: address,
      } as any);

      if (onCommentSave) {
        onCommentSave();
      }
      setValue("");
      fetchComments();
    } catch (err) {
      console.error(err);
      showSnackbar({
        severity: "error",
        message: "Failed to leave a comment",
      });
    }
    setLoading(false);
  };

  return (
    <Box borderRadius={1} style={{ backgroundColor: "#000" }}>
      <Box p={2} pt={2}>
        <TextField
          multiline
          rows={3}
          autoFocus
          value={value}
          label="Write a comment"
          fullWidth
          color="secondary"
          variant="standard"
          onChange={(e) => setValue(e.target.value)}
        />
        <Grid container justifyContent="flex-end" mt={1}>
          {parent && (
            <Button
              variant="outlined"
              size="large"
              onClick={() => (onCancel ? onCancel() : null)}
              style={{ marginRight: "12px" }}
            >
              Cancel
            </Button>
          )}
          <Button
            disabled={!value || loading}
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => onSave(value)}
          >
            Post
          </Button>
        </Grid>
      </Box>
    </Box>
  );
}
