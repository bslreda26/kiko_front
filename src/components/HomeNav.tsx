import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface HomeNavProps {
  onClick?: () => void;
}

const HomeNav: React.FC<HomeNavProps> = ({ onClick }) => {
  return (
    <motion.li whileHover={{ scale: 1.05 }}>
      <Link to="/" onClick={onClick}>
        Home
      </Link>
    </motion.li>
  );
};

export default HomeNav;
