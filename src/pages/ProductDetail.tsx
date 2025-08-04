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
  Package,
  Palette,
} from "lucide-react";
import { getAllProducts } from "../services/productService";
import { getAllCollections } from "../services/collectionService";
import type { Product, Collection, ApiError } from "../types/api";
import { getParsedDimensions } from "../types/api";
import { useCart } from "../contexts/CartContext";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, collectionsData] = await Promise.all([
        getAllProducts(),
        getAllCollections(),
      ]);

      const foundProduct = productsData.find(
        (p) => p.id === parseInt(id || "0")
      );
      if (!foundProduct) {
        setError("Product not found");
        return;
      }

      setProduct(foundProduct);
      setCollections(collectionsData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load product data");
      console.error("Error loading product data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityStatus = (available: boolean) => {
    return available ? "Available" : "Not Available";
  };

  const getCollectionName = (collectionId: number) => {
    const collection = collections.find((c) => c.id === collectionId);
    return collection?.name || "Unknown Collection";
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
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

  if (error || !product) {
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
            <Eye size={64} style={{ color: "#ef4444", marginBottom: "1rem" }} />
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: "1rem",
              }}
            >
              {error || "Product not found"}
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

  const dimensions = getParsedDimensions(product);

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
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem",
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

          {/* Product Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "grid",
              gridTemplateColumns: window.innerWidth > 768 ? "1fr 1fr" : "1fr",
              gap: window.innerWidth > 768 ? "3rem" : "2rem",
              alignItems: "start",
            }}
          >
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(20px)",
                position: window.innerWidth > 768 ? "sticky" : "static",
                top: window.innerWidth > 768 ? "140px" : "auto",
              }}
            >
              <div
                style={{
                  aspectRatio: "1",
                  background: product.image
                    ? `url(${product.image}) center/cover`
                    : "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!product.image && (
                  <Eye size={80} style={{ color: "#cbd5e1" }} />
                )}

                {/* Wishlist Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleWishlist}
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    padding: "12px",
                    background: isWishlisted
                      ? "rgba(239, 68, 68, 0.95)"
                      : "rgba(255, 255, 255, 0.95)",
                    color: isWishlisted ? "white" : "#64748b",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Heart
                    size={20}
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                </motion.button>

                {/* Collection Badge */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    padding: "8px 16px",
                    background: "rgba(59, 130, 246, 0.95)",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {getCollectionName(product.collectionId)}
                </div>
              </div>
            </motion.div>

            {/* Product Details */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "20px",
                padding: "2rem",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Title and Availability */}
              <div style={{ marginBottom: "2rem" }}>
                <h1
                  style={{
                    fontSize: "2rem",
                    fontWeight: "700",
                    color: "#1e293b",
                    margin: "0 0 1rem 0",
                    lineHeight: "1.2",
                  }}
                >
                  {product.title}
                </h1>
                <p
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: product.available ? "#22c55e" : "#ef4444",
                    margin: 0,
                    padding: "8px 16px",
                    background: product.available
                      ? "rgba(34, 197, 94, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                    borderRadius: "20px",
                    display: "inline-block",
                  }}
                >
                  {getAvailabilityStatus(product.available)}
                </p>
              </div>

              {/* Description */}
              {product.description && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#1e293b",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Description
                  </h3>
                  <p
                    style={{
                      color: "#64748b",
                      lineHeight: "1.6",
                      margin: 0,
                      fontSize: "1rem",
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Specifications */}
              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: "1rem",
                  }}
                >
                  Specifications
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      window.innerWidth > 480 ? "1fr 1fr" : "1fr",
                    gap: "1rem",
                  }}
                >
                  {dimensions && (
                    <div
                      style={{
                        padding: "1rem",
                        background: "rgba(59, 130, 246, 0.05)",
                        borderRadius: "12px",
                        border: "1px solid rgba(59, 130, 246, 0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <Package size={16} style={{ color: "#3b82f6" }} />
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#3b82f6",
                          }}
                        >
                          Dimensions
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          color: "#64748b",
                        }}
                      >
                        {dimensions.width}" × {dimensions.height}"
                        {dimensions.depth && ` × ${dimensions.depth}"`}
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      padding: "1rem",
                      background: "rgba(16, 185, 129, 0.05)",
                      borderRadius: "12px",
                      border: "1px solid rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Palette size={16} style={{ color: "#10b981" }} />
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#10b981",
                        }}
                      >
                        Collection
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: "#64748b",
                      }}
                    >
                      {getCollectionName(product.collectionId)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: product.available ? 1.02 : 1 }}
                whileTap={{ scale: product.available ? 0.98 : 1 }}
                onClick={() => product.available && handleAddToCart()}
                disabled={!product.available}
                style={{
                  width: "100%",
                  padding: "1.25rem",
                  background: !product.available
                    ? "linear-gradient(135deg, #6b7280, #4b5563)"
                    : addedToCart
                    ? "linear-gradient(135deg, #22c55e, #16a34a)"
                    : isInCart(product.id)
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "16px",
                  cursor: product.available ? "pointer" : "not-allowed",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  transition: "all 0.3s ease",
                  boxShadow: !product.available
                    ? "0 4px 16px rgba(107, 114, 128, 0.2)"
                    : "0 4px 16px rgba(59, 130, 246, 0.3)",
                  opacity: product.available ? 1 : 0.6,
                }}
              >
                {!product.available ? (
                  <>
                    <Eye size={24} />
                    Not Available
                  </>
                ) : addedToCart ? (
                  <>
                    <Check size={24} />
                    Added to Cart!
                  </>
                ) : isInCart(product.id) ? (
                  <>
                    <ShoppingCart size={24} />
                    Already in Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={24} />
                    Add to Cart
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
