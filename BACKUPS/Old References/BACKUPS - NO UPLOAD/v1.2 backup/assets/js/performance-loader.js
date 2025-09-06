/**
 * Performance Optimized Resource Loader
 * - Defers non-critical resources
 * - Optimizes background image loading
 */
(function() {
  "use strict";
  
  // Defer loading of non-critical scripts
  function loadDeferredScripts() {
    // Preload images for the gallery to improve UI response
    if (document.querySelector('.port')) {
      const BASE = './mybg/png'; // Updated to match directory structure in manifest
      const preloadCount = 3;
      
      for (let i = 1; i <= preloadCount; i++) {
        const img = new Image();
        img.src = `${BASE}/${i}.png`; // Updated format to match other files
      }
    }
  }
  
  // Optimize BG image loading
  function optimizeBgLoading() {
    const bgContainer = document.getElementById("bg-container");
    if (!bgContainer) return;
    
    // Use IntersectionObserver to ensure we only load when in viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.disconnect(); // Stop observing once visible
          
          // Wait for critical content before starting background rotation
          requestIdleCallback(() => {
            const event = new Event('bg:start');
            window.dispatchEvent(event);
          }, { timeout: 1000 });
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(bgContainer);
  }
  
  // Execute optimizations
  function init() {
    // Run immediately for visible content optimization
    optimizeBgLoading();
    
    // Defer non-critical scripts
    if (window.requestIdleCallback) {
      requestIdleCallback(loadDeferredScripts, { timeout: 2000 });
    } else {
      setTimeout(loadDeferredScripts, 1000);
    }
    
    // Add page lifecycle optimizations
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        document.body.classList.add('tab-hidden');
      } else {
        document.body.classList.remove('tab-hidden');
        // Reconnect animations that may have been stopped
      }
    });
  }
  
  // Start optimizations when DOM is ready
  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
