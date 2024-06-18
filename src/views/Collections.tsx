/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import ApiService from "../helper/api";
// import { getCollections } from "../helper/subgraph-query";
// import { sameAddress } from "../helper/utils";
import { useAuthContext } from "../contexts/AuthContext";

const rangeOptions = [
  {
    value: 7,
    label: "7D VOLUME",
  },
];

const CollectionCard = styled(Card)({
  width: "100%",
});

export default function Collections() {
  const [range] = useState(7);
  const [collections, setCollections] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const { chainId } = useAuthContext();

  const filteredCollections = useMemo(() => {
    return searchText
      ? collections.filter(
          (c) =>
            c.nftName.toLowerCase().includes(searchText.toLowerCase()) ||
            c.nftSymbol.toLowerCase().includes(searchText.toLowerCase())
        )
      : collections;
  }, [collections, searchText]);

  const fetchCollections = async () => {
    const { results } = await ApiService.listCollection(chainId);
    setCollections(results);
  };

  useEffect(() => {
    if (!chainId || isNaN(chainId)) {
      return;
    }
    fetchCollections();
  }, [chainId]);

  return (
    <div>
      <Grid container justifyContent="space-between">
        <Typography
          fontWeight="bold"
          textTransform="uppercase"
          color="white"
          variant="h6"
          gutterBottom
        >
          Your Next Addiction
        </Typography>
        <Link to="/create-collection" style={{ textDecoration: "none" }}>
          <Button variant="contained" color="secondary">
            New collection
          </Button>
        </Link>
      </Grid>
      <Typography
        fontWeight="bold"
        textTransform="uppercase"
        color="secondary"
        variant="h4"
        gutterBottom
      >
        Discover the best collections
      </Typography>
      <Grid container mt={4} justifyContent="space-between" alignItems="start">
        <Grid item>
          <TextField
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            label="Search name"
            color="bright"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "white" }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item>
          <TextField
            select
            value={range}
            color="bright"
            style={{ minWidth: 200 }}
          >
            {rangeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <Box my={2}>
        <Typography color="white" variant="subtitle1" className="ff-primary">
          {filteredCollections.length} results
        </Typography>
      </Box>
      <Grid container spacing={1}>
        {filteredCollections.map((item) => (
          <Grid item key={item.address} xs={12} sm={6} md={4} lg={3}>
            <CollectionCard>
              <CardActionArea>
                <Link
                  to={`/collections/${item.address}`}
                  style={{ textDecoration: "none" }}
                >
                  <CardMedia image={item.posterImage} style={{ height: 300 }} />
                  <Divider />
                  <CardContent>
                    <Typography color="white" variant="h6">
                      {item.nftName}
                    </Typography>
                  </CardContent>
                </Link>
              </CardActionArea>
            </CollectionCard>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
