const express = require("express");
const router = express.Router();
const db = require("../db");

// signup
router.post("/signup", async (req, res) => {
	const {
		first_name,
		last_name,
		email,
		password,
		phone_number,
		shipping_address,
	} = req.body;

	try {
		// 1. Check if email already exists
		const [existingUser] = await db.query(
			"SELECT email FROM Users WHERE email = ?",
			[email]
		);

		if (existingUser.length > 0) {
			return res
				.status(400)
				.json({ error: "Email is already registered. Please log in." });
		}

		const connection = await db.getConnection();
		try {
			await connection.beginTransaction();

			// 2. Insert into Users table
			const [userRes] = await connection.query(
				"INSERT INTO Users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
				[first_name, last_name, email, password]
			);
			const userId = userRes.insertId;

			// 3. Insert into Customers table
			await connection.query(
				"INSERT INTO Customers (customer_id, phone_number, shipping_address) VALUES (?, ?, ?)",
				[userId, phone_number, shipping_address]
			);

			// 4. Initialize an empty shopping cart
			await connection.query(
				"INSERT INTO Shopping_Cart (customer_id) VALUES (?)",
				[userId]
			);

			await connection.commit();
			res.status(201).json({ message: "Customer registered successfully!" });
		} catch (err) {
			await connection.rollback();
			throw err; // Pass to the outer catch
		} finally {
			connection.release();
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Database error during registration." });
	}
});

// login
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		// 1. Find the user by email
		const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [
			email,
		]);

		if (users.length === 0) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const user = users[0];

		// Check password
		if (user.password !== password) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		//Determine if they are an Admin or a Customer
		const [admin] = await db.query(
			"SELECT admin_id FROM Admins WHERE admin_id = ?",
			[user.user_id]
		);
		const [customer] = await db.query(
			"SELECT customer_id FROM Customers WHERE customer_id = ?",
			[user.user_id]
		);

		let role = "user";
		if (admin.length > 0) role = "admin";
		else if (customer.length > 0) role = "customer";

		// Send back user info
		res.json({
			message: "Login successful",
			user: {
				id: user.user_id,
				first_name: user.first_name,
				last_name: user.last_name,
				email: user.email,
				role: role,
			},
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

//logout
router.post("/logout", async (req, res) => {
	const { customer_id } = req.body;
	try {
		await db.query(
			"DELETE FROM Cart_Items WHERE cart_id = (SELECT cart_id FROM Shopping_Cart WHERE customer_id = ?)",
			[customer_id]
		);
		res.json({ message: "Logged out and cart cleared." });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
