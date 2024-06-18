import { Redirect, useParams } from "react-router";
import NFT from "../components/NFT";

export default function NFTView() {
  const { contract } = useParams<any>();

  return contract ? <NFT /> : <Redirect to="/" />;
}
