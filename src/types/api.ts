// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// User Types
export interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Collection Types
export interface Collection {
  id: number;
  name: string;
  description: string;
  images: string; // JSON string array
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface CollectionWithProducts extends Collection {
  products: Product[];
}

export interface CollectionStats {
  id: number;
  name: string;
  productCount: number;
  totalValue: number;
  averagePrice: number;
}

export interface CreateCollectionRequest {
  name: string;
  description: string;
  images: string; // JSON string array like "[\"image1.jpg\", \"image2.jpg\"]"
}

export interface UpdateCollectionRequest extends Partial<CreateCollectionRequest> {}

// Product Types
export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  dimensions: string; // JSON string of ProductDimensions
  price: number; // Availability: 0 = not available, >0 = available
  collectionId: number;
  createdAt: string;
  updatedAt: string;
  collection?: Collection;
}

export interface ProductWithCollection extends Product {
  collection: Collection;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  image: string;
  dimensions: string; // JSON string like "{\"width\": 10, \"height\": 15, \"depth\": 5}"
  price: number; // Availability: 0 = not available, >0 = available
  collectionId: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// Search Types
export interface ProductSearchParams {
  collectionId?: number;
  title?: string;
}

export interface CollectionSearchParams {
  name?: string;
}



// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

// Error Types
export interface ApiError {
  message: string;
  error?: string;
  status?: number;
}

// Utility Types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper function to parse JSON strings safely
export const parseJsonString = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
};

// Helper function to get parsed dimensions
export const getParsedDimensions = (product: Product): ProductDimensions => {
  return parseJsonString(product.dimensions, { width: 0, height: 0, depth: 0 });
};

// Helper function to get parsed images array
export const getParsedImages = (collection: Collection): string[] => {
  return parseJsonString(collection.images, []);
};