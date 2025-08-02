import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  className,
  style,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    img.src = src;
  }, [src, onLoad, onError]);

  if (hasError) {
    return (
      <div
        className={`image-error ${className || ""}`}
        style={{
          ...style,
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        Image not available
      </div>
    );
  }

  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isLoaded ? 1 : 0,
        scale: isLoaded ? 1 : 0.95,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      loading="lazy"
    />
  );
};

export default ImageOptimizer;
