/**
 * Background Image Loader with Preloading
 * - Efficiently loads background images based on manifest
 * - Preloads next images for smoother transitions
 * - Respects reduced motion preferences
 */
"use strict";

class BackgroundLoader {
  constructor(options = {}) {
    this.options = Object.assign({
      container: document.getElementById('bg-container'),
      manifestPath: 'mybg/manifest.json',
      preloadCount: 3,
      period: 20000,
      fadeDuration: 15000,
      initialFlicker: true
    }, options);
    
    this.manifest = null;
    this.images = [];
    this.imageCache = new Map();
    this.preloadQueue = [];
    this.currentIndex = -1;
    this.active = 0;
    this.layers = [];
    this.isPaused = false;
    this.isVisible = true;
    
    this.init();
  }
  
  async init() {
    // Create background layers
    this.createLayers();
    
    // Load manifest
    try {
      const response = await fetch(this.options.manifestPath);
      if (!response.ok) throw new Error('Failed to load manifest');
      this.manifest = await response.json();
      
      // Generate image paths
      this.generateImagePaths();
      
      // Start the sequence
      this.preloadImages();
      this.showNextImage();
      this.startInterval();
      
      // Set up visibility change detection
      this.setupVisibilityDetection();
    } catch (error) {
      console.error('Background loader error:', error);
    }
  }
  
  createLayers() {
    for (let i = 0; i < 2; i++) {
      const layer = document.createElement('div');
      layer.className = 'bg-image';
      this.options.container.appendChild(layer);
      this.layers.push(layer);
    }
  }
  
  generateImagePaths() {
    if (!this.manifest) return;
    
    const { count, path, extension, pad } = this.manifest;
    
    this.images = Array.from({ length: count }, (_, i) => {
      const num = i + 1;
      const paddedNum = pad ? String(num).padStart(2, '0') : num;
      return `${path}/bg${paddedNum}.${extension}`;
    });
    
    // Shuffle the array for randomized display
    this.shuffleArray(this.images);
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  preloadImages() {
    // Preload next images based on preloadCount
    const { preloadCount } = this.options;
    
    for (let i = 0; i < preloadCount; i++) {
      const nextIndex = (this.currentIndex + i + 1) % this.images.length;
      const url = this.images[nextIndex];
      
      if (!this.imageCache.has(url)) {
        this.preloadQueue.push(url);
        this.loadImage(url);
      }
    }
  }
  
  loadImage(url) {
    if (this.imageCache.has(url)) return Promise.resolve(this.imageCache.get(url));
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(url, img);
        this.preloadQueue = this.preloadQueue.filter(u => u !== url);
        resolve(img);
      };
      img.onerror = () => {
        this.preloadQueue = this.preloadQueue.filter(u => u !== url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }
  
  async showNextImage() {
    if (!this.images.length) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    const url = this.images[this.currentIndex];
    const currentLayer = this.layers[this.active];
    const nextLayer = this.layers[this.active ^ 1];
    
    try {
      await this.loadImage(url);
      
      nextLayer.style.backgroundImage = `url("${url}")`;
      
      // Apply initial flicker effect only on first load
      if (this.options.initialFlicker && this.currentIndex === 0) {
        this.applyFlickerEffect(nextLayer);
      } else {
        nextLayer.classList.add("active");
        
        setTimeout(() => {
          currentLayer.classList.remove("active");
        }, 100);
      }
      
      this.active ^= 1;
      document.documentElement.style.setProperty("--bg-current", `url("${url}")`);
      
      // Preload next images
      this.preloadImages();
    } catch (error) {
      console.error('Error showing image:', error);
      // Try next image after delay
      setTimeout(() => this.showNextImage(), 1000);
    }
  }
  
  applyFlickerEffect(layer) {
    let flickerCount = 0;
    const maxFlickers = 5;
    const flickerInterval = setInterval(() => {
      layer.style.opacity = flickerCount % 2 === 0 ? '0.7' : '1';
      flickerCount++;
      
      if (flickerCount >= maxFlickers) {
        clearInterval(flickerInterval);
        layer.classList.add("active");
        
        setTimeout(() => {
          this.layers[this.active].classList.remove("active");
        }, 100);
      }
    }, 80);
  }
  
  startInterval() {
    this.intervalId = setInterval(() => {
      if (!this.isPaused && this.isVisible) {
        this.showNextImage();
      }
    }, this.options.period);
  }
  
  pause() {
    this.isPaused = true;
  }
  
  resume() {
    this.isPaused = false;
  }
  
  setupVisibilityDetection() {
    document.addEventListener("visibilitychange", () => {
      this.isVisible = document.visibilityState === "visible";
      
      if (this.isVisible) {
        // When becoming visible again, preload images
        this.preloadImages();
      }
    });
  }
  
  cleanup() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// Initialize once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Read preload count from manifest if available
  fetch('mybg/manifest.json')
    .then(response => response.json())
    .then(manifest => {
      window.bgLoader = new BackgroundLoader({
        preloadCount: manifest.preload || 3
      });
      
      // Connect to motion toggle button
      const motionBtn = document.getElementById('motionBtn');
      if (motionBtn) {
        motionBtn.addEventListener('click', () => {
          const isOn = motionBtn.getAttribute('aria-pressed') === 'true';
          if (isOn) {
            window.bgLoader.pause();
          } else {
            window.bgLoader.resume();
          }
        }, {passive: true});
      }
    })
    .catch(err => {
      console.error("Failed to load manifest, using defaults:", err);
      window.bgLoader = new BackgroundLoader();
    });
});
