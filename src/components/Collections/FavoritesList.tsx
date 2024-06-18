import { useEffect, useState } from "react";
import { INft } from "../../types";
import { Collection } from "./Collection";
import { useScanApiContext } from "../../contexts/ScanApiContext";
import ApiService from "../../helper/api";
import { mixNFTMetadatas, normalizeNFT } from "../../helper/utils";
import { useAuthContext } from "../../contexts/AuthContext";

interface Props {
  favorites: {
    token_address: string;
    token_id: number;
  }[];
  onFavorite: (nft: INft) => void;
}

export const FavoritesList = ({
  favorites,
  onFavorite = () => null,
}: Props) => {
  const { getNftsByIds } = useScanApiContext();
  const [nfts, setNfts] = useState<INft[]>([]);
  const [loading, setLoading] = useState(false);
  const { chainId } = useAuthContext();

  const fetchNFTs = async () => {
    setLoading(true);

    try {
      const { data: entities } = await getNftsByIds(
        favorites.map((f) => ({
          tokenAddress: f.token_address,
          tokenId: f.token_id,
        }))
      );

      const nfts = await Promise.all(
        favorites.map((f) =>
          ApiService.getNft({
            token_id: f.token_id,
            token_address: f.token_address,
            chainId,
          })
            .then((res) => res.results[0])
            .catch(() => null)
        )
      );
      const result = mixNFTMetadatas(
        nfts.filter(Boolean).map(normalizeNFT),
        entities,
        true
      );
      console.log(result);

      setNfts(result as INft[]);
    } catch (err) {
      console.error(err);
      setNfts([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites]);

  return <Collection loading={loading} nfts={nfts} onFavorite={onFavorite} />;
};
