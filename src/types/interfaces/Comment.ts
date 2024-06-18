export interface IComment {
  id: number;
  content: string;
  token_address: string;
  token_id: string;
  parent: number;
  author: string;
  author_detail: {
    address: string;
    avatar: string;
    name: string;
  };
  created_at: string;
  downvotes_count: number;
  upvotes_count: number;
  reply_count: number;
  is_voted: boolean;
}
