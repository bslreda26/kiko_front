import React, { useState, useEffect } from "react";
import { getProductByCriteriaPaged } from "../services/productService";
import type { Product, PaginatedResponse, ApiError } from "../types/api";

const PagedProductsExample: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    PaginatedResponse<Product>["pagination"] | null
  >(null);

  const loadProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const result: PaginatedResponse<Product> =
        await getProductByCriteriaPaged({
          page,
          limit: 6, // Show 6 products per page
        });

      setProducts(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    loadProducts(newPage);
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        <div>Error: {error}</div>
        <button onClick={() => loadProducts(1)}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Paged Products Example</h2>

      {/* Products Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "1rem",
              background: "white",
            }}
          >
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <p>
              <strong>Price:</strong> ${product.price}
            </p>
            <p>
              <strong>Collection ID:</strong> {product.collectionId}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination Info */}
      {pagination && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <p>
            Page {pagination.page} of {pagination.totalPages}({pagination.total}{" "}
            total products)
          </p>
          <p>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} products
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
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={pagination.page <= 1}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              background: pagination.page > 1 ? "white" : "#f1f5f9",
              cursor: pagination.page > 1 ? "pointer" : "not-allowed",
              opacity: pagination.page > 1 ? 1 : 0.5,
            }}
          >
            Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  padding: "0.5rem 1rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  background: page === currentPage ? "#3b82f6" : "white",
                  color: page === currentPage ? "white" : "black",
                  cursor: "pointer",
                }}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={pagination.page >= pagination.totalPages}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              background:
                pagination.page < pagination.totalPages ? "white" : "#f1f5f9",
              cursor:
                pagination.page < pagination.totalPages
                  ? "pointer"
                  : "not-allowed",
              opacity: pagination.page < pagination.totalPages ? 1 : 0.5,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PagedProductsExample;
