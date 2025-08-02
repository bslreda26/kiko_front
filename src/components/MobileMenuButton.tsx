import React from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  isOpen,
  onClick,
}) => {
  return (
    <motion.button
      className="mobile-menu-button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background:
          "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        borderRadius: "12px",
        cursor: "pointer",
        padding: "0.5rem",
        animation: "navItemFadeIn 0.6s ease-out 1.1s both",
        opacity: 0,
        transform: "translateY(-5px)",
        height: "45px",
        width: "45px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        backdropFilter: "blur(10px)",
        color: "#1e293b",
        minHeight: "44px",
        minWidth: "44px",
      }}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </motion.div>
    </motion.button>
  );
};

export default MobileMenuButton;
