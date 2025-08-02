// Export all API services
export * from './authService';
export * from './collectionService';
export * from './productService';
export { default as api } from './api';

// Export types
export * from '../types/api';

// Re-export services as default objects for easier imports
export { AuthService } from './authService';
export { default as CollectionService } from './collectionService';
export { default as ProductService } from './productService';