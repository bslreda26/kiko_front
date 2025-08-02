// Mock upload service for demonstration
// In a real application, you would upload to a service like AWS S3, Cloudinary, etc.

export interface UploadResponse {
  url: string;
  fileName: string;
  size: number;
}

export class UploadService {
  /**
   * Simulates uploading a file and returns a data URL
   * In production, this would upload to a cloud storage service
   */
  static async uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Simulate upload delay
        setTimeout(() => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            resolve(dataUrl);
          };
          reader.onerror = () => {
            reject(new Error("Failed to read file"));
          };
          reader.readAsDataURL(file);
        }, 1000 + Math.random() * 2000); // 1-3 seconds delay
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File, options: { 
    maxSize?: number; 
    allowedTypes?: string[] 
  } = {}): { isValid: boolean; error?: string } {
    const { maxSize = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    // Check file size (in MB)
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return {
        isValid: false,
        error: `File size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSize}MB)`
      };
    }

    return { isValid: true };
  }

  /**
   * Generate thumbnail from image file
   */
  static async generateThumbnail(file: File, maxWidth: number = 300, maxHeight: number = 300): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        // Set canvas size and draw image
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to data URL
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for thumbnail generation'));
      };

      // Create object URL for the image
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  }
}

// Export individual functions for easier imports
export const {
  uploadFile,
  uploadFiles,
  validateFile,
  generateThumbnail
} = UploadService;