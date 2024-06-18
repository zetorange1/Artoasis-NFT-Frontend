import { NftStatus } from "../enums";
import { IBid } from "./Bid";
import { IUser } from "./User";

export interface INft {
  id: string;
  tokenId: string;
  token_id: string;
  tokenAddress: string;
  token_address: string;
  name: string;
  description?: string;
  image?: string;
  json?: string;
  owner: string;
  creator: IUser;
  createdAtTimestamp: string;
  status: NftStatus;
  validator?: string;
  currentBid: IBid;
  tokenURI: string;
  favorites: any[];
  category: { name: string; id: number }[];
  reported: boolean;
  price: number;
}

// class NFTMetadata implements INft {
//   id: string = '';
//   tokenId!: string = '';
//   token_id!: string =;
//   tokenAddress!: string;
//   token_address!: string;
//   name!: string;
//   description?: string;
//   image?: string;
//   json?: string;
//   owner!: string;
//   creator!: IUser;
//   createdAtTimestamp!: string;
//   status!: NftStatus;
//   validator?: string;
//   currentBid: IBid;
//   tokenURI: string;
//   favorites: any[];
//   category: { name: string; id: number }[];
//   reported: boolean;
//   price: number;
// }
