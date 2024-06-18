import { INft } from "./Nft";
import { IUser } from "./User";

export interface IBid {
  id: string;
  bidder: IUser;
  amount: string;
  token: INft;
  nftOwner: IUser;
  createdAtTimestamp: string;

  // only on frontend
  createdAt: string; // formated string of createdAtTimestamp
}
