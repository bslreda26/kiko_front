import React from "react";
import { motion } from "framer-motion";

interface AboutNavProps {
  onClick: () => void;
}

const AboutNav: React.FC<AboutNavProps> = ({ onClick }) => {
  return (
    <motion.li whileHover={{ scale: 1.05 }}>
      <a href="#about" onClick={onClick}>
        About
      </a>
    </motion.li>
  );
};

export default AboutNav;
