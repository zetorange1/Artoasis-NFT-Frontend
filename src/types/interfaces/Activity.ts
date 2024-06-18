import { INft } from "./Nft";
// import { IUser } from "./User";

export interface IActivity {
  id: string;
  createdAtTimestamp: string;
  event: string;
  fromUser: string;
  toUser: string;
  token: INft;
  amount: string;
}
