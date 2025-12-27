import  { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";


export default function BookCard({ book, addToCart, isAdmin, adminEmail }) {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);


  // Per-field errors (shown immediately)
  const [errors, setErrors] = useState({});

  // Controlled form
  const [form, setForm] = useState({
    isbn: "",
    title: "",
    quantity: "",
    stock_level: "",
    threshold: "",
  });

  // ---------- OPEN UPDATE DIALOG ----------
  const openDialog = () => {
    setForm({
      isbn: "",
      title: "",
      quantity: "",
      stock_level: "",
      threshold: "",
    });
    setErrors({});
    setOpenUpdate(true);
  };

  // ---------- FIELD VALIDATION (REAL-TIME) ----------
  const validateField = (name, value) => {
    let msg = "";

    if (name === "isbn" && value !== "" && !/^\d+$/.test(value)) {
      msg = "ISBN must contain numbers only";
    }

    if (
      name === "title" &&
      value !== "" &&
      !/^[a-zA-Z0-9\s]+$/.test(value)
    ) {
      msg = "Title contains invalid characters";
    }

    if (
      ["quantity", "stock_level", "threshold"].includes(name) &&
      value !== "" &&
      (isNaN(Number(value)) || Number(value) < 0)
    ) {
      msg = "Value cannot be negative";
    }

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  // ---------- INPUT CHANGE ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value); // immediate feedback
  };

  // ---------- HELPERS ----------
  const hasChanges = () => Object.values(form).some((v) => v !== "");
  const isFormValid = () => Object.values(errors).every((e) => !e);

  // ---------- UPDATE ----------
  const handleUpdate = async () => {
    // If nothing entered → close silently (no backend call)
    if (!hasChanges()) {
      setOpenUpdate(false);
      return;
    }

    // If any validation error → keep dialog open
    if (!isFormValid()) return;

    const payload = {
      role: "admin",
      isbn: form.isbn || book.isbn,
      title: form.title || book.title,
      quantity: form.quantity === "" ? book.quantity : Number(form.quantity),
      stock_level:
        form.stock_level === "" ? book.stock_level : Number(form.stock_level),
      threshold:
        form.threshold === "" ? book.threshold : Number(form.threshold),
    };

    try {
      await axios.put(`http://localhost:8080/book/`, payload);
      alert("Book updated successfully");
      setOpenUpdate(false); // close on success
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to update book");
    }
  };

  // ---------- RESTOCK ----------
const handleRestock = async () => {
  try {
    await axios.put("http://localhost:8080/order", {
      role: "admin",
      admin_email: adminEmail,  
      isbn: book.isbn,
      publisher_name: book.publisher_name,
    });

    alert("Book restocked successfully");
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Failed to restock book");
  }
};


  return (
    <>
      {/* ================= CARD ================= */}
      <Card
        sx={{
          display: "flex",
          width: "100%",          
          maxWidth: "900px",
          margin: "0 auto",
          boxSizing: "border-box", 
          overflow: "hidden",      
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: 4,
        }}
      >
        <CardMedia
          component="img"
          image={book.image}
          alt={book.title}
          sx={{
            width: 150,
            minWidth: 150,          // prevent image squeeze
            objectFit: "cover",
          }}
        />

        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <CardContent>
            <Typography variant="h5">{book.title}</Typography>
            <Typography>ISBN: {book.isbn}</Typography>
            <Typography>
              Authors:{" "}
              {Array.isArray(book.authors)
                ? book.authors
                    .map((a) => (typeof a === "string" ? a : a.name))
                    .join(", ")
                : "N/A"}
            </Typography>
            <Typography>Stock: {book.stock_level}</Typography>
            <Typography>Threshold: {book.threshold}</Typography>
          </CardContent>

          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, gap: 1 }}>
            {!isAdmin && (
            <Button
            variant="contained"
            endIcon={<AddShoppingCartIcon />}
            onClick={() => {
              addToCart(book);
              setOpenAlert(true);
            }}
            sx={{
              backgroundColor: "#d8ac81ff",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#c7966b",
              },
            }}
          >
            Add to Cart
          </Button>

          )}


            {isAdmin && (
              <>
                <Button variant="outlined" color="warning" onClick={handleRestock}>
                  Restock
                </Button>
                <Button variant="outlined" color="info" onClick={openDialog}>
                  Update
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Card>

      {/* ================= UPDATE DIALOG ================= */}
      <Dialog
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Book</DialogTitle>

        <DialogContent dividers>
          {["isbn", "title", "quantity", "stock_level", "threshold"].map(
            (field) => (
              <TextField
                key={field}
                fullWidth
                margin="normal"
                name={field}
                label={field.replace("_", " ").toUpperCase()}
                type={
                  ["quantity", "stock_level", "threshold"].includes(field)
                    ? "number"
                    : "text"
                }
                value={form[field]}
                placeholder={String(book[field] ?? "")}
                onChange={handleChange}
                error={!!errors[field]}
                helperText={errors[field] || " "}
              />
            )
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenUpdate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openAlert}
        autoHideDuration={3000}
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenAlert(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Book added to cart successfully!
        </Alert>
      </Snackbar>

    </>



  );
  
}
