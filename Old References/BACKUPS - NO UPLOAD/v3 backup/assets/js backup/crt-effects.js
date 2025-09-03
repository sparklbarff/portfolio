(function() {
  "use strict";
  
  function shouldRun() {
    return document.documentElement.dataset.motion !== "paused" && 
           !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function createNoiseOverlay() {
    const noise = document.createElement('div');
    noise.className = 'crt-noise';
    document.body.appendChild(noise);
    
    let frame = 0;
    function updateNoise() {
      if (!shouldRun()) {
        requestAnimationFrame(updateNoise);
        return;
      }
      
      if (frame % 3 === 0) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        noise.style.backgroundPosition = `${x}% ${y}%`;
      }
      
      frame = (frame + 1) % 60;
      requestAnimationFrame(updateNoise);
    }
    
    requestAnimationFrame(updateNoise);
  }
  
  function enhanceVignette() {
    const vignette = document.querySelector('.crt-vignette');
    if (!vignette) return;
    
    let intensity = 0.6;
    
    function flickerVignette() {
      if (!shouldRun()) {
        requestAnimationFrame(flickerVignette);
        return;
      }
      
      if (Math.random() < 0.05) {
        intensity = 0.6 + Math.random() * 0.2;
        vignette.style.opacity = intensity.toString();
      }
      
      if (Math.random() < 0.003) {
        vignette.style.opacity = (intensity + 0.3).toString();
        setTimeout(() => {
          vignette.style.opacity = intensity.toString();
        }, 50 + Math.random() * 100);
      }
      
      requestAnimationFrame(flickerVignette);
    }
    
    requestAnimationFrame(flickerVignette);
  }
  
  function addRandomBloom() {
    const elements = document.querySelectorAll('#glitch-title, #nav-list a');
    
    function applyBloom() {
      if (!shouldRun()) {
        setTimeout(applyBloom, 2000);
        return;
      }
      
      if (Math.random() < 0.1) {
        const target = elements[Math.floor(Math.random() * elements.length)];
        const originalFilter = target.style.filter;
        const originalTextShadow = target.style.textShadow;
        
        target.style.filter = 'brightness(1.4) contrast(1.2)';
        target.style.textShadow = '0 0 8px rgba(255,255,255,0.8)';
        
        setTimeout(() => {
          target.style.filter = originalFilter;
          target.style.textShadow = originalTextShadow;
        }, 120 + Math.random() * 150);
      }
      
      setTimeout(applyBloom, 800 + Math.random() * 3000);
    }
    
    setTimeout(applyBloom, 2000);
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    if (!shouldRun()) return;
    
    setTimeout(() => {
      createNoiseOverlay();
      enhanceVignette();
      addRandomBloom();
    }, 1000);
  });
})();
