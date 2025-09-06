(function() {
  'use strict';
  
  if (!window.location.search.includes('perf=1')) return;
  
  let lastFrameTime = performance.now();
  let frameCount = 0;
  let lowFPSCount = 0;
  let fpsMeter;
  
  function createMeter() {
    fpsMeter = document.createElement('div');
    fpsMeter.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      color: #00ff88;
      font-family: monospace;
      padding: 5px 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(fpsMeter);
  }
  
  function updateMeter() {
    const now = performance.now();
    frameCount++;
    
    if (now - lastFrameTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastFrameTime));
      
      if (fps < 30) {
        lowFPSCount++;
        if (lowFPSCount >= 3) {
          document.documentElement.classList.add('perf-reduce');
          
          const nonEssential = document.querySelectorAll('.scanlines-rgb, .crt-noise');
          nonEssential.forEach(el => el.style.display = 'none');
        }
      } else {
        lowFPSCount = Math.max(0, lowFPSCount - 1);
        if (lowFPSCount === 0) {
          document.documentElement.classList.remove('perf-reduce');
          
          const nonEssential = document.querySelectorAll('.scanlines-rgb, .crt-noise');
          nonEssential.forEach(el => el.style.display = '');
        }
      }
      
      fpsMeter.textContent = `FPS: ${fps}`;
      frameCount = 0;
      lastFrameTime = now;
    }
    
    requestAnimationFrame(updateMeter);
  }
  
  window.addEventListener('load', () => {
    createMeter();
    requestAnimationFrame(updateMeter);
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn('Long task detected:', entry.duration.toFixed(2) + 'ms', entry);
        }
      }
    });
    
    observer.observe({entryTypes: ['longtask']});
  });
})();
