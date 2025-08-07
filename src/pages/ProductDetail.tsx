import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  Sparkles,
  Check,
  Eye,
  Package,
  X,
} from "lucide-react";
import { getAllProducts } from "../services/productService";
import { getAllCollections } from "../services/collectionService";
import type { Product, Collection, ApiError } from "../types/api";
import { getParsedDimensions } from "../types/api";
import { useCart } from "../contexts/CartContext";
import ImageModal from "../components/ImageModal";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
  }>({
    isOpen: false,
    imageUrl: "",
    title: "",
  });

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
            padding:
              window.innerWidth <= 480
                ? "0.5rem"
                : window.innerWidth <= 768
                ? "1rem"
                : "2rem",
          }}
        >
          {/* Enhanced Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{
              scale: 1.02,
              x: -5,
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/shop")}
            style={{
              padding:
                window.innerWidth <= 480 ? "0.5rem 0.75rem" : "0.75rem 1rem",
              background: "rgba(255, 255, 255, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: window.innerWidth <= 480 ? "8px" : "12px",
              cursor: "pointer",
              fontSize: window.innerWidth <= 480 ? "0.8rem" : "0.9rem",
              fontWeight: "500",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: window.innerWidth <= 480 ? "1rem" : "2rem",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <ArrowLeft size={18} />
            Back to Shop
          </motion.button>

          {/* Enhanced Product Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
            style={{
              display: "grid",
              gridTemplateColumns: window.innerWidth > 768 ? "1fr 1fr" : "1fr",
              gap:
                window.innerWidth > 768
                  ? "3rem"
                  : window.innerWidth <= 480
                  ? "1rem"
                  : "1.5rem",
              alignItems: "start",
            }}
          >
            {/* Enhanced Product Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 60 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
              }}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: window.innerWidth <= 768 ? "16px" : "20px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                backdropFilter: "blur(20px)",
                position: window.innerWidth > 768 ? "sticky" : "static",
                top: window.innerWidth > 768 ? "140px" : "auto",
                marginBottom: window.innerWidth <= 480 ? "1rem" : "0",
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
                  overflow: "hidden",
                }}
              >
                {!product.image && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1rem",
                      color: "#94a3b8",
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
                      style={{
                        width: "80px",
                        height: "80px",
                        background: "rgba(148, 163, 184, 0.1)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px solid rgba(148, 163, 184, 0.2)",
                      }}
                    >
                      <Eye size={40} />
                    </motion.div>
                    <span style={{ fontSize: "1rem", fontWeight: "500" }}>
                      No Image Available
                    </span>
                  </motion.div>
                )}

                {/* Enhanced Eye Button for Full Image View */}
                {product.image && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(59, 130, 246, 0.9)",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openImageModal(product.image, product.title)}
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      width: "48px",
                      height: "48px",
                      background: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Eye size={20} />
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Enhanced Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: window.innerWidth <= 768 ? "16px" : "20px",
                padding:
                  window.innerWidth <= 480
                    ? "1rem"
                    : window.innerWidth <= 768
                    ? "1.5rem"
                    : "2rem",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Enhanced Product Title */}
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  fontSize:
                    window.innerWidth <= 480
                      ? "1.5rem"
                      : window.innerWidth <= 768
                      ? "2rem"
                      : "2.5rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  marginBottom: "1.5rem",
                  lineHeight: "1.2",
                  letterSpacing: "-0.02em",
                }}
              >
                {product.title}
              </motion.h1>

              {/* Enhanced Product Specifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    window.innerWidth <= 480
                      ? "1fr"
                      : "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: window.innerWidth <= 480 ? "0.75rem" : "1rem",
                  marginBottom: "2rem",
                }}
              >
                {/* Enhanced Dimensions */}
                {dimensions &&
                  (dimensions.width > 0 || dimensions.height > 0) && (
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        padding: "1rem",
                        background: "rgba(16, 185, 129, 0.05)",
                        borderRadius: "12px",
                        border: "1px solid rgba(16, 185, 129, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          background: "rgba(16, 185, 129, 0.1)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Package size={20} style={{ color: "#10b981" }} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color: "#10b981",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Dimensions
                        </div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          {dimensions.width > 0 && dimensions.height > 0 ? (
                            <>
                              {dimensions.width}cm × {dimensions.height}cm
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
                        </div>
                      </div>
                    </motion.div>
                  )}

                {/* Enhanced Availability */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    padding: "1rem",
                    background:
                      product.price > 0
                        ? "rgba(34, 197, 94, 0.05)"
                        : "rgba(239, 68, 68, 0.05)",
                    borderRadius: "12px",
                    border: `1px solid ${
                      product.price > 0
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(239, 68, 68, 0.1)"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background:
                        product.price > 0
                          ? "rgba(34, 197, 94, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check
                      size={20}
                      style={{
                        color: product.price > 0 ? "#22c55e" : "#ef4444",
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: product.price > 0 ? "#22c55e" : "#ef4444",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Availability
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        fontWeight: "500",
                      }}
                    >
                      {product.price > 0 ? "In Stock" : "Sold Out"}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Enhanced Add to Cart Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={product.price === 0 || isInCart(product.id)}
                style={{
                  width: "100%",
                  padding:
                    window.innerWidth <= 480 ? "0.75rem 1rem" : "1rem 1.5rem",
                  background:
                    product.price === 0 || isInCart(product.id)
                      ? "linear-gradient(135deg, #94a3b8, #64748b)"
                      : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: window.innerWidth <= 480 ? "10px" : "12px",
                  fontSize: window.innerWidth <= 480 ? "0.9rem" : "1rem",
                  fontWeight: "600",
                  cursor:
                    product.price === 0 || isInCart(product.id)
                      ? "not-allowed"
                      : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                  letterSpacing: "0.025em",
                }}
              >
                {product.price === 0 ? (
                  <>
                    <X size={20} />
                    Cannot Add to Cart
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

              {/* Success Message */}
              {addedToCart && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem 1rem",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#10b981",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  <Check size={16} />
                  Added to cart successfully!
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
        title={imageModal.title}
      />
    </div>
  );
};

export default ProductDetail;
