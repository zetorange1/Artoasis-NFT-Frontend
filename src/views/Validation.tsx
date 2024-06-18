import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Nft from "../components/Collections/Nft";
import AddValidatorModal from "../components/Validation/AddValidatorModal";
import useInfiniteScroll from "react-infinite-scroll-hook";

import { useAuthContext } from "../contexts/AuthContext";
import { useContracts } from "../contexts/Web3Context";
import { mixNFTMetadatas, normalizeNFT, sameAddress } from "../helper/utils";
import { INft, IValidator, NftStatus } from "../types";
import ApiService from "../helper/api";
import { useScanApiContext } from "../contexts/ScanApiContext";

export default function Validation() {
  const { address, chainId } = useAuthContext();
  const { getNftsByIds } = useScanApiContext();
  const {
    contracts: { validator },
  } = useContracts();
  const [nfts, setNfts] = useState<INft[]>([]);
  const [role, setRole] = useState({
    owner: false,
    validator: false,
  });
  const [loading, setLoading] = useState(true);
  const [infiniteLoading, setInfiniteLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [callProgress, setCallProgress] = useState(false);
  const [validators, setValidators] = useState<IValidator[]>([]);
  const [showAddValidator, setShowAddValidator] = useState(false);
  const [page, setPage] = useState(1);

  const onNftCheck = (checked: boolean, nft: INft) => {
    if (checked) {
      setSelected(selected.concat(nft.id));
    } else {
      setSelected(selected.filter((id) => id !== nft.id));
    }
  };

  const addValidator = async (addr: string) => {
    if (validators.some((v) => sameAddress(addr, v.id))) {
      return;
    }
    setShowAddValidator(false);
    setCallProgress(true);

    try {
      await validator?.methods.setValidator(addr, true).send({
        from: address,
      });
      getValidators();
    } catch (err) {
      console.error(err);
    }
    setCallProgress(false);
  };

  const removeValidator = async (v: IValidator) => {
    setCallProgress(true);

    try {
      await validator?.methods.setValidator(v.id, false).send({
        from: address,
      });
      setValidators(validators.filter((va) => va.id !== v.id));
    } catch (err) {
      console.error(err);
    }
    setCallProgress(false);
  };

  const approve = async () => {
    setCallProgress(true);

    try {
      const tokenAddresses = selected.map((s) => s.split("-")[0]);
      const tokenIds = selected.map((s) => s.split("-")[1]);
      await validator?.methods.validate(tokenAddresses, tokenIds).send({
        from: address,
      });
      await ApiService.postTrackAction(
        address,
        "Approve",
        tokenAddresses,
        tokenIds
      );
      setNfts((nfts) => nfts.filter((nft) => !selected.includes(nft.id)));
      setSelected([]);
    } catch (err) {
      console.error(err);
    }
    setCallProgress(false);
  };

  const decline = async () => {
    setCallProgress(true);

    try {
      const tokenAddresses = selected.map((s) => s.split("-")[0]);
      const tokenIds = selected.map((s) => s.split("-")[1]);
      await validator?.methods.decline(tokenAddresses, tokenIds).send({
        from: address,
      });
      await ApiService.postTrackAction(
        address,
        "Decline",
        tokenAddresses,
        tokenIds
      );
      setNfts((nfts) => nfts.filter((nft) => !selected.includes(nft.id)));
      setSelected([]);
    } catch (err) {
      console.error(err);
    }
    setCallProgress(false);
  };

  const fetchNftsByPage = async (page = 1) => {
    setInfiniteLoading(true);

    try {
      const res = await ApiService.filterNftsAPI(
        null,
        null,
        [],
        +chainId,
        page,
        false,
        true,
        NftStatus.PENDING
      );
      const { next } = res.results;
      const all = res.results.map(normalizeNFT);
      const externalNfts = all.filter((nft) => !nft.name);
      const { data: externalNftMetadatas } = await getNftsByIds(externalNfts);

      const result: INft[] = mixNFTMetadatas(all, externalNftMetadatas).filter(
        (nft) => !sameAddress(nft.owner, address)
      );

      const loadedNfts = [...nfts, ...result];
      setNfts(loadedNfts);
      setPage(page);
      setHasNextPage(!!next);
    } catch (e) {
      console.error(e);
    } finally {
      setInfiniteLoading(false);
    }
  };

  const loadMoreNfts = () => {
    const nextPage = page + 1;
    fetchNftsByPage(nextPage);
  };

  useEffect(() => {
    if (!address || !validator) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const fetchRole = async () => {
      const ownerAddress = await validator.methods.owner().call();
      const isValidator = await validator.methods.validators(address).call();
      const isOwner = sameAddress(ownerAddress, address);

      setRole({
        owner: isOwner,
        validator: isOwner || isValidator,
      });
      setLoading(false);
    };

    fetchRole();
  }, [address, validator]);

  const getValidators = async () => {
    const { results } = await ApiService.getValidators();

    const profiles = await Promise.all(
      results.map((v) =>
        ApiService.getUser(v.id)
          .then((res) => res.data || {})
          .catch((err) => ({}))
      )
    );
    setValidators(
      results.map((r, index) => ({ ...r, ...(profiles[index] as any) })) as any
    );
  };

  useEffect(() => {
    if (!role.validator) {
      setNfts([]);
      return;
    }

    fetchNftsByPage();

    if (role.owner) {
      getValidators();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const [infiniteRef] = useInfiniteScroll({
    loading: infiniteLoading,
    hasNextPage: hasNextPage,
    onLoadMore: loadMoreNfts,
  });

  if (!address) {
    return <Box p={4}>Connect Your Metamask first</Box>;
  }
  return loading ? (
    <CircularProgress color="secondary" />
  ) : (
    <Box p={4}>
      {!role.validator ? (
        <Typography color="white">
          You don't have permission to view this page
        </Typography>
      ) : (
        <>
          {role.owner && (
            <>
              <Grid container mb={3} justifyContent="space-between">
                <Grid item display="flex">
                  <Typography color="white" mr={2} variant="h4">
                    Validators
                  </Typography>
                  {callProgress && <CircularProgress color="secondary" />}
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={callProgress}
                    onClick={() => setShowAddValidator(true)}
                  >
                    Add a validator
                  </Button>
                </Grid>
              </Grid>
              <Grid container mb={4}>
                {validators.length ? (
                  <TableContainer>
                    <Table sx={{ width: "100%" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Address</TableCell>
                          <TableCell align="right">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {validators.map((v) => (
                          <TableRow
                            key={v.id}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {v.name || "Unnamed"}
                            </TableCell>
                            <TableCell component="th" scope="row">
                              {v.id}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                color="error"
                                variant="contained"
                                disabled={callProgress}
                                onClick={() => removeValidator(v)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="white">No validators</Typography>
                )}
              </Grid>
            </>
          )}
          <Grid container mb={3} justifyContent="space-between">
            <Grid item display="flex">
              <Typography color="white" mr={2} variant="h4">
                NFTs
              </Typography>
              {callProgress && <CircularProgress color="secondary" />}
            </Grid>
            <Grid item>
              <Button
                disabled={!selected.length || callProgress}
                variant="contained"
                color="success"
                onClick={() => approve()}
              >
                Approve
              </Button>
              <Button
                disabled={!selected.length || callProgress}
                variant="contained"
                color="error"
                style={{ marginLeft: 12 }}
                onClick={() => decline()}
              >
                Decline
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={1}>
            {nfts.map((nft) => (
              <Grid item key={nft.id} xs={12} sm={6} md={6} lg={4} xl={3}>
                <Checkbox
                  color="success"
                  checked={selected.includes(nft.id)}
                  onChange={(_, checked) => onNftCheck(checked, nft)}
                />
                <Nft nft={nft} validator showStatus />
              </Grid>
            ))}
            {hasNextPage && (
              <Grid
                container
                py={3}
                justifyContent="center"
                alignItems="center"
                ref={infiniteRef}
              >
                {infiniteLoading && <CircularProgress />}
              </Grid>
            )}
          </Grid>

          <AddValidatorModal
            show={showAddValidator}
            handleClose={() => setShowAddValidator(false)}
            addValidator={(addr) => addValidator(addr)}
          />
        </>
      )}
    </Box>
  );
}
