import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  Sparkles,
  LogOut,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";
import {
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../services/collectionService";
import type {
  Product,
  Collection,
  ApiError,
  CreateProductRequest,
  UpdateProductRequest,
  CreateCollectionRequest,
  UpdateCollectionRequest,
} from "../types/api";
import { getParsedDimensions, getParsedImages } from "../types/api";
import ImageUpload from "../components/ImageUpload";
import MultipleImageUpload from "../components/MultipleImageUpload";
import { uploadFile } from "../services/uploadService";

type TabType = "products" | "collections";
type ModalType = "product" | "collection" | null;

interface ProductForm {
  title: string;
  description: string;
  image: string;
  price: number;
  dimensions: { width: number; height: number; depth: number };
  collectionId: number;
}

interface CollectionForm {
  name: string;
  description: string;
  images: string[];
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<Product | Collection | null>(
    null
  );
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState<ProductForm>({
    title: "",
    description: "",
    image: "",
    price: 0,
    dimensions: { width: 0, height: 0, depth: 0 },
    collectionId: 0,
  });

  const [collectionForm, setCollectionForm] = useState<CollectionForm>({
    name: "",
    description: "",
    images: [""],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      setError(apiError.message || "Failed to load data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const openModal = (type: ModalType, item?: Product | Collection) => {
    setModalType(type);
    setEditingItem(item || null);
    setError(null);
    setSuccessMessage(null);

    if (type === "product") {
      if (item) {
        const product = item as Product;
        const dimensions = getParsedDimensions(product);
        setProductForm({
          title: product.title,
          description: product.description,
          image: product.image,
          price: product.price,
          dimensions,
          collectionId: product.collectionId,
        });
      } else {
        setProductForm({
          title: "",
          description: "",
          image: "",
          price: 0,
          dimensions: { width: 0, height: 0, depth: 0 },
          collectionId: collections[0]?.id || 0,
        });
      }
    } else if (type === "collection") {
      if (item) {
        const collection = item as Collection;
        const images = getParsedImages(collection);
        setCollectionForm({
          name: collection.name,
          description: collection.description,
          images: images.length > 0 ? images : [""],
        });
      } else {
        setCollectionForm({
          name: "",
          description: "",
          images: [""],
        });
      }
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
  };

  const validateProductForm = (): string | null => {
    if (!productForm.title.trim()) return "Product title is required";
    if (!productForm.description.trim())
      return "Product description is required";
    if (!productForm.image.trim()) return "Product image URL is required";
    if (productForm.price <= 0) return "Product price must be greater than 0";
    if (productForm.collectionId <= 0) return "Please select a collection";
    if (
      productForm.dimensions.width <= 0 ||
      productForm.dimensions.height <= 0
    ) {
      return "Product dimensions must be greater than 0";
    }
    return null;
  };

  const validateCollectionForm = (): string | null => {
    if (!collectionForm.name.trim()) return "Collection name is required";
    if (!collectionForm.description.trim())
      return "Collection description is required";
    const validImages = collectionForm.images.filter(
      (img) => img.trim() !== ""
    );
    if (validImages.length === 0) return "At least one image URL is required";
    return null;
  };

  const handleSave = async () => {
    setModalLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate form data
      let validationError: string | null = null;
      if (modalType === "product") {
        validationError = validateProductForm();
      } else if (modalType === "collection") {
        validationError = validateCollectionForm();
      }

      if (validationError) {
        setError(validationError);
        setModalLoading(false);
        return;
      }

      if (modalType === "product") {
        // Prepare product data
        const productData = {
          title: productForm.title.trim(),
          description: productForm.description.trim(),
          image: productForm.image.trim(),
          price: productForm.price,
          dimensions: JSON.stringify(productForm.dimensions),
          collectionId: productForm.collectionId,
        };

        if (editingItem) {
          // Update existing product
          await updateProduct(
            (editingItem as Product).id,
            productData as UpdateProductRequest
          );
          setSuccessMessage("Product updated successfully!");
        } else {
          // Create new product
          await createProduct(productData as CreateProductRequest);
          setSuccessMessage("Product created successfully!");
        }
      } else if (modalType === "collection") {
        // Prepare collection data
        const validImages = collectionForm.images.filter(
          (img) => img.trim() !== ""
        );
        const collectionData = {
          name: collectionForm.name.trim(),
          description: collectionForm.description.trim(),
          images: JSON.stringify(validImages),
        };

        if (editingItem) {
          // Update existing collection
          await updateCollection(
            (editingItem as Collection).id,
            collectionData as UpdateCollectionRequest
          );
          setSuccessMessage("Collection updated successfully!");
        } else {
          // Create new collection
          await createCollection(collectionData as CreateCollectionRequest);
          setSuccessMessage("Collection created successfully!");
        }
      }

      // Success - reload data and close modal
      await loadData();
      closeModal();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to save item");
      console.error("Error saving item:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (type: TabType, id: number) => {
    if (
      !confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)
    ) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      if (type === "products") {
        await deleteProduct(id);
        setSuccessMessage("Product deleted successfully!");
      } else if (type === "collections") {
        await deleteCollection(id);
        setSuccessMessage("Collection deleted successfully!");
      }

      // Success - reload data
      await loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to delete ${type.slice(0, -1)}`);
      console.error(`Error deleting ${type.slice(0, -1)}:`, err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
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
            <Package size={48} />
          </motion.div>
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
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "2rem",
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "16px",
              padding: "1.5rem 2rem",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Admin Dashboard
              </h1>
              <p
                style={{
                  fontSize: "1rem",
                  color: "#64748b",
                  margin: 0,
                }}
              >
                Welcome back, {user?.fullName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
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
                onClick={() => {
                  setActiveTab("products");
                  setError(null);
                  setSuccessMessage(null);
                }}
                style={{
                  padding: "12px 20px",
                  background:
                    activeTab === "products"
                      ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                      : "transparent",
                  color: activeTab === "products" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                <Package size={18} />
                Products ({products.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("collections");
                  setError(null);
                  setSuccessMessage(null);
                }}
                style={{
                  padding: "12px 20px",
                  background:
                    activeTab === "collections"
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "transparent",
                  color: activeTab === "collections" ? "white" : "#64748b",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                <Sparkles size={18} />
                Collections ({collections.length})
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                openModal(activeTab === "products" ? "product" : "collection")
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "12px 20px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              <Plus size={18} />
              Add {activeTab === "products" ? "Product" : "Collection"}
            </motion.button>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "2rem",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                textAlign: "center",
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                color: "#22c55e",
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "2rem",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                textAlign: "center",
              }}
            >
              {successMessage}
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeTab === "products" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {products.map((product) => {
                  const dimensions = getParsedDimensions(product);
                  const collection = collections.find(
                    (c) => c.id === product.collectionId
                  );

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "16px",
                        padding: "1.5rem",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "1rem",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize: "1.125rem",
                              fontWeight: "600",
                              color: "#1e293b",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            {product.title}
                          </h3>
                          <p
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: "700",
                              color: "#3b82f6",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            {formatPrice(product.price)}
                          </p>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              color: "#64748b",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            Collection: {collection?.name || "Unknown"}
                          </p>
                          {dimensions && (
                            <p
                              style={{
                                fontSize: "0.8rem",
                                color: "#94a3b8",
                                margin: 0,
                              }}
                            >
                              {dimensions.width}cm × {dimensions.height}cm
                              {dimensions.depth
                                ? ` × ${dimensions.depth}cm`
                                : ""}
                            </p>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => openModal("product", product)}
                            style={{
                              padding: "0.5rem",
                              background: "rgba(59, 130, 246, 0.1)",
                              color: "#3b82f6",
                              border: "1px solid rgba(59, 130, 246, 0.2)",
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete("products", product.id)}
                            style={{
                              padding: "0.5rem",
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {product.image && (
                        <div
                          style={{
                            height: "120px",
                            borderRadius: "12px",
                            background: `url(${product.image}) center/cover`,
                            marginBottom: "1rem",
                          }}
                        />
                      )}

                      {product.description && (
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "#64748b",
                            lineHeight: "1.5",
                            margin: 0,
                          }}
                        >
                          {product.description}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {collections.map((collection) => {
                  const images = getParsedImages(collection);
                  const productCount = products.filter(
                    (p) => p.collectionId === collection.id
                  ).length;

                  return (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "16px",
                        padding: "1.5rem",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "1rem",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize: "1.125rem",
                              fontWeight: "600",
                              color: "#1e293b",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            {collection.name}
                          </h3>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              color: "#64748b",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            {productCount} products • {images.length} images
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => openModal("collection", collection)}
                            style={{
                              padding: "0.5rem",
                              background: "rgba(16, 185, 129, 0.1)",
                              color: "#10b981",
                              border: "1px solid rgba(16, 185, 129, 0.2)",
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete("collections", collection.id)
                            }
                            style={{
                              padding: "0.5rem",
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "#ef4444",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {images.length > 0 && (
                        <div
                          style={{
                            height: "120px",
                            borderRadius: "12px",
                            background: `url(${images[0]}) center/cover`,
                            marginBottom: "1rem",
                          }}
                        />
                      )}

                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#64748b",
                          lineHeight: "1.5",
                          margin: 0,
                        }}
                      >
                        {collection.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "2rem",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                {editingItem ? "Edit" : "Add"}{" "}
                {modalType === "product" ? "Product" : "Collection"}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  color: "#64748b",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {modalType === "product" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={productForm.title}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                    placeholder="Enter product title"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      resize: "vertical",
                    }}
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Product Image
                  </label>
                  <ImageUpload
                    value={productForm.image}
                    onChange={(url) =>
                      setProductForm((prev) => ({
                        ...prev,
                        image: url,
                      }))
                    }
                    onFileUpload={uploadFile}
                    placeholder="Drop product image here or click to browse"
                    maxSize={5}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price === 0 ? "" : productForm.price}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                      }}
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                      }}
                    >
                      Collection
                    </label>
                    <select
                      value={productForm.collectionId}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          collectionId: parseInt(e.target.value),
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Dimensions (cm)
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="number"
                      step="0.1"
                      value={
                        productForm.dimensions.width === 0
                          ? ""
                          : productForm.dimensions.width
                      }
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            width: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      style={{
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                      }}
                      placeholder="Width (cm)"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={
                        productForm.dimensions.height === 0
                          ? ""
                          : productForm.dimensions.height
                      }
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            height: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      style={{
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                      }}
                      placeholder="Height (cm)"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={
                        productForm.dimensions.depth === 0
                          ? ""
                          : productForm.dimensions.depth
                      }
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          dimensions: {
                            ...prev.dimensions,
                            depth: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                      style={{
                        padding: "0.75rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                      }}
                      placeholder="Depth (cm)"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Collection Name
                  </label>
                  <input
                    type="text"
                    value={collectionForm.name}
                    onChange={(e) =>
                      setCollectionForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                    placeholder="Enter collection name"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={collectionForm.description}
                    onChange={(e) =>
                      setCollectionForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      resize: "vertical",
                    }}
                    placeholder="Enter collection description"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Collection Images
                  </label>
                  <MultipleImageUpload
                    values={collectionForm.images}
                    onChange={(urls) =>
                      setCollectionForm((prev) => ({
                        ...prev,
                        images: urls,
                      }))
                    }
                    onFileUpload={uploadFile}
                    placeholder="Drop collection images here or click to browse"
                    maxSize={5}
                    maxImages={10}
                  />
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "2rem",
                paddingTop: "1rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "rgba(107, 114, 128, 0.1)",
                  color: "#6b7280",
                  border: "1px solid rgba(107, 114, 128, 0.2)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={modalLoading}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: modalLoading
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: modalLoading ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {modalLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Save size={16} />
                  </motion.div>
                ) : (
                  <Save size={16} />
                )}
                {modalLoading ? "Saving..." : "Save"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
