// app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bookRoutes = require("./routes/books");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const customerRoutes = require("./routes/customer");

const app = express();

// Middleware
app.use(cors()); // Allows React to talk to Node
app.use(express.json()); // Parses incoming JSON data

// Use Routes
// Every route inside bookRoutes will now start with /api/books
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/customer", customerRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
