// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import axios from "axios";

function App() {
  /* ---------- CART STATE ---------- */
  const [cartItems, setCartItems] = useState([]);
  const [auth, setAuth] = useState({
  isLoggedIn: false,
  role: "",   // "admin" | "user"
  email: "",
});
const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);



  /* ---------- DEBUG CART ---------- */
  useEffect(() => {
    console.log("🛒 Cart updated:", cartItems);
  }, [cartItems]);

  /* ---------- ADD TO CART ---------- */
const addToCart = async (book) => {
  try {
    await axios.post("http://localhost:8080/cart/add", {
      customer_email: auth.email,
      isbn: book.isbn,
      quantity: 1,
    });

    fetchCart(); // refresh cart
  } catch (err) {
    console.error(err);
  }
};


  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5050/api/users/logout", {
        customer_id: auth.customer_id,
      });
    } catch (err) {
      console.error("Backend logout failed", err);
    }

    // 🔹 frontend cleanup
    setCartItems([]);
    setAuth({
      isLoggedIn: false,
      role: null,
      email: null,
      customer_id: null,
    });

    localStorage.removeItem("auth");
    localStorage.removeItem("cart");

    setLogoutAlertOpen(true);
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

const removeFromCart = async (isbn) => {
  try {
    await axios.delete("http://localhost:8080/cart/remove", {
      data: {
        customer_email: auth.email,
        isbn,
      },
    });

    fetchCart();
  } catch (err) {
    console.error(err);
  }
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
            onLogout={handleLogout}  
          />


          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
