const express = require("express");
const router = express.Router();
const db = require("../db"); // Your database connection pool

// to display books on main page
router.get("/", async (req, res) => {
	try {
		const sql = `
            SELECT 
                b.isbn, 
                b.title, 
                b.publication_year, 
                b.selling_price, 
                b.stock_level, 
                p.name AS publisher_name, 
                c.name 
            FROM Books b
            LEFT JOIN Publishers p ON b.publisher_id = p.publisher_id
            LEFT JOIN Category c ON b.category_id = c.category_id
        `;

		const [rows] = await db.query(sql);
		res.json(rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// add new book
router.post("/book", async (req, res) => {
	const {
		role,
		isbn,
		title,
		publication_year,
		selling_price,
		stock_level,
		publisher_name,
		category_name,
		book_image,
	} = req.body;

	if (!role || role.toLowerCase() !== "admin") {
		return res.status(403).json({
			error: "Access Denied. Only Admins can add new books.",
		});
	}

	try {
		// 1. Find Publisher ID
		const [pubRows] = await db.query(
			"SELECT publisher_id FROM Publishers WHERE name = ?",
			[publisher_name]
		);
		if (pubRows.length === 0) {
			return res
				.status(400)
				.json({ error: `Publisher '${publisher_name}' not found.` });
		}
		const publisher_id = pubRows[0].publisher_id;

		// 2. Find Category ID
		const [catRows] = await db.query(
			"SELECT category_id FROM Category WHERE name = ?",
			[category_name]
		);
		if (catRows.length === 0) {
			return res
				.status(400)
				.json({ error: `Category '${category_name}' not found.` });
		}
		const category_id = catRows[0].category_id;

		// 3. Insert the Book using the IDs found
		const insertSql = `
            INSERT INTO Books (
                isbn, title, publication_year, selling_price, 
                stock_level, publisher_id, category_id, book_image
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

		await db.query(insertSql, [
			isbn,
			title,
			publication_year,
			selling_price,
			stock_level,
			publisher_id,
			category_id,
			book_image,
		]);

		res
			.status(201)
			.json({ message: "Book added successfully with mapped IDs!" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Database error: " + err.message });
	}
});

// modify an existing book

router.put("/book", async (req, res) => {
	const { role, isbn, title, price, category, stock_level, publisher } =
		req.body;
	if (!role || role.toLowerCase() !== "admin") {
		return res.status(403).json({
			error: "Access Denied. Only Admins can update books.",
		});
	}

	try {
		// 1. Find Publisher ID
		const [pubRows] = await db.query(
			"SELECT publisher_id FROM Publishers WHERE name = ?",
			[publisher_name]
		);
		if (pubRows.length === 0) {
			return res
				.status(400)
				.json({ error: `Publisher '${publisher_name}' not found.` });
		}
		const publisher_id = pubRows[0].publisher_id;

		// 2. Find Category ID
		const [catRows] = await db.query(
			"SELECT category_id FROM Category WHERE  name = ?",
			[category_name]
		);
		if (catRows.length === 0) {
			return res
				.status(400)
				.json({ error: `Category '${category_name}' not found.` });
		}
		const category_id = catRows[0].category_id;

		const sql = `UPDATE BOOK SET title = ?, selling_price = ?, category_id = ? , publisher_id = ? , stock_level = ?
                     WHERE ISBN = ?`;

		// If the update violates the MySQL Trigger (e.g., negative stock), it will throw an error
		await db.query(sql, [
			title,
			price,
			category_id,
			publisher_id,
			stock_level,
			isbn,
		]);

		res.json({ message: "Book updated successfully!" });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

/**
 * 5. SEARCH FOR BOOKS
 * Requirement: Search by ISBN, Title, Category, Author, or Publisher.
 * Includes availability (QuantityInStock).
 */
router.get("/search", async (req, res) => {
	const { isbn, title, category, author, publisher } = req.query;

	// We use LEFT JOINs to gather Author and Publisher names in one go
	let sql = `
        SELECT b.*, p.Name as PublisherName, GROUP_CONCAT(a.AuthorName SEPARATOR ', ') AS Authors
        FROM BOOK b
        LEFT JOIN PUBLISHER p ON b.PublisherID = p.PublisherID
        LEFT JOIN BOOK_AUTHOR ba ON b.ISBN = ba.ISBN
        LEFT JOIN AUTHOR a ON ba.AuthorID = a.AuthorID
        WHERE 1=1
    `;
	let queryParams = [];

	if (isbn) {
		sql += " AND b.ISBN = ?";
		queryParams.push(isbn);
	}
	if (title) {
		sql += " AND b.Title LIKE ?";
		queryParams.push(`%${title}%`);
	}
	if (category) {
		sql += " AND b.Category = ?";
		queryParams.push(category);
	}
	if (publisher) {
		sql += " AND p.Name LIKE ?";
		queryParams.push(`%${publisher}%`);
	}

	sql += " GROUP BY b.ISBN";

	// Filter by Author after Grouping if needed
	if (author) {
		sql += " HAVING Authors LIKE ?";
		queryParams.push(`%${author}%`);
	}

	try {
		const [results] = await db.query(sql, queryParams);
		res.json(results);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
