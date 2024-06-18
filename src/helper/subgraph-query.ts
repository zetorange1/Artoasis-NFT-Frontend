import { ApolloClient, gql } from "@apollo/client";
import { INft, IUser, NftStatus } from "../types";

const NFT_FIELDS = gql`
  fragment nftFields on Nft {
    id
    tokenId
    tokenAddress
    name
    description
    image
    tokenURI
    status
    owner {
      id
    }
    creator {
      id
    }
    currentAsk {
      id
      amount
    }
    currentBid {
      id
      amount
      bidder {
        id
      }
      createdAtTimestamp
    }
    createdAtTimestamp
  }
`;

export const fetchNFTs = (client: ApolloClient<any>) =>
  client.query<{ nfts: INft[] }>({
    query: gql`
      ${NFT_FIELDS}
      query NftList {
        nfts(where: { status: "approved" }) {
          ...nftFields
        }
      }
    `,
  });

export const filterNFTsByIds = (
  client: ApolloClient<any>,
  ids: string[],
  status?: NftStatus
) =>
  status
    ? client.query<{ nfts: INft[] }>({
        query: gql`
          ${NFT_FIELDS}
          query Nft($ids: [String], $status: String!) {
            nfts(where: { id_in: $ids, status: $status }) {
              ...nftFields
            }
          }
        `,
        variables: { ids, status },
      })
    : client.query<{ nfts: INft[] }>({
        query: gql`
          ${NFT_FIELDS}
          query Nft($ids: [String]) {
            nfts(where: { id_in: $ids }) {
              ...nftFields
            }
          }
        `,
        variables: { ids },
      });

export const filterNFTsByNotIds = (client: ApolloClient<any>, ids: string[]) =>
  client.query<{ nfts: INft[] }>({
    query: gql`
      ${NFT_FIELDS}
      query Nft($ids: [String]) {
        nfts(where: { id_not_in: $ids }) {
          ...nftFields
        }
      }
    `,
    variables: { ids: ids },
  });

export const getCollectionNFTs = (
  client: ApolloClient<any>,
  collectionAddress: string
) =>
  client.query<{ nfts: INft[] }>({
    query: gql`
      ${NFT_FIELDS}
      query Nft($collectionAddress: String) {
        nfts(where: { tokenAddress: $collectionAddress }) {
          ...nftFields
        }
      }
    `,
    variables: { collectionAddress },
  });

export const getNftsOfAddress = (
  client: ApolloClient<any>,
  address: string,
  status?: NftStatus
) =>
  status
    ? client.query<{ user: IUser }>({
        query: gql`
          ${NFT_FIELDS}
          query User($address: String!, $status: String!) {
            user(id: $address) {
              id
              collection(where: { status: $status }) {
                ...nftFields
              }
              creations(where: { status: $status }) {
                ...nftFields
              }
            }
          }
        `,
        variables: {
          address,
          status,
        },
      })
    : client.query<{ user: IUser }>({
        query: gql`
          ${NFT_FIELDS}
          query User($address: String!) {
            user(id: $address) {
              id
              collection {
                ...nftFields
              }
              creations {
                ...nftFields
              }
            }
          }
        `,
        variables: {
          address,
        },
      });

export const getOneNft = (client: ApolloClient<any>, tokenId: string) =>
  client.query({
    query: gql`
      query Nft($tokenId: String!) {
        nft(id: $tokenId) {
          id
          tokenId
          tokenAddress
          name
          description
          image
          tokenURI
          owner {
            id
          }
          creator {
            id
          }
          currentAsk {
            id
            amount
          }
          currentBid {
            id
            amount
            bidder {
              id
            }
            createdAtTimestamp
          }
          createdAtTimestamp
        }
      }
    `,
    variables: {
      tokenId,
    },
  });

export const getActivites = (client: ApolloClient<any>, tokenId: string) =>
  client.query({
    query: gql`
      query Activities($tokenId: String!) {
        activities(
          where: { token: $tokenId }
          orderBy: createdAtTimestamp
          orderDirection: desc
        ) {
          id
          createdAtTimestamp
          from {
            id
          }
          to {
            id
          }
          event
          token {
            id
          }
          amount
        }
      }
    `,
    variables: {
      tokenId,
    },
  });

export const getIncomingOffers = (client: ApolloClient<any>, address: string) =>
  client.query({
    query: gql`
      query Bids($address: String!) {
        bids(
          where: { nftOwner: $address }
          orderBy: createdAtTimestamp
          orderDirection: desc
        ) {
          id
          bidder {
            id
          }
          amount
          token {
            id
            name
            tokenId
            tokenAddress
            tokenURI
            image
          }
          createdAtTimestamp
        }
      }
    `,
    variables: {
      address,
    },
  });

export const getOutgoingOffers = (client: ApolloClient<any>, address: string) =>
  client.query({
    query: gql`
      query Bids($address: String!) {
        bids(
          where: { bidder: $address }
          orderBy: createdAtTimestamp
          orderDirection: desc
        ) {
          id
          bidder {
            id
          }
          amount
          nftOwner {
            id
          }
          token {
            id
            name
            tokenId
            tokenAddress
            tokenURI
            image
          }
          createdAtTimestamp
        }
      }
    `,
    variables: {
      address,
    },
  });

export const getOneCollection = (client: ApolloClient<any>, address: string) =>
  client
    .query({
      query: gql`
        query Collection($address: String!) {
          contracts(where: { id: $address, platform: true }) {
            id
            name
            symbol
            owner
          }
        }
      `,
      variables: {
        address,
      },
    })
    .then((res) => res.data.contracts[0]);

export const getCollections = (client: ApolloClient<any>) =>
  client
    .query({
      query: gql`
        query Collections {
          contracts(where: { platform: true }) {
            id
            name
            symbol
            owner
          }
        }
      `,
    })
    .then((res) => res.data.contracts);

export const getCollectionActivites = (client: ApolloClient<any>, tokenAddress: string) =>
  client.query({
    query: gql`
      query Activities($tokenAddress: String!) {
        activities(
          where: { collection: $tokenAddress }
          orderBy: createdAtTimestamp
          orderDirection: desc
        ) {
          id
          createdAtTimestamp
          from {
            id
          }
          to {
            id
          }
          event
          token {
            id
          }
          amount
        }
      }
    `,
    variables: {
      tokenAddress,
    },
  });
