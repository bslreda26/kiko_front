import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Check,
} from "lucide-react";
import LogoSpinner from "./LogoSpinner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onFileUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onFileUpload,
  placeholder = "Drop an image here or click to browse",
  accept = "image/*",
  maxSize = 5, // 5MB default
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes
  React.useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return "Please select an image file";
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      if (onFileUpload) {
        // Use custom upload handler
        const url = await onFileUpload(file);
        onChange(url);
        setPreview(url);
      } else {
        // Create a local preview URL for demo purposes
        // In a real app, you would upload to a service like AWS S3, Cloudinary, etc.
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onChange(dataUrl);
          setPreview(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange("");
    setPreview(null);
    setError(null);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    setPreview(url);
    setError(null);
  };

  return (
    <div className={className}>
      <div
        style={{
          position: "relative",
          border: `2px dashed ${
            isDragging
              ? "#3b82f6"
              : error
              ? "#ef4444"
              : preview
              ? "#10b981"
              : "#d1d5db"
          }`,
          borderRadius: "12px",
          padding: preview ? "0" : "2rem",
          background: isDragging
            ? "rgba(59, 130, 246, 0.05)"
            : preview
            ? "transparent"
            : "rgba(249, 250, 251, 0.5)",
          cursor: preview ? "default" : "pointer",
          transition: "all 0.3s ease",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!preview ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                color: "#3b82f6",
              }}
            >
              <LogoSpinner size={48} text="Uploading..." />
            </motion.div>
          ) : preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: "relative",
                width: "100%",
                height: "200px",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  display: "flex",
                  gap: "8px",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  style={{
                    background: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Upload size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  style={{
                    background: "rgba(239, 68, 68, 0.9)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </motion.button>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "8px",
                  background: "rgba(34, 197, 94, 0.9)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Check size={12} />
                Image loaded
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                color: isDragging ? "#3b82f6" : "#6b7280",
                textAlign: "center",
              }}
            >
              <motion.div
                animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                transition={{
                  duration: 0.5,
                  repeat: isDragging ? Infinity : 0,
                }}
              >
                <ImageIcon size={48} />
              </motion.div>
              <div>
                <p
                  style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "1rem",
                    fontWeight: "500",
                  }}
                >
                  {placeholder}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                  }}
                >
                  Supports: JPG, PNG, GIF (max {maxSize}MB)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "0.5rem",
            padding: "0.5rem",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            borderRadius: "8px",
            fontSize: "0.875rem",
          }}
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      {/* Alternative URL Input */}
      <div style={{ marginTop: "1rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "0.5rem",
          }}
        >
          Or enter image URL:
        </label>
        <input
          type="url"
          value={value}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "0.9rem",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e7eb";
          }}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
