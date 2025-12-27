import * as React from "react";
import SearchIcon from "@mui/icons-material/Search";
import AdbIcon from "@mui/icons-material/Adb";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  InputBase,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  TextField,
} from "@mui/material";

/* ================= CONSTANTS ================= */

const pages = ["Admin Login", "User Login"];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/* ================= VALIDATORS ================= */

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isStrongPassword = (v) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(v);
const isValidName = (v) => /^[A-Za-z]+$/.test(v);
const isValidPhone = (v) => /^[0-9]{10,15}$/.test(v);

/* ================= COMPONENT ================= */

export default function HomeNavbar({
  cartItems,
  incrementQty,
  decrementQty,
  removeFromCart,
  isAdmin,        
}) {


  /* ---------- UI STATE ---------- */
  const [openLogin, setOpenLogin] = React.useState(null); // "admin" | "user"
  const [openUserRegister, setOpenUserRegister] = React.useState(false);
  const [openAdminRegister, setOpenAdminRegister] = React.useState(false);

  /* ---------- LOGIN STATE ---------- */
  const [adminLogin, setAdminLogin] = React.useState({ email: "", password: "" });
  const [userLogin, setUserLogin] = React.useState({ email: "", password: "" });

  const [adminEmailError, setAdminEmailError] = React.useState("");
  const [adminPasswordError, setAdminPasswordError] = React.useState("");
  const [userEmailError, setUserEmailError] = React.useState("");
  const [userPasswordError, setUserPasswordError] = React.useState("");
  const [loginServerError, setLoginServerError] = React.useState("");
  const [checkoutData, setCheckoutData] = React.useState({
  address: "",
  phone: "",
  cardNumber:"",
  expiryDate:"",
});
const [openAlert, setOpenAlert] = React.useState(false);

const [checkoutErrors, setCheckoutErrors] = React.useState({
  address: "",
  phone: "",
  cardNumber:"",
  expiryDate:"",
});


  /* ---------- REGISTER STATE ---------- */
  const emptyRegister = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  };

  const [userRegister, setUserRegister] = React.useState(emptyRegister);
  const [adminRegister, setAdminRegister] = React.useState(emptyRegister);

  const [userErrors, setUserErrors] = React.useState({});
  const [adminErrors, setAdminErrors] = React.useState({});
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);

const [cartOpen, setCartOpen] = React.useState(false);
const [checkoutOpen, setCheckoutOpen] = React.useState(false);


// cart


const deleteItem = (id) => {
  setCartItems((prev) => prev.filter((item) => item.id !== id));
};

const cartTotal = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);




  /* ================= LOGIN HANDLERS ================= */

  const handleLoginChange = (role, field, value) => {
    setLoginServerError("");

    if (role === "admin") {
      setAdminLogin((p) => ({ ...p, [field]: value }));

      if (field === "email")
        setAdminEmailError(isValidEmail(value) ? "" : "Invalid email");
      if (field === "password")
        setAdminPasswordError(
          isStrongPassword(value) ? "" : "Weak password"
        );
    } else {
      setUserLogin((p) => ({ ...p, [field]: value }));

      if (field === "email")
        setUserEmailError(isValidEmail(value) ? "" : "Invalid email");
      if (field === "password")
        setUserPasswordError(
          isStrongPassword(value) ? "" : "Weak password"
        );
    }
  };

const handleLogin = async (role) => {
  const data = role === "admin" ? adminLogin : userLogin;

  const hasError =
    role === "admin"
      ? adminEmailError || adminPasswordError
      : userEmailError || userPasswordError;

  //  Stop if validation failed
  if (hasError) return;

  try {
    //  FRONTEND to BACKEND 
    console.log("LOGIN DATA SENT:", { ...data, role });

    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role }),
    });

    const result = await res.json();

    if (!res.ok) {
      setLoginServerError(result.error || "Login failed");
      return;
    }

    // ✅ SUCCESS
    setIsLoggedIn(true);
    setOpenLogin(null);
    setAdminLogin({ email: "", password: "" });
    setUserLogin({ email: "", password: "" });

  } catch (error) {
    setLoginServerError("Server error");
  }
};



  /* ================= REGISTER HANDLERS ================= */

  const validateField = (field, value, prev) => {
    let msg = "";
    if (field === "firstName" || field === "lastName")
      msg = isValidName(value) ? "" : "Letters only";
    if (field === "email") msg = isValidEmail(value) ? "" : "Invalid email";
    if (field === "phone") msg = isValidPhone(value) ? "" : "10–15 digits";
    if (field === "password")
      msg = isStrongPassword(value)
        ? ""
        : "8+ chars, upper, lower, number & symbol";

    return { ...prev, [field]: msg };
  };

  const handleRegisterChange = (role, field, value) => {
    const setter = role === "admin" ? setAdminRegister : setUserRegister;
    const errorSetter = role === "admin" ? setAdminErrors : setUserErrors;

    setter((p) => ({ ...p, [field]: value }));
    errorSetter((p) => validateField(field, value, p));
  };

  const canRegister = (errors, data) =>
    Object.values(errors).every((e) => !e) &&
    Object.values(data).every((v) => v !== "");

  const handleRegister = async (role) => {
    const data = role === "admin" ? adminRegister : userRegister;

    await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role }),
    });

    role === "admin"
      ? setOpenAdminRegister(false)
      : setOpenUserRegister(false);

    setOpenLogin(role);
  };


  // checkout
const handleCheckoutChange = (field, value) => {
  let error = "";

  // ---------- CARD NUMBER ----------
  if (field === "cardNumber") {
    // remove spaces
    const cleaned = value.replace(/\s+/g, "");

    if (!/^\d*$/.test(cleaned)) {
      error = "Card number must contain digits only";
    } else if (cleaned.length > 0 && cleaned.length !== 16) {
      error = "Card number must be 16 digits";
    }

    // format as XXXX XXXX XXXX XXXX
    value = cleaned
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  // ---------- EXPIRY DATE ----------
  if (field === "expiryDate") {
    if (!/^\d{0,2}\/?\d{0,2}$/.test(value)) {
      error = "Use MM/YY format";
    } else if (value.length === 5) {
      const [month, year] = value.split("/").map(Number);

      if (month < 1 || month > 12) {
        error = "Invalid month";
      } else {
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (
          year < currentYear ||
          (year === currentYear && month < currentMonth)
        ) {
          error = "Card has expired";
        }
      }
    }
  }

  setCheckoutData((prev) => ({
    ...prev,
    [field]: value,
  }));

  setCheckoutErrors((prev) => ({
    ...prev,
    [field]: error,
  }));
};



  /* ================= JSX ================= */

  return (
    <AppBar position="fixed" sx={{ bgcolor: "#C4A484" }}>
      <Toolbar>

        {/* LEFT */}
        <Box sx={{ flex: 1 }}>
          <AdbIcon sx={{ mr: 1 }} />
          <Typography fontWeight={700}>LOGO</Typography>
        </Box>

        {/* CENTER */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {pages.map((p) => (
            <Button
              key={p}
              sx={{ color: "white", mx: 1 }}
              onClick={() => setOpenLogin(p.includes("Admin") ? "admin" : "user")}
            >
              {p}
            </Button>
          ))}
        </Box>

        {/* RIGHT */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1,
              bgcolor: "#dccdbe",
              borderRadius: 5,
              height:'2.5rem',
              mt:'0.5rem',
            }}
          >
            <SearchIcon sx={{ fontSize: 20 }} />
            <InputBase placeholder="Search…" sx={{ ml: 1 }} />
          </Box>
          {isLoggedIn && (
          <Tooltip title="Cart">
            <IconButton onClick={() => setCartOpen(true)}>
              <ShoppingCartIcon sx={{ color: "white" }} />
            </IconButton>
          </Tooltip>
        )}

          <IconButton>
            <Avatar />
          </IconButton>
        </Box>

        {/* LOGIN DIALOG */}
        <Dialog open={Boolean(openLogin)} TransitionComponent={Transition}>
          <DialogTitle>{openLogin} Login</DialogTitle>
          <DialogContent>
            <TextField
              label="Email"
              fullWidth
              margin="dense"
              value={
                openLogin === "admin"
                  ? adminLogin.email
                  : userLogin.email
              }
              onChange={(e) =>
                handleLoginChange(openLogin, "email", e.target.value)
              }
              error={
                openLogin === "admin"
                  ? Boolean(adminEmailError)
                  : Boolean(userEmailError)
              }
              helperText={
                openLogin === "admin"
                  ? adminEmailError
                  : userEmailError
              }
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="dense"
              value={
                openLogin === "admin"
                  ? adminLogin.password
                  : userLogin.password
              }
              onChange={(e) =>
                handleLoginChange(openLogin, "password", e.target.value)
              }
              error={
                openLogin === "admin"
                  ? Boolean(adminPasswordError)
                  : Boolean(userPasswordError)
              }
              helperText={
                openLogin === "admin"
                  ? adminPasswordError
                  : userPasswordError
              }
            />

            {loginServerError && (
              <Typography color="error">{loginServerError}</Typography>
            )}

          <Typography sx={{ mt: 1, color: "black" }}>
            Don&apos;t have an account?{" "}
            <span
              style={{
                color: "#C4A484",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onClick={() => {
                setOpenLogin(null);
                openLogin === "admin"
                  ? setOpenAdminRegister(true)
                  : setOpenUserRegister(true);
              }}
            >
              Register
            </span>
          </Typography>

          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenLogin(null)}>Cancel</Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#C4A484" }}
              onClick={() => handleLogin(openLogin)}
              disabled={
              checkoutErrors.address ||
              checkoutErrors.phone ||
              checkoutErrors.cardNumber ||
              checkoutErrors.expiryDate ||
              !checkoutData.address ||
              !checkoutData.phone ||
              !checkoutData.cardNumber ||
              !checkoutData.expiryDate
            }

            >
              Login
            </Button>
          </DialogActions>
        </Dialog>

        {/* USER REGISTER */}
        <Dialog open={openUserRegister} TransitionComponent={Transition}>
          <DialogTitle>User Register</DialogTitle>
          <DialogContent>
            {Object.keys(userRegister).map((f) => (
              <TextField
                key={f}
                label={f}
                type={f === "password" ? "password" : "text"}
                fullWidth
                margin="dense"
                value={userRegister[f]}
                onChange={(e) =>
                  handleRegisterChange("user", f, e.target.value)
                }
                error={Boolean(userErrors[f])}
                helperText={userErrors[f]}
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUserRegister(false)}>Cancel</Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#C4A484" }}
              disabled={!canRegister(userErrors, userRegister)}
              onClick={() => handleRegister("user")}
            >
              Register
            </Button>
          </DialogActions>
        </Dialog>

        {/* ADMIN REGISTER */}
        <Dialog open={openAdminRegister} TransitionComponent={Transition}>
          <DialogTitle>Admin Register</DialogTitle>
          <DialogContent>
            {Object.keys(adminRegister).map((f) => (
              <TextField
                key={f}
                label={f}
                type={f === "password" ? "password" : "text"}
                fullWidth
                margin="dense"
                value={adminRegister[f]}
                onChange={(e) =>
                  handleRegisterChange("admin", f, e.target.value)
                }
                error={Boolean(adminErrors[f])}
                helperText={adminErrors[f]}
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdminRegister(false)}>Cancel</Button>
            <Button
              variant="contained"
              sx={{ bgcolor: "#C4A484" }}
              disabled={!canRegister(adminErrors, adminRegister)}
              onClick={() => handleRegister("admin")}
            >
              Register Admin
            </Button>
          </DialogActions>
        </Dialog>


{/* ================= CART DIALOG ================= */}
<Dialog
  open={cartOpen}
  onClose={() => setCartOpen(false)}
  maxWidth="sm"
  fullWidth
>
  {/* HEADER */}
  <DialogTitle>Your Cart</DialogTitle>

  {/* BODY */}
  <DialogContent>
    {cartItems.length === 0 ? (
      <Typography>Your cart is empty</Typography>
    ) : (
      cartItems.map((item) => (
        <Box key={item.id} sx={{ display: "flex", mb: 2 }}>
          <img
            src={
              item.image ||
              `https://image.tmdb.org/t/p/w200${item.poster_path}`
            }
            alt={item.title}
            style={{ width: 70, height: 100 }}
          />

          <Box sx={{ flexGrow: 1, ml: 2 }}>
            <Typography fontWeight={600}>{item.title}</Typography>
            <Typography>Quantity: {item.quantity}</Typography>
          </Box>

          <Button onClick={() => decrementQty(item.id)}>−</Button>
          <Typography>{item.quantity}</Typography>
          <Button onClick={() => incrementQty(item.id)}>+</Button>

          <IconButton
            color="error"
            onClick={() => removeFromCart(item.id)}
          >
            🗑
          </IconButton>
        </Box>
      ))
    )}
  </DialogContent>


  {/* FOOTER (TOTAL + CHECKOUT) */}
  <DialogActions
    sx={{
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
      pb: 2,
    }}
  >
    <Typography fontWeight={700}>
      Cart Total: {cartTotal} EGP
    </Typography>

    <Button
      variant="contained"
      sx={{ bgcolor: "#C4A484", width: "60%" }}
      disabled={cartItems.length === 0}
      onClick={() => {
        setCartOpen(false);
        setCheckoutOpen(true);
      }}
    >
      Checkout
    </Button>
    
  </DialogActions>
  
  {/* CLOSE BUTTON (same position as before) */}
  <DialogActions sx={{ justifyContent: "center" }}>
    <Button variant="outlined" onClick={() => setCartOpen(false)}>
      Close
    </Button>
  </DialogActions>
</Dialog>

{/* ================= CHECKOUT DIALOG ================= */}
<Dialog
  open={checkoutOpen}
  onClose={() => setCheckoutOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Checkout</DialogTitle>

  <DialogContent>
    <TextField
      label="Delivery Address"
      fullWidth
      margin="dense"
      value={checkoutData.address}
      onChange={(e) =>
        handleCheckoutChange("address", e.target.value)
      }
      error={Boolean(checkoutErrors.address)}
      helperText={checkoutErrors.address}
    />

    <TextField
      label="Phone Number"
      fullWidth
      margin="dense"
      value={checkoutData.phone}
      onChange={(e) =>
        handleCheckoutChange("phone", e.target.value)
      }
      error={Boolean(checkoutErrors.phone)}
      helperText={checkoutErrors.phone}
    />
        <TextField
      label="Card Number"
      fullWidth
      margin="dense"
      value={checkoutData.cardNumber}
      onChange={(e) =>
        handleCheckoutChange("cardNumber", e.target.value)
      }
      error={Boolean(checkoutErrors.cardNumber)}
      helperText={checkoutErrors.cardNumber}
    />
        <TextField
      label="Expiry Date"
      fullWidth
      margin="dense"
      value={checkoutData.expiryDate}
      onChange={(e) =>
        handleCheckoutChange("expiryDate", e.target.value)
      }
      error={Boolean(checkoutErrors.expiryDate)}
      helperText={checkoutErrors.expiryDate}
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setCheckoutOpen(false)}>
      Cancel
    </Button>

<Button
  variant="contained"
  sx={{ bgcolor: "#C4A484" }}
  disabled={
    checkoutErrors.address ||
    checkoutErrors.phone ||
    checkoutErrors.cardNumber ||
    checkoutErrors.expiryDate ||
    !checkoutData.address ||
    !checkoutData.phone ||
    !checkoutData.cardNumber ||
    !checkoutData.expiryDate
  }
  onClick={() => {
    const orderPayload = {
      email:
        openLogin === "admin"
          ? adminLogin.email
          : userLogin.email,

      orderDate: Date.now(),

      cardNumber: checkoutData.cardNumber,
      expDate: checkoutData.expiryDate,

      address: checkoutData.address,
      phone: checkoutData.phone,

      items: cartItems.map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),

      total: cartTotal,
    };

    console.log("===== ORDER SENT TO DATABASE =====");
    console.log(orderPayload);
    console.log("=================================");

    setOpenAlert(true);

    // reset
    setCheckoutOpen(false);
    setCartItems([]);
    setCheckoutData({
      address: "",
      phone: "",
      cardNumber: "",
      expiryDate: "",
    });
  }}
>
  Confirm Order
</Button>

  </DialogActions>
</Dialog>


      <Snackbar
        open={openAlert}
        autoHideDuration={3000}
        onClose={() => setOpenAlert(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenAlert(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Order Placed!
        </Alert>
      </Snackbar>

      </Toolbar>
    </AppBar>
  );
}