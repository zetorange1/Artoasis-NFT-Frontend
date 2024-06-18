/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
  Button,
  CardHeader,
  TextField,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useHistory } from "react-router";
import Web3 from "web3";

import useTokenHelper from "../hooks/useTokenHelper";
import Logo from "../assets/oasis_logo.png";
import { useSnackbar } from "../contexts/Snackbar";
import ApiService from "../helper/api";
import NftCategoriesControl from "../components/ui/NftCategoriesControl";
import { useContracts } from "../contexts/Web3Context";
import { useAuthContext } from "../contexts/AuthContext";
import OverlayLoading from "../components/ui/OverlayLoading";

const DropZone = styled("div")({
  border: "1px dashed #aaa",
  padding: "80px 24px",
  textAlign: "center",
  marginTop: 24,
});

const USPS = [
  {
    title: "USP 1",
    text: "Morbi leo risus, porta ac consec tetur ac, vestibulum at eros. Donec id elit non mi porta gravida at",
  },
  {
    title: "USP 2",
    text: "Morbi leo risus, porta ac consec tetur ac, vestibulum at eros. Donec id elit non mi porta gravida at",
  },
  {
    title: "USP 3",
    text: "Morbi leo risus, porta ac consec tetur ac, vestibulum at eros. Donec id elit non mi porta gravida at",
  },
];

const OpenOasisImage = styled("img")(({ theme }) => ({
  position: "absolute",
  height: 100,
  left: -36,
  top: 16,
  [theme.breakpoints.down("md")]: {
    left: 12,
    height: 64,
  },
}));

export default function CreateMedia() {
  const { nftContractAddress, currency } = useContracts();
  const [file, setFile] = useState<File | null>(null);
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [price, setPrice] = useState<number>();
  const [categories, setCategories] = useState<string[]>([]);
  const [preview, setPreview] = useState<any>();
  const [uploading, setUploading] = useState(false);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const { mintToken, uploadImageToIpfs } = useTokenHelper();
  const { chainId } = useAuthContext();
  const history = useHistory();
  const { showSnackbar } = useSnackbar();
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<string>(nftContractAddress);

  const onDrop = useCallback((acceptedFiles) => {
    const [file] = acceptedFiles;
    setFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/jpg, image/gif",
  });

  const fetchAllCategories = async () => {
    const categories = await ApiService.getCategories();
    setAllCategories(categories.map((val) => val.name));
  };

  const fetchCollections = async () => {
    const { results } = await ApiService.listCollection(chainId);
    setCollections(results.filter((r) => !r.imported));
  };

  useEffect(() => {
    if (!file) {
      return;
    }
    const objUrl = URL.createObjectURL(file);
    setPreview(objUrl);
  }, [file]);

  useEffect(() => {
    if (!chainId || isNaN(chainId)) {
      return;
    }
    fetchAllCategories();
    fetchCollections();
  }, [chainId]);

  const createNFT = async () => {
    showSnackbar({
      severity: "info",
      message: "Uploading Image...",
    });
    setUploading(true);

    try {
      const metadata = await uploadImageToIpfs(
        nftName,
        nftDescription,
        file as any
      );
      const res = await mintToken(
        metadata.url,
        Web3.utils.toWei(`${price}`, "ether").toString(),
        selectedCollection
      );
      await ApiService.createNft(
        selectedCollection,
        +res.events.Transfer.returnValues.tokenId,
        +price!,
        categories
      );
      showSnackbar({
        severity: "success",
        message: "The NFT has been created",
      });
      const interval = setInterval(() => {
        ApiService.getNft({
          token_id: res.events.Transfer.returnValues.tokenId,
          token_addresS: selectedCollection.toLowerCase(),
        }).then((r) => {
          if (r.results[0]) {
            setUploading(false);
            clearInterval(interval);
            history.push(
              `/nft/${selectedCollection}/${res.events.Transfer.returnValues.tokenId}`
            );
          }
        });
      }, 5000);
    } catch (err) {
      console.error(err);
      showSnackbar({
        severity: "error",
        message: "Failed to mint",
      });
      setUploading(false);
    }
  };

  return (
    <Box pt={4} pb={2}>
      <Grid container justifyContent="space-between" spacing={2}>
        <OverlayLoading show={uploading} />
        <Grid item xs={12} md={6}>
          <Card
            style={{ padding: 24, maxHeight: 648 }}
            className="scrollbox shadow-widget"
          >
            <Box>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h5" gutterBottom>
                  Mint your own NFT
                </Typography>
              </Grid>
              <Typography variant="h6" color="secondary" gutterBottom>
                Done in just 3 minutes
              </Typography>
              <Typography variant="body2">
                File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV,
                OGG, GLB, GLTF. Max size: 100 MB
              </Typography>
            </Box>
            <CardContent style={{ padding: 0, paddingTop: 24 }}>
              <Typography variant="h6" gutterBottom className="ff-label">
                Upload Image, Video, Audio, or 3D Model
              </Typography>
              {!file ? (
                <DropZone {...getRootProps()}>
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Drop the images here ...</p>
                  ) : (
                    <p>You can drag and drop your images here</p>
                  )}
                </DropZone>
              ) : (
                <Box textAlign="center" py={3}>
                  {preview && (
                    <img style={{ height: "300px" }} src={preview} alt="" />
                  )}
                  {file && (
                    <Grid container justifyContent="flex-end" mt={2}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="large"
                        disabled={uploading}
                        style={{ marginLeft: 12 }}
                        onClick={() => {
                          setPreview(null);
                          setFile(null);
                        }}
                      >
                        Cancel Image
                      </Button>
                    </Grid>
                  )}
                </Box>
              )}
              {file && (
                <>
                  <Box mt={3}>
                    <TextField
                      fullWidth
                      color="bright"
                      label="Name"
                      required
                      disabled={uploading}
                      value={nftName}
                      onChange={(e) => setNftName(e.target.value)}
                    />
                  </Box>
                  <Box mt={3}>
                    <TextField
                      fullWidth
                      label="Description"
                      color="bright"
                      multiline
                      rows={3}
                      value={nftDescription}
                      disabled={uploading}
                      onChange={(e) => setNftDescription(e.target.value)}
                    />
                  </Box>
                  <Box mt={3}>
                    <TextField
                      fullWidth
                      label="Price"
                      color="bright"
                      type="number"
                      disabled={uploading}
                      onChange={(e) => setPrice(+e.target.value)}
                      InputProps={{
                        endAdornment: currency,
                      }}
                      helperText="Price must be bigger than 0"
                      FormHelperTextProps={{
                        style: {
                          color: "white",
                        },
                      }}
                    />
                  </Box>
                  <Box mt={3}>
                    <TextField
                      fullWidth
                      select
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      label="Collection"
                      color="bright"
                    >
                      <MenuItem value={nftContractAddress}>None</MenuItem>
                      {collections.map((c) => (
                        <MenuItem key={c.address} value={c.address}>
                          {c.nftName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box mt={3}>
                    <Typography gutterBottom>Category</Typography>
                    <NftCategoriesControl
                      categories={categories}
                      allCategories={allCategories}
                      editing={!uploading}
                      onAddCategory={(c) => {
                        const updated = [...categories, c];
                        setCategories(updated);
                      }}
                      onDeleteCategory={(c) => {
                        const updated = categories.filter((item) => item !== c);
                        setCategories(updated);
                      }}
                    />
                  </Box>
                </>
              )}
            </CardContent>
            <CardActions style={{ marginTop: 24 }}>
              <Grid
                container
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    disabled={!preview || !price || uploading || !nftName}
                    onClick={createNFT}
                  >
                    Create
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          {USPS.map((usp) => (
            <Card
              className="shadow-widget"
              key={usp.title}
              style={{ marginBottom: 24 }}
            >
              <CardHeader
                title={
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    className="ff-primary"
                  >
                    {usp.title}
                  </Typography>
                }
              />
              <CardContent style={{ paddingTop: 0 }}>
                <Typography className="ff-primary">{usp.text}</Typography>
              </CardContent>
            </Card>
          ))}
          <Card
            className="shadow-widget"
            style={{
              paddingLeft: 64,
              position: "relative",
              overflow: "visible",
            }}
          >
            <OpenOasisImage src={Logo} alt="Open Oasis" />
            <Box
              sx={{
                ml: {
                  xs: "12px",
                  md: 0,
                },
              }}
            >
              <CardHeader
                title={
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    className="ff-primary"
                  >
                    About OpenOasis
                  </Typography>
                }
              />
              <CardContent style={{ paddingTop: 0, paddingBottom: 48 }}>
                <Typography className="ff-primary">
                  Morbi leo risus, porta ac consec tetur ac, vestibulum at eros.
                  Donec id elit non mi porta gravida at.
                </Typography>
              </CardContent>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
