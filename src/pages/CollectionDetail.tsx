import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  Sparkles,
  Check,
  Eye,
  Grid3X3,
  List,
  Package,
  Clock,
} from "lucide-react";
import { getAllProducts } from "../services/productService";
import { getAllCollections } from "../services/collectionService";
import type { Product, Collection, ApiError } from "../types/api";
import { getParsedDimensions, getParsedImages } from "../types/api";
import { useCart } from "../contexts/CartContext";
import ImageModal from "../components/ImageModal";
import PreorderModal from "../components/PreorderModal";
import "./Shop.css";

type ViewMode = "grid" | "list";

const CollectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);

  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
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
  const [loadingMessage, setLoadingMessage] = useState("Loading collection...");
  const [retryCount, setRetryCount] = useState(0);

  const { addToCart, addPreorderToCart, isInCart } = useCart();

  // Check if product is available
  const isProductAvailable = (product: Product) => {
    return product.price > 0;
  };

  // Check if product is in cart (including preorders)
  const isProductInCart = (product: Product) => {
    return isInCart(product.id);
  };

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

  const handlePreorderAddToCart = (product: Product, message: string) => {
    addPreorderToCart(product, message);
    setAddedToCartItems((prev) => new Set(prev).add(product.id));

    setTimeout(() => {
      setAddedToCartItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
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
              padding: window.innerWidth <= 768 ? "1rem" : "2rem",
              marginBottom: window.innerWidth <= 768 ? "1.5rem" : "3rem",
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
                  window.innerWidth <= 768 ? "1.5rem 1rem" : "2.5rem 2rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                position: "relative",
                display: "flex",
                flexDirection: window.innerWidth <= 768 ? "column" : "row",
                alignItems: window.innerWidth <= 768 ? "center" : "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: window.innerWidth <= 768 ? "12px" : "16px",
                marginBottom: window.innerWidth <= 768 ? "1.5rem" : "2rem",
                gap: window.innerWidth <= 768 ? "1rem" : "0",
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
                  width: window.innerWidth <= 768 ? "50px" : "70px",
                  height: window.innerWidth <= 768 ? "50px" : "70px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                  marginRight: window.innerWidth <= 768 ? "0" : "1.5rem",
                  marginBottom: window.innerWidth <= 768 ? "0.5rem" : "0",
                }}
              >
                <Sparkles
                  size={window.innerWidth <= 768 ? 24 : 32}
                  style={{ color: "white" }}
                />
              </div>

              {/* Collection Title and Description */}
              <div
                style={{
                  flex: 1,
                  textAlign: window.innerWidth <= 768 ? "center" : "left",
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    window.innerWidth <= 768 ? "center" : "flex-start",
                }}
              >
                <h1
                  style={{
                    fontSize: window.innerWidth <= 768 ? "1.5rem" : "2.5rem",
                    fontWeight: "700",
                    color: "white",
                    margin: "0 0 0.75rem 0",
                    lineHeight: "1.2",
                    letterSpacing: "-0.025em",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                    textAlign: window.innerWidth <= 768 ? "center" : "left",
                  }}
                >
                  {collection.name}
                </h1>
                <p
                  style={{
                    fontSize: window.innerWidth <= 768 ? "0.9rem" : "1.125rem",
                    color: "rgba(255, 255, 255, 0.9)",
                    lineHeight: "1.6",
                    margin: 0,
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                    textAlign: window.innerWidth <= 768 ? "center" : "left",
                    maxWidth: window.innerWidth <= 768 ? "100%" : "none",
                  }}
                >
                  {collection.description}
                </p>
              </div>

              {/* Stats Badges */}
              <div
                style={{
                  display: "flex",
                  flexDirection: window.innerWidth <= 768 ? "row" : "column",
                  gap: window.innerWidth <= 768 ? "0.5rem" : "0.75rem",
                  marginLeft: window.innerWidth <= 768 ? "0" : "1.5rem",
                  marginTop: window.innerWidth <= 768 ? "1rem" : "0",
                  justifyContent:
                    window.innerWidth <= 768 ? "center" : "flex-start",
                  flexWrap: "wrap",
                }}
              >
                {/* Product Count Badge */}
                <div
                  style={{
                    padding: window.innerWidth <= 768 ? "6px 12px" : "8px 16px",
                    background: "rgba(255, 255, 255, 0.95)",
                    color: "#1e293b",
                    borderRadius: "25px",
                    fontSize: window.innerWidth <= 768 ? "0.7rem" : "0.8rem",
                    fontWeight: "700",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: window.innerWidth <= 768 ? "4px" : "6px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    letterSpacing: "0.025em",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Package size={window.innerWidth <= 768 ? 12 : 14} />
                  {totalProducts} {totalProducts === 1 ? "Product" : "Products"}
                </div>

                {/* Image Count Badge */}
                {images.length > 0 && (
                  <div
                    style={{
                      padding:
                        window.innerWidth <= 768 ? "6px 12px" : "8px 16px",
                      background: "rgba(34, 197, 94, 0.95)",
                      color: "white",
                      borderRadius: "25px",
                      fontSize: window.innerWidth <= 768 ? "0.7rem" : "0.8rem",
                      fontWeight: "700",
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      gap: window.innerWidth <= 768 ? "4px" : "6px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      letterSpacing: "0.025em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Eye size={window.innerWidth <= 768 ? 12 : 14} />
                    {images.length} Images
                  </div>
                )}
              </div>
            </div>

            {/* Collection Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  window.innerWidth <= 768
                    ? "repeat(auto-fit, minmax(120px, 1fr))"
                    : "repeat(auto-fit, minmax(150px, 1fr))",
                gap: window.innerWidth <= 768 ? "0.75rem" : "1rem",
              }}
            >
              <div
                style={{
                  padding: window.innerWidth <= 768 ? "0.75rem" : "1rem",
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
                    gap: window.innerWidth <= 768 ? "0.25rem" : "0.5rem",
                    marginBottom:
                      window.innerWidth <= 768 ? "0.25rem" : "0.5rem",
                  }}
                >
                  <Package
                    size={window.innerWidth <= 768 ? 14 : 16}
                    style={{ color: "#667eea" }}
                  />
                  <span
                    style={{
                      fontSize:
                        window.innerWidth <= 768 ? "0.75rem" : "0.875rem",
                      fontWeight: "500",
                      color: "#667eea",
                    }}
                  >
                    Products
                  </span>
                </div>
                <p
                  style={{
                    fontSize: window.innerWidth <= 768 ? "1.25rem" : "1.5rem",
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
                  padding: window.innerWidth <= 768 ? "0.75rem" : "1rem",
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
                    gap: window.innerWidth <= 768 ? "0.25rem" : "0.5rem",
                    marginBottom:
                      window.innerWidth <= 768 ? "0.25rem" : "0.5rem",
                  }}
                >
                  <Sparkles
                    size={window.innerWidth <= 768 ? 14 : 16}
                    style={{ color: "#22c55e" }}
                  />
                  <span
                    style={{
                      fontSize:
                        window.innerWidth <= 768 ? "0.75rem" : "0.875rem",
                      fontWeight: "500",
                      color: "#22c55e",
                    }}
                  >
                    Available
                  </span>
                </div>
                <p
                  style={{
                    fontSize: window.innerWidth <= 768 ? "1.25rem" : "1.5rem",
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
                    padding: window.innerWidth <= 768 ? "0.75rem" : "1rem",
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
                      gap: window.innerWidth <= 768 ? "0.25rem" : "0.5rem",
                      marginBottom:
                        window.innerWidth <= 768 ? "0.25rem" : "0.5rem",
                    }}
                  >
                    <Eye
                      size={window.innerWidth <= 768 ? 14 : 16}
                      style={{ color: "#3b82f6" }}
                    />
                    <span
                      style={{
                        fontSize:
                          window.innerWidth <= 768 ? "0.75rem" : "0.875rem",
                        fontWeight: "500",
                        color: "#3b82f6",
                      }}
                    >
                      Images
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: window.innerWidth <= 768 ? "1.25rem" : "1.5rem",
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
                            ? window.innerWidth <= 768
                              ? "200px"
                              : "220px"
                            : window.innerWidth <= 768
                            ? "420px"
                            : "480px",
                        minHeight:
                          viewMode === "list"
                            ? window.innerWidth <= 768
                              ? "200px"
                              : "220px"
                            : window.innerWidth <= 768
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
                              ? window.innerWidth <= 768
                                ? "240px"
                                : "300px"
                              : window.innerWidth <= 768
                              ? "200px"
                              : "220px",
                          width:
                            viewMode === "list"
                              ? window.innerWidth <= 768
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
                              : window.innerWidth <= 768
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
                              product.price > 0 ? "availability" : "unavailable"
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

export default CollectionDetail;
