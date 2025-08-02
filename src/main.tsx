import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import Navbar from "./components/Navbar.tsx";
import App from "./App.tsx";
import { CartProvider } from "./contexts/CartContext.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <App />
        </Router>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
