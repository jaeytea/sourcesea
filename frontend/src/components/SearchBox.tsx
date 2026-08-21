import SearchIcon from "@mui/icons-material/Search";
import { Button, InputAdornment, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onCreate: () => void;
}

export function SearchBox({ value, onChange, onCreate }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: "space-between",
      }}
    >
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search your parked tabs"
        aria-label="Search your parked tabs"
        fullWidth
        size="small"
        sx={{
          width: "99%",
          "& .MuiOutlinedInput-root": {
            backgroundColor: "background.paper",
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
      <Button
        variant="contained"
        onClick={onCreate}
        sx={{
          width: "20%",
          flex: "flex-wrap",
          borderRadius: 1,
          textTransform: "none",
        }}
      >
        <AddIcon /> Create New
      </Button>
    </div>
  );
}
