import axios from "axios";
import { config } from "../config";
import { IComment } from "../types/interfaces/Comment";

const ApiInstance = axios.create({
  headers: {
    contentType: "application/json",
    "Access-Control-Allow-Origin": "*",
    "Origin-Url": window.location.href,
  },
  baseURL: config.backendUrl,
});

ApiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      if (config?.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const ApiService = {
  getToken(address) {
    const formData = new FormData();
    formData.append("address", address);
    return axios.post(`${config.backendUrl}/getToken`, formData).then((res) => {
      localStorage.setItem("token", res.data.access_token);
    });
  },
  getCategories() {
    return ApiInstance.get(`/categories/`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.error(err);
      });
  },
  filterNftsAPI(
    min,
    max,
    categories,
    chainId,
    page = 1,
    include_report = false,
    has_price = true,
    status?
  ) {
    return ApiInstance.get(`/nfts/`, {
      params: {
        min,
        max,
        categories,
        chainId,
        page,
        include_report,
        has_price,
        status: status || "",
      },
    })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.error(err);
      });
  },
  filterNftsByAddress(owner: string, status: string, chainId: string) {
    return ApiInstance.get(`/nfts/`, {
      params: {
        owner,
        has_price: false,
        status: status || null,
        chainId,
      },
    }).then((res) => {
      return res.data;
    });
  },
  filterNftsByCreator(creator: string, status: string, chainId: string) {
    return ApiInstance.get(`/nfts/`, {
      params: {
        creator,
        has_price: false,
        status: status || null,
        chainId,
      },
    }).then((res) => {
      return res.data;
    });
  },
  createNft(token_address, token_id, price, category) {
    return ApiInstance.post(`/nfts/`, {
      token_address,
      token_id,
      price,
      category,
    })
      .then(() => {})
      .catch((err) => {
        console.error(err);
      });
  },
  getNft(token) {
    return ApiInstance.get(`/nfts/`, {
      params: token,
    })
      .then((res) => res.data)
      .catch((err) => Promise.reject(err));
  },
  getReportedNfts(chainId: string) {
    return ApiInstance.get("/reports/", {
      params: {
        chainId,
      },
    })
      .then((res) => res.data)
      .catch((err) => {
        console.error(err);
      });
  },
  reportNft(token_address, token_id, reporter, reason, other) {
    return ApiInstance.post(`/reports/`, {
      token_address,
      token_id,
      reporter,
      reason,
      other,
    })
      .then(() => {})
      .catch((err) => {
        console.error(err);
      });
  },
  getUser(address) {
    return ApiInstance.get(`/users/${address}`)
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  createUser(address) {
    return ApiInstance.post("/users/", { address })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  updateUser(address, data) {
    return ApiInstance.put(`/users/${address}/`, data)
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  getFavorites(token) {
    return ApiInstance.get(`/favorites/`, {
      params: token,
    })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  delFavorite(token, address) {
    return ApiInstance.delete(`/favorites/`, {
      params: { ...token, user: address },
    })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  postFavorite(token, address, chain_id) {
    return ApiInstance.post(`/favorites/`, {
      ...token,
      users: [address],
      chain_id,
    })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  submitCategory(token, category) {
    return ApiInstance.post("/nfts/", {
      ...token,
      action: "update",
      category,
    })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  submitPrice(token, price) {
    return ApiInstance.post("/nfts/", {
      ...token,
      action: "update_price",
      price,
    })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  submitReport(token, reporter, reason, other) {
    return ApiInstance.post("/reports/", {
      ...token,
      reporter,
      reason,
      other,
    })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  getVisits(token) {
    return ApiInstance.get("/visits/", { params: token })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  submitVisit(token, visitor) {
    return ApiInstance.post("/visits/", {
      ...token,
      visitor,
    })
      .then((res) => res)
      .catch((err) => Promise.reject(err));
  },
  fetchComments(token_id: string, token_address: string) {
    return ApiInstance.get("/comments/", {
      params: {
        token_id,
        token_address,
      },
    });
  },
  createComment(comment: IComment) {
    return ApiInstance.post("/comments/", comment);
  },
  deleteComment(commentId: number, deleter: string = "") {
    if (deleter) {
      return ApiInstance.delete(`/comments/${commentId}/`, {
        params: { deleter },
      });
    }
    return ApiInstance.delete(`/comments/${commentId}/`);
  },
  updateComment(commentId: number, content: string) {
    return ApiInstance.patch(`/comments/${commentId}/`, {
      content,
    });
  },
  voteComment(voter: string, comment: number, upvote: boolean) {
    return ApiInstance.post("/votecomment/", {
      voter,
      comment,
      upvote,
    });
  },
  getComment(commentId: number) {
    return ApiInstance.get(`/comments/${commentId}/`);
  },
  getCommentVotes(commentId: number) {
    return ApiInstance.get("/votecomment/", {
      params: {
        comment: commentId,
      },
    });
  },
  getNftVotes(token_id: string, token_address: string) {
    return ApiInstance.get("/votenft/", {
      params: {
        token_id,
        token_address,
      },
    });
  },
  voteNft(
    token_id: string,
    token_address: string,
    voter: string,
    upvote: boolean
  ) {
    return ApiInstance.post("/votenft/", {
      token_id,
      token_address,
      voter,
      upvote,
    });
  },
  getTrackAction() {
    return ApiInstance.get("/trackaction/").then((res) => res.data);
  },
  postTrackAction(
    actor: string,
    activity: string,
    tokenAddresses: string[],
    tokenIds: string[]
  ) {
    return ApiInstance.post("/trackaction/", {
      actor,
      activity,
      token_addresses: tokenAddresses,
      token_ids: tokenIds,
    }).then((res) => res);
  },
  createCollection: (data) =>
    ApiInstance.post("/collection/", data).then((res) => res.data),
  listCollection: (chainId: string) =>
    ApiInstance.get("/collection", {
      params: {
        chainId,
      },
    }).then((res) => res.data),
  getCollectionsByAddresses: (addresses: string[]) =>
    ApiInstance.get("/collection", {
      params: {
        addresses: addresses.join(","),
      },
    }).then((res) => res.data),
  getCollection: (address: string) =>
    ApiInstance.get(`/collection/${address}/`).then((res) => res.data),
  getCollectionActivities: (collectionAddress: string) =>
    ApiInstance.get("/activity/", {
      params: { token_address: collectionAddress },
    }).then((res) => res.data.results),
  getCollectionNFTs: (collectionAddress: string) =>
    ApiInstance.get("/nfts/", {
      params: { token_address: collectionAddress },
    }).then((res) => res.data.results),
  getActivitiesForNft: (token_id: string, token_address: string) =>
    ApiInstance.get("/activity/", {
      params: {
        token_id,
        token_address,
      },
    }).then((res) => res.data),
  getBidsForNft: (token_id: string, token_address: string) =>
    ApiInstance.get("/bid/", {
      params: {
        token_id,
        token_address,
      },
    }).then((res) => res.data),
  getIncomingOffers: (nftOwner: string, chainId: string) =>
    ApiInstance.get("/bid/", {
      params: {
        nftOwner,
        chainId,
      },
    }).then((res) => res.data),
  getOutgoingOffers: (bidder: string, chainId: string) =>
    ApiInstance.get("/bid/", {
      params: {
        bidder,
        chainId,
      },
    }).then((res) => res.data),
  getFavoritedNFTs: (userAddress: string, chainId: string) =>
    ApiInstance.get("").then((res) => res.data),
  getValidators: () => ApiInstance.get("/validator/").then((res) => res.data),
};

export default ApiService;
