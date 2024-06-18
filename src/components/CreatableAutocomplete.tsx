import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

interface OptionType {
  inputValue?: string;
  value: string;
}

const filter = createFilterOptions<OptionType>();

export default function CreatableAutocomplete({
  options,
  label,
  value,
  setValue,
  InputLabelProps,
  OptionsProps,
  darkTheme,
}) {
  // const [value, setValue] = React.useState<OptionType | null>(null);
  const StyledAutocomplete = styled(Autocomplete)({
    "& .MuiAutocomplete-inputRoot": {
      color: darkTheme ? "white" : "black",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: darkTheme ? "white" : "black",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: darkTheme ? "white" : "black",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: darkTheme ? "white" : "black",
      },
      "& .MuiAutocomplete-clearIndicator": {
        color: darkTheme ? "white" : "black",
      },
    },
  });

  return (
    <StyledAutocomplete
      value={value}
      onChange={(event, newValue: any) => {
        if (typeof newValue === "string") {
          setValue({
            value: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          // Create a new value from the user input
          setValue({
            value: newValue.inputValue,
          });
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(options: any, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some(
          (option) => inputValue === option.value
        );
        if (inputValue !== "" && !isExisting) {
          filtered.push({
            inputValue,
            value: `Add "${inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={options}
      getOptionLabel={(option: any) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.value;
      }}
      renderOption={(props, option: any) => <li {...props}>{option.value}</li>}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputLabelProps={{ ...InputLabelProps }}
        />
      )}
      PaperComponent={({ children }) => (
        <Paper {...OptionsProps}>{children}</Paper>
      )}
    />
  );
}
