import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Eye,
  Grid3X3,
  List,
  Sparkles,
  Check,
  Package,
  Filter,
  Clock,
} from "lucide-react";
import { getAllProducts } from "../services/productService";
import { getAllCollections } from "../services/collectionService";
import type { Product, Collection, ApiError } from "../types/api";
import { getParsedDimensions } from "../types/api";
import { useCart } from "../contexts/CartContext";
import { useResponsive } from "../hooks/useResponsive";
import ImageModal from "../components/ImageModal";
import PreorderModal from "../components/PreorderModal";

type ViewMode = "grid" | "list";
type ContentFilter = "collections" | "products";
type AvailabilityFilter = "all" | "available";

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [contentFilter, setContentFilter] = useState<ContentFilter>("products");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");
  const [addedToCartItems, setAddedToCartItems] = useState<Set<number>>(
    new Set()
  );
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
  }>({
    isOpen: false,
    imageUrl: "",
    title: "",
  });
  const [preorderModal, setPreorderModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
  });

  const { addToCart, addPreorderToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  // Filter products based on availability
  const filteredProducts = products.filter((product) => {
    if (availabilityFilter === "available") {
      return product.price > 0; // Only show available products
    }
    return true; // Show all products
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, collectionsData] = await Promise.all([
        getAllProducts(),
        getAllCollections(),
      ]);

      setProducts(productsData);
      setCollections(collectionsData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load shop data");
      console.error("Error loading shop data:", err);
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = (imageUrl: string, title: string) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      title,
    });
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: "",
      title: "",
    });
  };

  const openPreorderModal = (product: Product) => {
    setPreorderModal({
      isOpen: true,
      product,
    });
  };

  const closePreorderModal = () => {
    setPreorderModal({
      isOpen: false,
      product: null,
    });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedToCartItems((prev) => new Set(prev).add(product.id));

    // Remove the "added" indicator after 2 seconds
    setTimeout(() => {
      setAddedToCartItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  const handlePreorderAddToCart = (product: Product, message: string) => {
    addPreorderToCart(product, message);
    setAddedToCartItems((prev) => new Set(prev).add(product.id));

    // Remove the "added" indicator after 2 seconds
    setTimeout(() => {
      setAddedToCartItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleCollectionClick = (collectionId: number) => {
    navigate(`/collection/${collectionId}`);
  };

  const getProductCountInCollection = (collectionId: number) => {
    return products.filter((product) => product.collectionId === collectionId)
      .length;
  };

  // Check if product is available
  const isProductAvailable = (product: Product) => {
    return product.price > 0;
  };

  // Check if product is in cart (including preorders)
  const isProductInCart = (product: Product) => {
    return isInCart(product.id);
  };

  // Modern loading state
  if (loading) {
    return (
      <div className="App">
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            paddingTop: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                display: "inline-block",
                marginBottom: "1rem",
                color: "#3b82f6",
              }}
            >
              <Sparkles size={48} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: "0.5rem",
              }}
            >
              Loading Our Collection
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: "1rem",
                color: "#64748b",
              }}
            >
              Discovering unique artworks and collections...
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          paddingTop: "120px",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 1rem",
            width: "100%",
          }}
        >
          {/* Modern Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              textAlign: "center",
              marginBottom: "2rem",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              padding: "2rem 1.5rem",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              margin: "0 0.5rem 2rem",
            }}
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontSize: "clamp(2rem, 5vw, 2.75rem)",
                fontWeight: "700",
                background: "linear-gradient(135deg, #1e293b, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "1rem",
                lineHeight: "1.1",
              }}
            >
              Kiko Plume Shop
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontSize: "1.125rem",
                color: "#64748b",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: "1.6",
                fontWeight: "400",
              }}
            >
              {contentFilter === "collections"
                ? "Explore our curated collections of artistic themes"
                : availabilityFilter === "available"
                ? "Discover our available artworks and exclusive pieces ready for purchase"
                : "Discover our complete range of unique artworks and exclusive pieces"}
            </motion.p>
          </motion.div>

          {/* Filter and View Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            {/* Content Filter Toggle */}
            <div
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "12px",
                padding: "4px",
                border: "2px solid #e2e8f0",
                backdropFilter: "blur(10px)",
              }}
            >
              <button
                onClick={() => setContentFilter("collections")}
                style={{
                  padding: "8px 16px",
                  background:
                    contentFilter === "collections"
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "transparent",
                  color: contentFilter === "collections" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                <Sparkles size={16} />
                Collections
              </button>
              <button
                onClick={() => setContentFilter("products")}
                style={{
                  padding: "8px 16px",
                  background:
                    contentFilter === "products"
                      ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                      : "transparent",
                  color: contentFilter === "products" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                <ShoppingCart size={16} />
                All Products
              </button>
            </div>

            {/* View Mode Toggle - Only show for products */}
            {contentFilter === "products" && (
              <div
                style={{
                  display: "flex",
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "12px",
                  padding: "4px",
                  border: "2px solid #e2e8f0",
                  backdropFilter: "blur(10px)",
                }}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={`elegant-button ${
                    viewMode === "grid" ? "" : "secondary"
                  }`}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.85rem",
                    minHeight: "32px",
                  }}
                >
                  <Grid3X3 size={16} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`elegant-button ${
                    viewMode === "list" ? "" : "secondary"
                  }`}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.85rem",
                    minHeight: "32px",
                  }}
                >
                  <List size={16} />
                  List
                </button>
              </div>
            )}

            {/* Availability Filter - Only show for products */}
            {contentFilter === "products" && (
              <div
                style={{
                  display: "flex",
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "12px",
                  padding: "4px",
                  border: "2px solid #e2e8f0",
                  backdropFilter: "blur(10px)",
                }}
              >
                <button
                  onClick={() => setAvailabilityFilter("all")}
                  className={`elegant-button ${
                    availabilityFilter === "all" ? "success" : "secondary"
                  }`}
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    minHeight: "28px",
                  }}
                >
                  <Filter size={14} />
                  All
                </button>
                <button
                  onClick={() => setAvailabilityFilter("available")}
                  className={`elegant-button ${
                    availabilityFilter === "available" ? "success" : "secondary"
                  }`}
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    minHeight: "28px",
                  }}
                >
                  <Check size={14} />
                  Available
                </button>
              </div>
            )}
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              style={{
                background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                color: "#dc2626",
                padding: "1.5rem 2rem",
                borderRadius: "16px",
                marginBottom: "2rem",
                boxShadow: "0 8px 25px rgba(220, 38, 38, 0.15)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontWeight: "500" }}>{error}</p>
            </motion.div>
          )}

          {/* Collections Section */}
          {contentFilter === "collections" && collections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ marginBottom: "4rem" }}
            >
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  marginBottom: "2rem",
                  textAlign: "center",
                }}
              >
                Our Collections ({collections.length})
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : isTablet
                    ? "repeat(auto-fill, minmax(280px, 1fr))"
                    : "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: isMobile ? "1rem" : "2rem",
                  padding: isMobile ? "0" : "0 0.5rem",
                }}
              >
                {collections.map((collection, index) => {
                  const productCount = getProductCountInCollection(
                    collection.id
                  );

                  return (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{
                        y: -8,
                        scale: 1.02,
                        transition: { duration: 0.3, ease: "easeOut" },
                      }}
                      onClick={() => handleCollectionClick(collection.id)}
                      style={{
                        background: "rgba(255, 255, 255, 0.98)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
                        border: "1px solid rgba(226, 232, 240, 0.4)",
                        backdropFilter: "blur(20px)",
                        cursor: "pointer",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        height: "200px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        padding: "2rem",
                      }}
                    >
                      {/* Modern Gradient Background */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          opacity: 0.05,
                          transition: "opacity 0.3s ease",
                        }}
                      />

                      {/* Collection Title */}
                      <h3
                        style={{
                          fontSize: "1.75rem",
                          fontWeight: "800",
                          color: "#1e293b",
                          margin: "0 0 1rem 0",
                          lineHeight: "1.2",
                          letterSpacing: "-0.025em",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        {collection.name}
                      </h3>

                      {/* Product Count */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 1.25rem",
                          background: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "25px",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            color: "#667eea",
                            letterSpacing: "0.025em",
                          }}
                        >
                          {productCount}{" "}
                          {productCount === 1 ? "Product" : "Products"}
                        </span>
                      </div>

                      {/* Hover Effect */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                          pointerEvents: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "0";
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Empty Collections State */}
          {contentFilter === "collections" && collections.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "20px",
                backdropFilter: "blur(10px)",
              }}
            >
              <Sparkles
                size={64}
                style={{ color: "#94a3b8", marginBottom: "1rem" }}
              />
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#64748b",
                  marginBottom: "0.5rem",
                }}
              >
                No collections found
              </h3>
              <p style={{ color: "#94a3b8", margin: 0 }}>
                Our collections are being curated. Please check back soon!
              </p>
            </motion.div>
          )}

          {/* Products Section */}
          {contentFilter === "products" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  marginBottom: "2rem",
                  textAlign: "center",
                }}
              >
                {availabilityFilter === "available" ? "Available" : "All"}{" "}
                Products ({filteredProducts.length})
              </h2>

              {filteredProducts.length > 0 ? (
                <div
                  className="products-grid"
                  style={{
                    display: viewMode === "list" ? "flex" : "grid",
                    flexDirection: viewMode === "list" ? "column" : "row",
                    gridTemplateColumns:
                      viewMode === "grid"
                        ? isMobile
                          ? "1fr"
                          : isTablet
                          ? "repeat(auto-fill, minmax(280px, 1fr))"
                          : "repeat(auto-fill, minmax(320px, 1fr))"
                        : "none",
                    gap:
                      viewMode === "list"
                        ? "1rem"
                        : isMobile
                        ? "1rem"
                        : "1.5rem",
                    padding:
                      viewMode === "list" ? "0" : isMobile ? "0" : "0 0.5rem",
                  }}
                >
                  {filteredProducts.map((product, index) => {
                    const dimensions = getParsedDimensions(product);

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.08,
                          type: "spring",
                          stiffness: 100,
                          damping: 15,
                        }}
                        whileHover={{
                          y: -8,
                          scale: 1.03,
                          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12)",
                          transition: { duration: 0.3, ease: "easeOut" },
                        }}
                        whileTap={{
                          scale: 0.98,
                          transition: { duration: 0.1 },
                        }}
                        className="product-card"
                        style={{
                          display: viewMode === "list" ? "flex" : "flex",
                          flexDirection: viewMode === "list" ? "row" : "column",
                          height:
                            viewMode === "list"
                              ? isMobile
                                ? "200px"
                                : "220px"
                              : isMobile
                              ? "420px"
                              : "480px",
                          minHeight:
                            viewMode === "list"
                              ? isMobile
                                ? "200px"
                                : "220px"
                              : isMobile
                              ? "420px"
                              : "480px",
                          width: viewMode === "list" ? "100%" : "100%",
                          maxWidth: viewMode === "list" ? "100%" : "100%",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {/* Enhanced Background Gradient */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.8,
                            delay: index * 0.08 + 0.2,
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(135deg, rgba(59, 130, 246, 0.02), rgba(139, 92, 246, 0.02))",
                            borderRadius: "20px",
                            pointerEvents: "none",
                          }}
                        />

                        {/* Product Image */}
                        <motion.div
                          onClick={() => handleProductClick(product.id)}
                          className="product-image-container"
                          style={{
                            height:
                              viewMode === "grid"
                                ? isMobile
                                  ? "240px"
                                  : "300px"
                                : isMobile
                                ? "200px"
                                : "220px",
                            width:
                              viewMode === "list"
                                ? isMobile
                                  ? "100%"
                                  : "220px"
                                : "100%",
                            flexShrink: 0,
                            background: product.image
                              ? `url(${product.image}) center/contain no-repeat`
                              : "#f8f9fa",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            borderRadius:
                              viewMode === "grid"
                                ? "20px 20px 0 0"
                                : isMobile
                                ? "20px 20px 0 0"
                                : "20px 0 0 20px",
                            overflow: "hidden",
                          }}
                          whileHover={{
                            scale: 1.05,
                            transition: { duration: 0.3, ease: "easeOut" },
                          }}
                        >
                          {!product.image && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.08 + 0.3,
                              }}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "1rem",
                                color: "white",
                                textAlign: "center",
                              }}
                            >
                              <motion.div
                                animate={{
                                  rotate: [0, 5, -5, 0],
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatType: "reverse",
                                }}
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  background: "rgba(255, 255, 255, 0.2)",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backdropFilter: "blur(10px)",
                                  border: "2px solid rgba(255, 255, 255, 0.3)",
                                }}
                              >
                                <Eye size={40} />
                              </motion.div>
                              <span
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                                }}
                              >
                                No Image Available
                              </span>
                            </motion.div>
                          )}

                          {/* Enhanced View Button */}
                          {product.image && (
                            <motion.button
                              className="view-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openImageModal(product.image, product.title);
                              }}
                              whileHover={{
                                scale: 1.1,
                                backgroundColor: "rgba(59, 130, 246, 0.9)",
                              }}
                              whileTap={{
                                scale: 0.95,
                              }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.08 + 0.4,
                              }}
                            >
                              <Eye size={16} />
                            </motion.button>
                          )}
                        </motion.div>

                        {/* Product Info */}
                        <motion.div
                          className="product-info"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.08 + 0.5,
                          }}
                          style={{
                            flex: viewMode === "list" ? "1" : "auto",
                            width: viewMode === "list" ? "auto" : "100%",
                          }}
                        >
                          {/* Product Details */}
                          <motion.div
                            className="product-details"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: index * 0.08 + 0.7,
                            }}
                          >
                            {/* Dimensions */}
                            {dimensions &&
                            (dimensions.width > 0 || dimensions.height > 0) ? (
                              <motion.div
                                className="detail-badge dimensions"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Package size={14} />
                                <span>
                                  {dimensions.width > 0 &&
                                  dimensions.height > 0 ? (
                                    <>
                                      {dimensions.width}cm × {dimensions.height}
                                      cm
                                      {dimensions.depth > 0 &&
                                        ` × ${dimensions.depth}cm`}
                                    </>
                                  ) : (
                                    <>
                                      {dimensions.width > 0 &&
                                        `${dimensions.width}cm width`}
                                      {dimensions.height > 0 &&
                                        `${dimensions.height}cm height`}
                                      {dimensions.depth > 0 &&
                                        `${dimensions.depth}cm depth`}
                                    </>
                                  )}
                                </span>
                              </motion.div>
                            ) : (
                              <motion.div
                                className="detail-badge"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Package size={14} />
                                <span>Dimensions not available</span>
                              </motion.div>
                            )}

                            {/* Availability */}
                            <motion.div
                              className={`detail-badge ${
                                product.price > 0
                                  ? "availability"
                                  : "unavailable"
                              }`}
                              whileHover={{ scale: 1.05 }}
                              animate={{
                                scale: product.price > 0 ? [1, 1.05, 1] : 1,
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: product.price > 0 ? 1 : 0,
                                repeatDelay: 2,
                              }}
                            >
                              <Check size={14} />
                              <span>
                                {product.price > 0 ? "In Stock" : "Sold Out"}
                              </span>
                            </motion.div>
                          </motion.div>

                          {/* Enhanced Add to Cart / Preorder Button */}
                          <motion.button
                            className={`elegant-button ${
                              !isProductAvailable(product)
                                ? "secondary"
                                : addedToCartItems.has(product.id)
                                ? "success"
                                : isProductInCart(product)
                                ? "warning"
                                : ""
                            }`}
                            onClick={() => {
                              if (isProductAvailable(product)) {
                                handleAddToCart(product);
                              } else {
                                openPreorderModal(product);
                              }
                            }}
                            disabled={
                              addedToCartItems.has(product.id) ||
                              isProductInCart(product)
                            }
                            whileHover={{
                              scale: 1.02,
                              boxShadow: isProductAvailable(product)
                                ? "0 8px 24px rgba(59, 130, 246, 0.3)"
                                : "0 8px 24px rgba(245, 158, 11, 0.3)",
                            }}
                            whileTap={{
                              scale: 0.98,
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: index * 0.08 + 0.8,
                            }}
                          >
                            {!isProductAvailable(product) ? (
                              addedToCartItems.has(product.id) ? (
                                <>
                                  <Check size={18} />
                                  Preorder Added!
                                </>
                              ) : isProductInCart(product) ? (
                                <>
                                  <Clock size={18} />
                                  Preorder in Cart
                                </>
                              ) : (
                                <>
                                  <Clock size={18} />
                                  Preorder
                                </>
                              )
                            ) : addedToCartItems.has(product.id) ? (
                              <>
                                <Check size={18} />
                                Added to Cart!
                              </>
                            ) : isProductInCart(product) ? (
                              <>
                                <ShoppingCart size={18} />
                                Already in Cart
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={18} />
                                Add to Cart
                              </>
                            )}
                          </motion.button>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "20px",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <Eye
                      size={64}
                      style={{ color: "#94a3b8", marginBottom: "1rem" }}
                    />
                  </motion.div>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "600",
                      color: "#64748b",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {availabilityFilter === "available"
                      ? "No available products found"
                      : "No products found"}
                  </h3>
                  <p style={{ color: "#94a3b8", margin: 0 }}>
                    {availabilityFilter === "available"
                      ? "All products are currently sold out. Please check back soon!"
                      : "Our collection is being updated. Please check back soon!"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
        title={imageModal.title}
      />

      {/* Preorder Modal */}
      <PreorderModal
        isOpen={preorderModal.isOpen}
        onClose={closePreorderModal}
        product={preorderModal.product}
        onAddToCart={(product, message) =>
          handlePreorderAddToCart(product, message)
        }
      />
    </div>
  );
};

export default Shop;
