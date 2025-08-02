import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ArrowRight, Instagram, Mail, Heart, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePerformanceOptimization } from "../hooks/usePerformanceOptimization";
import ProductService, { getLatestProducts } from "../services/productService";
import type { Product, ApiError } from "../types/api";

// Import header background images
import headerImage1 from "../assets/home/06h.jpg";
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
const headerImages = [headerImage1, headerImage2, headerImage3];

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

  // Performance optimization
  const { getOptimizedTransition, shouldReduceAnimations } =
    usePerformanceOptimization();

  // Load latest products
  const loadLatestProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError(null);
      // Try using the exported function first, fallback to class method
      let products;
      try {
        products = await getLatestProducts(6);
      } catch (funcError) {
        console.log("Function import failed, trying class method:", funcError);
        products = await ProductService.getLatestProducts(6);
      }
      setLatestProducts(products);
    } catch (err) {
      const apiError = err as ApiError;
      setProductsError(apiError.message || "Failed to load latest products");
      console.error("Error loading latest products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    // Header background image carousel - increased interval for better performance
    const headerInterval = setInterval(() => {
      setCurrentHeaderImage((prev) => (prev + 1) % headerImages.length);
    }, 8000);

    // Artist image carousel - increased interval for better performance
    const artistInterval = setInterval(() => {
      setCurrentArtistImage((prev) => (prev + 1) % artistImages.length);
    }, 15000);

    // Load latest products
    loadLatestProducts();

    return () => {
      clearInterval(headerInterval);
      clearInterval(artistInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="hero-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHeaderImage}
              className="header-background-image"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{
                backgroundImage: `url(${headerImages[currentHeaderImage]})`,
              }}
            />
          </AnimatePresence>

          <motion.div
            className="floating-eye eye-2"
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="floating-particles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
        </div>

        <div className="hero-content">
          <motion.div
            className="hero-title-container"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              ...getOptimizedTransition(1.2, 0.5),
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <div className="hero-title">
              <motion.span
                className="title-word"
                initial={{ opacity: 0, rotateX: -90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Kiko
              </motion.span>
              <motion.span
                className="title-separator"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                ×
              </motion.span>
              <motion.span
                className="title-word"
                initial={{ opacity: 0, rotateX: 90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
              >
                Plume
              </motion.span>
            </div>
          </motion.div>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...getOptimizedTransition(1, 1.8),
              ease: "easeOut",
            }}
          >
            Where creativity flows and emotions bloom through contemporary art
          </motion.p>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...getOptimizedTransition(1, 2.2),
              ease: "easeOut",
            }}
          >
            <motion.button
              className="cta-button primary"
              whileHover={{
                scale: shouldReduceAnimations() ? 1 : 1.05,
                y: shouldReduceAnimations() ? 0 : -2,
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection(artistRef)}
            >
              Discover Art
              <ArrowRight size={18} />
            </motion.button>

            <motion.button
              className="cta-button secondary"
              whileHover={{
                scale: shouldReduceAnimations() ? 1 : 1.05,
                y: shouldReduceAnimations() ? 0 : -2,
              }}
              whileTap={{ scale: 0.95 }}
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
          <motion.div
            className="artist-background-overlay"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
          />
        </div>

        <div className="container">
          <div className="artist-content">
            <motion.div
              className="artist-images"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <div className="image-carousel">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentArtistImage}
                    src={artistImages[currentArtistImage]}
                    alt="Artist"
                    className="artist-image"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 1.5 }}
                  />
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              className="artist-story"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <h3>The Artist's Journey</h3>
              <p>
                Born from a passion for contemporary expression, Kikoplume
                represents the intersection of traditional artistry and modern
                innovation. Each piece tells a story of emotion, creativity, and
                the human experience.
              </p>
              <p>
                Through bold colors, dynamic compositions, and thoughtful
                symbolism, our work invites viewers to explore their own
                interpretations and emotional connections to art.
              </p>

              <div className="artist-collections">
                <h4>Featured Collections</h4>
                <div className="collection-tags">
                  <span className="collection-tag">Abstract Emotions</span>
                  <span className="collection-tag">Urban Landscapes</span>
                  <span className="collection-tag">Digital Dreams</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: Work Showcase */}
      <section ref={workRef} id="work" className="work-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Featured Works
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover our most recent artworks - fresh from the studio
          </motion.p>

          <motion.div
            className="work-gallery"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            {productsLoading ? (
              <div className="gallery-loading">
                <motion.div
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "3px solid rgba(59, 130, 246, 0.3)",
                    borderTop: "3px solid #3b82f6",
                    borderRadius: "50%",
                    margin: "2rem auto",
                  }}
                />
                <p
                  style={{
                    textAlign: "center",
                    color: "#64748b",
                    marginTop: "1rem",
                  }}
                >
                  Loading latest artworks...
                </p>
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
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      ...getOptimizedTransition(0.8, index * 0.1),
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    viewport={{ once: true }}
                    onClick={() => openImageModal(work.src)}
                    style={{ cursor: "pointer" }}
                  >
                    <motion.img
                      src={work.src}
                      alt={work.title}
                      whileHover={{
                        scale: shouldReduceAnimations() ? 1 : 1.05,
                        filter: "brightness(1.1) contrast(1.05)",
                        transition: { duration: 0.3 },
                      }}
                    />
                    <motion.div
                      className="item-overlay"
                      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                      whileHover={{
                        opacity: 1,
                        backdropFilter: "blur(8px)",
                        transition: { duration: 0.4, ease: "easeOut" },
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="overlay-content">
                        <motion.h4
                          initial={{ opacity: 0, y: 20 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          {work.title}
                        </motion.h4>
                        <motion.p
                          initial={{ opacity: 0, y: 15 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          {work.description}
                        </motion.p>
                        <motion.button
                          className="view-button"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{
                            opacity: 1,
                            scale: 1.05,
                            y: -2,
                            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/shop");
                          }}
                        >
                          <Eye size={16} style={{ marginRight: "0.5rem" }} />
                          Explore
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="gallery-grid">
                {latestProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      ...getOptimizedTransition(0.8, index * 0.1),
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    viewport={{ once: true }}
                    onClick={() => openImageModal(product.image)}
                    style={{ cursor: "pointer" }}
                  >
                    <motion.img
                      src={product.image}
                      alt={product.title}
                      whileHover={{
                        scale: shouldReduceAnimations() ? 1 : 1.05,
                        filter: "brightness(1.1) contrast(1.05)",
                        transition: { duration: 0.3 },
                      }}
                    />
                    <motion.div
                      className="item-overlay"
                      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                      whileHover={{
                        opacity: 1,
                        backdropFilter: "blur(8px)",
                        transition: { duration: 0.4, ease: "easeOut" },
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="overlay-content">
                        <motion.h4
                          initial={{ opacity: 0, y: 20 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          {product.title}
                        </motion.h4>
                        <motion.p
                          initial={{ opacity: 0, y: 15 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          ${product.price}
                        </motion.p>
                        <motion.button
                          className="view-button"
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{
                            opacity: 1,
                            scale: 1.05,
                            y: -2,
                            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                        >
                          View Details
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="work-cta"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="explore-collection-btn"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="footer-brand"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="footer-brand-title">Kikoplume</h3>
              <p className="footer-tagline">
                Where creativity flows and emotions bloom
              </p>
              <p className="footer-description">
                Contemporary art that speaks to the soul, crafted with passion
                and purpose.
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className="footer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="footer-title">Connect</h4>
            <div className="footer-links">
              <motion.a
                href="https://www.instagram.com/kikoplume/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram size={20} />
                <span>Instagram</span>
              </motion.a>
              <motion.a
                href="mailto:Karenhawa5@gmail.com"
                className="footer-link"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail size={20} />
                <span>Email</span>
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            className="footer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <h4 className="footer-title">Follow the Journey</h4>
            <p className="footer-text">
              Stay updated with our latest works, exhibitions, and artistic
              insights.
            </p>
            <motion.div
              className="footer-heart"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart size={24} fill="#e11d48" color="#e11d48" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          viewport={{ once: true }}
        >
          <p>&copy; 2024 Kikoplume. All rights reserved.</p>
          <motion.button
            className="scroll-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp size={20} />
          </motion.button>
        </motion.div>
      </footer>

      {/* Image Modal */}
      <AnimatePresence>
        {isModalOpen && selectedImage && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedImage} alt="Artwork" />
              <button className="modal-close" onClick={closeImageModal}>
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
