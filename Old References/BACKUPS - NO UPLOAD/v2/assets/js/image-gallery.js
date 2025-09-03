class ImageGallery {
  constructor(options = {}) {
    this.options = {
      container: '#stage',
      imageElement: '#shot',
      prevButton: '#prev',
      nextButton: '#next',
      statusElement: '#galleryStatus',
      basePath: 'mybg/png/',
      imageCount: 45,
      displayCount: 12,
      ...options
    };
    
    this.container = document.querySelector(this.options.container);
    this.imageEl = document.querySelector(this.options.imageElement);
    this.prevBtn = document.querySelector(this.options.prevButton);
    this.nextBtn = document.querySelector(this.options.nextButton);
    this.statusEl = document.querySelector(this.options.statusElement);
    
    this.images = [];
    this.imageIndexes = [];
    this.currentIndex = 0;
    this.imageCache = new Map();
    this.intersectionObserver = null;
    
    if (this.container && this.imageEl) {
      this.init();
    }
  }
  
  init() {
    this.generateImageList();
    
    if ('IntersectionObserver' in window) {
      this.setupLazyLoading();
    }
    
    this.setupNavigation();
    
    this.showImage(0);
    
    this.preloadNextImages(3);
  }
  
  generateImageList() {
    const maxImages = Math.min(this.options.imageCount, 20);
    const wantImages = this.options.displayCount;
    
    const indices = Array.from({length: maxImages}, (_, i) => i + 1);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    for (let i = 0; i < wantImages && i < indices.length; i++) {
      const url = `${this.options.basePath}bg${indices[i]}.png`;
      this.images.push(url);
      this.imageIndexes.push(indices[i]);
    }
  }
  
  setupLazyLoading() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target === this.container) {
          this.preloadImage(this.images[this.currentIndex]);
          
          this.preloadNextImages(2);
        }
      });
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });
    
    this.intersectionObserver.observe(this.container);
  }
  
  setupNavigation() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.showImage(this.currentIndex - 1);
      });
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.showImage(this.currentIndex + 1);
      });
    }
    
    document.addEventListener('keydown', e => {
      if (!document.querySelector('.mini')) return;
      
      if (e.key === 'ArrowLeft') this.showImage(this.currentIndex - 1);
      if (e.key === 'ArrowRight') this.showImage(this.currentIndex + 1);
    });
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleSwipe = () => {
      const threshold = 50;
      if (touchStartX - touchEndX > threshold) {
        this.showImage(this.currentIndex + 1);
      } else if (touchEndX - touchStartX > threshold) {
        this.showImage(this.currentIndex - 1);
      }
    };
    
    this.container.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    this.container.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }
  
  preloadImage(url) {
    if (this.imageCache.has(url)) {
      return Promise.resolve(this.imageCache.get(url));
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
  }
  
  preloadNextImages(count) {
    for (let i = 1; i <= count; i++) {
      const nextIndex = (this.currentIndex + i) % this.images.length;
      if (nextIndex >= 0 && nextIndex < this.images.length) {
        this.preloadImage(this.images[nextIndex]).catch(() => {});
      }
    }
  }
  
  async showImage(index) {
    if (index < 0) index = this.images.length - 1;
    if (index >= this.images.length) index = 0;
    
    this.currentIndex = index;
    const url = this.images[this.currentIndex];
    
    try {
      if (this.imageEl) {
        this.imageEl.classList.add('loading');
        this.imageEl.alt = "Portfolio artwork";
      }
      
      await this.preloadImage(url);
      
      if (this.imageEl) {
        this.imageEl.src = url;
        this.imageEl.classList.remove('loading');
      }
      
      if (this.container) {
        this.container.classList.remove('error');
      }
      
      if (this.statusEl) {
        this.statusEl.textContent = `Image ${this.currentIndex + 1} of ${this.images.length}`;
      }
      
      this.preloadNextImages(2);
      
    } catch (err) {
      if (this.imageEl) {
        this.imageEl.classList.remove('loading');
      }
      
      if (this.container) {
        this.container.classList.add('error');
      }
      
      if (this.statusEl) {
        this.statusEl.textContent = "Image failed to load";
      }
      
      console.error("Gallery image error:", err);
    }
  }
  
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    // Clear cache
    this.imageCache.forEach((img, url) => {
      URL.revokeObjectURL(url);
    });
    this.imageCache.clear();
  }
}
