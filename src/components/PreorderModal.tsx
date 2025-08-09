import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, MessageCircle } from "lucide-react";
import type { Product } from "../types/api";

interface PreorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, message: string) => void;
}

const PreorderModal: React.FC<PreorderModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);
    try {
      await onAddToCart(product, message);
      setMessage("");
      onClose();
    } catch (error) {
      // Handle error silently
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(255, 255, 255, 0.98)",
              borderRadius: "20px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#1e293b",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ShoppingCart size={24} style={{ color: "#f59e0b" }} />
                  Preorder Item
                </h2>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#64748b",
                    margin: "0.25rem 0 0 0",
                  }}
                >
                  Add this item to your cart as a preorder
                </p>
              </div>
              <motion.button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  color: "#64748b",
                }}
                whileHover={{
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  scale: 1.1,
                }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Product Info */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1.5rem",
                padding: "1rem",
                background: "rgba(248, 250, 252, 0.8)",
                borderRadius: "12px",
                border: "1px solid rgba(226, 232, 240, 0.5)",
              }}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid rgba(226, 232, 240, 0.5)",
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  {product.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#64748b",
                    margin: 0,
                    lineHeight: "1.4",
                  }}
                >
                  {product.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "white",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                    }}
                  >
                    Preorder
                  </span>
                </div>
              </div>
            </div>

            {/* Message Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor="preorder-message"
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  <MessageCircle
                    size={16}
                    style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
                  />
                  Message (Optional)
                </label>
                <textarea
                  id="preorder-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a note about your preorder request..."
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    transition: "all 0.2s ease",
                    background: "rgba(255, 255, 255, 0.8)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#64748b",
                    margin: "0.5rem 0 0 0",
                  }}
                >
                  Let us know any specific details about your preorder request.
                </p>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                }}
              >
                <motion.button
                  type="button"
                  onClick={handleClose}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "2px solid #e2e8f0",
                    background: "rgba(255, 255, 255, 0.8)",
                    color: "#64748b",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  whileHover={{
                    backgroundColor: "rgba(248, 250, 252, 0.9)",
                    borderColor: "#cbd5e1",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.75rem 1.5rem",
                    border: "none",
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "white",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          borderTop: "2px solid white",
                          borderRadius: "50%",
                        }}
                      />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Add to Cart
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreorderModal;
