import { Box, TextField } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import { stringToColor } from "../../helper/utils";

const filter = createFilterOptions<string>();

const ListItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

interface Props {
  allCategories: string[];
  onChange: (categories: string[]) => void;
  selected: string[];
}

export default function CategoryFilter({
  allCategories,
  selected,
  onChange,
}: Props) {
  const onAdd = (v: string | null) => {
    if (!v) {
      return;
    }
    const categories = [...selected, v];
    onChange(categories);
  };

  const onDelete = (v: string) => {
    const categories = selected.filter((c) => c !== v);
    onChange(categories);
  };

  return (
    <Box>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {selected.map((c) => (
          <ListItem key={c}>
            <Chip
              label={c}
              style={{ background: stringToColor(c) }}
              onDelete={() => onDelete(c)}
            />
          </ListItem>
        ))}
      </ul>
      <Autocomplete
        fullWidth
        options={(allCategories || []).filter((c) => !selected.includes(c))}
        onChange={(e, v) => onAdd(v)}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          return filtered;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            autoFocus
            placeholder="Search Category"
            variant="standard"
            color="bright"
          />
        )}
        clearOnBlur
        clearOnEscape
        blurOnSelect
      />
    </Box>
  );
}
