import api from './api';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiError
} from '../types/api';

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/login', credentials);
      return response.data;
    } catch (error: any) {
      throw AuthService.handleError(error);
    }
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/register', userData);
      return response.data;
    } catch (error: any) {
      throw AuthService.handleError(error);
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } catch (error: any) {
      throw AuthService.handleError(error);
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/me');
      return response.data;
    } catch (error: any) {
      throw AuthService.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static async checkAuth(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Test backend connection
   */
  static async testConnection(): Promise<{ hello: string }> {
    try {
      const response = await api.get<{ hello: string }>('/');
      return response.data;
    } catch (error: any) {
      throw AuthService.handleError(error);
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

// Export individual functions for easier imports
export const {
  login,
  register,
  logout,
  getCurrentUser,
  checkAuth,
  testConnection
} = AuthService;