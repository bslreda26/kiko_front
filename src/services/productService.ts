import api from './api';
import type {
  Product,
  ProductWithCollection,
  CreateProductRequest,
  UpdateProductRequest,
  ProductSearchParams,
  ApiError
} from '../types/api';

export class ProductService {
  private static readonly BASE_PATH = '/api/products';

  /**
   * Create a new product
   */
  static async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      const response = await api.post<Product>(ProductService.BASE_PATH, data);
      return response.data;
    } catch (error: any) {
      throw ProductService.handleError(error);
    }
  }

  /**
   * Get all products
   */
  static async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>(ProductService.BASE_PATH);
      return response.data;
    } catch (error: any) {
      throw ProductService.handleError(error);
    }
  }

  /**
   * Search products with multiple filters
   */
  static async searchProducts(params: ProductSearchParams): Promise<Product[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.collectionId !== undefined) {
        queryParams.append('collectionId', params.collectionId.toString());
      }
      if (params.title) {
        queryParams.append('title', params.title);
      }

      const response = await api.get<Product[]>(
        `${ProductService.BASE_PATH}/search?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw ProductService.handleError(error);
    }
  }



  /**
   * Get products by collection ID
   */
  static async getProductsByCollection(collectionId: number): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>(
        `${ProductService.BASE_PATH}/by-collection/${collectionId}`
      );
      return response.data;
    } catch (error: any) {
      throw ProductService.handleError(error);
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: number): Promise<ProductWithCollection> {
    try {
      const response = await api.get<ProductWithCollection>(`${ProductService.BASE_PATH}/${id}`);
      return response.data;
    } catch (error: any) {
      throw ProductService.handleError(error);
    }
  }

  /**
   * Update product
   */
  static async updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
    try {
      const response = await api.put<Product>(`${ProductService.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw ProductService.handleError(error);
    }
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: number): Promise<void> {
    try {
      await api.delete(`${ProductService.BASE_PATH}/${id}`);
    } catch (error: any) {
      throw ProductService.handleError(error);
    }
  }

  /**
   * Get featured products (you can customize this logic)
   */
  static async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    try {
      // This uses the general get all products endpoint
      // You might want to add a specific featured endpoint to your backend
      const products = await ProductService.getAllProducts();
      return products.slice(0, limit);
    } catch (error: any) {
      throw ProductService.handleError(error);
    }
  }

  /**
   * Get latest products (sorted by creation date descending)
   */
  static async getLatestProducts(limit: number = 6): Promise<Product[]> {
    try {
      const products = await ProductService.getAllProducts();
      // Sort by createdAt date in descending order (newest first)
      const sortedProducts = products.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      return sortedProducts.slice(0, limit);
    } catch (error: any) {
      throw ProductService.handleError(error);
    }
  }



  /**
   * Search products by title only (helper function)
   */
  static async searchProductsByTitle(title: string): Promise<Product[]> {
    return ProductService.searchProducts({ title });
  }

  /**
   * Handle API errors consistently
   */
  private static handleError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || 'An error occurred',
        error: error.response.data?.error || error.message,
        status: error.response.status
      };
    } else if (error.request) {
      return {
        message: 'Network error - please check your connection',
        error: 'Network error',
        status: 0
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        error: error.message,
        status: 0
      };
    }
  }
}

// Export the class as default
export default ProductService;

// Export individual functions for easier imports
export const createProduct = ProductService.createProduct;
export const getAllProducts = ProductService.getAllProducts;
export const searchProducts = ProductService.searchProducts;
export const getProductsByCollection = ProductService.getProductsByCollection;
export const getProductById = ProductService.getProductById;
export const updateProduct = ProductService.updateProduct;
export const deleteProduct = ProductService.deleteProduct;
export const getFeaturedProducts = ProductService.getFeaturedProducts;
export const getLatestProducts = ProductService.getLatestProducts;
export const searchProductsByTitle = ProductService.searchProductsByTitle;