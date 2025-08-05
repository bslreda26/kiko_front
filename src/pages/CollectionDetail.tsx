import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Sparkles,
  Check,
  Eye,
  Grid3X3,
  List,
  Package,
  X,
} from "lucide-react";
import { getAllProducts } from "../services/productService";
import { getAllCollections } from "../services/collectionService";
import type { Product, Collection, ApiError } from "../types/api";
import { getParsedDimensions, getParsedImages } from "../types/api";
import { useCart } from "../contexts/CartContext";

type ViewMode = "grid" | "list";

const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);

  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [addedToCartItems, setAddedToCartItems] = useState<Set<number>>(
    new Set()
  );

  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    loadCollectionData();
  }, [id]);

  const loadCollectionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, collectionsData] = await Promise.all([
        getAllProducts(),
        getAllCollections(),
      ]);

      const foundCollection = collectionsData.find(
        (c) => c.id === parseInt(id || "0")
      );
      if (!foundCollection) {
        setError("Collection not found");
        return;
      }

      const productsInCollection = productsData.filter(
        (product) => product.collectionId === foundCollection.id
      );

      setCollection(foundCollection);
      setCollectionProducts(productsInCollection);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load collection data");
      console.error("Error loading collection data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedToCartItems((prev) => new Set(prev).add(product.id));

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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ color: "#3b82f6" }}
          >
            <Sparkles size={48} />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="App">
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            paddingTop: "120px",
            padding: "120px 2rem 2rem",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "20px",
              padding: "3rem",
              backdropFilter: "blur(10px)",
            }}
          >
            <Sparkles
              size={64}
              style={{ color: "#ef4444", marginBottom: "1rem" }}
            />
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: "1rem",
              }}
            >
              {error || "Collection not found"}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/shop")}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "0 auto",
              }}
            >
              <ArrowLeft size={20} />
              Back to Shop
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  const images = getParsedImages(collection);
  const totalProducts = collectionProducts.length;

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
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: window.innerWidth <= 768 ? "1rem" : "2rem",
          }}
        >
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/shop")}
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "2rem",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
            }}
          >
            <ArrowLeft size={18} />
            Back to Shop
          </motion.button>

          {/* Collection Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: window.innerWidth <= 768 ? "16px" : "20px",
              padding: window.innerWidth <= 768 ? "1.5rem" : "2rem",
              marginBottom: window.innerWidth <= 768 ? "2rem" : "3rem",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Modern Header with Gradient Background */}
            <div
              style={{
                height: window.innerWidth <= 768 ? "120px" : "140px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: window.innerWidth <= 768 ? "12px" : "16px",
                marginBottom: "2rem",
              }}
            >
              {/* Animated Background Pattern */}
              <div
                style={{
                  position: "absolute",
                  top: "-50%",
                  left: "-50%",
                  width: "200%",
                  height: "200%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                  animation: "float 6s ease-in-out infinite",
                }}
              />

              {/* Collection Icon */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  width: window.innerWidth <= 768 ? "60px" : "70px",
                  height: window.innerWidth <= 768 ? "60px" : "70px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Sparkles
                  size={window.innerWidth <= 768 ? 28 : 32}
                  style={{ color: "white" }}
                />
              </div>

              {/* Image Count Badge */}
              {images.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    padding: "6px 12px",
                    background: "rgba(34, 197, 94, 0.95)",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    letterSpacing: "0.025em",
                  }}
                >
                  <Eye size={12} />
                  {images.length} Images
                </div>
              )}

              {/* Product Count Badge */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  padding: "6px 12px",
                  background: "rgba(255, 255, 255, 0.95)",
                  color: "#1e293b",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  letterSpacing: "0.025em",
                }}
              >
                <Package size={12} />
                {totalProducts} {totalProducts === 1 ? "Product" : "Products"}
              </div>
            </div>

            {/* Collection Info */}
            <div>
              <h1
                style={{
                  fontSize: window.innerWidth <= 768 ? "1.75rem" : "2.5rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: "0 0 1rem 0",
                  lineHeight: "1.2",
                }}
              >
                {collection.name}
              </h1>
              <p
                style={{
                  fontSize: window.innerWidth <= 768 ? "1rem" : "1.125rem",
                  color: "#64748b",
                  lineHeight: "1.6",
                  margin: "0 0 2rem 0",
                }}
              >
                {collection.description}
              </p>

              {/* Collection Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    background: "rgba(102, 126, 234, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(102, 126, 234, 0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <Package size={16} style={{ color: "#667eea" }} />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "#667eea",
                      }}
                    >
                      Products
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#1e293b",
                      margin: 0,
                    }}
                  >
                    {totalProducts}
                  </p>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    background: "rgba(34, 197, 94, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(34, 197, 94, 0.1)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <Sparkles size={16} style={{ color: "#22c55e" }} />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "#22c55e",
                      }}
                    >
                      Available
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#1e293b",
                      margin: 0,
                    }}
                  >
                    {totalProducts}
                  </p>
                </div>

                {images.length > 0 && (
                  <div
                    style={{
                      padding: "1rem",
                      background: "rgba(59, 130, 246, 0.05)",
                      borderRadius: "12px",
                      border: "1px solid rgba(59, 130, 246, 0.1)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Eye size={16} style={{ color: "#3b82f6" }} />
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#3b82f6",
                        }}
                      >
                        Images
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#1e293b",
                        margin: 0,
                      }}
                    >
                      {images.length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* View Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              flexDirection: window.innerWidth <= 768 ? "column" : "row",
              gap: window.innerWidth <= 768 ? "1rem" : "0",
            }}
          >
            <h2
              style={{
                fontSize: window.innerWidth <= 768 ? "1.5rem" : "1.75rem",
                fontWeight: "700",
                color: "#1e293b",
                margin: 0,
              }}
            >
              Products ({totalProducts})
            </h2>

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
          </motion.div>

          {/* Products Grid */}
          {collectionProducts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    viewMode === "grid"
                      ? window.innerWidth <= 768
                        ? "1fr"
                        : window.innerWidth <= 1024
                        ? "repeat(auto-fit, minmax(280px, 1fr))"
                        : "repeat(auto-fit, minmax(320px, 1fr))"
                      : "1fr",
                  gap: window.innerWidth <= 768 ? "1.5rem" : "2rem",
                }}
              >
                {collectionProducts.map((product, index) => {
                  const dimensions = getParsedDimensions(product);
                  const isInWishlist = wishlist.has(product.id);

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius:
                          window.innerWidth <= 768 ? "16px" : "20px",
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(20px)",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: viewMode === "list" ? "flex" : "block",
                        alignItems: viewMode === "list" ? "stretch" : "unset",
                        height: viewMode === "list" ? "auto" : "100%",
                        position: "relative",
                      }}
                    >
                      {/* Product Image Container */}
                      <div
                        onClick={() => handleProductClick(product.id)}
                        style={{
                          height:
                            viewMode === "grid"
                              ? window.innerWidth <= 768
                                ? "220px"
                                : "300px"
                              : "200px",
                          width: viewMode === "list" ? "280px" : "100%",
                          flexShrink: 0,
                          background: product.image
                            ? `url(${product.image}) center/cover`
                            : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.4s ease",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          if (product.image) {
                            e.currentTarget.style.transform = "scale(1.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        {/* Image Overlay */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)",
                            opacity: 0,
                            transition: "opacity 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0";
                          }}
                        />

                        {!product.image && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "0.5rem",
                              color: "#94a3b8",
                            }}
                          >
                            <Eye size={48} />
                            <span
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: "500",
                              }}
                            >
                              No Image
                            </span>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: "16px",
                            left: "16px",
                            padding: "6px 12px",
                            background:
                              product.price > 0
                                ? "rgba(34, 197, 94, 0.95)"
                                : "rgba(239, 68, 68, 0.95)",
                            color: "white",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            letterSpacing: "0.025em",
                          }}
                        >
                          {product.price > 0 ? "Available" : "Not Available"}
                        </div>

                        {/* Wishlist Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
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
                              ? "rgba(239, 68, 68, 0.95)"
                              : "rgba(255, 255, 255, 0.95)",
                            color: isInWishlist ? "white" : "#64748b",
                            border: "none",
                            borderRadius: "50%",
                            cursor: "pointer",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s ease",
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
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

                        {/* View Details Overlay */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "16px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            padding: "8px 16px",
                            background: "rgba(255, 255, 255, 0.95)",
                            color: "#1e293b",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            opacity: 0,
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0";
                          }}
                        >
                          <Eye size={14} />
                          View Details
                        </div>
                      </div>

                      {/* Product Info */}
                      <div
                        style={{
                          padding: viewMode === "list" ? "2rem" : "1.5rem",
                          flex: viewMode === "list" ? 1 : "unset",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          height: viewMode === "list" ? "auto" : "100%",
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
                        }}
                      >
                        {/* Title and Description Section */}
                        <div style={{ marginBottom: "1.5rem" }}>
                          <h3
                            style={{
                              fontSize:
                                window.innerWidth <= 768
                                  ? "1.125rem"
                                  : "1.25rem",
                              fontWeight: "700",
                              color: "#1e293b",
                              margin: "0 0 1rem 0",
                              lineHeight: "1.3",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {product.title}
                          </h3>

                          {product.description && (
                            <p
                              style={{
                                color: "#64748b",
                                lineHeight: "1.6",
                                margin: "0 0 1rem 0",
                                fontSize: "0.875rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {product.description}
                            </p>
                          )}

                          {/* Product Details */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: "0.75rem",
                            }}
                          >
                            {dimensions && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  padding: "6px 12px",
                                  background: "rgba(59, 130, 246, 0.1)",
                                  borderRadius: "12px",
                                  border: "1px solid rgba(59, 130, 246, 0.2)",
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
                                  }}
                                >
                                  {dimensions.width}cm × {dimensions.height}cm
                                </span>
                              </div>
                            )}

                            {/* Price Status */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "6px 12px",
                                background:
                                  product.price > 0
                                    ? "rgba(34, 197, 94, 0.1)"
                                    : "rgba(239, 68, 68, 0.1)",
                                borderRadius: "12px",
                                border: `1px solid ${
                                  product.price > 0
                                    ? "rgba(34, 197, 94, 0.2)"
                                    : "rgba(239, 68, 68, 0.2)"
                                }`,
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
                                }}
                              >
                                {product.price > 0
                                  ? "In Stock"
                                  : "Out of Stock"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <motion.button
                          whileHover={{
                            scale: product.price > 0 ? 1.02 : 1,
                          }}
                          whileTap={{
                            scale: product.price > 0 ? 0.98 : 1,
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
                            padding: "1rem 1.25rem",
                            background:
                              product.price === 0
                                ? "linear-gradient(135deg, #6b7280, #4b5563)"
                                : addedToCartItems.has(product.id)
                                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                                : isInCart(product.id)
                                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            cursor:
                              product.price === 0 ||
                              addedToCartItems.has(product.id) ||
                              isInCart(product.id)
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            transition: "all 0.3s ease",
                            height: "48px",
                            boxShadow:
                              product.price === 0
                                ? "none"
                                : "0 4px 16px rgba(59, 130, 246, 0.3)",
                            opacity:
                              product.price === 0 ||
                              addedToCartItems.has(product.id) ||
                              isInCart(product.id)
                                ? 0.6
                                : 1,
                            letterSpacing: "0.025em",
                          }}
                        >
                          {product.price === 0 ? (
                            <>
                              <X size={18} />
                              Not Available
                            </>
                          ) : addedToCartItems.has(product.id) ? (
                            <>
                              <Check size={18} />
                              Added to Cart!
                            </>
                          ) : isInCart(product.id) ? (
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
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "20px",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Package
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
                No products in this collection
              </h3>
              <p style={{ color: "#94a3b8", margin: 0 }}>
                This collection is being updated. Please check back soon!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetail;
