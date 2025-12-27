const express = require("express");
const router = express.Router();
const db = require("../db");

// confirm order --> change the order id request body
router.patch("/confirm", async (req, res) => {
	const { orderId } = req.body;
	const connection = await db.getConnection(); // Get a single connection for the transaction

	try {
		await connection.beginTransaction();

		// 1. Get the order details (ISBN and Quantity)
		const [order] = await connection.query(
			"SELECT isbn, quantity, Status FROM Publisher_Orders WHERE order_id = ?",
			[orderId]
		);

		if (order.length === 0) {
			throw new Error("Order not found");
		}

		if (order[0].Status === "Confirmed") {
			throw new Error("Order has already been confirmed");
		}

		const { ISBN, Quantity } = order[0];

		// 2. Update Order Status to 'Confirmed'
		await connection.query(
			'UPDATE Publisher_Orders SET Status = "Confirmed" WHERE order_id = ?',
			[orderId]
		);

		// 3. Update Book Stock: Add the ordered quantity to current stock
		await connection.query(
			"UPDATE Books SET stock_level = QuantityInStock + ? WHERE ISBN = ?",
			[Quantity, ISBN]
		);

		// Commit both changes to the database
		await connection.commit();
		res.json({ message: "Order confirmed and stock updated successfully!" });
	} catch (err) {
		// If anything fails, undo all changes in this block
		await connection.rollback();
		res.status(500).json({ error: err.message });
	} finally {
		connection.release(); // Return connection to the pool
	}
});

// admin places publisher order
router.post("/order", async (req, res) => {
	const { role, admin_email, isbn, publisher_name } = req.body;
	const QUANTITY = 50;

	if (role !== "admin") return res.status(403).json({ error: "Unauthorized" });

	try {
		// find admin id by Email
		const [adminSearch] = await connection.query(
			`SELECT a.admin 
             FROM Users u 
             JOIN Admins a ON u.user_id = a.admin_id
             WHERE u.email = ?`,
			[admin_email]
		);
		if (adminSearch.length === 0)
			return res.status(404).json({ error: "admin not found" });

		// find publisher id by name
		const [pub] = await db.query(
			"SELECT publisher_id FROM Publishers WHERE name = ?",
			[publisher_name]
		);

		if (pub.length === 0)
			return res.status(404).json({ error: "Publisher not found" });
		const pub_id = pub[0].publisher_id;

		const sql = `INSERT INTO Publisher_Orders (admin_id, publisher_id, isbn, quantity, status) VALUES (?, ?, ?, 'PENDING')`;
		await db.query(sql, [admin_id, pub_id, isbn, QUANTITY]);

		res.json({ message: "Order placed in Publisher_Orders table!" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
