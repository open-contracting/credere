import { Box, CircularProgress, Container } from "@mui/material";

export function Progress() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
      <CircularProgress className="text-grass" />
    </Box>
  );
}

function Loader() {
  return (
    <Container sx={{ height: "95vh" }}>
      <Progress />
    </Container>
  );
}

export default Loader;
