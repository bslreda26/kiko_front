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
  const [loadingMessage, setLoadingMessage] = useState("Loading collection...");
  const [retryCount, setRetryCount] = useState(0);

  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    loadCollectionData();
  }, [id]);

  const loadCollectionData = async () => {
    const maxRetries = 3;
    let currentRetryCount = 0;

    const attemptLoad = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        setRetryCount(currentRetryCount);

        if (currentRetryCount > 0) {
          setLoadingMessage(
            `Retrying... Attempt ${currentRetryCount + 1}/${maxRetries}`
          );
        } else {
          setLoadingMessage("Loading collection data...");
        }

        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), 15000);
        });

        setLoadingMessage("Fetching products and collections...");
        const dataPromise = Promise.all([
          getAllProducts(),
          getAllCollections(),
        ]);

        const [productsData, collectionsData] = await Promise.race([
          dataPromise,
          timeoutPromise,
        ]);

        setLoadingMessage("Processing collection data...");
        const foundCollection = collectionsData.find(
          (c: Collection) => c.id === parseInt(id || "0")
        );

        if (!foundCollection) {
          setError("Collection not found");
          return;
        }

        const productsInCollection = productsData.filter(
          (product: Product) => product.collectionId === foundCollection.id
        );

        setCollection(foundCollection);
        setCollectionProducts(productsInCollection);
        setRetryCount(0);
      } catch (err) {
        const apiError = err as ApiError;
        console.error("Error loading collection data:", err);

        // Retry logic for network errors
        if (
          currentRetryCount < maxRetries &&
          (apiError.message?.includes("fetch") ||
            apiError.message?.includes("network") ||
            apiError.message?.includes("timeout") ||
            apiError.message?.includes("connection") ||
            !apiError.message)
        ) {
          currentRetryCount++;
          console.log(`Retrying... Attempt ${currentRetryCount}/${maxRetries}`);

          // Exponential backoff
          const delay = 1000 * currentRetryCount;
          setLoadingMessage(
            `Connection failed. Retrying in ${delay / 1000} seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return attemptLoad();
        }

        // Final error state
        if (currentRetryCount >= maxRetries) {
          setError(
            "Unable to load collection data after multiple attempts. Please check your connection and try again."
          );
        } else {
          setError(
            apiError.message ||
              "Failed to load collection data. Please try again."
          );
        }
      } finally {
        setLoading(false);
        setLoadingMessage("Loading collection...");
      }
    };

    await attemptLoad();
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
          <div
            style={{
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "20px",
              padding: "3rem",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              maxWidth: "400px",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ color: "#3b82f6", marginBottom: "1rem" }}
            >
              <Sparkles size={48} />
            </motion.div>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: "0.5rem",
              }}
            >
              {loadingMessage}
            </h3>
            {retryCount > 0 && (
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.875rem",
                  margin: "0.5rem 0 0 0",
                }}
              >
                Attempt {retryCount} of 3
              </p>
            )}
            <div
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                background: "rgba(59, 130, 246, 0.1)",
                borderRadius: "8px",
                fontSize: "0.75rem",
                color: "#3b82f6",
              }}
            >
              💡 Tip: If loading takes too long, check your internet connection
            </div>
          </div>
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
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "20px",
              padding: "3rem",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
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
            <p
              style={{
                color: "#64748b",
                marginBottom: "2rem",
                lineHeight: "1.6",
              }}
            >
              {error?.includes("connection") || error?.includes("network")
                ? "It looks like there's a connection issue. Please check your internet connection and try again."
                : "We couldn't load the collection data. Please try again."}
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadCollectionData()}
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
                }}
              >
                <Sparkles size={20} />
                Try Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/shop")}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "rgba(255, 255, 255, 0.9)",
                  color: "#64748b",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <ArrowLeft size={20} />
                Back to Shop
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = getParsedImages(collection);
  const totalProducts = collectionProducts.length;
  const availableProducts = collectionProducts.filter(
    (product) => product.price > 0
  ).length;

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
            {/* Elegant Text Header */}
            <div
              style={{
                padding:
                  window.innerWidth <= 768 ? "2rem 1.5rem" : "2.5rem 2rem",
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
                  marginRight: "1.5rem",
                }}
              >
                <Sparkles
                  size={window.innerWidth <= 768 ? 28 : 32}
                  style={{ color: "white" }}
                />
              </div>

              {/* Collection Title and Description */}
              <div style={{ flex: 1, textAlign: "left" }}>
                <h1
                  style={{
                    fontSize: window.innerWidth <= 768 ? "1.75rem" : "2.5rem",
                    fontWeight: "700",
                    color: "white",
                    margin: "0 0 0.75rem 0",
                    lineHeight: "1.2",
                    letterSpacing: "-0.025em",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {collection.name}
                </h1>
                <p
                  style={{
                    fontSize: window.innerWidth <= 768 ? "1rem" : "1.125rem",
                    color: "rgba(255, 255, 255, 0.9)",
                    lineHeight: "1.6",
                    margin: 0,
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {collection.description}
                </p>
              </div>

              {/* Stats Badges */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginLeft: "1.5rem",
                }}
              >
                {/* Product Count Badge */}
                <div
                  style={{
                    padding: "8px 16px",
                    background: "rgba(255, 255, 255, 0.95)",
                    color: "#1e293b",
                    borderRadius: "25px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    letterSpacing: "0.025em",
                  }}
                >
                  <Package size={14} />
                  {totalProducts} {totalProducts === 1 ? "Product" : "Products"}
                </div>

                {/* Image Count Badge */}
                {images.length > 0 && (
                  <div
                    style={{
                      padding: "8px 16px",
                      background: "rgba(34, 197, 94, 0.95)",
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
            </div>

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
                  {availableProducts}
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
                      whileHover={{ y: -12, scale: 1.03 }}
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
                        borderRadius:
                          window.innerWidth <= 768 ? "20px" : "24px",
                        overflow: "hidden",
                        boxShadow:
                          "0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.4)",
                        backdropFilter: "blur(20px)",
                        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: viewMode === "list" ? "flex" : "block",
                        alignItems: viewMode === "list" ? "stretch" : "unset",
                        height: viewMode === "list" ? "auto" : "100%",
                        position: "relative",
                        // Artistic border gradient
                        backgroundClip: "padding-box",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: "inherit",
                          padding: "2px",
                          background:
                            "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
                          WebkitMask:
                            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                          WebkitMaskComposite: "xor",
                          maskComposite: "exclude",
                        },
                      }}
                    >
                      {/* Product Image Container */}
                      <div
                        onClick={() => handleProductClick(product.id)}
                        style={{
                          height:
                            viewMode === "grid"
                              ? window.innerWidth <= 768
                                ? "240px"
                                : "320px"
                              : "220px",
                          width: viewMode === "list" ? "300px" : "100%",
                          flexShrink: 0,
                          background: product.image
                            ? `url(${product.image}) center/cover`
                            : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                          overflow: "hidden",
                          // Artistic overlay
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                            opacity: 0,
                            transition: "opacity 0.3s ease",
                          },
                        }}
                        onMouseEnter={(e) => {
                          if (product.image) {
                            e.currentTarget.style.transform = "scale(1.05)";
                          }
                          // Show artistic overlay
                          const overlay = e.currentTarget.querySelector(
                            ".artistic-overlay"
                          ) as HTMLElement;
                          if (overlay) overlay.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
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
                              "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15), rgba(240, 147, 251, 0.1))",
                            opacity: 0,
                            transition: "opacity 0.4s ease",
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

                        {/* Elegant Status Badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: "20px",
                            left: "20px",
                            padding: "8px 16px",
                            background:
                              product.price > 0
                                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95))"
                                : "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
                            color: "white",
                            borderRadius: "25px",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                            backdropFilter: "blur(20px)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                          }}
                        >
                          {product.price > 0 ? "Available" : "Out of Stock"}
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
                            border: "none",
                            borderRadius: "50%",
                            cursor: "pointer",
                            backdropFilter: "blur(20px)",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
                            left: "50%",
                            transform: "translateX(-50%)",
                            padding: "12px 24px",
                            background: "rgba(255, 255, 255, 0.95)",
                            color: "#1e293b",
                            borderRadius: "30px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            backdropFilter: "blur(20px)",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            opacity: 0,
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            letterSpacing: "0.05em",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.transform =
                              "translateX(-50%) scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0";
                            e.currentTarget.style.transform =
                              "translateX(-50%) scale(1)";
                          }}
                        >
                          <Eye size={16} />
                          View Details
                        </div>
                      </div>

                      {/* Elegant Product Info */}
                      <div
                        style={{
                          padding: viewMode === "list" ? "2.5rem" : "2rem",
                          flex: viewMode === "list" ? 1 : "unset",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          height: viewMode === "list" ? "auto" : "100%",
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
                        }}
                      >
                        {/* Title and Description Section */}
                        <div style={{ marginBottom: "2rem" }}>
                          <h3
                            style={{
                              fontSize:
                                window.innerWidth <= 768 ? "1.25rem" : "1.5rem",
                              fontWeight: "800",
                              color: "#1e293b",
                              margin: "0 0 1rem 0",
                              lineHeight: "1.3",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {product.title}
                          </h3>

                          {product.description && (
                            <p
                              style={{
                                color: "#64748b",
                                lineHeight: "1.7",
                                margin: "0 0 1.5rem 0",
                                fontSize: "0.95rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                fontWeight: "400",
                              }}
                            >
                              {product.description}
                            </p>
                          )}

                          {/* Elegant Product Details */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: "1rem",
                            }}
                          >
                            {dimensions && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem",
                                  padding: "8px 16px",
                                  background:
                                    "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))",
                                  borderRadius: "16px",
                                  border: "1px solid rgba(59, 130, 246, 0.2)",
                                  backdropFilter: "blur(10px)",
                                }}
                              >
                                <Package
                                  size={16}
                                  style={{ color: "#3b82f6" }}
                                />
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    fontWeight: "600",
                                    color: "#3b82f6",
                                    letterSpacing: "0.02em",
                                  }}
                                >
                                  {dimensions.width}cm × {dimensions.height}cm
                                </span>
                              </div>
                            )}

                            {/* Artistic Price Status */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "8px 16px",
                                background:
                                  product.price > 0
                                    ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))"
                                    : "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))",
                                borderRadius: "16px",
                                border: `1px solid ${
                                  product.price > 0
                                    ? "rgba(34, 197, 94, 0.2)"
                                    : "rgba(239, 68, 68, 0.2)"
                                }`,
                                backdropFilter: "blur(10px)",
                              }}
                            >
                              <Sparkles
                                size={16}
                                style={{
                                  color:
                                    product.price > 0 ? "#22c55e" : "#ef4444",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "0.8rem",
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
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
