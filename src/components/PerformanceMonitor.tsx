import React, { useEffect, useState } from "react";

interface PerformanceMetrics {
  fps: number;
  memoryUsage?: number;
  loadTime: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    loadTime: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.DEV) {
      setIsVisible(true);
    }

    // Measure page load time
    const loadTime = performance.now();
    setMetrics((prev) => ({ ...prev, loadTime }));

    // FPS monitoring
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      if (deltaTime > 0) {
        const fps = Math.round(1000 / deltaTime);
        setMetrics((prev) => ({ ...prev, fps }));
      }

      lastTime = currentTime;
      frameCount++;

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // Memory usage (if available)
    if ("memory" in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        }));
      };

      updateMemory();
      const memoryInterval = setInterval(updateMemory, 1000);

      return () => clearInterval(memoryInterval);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 10000,
        minWidth: "150px",
      }}
    >
      <div>FPS: {metrics.fps}</div>
      {metrics.memoryUsage && <div>Memory: {metrics.memoryUsage}MB</div>}
      <div>Load: {Math.round(metrics.loadTime)}ms</div>
    </div>
  );
};

export default PerformanceMonitor;
