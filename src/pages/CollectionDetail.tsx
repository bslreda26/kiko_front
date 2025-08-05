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

  const getAvailabilityStatus = (isAvailable: boolean) => {
    return isAvailable === true
      ? "Available"
      : "Not Available";
  };

  const isAvailable = (isAvailable: boolean) => {
    return isAvailable === true;
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
  const availableProducts = collectionProducts.filter((product) =>
    isAvailable(product.isAvailable)
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

          {/* Collection Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "2rem",
              marginBottom: "3rem",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  window.innerWidth > 768 ? "300px 1fr" : "1fr",
                gap: "2rem",
                alignItems: "center",
              }}
            >
              {/* Collection Image */}
              {images.length > 0 && (
                <div
                  style={{
                    aspectRatio: "1",
                    borderRadius: "16px",
                    background: `url(${images[0]}) center/cover`,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)",
                    }}
                  />
                  {images.length > 1 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        padding: "6px 10px",
                        background: "rgba(34, 197, 94, 0.95)",
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Eye size={12} style={{ marginRight: "4px" }} />
                      {images.length} Images
                    </div>
                  )}
                </div>
              )}

              {/* Collection Info */}
              <div>
                <h1
                  style={{
                    fontSize: "2.5rem",
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
                    fontSize: "1.125rem",
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
                      <Package size={16} style={{ color: "#3b82f6" }} />
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#3b82f6",
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
                      {collectionProducts.length}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      background: "rgba(16, 185, 129, 0.05)",
                      borderRadius: "12px",
                      border: "1px solid rgba(16, 185, 129, 0.1)",
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
                      <Sparkles size={16} style={{ color: "#10b981" }} />
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "#10b981",
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
                </div>
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
            }}
          >
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#1e293b",
                margin: 0,
              }}
            >
              Products ({collectionProducts.length})
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
                      ? "repeat(auto-fit, minmax(300px, 1fr))"
                      : "1fr",
                  gap: "2rem",
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
                      whileHover={{ y: -4, scale: 1.01 }}
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(20px)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: viewMode === "list" ? "flex" : "block",
                        alignItems: viewMode === "list" ? "stretch" : "unset",
                        height: viewMode === "list" ? "auto" : "100%",
                      }}
                    >
                      {/* Product Image */}
                      <div
                        onClick={() => handleProductClick(product.id)}
                        style={{
                          height: viewMode === "grid" ? "280px" : "180px",
                          width: viewMode === "list" ? "240px" : "100%",
                          flexShrink: 0,
                          background: product.image
                            ? `url(${product.image}) center/cover`
                            : "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (product.image) {
                            e.currentTarget.style.transform = "scale(1.05)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        {!product.image && (
                          <Eye size={48} style={{ color: "#cbd5e1" }} />
                        )}

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
                            top: "12px",
                            right: "12px",
                            padding: "8px",
                            background: isInWishlist
                              ? "rgba(239, 68, 68, 0.95)"
                              : "rgba(255, 255, 255, 0.95)",
                            color: isInWishlist ? "white" : "#64748b",
                            border: "none",
                            borderRadius: "50%",
                            cursor: "pointer",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <Heart
                            size={16}
                            fill={isInWishlist ? "currentColor" : "none"}
                          />
                        </motion.button>
                      </div>

                      {/* Product Info */}
                      <div
                        style={{
                          padding: viewMode === "list" ? "1.5rem" : "1.25rem",
                          flex: viewMode === "list" ? 1 : "unset",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          height: viewMode === "list" ? "auto" : "100%",
                        }}
                      >
                        {/* Title and Price Section */}
                        <div style={{ marginBottom: "1rem" }}>
                          <h3
                            style={{
                              fontSize: "1.125rem",
                              fontWeight: "600",
                              color: "#1e293b",
                              margin: "0 0 0.75rem 0",
                              lineHeight: "1.4",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {product.title}
                          </h3>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              justifyContent: "space-between",
                              marginBottom: "0.5rem",
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
                              <p
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#94a3b8",
                                  margin: 0,
                                  fontWeight: "500",
                                }}
                              >
                                {dimensions.width}" × {dimensions.height}"
                              </p>
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
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
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
                            padding: "0.875rem 1rem",
                            background: !isAvailable(product.isAvailable)
                              ? "linear-gradient(135deg, #6b7280, #4b5563)"
                              : addedToCartItems.has(product.id)
                              ? "linear-gradient(135deg, #22c55e, #16a34a)"
                              : isInCart(product.id)
                              ? "linear-gradient(135deg, #f59e0b, #d97706)"
                              : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            cursor: isAvailable(product.isAvailable)
                              ? "pointer"
                              : "not-allowed",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            transition: "all 0.3s ease",
                            height: "44px",
                            boxShadow: !isAvailable(product.isAvailable)
                              ? "0 2px 8px rgba(107, 114, 128, 0.2)"
                              : "0 2px 8px rgba(59, 130, 246, 0.3)",
                            opacity: isAvailable(product.isAvailable) ? 1 : 0.6,
                          }}
                        >
                          {!isAvailable(product.isAvailable) ? (
                            <>
                              <Eye size={18} />
                              Not Available
                            </>
                          ) : addedToCartItems.has(product.id) ? (
                            <>
                              <Check size={18} />
                              Added!
                            </>
                          ) : isInCart(product.id) ? (
                            <>
                              <ShoppingCart size={18} />
                              In Cart
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
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "20px",
                backdropFilter: "blur(10px)",
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
