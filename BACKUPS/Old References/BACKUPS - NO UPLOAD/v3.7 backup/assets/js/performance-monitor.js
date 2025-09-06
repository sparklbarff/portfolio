(function() {
  'use strict';
  
  const PerformanceMonitor = {
    isLowEnd: false,
    fpsHistory: [],
    frameCount: 0,
    lastFrameTime: performance.now(),
    isMonitoring: false,
    
    init() {
      this.detectDevice();
      this.applyInitialOptimizations();
      
      if (window.location.search.includes('perf=1') || this.isLowEnd) {
        this.startMonitoring();
      }
      
      return this;
    },
    
    detectDevice() {
      // Memory detection
      const memory = navigator.deviceMemory || 4;
      const isLowMemory = memory <= 2;
      
      // Connection detection
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const isSlowConnection = connection && (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
      
      // Hardware concurrency
      const cores = navigator.hardwareConcurrency || 2;
      const isLowCore = cores <= 2;
      
      // Mobile detection
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouch = 'ontouchstart' in window;
      
      // Battery detection
      let isLowBattery = false;
      if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
          isLowBattery = battery.level < 0.2 || battery.charging === false;
          if (isLowBattery) this.enablePowerSaving();
        });
      }
      
      this.isLowEnd = isLowMemory || isSlowConnection || isLowCore || (isMobile && isTouch);
      
      console.log('Device capabilities:', {
        memory,
        cores,
        connection: connection?.effectiveType,
        saveData: connection?.saveData,
        mobile: isMobile,
        lowEnd: this.isLowEnd
      });
    },
    
    applyInitialOptimizations() {
      if (this.isLowEnd) {
        document.documentElement.classList.add('perf-reduce');
        
        // Reduce effect layers
        const heavyEffects = document.querySelectorAll('.crt-flicker-layer, .crt-phosphor-dots, .vhs-head-switch, .vhs-chroma-noise, .composite-artifacts');
        heavyEffects.forEach(el => el.style.display = 'none');
        
        // Reduce CSS custom properties for better performance
        document.documentElement.style.setProperty('--fade-dur', '8s');
        document.documentElement.style.setProperty('--period', '30s');
        
        console.log('Low-end device optimizations applied');
      }
    },
    
    startMonitoring() {
      if (this.isMonitoring) return;
      this.isMonitoring = true;
      
      this.createFPSMeter();
      requestAnimationFrame(this.updateFPS.bind(this));
      
      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', entry.duration.toFixed(2) + 'ms');
              this.handleLongTask(entry.duration);
            }
          }
        });
        
        observer.observe({entryTypes: ['longtask']});
      }
    },
    
    createFPSMeter() {
      const meter = document.createElement('div');
      meter.id = 'fps-meter';
      meter.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: #00ff88;
        font-family: monospace;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 13px;
        z-index: 10000;
        pointer-events: none;
        border: 1px solid rgba(0,255,136,0.3);
      `;
      document.body.appendChild(meter);
    },
    
    updateFPS() {
      if (!this.isMonitoring) return;
      
      const now = performance.now();
      this.frameCount++;
      
      if (now - this.lastFrameTime >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime));
        this.fpsHistory.push(fps);
        
        if (this.fpsHistory.length > 10) {
          this.fpsHistory.shift();
        }
        
        const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        
        // Update meter
        const meter = document.getElementById('fps-meter');
        if (meter) {
          meter.textContent = `FPS: ${fps} (avg: ${Math.round(avgFPS)})`;
          meter.style.color = fps < 30 ? '#ff4444' : fps < 45 ? '#ffaa00' : '#00ff88';
        }
        
        // Performance adjustments
        if (avgFPS < 25 && this.fpsHistory.length >= 5) {
          this.enablePerformanceMode();
        } else if (avgFPS > 50 && document.documentElement.classList.contains('perf-reduce')) {
          this.disablePerformanceMode();
        }
        
        this.frameCount = 0;
        this.lastFrameTime = now;
      }
      
      requestAnimationFrame(this.updateFPS.bind(this));
    },
    
    handleLongTask(duration) {
      if (duration > 100) {
        this.enablePerformanceMode();
      }
    },
    
    enablePerformanceMode() {
      if (document.documentElement.classList.contains('perf-reduce')) return;
      
      console.log('Enabling performance mode due to low FPS');
      document.documentElement.classList.add('perf-reduce');
      
      // Disable heavy effects
      const heavyEffects = document.querySelectorAll('.vhs-signal-layer .background-image');
      heavyEffects.forEach(el => el.style.display = 'none');
      
      // Reduce animation frequency
      this.throttleAnimations();
    },
    
    disablePerformanceMode() {
      console.log('Disabling performance mode - performance recovered');
      document.documentElement.classList.remove('perf-reduce');
      
      // Re-enable effects
      const heavyEffects = document.querySelectorAll('.vhs-signal-layer .background-image');
      heavyEffects.forEach(el => el.style.display = '');
    },
    
    enablePowerSaving() {
      console.log('Enabling power saving mode');
      document.documentElement.classList.add('power-save');
      
      // Reduce all animations
      const styles = document.createElement('style');
      styles.textContent = `
        .power-save * {
          animation-duration: 0.01s !important;
          animation-delay: 0s !important;
          transition-duration: 0.01s !important;
        }
      `;
      document.head.appendChild(styles);
    },
    
    throttleAnimations() {
      // Reduce CRT effect update frequency
      const crtElements = document.querySelectorAll('[class*="crt-"], [class*="vhs-"]');
      crtElements.forEach(el => {
        if (el.style.animationDuration) {
          const duration = parseFloat(el.style.animationDuration);
          el.style.animationDuration = (duration * 2) + 's';
        }
      });
    },
    
    getStats() {
      return {
        isLowEnd: this.isLowEnd,
        avgFPS: this.fpsHistory.length ? 
          Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length) : 0,
        performanceMode: document.documentElement.classList.contains('perf-reduce')
      };
    }
  };
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceMonitor.init());
  } else {
    PerformanceMonitor.init();
  }
  
  // Expose for debugging
  window.PerformanceMonitor = PerformanceMonitor;
})();
