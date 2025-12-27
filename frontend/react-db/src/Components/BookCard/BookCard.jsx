import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Button from "@mui/material/Button";

export default function BookCard({ book, addToCart, isAdmin }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        display: "flex",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 4,
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, outline 0.3s ease",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: 12,
          outline: "3px solid #554c4cff",
          outlineOffset: "2px",
        },
      }}
    >
      {/* Image */}
      <CardMedia
        component="img"
        sx={{ width: 151, flexShrink: 0 }}
        image={book.image}
        alt={book.title}
      />

      {/* Content */}
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h5">{book.title}</Typography>
          <Typography color="text.secondary">{book.author}</Typography>

          {book.description && (
            <Typography sx={{ mt: 1 }}>{book.description}</Typography>
          )}
        </CardContent>

        {/* ACTION BUTTONS */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, p: 2 }}>
          {/* USER */}
          {!isAdmin && (
            <Button
              variant="contained"
              endIcon={<AddShoppingCartIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                bgcolor: "#C4A484",
              }}
              onClick={() => addToCart(book)}
            >
              Add to Cart
            </Button>
          )}

          {/* ADMIN */}
          {isAdmin && (
            <>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => {
                  console.log("RESTOCK BOOK:", book);
                }}
              >
                Restock
              </Button>

              <Button
                variant="outlined"
                color="info"
                onClick={() => {
                  console.log("UPDATE BOOK:", book);
                }}
              >
                Update
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Card>
  );
}
