import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Eye,
  Grid3X3,
  List,
  Heart,
  Sparkles,
  Check,
  X,
  Package,
} from "lucide-react";
import { getAllProducts } from "../services/productService";
import { getAllCollections } from "../services/collectionService";
import type { Product, Collection, ApiError } from "../types/api";
import { getParsedDimensions, getParsedImages } from "../types/api";
import { useCart } from "../contexts/CartContext";
import { useResponsive } from "../hooks/useResponsive";

type ViewMode = "grid" | "list";
type ContentFilter = "collections" | "products";

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [contentFilter, setContentFilter] = useState<ContentFilter>("products");
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [addedToCartItems, setAddedToCartItems] = useState<Set<number>>(
    new Set()
  );

  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

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

  const toggleWishlist = (productId: number) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  const getCollectionName = (collectionId: number) => {
    const collection = collections.find((c) => c.id === collectionId);
    return collection?.name || "Unknown Collection";
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
                  style={{
                    padding: "8px 12px",
                    background:
                      viewMode === "grid"
                        ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                        : "transparent",
                    color: viewMode === "grid" ? "white" : "#64748b",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Grid3X3 size={16} />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    padding: "8px 12px",
                    background:
                      viewMode === "list"
                        ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                        : "transparent",
                    color: viewMode === "list" ? "white" : "#64748b",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <List size={16} />
                  List
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
                    ? "repeat(auto-fill, minmax(300px, 1fr))"
                    : "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: isMobile ? "1.5rem" : "2rem",
                  padding: isMobile ? "0" : "0 0.5rem",
                }}
              >
                {collections.map((collection, index) => {
                  const images = getParsedImages(collection);
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
                        y: -4,
                        transition: { duration: 0.3, ease: "easeOut" },
                      }}
                      onClick={() => handleCollectionClick(collection.id)}
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        border: "1px solid rgba(226, 232, 240, 0.6)",
                        backdropFilter: "blur(20px)",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        position: "relative",
                        minHeight: "280px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Header Section */}
                      <div
                        style={{
                          padding: "2rem 1.5rem 1.5rem",
                          background:
                            "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                          position: "relative",
                          borderBottom: "1px solid rgba(226, 232, 240, 0.4)",
                        }}
                      >
                        {/* Collection Icon */}
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "1rem",
                            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                          }}
                        >
                          <Sparkles size={24} style={{ color: "white" }} />
                        </div>

                        {/* Collection Title */}
                        <h3
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "700",
                            color: "#1e293b",
                            margin: "0 0 0.5rem 0",
                            lineHeight: "1.2",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {collection.name}
                        </h3>

                        {/* Collection Description */}
                        {collection.description && (
                          <p
                            style={{
                              color: "#64748b",
                              fontSize: "0.95rem",
                              lineHeight: "1.5",
                              margin: 0,
                              fontWeight: "400",
                            }}
                          >
                            {collection.description}
                          </p>
                        )}
                      </div>

                      {/* Content Section */}
                      <div
                        style={{
                          padding: "1.5rem",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* Stats Row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "1.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {/* Product Count */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.5rem 0.75rem",
                              background: "rgba(59, 130, 246, 0.1)",
                              borderRadius: "8px",
                              border: "1px solid rgba(59, 130, 246, 0.2)",
                            }}
                          >
                            <Package size={16} style={{ color: "#3b82f6" }} />
                            <span
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                color: "#3b82f6",
                              }}
                            >
                              {productCount}{" "}
                              {productCount === 1 ? "Product" : "Products"}
                            </span>
                          </div>

                          {/* Image Count */}
                          {images.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem 0.75rem",
                                background: "rgba(34, 197, 94, 0.1)",
                                borderRadius: "8px",
                                border: "1px solid rgba(34, 197, 94, 0.2)",
                              }}
                            >
                              <Eye size={16} style={{ color: "#22c55e" }} />
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  fontWeight: "600",
                                  color: "#22c55e",
                                }}
                              >
                                {images.length}{" "}
                                {images.length === 1 ? "Image" : "Images"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem 1.25rem",
                            background:
                              "linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))",
                            borderRadius: "12px",
                            border: "1px solid rgba(102, 126, 234, 0.1)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: "600",
                              color: "#667eea",
                              letterSpacing: "0.025em",
                            }}
                          >
                            Explore Collection
                          </span>
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #667eea, #764ba2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                            }}
                          >
                            <div
                              style={{
                                width: "6px",
                                height: "6px",
                                background: "white",
                                borderRadius: "50%",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02))",
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
                All Products ({products.length})
              </h2>

              {products.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      viewMode === "grid"
                        ? isMobile
                          ? "1fr"
                          : isTablet
                          ? "repeat(auto-fill, minmax(250px, 1fr))"
                          : "repeat(auto-fill, minmax(280px, 1fr))"
                        : "1fr",
                    gap:
                      viewMode === "grid"
                        ? isMobile
                          ? "1rem"
                          : "1.5rem"
                        : "1rem",
                    padding: isMobile ? "0" : "0 0.5rem",
                  }}
                >
                  {products.map((product, index) => {
                    const dimensions = getParsedDimensions(product);
                    const isInWishlist = wishlist.has(product.id);

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        whileHover={{
                          y: -12,
                          scale: viewMode === "grid" ? 1.03 : 1.01,
                          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.12)",
                        }}
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
                          borderRadius:
                            viewMode === "grid"
                              ? isMobile
                                ? "20px"
                                : "24px"
                              : "20px",
                          overflow: "hidden",
                          boxShadow:
                            "0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.4)",
                          backdropFilter: "blur(20px)",
                          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                          display: viewMode === "list" ? "flex" : "flex",
                          flexDirection: viewMode === "list" ? "row" : "column",
                          alignItems:
                            viewMode === "list" ? "stretch" : "stretch",
                          height: viewMode === "list" ? "auto" : "100%",
                          minHeight:
                            viewMode === "grid"
                              ? isMobile
                                ? "420px"
                                : "480px"
                              : "auto",
                          maxWidth: viewMode === "grid" ? "none" : "100%",
                          position: "relative",
                        }}
                      >
                        {/* Product Image */}
                        <div
                          onClick={() => handleProductClick(product.id)}
                          style={{
                            height:
                              viewMode === "grid"
                                ? isMobile
                                  ? "280px"
                                  : "320px"
                                : "240px",
                            width: viewMode === "list" ? "320px" : "100%",
                            flexShrink: 0,
                            background: product.image
                              ? `url(${product.image}) center/cover`
                              : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            borderRadius:
                              viewMode === "grid"
                                ? isMobile
                                  ? "20px 20px 0 0"
                                  : "24px 24px 0 0"
                                : "20px 0 0 20px",
                            overflow: "hidden",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                          }}
                          onMouseEnter={(e) => {
                            if (product.image) {
                              e.currentTarget.style.transform = "scale(1.02)";
                              e.currentTarget.style.boxShadow =
                                "0 12px 40px rgba(0, 0, 0, 0.15)";
                            }
                            // Show artistic overlay
                            const overlay = e.currentTarget.querySelector(
                              ".artistic-overlay"
                            ) as HTMLElement;
                            if (overlay) overlay.style.opacity = "1";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 8px 32px rgba(0, 0, 0, 0.1)";
                            // Hide artistic overlay
                            const overlay = e.currentTarget.querySelector(
                              ".artistic-overlay"
                            ) as HTMLElement;
                            if (overlay) overlay.style.opacity = "0";
                          }}
                        >
                          {/* Artistic Overlay */}
                          <div
                            className="artistic-overlay"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background:
                                "linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08), rgba(240, 147, 251, 0.05))",
                              opacity: 0,
                              transition: "opacity 0.3s ease",
                            }}
                          />

                          {/* Floating Particles Effect */}
                          <div
                            style={{
                              position: "absolute",
                              top: "10%",
                              left: "10%",
                              width: "4px",
                              height: "4px",
                              background: "rgba(255, 255, 255, 0.8)",
                              borderRadius: "50%",
                              animation: "float 3s ease-in-out infinite",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "20%",
                              right: "15%",
                              width: "6px",
                              height: "6px",
                              background: "rgba(255, 255, 255, 0.6)",
                              borderRadius: "50%",
                              animation: "float 4s ease-in-out infinite 1s",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: "25%",
                              left: "20%",
                              width: "3px",
                              height: "3px",
                              background: "rgba(255, 255, 255, 0.7)",
                              borderRadius: "50%",
                              animation: "float 5s ease-in-out infinite 2s",
                            }}
                          />

                          {!product.image && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "1rem",
                                color: "white",
                                textAlign: "center",
                              }}
                            >
                              <div
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
                              </div>
                              <span
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                                }}
                              >
                                No Image Available
                              </span>
                            </div>
                          )}

                          {/* Elegant Collection Badge */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "20px",
                              left: "20px",
                              padding: "8px 16px",
                              background:
                                "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))",
                              color: "white",
                              borderRadius: "25px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              backdropFilter: "blur(20px)",
                              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            {getCollectionName(product.collectionId)}
                          </div>

                          {/* Artistic Wishlist Button */}
                          <motion.button
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            style={{
                              position: "absolute",
                              top: "20px",
                              right: "20px",
                              padding: "12px",
                              background: isInWishlist
                                ? "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))"
                                : "rgba(255, 255, 255, 0.95)",
                              color: isInWishlist ? "white" : "#64748b",
                              borderRadius: "50%",
                              cursor: "pointer",
                              backdropFilter: "blur(20px)",
                              transition:
                                "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                              width: "48px",
                              height: "48px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "2px solid rgba(255, 255, 255, 0.3)",
                            }}
                          >
                            <Heart
                              size={20}
                              fill={isInWishlist ? "currentColor" : "none"}
                            />
                          </motion.button>

                          {/* Elegant View Details Overlay */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "20px",
                              right: "20px",
                              padding: "14px 28px",
                              background: "rgba(255, 255, 255, 0.98)",
                              color: "#1e293b",
                              borderRadius: "30px",
                              fontSize: "0.9rem",
                              fontWeight: "700",
                              backdropFilter: "blur(20px)",
                              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                              border: "1px solid rgba(255, 255, 255, 0.6)",
                              opacity: 0,
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "1";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "0";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <Eye size={18} />
                            View Details
                          </div>
                        </div>

                        {/* Elegant Product Info */}
                        <div
                          style={{
                            padding: viewMode === "list" ? "2rem" : "1.5rem",
                            flex: viewMode === "list" ? 1 : 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "1.25rem",
                            minHeight: viewMode === "grid" ? "180px" : "auto",
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
                          }}
                        >
                          {/* Title and Price Section */}
                          <div style={{ flex: 1 }}>
                            <h3
                              style={{
                                fontSize:
                                  viewMode === "grid" ? "1.35rem" : "1.6rem",
                                fontWeight: "800",
                                color: "#1e293b",
                                margin: "0 0 1.25rem 0",
                                lineHeight: "1.2",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: viewMode === "grid" ? 2 : 1,
                                WebkitBoxOrient: "vertical",
                                letterSpacing: "-0.02em",
                              }}
                            >
                              {product.title}
                            </h3>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "1rem",
                                flexWrap: "wrap",
                                gap: "0.75rem",
                              }}
                            >
                              {dimensions &&
                              (dimensions.width > 0 ||
                                dimensions.height > 0) ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "6px 12px",
                                    background:
                                      "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(59, 130, 246, 0.2)",
                                    backdropFilter: "blur(10px)",
                                  }}
                                >
                                  <Package
                                    size={14}
                                    style={{ color: "#3b82f6" }}
                                  />
                                  <span
                                    style={{
                                      fontSize: "0.75rem",
                                      fontWeight: "600",
                                      color: "#3b82f6",
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    {dimensions.width > 0 &&
                                    dimensions.height > 0 ? (
                                      <>
                                        {dimensions.width}cm ×{" "}
                                        {dimensions.height}cm
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
                                </div>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "6px 12px",
                                    background: "rgba(148, 163, 184, 0.1)",
                                    borderRadius: "12px",
                                    border:
                                      "1px solid rgba(148, 163, 184, 0.2)",
                                    backdropFilter: "blur(10px)",
                                  }}
                                >
                                  <Package
                                    size={14}
                                    style={{ color: "#64748b" }}
                                  />
                                  <span
                                    style={{
                                      fontSize: "0.75rem",
                                      fontWeight: "600",
                                      color: "#64748b",
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    No dimensions
                                  </span>
                                </div>
                              )}

                              {/* Artistic Price Status */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  padding: "6px 12px",
                                  background:
                                    product.price > 0
                                      ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))"
                                      : "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))",
                                  borderRadius: "12px",
                                  border: `1px solid ${
                                    product.price > 0
                                      ? "rgba(34, 197, 94, 0.2)"
                                      : "rgba(239, 68, 68, 0.2)"
                                  }`,
                                  backdropFilter: "blur(10px)",
                                }}
                              >
                                <Sparkles
                                  size={14}
                                  style={{
                                    color:
                                      product.price > 0 ? "#22c55e" : "#ef4444",
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "600",
                                    color:
                                      product.price > 0 ? "#22c55e" : "#ef4444",
                                    letterSpacing: "0.02em",
                                  }}
                                >
                                  {product.price > 0
                                    ? "In Stock"
                                    : "Out of Stock"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Artistic Add to Cart Button */}
                          <motion.button
                            whileHover={{
                              scale: product.price > 0 ? 1.03 : 1,
                              boxShadow:
                                product.price > 0
                                  ? "0 12px 32px rgba(59, 130, 246, 0.4)"
                                  : "none",
                            }}
                            whileTap={{
                              scale: product.price > 0 ? 0.97 : 1,
                            }}
                            onClick={() =>
                              product.price > 0 && handleAddToCart(product)
                            }
                            disabled={
                              addedToCartItems.has(product.id) ||
                              isInCart(product.id) ||
                              product.price === 0
                            }
                            style={{
                              width: "100%",
                              padding: "1.25rem 1.5rem",
                              background:
                                product.price === 0
                                  ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                                  : addedToCartItems.has(product.id)
                                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                                  : isInCart(product.id)
                                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                  : "linear-gradient(135deg, #667eea, #764ba2)",
                              color: "white",
                              border: "none",
                              borderRadius: "16px",
                              cursor:
                                product.price === 0 ||
                                addedToCartItems.has(product.id) ||
                                isInCart(product.id)
                                  ? "not-allowed"
                                  : "pointer",
                              fontSize: "1rem",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.75rem",
                              transition:
                                "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                              height: "56px",
                              boxShadow:
                                product.price === 0
                                  ? "none"
                                  : "0 8px 24px rgba(102, 126, 234, 0.3)",
                              opacity:
                                product.price === 0
                                  ? 0.6
                                  : addedToCartItems.has(product.id) ||
                                    isInCart(product.id)
                                  ? 0.8
                                  : 1,
                              letterSpacing: "0.02em",
                              textTransform: "uppercase",
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            {/* Button Background Pattern */}
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background:
                                  "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                                transform: "translateX(-100%)",
                                transition: "transform 0.6s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (product.price > 0) {
                                  e.currentTarget.style.transform =
                                    "translateX(100%)";
                                }
                              }}
                            />

                            {product.price === 0 ? (
                              <>
                                <X size={20} />
                                Cannot Add
                              </>
                            ) : addedToCartItems.has(product.id) ? (
                              <>
                                <Check size={20} />
                                Added to Cart!
                              </>
                            ) : isInCart(product.id) ? (
                              <>
                                <ShoppingCart size={20} />
                                Already in Cart
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={20} />
                                Add to Cart
                              </>
                            )}
                          </motion.button>
                        </div>
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
                  <Eye
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
                    No products found
                  </h3>
                  <p style={{ color: "#94a3b8", margin: 0 }}>
                    Our collection is being updated. Please check back soon!
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
