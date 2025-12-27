// src/api/books.js
const BASE_URL = "http://localhost:5050/api/books";

export const fetchBooks = async () => {
	try {
		const res = await fetch(BASE_URL, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				// Only include Authorization if you have implemented JWT in app.js
				// "Authorization": `Bearer ${TOKEN}`,
			},
		});

		if (!res.ok) throw new Error("Failed to fetch books");

		const data = await res.json();

		// In your backend, 'data' is already the array of books
		const books = data.map((b) => ({
			isbn: b.isbn,
			title: b.title,
			author: b.author_name || "Unknown Author", // Matches your schema
			image: b.book_image, // Uses your book_image column
			price: b.selling_price,
		}));

		return { books };
	} catch (error) {
		console.error("Error fetching books:", error);
		return { books: [] };
	}
};
