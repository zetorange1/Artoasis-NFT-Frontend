import { Button, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Grid
      container
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <Typography fontSize={28} mt={2} color="#fff">
        404 Page Not Found.
      </Typography>
      <Grid item>
        <Typography fontSize={18} mt={2} color="#fff">
          Look like you'are lost
        </Typography>
      </Grid>
      <Grid item>
        <Link to="/" style={{ textDecoration: "none", color: "unset" }}>
          <Button variant="outlined" color="secondary">
            Go to Home
          </Button>
        </Link>
      </Grid>
    </Grid>
  );
}
