const express = require("express");
const router = express.Router();
const db = require("../db");

// checkout your cart
router.post("/", async (req, res) => {
	const { customer_email, card_number, expiry_date } = req.body;
	const connection = await db.getConnection();

	try {
		await connection.beginTransaction();

		// find Customer ID by Email
		const [customerSearch] = await connection.query(
			`SELECT c.customer_id 
             FROM Users u 
             JOIN Customers c ON u.user_id = c.customer_id 
             WHERE u.email = ?`,
			[customer_email]
		);

		if (customerSearch.length === 0) {
			throw new Error("Customer not found with this email.");
		}

		const customerId = customerSearch[0].customer_id;

		// 1. Get Cart Items
		const [cartItems] = await connection.query(
			"SELECT ci.isbn, ci.quantity, b.selling_price, b.stock_level FROM Cart_Items ci JOIN Books b ON ci.isbn = b.isbn WHERE ci.cart_id = (SELECT cart_id FROM Shopping_Cart WHERE customer_id = ?)",
			[customerId]
		);

		if (cartItems.length === 0) throw new Error("Cart is empty");

		// 2. Create Sales_Order
		const [orderRes] = await connection.query(
			"INSERT INTO Sales_Orders (customer_id) VALUES (?)",
			[customerId]
		);
		const orderId = orderRes.insertId;

		for (const item of cartItems) {
			// Check stock
			if (item.stock_level < item.quantity)
				throw new Error(`Not enough stock for ${item.isbn}`);

			// Deduct Stock
			await connection.query(
				"UPDATE Books SET stock_level = stock_level - ? WHERE isbn = ?",
				[item.quantity, item.isbn]
			);

			// add to Sales_Order_Items
			await connection.query(
				"INSERT INTO Sales_Order_Items (sales_order_id, isbn, quantity, unit_price) VALUES (?, ?, ?, ?)",
				[orderId, item.isbn, item.quantity, item.selling_price]
			);
		}

		// Clear Cart
		await connection.query(
			"DELETE FROM Cart_Items WHERE cart_id = (SELECT cart_id FROM Shopping_Cart WHERE customer_id = ?)",
			[customerId]
		);

		await connection.commit();
		res.json({ message: "Checkout successful!", orderId });
	} catch (err) {
		await connection.rollback();
		res.status(400).json({ error: err.message });
	} finally {
		connection.release();
	}
});

// view cart
router.get("/cartDisplay", async (req, res) => {
	const { customer_email } = req.params;

	try {
		// 1. Find Customer ID by Email
		const [customerSearch] = await connection.query(
			`SELECT c.customer_id 
             FROM Users u 
             JOIN Customers c ON u.user_id = c.customer_id 
             WHERE u.email = ?`,
			[customer_email]
		);

		if (customerSearch.length === 0) {
			throw new Error("Customer not found with this email.");
		}

		const customerId = customerSearch[0].customer_id;
		const sql = `
                    SELECT 
                        b.title,
                        b.book_image,
                        ci.quantity,
                        b.selling_price,
                        (ci.quantity * b.selling_price) AS item_total,
                        SUM(ci.quantity * b.selling_price) OVER () AS cart_total -- OVER keeps the rows as it is not like GROUP BY
                    FROM Shopping_Cart sc
                    JOIN Cart_Items ci ON sc.cart_id = ci.cart_id
                    JOIN Books b ON ci.isbn = b.isbn
                    WHERE sc.customer_id = ?`;

		const [items] = await db.query(sql, [customerId]);

		res.json({
			items,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// add item to cart
router.post("/cart/remove", async (req, res) => {
	const { customer_email, isbn, quantity } = req.body;

	try {
		//find Customer ID by Email
		const [customerSearch] = await connection.query(
			`SELECT c.customer_id 
             FROM Users u 
             JOIN Customers c ON u.user_id = c.customer_id 
             WHERE u.email = ?`,
			[customer_email]
		);
		if (customerSearch.length === 0) {
			throw new Error("Customer not found with this email.");
		}

		const customerId = customerSearch[0].customer_id;
		//find cart id of this customer
		const [cartSearch] = await connection.query(
			`SELECT sc.cart_id
             FROM Shopping_Cart sc
             WHERE sc.customer_id = ?`,
			[customerId]
		);
		if (cartSearch.length === 0) {
			throw new Error("Customer not found with this email.");
		}

		const cartId = customerSearch[0].customer_id;

		const sql = `
            INSERT INTO Cart_Items(cartId,isbn,quantity) VALUES(?,?) `;

		await db.query(sql, [cartId, isbn, quantity]);
		res.json({ message: "Item added to cart." });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// delete item from cart
router.delete("/cart/remove", async (req, res) => {
	const { customer_email, isbn } = req.body;

	try {
		// 1. Find Customer ID by Email
		const [customerSearch] = await connection.query(
			`SELECT c.customer_id 
             FROM Users u 
             JOIN Customers c ON u.user_id = c.customer_id 
             WHERE u.email = ?`,
			[customer_email]
		);

		if (customerSearch.length === 0) {
			throw new Error("Customer not found with this email.");
		}

		const customerId = customerSearch[0].customer_id;
		const sql = `
            DELETE FROM Cart_Items 
            WHERE isbn = ? AND cart_id = (SELECT cart_id FROM Shopping_Cart WHERE customer_id = ?)`;

		await db.query(sql, [isbn, customerId]);
		res.json({ message: "Item removed from cart." });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});
module.exports = router;
