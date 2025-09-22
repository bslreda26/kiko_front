import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  ArrowRight,
  Instagram,
  Mail,
  ArrowUp,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductService, { getLatestProducts } from "../services/productService";
import type { Product, ApiError } from "../types/api";
import LogoSpinner from "../components/LogoSpinner";

// Import header background images
import headerImage2 from "../assets/home/12h.jpg";
import headerImage3 from "../assets/home/14h.jpg";

// Import artist story images
import artistImage1 from "../assets/karen/1k.jpg";
import artistImage2 from "../assets/karen/2k.jpg";

// Import work images for static gallery
import workImage1 from "../assets/work/4.jpg";
import workImage2 from "../assets/work/5.jpg";
import workImage3 from "../assets/work/6.jpg";
import workImage4 from "../assets/work/7.jpg";

// Header background images
const headerImages = [headerImage2, headerImage3];

// Artist story images
const artistImages = [artistImage1, artistImage2];

// Static work images for fallback
const staticWorkImages = [
  {
    src: workImage1,
    title: "Abstract Expression",
    description: "Mixed media artwork",
  },
  {
    src: workImage2,
    title: "Urban Landscape",
    description: "Contemporary painting",
  },
  { src: workImage3, title: "Color Study", description: "Digital art piece" },
  { src: workImage4, title: "Modern Vision", description: "Acrylic on canvas" },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentHeaderImage, setCurrentHeaderImage] = useState(0);
  const [currentArtistImage, setCurrentArtistImage] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const artistRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);

  // Load latest products
  const loadLatestProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError(null);
      let products;
      try {
        products = await getLatestProducts(6);
      } catch {
        products = await ProductService.getLatestProducts(6);
      }
      setLatestProducts(products);
    } catch (err) {
      const apiError = err as ApiError;
      setProductsError(apiError.message || "Failed to load latest products");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    // Header background image carousel - smooth transitions with elegant timing
    const headerInterval = setInterval(() => {
      setCurrentHeaderImage((prev) => (prev + 1) % headerImages.length);
    }, 8000);

    // Artist image carousel - smooth, elegant timing
    const artistInterval = setInterval(() => {
      setCurrentArtistImage((prev) => (prev + 1) % artistImages.length);
    }, 12000);

    // Load latest products
    loadLatestProducts();

    return () => {
      clearInterval(headerInterval);
      clearInterval(artistInterval);
    };
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openImageModal = (image: string) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="App">
      {/* Section 1: Header/Hero */}
      <section ref={heroRef} id="home" className="hero-section">
        <div className="hero-background" style={{ backgroundColor: "#000000" }}>
          <div
            className="header-background-image"
            style={{
              backgroundImage: `url(${headerImages[currentHeaderImage]})`,
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              transition: "all 2s cubic-bezier(0.4, 0.0, 0.2, 1)",
              opacity: 1,
            }}
          />
        </div>

        <div className="hero-content">
          <motion.div
            className="hero-title-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="hero-title">
              <span className="title-word">K</span>
              <span className="title-separator"></span>
              <span className="title-word">I</span>
              <span className="title-separator"></span>
              <span className="title-word">K</span>
              <span className="title-separator"></span>
              <span className="title-word">O</span>
              <span className="title-separator"></span>
              <span className="title-word">P</span>
              <span className="title-separator"></span>
              <span className="title-word">L</span>
              <span className="title-separator"></span>
              <span className="title-word">U</span>
              <span className="title-separator"></span>
              <span className="title-word">M</span>
              <span className="title-separator"></span>
              <span className="title-word">E</span>
            </div>
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Where colors speak louder than words{" "}
            </motion.p>
          </motion.div>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <motion.button
              className="cta-button primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollToSection(artistRef)}
            >
              Artist's Journey
              <ArrowRight size={18} />
            </motion.button>

            <motion.button
              className="cta-button secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/shop")}
            >
              View Gallery
              <Eye size={18} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Artist Story */}
      <section ref={artistRef} id="artist" className="artist-section">
        <div className="artist-background">
          <div className="artist-background-overlay" />
        </div>

        <div className="container">
          <motion.div
            className="artist-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="artist-images">
              <div className="image-carousel">
                <motion.img
                  key={currentArtistImage}
                  src={artistImages[currentArtistImage]}
                  alt="Artist"
                  className="artist-image"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.4, 0.0, 0.2, 1],
                    opacity: { duration: 0.6 },
                    scale: { duration: 0.8 },
                  }}
                  onLoad={() => {
                    // Smooth transition when image loads
                  }}
                />
              </div>
            </div>

            <motion.div
              className="artist-story"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3>The Artist's Journey</h3>

              <p>
                Kikoplume is a Canadian-Lebanese painter, traveling artist, and
                adventurer based in Lebanon. With a background in audiovisual
                cinema, she gradually shifted toward painting, where she found
                her true means of expression. For her, art is a powerful
                language - a way to express emotions, share stories, and connect
                with others through color and imagination.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Work Showcase */}
      <section ref={workRef} id="work" className="work-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            KIKOPLUME Latest Creations
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          ></motion.p>

          <motion.div
            className="work-gallery"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {productsLoading ? (
              <div className="gallery-loading">
                <LogoSpinner size={50} text="Loading latest artworks..." />
              </div>
            ) : productsError ? (
              <div
                className="gallery-error"
                style={{ textAlign: "center", padding: "2rem" }}
              >
                <p style={{ color: "#ef4444", marginBottom: "1rem" }}>
                  {productsError}
                </p>
                <motion.button
                  className="retry-button"
                  onClick={loadLatestProducts}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Try Again
                </motion.button>
              </div>
            ) : latestProducts.length === 0 ? (
              // Show static work images when no API products are available
              <div className="gallery-grid">
                {staticWorkImages.map((work, index) => (
                  <motion.div
                    key={`static-${index}`}
                    className="gallery-item"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => openImageModal(work.src)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={work.src}
                      alt={work.title}
                      style={{ transition: "transform 0.2s ease" }}
                    />
                    <div className="item-overlay">
                      <div className="overlay-content">
                        <h4>{work.title}</h4>
                        <p>{work.description}</p>
                        <motion.button
                          className="view-button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/shop");
                          }}
                        >
                          <Eye size={16} style={{ marginRight: "0.5rem" }} />
                          Explore
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="gallery-grid">
                {latestProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="gallery-item"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => openImageModal(product.image)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{ transition: "transform 0.2s ease" }}
                    />
                    <div className="item-overlay">
                      <div className="overlay-content">
                        <h4>{product.title}</h4>
                        <p
                          style={{
                            color: product.price > 0 ? "#22c55e" : "#ef4444",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                          }}
                        >
                          {product.price > 0 ? "Available" : "Sold Out"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="work-cta"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="explore-collection-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/shop")}
            >
              Explore Our Latest Work
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <motion.div
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="footer-brand">
              <h3 className="footer-brand-title">Kikoplume</h3>
              <p className="footer-tagline">
                Where creativity flows and emotions bloom
              </p>
              <p className="footer-description">
                Contemporary art that speaks to the soul, crafted with passion
                and purpose.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="footer-title">Connect</h4>
            <div
              className="footer-links"
              style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
            >
              <motion.a
                href="https://www.instagram.com/kikoplume/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Instagram size={20} />
                <span>Instagram</span>
              </motion.a>
              <motion.a
                href="mailto:Karenhawa5@gmail.com"
                className="footer-link"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail size={20} />
                <span>Email</span>
              </motion.a>
              <motion.a
                href="https://wa.me/96176611668"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle size={20} />
                <span>WhatsApp</span>
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p>&copy; 2025 Kikoplume. All rights reserved. by BSL</p>
          <motion.button
            className="scroll-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp size={20} />
          </motion.button>
        </motion.div>
      </footer>

      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div
          className="modal-overlay"
          onClick={closeImageModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "90%",
            }}
          >
            <img
              src={selectedImage}
              alt="Artwork"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />
            <button
              className="modal-close"
              onClick={closeImageModal}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "none",
                border: "none",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
