(function() {
  "use strict";
  
  function shouldRun() {
    return document.documentElement.dataset.motion !== "paused" && 
           !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function createRealisticNoise() {
    const noise = document.createElement('div');
    noise.className = 'vhs-tape-grain';
    noise.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 43;
      pointer-events: none;
      opacity: 0.012;
      mix-blend-mode: overlay;
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="grain"><feTurbulence baseFrequency="0.25" numOctaves="3" seed="5"/></filter><rect width="100%" height="100%" filter="url(%23grain)" opacity="0.15"/></svg>');
      background-size: 200px 200px;
      filter: url(#vhs-tracking-noise);
    `;
    document.body.appendChild(noise);
    
    let frame = 0;
    function updateGrain() {
      if (!shouldRun()) {
        requestAnimationFrame(updateGrain);
        return;
      }
      
      // Very slow grain movement (every 8 seconds)
      if (frame % 480 === 0) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        noise.style.backgroundPosition = `${x}% ${y}%`;
        noise.style.opacity = (0.008 + Math.random() * 0.008).toString();
      }
      
      frame = (frame + 1) % 28800; // 8 minute cycle
      requestAnimationFrame(updateGrain);
    }
    
    requestAnimationFrame(updateGrain);
  }
  
  function subtlePhosphorEffects() {
    const elements = document.querySelectorAll('#glitch-title .tg-letter, #nav-list a');
    
    function triggerPhosphorGlow() {
      if (!shouldRun()) {
        setTimeout(triggerPhosphorGlow, 25000);
        return;
      }
      
      // Very rare phosphor persistence
      if (Math.random() < 0.008) { // 0.8% chance
        const target = elements[Math.floor(Math.random() * elements.length)];
        
        target.classList.add('phosphor-glow');
        
        setTimeout(() => {
          target.classList.remove('phosphor-glow');
        }, 2000 + Math.random() * 3000);
      }
      
      // 25-80 second intervals
      setTimeout(triggerPhosphorGlow, 25000 + Math.random() * 55000);
    }
    
    setTimeout(triggerPhosphorGlow, 20000); // Start after 20 seconds
  }
  
  function occasionalTrackingErrors() {
    const elements = document.querySelectorAll('header, nav, footer');
    
    function triggerTracking() {
      if (!shouldRun()) {
        setTimeout(triggerTracking, 90000);
        return;
      }
      
      // Very rare VHS tracking errors
      if (Math.random() < 0.005) { // 0.5% chance
        const target = elements[Math.floor(Math.random() * elements.length)];
        target.classList.add('horizontal-hold-error');
        
        setTimeout(() => {
          target.classList.remove('horizontal-hold-error');
        }, 1800);
      }
      
      // 90-300 second intervals (1.5-5 minutes)
      setTimeout(triggerTracking, 90000 + Math.random() * 210000);
    }
    
    setTimeout(triggerTracking, 60000); // Start after 1 minute
  }
  
  function rareCRTRetrace() {
    const retrace = document.getElementById('crtRetrace');
    if (!retrace) return;
    
    function triggerRetrace() {
      if (!shouldRun()) {
        setTimeout(triggerRetrace, 180000);
        return;
      }
      
      // Extremely rare CRT retrace visibility
      if (Math.random() < 0.002) { // 0.2% chance
        retrace.classList.remove('run');
        void retrace.offsetWidth;
        retrace.classList.add('run');
      }
      
      // 3-10 minute intervals
      setTimeout(triggerRetrace, 180000 + Math.random() * 420000);
    }
    
    setTimeout(triggerRetrace, 120000); // Start after 2 minutes
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    if (!shouldRun()) return;
    
    // Wait for SVG filters to load, then start subtle effects
    setTimeout(() => {
      createRealisticNoise();
      subtlePhosphorEffects();
      occasionalTrackingErrors();
      rareCRTRetrace();
    }, 12000);
  });
})();
