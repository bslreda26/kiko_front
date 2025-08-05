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
} from "lucide-react";
import { getAllProducts } from "../services/productService";
import { getAllCollections } from "../services/collectionService";
import type { Product, Collection, ApiError } from "../types/api";
import { getParsedDimensions, getParsedImages } from "../types/api";
import { useCart } from "../contexts/CartContext";

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

  const getAvailabilityStatus = (isAvailable: boolean) => {
    return isAvailable === true
      ? "Available"
      : "Not Available";
  };

  const isAvailable = (isAvailable: boolean) => {
    return isAvailable === true;
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
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1.5rem",
                  padding: "0 0.5rem",
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
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{
                        y: -8,
                        scale: 1.02,
                        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
                      }}
                      onClick={() => handleCollectionClick(collection.id)}
                      style={{
                        background: "rgba(255, 255, 255, 0.98)",
                        borderRadius: "24px",
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                        border: "1px solid rgba(226, 232, 240, 0.8)",
                        backdropFilter: "blur(20px)",
                        cursor: "pointer",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "400px",
                      }}
                    >
                      {images.length > 0 && (
                        <div
                          style={{
                            height: "240px",
                            background: `url(${images[0]}) center/cover`,
                            position: "relative",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            borderRadius: "20px 20px 0 0",
                            overflow: "hidden",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.filter = "brightness(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.filter = "brightness(1)";
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)",
                            }}
                          />

                          {/* Product Count Badge */}
                          <div
                            style={{
                              position: "absolute",
                              top: "20px",
                              right: "20px",
                              padding: "8px 16px",
                              background: "rgba(59, 130, 246, 0.9)",
                              color: "white",
                              borderRadius: "25px",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              backdropFilter: "blur(20px)",
                              boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              letterSpacing: "0.025em",
                            }}
                          >
                            <Sparkles size={14} />
                            {productCount}{" "}
                            {productCount === 1 ? "Item" : "Items"}
                          </div>

                          {/* Image Count Badge */}
                          {images.length > 1 && (
                            <div
                              style={{
                                position: "absolute",
                                top: "20px",
                                left: "20px",
                                padding: "8px 14px",
                                background: "rgba(34, 197, 94, 0.9)",
                                color: "white",
                                borderRadius: "25px",
                                fontSize: "0.8rem",
                                fontWeight: "700",
                                backdropFilter: "blur(20px)",
                                boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                letterSpacing: "0.025em",
                              }}
                            >
                              <Eye size={14} />
                              {images.length} Images
                            </div>
                          )}
                        </div>
                      )}
                      <div
                        style={{
                          padding: "1.5rem 1.25rem",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: "700",
                              color: "#1e293b",
                              margin: "0 0 1rem 0",
                              lineHeight: "1.3",
                              letterSpacing: "-0.025em",
                            }}
                          >
                            {collection.name}
                          </h3>

                          <p
                            style={{
                              color: "#64748b",
                              lineHeight: "1.6",
                              margin: 0,
                              fontSize: "0.9rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              opacity: 0.8,
                            }}
                          >
                            {collection.description}
                          </p>
                        </div>

                        {/* Collection Stats */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem 1.25rem",
                            background:
                              "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.05))",
                            borderRadius: "16px",
                            border: "1px solid rgba(59, 130, 246, 0.15)",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.1)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.95rem",
                              color: "#3b82f6",
                              fontWeight: "700",
                              letterSpacing: "0.025em",
                              textTransform: "uppercase" as const,
                            }}
                          >
                            View Collection
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              fontSize: "0.8rem",
                              color: "#64748b",
                              fontWeight: "600",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                background: "rgba(59, 130, 246, 0.1)",
                                borderRadius: "8px",
                              }}
                            >
                              <Sparkles size={12} />
                              <span>{productCount} products</span>
                            </div>
                            {images.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "4px 8px",
                                  background: "rgba(34, 197, 94, 0.1)",
                                  borderRadius: "8px",
                                }}
                              >
                                <Eye size={12} />
                                <span>{images.length} images</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
                        ? "repeat(auto-fill, minmax(280px, 1fr))"
                        : "1fr",
                    gap: viewMode === "grid" ? "1.5rem" : "1rem",
                    padding: "0 0.5rem",
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
                          y: -6,
                          scale: viewMode === "grid" ? 1.02 : 1.01,
                          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                        }}
                        style={{
                          background: "rgba(255, 255, 255, 0.98)",
                          borderRadius: viewMode === "grid" ? "20px" : "16px",
                          overflow: "hidden",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                          border: "1px solid rgba(226, 232, 240, 0.8)",
                          backdropFilter: "blur(20px)",
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          display: viewMode === "list" ? "flex" : "flex",
                          flexDirection: viewMode === "list" ? "row" : "column",
                          alignItems:
                            viewMode === "list" ? "stretch" : "stretch",
                          height: viewMode === "list" ? "auto" : "100%",
                          minHeight: viewMode === "grid" ? "420px" : "auto",
                          maxWidth: viewMode === "grid" ? "none" : "100%",
                        }}
                      >
                        {/* Product Image */}
                        <div
                          onClick={() => handleProductClick(product.id)}
                          style={{
                            height: viewMode === "grid" ? "220px" : "140px",
                            width: viewMode === "list" ? "200px" : "100%",
                            flexShrink: 0,
                            background: product.image
                              ? `url(${product.image}) center/cover`
                              : "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            borderRadius:
                              viewMode === "grid"
                                ? "16px 16px 0 0"
                                : "12px 0 0 12px",
                            overflow: "hidden",
                          }}
                          onMouseEnter={(e) => {
                            if (product.image) {
                              e.currentTarget.style.transform = "scale(1.08)";
                              e.currentTarget.style.filter = "brightness(1.1)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.filter = "brightness(1)";
                          }}
                        >
                          {!product.image && (
                            <Eye size={48} style={{ color: "#cbd5e1" }} />
                          )}

                          {/* Wishlist Button */}
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            style={{
                              position: "absolute",
                              top: "16px",
                              right: "16px",
                              padding: "10px",
                              background: isInWishlist
                                ? "rgba(239, 68, 68, 0.9)"
                                : "rgba(255, 255, 255, 0.9)",
                              color: isInWishlist ? "white" : "#64748b",
                              border: isInWishlist
                                ? "2px solid rgba(239, 68, 68, 0.3)"
                                : "2px solid rgba(255, 255, 255, 0.8)",
                              borderRadius: "50%",
                              cursor: "pointer",
                              backdropFilter: "blur(20px)",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: isInWishlist
                                ? "0 4px 16px rgba(239, 68, 68, 0.3)"
                                : "0 4px 16px rgba(0, 0, 0, 0.15)",
                              width: "40px",
                              height: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Heart
                              size={18}
                              fill={isInWishlist ? "currentColor" : "none"}
                            />
                          </motion.button>

                          {/* Collection Badge */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "16px",
                              left: "16px",
                              padding: "6px 14px",
                              background: "rgba(59, 130, 246, 0.9)",
                              color: "white",
                              borderRadius: "25px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              backdropFilter: "blur(20px)",
                              boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              letterSpacing: "0.025em",
                            }}
                          >
                            {getCollectionName(product.collectionId)}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div
                          style={{
                            padding:
                              viewMode === "list" ? "1.5rem" : "1.5rem 1.25rem",
                            flex: viewMode === "list" ? 1 : 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "1rem",
                            minHeight: viewMode === "grid" ? "180px" : "auto",
                          }}
                        >
                          {/* Title and Price Section */}
                          <div style={{ flex: 1 }}>
                            <h3
                              style={{
                                fontSize:
                                  viewMode === "grid" ? "1.1rem" : "1.125rem",
                                fontWeight: "700",
                                color: "#1e293b",
                                margin: "0 0 0.75rem 0",
                                lineHeight: "1.3",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: viewMode === "grid" ? 2 : 1,
                                WebkitBoxOrient: "vertical",
                                letterSpacing: "-0.025em",
                              }}
                            >
                              {product.title}
                            </h3>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "0.75rem",
                                flexWrap: "wrap",
                                gap: "0.5rem",
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                  color: isAvailable(product.isAvailable)
                                    ? "#22c55e"
                                    : "#ef4444",
                                  margin: 0,
                                  letterSpacing: "-0.025em",
                                  padding: "4px 12px",
                                  background: isAvailable(product.isAvailable)
                                    ? "rgba(34, 197, 94, 0.1)"
                                    : "rgba(239, 68, 68, 0.1)",
                                  borderRadius: "20px",
                                  display: "inline-block",
                                }}
                              >
                                {getAvailabilityStatus(product.isAvailable)}
                              </p>
                              {dimensions && (
                                <div
                                  style={{
                                    padding: "4px 10px",
                                    background: "rgba(148, 163, 184, 0.1)",
                                    borderRadius: "12px",
                                    fontSize: "0.75rem",
                                    color: "#64748b",
                                    fontWeight: "600",
                                    border:
                                      "1px solid rgba(148, 163, 184, 0.2)",
                                  }}
                                >
                                  {dimensions.width}" × {dimensions.height}"
                                </div>
                              )}
                            </div>

                            {product.description && (
                              <p
                                style={{
                                  color: "#64748b",
                                  lineHeight: "1.5",
                                  margin: 0,
                                  fontSize: "0.875rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: viewMode === "grid" ? 2 : 1,
                                  WebkitBoxOrient: "vertical",
                                  opacity: 0.8,
                                }}
                              >
                                {product.description}
                              </p>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          <motion.button
                            whileHover={{
                              scale: isAvailable(product.isAvailable) ? 1.02 : 1,
                              boxShadow: !isAvailable(product.isAvailable)
                                ? "0 8px 25px rgba(107, 114, 128, 0.2)"
                                : addedToCartItems.has(product.id)
                                ? "0 8px 25px rgba(34, 197, 94, 0.4)"
                                : isInCart(product.id)
                                ? "0 8px 25px rgba(245, 158, 11, 0.4)"
                                : "0 8px 25px rgba(59, 130, 246, 0.4)",
                            }}
                            whileTap={{
                              scale: isAvailable(product.isAvailable) ? 0.98 : 1,
                            }}
                            onClick={() =>
                              isAvailable(product.isAvailable) &&
                              handleAddToCart(product)
                            }
                            disabled={!isAvailable(product.isAvailable)}
                            style={{
                              width: "100%",
                              padding: "1rem",
                              background: !isAvailable(product.isAvailable)
                                ? "linear-gradient(135deg, #6b7280, #4b5563)"
                                : addedToCartItems.has(product.id)
                                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                                : isInCart(product.id)
                                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                : "linear-gradient(135deg, #3b82f6, #1e40af)",
                              color: "white",
                              border: "none",
                              borderRadius: "14px",
                              cursor: isAvailable(product.isAvailable)
                                ? "pointer"
                                : "not-allowed",
                              fontSize: "0.95rem",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              height: "48px",
                              boxShadow: !isAvailable(product.isAvailable)
                                ? "0 4px 16px rgba(107, 114, 128, 0.2)"
                                : addedToCartItems.has(product.id)
                                ? "0 4px 16px rgba(34, 197, 94, 0.3)"
                                : isInCart(product.id)
                                ? "0 4px 16px rgba(245, 158, 11, 0.3)"
                                : "0 4px 16px rgba(59, 130, 246, 0.3)",
                              letterSpacing: "0.025em",
                              textTransform: "uppercase" as const,
                              opacity: isAvailable(product.isAvailable) ? 1 : 0.6,
                            }}
                          >
                            {!isAvailable(product.isAvailable) ? (
                              <>
                                <Eye size={20} />
                                Not Available
                              </>
                            ) : addedToCartItems.has(product.id) ? (
                              <>
                                <Check size={20} />
                                Added!
                              </>
                            ) : isInCart(product.id) ? (
                              <>
                                <ShoppingCart size={20} />
                                In Cart
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
