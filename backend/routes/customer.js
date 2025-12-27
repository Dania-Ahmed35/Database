const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/customer/:id/orders", async (req, res) => {
	const customer_email = req.params.id; // This is the variable

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
		const sql = `
            SELECT 
                so.sales_order_id,
                so.order_date,
                b.title,
                soi.quantity,
                soi.unit_price,
                (soi.quantity * soi.unit_price) AS item_total,
                SUM(soi.quantity * soi.unit_price) OVER (PARTITION BY so.sales_order_id) AS order_total
            FROM Sales_Order_Items AS soi
            JOIN Sales_Orders AS so ON soi.sales_order_id = so.sales_order_id
            JOIN Books AS b ON soi.isbn = b.isbn
            WHERE so.customer_id = ?  
            ORDER BY so.sales_order_id, b.title;
        `;

		// We pass customerId in the array to replace the '?'
		const [rows] = await db.query(sql, [customerId]);
		res.json(rows);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});
module.exports = router;
