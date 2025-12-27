import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import axios from "axios";

const drawerWidth = 240;
const navbarHeight = 64;

const categories = [
  "Science",
  "Art",
  "Religion",
  "History",
  "Geography",
];

export default function SideBar({ isAdmin }) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [orders, setOrders] = useState([]);



  const [book, setBook] = useState({
    isbn: "",
    title: "",
    authors: [""],
    publisherName: "",
    publicationYear: "",
    price: "",
    category: "",
    threshold: "",
    stockLevel:"",
  });

  const validate = () => {
  const newErrors = {};

  // ISBN: numbers only, not empty
  if (!/^\d+$/.test(book.isbn)) {
    newErrors.isbn = "ISBN must contain numbers only";
  }

  // Title: letters, spaces, numbers allowed
  if (!book.title.trim()) {
    newErrors.title = "Title is required";
  }

  // Authors: letters & spaces only
  book.authors.forEach((author, i) => {
    if (!/^[a-zA-Z\s]+$/.test(author.trim())) {
      newErrors[`author${i}`] = "Author name must contain letters only";
    }
  });

  // Publisher name
  if (!/^[a-zA-Z\s]+$/.test(book.publisherName.trim())) {
    newErrors.publisherName = "Publisher name must contain letters only";
  }

  // Publication year
  if (
    !Number.isInteger(Number(book.publicationYear)) ||
    Number(book.publicationYear) < 0
  ) {
    newErrors.publicationYear = "Year must be a positive number";
  }

  // Price
  if (Number(book.price) < 0) {
    newErrors.price = "Price cannot be negative";
  }

  // Threshold
  if (Number(book.threshold) < 0) {
    newErrors.threshold = "Threshold cannot be negative";
  }

  // Stock level
  if (Number(book.stockLevel) < 0) {
    newErrors.stockLevel = "Stock level cannot be negative";
  }

  // Category
  if (!book.category) {
    newErrors.category = "Category is required";
  }

  setErrors(newErrors);

  // if no errors → valid
  return Object.keys(newErrors).length === 0;
};


  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleAuthorChange = (i, value) => {
    const updated = [...book.authors];
    updated[i] = value;
    setBook({ ...book, authors: updated });
  };

  const addAuthor = () => {
    setBook({ ...book, authors: [...book.authors, ""] });
  };

 const handleSubmit = async () => {
  if (!validate()) return; //  stop if invalid

  try {
    const bookRes = {
      role: "admin",

      isbn: book.isbn,
      title: book.title,

      publication_year: Number(book.publicationYear),
      selling_price: Number(book.price),
      stock_level: Number(book.threshold),

      publisher_name: book.publisherName,
      category_name: book.category,
      book_image: null,
    };

    await axios.post("http://localhost:8080/book", bookRes);

    setOpen(false);
    alert("Book added successfully");
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Failed to add book");
  }
};

const fetchHistory = async () => {
  try {
    // replace 1 with logged-in customer id
    const res = await axios.get(
      "http://localhost:8080/orders/history/"
    );

    // group by order number
    const grouped = {};
    res.data.forEach((row) => {
      if (!grouped[row.order_no]) {
        grouped[row.order_no] = {
          order_no: row.order_no,
          order_date: row.order_date,
          total_price: row.total_price,
          books: [],
        };
      }
      grouped[row.order_no].books.push({
        isbn: row.isbn,
        title: row.book_name,
        quantity: row.quantity,
        price: row.price,
      });
    });

    setOrders(Object.values(grouped));
  } catch (err) {
    console.error(err);
    alert("Failed to load order history");
  }
};




  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            top: `${navbarHeight}px`,
            height: `calc(100vh - ${navbarHeight}px)`,
          },
        }}
      >

        <List>
          {!isAdmin && (
            <>
              <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setHistoryOpen(true);
                  fetchHistory();
                }}
              >
                <ListItemIcon>
                  <InventoryIcon />
                </ListItemIcon>
                <ListItemText primary="Past Orders" />
              </ListItemButton>
            </ListItem>


              <Divider />


            </>
          )}
        </List>
        <List>
          {isAdmin && (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={() => setOpen(true)}>
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Add New Book" />
                </ListItemButton>
              </ListItem>

              <Divider />

              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <InventoryIcon />
                  </ListItemIcon>
                  <ListItemText primary="Confirm Orders" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* DIALOG INSIDE SIDEBAR */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Book</DialogTitle>

        <DialogContent dividers>
          <TextField
            fullWidth
            label="ISBN"
            name="isbn"
            onChange={handleChange}
            margin="normal"
            error={!!errors.isbn}
            helperText={errors.isbn}
          />

          <TextField
            fullWidth
            label="Title"
            name="title"
            onChange={handleChange}
            margin="normal"
            error={!!errors.title}
            helperText={errors.title}
          />


          {book.authors.map((author, i) => (
            <TextField
              key={i}
              fullWidth
              label={`Author ${i + 1}`}
              value={author}
              onChange={(e) => handleAuthorChange(i, e.target.value)}
              margin="normal"
            />
          ))}

          <Button onClick={addAuthor} sx={{ mb: 2 }}>
            + Add Author
          </Button>

          <TextField fullWidth label="Publisher Name" name="publisherName" onChange={handleChange} margin="normal" error={!!errors.price}
          helperText={errors.price} />
                    <TextField
          fullWidth
          type="number"
          label="Publication Year"
          name="publicationYear"
          onChange={handleChange}
          margin="normal"
          error={!!errors.publicationYear}
          helperText={errors.publicationYear}
        />

            <TextField
            fullWidth
            type="number"
            label="Price"
            name="price"
            onChange={handleChange}
            margin="normal"
            error={!!errors.price}
            helperText={errors.price}
          />

          <TextField fullWidth type="number" label="Threshold" name="threshold" onChange={handleChange} margin="normal" error={!!errors.threshold}
          helperText={errors.threshold} />
          <TextField fullWidth type="number" label="stockLevel" name="stockLevel" onChange={handleChange} margin="normal" error={!!errors.stockLevel}
          helperText={errors.stockLevel} />

          <TextField select fullWidth label="Category" name="category" onChange={handleChange} margin="normal">
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
  open={historyOpen}
  onClose={() => setHistoryOpen(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Order History</DialogTitle>

  <DialogContent dividers>
    {orders.length === 0 && (
      <p>No previous orders found.</p>
    )}

    {orders.map((order) => (
      <div key={order.order_no} style={{ marginBottom: 20 }}>
        <h3>Order #{order.order_no}</h3>
        <p>Date: {order.order_date}</p>
        <p>Total: {order.total_price} EGP</p>

        <Divider sx={{ my: 1 }} />

        {order.books.map((book, i) => (
          <div key={i} style={{ marginLeft: 10 }}>
            <p>
              <b>{book.title}</b> (ISBN: {book.isbn})
            </p>
            <p>
              Qty: {book.quantity} — Price: {book.price} EGP
            </p>
          </div>
        ))}
      </div>
    ))}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setHistoryOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>

    </>
  );
}
