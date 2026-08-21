import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: Props) {
  return (
    <TextField
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search your parked tabs"
      aria-label="Search your parked tabs"
      fullWidth
      size="small"
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "white",
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
}
