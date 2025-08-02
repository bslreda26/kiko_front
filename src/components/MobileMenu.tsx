import React from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

interface MobileMenuProps {
  isOpen: boolean;
  onHomeClick: () => void;
  onAboutClick: () => void;
  onShopClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onHomeClick,
  onAboutClick,
  onShopClick,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mobile-menu"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            zIndex: 999,
          }}
        >
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <motion.li
              whileHover={{ x: 10 }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginBottom: "0.5rem",
                borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                paddingBottom: "0.5rem",
              }}
            >
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: "#1e293b",
                  fontSize: "1.1rem",
                  fontWeight: "500",
                  display: "block",
                  padding: "0.75rem 0",
                  transition: "color 0.3s ease",
                }}
                onClick={onHomeClick}
              >
                Home
              </Link>
            </motion.li>
            <motion.li
              whileHover={{ x: 10 }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginBottom: "0.5rem",
                borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                paddingBottom: "0.5rem",
              }}
            >
              <a
                href="#about"
                style={{
                  textDecoration: "none",
                  color: "#1e293b",
                  fontSize: "1.1rem",
                  fontWeight: "500",
                  display: "block",
                  padding: "0.75rem 0",
                  transition: "color 0.3s ease",
                }}
                onClick={onAboutClick}
              >
                About
              </a>
            </motion.li>
            <motion.li
              whileHover={{ x: 10 }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginBottom: "0.5rem",
                paddingBottom: "0.5rem",
              }}
            >
              <Link
                to="/shop"
                style={{
                  textDecoration: "none",
                  color: "#1e293b",
                  fontSize: "1.1rem",
                  fontWeight: "500",
                  display: "block",
                  padding: "0.75rem 0",
                  transition: "color 0.3s ease",
                }}
                onClick={onShopClick}
              >
                Shop
              </Link>
            </motion.li>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
