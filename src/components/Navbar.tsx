import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import HomeNav from "./HomeNav";
import AboutNav from "./AboutNav";
import ShopNav from "./ShopNav";
import CartIcon from "./CartIcon";
import MobileMenuButton from "./MobileMenuButton";
import MobileMenu from "./MobileMenu";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Navbar scroll effect with throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsNavbarScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      // If we're on the home page, scroll to home section
      scrollToSection("home");
    } else {
      // If we're on another page, navigate to home
      navigate("/");
    }
    setIsMobileMenuOpen(false);
  };

  const handleAboutClick = () => {
    if (location.pathname === "/") {
      // If we're on the home page, scroll to artist section
      scrollToSection("artist");
    } else {
      // If we're on another page, navigate to home and then scroll
      navigate("/#artist");
    }
    setIsMobileMenuOpen(false);
  };

  const handleShopClick = () => {
    navigate("/shop");
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isNavbarScrolled ? "scrolled" : ""}`}>
      <div className="nav-content">
        <Logo />
        <ul className="nav-links">
          <HomeNav onClick={handleHomeClick} />
          <AboutNav onClick={handleAboutClick} />
          <ShopNav onClick={handleShopClick} />
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <CartIcon />
          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>
      </div>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onHomeClick={handleHomeClick}
        onAboutClick={handleAboutClick}
        onShopClick={handleShopClick}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
