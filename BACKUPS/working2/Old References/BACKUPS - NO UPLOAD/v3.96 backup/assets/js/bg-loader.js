(function() {
  "use strict";
  
  const bgContainer = document.getElementById('bg-container');
  if (!bgContainer) {
    console.error('bg-container not found');
    return;
  }
  
  let manifest = null;
  let currentIndex = 0;
  let images = [];
  let preloadedImages = new Map();
  let cycleTimer = null;
  let isTransitioning = false;
  
  function fetchManifest() {
    console.log('Fetching manifest...');
    return fetch('manifest.json')
      .then(response => {
        console.log('Manifest response:', response.status);
        if (!response.ok) throw new Error('Failed to load manifest.json');
        return response.json();
      })
      .then(data => {
        console.log('Manifest loaded:', data);
        return data;
      })
      .catch(error => {
        console.error('Error loading background manifest:', error);
        return {
          count: 31,
          pad: false,
          path: 'assets/images',
          extension: 'png',
          preload: 3
        };
      });
  }
  
  function generateImagePaths() {
    if (!manifest || manifest.count <= 0) {
      console.error('No manifest or invalid count');
      return [];
    }
    
    const results = [];
    const padZero = manifest.pad && manifest.count > 9;
    
    console.log(`Generating ${manifest.count} image paths with pad: ${padZero}`);
    
    for (let i = 1; i <= manifest.count; i++) {
      const num = padZero ? String(i).padStart(2, '0') : i;
      const path = `${manifest.path}/bg${num}.${manifest.extension}`;
      results.push(path);
    }
    
    console.log('Generated image paths:', results.slice(0, 5), '...', results.length, 'total');
    return results;
  }
  
  function preloadImage(src) {
    if (preloadedImages.has(src)) {
      return Promise.resolve(preloadedImages.get(src));
    }
    
    console.log('Preloading image:', src);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        console.log('Image loaded successfully:', src);
        preloadedImages.set(src, img);
        resolve(img);
      };
      
      img.onerror = () => {
        console.error('Failed to load image:', src);
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
      promises.push(preloadImage(images[idx]).catch(err => {
        console.warn('Failed to preload:', images[idx], err);
        return null;
      }));
    }
    
    return Promise.all(promises);
  }
  
  function createBackgroundElement(src) {
    const div = document.createElement('div');
    div.className = 'bg-image';
    div.style.backgroundImage = `url(${src})`;
    console.log('Created background element for:', src);
    return div;
  }
  
  function triggerScanlineSweep() {
    if (document.documentElement.dataset.motion === "paused") return;
    
    console.log('Background transition - triggering enhanced sweep effects');
    
    // Performance check
    const performanceMode = document.documentElement.classList.contains('perf-reduce');
    
    // Enhanced VHS Sweep (60% chance, increased from 25%)
    if (!performanceMode && Math.random() < 0.6) {
      const vhsSweep = document.getElementById('vhsSweep');
      if (vhsSweep) {
        vhsSweep.classList.remove('active');
        void vhsSweep.offsetWidth; // Force reflow
        vhsSweep.classList.add('active');
        console.log('VHS enhanced sweep triggered');
      }
    }
    
    // CRT Retrace (80% chance, increased from 40%)
    const retraceChance = performanceMode ? 0.25 : 0.8;
    if (Math.random() < retraceChance) {
      const crtRetrace = document.getElementById('crtRetrace');
      if (crtRetrace) {
        crtRetrace.classList.remove('active');
        void crtRetrace.offsetWidth; // Force reflow
        crtRetrace.classList.add('active');
        console.log('CRT retrace triggered');
      }
    }
    
    // VHS Tracking Errors (20% chance, increased from 15%)
    if (Math.random() < 0.2) {
      const elements = document.querySelectorAll('header, nav');
      elements.forEach(el => {
        if (Math.random() < 0.25) { // 25% chance per element
          el.classList.add('horizontal-hold-error');
          setTimeout(() => el.classList.remove('horizontal-hold-error'), 1300);
          console.log('VHS tracking error triggered');
        }
      });
    }
    
    // Head Switching Noise (15% chance, increased from 10%)
    if (!performanceMode && Math.random() < 0.15) {
      const headSwitch = document.getElementById('vhsHeadSwitch');
      if (headSwitch) {
        headSwitch.style.top = (Math.random() * 80 + 10) + '%';
        headSwitch.classList.remove('active');
        void headSwitch.offsetWidth;
        headSwitch.classList.add('active');
        console.log('VHS head switch triggered');
      }
    }
  }
  
  function transitionToNext() {
    if (isTransitioning || !images.length) {
      console.log('Skipping transition - transitioning:', isTransitioning, 'images:', images.length);
      return;
    }
    isTransitioning = true;
    
    const nextIndex = (currentIndex + 1) % images.length;
    const currentSrc = images[currentIndex];
    const nextSrc = images[nextIndex];
    
    console.log(`Transitioning from ${currentIndex} (${currentSrc}) to ${nextIndex} (${nextSrc})`);
    
    const current = bgContainer.querySelector(`.bg-image[style*="${currentSrc.split('/').pop()}"]`);
    let next = bgContainer.querySelector(`.bg-image[style*="${nextSrc.split('/').pop()}"]`);
    
    if (!next) {
      next = createBackgroundElement(nextSrc);
      bgContainer.appendChild(next);
    }
    
    setTimeout(() => {
      if (current) {
        current.classList.remove('active');
        console.log('Removed active from current');
      }
      
      next.classList.add('active');
      console.log('Added active to next');
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
            .forEach(img => {
              console.log('Removing old image');
              img.remove();
            });
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
      console.log('Setting up cycle with period:', period);
      cycleTimer = setInterval(transitionToNext, period);
    }
  }
  
  function setupFirstBg() {
    if (!images.length) {
      console.error('No images available for first background');
      return Promise.reject(new Error('No background images available'));
    }
    
    const firstSrc = images[0];
    console.log('Setting up first background:', firstSrc);
    
    return preloadImage(firstSrc)
      .then(() => {
        const first = createBackgroundElement(firstSrc);
        bgContainer.appendChild(first);
        
        setTimeout(() => {
          first.classList.add('active');
          console.log('First background activated');
          document.documentElement.style.setProperty('--bg-current', `url(${firstSrc})`);
          isTransitioning = false;
        }, 100);
        
        return preloadNext(manifest.preload || 2);
      })
      .catch(error => {
        console.error('Error setting up initial background:', error);
        // Create a fallback solid color background
        const fallback = document.createElement('div');
        fallback.className = 'bg-image active';
        fallback.style.background = '#2b2b2b';
        fallback.style.filter = 'none'; /* Remove filters from fallback */
        bgContainer.appendChild(fallback);
        console.log('Created fallback background');
      });
  }
  
  function initBackgrounds() {
    console.log('Initializing backgrounds...');
    return fetchManifest()
      .then(data => {
        manifest = data;
        images = generateImagePaths();
        
        if (!images.length) {
          console.error('No background images defined in manifest');
          // Create fallback
          const fallback = document.createElement('div');
          fallback.className = 'bg-image active';
          fallback.style.background = '#2b2b2b';
          fallback.style.filter = 'none'; /* Remove filters from fallback */
          bgContainer.appendChild(fallback);
          return;
        }
        
        return setupFirstBg();
      })
      .then(() => {
        setupCycle();
        
        // Add autonomous sweep effects every 45-90 seconds
        setInterval(() => {
          if (document.documentElement.dataset.motion === "paused") return;
          const performanceMode = document.documentElement.classList.contains('perf-reduce');
          
          // Autonomous retrace sweep
          if (!performanceMode && Math.random() < 0.3) {
            const crtRetrace = document.getElementById('crtRetrace');
            if (crtRetrace) {
              crtRetrace.classList.remove('active');
              void crtRetrace.offsetWidth;
              crtRetrace.classList.add('active');
              console.log('Autonomous CRT retrace triggered');
            }
          }
        }, 45000 + Math.random() * 45000); // 45-90 seconds
        
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
        // Emergency fallback
        const fallback = document.createElement('div');
        fallback.className = 'bg-image active';
        fallback.style.background = '#2b2b2b';
        fallback.style.filter = 'none'; /* Remove filters from fallback */
        bgContainer.appendChild(fallback);
        console.log('Emergency fallback background created');
      });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackgrounds);
  } else {
    initBackgrounds();
  }
})();

