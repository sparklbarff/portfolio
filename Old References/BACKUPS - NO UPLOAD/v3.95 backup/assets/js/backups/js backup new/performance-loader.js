"use strict";

const PerformanceLoader = {
  cache: new Map(),
  loadQueue: [],
  activeLoads: 0,
  maxConcurrent: 4,
  preloadThreshold: 3,
  initialLoadComplete: false,

  init(options = {}) {
    Object.assign(this, options);
    this.maxConcurrent = navigator.connection?.saveData ? 2 : this.maxConcurrent;
    this.deviceMemory = navigator.deviceMemory || 4;
    if (this.deviceMemory <= 2) this.maxConcurrent = 2;
    window.addEventListener('online', () => this.processQueue());
    return this;
  },

  load(url, options = {}) {
    if (this.cache.has(url)) return Promise.resolve(this.cache.get(url));
    
    const priority = options.priority || 0;
    const request = { url, priority, options };
    const promise = new Promise((resolve, reject) => {
      request.resolve = resolve;
      request.reject = reject;
    });
    
    this.enqueue(request);
    return promise;
  },

  enqueue(request) {
    const index = this.loadQueue.findIndex(item => item.priority < request.priority);
    if (index === -1) {
      this.loadQueue.push(request);
    } else {
      this.loadQueue.splice(index, 0, request);
    }
    
    this.processQueue();
  },

  processQueue() {
    if (!navigator.onLine || this.loadQueue.length === 0) return;
    
    while (this.activeLoads < this.maxConcurrent && this.loadQueue.length > 0) {
      const request = this.loadQueue.shift();
      this.activeLoads++;
      
      this.loadResource(request.url, request.options)
        .then(resource => {
          this.cache.set(request.url, resource);
          request.resolve(resource);
          this.activeLoads--;
          this.processQueue();
          
          if (!this.initialLoadComplete && this.loadQueue.length === 0) {
            this.initialLoadComplete = true;
            window.dispatchEvent(new CustomEvent('initial-load-complete'));
          }
        })
        .catch(error => {
          request.reject(error);
          this.activeLoads--;
          this.processQueue();
        });
    }
  },

  loadResource(url, options = {}) {
    const fileType = this.getFileType(url);
    
    switch (fileType) {
      case 'image': return this.loadImage(url);
      case 'audio': return this.loadAudio(url);
      case 'json': return this.loadJSON(url);
      default: return this.loadGeneric(url);
    }
  },

  getFileType(url) {
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
    if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) return 'audio';
    if (extension === 'json') return 'json';
    return 'generic';
  },

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  },

  loadAudio(url) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
      audio.src = url;
      audio.load();
    });
  },

  loadJSON(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response.json();
      });
  },

  loadGeneric(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return response.blob();
      });
  },

  preload(urls) {
    if (!Array.isArray(urls)) urls = [urls];
    
    urls.forEach((url, index) => {
      this.load(url, { priority: index < this.preloadThreshold ? 1 : 0 });
    });
  },

  clearCache() {
    this.cache.clear();
  }
};

window.PerformanceLoader = PerformanceLoader.init();
