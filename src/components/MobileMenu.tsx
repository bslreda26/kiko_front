import React from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, User, ShoppingBag, X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onHomeClick: () => void;
  onAboutClick: () => void;
  onShopClick: () => void;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onHomeClick,
  onAboutClick,
  onShopClick,
  onClose,
}) => {
  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mobile-menu-backdrop"
            onClick={onClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 998,
            }}
          />
          
          {/* Menu Container */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mobile-menu"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "280px",
              height: "100vh",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "2rem 1.5rem",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "2rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(0, 0, 0, 0.1)"
            }}>
              <h3 style={{ 
                fontSize: "1.2rem", 
                fontWeight: "600", 
                color: "#1e293b",
                margin: 0
              }}>
                Menu
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  transition: "all 0.2s ease",
                }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Menu Items */}
            <nav style={{ flex: 1 }}>
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}>
                <motion.li
                  variants={itemVariants}
                  transition={{ delay: 0.1 }}
                  style={{ marginBottom: "0.5rem" }}
                >
                  <motion.div
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      to="/"
                      style={{
                        textDecoration: "none",
                        color: "#1e293b",
                        fontSize: "1.1rem",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 1.2rem",
                        borderRadius: "12px",
                        background: "rgba(102, 126, 234, 0.05)",
                        border: "1px solid rgba(102, 126, 234, 0.1)",
                        transition: "all 0.3s ease",
                      }}
                      onClick={onHomeClick}
                    >
                      <Home size={20} />
                      Home
                    </Link>
                  </motion.div>
                </motion.li>

                <motion.li
                  variants={itemVariants}
                  transition={{ delay: 0.2 }}
                  style={{ marginBottom: "0.5rem" }}
                >
                  <motion.div
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      style={{
                        textDecoration: "none",
                        color: "#1e293b",
                        fontSize: "1.1rem",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 1.2rem",
                        borderRadius: "12px",
                        background: "rgba(102, 126, 234, 0.05)",
                        border: "1px solid rgba(102, 126, 234, 0.1)",
                        transition: "all 0.3s ease",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                      onClick={onAboutClick}
                    >
                      <User size={20} />
                      About
                    </button>
                  </motion.div>
                </motion.li>

                <motion.li
                  variants={itemVariants}
                  transition={{ delay: 0.3 }}
                  style={{ marginBottom: "0.5rem" }}
                >
                  <motion.div
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      to="/shop"
                      style={{
                        textDecoration: "none",
                        color: "#1e293b",
                        fontSize: "1.1rem",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem 1.2rem",
                        borderRadius: "12px",
                        background: "rgba(102, 126, 234, 0.05)",
                        border: "1px solid rgba(102, 126, 234, 0.1)",
                        transition: "all 0.3s ease",
                      }}
                      onClick={onShopClick}
                    >
                      <ShoppingBag size={20} />
                      Shop
                    </Link>
                  </motion.div>
                </motion.li>
              </ul>
            </nav>

            {/* Footer */}
            <div style={{
              marginTop: "auto",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(0, 0, 0, 0.1)",
              textAlign: "center",
            }}>
              <p style={{
                fontSize: "0.9rem",
                color: "#64748b",
                margin: 0,
                lineHeight: 1.5,
              }}>
                Kikoplume Art Gallery
              </p>
              <p style={{
                fontSize: "0.8rem",
                color: "#94a3b8",
                margin: "0.5rem 0 0 0",
              }}>
                Where art touches the soul
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
