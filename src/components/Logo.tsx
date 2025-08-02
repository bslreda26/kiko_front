import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../assets/logo.jpg";

const Logo: React.FC = () => {
  return (
    <Link to="/" className="logo-container">
      <img src={logoImage} alt="Kiko Plume Logo" className="logo-image" />
      <span className="logo-text">Kiko Plume</span>
    </Link>
  );
};

export default Logo;
