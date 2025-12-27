// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";

function App() {
  /* ---------- CART STATE ---------- */
  const [cartItems, setCartItems] = useState([]);
  const [auth, setAuth] = useState({
  isLoggedIn: false,
  role: "",   // "admin" | "user"
  email: "",
});


  /* ---------- DEBUG CART ---------- */
  useEffect(() => {
    console.log("🛒 Cart updated:", cartItems);
  }, [cartItems]);

  /* ---------- ADD TO CART ---------- */
  const addToCart = (book) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === book.id);

      if (exists) {
        return prev.map((item) =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...book, quantity: 1 }];
    });
  };

  /* ---------- CART HELPERS ---------- */
  const incrementQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              auth={auth}              
              addToCart={addToCart}
              cartItems={cartItems}
              incrementQty={incrementQty}
              decrementQty={decrementQty}
              removeFromCart={removeFromCart}
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
