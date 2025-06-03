import { useRef, useEffect } from 'react';

/**
 * Custom hook for tooltip positioning that ensures tooltips remain within the viewport
 * 
 * @param isVisible - Whether the tooltip is currently visible
 * @param dependencies - Additional dependencies to trigger repositioning
 * @returns React ref to attach to the tooltip element
 */
export const useTooltipPosition = (isVisible: boolean, dependencies: React.DependencyList = []) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isVisible || !tooltipRef.current) return;
    
    const handlePosition = () => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Ensure tooltip stays within viewport bounds
      if (tooltipRect.left < 0) {
        tooltip.style.left = '0px';
        tooltip.style.right = 'auto';
      } else if (tooltipRect.right > viewportWidth) {
        tooltip.style.left = 'auto';
        tooltip.style.right = '0px';
      }
      
      // Ensure tooltip doesn't go above viewport
      if (tooltipRect.top < 0) {
        tooltip.style.top = '100%';
        tooltip.style.transform = 'translateY(10px)';
        // Move the arrow to the top
        const arrow = tooltip.querySelector('.tooltip-arrow') as HTMLElement;
        if (arrow) {
          arrow.style.top = '-8px';
          arrow.style.bottom = 'auto';
          arrow.style.transform = 'rotate(225deg)';
        }
      }
    };
    
    // Handle positioning when visibility changes
    handlePosition();
    
    // Handle positioning on resize
    window.addEventListener('resize', handlePosition);
    
    return () => {
      window.removeEventListener('resize', handlePosition);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, ...dependencies]);
  
  return tooltipRef;
}; 