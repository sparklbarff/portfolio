(function() {
  "use strict";
  
  const bgContainer = document.getElementById('bg-container');
  if (!bgContainer) return;
  
  const scanSweep = document.getElementById('scanSweep');
  let manifest = null;
  let currentIndex = 0;
  let images = [];
  let preloadedImages = new Map();
  let cycleTimer = null;
  let isTransitioning = false;
  
  function fetchManifest() {
    return fetch('manifest.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load manifest.json');
        return response.json();
      })
      .catch(error => {
        console.error('Error loading background manifest:', error);
        // Return default values if manifest fails to load
        return {
          count: 0,
          pad: false,
          path: 'mybg/png',
          extension: 'png',
          preload: 0
        };
      });
  }
  
  function generateImagePaths() {
    if (!manifest || manifest.count <= 0) return [];
    
    const results = [];
    const padZero = manifest.pad && manifest.count > 9;
    
    for (let i = 1; i <= manifest.count; i++) {
      const num = padZero ? String(i).padStart(2, '0') : i;
      const path = `${manifest.path}/bg${num}.${manifest.extension}`;
      results.push(path);
    }
    
    return results;
  }
  
  function preloadImage(src) {
    if (preloadedImages.has(src)) {
      return Promise.resolve(preloadedImages.get(src));
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        preloadedImages.set(src, img);
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  }
  
  function preloadNext(count) {
    if (!images.length) return Promise.resolve();
    
    const promises = [];
    for (let i = 0; i < count; i++) {
      const idx = (currentIndex + i) % images.length;
      promises.push(preloadImage(images[idx]));
    }
    
    return Promise.all(promises);
  }
  
  function createBackgroundElement(src) {
    const div = document.createElement('div');
    div.className = 'bg-image';
    div.style.backgroundImage = `url(${src})`;
    return div;
  }
  
  function triggerScanlineSweep() {
    if (!scanSweep || document.documentElement.dataset.motion === "paused") return;
    
    scanSweep.classList.remove('run');
    void scanSweep.offsetWidth;
    scanSweep.classList.add('run');
  }
  
  function transitionToNext() {
    if (isTransitioning || !images.length) return;
    isTransitioning = true;
    
    const nextIndex = (currentIndex + 1) % images.length;
    const currentSrc = images[currentIndex];
    const nextSrc = images[nextIndex];
    
    const current = bgContainer.querySelector(`.bg-image[style*="${currentSrc}"]`);
    let next = bgContainer.querySelector(`.bg-image[style*="${nextSrc}"]`);
    
    if (!next) {
      next = createBackgroundElement(nextSrc);
      bgContainer.appendChild(next);
    }
    
    setTimeout(() => {
      if (current) {
        current.classList.remove('active');
      }
      
      next.classList.add('active');
      triggerScanlineSweep();
      
      setTimeout(() => {
        currentIndex = nextIndex;
        isTransitioning = false;
        preloadNext(manifest.preload || 2).catch(() => {});
        
        document.documentElement.style.setProperty('--bg-current', `url(${nextSrc})`);
        
        const oldImages = bgContainer.querySelectorAll('.bg-image:not(.active)');
        if (oldImages.length > 3) {
          Array.from(oldImages)
            .slice(0, oldImages.length - 3)
            .forEach(img => img.remove());
        }
      }, 500);
    }, 50);
  }
  
  function setupCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
    }
    
    if (document.documentElement.dataset.motion !== "paused") {
      const period = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--period')) * 1000 || 20000;
      cycleTimer = setInterval(transitionToNext, period);
    }
  }
  
  function setupFirstBg() {
    if (!images.length) return Promise.reject(new Error('No background images available'));
    
    const firstSrc = images[0];
    return preloadImage(firstSrc)
      .then(() => {
        const first = createBackgroundElement(firstSrc);
        bgContainer.appendChild(first);
        
        setTimeout(() => {
          first.classList.add('active');
          document.documentElement.style.setProperty('--bg-current', `url(${firstSrc})`);
          isTransitioning = false;
        }, 100);
        
        return preloadNext(manifest.preload || 2);
      })
      .catch(error => {
        console.error('Error setting up initial background:', error);
      });
  }
  
  function initBackgrounds() {
    return fetchManifest()
      .then(data => {
        manifest = data;
        images = generateImagePaths();
        
        if (!images.length) {
          console.error('No background images defined in manifest');
          return;
        }
        
        return setupFirstBg();
      })
      .then(() => {
        setupCycle();
        
        window.addEventListener('focus', () => {
          setupCycle();
        });
        
        window.addEventListener('blur', () => {
          if (cycleTimer) clearInterval(cycleTimer);
        });
        
        const motionBtn = document.getElementById('motionBtn');
        if (motionBtn) {
          motionBtn.addEventListener('click', () => {
            const isPaused = document.documentElement.dataset.motion === "paused";
            document.documentElement.dataset.motion = isPaused ? null : "paused";
            motionBtn.textContent = isPaused ? "Motion: On" : "Motion: Off";
            motionBtn.setAttribute('aria-pressed', isPaused ? 'false' : 'true');
            
            if (isPaused) {
              setupCycle();
            } else if (cycleTimer) {
              clearInterval(cycleTimer);
            }
          });
        }
      })
      .catch(error => {
        console.error('Failed to initialize backgrounds:', error);
      });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackgrounds);
  } else {
    initBackgrounds();
  }
})();
