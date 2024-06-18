import { useState } from "react";
import { styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import PlusIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid";
import { IconButton, TextField } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import CloseIcon from "@mui/icons-material/Close";
import { stringToColor } from "../../../helper/utils";

const filter = createFilterOptions<string>();

interface Props {
  categories: string[];
  allCategories?: string[];
  editing?: boolean;
  onDeleteCategory?: (category: string) => void;
  onAddCategory?: (category: string) => void;
}

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export default function NftCategoriesControl({
  categories,
  editing,
  onDeleteCategory = (c: string) => null,
  onAddCategory = (c: string) => null,
  allCategories,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState<string>("");

  const onDelete = (category: string) => {
    onDeleteCategory(category);
  };

  const onAdd = () => {
    if (!newValue) {
      return;
    }
    onAddCategory(newValue);
    setAdding(false);
    setNewValue("");
  };

  return (
    <Grid container alignItems="center">
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {categories.map((c) => (
          <ListItem key={c}>
            <Chip
              label={c}
              style={{ background: stringToColor(c) }}
              onDelete={editing ? () => onDelete(c) : undefined}
            />
          </ListItem>
        ))}
        {!adding && editing && (
          <ListItem>
            <IconButton
              size="small"
              color="secondary"
              onClick={() => setAdding(true)}
              style={{ marginLeft: 4 }}
            >
              <PlusIcon />
            </IconButton>
          </ListItem>
        )}
        {adding && (
          <ListItem>
            <Autocomplete
              style={{ marginLeft: 4, minWidth: 160 }}
              freeSolo
              options={(allCategories || []).filter(
                (c) => !categories.includes(c)
              )}
              value={newValue}
              onChange={(e, v) => {
                if (!v) {
                  return;
                }
                onAddCategory(v);
                setAdding(false);
                setNewValue("");
              }}
              filterOptions={(options, params) => {
                const { inputValue } = params;

                if (!inputValue) {
                  return [];
                }
                const filtered = filter(options, params);

                // Suggest the creation of a new value
                const isExisting = options.some(
                  (option) => inputValue === option
                );

                if (inputValue !== "" && !isExisting) {
                  filtered.push(inputValue);
                }
                return filtered;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  color="bright"
                  variant="standard"
                />
              )}
              onBlur={() => {
                setNewValue("");
                setAdding(false);
              }}
              onKeyDown={(e) => (e.code === "Enter" ? onAdd() : undefined)}
              clearOnBlur
              clearIcon={
                <CloseIcon fontSize="small" style={{ color: "white" }} />
              }
            />
          </ListItem>
        )}
      </ul>
    </Grid>
  );
}
