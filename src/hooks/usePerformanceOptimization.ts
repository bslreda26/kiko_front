import { useEffect, useRef, useState } from 'react';

export const usePerformanceOptimization = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleReducedMotion = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleReducedMotion);

    // Performance monitoring
    const checkPerformance = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime.current;
      
      if (deltaTime > 0) {
        const fps = 1000 / deltaTime;
        
        if (fps < 30) {
          setIsLowPerformance(true);
        } else if (fps > 50) {
          setIsLowPerformance(false);
        }
      }
      
      lastTime.current = currentTime;
      frameCount.current++;
      
      requestAnimationFrame(checkPerformance);
    };

    requestAnimationFrame(checkPerformance);

    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotion);
    };
  }, []);

  const getOptimizedTransition = (defaultDuration: number, defaultDelay: number = 0) => {
    if (isReducedMotion) {
      return { duration: 0.1, delay: 0 };
    }
    if (isLowPerformance) {
      return { duration: defaultDuration * 1.5, delay: defaultDelay * 1.2 };
    }
    return { duration: defaultDuration, delay: defaultDelay };
  };

  const shouldReduceAnimations = () => {
    return isReducedMotion || isLowPerformance;
  };

  return {
    isLowPerformance,
    isReducedMotion,
    getOptimizedTransition,
    shouldReduceAnimations
  };
}; 