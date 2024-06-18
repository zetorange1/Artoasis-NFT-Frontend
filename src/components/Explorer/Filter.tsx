import {
  Button,
  Grid,
  Box,
  TextField,
  Typography,
  Popover,
} from "@mui/material";
// import { TextFieldProps } from "@mui/material/TextField";
// import { OutlinedInputProps } from "@mui/material/OutlinedInput";
import FilterListIcon from "@mui/icons-material/FilterList";
// import { styled, alpha } from "@mui/system";
import { useEffect, useState } from "react";

import ApiService from "../../helper/api";
import CategoryFilter from "./CategoryFilter";

// const FilterTextField = styled((props: TextFieldProps) => (
//   <TextField
//     InputProps={
//       {
//         disableUnderline: true,
//       } as Partial<OutlinedInputProps>
//     }
//     {...props}
//   />
// ))(({ theme }: any) => ({
//   "& .MuiFilledInput-root": {
//     border: "1px solid #e2e2e1",
//     overflow: "hidden",
//     borderRadius: 15,
//     backgroundColor: theme.palette.mode === "light" ? "#fcfcfb" : "#2b2b2b",
//     transition: theme.transitions.create([
//       "border-color",
//       "background-color",
//       "box-shadow",
//     ]),
//     "&:hover": {
//       backgroundColor: "white",
//     },
//     "&.Mui-focused": {
//       backgroundColor: "white",
//       boxShadow: `${alpha(theme.palette.background.default, 0.25)} 0 0 0 2px`,
//       borderColor: theme.palette.background.default,
//     },
//     "& .MuiInputBase-input": {
//       color: "black",
//     },
//   },
//   "& .MuiInputLabel-root": {
//     color: `${alpha(theme.palette.background.default, 0.5)}`,
//   },
// }));

// const ApplyButton = styled(Button)({
//   size: "large",
//   color: "primary",
//   padding: "15px 37px",
//   borderRadius: 15,
//   textTransform: "none",
//   background: "white",
//   opacity: 0.9,
//   width: "100%",
//   "&:hover": {
//     background: "white",
//   },
// });

export default function Filter({ apply }) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenFilter = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const [filter, setFilter] = useState({
    min: 0,
    max: 0,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  const handleChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    apply(filter, categoryIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, categoryIds]);

  const handleCategoryChange = (selected: string[]) => {
    setCategories(selected);
    const categoryIds = selected
      .map((c) => allCategories.find((item) => item.name === c)?.id)
      .filter(Boolean);
    setCategoryIds(categoryIds);
  };

  const fetchCategories = async () => {
    const categories = await ApiService.getCategories();
    setAllCategories(categories || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <Button
        color="secondary"
        variant="contained"
        startIcon={<FilterListIcon />}
        onClick={handleOpenFilter}
      >
        Filter
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseFilter}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Box p={2} bgcolor="#526170">
          <Typography
            variant="h6"
            gutterBottom
            className="ff-label"
            fontSize={14}
          >
            Price
          </Typography>
          <Grid container mb={4}>
            <Grid item>
              <Grid
                container
                wrap="nowrap"
                alignItems="center"
                spacing={1}
                mb={2}
              >
                <Grid item xs={6}>
                  <TextField
                    label="Min"
                    color="bright"
                    type="number"
                    name="min"
                    variant="standard"
                    onBlur={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max"
                    color="bright"
                    type="number"
                    name="max"
                    variant="standard"
                    onBlur={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Typography
            variant="h6"
            gutterBottom
            className="ff-label"
            fontSize={14}
          >
            Categories
          </Typography>
          <Box maxHeight="200px" mb={4}>
            <CategoryFilter
              selected={categories}
              allCategories={allCategories.map((c) => c.name)}
              onChange={handleCategoryChange}
            />
          </Box>

          <Typography
            variant="h6"
            gutterBottom
            className="ff-label"
            fontSize={14}
          >
            Collections
          </Typography>

          <Box>Coming Soon...</Box>
        </Box>
      </Popover>
    </div>
  );
}
