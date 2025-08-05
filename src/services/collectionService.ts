import api from './api';
import type {
  Collection,
  CollectionWithProducts,
  CollectionStats,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  CollectionSearchParams,
  ApiError
} from '../types/api';

export class CollectionService {
  private static readonly BASE_PATH = '/api/collections';

  /**
   * Create a new collection
   */
  static async createCollection(data: CreateCollectionRequest): Promise<Collection> {
    try {
      const response = await api.post<Collection>(CollectionService.BASE_PATH, data);
      return response.data;
    } catch (error: any) {
      throw CollectionService.handleError(error);
    }
  }

  /**
   * Get all collections
   */
  static async getAllCollections(): Promise<Collection[]> {
    try {
      const response = await api.get<Collection[]>(CollectionService.BASE_PATH);
      console.log('API Response - Collections:', response.data);
      return response.data;
    } catch (error: any) {
      throw CollectionService.handleError(error);
    }
  }

  /**
   * Search collections by name
   */
  static async searchCollections(params: CollectionSearchParams): Promise<Collection[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.name) queryParams.append('name', params.name);

      const response = await api.get<Collection[]>(
        `${CollectionService.BASE_PATH}/search?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw CollectionService.handleError(error);
    }
  }

  /**
   * Get collections with their products
   */
  static async getCollectionsWithProducts(): Promise<CollectionWithProducts[]> {
    try {
      const response = await api.get<CollectionWithProducts[]>(
        `${CollectionService.BASE_PATH}/with-products`
      );
      return response.data;
    } catch (error: any) {
      throw CollectionService.handleError(error);
    }
  }

  /**
   * Get collection by ID
   */
  static async getCollectionById(id: number): Promise<Collection> {
    try {
      const response = await api.get<Collection>(`${CollectionService.BASE_PATH}/${id}`);
      return response.data;
    } catch (error: any) {
      throw CollectionService.handleError(error);
    }
  }

  /**
   * Get collection statistics
   */
  static async getCollectionStats(id: number): Promise<CollectionStats> {
    try {
      const response = await api.get<CollectionStats>(`${CollectionService.BASE_PATH}/${id}/stats`);
      return response.data;
    } catch (error: any) {
      throw CollectionService.handleError(error);
    }
  }

  /**
   * Update collection
   */
  static async updateCollection(id: number, data: UpdateCollectionRequest): Promise<Collection> {
    try {
      const response = await api.put<Collection>(`${CollectionService.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw CollectionService.handleError(error);
    }
  }

  /**
   * Delete collection
   */
  static async deleteCollection(id: number): Promise<void> {
    try {
      await api.delete(`${CollectionService.BASE_PATH}/${id}`);
    } catch (error: any) {
      throw CollectionService.handleError(error);
    }
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
export default CollectionService;

// Export individual functions for easier imports
export const createCollection = CollectionService.createCollection;
export const getAllCollections = CollectionService.getAllCollections;
export const searchCollections = CollectionService.searchCollections;
export const getCollectionsWithProducts = CollectionService.getCollectionsWithProducts;
export const getCollectionById = CollectionService.getCollectionById;
export const getCollectionStats = CollectionService.getCollectionStats;
export const updateCollection = CollectionService.updateCollection;
export const deleteCollection = CollectionService.deleteCollection;