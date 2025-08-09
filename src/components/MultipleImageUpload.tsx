import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, AlertCircle, Plus } from "lucide-react";

interface MultipleImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  onFileUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // in MB
  maxImages?: number;
  className?: string;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  values,
  onChange,
  onFileUpload,
  placeholder = "Drop images here or click to browse",
  accept = "image/*",
  maxSize = 5, // 5MB default
  maxImages = 10,
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (files: File[]) => {
    if (values.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setError(null);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        continue;
      }

      setUploadingIndex(values.length + newUrls.length);

      try {
        if (onFileUpload) {
          // Use custom upload handler
          const url = await onFileUpload(file);
          newUrls.push(url);
        } else {
          // Create a local preview URL for demo purposes
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          newUrls.push(dataUrl);
        }
      } catch (err) {
        setError("Failed to upload image");
      }
    }

    setUploadingIndex(null);
    onChange([...values, ...newUrls]);
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

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length > 0) {
        handleFileUpload(files);
      }
    },
    [handleFileUpload, values]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (values.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
    setError(null);
  };

  const handleUrlChange = (index: number, url: string) => {
    const newValues = [...values];
    newValues[index] = url;
    onChange(newValues);
    setError(null);
  };

  const addUrlField = () => {
    if (values.length < maxImages) {
      onChange([...values, ""]);
    }
  };

  return (
    <div className={className}>
      {/* Drag and Drop Area */}
      <div
        style={{
          border: `2px dashed ${
            isDragging ? "#3b82f6" : error ? "#ef4444" : "#d1d5db"
          }`,
          borderRadius: "12px",
          padding: "2rem",
          background: isDragging
            ? "rgba(59, 130, 246, 0.05)"
            : "rgba(249, 250, 251, 0.5)",
          cursor: values.length >= maxImages ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          textAlign: "center",
          opacity: values.length >= maxImages ? 0.5 : 1,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
          disabled={values.length >= maxImages}
        />

        <motion.div
          animate={isDragging ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            color: isDragging ? "#3b82f6" : "#6b7280",
          }}
        >
          <ImageIcon size={48} />
          <div>
            <p
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "1rem",
                fontWeight: "500",
              }}
            >
              {values.length >= maxImages
                ? `Maximum ${maxImages} images reached`
                : placeholder}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "#9ca3af",
              }}
            >
              {values.length >= maxImages
                ? "Remove an image to add more"
                : `Supports: JPG, PNG, GIF (max ${maxSize}MB each) • ${values.length}/${maxImages} images`}
            </p>
          </div>
        </motion.div>
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

      {/* Image Grid */}
      {values.length > 0 && (
        <div
          style={{
            marginTop: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <AnimatePresence>
            {values.map((url, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  position: "relative",
                  background: "white",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  overflow: "hidden",
                }}
              >
                {/* Image Preview */}
                {url && (
                  <div
                    style={{
                      height: "120px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={() => {
                        // Handle broken image
                      }}
                    />

                    {/* Uploading Overlay */}
                    {uploadingIndex === index && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(0, 0, 0, 0.7)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Upload size={24} />
                        </motion.div>
                      </div>
                    )}

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemove(index)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(239, 68, 68, 0.9)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <X size={14} />
                    </motion.button>
                  </div>
                )}

                {/* URL Input */}
                <div style={{ padding: "0.75rem" }}>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add More Button */}
      {values.length < maxImages && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addUrlField}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: "rgba(59, 130, 246, 0.1)",
              color: "#3b82f6",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            <Plus size={16} />
            Add URL Field
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;
