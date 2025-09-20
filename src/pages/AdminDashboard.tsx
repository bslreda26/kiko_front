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
  createProduct,
  updateProduct,
  deleteProduct,
  ProductService,
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
  PaginatedResponse,
} from "../types/api";
import { getParsedDimensions } from "../types/api";
import ImageUpload from "../components/ImageUpload";
import { uploadFile } from "../services/uploadService";
import LogoSpinner from "../components/LogoSpinner";

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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [pagination, setPagination] = useState<
    PaginatedResponse<Product>["pagination"] | null
  >(null);

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
    price: 1, // Default to Available (1)
    dimensions: { width: 0, height: 0, depth: 0 },
    collectionId: 0,
  });

  const [collectionForm, setCollectionForm] = useState<CollectionForm>({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  // Ensure form is properly initialized when modal opens
  useEffect(() => {
    if (modalType === "product" && !editingItem) {
      // Force re-initialization for new products
      setTimeout(() => {
        setProductForm((prev) => ({
          ...prev,
          price: 1,
        }));
      }, 0);
    }
  }, [modalType, editingItem]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, collectionsData] = await Promise.all([
        ProductService.getProductByCriteriaPaged({ page: 1, limit: 6 }),
        getAllCollections(),
      ]);

      setProducts(productsData.data);
      setPagination(productsData.pagination);
      setCurrentPage(1);
      setCollections(collectionsData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (page: number = 1) => {
    try {
      setPaginationLoading(true);
      setError(null);

      const result: PaginatedResponse<Product> =
        await ProductService.getProductByCriteriaPaged({
          page,
          limit: 6,
        });

      setProducts(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load products");
    } finally {
      setPaginationLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (paginationLoading) return;
    loadProducts(newPage);
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
        console.log("Product from API:", product);
        console.log(
          "Product image from API:",
          product.image,
          "Type:",
          typeof product.image
        );
        const dimensions = getParsedDimensions(product);
        setProductForm({
          title: product.title,
          description: product.description,
          image: product.image || "", // Ensure image is always a string
          price: Number(product.price), // Ensure it's a number
          dimensions: {
            width: dimensions?.width || 0,
            height: dimensions?.height || 0,
            depth: dimensions?.depth || 0,
          },
          collectionId: product.collectionId,
        });
      } else {
        // Force a fresh form state for new products
        setProductForm({
          title: "",
          description: "",
          image: "",
          price: 1, // Default to Available (1)
          dimensions: { width: 0, height: 0, depth: 0 },
          collectionId: collections[0]?.id || 0,
        });
      }
    } else if (type === "collection") {
      if (item) {
        const collection = item as Collection;
        setCollectionForm({
          name: collection.name,
          description: collection.description,
        });
      } else {
        setCollectionForm({
          name: "",
          description: "",
        });
      }
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
    // Reset form states
    setProductForm({
      title: "",
      description: "",
      image: "",
      price: 1,
      dimensions: { width: 0, height: 0, depth: 0 },
      collectionId: collections[0]?.id || 0,
    });
    setCollectionForm({
      name: "",
      description: "",
    });
  };

  const validateProductForm = (
    productForm: ProductForm,
    isEditing: boolean = false
  ): string | null => {
    if (!productForm.title?.trim()) return "Product title is required";
    if (!productForm.description?.trim())
      return "Product description is required";

    // Image URL is only required for new products, not for updates
    if (
      !isEditing &&
      (!productForm.image ||
        typeof productForm.image !== "string" ||
        !productForm.image.trim())
    ) {
      return "Product image URL is required";
    }

    if (productForm.price < 0 || productForm.price > 1)
      return "Availability must be selected (Available or Sold Out)";
    if (productForm.collectionId <= 0) return "Please select a collection";
    if (
      productForm.dimensions.width <= 0 ||
      productForm.dimensions.height <= 0 ||
      productForm.dimensions.depth <= 0
    ) {
      return "All dimensions must be greater than 0";
    }
    return null;
  };

  const validateCollectionForm = (): string | null => {
    if (!collectionForm.name.trim()) return "Collection name is required";
    if (!collectionForm.description.trim())
      return "Collection description is required";
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
        validationError = validateProductForm(productForm, !!editingItem);
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
        console.log(
          "Product form image value:",
          productForm.image,
          "Type:",
          typeof productForm.image
        );
        // For updates, only include fields that have been changed
        const productData: any = {
          title: productForm.title.trim(),
          description: productForm.description.trim(),
          price: Number(productForm.price), // Ensure it's a number
          dimensions: JSON.stringify({
            width: Number(productForm.dimensions.width),
            height: Number(productForm.dimensions.height),
            depth: Number(productForm.dimensions.depth),
          }),
          collectionId: productForm.collectionId,
        };

        // Only include image if it's provided (for new products) or changed (for updates)
        if (
          productForm.image &&
          typeof productForm.image === "string" &&
          productForm.image.trim()
        ) {
          productData.image = productForm.image.trim();
        }

        if (editingItem) {
          // Update existing product
          console.log("Updating product with data:", productData);
          await updateProduct(
            (editingItem as Product).id,
            productData as UpdateProductRequest
          );
          setSuccessMessage("Product updated successfully!");
        } else {
          // Create new product
          console.log("Creating product with data:", productData);
          await createProduct(productData as CreateProductRequest);
          setSuccessMessage("Product created successfully!");
        }
      } else if (modalType === "collection") {
        // Prepare collection data
        const collectionData = {
          name: collectionForm.name.trim(),
          description: collectionForm.description.trim(),
          images: JSON.stringify([]),
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
      if (modalType === "product") {
        await loadProducts(currentPage);
      } else {
        await loadData();
      }
      closeModal();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to save item");
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
      if (type === "products") {
        await loadProducts(currentPage);
      } else {
        await loadData();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to delete ${type.slice(0, -1)}`);
    }
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
          <LogoSpinner 
            size={48} 
            text="Loading Dashboard..." 
          />
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
            padding: window.innerWidth <= 768 ? "1rem" : "2rem",
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              flexDirection: window.innerWidth <= 768 ? "column" : "row",
              justifyContent: "space-between",
              alignItems: window.innerWidth <= 768 ? "flex-start" : "center",
              gap: window.innerWidth <= 768 ? "1rem" : "0",
              marginBottom: "2rem",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: window.innerWidth <= 768 ? "12px" : "16px",
              padding: window.innerWidth <= 768 ? "1rem" : "1.5rem 2rem",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: window.innerWidth <= 768 ? "1.5rem" : "2rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Admin Dashboard
              </h1>
              <p
                style={{
                  fontSize: window.innerWidth <= 768 ? "0.9rem" : "1rem",
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
                padding:
                  window.innerWidth <= 768 ? "0.5rem 0.75rem" : "0.75rem 1rem",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: window.innerWidth <= 768 ? "0.8rem" : "0.9rem",
                fontWeight: "500",
                transition: "all 0.3s ease",
                alignSelf: window.innerWidth <= 768 ? "flex-end" : "auto",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              }}
            >
              <LogOut size={window.innerWidth <= 768 ? 14 : 16} />
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
              flexDirection: window.innerWidth <= 768 ? "column" : "row",
              justifyContent: "space-between",
              alignItems: window.innerWidth <= 768 ? "stretch" : "center",
              gap: window.innerWidth <= 768 ? "1rem" : "0",
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
                flex: window.innerWidth <= 768 ? "1" : "auto",
              }}
            >
              <button
                onClick={() => {
                  setActiveTab("products");
                  setError(null);
                  setSuccessMessage(null);
                }}
                style={{
                  padding: window.innerWidth <= 768 ? "10px 16px" : "12px 20px",
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
                  gap: window.innerWidth <= 768 ? "0.25rem" : "0.5rem",
                  fontSize: window.innerWidth <= 768 ? "0.8rem" : "0.9rem",
                  fontWeight: "500",
                  flex: "1",
                }}
              >
                <Package size={window.innerWidth <= 768 ? 16 : 18} />
                <span style={{ whiteSpace: "nowrap" }}>
                  Products ({products.length})
                </span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("collections");
                  setError(null);
                  setSuccessMessage(null);
                }}
                style={{
                  padding: window.innerWidth <= 768 ? "10px 16px" : "12px 20px",
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
                  gap: window.innerWidth <= 768 ? "0.25rem" : "0.5rem",
                  fontSize: window.innerWidth <= 768 ? "0.8rem" : "0.9rem",
                  fontWeight: "500",
                  flex: "1",
                }}
              >
                <Sparkles size={window.innerWidth <= 768 ? 16 : 18} />
                <span style={{ whiteSpace: "nowrap" }}>
                  Collections ({collections.length})
                </span>
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
                justifyContent: "center",
                gap: "0.5rem",
                padding: window.innerWidth <= 768 ? "12px 16px" : "12px 20px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: window.innerWidth <= 768 ? "0.85rem" : "0.9rem",
                fontWeight: "600",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                width: window.innerWidth <= 768 ? "100%" : "auto",
              }}
            >
              <Plus size={window.innerWidth <= 768 ? 16 : 18} />
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
                  gridTemplateColumns:
                    window.innerWidth <= 768
                      ? "1fr"
                      : window.innerWidth <= 1024
                      ? "repeat(auto-fill, minmax(300px, 1fr))"
                      : "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: window.innerWidth <= 768 ? "1rem" : "1.5rem",
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
                        borderRadius:
                          window.innerWidth <= 768 ? "12px" : "16px",
                        padding: window.innerWidth <= 768 ? "1rem" : "1.5rem",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection:
                            window.innerWidth <= 768 ? "column" : "row",
                          justifyContent: "space-between",
                          alignItems:
                            window.innerWidth <= 768
                              ? "flex-start"
                              : "flex-start",
                          gap: window.innerWidth <= 768 ? "1rem" : "0",
                          marginBottom: "1rem",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize:
                                window.innerWidth <= 768 ? "1rem" : "1.125rem",
                              fontWeight: "600",
                              color: "#1e293b",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            {product.title}
                          </h3>
                          <p
                            style={{
                              fontSize:
                                window.innerWidth <= 768 ? "0.9rem" : "1rem",
                              fontWeight: "600",
                              color: product.price > 0 ? "#22c55e" : "#ef4444",
                              margin: "0 0 0.5rem 0",
                              padding:
                                window.innerWidth <= 768
                                  ? "3px 8px"
                                  : "4px 12px",
                              background:
                                product.price > 0
                                  ? "rgba(34, 197, 94, 0.1)"
                                  : "rgba(239, 68, 68, 0.1)",
                              borderRadius: "20px",
                              display: "inline-block",
                            }}
                          >
                            {product.price > 0 ? "Available" : "Sold Out"}
                          </p>
                          <p
                            style={{
                              fontSize:
                                window.innerWidth <= 768
                                  ? "0.8rem"
                                  : "0.875rem",
                              color: "#64748b",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            Collection: {collection?.name || "Unknown"}
                          </p>
                          {dimensions && (
                            <p
                              style={{
                                fontSize:
                                  window.innerWidth <= 768
                                    ? "0.75rem"
                                    : "0.8rem",
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
                        <div
                          style={{
                            display: "flex",
                            gap:
                              window.innerWidth <= 768 ? "0.25rem" : "0.5rem",
                            alignSelf:
                              window.innerWidth <= 768 ? "flex-end" : "auto",
                          }}
                        >
                          <button
                            onClick={() => openModal("product", product)}
                            style={{
                              padding:
                                window.innerWidth <= 768 ? "0.4rem" : "0.5rem",
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

                {/* Pagination Info */}
                {pagination && (
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: "1rem",
                      marginTop: "2rem",
                    }}
                  >
                    <p style={{ color: "#64748b", margin: "0 0 0.5rem 0" }}>
                      Page {pagination.page} of {pagination.totalPages} (
                      {pagination.total} total products)
                    </p>
                    <p
                      style={{
                        color: "#64748b",
                        margin: 0,
                        fontSize: "0.875rem",
                      }}
                    >
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      of {pagination.total} products
                    </p>
                  </div>
                )}

                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "0.5rem",
                      marginTop: "1rem",
                      marginBottom: "2rem",
                    }}
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={pagination.page <= 1 || paginationLoading}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        background:
                          pagination.page > 1 && !paginationLoading
                            ? "white"
                            : "#f1f5f9",
                        cursor:
                          pagination.page > 1 && !paginationLoading
                            ? "pointer"
                            : "not-allowed",
                        opacity:
                          pagination.page > 1 && !paginationLoading ? 1 : 0.5,
                        color: "#64748b",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={paginationLoading}
                        style={{
                          padding: "0.5rem 1rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          background:
                            page === currentPage ? "#3b82f6" : "white",
                          color: page === currentPage ? "white" : "#64748b",
                          cursor: paginationLoading ? "not-allowed" : "pointer",
                          fontWeight: "500",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        pagination.page >= pagination.totalPages ||
                        paginationLoading
                      }
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        background:
                          pagination.page < pagination.totalPages &&
                          !paginationLoading
                            ? "white"
                            : "#f1f5f9",
                        cursor:
                          pagination.page < pagination.totalPages &&
                          !paginationLoading
                            ? "pointer"
                            : "not-allowed",
                        opacity:
                          pagination.page < pagination.totalPages &&
                          !paginationLoading
                            ? 1
                            : 0.5,
                        color: "#64748b",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Loading Overlay */}
                {paginationLoading && (
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1000,
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        padding: "2rem",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      <p style={{ margin: 0, color: "#64748b" }}>
                        Loading products...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    window.innerWidth <= 768
                      ? "1fr"
                      : window.innerWidth <= 1024
                      ? "repeat(auto-fill, minmax(300px, 1fr))"
                      : "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: window.innerWidth <= 768 ? "1rem" : "1.5rem",
                }}
              >
                {collections.map((collection) => {
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
                        borderRadius:
                          window.innerWidth <= 768 ? "12px" : "16px",
                        padding: window.innerWidth <= 768 ? "1rem" : "1.5rem",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection:
                            window.innerWidth <= 768 ? "column" : "row",
                          justifyContent: "space-between",
                          alignItems:
                            window.innerWidth <= 768
                              ? "flex-start"
                              : "flex-start",
                          gap: window.innerWidth <= 768 ? "1rem" : "0",
                          marginBottom: "1rem",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize:
                                window.innerWidth <= 768 ? "1rem" : "1.125rem",
                              fontWeight: "600",
                              color: "#1e293b",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            {collection.name}
                          </h3>
                          <p
                            style={{
                              fontSize:
                                window.innerWidth <= 768
                                  ? "0.8rem"
                                  : "0.875rem",
                              color: "#64748b",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            {productCount} products
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap:
                              window.innerWidth <= 768 ? "0.25rem" : "0.5rem",
                            alignSelf:
                              window.innerWidth <= 768 ? "flex-end" : "auto",
                          }}
                        >
                          <button
                            onClick={() => openModal("collection", collection)}
                            style={{
                              padding:
                                window.innerWidth <= 768 ? "0.4rem" : "0.5rem",
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
            padding: window.innerWidth <= 768 ? "0.5rem" : "1rem",
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
              borderRadius: window.innerWidth <= 768 ? "16px" : "20px",
              padding: window.innerWidth <= 768 ? "1rem" : "2rem",
              width: "100%",
              maxWidth: window.innerWidth <= 768 ? "100%" : "600px",
              maxHeight: window.innerWidth <= 768 ? "90vh" : "80vh",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: window.innerWidth <= 768 ? "1.5rem" : "2rem",
              }}
            >
              <h2
                style={{
                  fontSize: window.innerWidth <= 768 ? "1.25rem" : "1.5rem",
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
                  padding: window.innerWidth <= 768 ? "0.4rem" : "0.5rem",
                  color: "#64748b",
                }}
              >
                <X size={window.innerWidth <= 768 ? 20 : 24} />
              </button>
            </div>

            {modalType === "product" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: window.innerWidth <= 768 ? "1rem" : "1.5rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      fontSize: window.innerWidth <= 768 ? "0.9rem" : "1rem",
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
                      padding: window.innerWidth <= 768 ? "0.6rem" : "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: window.innerWidth <= 768 ? "0.85rem" : "0.9rem",
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
                      fontSize: window.innerWidth <= 768 ? "0.9rem" : "1rem",
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
                    rows={window.innerWidth <= 768 ? 2 : 3}
                    style={{
                      width: "100%",
                      padding: window.innerWidth <= 768 ? "0.6rem" : "0.75rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: window.innerWidth <= 768 ? "0.85rem" : "0.9rem",
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
                    onChange={(url) => {
                      setProductForm((prev) => ({
                        ...prev,
                        image: url,
                      }));
                    }}
                    onFileUpload={uploadFile}
                    placeholder="Drop product image here or click to browse"
                    maxSize={5}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      window.innerWidth <= 768 ? "1fr" : "1fr 1fr",
                    gap: window.innerWidth <= 768 ? "0.75rem" : "1rem",
                  }}
                >
                  <div>
                    <label
                      htmlFor="price"
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                        color: "#374151",
                        fontSize: "0.9rem",
                      }}
                    >
                      Availability
                    </label>
                    <select
                      key={`price-select-${productForm.price}`}
                      value={productForm.price}
                      onChange={(e) => {
                        const newPrice = Number(e.target.value);
                        setProductForm((prev) => ({
                          ...prev,
                          price: newPrice,
                        }));
                      }}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <option value={1}>Available</option>
                      <option value={0}>Sold Out</option>
                    </select>
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
                      gridTemplateColumns:
                        window.innerWidth <= 768 ? "1fr 1fr" : "1fr 1fr 1fr",
                      gap: window.innerWidth <= 768 ? "0.4rem" : "0.5rem",
                    }}
                  >
                    <input
                      type="number"
                      step="0.1"
                      value={productForm.dimensions.width || ""}
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
                      value={productForm.dimensions.height || ""}
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
                      value={productForm.dimensions.depth || ""}
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
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: window.innerWidth <= 768 ? "column" : "row",
                justifyContent: "flex-end",
                gap: window.innerWidth <= 768 ? "0.75rem" : "1rem",
                marginTop: window.innerWidth <= 768 ? "1.5rem" : "2rem",
                paddingTop: "1rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  padding:
                    window.innerWidth <= 768 ? "0.6rem 1rem" : "0.75rem 1.5rem",
                  background: "rgba(107, 114, 128, 0.1)",
                  color: "#6b7280",
                  border: "1px solid rgba(107, 114, 128, 0.2)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: window.innerWidth <= 768 ? "0.85rem" : "0.9rem",
                  fontWeight: "500",
                  width: window.innerWidth <= 768 ? "100%" : "auto",
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
                  padding:
                    window.innerWidth <= 768 ? "0.6rem 1rem" : "0.75rem 1.5rem",
                  background: modalLoading
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: modalLoading ? "not-allowed" : "pointer",
                  fontSize: window.innerWidth <= 768 ? "0.85rem" : "0.9rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  width: window.innerWidth <= 768 ? "100%" : "auto",
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
