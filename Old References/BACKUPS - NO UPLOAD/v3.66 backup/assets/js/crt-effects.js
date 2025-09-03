(function() {
  "use strict";
  
  let performanceMode = false;
  let animationFrameId = null;
  
  function shouldRun() {
    return document.documentElement.dataset.motion !== "paused" && 
           !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  function checkPerformanceMode() {
    performanceMode = document.documentElement.classList.contains('perf-reduce');
  }

  function briefPhosphorGlow() {
    const elements = document.querySelectorAll('#glitch-title .tg-letter, #nav-list a');
    
    function triggerGlow() {
      if (!shouldRun()) {
        setTimeout(triggerGlow, performanceMode ? 90000 : 45000);
        return;
      }
      
      checkPerformanceMode();
      
      // Reduced frequency in performance mode
      const chance = performanceMode ? 0.001 : 0.003;
      
      if (Math.random() < chance) {
        const target = elements[Math.floor(Math.random() * elements.length)];
        target.classList.add('phosphor-glow');
        
        setTimeout(() => {
          target.classList.remove('phosphor-glow');
        }, performanceMode ? 150 : 300);
      }
      
      // Longer intervals in performance mode
      const baseInterval = performanceMode ? 90000 : 45000;
      const randomInterval = performanceMode ? 60000 : 75000;
      setTimeout(triggerGlow, baseInterval + Math.random() * randomInterval);
    }
    
    setTimeout(triggerGlow, 30000);
  }
  
  function vhsTrackingErrors() {
    const elements = document.querySelectorAll('header, nav, footer');
    const trackingLine = document.getElementById('vhsTracking');
    
    function triggerTracking() {
      if (!shouldRun()) {
        setTimeout(triggerTracking, 240000);
        return;
      }
      
      checkPerformanceMode();
      
      // Much rarer in performance mode
      const chance = performanceMode ? 0.0005 : 0.002;
      
      if (Math.random() < chance) {
        const target = elements[Math.floor(Math.random() * elements.length)];
        target.classList.add('horizontal-hold-error');
        
        setTimeout(() => {
          target.classList.remove('horizontal-hold-error');
        }, 800);
        
        // Tracking line only in normal mode
        if (!performanceMode && trackingLine && Math.random() < 0.3) {
          trackingLine.style.top = (Math.random() * 60 + 20) + '%';
          trackingLine.classList.add('active');
          
          setTimeout(() => {
            trackingLine.classList.remove('active');
          }, 150);
        }
      }
      
      // Much longer intervals
      const baseInterval = performanceMode ? 480000 : 240000; // 8-4 minutes
      setTimeout(triggerTracking, baseInterval + Math.random() * 360000);
    }
    
    setTimeout(triggerTracking, 120000);
  }
  
  function vhsDropouts() {
    const dropout = document.getElementById('vhsDropout');
    if (!dropout) return;
    
    function triggerDropout() {
      if (!shouldRun()) {
        setTimeout(triggerDropout, 600000);
        return;
      }
      
      checkPerformanceMode();
      
      // Skip dropouts in performance mode
      if (performanceMode) {
        setTimeout(triggerDropout, 600000);
        return;
      }
      
      if (Math.random() < 0.0002) { // Even rarer
        dropout.style.left = (Math.random() * 40 + 10) + '%';
        dropout.style.width = (Math.random() * 60 + 20) + '%';
        dropout.style.top = (Math.random() * 50 + 25) + '%';
        dropout.style.height = (Math.random() * 30 + 10) + '%';
        dropout.classList.add('active');
        
        setTimeout(() => {
          dropout.classList.remove('active');
        }, 200);
      }
      
      setTimeout(triggerDropout, 600000 + Math.random() * 600000); // 10-20 minutes
    }
    
    setTimeout(triggerDropout, 300000);
  }
  
  function subtleContinuousRetrace() {
    const retrace = document.getElementById('crtRetrace');
    if (!retrace) return;
    
    function triggerSubtleRetrace() {
      if (!shouldRun()) {
        setTimeout(triggerSubtleRetrace, 3000);
        return;
      }
      
      checkPerformanceMode();
      
      // Skip in performance mode
      if (performanceMode) {
        setTimeout(triggerSubtleRetrace, 6000);
        return;
      }
      
      // Increased chance for more frequent visible retraces
      if (Math.random() < 0.008) { // INCREASED from 0.002
        retrace.classList.remove('active');
        void retrace.offsetWidth;
        retrace.classList.add('active');
        console.log('Continuous retrace triggered');
      }
      
      // Check every 2-3 seconds instead of 2-4
      setTimeout(triggerSubtleRetrace, 2000 + Math.random() * 1000);
    }
    
    setTimeout(triggerSubtleRetrace, 5000); // Start after 5 seconds
  }
  
  function vhsHeadSwitchingNoise() {
    const headSwitch = document.getElementById('vhsHeadSwitch');
    if (!headSwitch) return;
    
    function triggerHeadSwitch() {
      if (!shouldRun()) {
        setTimeout(triggerHeadSwitch, 5000);
        return;
      }
      
      checkPerformanceMode();
      
      // Skip in performance mode
      if (performanceMode) {
        setTimeout(triggerHeadSwitch, 10000);
        return;
      }
      
      // Very rare head switching (0.05% chance)
      if (Math.random() < 0.0005) {
        headSwitch.style.top = (Math.random() * 80 + 10) + '%';
        headSwitch.classList.remove('active');
        void headSwitch.offsetWidth;
        headSwitch.classList.add('active');
      }
      
      // Check every 5-15 seconds
      setTimeout(triggerHeadSwitch, 5000 + Math.random() * 10000);
    }
    
    setTimeout(triggerHeadSwitch, 15000); // Start after 15 seconds
  }
  
  // Removed high-frequency animations that were causing performance issues
  // (vhsHeadSwitchingNoise, wowFlutterSimulation, interlacingArtifacts)
  
  function cleanup() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    if (!shouldRun()) return;
    
    setTimeout(() => {
      briefPhosphorGlow();
      vhsTrackingErrors();
      vhsDropouts();
      subtleContinuousRetrace();
      vhsHeadSwitchingNoise();
    }, 8000);
  });
  
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('pagehide', cleanup);
})();
