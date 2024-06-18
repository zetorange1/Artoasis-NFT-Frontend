import { Grid, CardContent, Typography, Box, Card } from "@mui/material";

const cards = [
  {
    title: "Items",
    key: "items",
  },
  {
    title: "Owners",
    key: "owners",
  },
  {
    title: "Floor Price",
    key: "floorPrice",
  },
  {
    title: "Volume traded",
    key: "totalVolume",
  },
];

export default function Volumes({ data }: any) {
  return (
    <Grid container spacing={3} justifyContent="center">
      {cards.map((card) => (
        <Grid item xs={2} key={card.title}>
          <Card className="shadow-widget">
            <CardContent>
              <Box textAlign="center" py={3}>
                <Typography gutterBottom fontWeight="bold">
                  {data[card.key]}
                </Typography>
                <Typography variant="subtitle2">{card.title}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
