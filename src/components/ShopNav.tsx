import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface ShopNavProps {
  onClick?: () => void;
}

const ShopNav: React.FC<ShopNavProps> = ({ onClick }) => {
  const handleClick = () => {
    // Close mobile menu and navigate to shop page
    if (onClick) onClick();
  };

  return (
    <motion.li whileHover={{ scale: 1.05 }}>
      <Link
        to="/shop"
        onClick={handleClick}
        style={{
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        Shop
      </Link>
    </motion.li>
  );
};

export default ShopNav;
