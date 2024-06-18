import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { useContracts } from "../../contexts/Web3Context";
import ApiService from "../../helper/api";
import { INft } from "../../types";
import { IComment } from "../../types/interfaces/Comment";

interface Props extends PropsWithChildren<any> {
  nft?: INft;
}

export const CommentsContext = createContext<{
  comments: IComment[];
  nft?: INft;
  fetchComments: () => void;
  deleteComment: (comment: IComment) => void;
  editComment: (commentId: number, content: string) => void;
  validator: boolean;
}>({
  comments: [],
  nft: undefined,
  fetchComments: () => null,
  deleteComment: (comment: IComment) => null,
  editComment: (commentId: number, content: string) => null,
  validator: false,
});

export const CommentsProvider = ({ children, nft }: Props) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [isValidator, setIsValidator] = useState(false);
  const {
    contracts: { validator },
  } = useContracts();
  const { address } = useAuthContext();

  const checkValidator = async () => {
    if (!validator) {
      return;
    }
    const res = await validator.methods.validators(address).call();
    setIsValidator(res);
  };

  const fetchComments = () => {
    if (!nft) {
      return;
    }
    ApiService.fetchComments(nft.tokenId, nft.tokenAddress).then((res) => {
      setComments(res.data);
    });
  };

  const deleteComment = async (comment: IComment) => {
    await ApiService.deleteComment(
      comment.id as number,
      validator ? address : ""
    );
    setComments(comments.filter((c) => c.id !== comment.id));
  };

  const editComment = async (commentId: number, content: string) => {
    await ApiService.updateComment(commentId, content);
    setComments(
      comments.map((c) => {
        if (c.id === commentId) {
          c.content = content;
        }
        return c;
      })
    );
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nft]);

  useEffect(() => {
    if (!address) {
      setIsValidator(false);
      return;
    }
    checkValidator();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <CommentsContext.Provider
      value={{
        nft,
        comments,
        fetchComments,
        deleteComment,
        editComment,
        validator: isValidator,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = () => useContext(CommentsContext);
