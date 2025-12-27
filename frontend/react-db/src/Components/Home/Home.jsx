import React, { useEffect, useState } from "react";
import { fetchBooks } from "../../api/books";
import BookCard from "../BookCard/BookCard";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import HomeNavbar from "../HomeNavbar/HomeNavbar";
import SideBar from "../SideBar/SideBar";

const drawerWidth = 240;
const navbarHeight = 64;

export default function Home({
  auth,
  addToCart,
  cartItems,
  incrementQty,
  decrementQty,
  removeFromCart,
  onLogout,  
}) {

  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    const getBooks = async () => {
      const data = await fetchBooks(currentPage);
      setBooks(data.books);
      setTotalPages(data.totalPages);
    };
    getBooks();
  }, [currentPage]);
// ---------------- FETCH CART WHEN CART OPENS ----------------
useEffect(() => {
  if (cartOpen) {
    fetchCart();
  }
}, [cartOpen]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#d2c3b4ff",
        overflowX: "hidden", 
      }}
    >
      {/* NAVBAR */}
     <HomeNavbar
      cartItems={cartItems}
      incrementQty={incrementQty}
      decrementQty={decrementQty}
      removeFromCart={removeFromCart}
      isAdmin={auth.role === "admin"}
      setBooks={setBooks}
      onLogout={onLogout}
    />




      {/* SIDEBAR (RENDER ONCE) */}
      <SideBar isAdmin={auth.role === "admin"} />

      {/* MAIN CONTENT */}
      <main
        style={{
          marginTop: navbarHeight,
          marginLeft: drawerWidth,   
          padding: "40px",
          color: "white",
          minHeight: `calc(100vh - ${navbarHeight}px)`,
        }}
      >
        <h1>Welcome to the Bookstore</h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              addToCart={addToCart}
              isAdmin={auth.role === "admin"}
            />
          ))}
        </div>

        <Stack spacing={2} alignItems="center" sx={{ mt: 4, mb: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, value) => setCurrentPage(value)}
            size="large"
          />
        </Stack>
      </main>
    </div>
  );
}
