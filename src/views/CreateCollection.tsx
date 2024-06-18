import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { styled } from "@mui/system";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import Web3 from "web3";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";

import { useSnackbar } from "../contexts/Snackbar";
import { useContracts } from "../contexts/Web3Context";
import { useSubGraph } from "../contexts/SubGraphContext";

import ImageUploader from "../components/CreateCollection/ImageUploader";
import mediaABI from "../contracts/abis/Media.json";
import { sameAddress } from "../helper/utils";
import { useAuthContext } from "../contexts/AuthContext";
import ApiService from "../helper/api";
import OverlayLoading from "../components/ui/OverlayLoading";

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

const FieldTitle = styled(Typography)({
  fontSize: 16,
  fontFamily: '"Press Start 2P" !important',
});

const FieldDimension = styled(Typography)({
  fontSize: 16,
  borderLeft: "2px solid",
  paddingLeft: 24,
  marginLeft: 48,
  fontFamily: '"Press Start 2P" !important',
});

const ERC721InterfaceId: string = "0x80ac58cd";

export default function CreateCollection() {
  const history = useHistory();
  const { showSnackbar } = useSnackbar();
  const { client } = useSubGraph();
  const {
    contracts: { collections },
    web3,
  } = useContracts();
  const [loading, setLoading] = useState(false);
  const { address, chainId } = useAuthContext();
  const [contractSource, setContractSource] = useState("new");
  const [contractAddress, setContractAddress] = useState("");
  const [contractValidated, setContractValidated] = useState(false);
  const [collectionInfo, setCollectionInfo] = useState<any>({
    nftName: "T1",
    nftSymbol: "T1",
    bannerImage: null,
    posterImage: null,
    thumbnailImage: null,
    address: "",
    projectName: "ArtOasis",
    projectDescription: "This is a test collection",
    nsfw: false,
    contactEmail: "test@test.com",
    projectWebsite: "https://google.com",
    discord: "https://discord.xyz",
    twitter: "https://twitter.com",
    telegram: "https://telegram.com",
    reddit: "https://reddit.com",
    medium: "https://medium.com",
    layoutStyle: "Contain",
  });

  const validContractAddress = useMemo(
    () => Web3.utils.isAddress(contractAddress),
    [contractAddress]
  );

  const updateCollectionInfo = (e) => {
    setCollectionInfo((v) => ({
      ...v,
      [e.target.name]: e.target.value,
    }));
  };

  const updateFileField = (name: string, file: File) => {
    setCollectionInfo((v) => ({
      ...v,
      [name]: file,
    }));
  };

  const validateContract = async () => {
    if (!client) {
      return;
    }
    if (!web3) {
      showSnackbar({
        severity: "error",
        message: "Wrong Network",
      });
      return;
    }
    setLoading(true);

    try {
      const nftContract = new web3.eth.Contract(
        mediaABI as any,
        contractAddress
      );
      const res = await nftContract.methods
        .supportsInterface(ERC721InterfaceId)
        .call();

      if (res) {
        const ownerAddress = await nftContract.methods.owner().call();

        if (!sameAddress(ownerAddress, address)) {
          setContractValidated(false);
          showSnackbar({
            severity: "error",
            message: "You are not the owner of the contract",
          });
          setLoading(false);
          return;
        }
        const existing = await ApiService.getCollection(contractAddress).catch(
          (err) => null
        );

        if (existing) {
          setContractValidated(false);
          showSnackbar({
            severity: "info",
            message: "The collection is already existing",
          });
          setLoading(false);
          return;
        }
      } else {
        setContractValidated(false);
        showSnackbar({
          severity: "error",
          message: "Invalid ERC721 Contract Address",
        });
      }
      const [nftName, nftSymbol] = await Promise.all([
        nftContract.methods.name().call(),
        nftContract.methods.symbol().call(),
      ]);
      setCollectionInfo({
        ...collectionInfo,
        address: contractAddress,
        nftName,
        nftSymbol,
      });
      setContractValidated(true);
    } catch (err) {
      console.error(err);
      setContractValidated(false);
      showSnackbar({
        severity: "error",
        message: "Invalid ERC721 Contract Address",
      });
    }

    setLoading(false);
  };

  const create = async () => {
    if (!collections) {
      return;
    }

    if (
      !collectionInfo.bannerImage ||
      !collectionInfo.posterImage ||
      !collectionInfo.thumbnailImage ||
      !collectionInfo.contactEmail ||
      !collectionInfo.projectDescription
    ) {
      return showSnackbar({
        message: "Fill all the required fields",
        severity: "error",
      });
    }
    setLoading(true);

    const formData = new FormData();

    try {
      if (contractAddress) {
        showSnackbar({
          message: "Importing Collection Contract...",
          severity: "info",
        });
        await collections.methods.importCollection(contractAddress).send({
          from: address,
        });
        formData.append("address", contractAddress);
        formData.append("imported", "true");
      } else {
        if (!collectionInfo.nftName || !collectionInfo.nftSymbol) {
          setLoading(false);
          return showSnackbar({
            message: "Fill all the required fields",
            severity: "error",
          });
        }
        showSnackbar({
          message: "Creating Collection Contract...",
          severity: "info",
        });
        const result = await collections.methods
          .createNewCollection(collectionInfo.nftSymbol, collectionInfo.nftName)
          .send({
            from: address,
          });
        formData.append(
          "address",
          result.events.CollectionCreated.returnValues.mediaAddress
        );
      }

      for (const key in collectionInfo) {
        if (collectionInfo[key]) {
          formData.append(key, collectionInfo[key]);
        }
      }
      await ApiService.createCollection(formData);

      showSnackbar({
        message: "New collection has been created",
        severity: "success",
      });
      history.push(`/collections/${formData.get("address")}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
      showSnackbar({
        message: "Failed to adding a collection",
        severity: "error",
      });
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    setContractAddress("");
    setContractValidated(false);
  }, [chainId]);

  return (
    <Box pt={4} pb={2}>
      <OverlayLoading show={loading} />
      <Grid container justifyContent="space-between" spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography color="white" variant="h6" gutterBottom>
            CREATE AND SUBMIT A COLLECTION BASED ON YOUR CONTRACT
          </Typography>
          <Typography color="secondary" variant="h4" gutterBottom>
            SUBMIT COLLECTION
          </Typography>
          <Card>
            <CardHeader
              title={
                <Typography className="ff-label" variant="h5">
                  General Info
                </Typography>
              }
            />
            <CardContent>
              <div>
                <FieldTitle variant="h6" gutterBottom>
                  Contract Source
                </FieldTitle>
                <RadioGroup
                  value={contractSource}
                  onChange={(e, v) => setContractSource(v)}
                >
                  <FormControlLabel
                    value="new"
                    control={<Radio color="secondary" />}
                    label={
                      <Typography className="ff-primary" fontSize={20}>
                        Create a new contract
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="existing"
                    control={<Radio color="secondary" />}
                    label={
                      <Typography className="ff-primary" fontSize={20}>
                        Import from an existing contract
                      </Typography>
                    }
                  />
                </RadioGroup>
              </div>
              {contractSource === "existing" &&
                (contractValidated ? (
                  <>
                    <Box mt={4}>
                      <FieldTitle variant="h5" gutterBottom>
                        Contract Address
                      </FieldTitle>
                      <TextField
                        color="primary"
                        style={{ width: "400px", maxWidth: "100%" }}
                        value={contractAddress}
                        disabled
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              color="secondary"
                              onClick={() => setContractValidated(false)}
                            >
                              <EditIcon />
                            </IconButton>
                          ),
                        }}
                      />
                    </Box>
                  </>
                ) : (
                  <Box mt={4}>
                    <FieldTitle variant="h6" gutterBottom className="ff-label">
                      ERC721 Contract Address
                    </FieldTitle>
                    <TextField
                      disabled={loading}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      value={contractAddress}
                      helperText={
                        contractAddress && !validContractAddress
                          ? "Invalid Contract Address"
                          : ""
                      }
                      error={contractAddress ? !validContractAddress : false}
                      onChange={(e) => setContractAddress(e.target.value)}
                    />
                    <Box mt={2}>
                      <LoadingButton
                        color="secondary"
                        variant="contained"
                        size="large"
                        onClick={validateContract}
                        loading={loading}
                        disabled={!validContractAddress}
                        loadingIndicator={
                          <CircularProgress color="secondary" size={18} />
                        }
                      >
                        Validate Contract
                      </LoadingButton>
                    </Box>
                  </Box>
                ))}
              {(contractSource === "new" || contractValidated) && (
                <>
                  <div>
                    <Grid container alignItems="center" mb={2} mt={5}>
                      <FieldTitle variant="h5">Upload Banner</FieldTitle>
                      <FieldDimension>2640 x 512 pixels</FieldDimension>
                    </Grid>
                    <Typography mb={2} maxWidth="80%" className="ff-primary">
                      Avoid placing text or important elements near the
                      left/right edges because it might be cropped depending on
                      the screen width
                    </Typography>
                    <ImageUploader
                      loading={loading}
                      title="Choose Banner File"
                      onChange={(file) => updateFileField("bannerImage", file)}
                    />
                  </div>
                  <Box mt={4}>
                    <Grid container alignItems="center" mb={2}>
                      <FieldTitle variant="h5">Upload Poster</FieldTitle>
                      <FieldDimension>512 x 768 pixels</FieldDimension>
                    </Grid>
                    <ImageUploader
                      loading={loading}
                      title="Choose Poster File"
                      onChange={(file) => updateFileField("posterImage", file)}
                    />
                  </Box>
                  <Box mt={4}>
                    <Grid container alignItems="center" mb={2}>
                      <FieldTitle variant="h5">Upload Thumbnail</FieldTitle>
                      <FieldDimension>128 x 128 pixels</FieldDimension>
                    </Grid>
                    <ImageUploader
                      loading={loading}
                      title="Choose Thumbnail File"
                      onChange={(file) =>
                        updateFileField("thumbnailImage", file)
                      }
                    />
                  </Box>
                  <Box mt={4}>
                    <FieldTitle variant="h5" gutterBottom>
                      NFT Name
                    </FieldTitle>
                    <TextField
                      name="nftName"
                      disabled={loading || !!contractAddress}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      value={collectionInfo.nftName}
                      onChange={updateCollectionInfo}
                    />
                  </Box>
                  <Box mt={3}>
                    <FieldTitle variant="h5" gutterBottom>
                      NFT Symbol
                    </FieldTitle>
                    <TextField
                      name="nftSymbol"
                      disabled={loading || !!contractAddress}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      value={collectionInfo.nftSymbol}
                      onChange={updateCollectionInfo}
                    />
                  </Box>
                  <Box mt={3}>
                    <FieldTitle variant="h5" gutterBottom>
                      Project Description
                    </FieldTitle>
                    <TextField
                      name="projectDescription"
                      disabled={loading}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      multiline
                      minRows={3}
                      value={collectionInfo.projectDescription}
                      onChange={updateCollectionInfo}
                    />
                  </Box>
                  <Box mt={3}>
                    <FormControlLabel
                      name="nsfw"
                      control={
                        <Checkbox color="secondary" disabled={loading} />
                      }
                      value={collectionInfo.nsfw}
                      label="NFT Content is NSFW"
                      onChange={(e, value) =>
                        setCollectionInfo({ ...collectionInfo, nsfw: value })
                      }
                    />
                  </Box>
                  <Box mt={3} mb={3}>
                    <FieldTitle variant="h5" gutterBottom>
                      Your Email
                    </FieldTitle>
                    <Typography mb={2} maxWidth="80%" className="ff-primary">
                      Not stored publicly or shared with anyone. Used for
                      contract in case of any problems
                    </Typography>
                    <TextField
                      name="contactEmail"
                      value={collectionInfo.contactEmail}
                      disabled={loading}
                      label="Email"
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      onChange={updateCollectionInfo}
                    />
                  </Box>
                  <Divider style={{ borderColor: "#555" }} />
                  <Box mt={3}>
                    <Grid container alignItems="flex-end">
                      <FieldTitle variant="h5" mr={3}>
                        Additional Info
                      </FieldTitle>
                      <Typography
                        color="white"
                        variant="body2"
                        style={{ marginBottom: 2 }}
                        className="ff-label"
                      >
                        (optional)
                      </Typography>
                    </Grid>
                  </Box>

                  <Box mt={3}>
                    {/* <FieldTitle variant="h5" mr={3}>
                  Select up to 3 matching categories
                </FieldTitle> */}
                  </Box>

                  <Box mt={3}>
                    <FieldTitle variant="h5" gutterBottom>
                      Project Website
                    </FieldTitle>
                    <TextField
                      name="projectWebsite"
                      value={collectionInfo.projectWebsite}
                      disabled={loading}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      onChange={updateCollectionInfo}
                    />
                  </Box>

                  <Box mt={3}>
                    <FieldTitle variant="h5" gutterBottom>
                      Discord Server
                    </FieldTitle>
                    <TextField
                      name="discord"
                      value={collectionInfo.discord}
                      disabled={loading}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      onChange={updateCollectionInfo}
                    />
                  </Box>

                  <Box mt={3}>
                    <FieldTitle variant="h5" gutterBottom>
                      Twitter Handle
                    </FieldTitle>
                    <TextField
                      name="twitter"
                      value={collectionInfo.twitter}
                      disabled={loading}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      onChange={updateCollectionInfo}
                    />
                  </Box>

                  <Box mt={3}>
                    <FieldTitle variant="h5" gutterBottom>
                      Telegram Handle
                    </FieldTitle>
                    <TextField
                      name="telegram"
                      value={collectionInfo.telegram}
                      disabled={loading}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      onChange={updateCollectionInfo}
                    />
                  </Box>

                  <Box mt={3}>
                    <FieldTitle variant="h5" gutterBottom>
                      SubReddit
                    </FieldTitle>
                    <TextField
                      name="reddit"
                      value={collectionInfo.reddit}
                      disabled={loading}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      onChange={updateCollectionInfo}
                    />
                  </Box>

                  <Box mt={3}>
                    <FieldTitle variant="h5" gutterBottom>
                      Medium Page
                    </FieldTitle>
                    <TextField
                      name="medium"
                      value={collectionInfo.medium}
                      disabled={loading}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                      onChange={updateCollectionInfo}
                    />
                  </Box>

                  <Box mt={3} mb={3}>
                    <FieldTitle variant="h5" gutterBottom>
                      Project Comments
                    </FieldTitle>
                    <TextField
                      disabled={loading}
                      color="bright"
                      style={{ width: "400px", maxWidth: "100%" }}
                    />
                  </Box>

                  <LoadingButton
                    color="bright"
                    variant="contained"
                    size="large"
                    onClick={create}
                    loading={loading}
                    loadingIndicator={
                      <CircularProgress color="secondary" size={18} />
                    }
                    loadingPosition="end"
                    endIcon={<SaveIcon />}
                  >
                    Create
                  </LoadingButton>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          {USPS.map((usp) => (
            <Card
              key={usp.title}
              style={{ marginBottom: 24 }}
              className="shadow-widget"
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
        </Grid>
      </Grid>
    </Box>
  );
}
