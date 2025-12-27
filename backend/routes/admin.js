const express = require("express");
const router = express.Router();
const db = require("../db");

// total sales in previous month
router.get("/sales/previousMonth", async (req, res) => {
	try {
		const sql = `
            SELECT SUM(soi.quantity * soi.unit_price) AS total_sales
            FROM Sales_Order_Items AS soi 
            JOIN Sales_Orders AS so ON soi.sales_order_id = so.sales_order_id
            WHERE YEAR(so.order_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
            AND MONTH(so.order_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
        `;

		const [rows] = await db.query(sql);
		res.json({ totalSales: rows[0].total_sales || 0 });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// total sales of books on a certain day
router.get("/sales/day", async (req, res) => {
	try {
		const sql = `
            SELECT 
            SUM(soi.quantity*soi.unit_price) As total_sales_for_books_on_certain_day
            FROM Sales_Order_Items as soi 
            JOIN Sales_Orders as so ON soi.sales_order_id=so.sales_order_id
            WHERE DATE(so.order_date)=""
        `;

		const [rows] = await db.query(sql);
		res.json({ totalSales: rows[0].total_sales || 0 });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});
// top 5 customers
router.get("/sales/customer", async (req, res) => {
	try {
		const sql = `
            SELECT 
                u.first_name,
                u.last_name,
                SUM(soi.quantity * soi.unit_price) AS total_purchase
            FROM Users AS u
            JOIN Customers AS c ON u.user_id = c.customer_id
            JOIN Sales_Orders AS so ON c.customer_id = so.customer_id
            JOIN Sales_Order_Items AS soi ON so.sales_order_id = soi.sales_order_id
            WHERE so.order_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
            GROUP BY c.customer_id
            ORDER BY total_purchase DESC
            LIMIT 5
        `;
		const [rows] = await db.query(sql);
		res.json({ totalSales: rows[0].total_sales || 0 });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

//top 10 Selling Book
router.get("/sales/customer", async (req, res) => {
	try {
		const sql = `
            SELECT 
                b.title,
                b.book_image,
                SUM(soi.quantity) AS number_of_copies_sold
            FROM Books AS b
            JOIN Sales_Order_Items AS soi ON b.isbn = soi.isbn
            JOIN Sales_Orders AS so ON soi.sales_order_id = so.sales_order_id
            WHERE so.order_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
            GROUP BY b.isbn, b.title, b.book_image
            ORDER BY number_of_copies_sold DESC
            LIMIT 10
        `;
		const [rows] = await db.query(sql);
		res.json({ totalSales: rows[0].total_sales || 0 });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

//book order times
router.get("/sales/customer", async (req, res) => {
	try {
		const sql = `
            SELECT 
            b.title,
            b.book_image,
            COUNT(po.order_id) AS total_number_of_times 
            FROM Books as b 
            JOIN Publisher_Orders AS po ON b.isbn=po.isbn
            WHERE b.title=""
        `;
		const [rows] = await db.query(sql);
		res.json({ totalSales: rows[0].total_sales || 0 });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});
