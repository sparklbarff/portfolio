(function() {
  "use strict";
  
  function shouldRun() {
    return document.documentElement.dataset.motion !== "paused" && 
           !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function briefPhosphorGlow() {
    const elements = document.querySelectorAll('#glitch-title .tg-letter, #nav-list a');
    
    function triggerGlow() {
      if (!shouldRun()) {
        setTimeout(triggerGlow, 45000);
        return;
      }
      
      // Rare phosphor persistence (like real CRT)
      if (Math.random() < 0.003) { // 0.3% chance
        const target = elements[Math.floor(Math.random() * elements.length)];
        
        target.classList.add('phosphor-glow');
        
        // Brief glow duration (realistic)
        setTimeout(() => {
          target.classList.remove('phosphor-glow');
        }, 200 + Math.random() * 400);
      }
      
      // 45-120 second intervals
      setTimeout(triggerGlow, 45000 + Math.random() * 75000);
    }
    
    setTimeout(triggerGlow, 30000); // Start after 30 seconds
  }
  
  function vhsTrackingErrors() {
    const elements = document.querySelectorAll('header, nav, footer');
    const trackingLine = document.getElementById('vhsTracking');
    
    function triggerTracking() {
      if (!shouldRun()) {
        setTimeout(triggerTracking, 120000);
        return;
      }
      
      // Very rare VHS tracking issues
      if (Math.random() < 0.002) { // 0.2% chance
        // Brief horizontal displacement
        const target = elements[Math.floor(Math.random() * elements.length)];
        target.classList.add('horizontal-hold-error');
        
        setTimeout(() => {
          target.classList.remove('horizontal-hold-error');
        }, 800);
        
        // Occasionally show tracking line
        if (trackingLine && Math.random() < 0.3) {
          trackingLine.style.top = (Math.random() * 60 + 20) + '%';
          trackingLine.classList.add('active');
          
          setTimeout(() => {
            trackingLine.classList.remove('active');
          }, 150);
        }
      }
      
      // 2-8 minute intervals (realistic VHS behavior)
      setTimeout(triggerTracking, 120000 + Math.random() * 360000);
    }
    
    setTimeout(triggerTracking, 90000); // Start after 1.5 minutes
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    if (!shouldRun()) return;
    
    // Wait for everything to load
    setTimeout(() => {
      briefPhosphorGlow();
      vhsTrackingErrors();
    }, 8000);
  });
})();
