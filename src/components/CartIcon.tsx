import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";

const CartIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Create WhatsApp message with cart details
    let message =
      "Hello! I would like to purchase the following items from Kikoplume:\n\n";

    // Add each item to the message
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.title}\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: ${formatPrice(item.price)} each\n`;
      message += `   Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    // Add total
    message += `Total Items: ${totalItems}\n`;
    message += `Total Amount: ${formatPrice(totalPrice)}\n\n`;
    message +=
      "Please let me know how to proceed with the payment and delivery. Thank you!";

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);

    // WhatsApp phone number (remove + and any spaces/dashes)
    const phoneNumber = "96176611668"; // +96176611668

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");

    // Close the cart modal
    setIsOpen(false);
  };

  return (
    <>
      {/* Cart Icon Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: "relative",
          background: "rgba(255, 255, 255, 0.9)",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "12px",
          padding: "0.75rem",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          color: "#1e293b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <ShoppingCart size={20} />
        {totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "600",
            }}
          >
            {totalItems > 99 ? "99+" : totalItems}
          </motion.span>
        )}
      </motion.button>

      {/* Cart Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                zIndex: 9998,
                backdropFilter: "blur(4px)",
              }}
            />

            {/* Cart Modal */}
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                width: "100%",
                maxWidth: "450px",
                height: "100vh",
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.15)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "1.5rem",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#1e293b",
                      margin: 0,
                    }}
                  >
                    Shopping Cart ({totalItems})
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0.5rem",
                      cursor: "pointer",
                      color: "#64748b",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
                {items.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "4rem 2rem",
                      color: "#64748b",
                    }}
                  >
                    <ShoppingCart
                      size={64}
                      style={{ marginBottom: "1rem", opacity: 0.3 }}
                    />
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Your cart is empty
                    </h3>
                    <p style={{ margin: 0, opacity: 0.7 }}>
                      Add some amazing artwork to get started!
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                          background: "rgba(255, 255, 255, 0.8)",
                          borderRadius: "16px",
                          padding: "1rem",
                          display: "flex",
                          gap: "1rem",
                          alignItems: "center",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {/* Product Image */}
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "12px",
                            background: item.image
                              ? `url(${item.image}) center/cover`
                              : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                            flexShrink: 0,
                          }}
                        />

                        {/* Product Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              fontSize: "1rem",
                              fontWeight: "600",
                              color: "#1e293b",
                              margin: "0 0 0.25rem 0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.title}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: "#3b82f6",
                              margin: 0,
                              fontWeight: "600",
                            }}
                          >
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flexShrink: 0,
                          }}
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#ef4444",
                              border: "none",
                              borderRadius: "8px",
                              width: "32px",
                              height: "32px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Minus size={16} />
                          </motion.button>

                          <span
                            style={{
                              fontSize: "1rem",
                              fontWeight: "600",
                              color: "#1e293b",
                              minWidth: "24px",
                              textAlign: "center",
                            }}
                          >
                            {item.quantity}
                          </span>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            style={{
                              background: "rgba(34, 197, 94, 0.1)",
                              color: "#22c55e",
                              border: "none",
                              borderRadius: "8px",
                              width: "32px",
                              height: "32px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Plus size={16} />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#ef4444",
                              border: "none",
                              borderRadius: "8px",
                              width: "32px",
                              height: "32px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              marginLeft: "0.5rem",
                            }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div
                  style={{
                    padding: "1.5rem",
                    borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      Total: {formatPrice(totalPrice)}
                    </span>
                    <button
                      onClick={clearCart}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        textDecoration: "underline",
                      }}
                    >
                      Clear Cart
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      background: "linear-gradient(135deg, #25D366, #128C7E)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    💬 Order via WhatsApp
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartIcon;
