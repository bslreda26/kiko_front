import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = title ? `${title}.jpg` : "image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Reset zoom and position when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: window.innerWidth <= 768 ? "1rem" : "2rem",
            overflow: "hidden",
          }}
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              position: "relative",
              maxWidth: window.innerWidth <= 768 ? "95vw" : "90vw",
              maxHeight: window.innerWidth <= 768 ? "95vh" : "90vh",
              width: window.innerWidth <= 768 ? "100%" : "auto",
              height: window.innerWidth <= 768 ? "100%" : "auto",
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: window.innerWidth <= 768 ? "8px" : "16px",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Control Buttons */}
            <div
              style={{
                position: "absolute",
                top: window.innerWidth <= 768 ? "8px" : "16px",
                right: window.innerWidth <= 768 ? "8px" : "16px",
                left: window.innerWidth <= 768 ? "8px" : "auto",
                display: "flex",
                gap: window.innerWidth <= 768 ? "8px" : "12px",
                zIndex: 10,
                alignItems: "center",
                justifyContent:
                  window.innerWidth <= 768 ? "space-between" : "flex-end",
                flexWrap: "wrap",
                maxWidth: "calc(100% - 32px)",
              }}
            >
              {/* Zoom Controls */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                style={{
                  padding: "12px",
                  background: "rgba(0, 0, 0, 0.75)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  cursor: zoom <= 0.5 ? "not-allowed" : "pointer",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: window.innerWidth <= 768 ? "48px" : "44px",
                  height: window.innerWidth <= 768 ? "48px" : "44px",
                  opacity: zoom <= 0.5 ? 0.5 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  touchAction: "manipulation",
                }}
              >
                <ZoomOut size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleZoomIn}
                disabled={zoom >= 5}
                style={{
                  padding: "12px",
                  background: "rgba(0, 0, 0, 0.75)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  cursor: zoom >= 5 ? "not-allowed" : "pointer",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: window.innerWidth <= 768 ? "48px" : "44px",
                  height: window.innerWidth <= 768 ? "48px" : "44px",
                  opacity: zoom >= 5 ? 0.5 : 1,
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  touchAction: "manipulation",
                }}
              >
                <ZoomIn size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRotate}
                style={{
                  padding: "12px",
                  background: "rgba(0, 0, 0, 0.75)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: window.innerWidth <= 768 ? "48px" : "44px",
                  height: window.innerWidth <= 768 ? "48px" : "44px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  touchAction: "manipulation",
                }}
              >
                <RotateCcw size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                style={{
                  padding: "12px",
                  background: "rgba(0, 0, 0, 0.75)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: window.innerWidth <= 768 ? "48px" : "44px",
                  height: window.innerWidth <= 768 ? "48px" : "44px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  touchAction: "manipulation",
                }}
              >
                <Download size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                style={{
                  padding: "12px",
                  background: "rgba(0, 0, 0, 0.75)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: window.innerWidth <= 768 ? "48px" : "44px",
                  height: window.innerWidth <= 768 ? "48px" : "44px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  fontSize: "16px",
                  fontWeight: "bold",
                  touchAction: "manipulation",
                }}
                title="Reset zoom and rotation"
              >
                ↺
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                style={{
                  padding: "12px",
                  background: "rgba(220, 38, 38, 0.85)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: window.innerWidth <= 768 ? "48px" : "44px",
                  height: window.innerWidth <= 768 ? "48px" : "44px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(220, 38, 38, 0.4)",
                  touchAction: "manipulation",
                }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Title */}
            {title && (
              <div
                style={{
                  padding:
                    window.innerWidth <= 768 ? "1rem 1.5rem" : "1.5rem 2rem",
                  background: "rgba(255, 255, 255, 0.95)",
                  width: "100%",
                  textAlign: "center",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: window.innerWidth <= 768 ? "60px" : "80px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: window.innerWidth <= 768 ? "1.1rem" : "1.25rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    lineHeight: "1.3",
                    marginBottom: "0.5rem",
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: window.innerWidth <= 768 ? "0.75rem" : "0.875rem",
                    color: "#64748b",
                    lineHeight: "1.4",
                    maxWidth: window.innerWidth <= 768 ? "280px" : "600px",
                  }}
                >
                  {window.innerWidth <= 768
                    ? `Zoom: ${Math.round(
                        zoom * 100
                      )}% • Pinch to zoom • Drag to pan`
                    : `Zoom: ${Math.round(
                        zoom * 100
                      )}% • Use mouse wheel to zoom • Drag to pan when zoomed`}
                </p>
              </div>
            )}

            {/* Image Container */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height:
                  window.innerWidth <= 768
                    ? "calc(95vh - 60px)"
                    : "calc(90vh - 80px)",
                overflow: "hidden",
                cursor:
                  zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onTouchStart={(e) => {
                if (e.touches.length === 2) {
                  // Handle pinch zoom
                  const touch1 = e.touches[0];
                  const touch2 = e.touches[1];
                  const distance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                      Math.pow(touch2.clientY - touch1.clientY, 2)
                  );
                  e.currentTarget.setAttribute(
                    "data-initial-distance",
                    distance.toString()
                  );
                } else if (zoom > 1) {
                  // Handle drag
                  const touch = e.touches[0];
                  setIsDragging(true);
                  setDragStart({
                    x: touch.clientX - position.x,
                    y: touch.clientY - position.y,
                  });
                }
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                if (e.touches.length === 2) {
                  // Handle pinch zoom
                  const touch1 = e.touches[0];
                  const touch2 = e.touches[1];
                  const distance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                      Math.pow(touch2.clientY - touch1.clientY, 2)
                  );
                  const initialDistance = parseFloat(
                    e.currentTarget.getAttribute("data-initial-distance") || "0"
                  );
                  if (initialDistance > 0) {
                    const scale = distance / initialDistance;
                    const newZoom = Math.max(0.5, Math.min(5, zoom * scale));
                    setZoom(newZoom);
                  }
                } else if (isDragging && zoom > 1) {
                  // Handle drag
                  const touch = e.touches[0];
                  setPosition({
                    x: touch.clientX - dragStart.x,
                    y: touch.clientY - dragStart.y,
                  });
                }
              }}
              onTouchEnd={(e) => {
                setIsDragging(false);
                e.currentTarget.removeAttribute("data-initial-distance");
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging ? "none" : "transform 0.1s ease",
                }}
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt={title || "Product image"}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    maxWidth: window.innerWidth <= 768 ? "85vw" : "80vw",
                    maxHeight: window.innerWidth <= 768 ? "85vh" : "80vh",
                    objectFit: "contain",
                    borderRadius: "8px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                    transition: isDragging ? "none" : "transform 0.2s ease",
                    userSelect: "none",
                  }}
                  draggable={false}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
