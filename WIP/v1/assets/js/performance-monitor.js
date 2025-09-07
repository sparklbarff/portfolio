/*
 * CRT Performance Monitor
 * Detects device capabilities through hardware APIs and network conditions
 * Physics: Balances visual fidelity against rendering pipeline constraints
 * Implementation: Uses WebGL renderer detection, memory APIs, connection analysis
 * Coordinates frame rate and effect complexity across all CRT systems
 * Performance: Adaptive effect disabling, animation throttling, memory monitoring
 */
(function() {
  'use strict';

  /* Performance detection thresholds */
  const PERF_THRESHOLDS = {
    LOW_MEMORY: 2 /* GB - mobile/low-end devices */,
    MEDIUM_MEMORY: 4 /* GB - mid-range devices */,
    LOW_CORES: 2 /* CPU cores - basic performance */,
    MEDIUM_CORES: 4 /* CPU cores - moderate performance */
  };

  /* Frame rate targets per performance level */
  const PERF_FRAME_RATES = {
    LOW: 15 /* Minimum viable frame rate */,
    MEDIUM: 20 /* Balanced performance */,
    HIGH: 30 /* Maximum quality */
  };

  /* Animation duration multipliers */
  const ANIM_MULTIPLIERS = {
    LOW: 3 /* 3x slower animations */,
    MEDIUM: 1.5 /* 1.5x slower animations */,
    HIGH: 1 /* Normal speed */
  };

  const PerformanceMonitor = {
    isLowEnd: false,
    performanceLevel: 'high',
    isMonitoring: false,

    init() {
      try {
        this.detectDevice();
        this.applyInitialOptimizations();
        this.startRealTimeMonitoring();
        this.setupEventListeners();
      } catch (error) {
        console.error('[Performance] Initialization error:', error);
        // Fallback to safe defaults
        this.performanceLevel = 'medium';
        document.documentElement.classList.add('perf-medium');
      }
      return this;
    },

    detectDevice() {
      try {
        // Enhanced memory detection via Device Memory API
        const memory = navigator.deviceMemory || 4;
        const isLowMemory = memory <= PERF_THRESHOLDS.LOW_MEMORY;
        const isMediumMemory = memory <= PERF_THRESHOLDS.MEDIUM_MEMORY;

        // Network condition analysis
        const connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;
        const isSlowConnection =
          connection &&
          (connection.saveData ||
            connection.effectiveType === 'slow-2g' ||
            connection.effectiveType === '2g');
        const isMediumConnection =
          connection && connection.effectiveType === '3g';

        // CPU core detection via Hardware Concurrency API
        const cores = navigator.hardwareConcurrency || 2;
        const isLowCore = cores <= PERF_THRESHOLDS.LOW_CORES;
        const isMediumCore = cores <= PERF_THRESHOLDS.MEDIUM_CORES;

        // Device type classification
        const isMobile =
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );
        const isTouch = 'ontouchstart' in window;

        // GPU capability detection via WebGL
        const canvas = document.createElement('canvas');
        const gl =
          canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const renderer = gl ? gl.getParameter(gl.RENDERER) : '';
        const isLowGPU =
          renderer.includes('Mali') ||
          renderer.includes('Adreno 3') ||
          renderer.includes('PowerVR');

        // Determine overall performance level
        if (
          isLowMemory ||
          isSlowConnection ||
          isLowCore ||
          isLowGPU ||
          (isMobile && isTouch)
        ) {
          this.performanceLevel = 'low';
          this.isLowEnd = true;
        } else if (isMediumMemory || isMediumConnection || isMediumCore) {
          this.performanceLevel = 'medium';
        } else {
          this.performanceLevel = 'high';
        }

        console.log(`[Performance] Device profile: ${this.performanceLevel}`, {
          memory: `${memory}GB`,
          cores,
          connection: connection?.effectiveType || 'unknown',
          renderer: renderer.substring(0, 50),
          mobile: isMobile
        });
      } catch (error) {
        console.error('[Performance] Detection error:', error);
        // Fallback to safe defaults
        this.performanceLevel = 'medium';
      }
    },

    startRealTimeMonitoring() {
      if (this.isMonitoring) {
        return;
      }

      this.isMonitoring = true;
      let frameCount = 0;
      let lastTime = performance.now();
      let lowFrameStreak = 0;

      const monitorFrame = currentTime => {
        frameCount++;

        // Check FPS every 60 frames (~1 second at 60fps)
        if (frameCount % 60 === 0) {
          const elapsed = currentTime - lastTime;
          const fps = (60 * 1000) / elapsed;
          const targetFPS =
            PERF_FRAME_RATES[this.performanceLevel.toUpperCase()];

          // Detect sustained low performance
          if (fps < targetFPS * 0.8) {
            lowFrameStreak++;

            // Downgrade performance after 3 consecutive low FPS measurements
            if (lowFrameStreak >= 3) {
              this.adaptPerformanceDown();
              lowFrameStreak = 0;
            }
          } else {
            lowFrameStreak = 0;
          }

          lastTime = currentTime;

          // Update CRT system with current FPS
          if (window.CRTSystem && window.CRTSystem.updatePerformanceMetrics) {
            window.CRTSystem.updatePerformanceMetrics({ fps, frameCount });
          }
        }

        if (this.isMonitoring) {
          requestAnimationFrame(monitorFrame);
        }
      };

      requestAnimationFrame(monitorFrame);
      console.log('[Performance] Real-time monitoring started');
    },

    adaptPerformanceDown() {
      const currentLevel = this.performanceLevel;

      if (currentLevel === 'high') {
        this.performanceLevel = 'medium';
        console.log('[Performance] Adapted down: high → medium');
      } else if (currentLevel === 'medium') {
        this.performanceLevel = 'low';
        console.log('[Performance] Adapted down: medium → low');
      } else {
        console.log('[Performance] Already at lowest level');
        return;
      }

      this.applyAdaptiveOptimizations();
    },

    applyAdaptiveOptimizations() {
      const docEl = document.documentElement;

      // Remove previous performance classes
      docEl.classList.remove(
        'perf-low',
        'perf-medium',
        'perf-high',
        'perf-reduce'
      );

      // Apply new optimizations
      if (this.performanceLevel === 'low') {
        docEl.classList.add('perf-reduce', 'perf-low');
        this.disableHeavyEffects();
        this.adjustAnimationDurations('low');
        this.setUnifiedFrameRate(PERF_FRAME_RATES.LOW);
      } else if (this.performanceLevel === 'medium') {
        docEl.classList.add('perf-medium');
        this.adjustAnimationDurations('medium');
        this.setUnifiedFrameRate(PERF_FRAME_RATES.MEDIUM);
      }

      // Notify other systems of performance change
      window.dispatchEvent(
        new CustomEvent('performanceAdapted', {
          detail: { level: this.performanceLevel }
        })
      );
    },

    setupEventListeners() {
      // Monitor page visibility for performance optimization
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isMonitoring = false;
          console.log('[Performance] Monitoring paused (page hidden)');
        } else {
          this.startRealTimeMonitoring();
          console.log('[Performance] Monitoring resumed (page visible)');
        }
      });

      // Monitor network changes
      if (navigator.connection) {
        navigator.connection.addEventListener('change', () => {
          console.log(
            '[Performance] Network change detected, re-evaluating...'
          );
          this.detectDevice();
          this.applyAdaptiveOptimizations();
        });
      }
    },

    applyInitialOptimizations() {
      const docEl = document.documentElement;

      if (this.performanceLevel === 'low') {
        docEl.classList.add('perf-reduce', 'perf-low');
        this.disableHeavyEffects();
        this.adjustAnimationDurations('low');
        this.setUnifiedFrameRate(PERF_FRAME_RATES.LOW);
        this.optimizeForLowEnd();
      } else if (this.performanceLevel === 'medium') {
        docEl.classList.add('perf-medium');
        this.adjustAnimationDurations('medium');
        this.setUnifiedFrameRate(PERF_FRAME_RATES.MEDIUM);
        this.optimizeForMedium();
      } else {
        this.setUnifiedFrameRate(PERF_FRAME_RATES.HIGH);
        this.enableAdvancedEffects();
      }

      console.log(
        `[Performance] Applied ${this.performanceLevel} optimizations`
      );
    },

    optimizeForLowEnd() {
      /* Disable backdrop filters on low-end devices */
      const style = document.createElement('style');
      style.textContent = `
        .perf-low .mini,
        .perf-low footer p {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        .perf-low .vhs-signal-layer {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    },

    optimizeForMedium() {
      /* Reduce backdrop filter intensity */
      const style = document.createElement('style');
      style.textContent = `
        .perf-medium .mini {
          backdrop-filter: blur(2px) !important;
        }
        .perf-medium .vhs-signal-layer {
          opacity: 0.04 !important;
        }
      `;
      document.head.appendChild(style);
    },

    enableAdvancedEffects() {
      /* Enable GPU-accelerated effects on high-end devices */
      const advancedElements = document.querySelectorAll(
        '.crt-scanlines, .vhs-sweep, .crt-retrace-sweep'
      );

      advancedElements.forEach(el => {
        el.style.willChange = 'transform, opacity';
        el.style.transform = 'translateZ(0)';
      });
    },

    setUnifiedFrameRate(targetFPS) {
      // Set unified frame rate across all CRT systems
      if (window.CRTTemporalState) {
        window.CRTTemporalState.targetFPS = targetFPS;

        // Broadcast frame rate change to all systems
        window.dispatchEvent(
          new CustomEvent('frameRateChange', {
            detail: { targetFPS, performanceLevel: this.performanceLevel }
          })
        );
      }

      console.log(`[Performance] Unified frame rate: ${targetFPS}fps`);
    },

    disableHeavyEffects() {
      // Remove computationally expensive backdrop filters and animations
      const heavyEffects = [
        '.crt-flicker-layer',
        '.crt-phosphor-dots',
        '.vhs-head-switch',
        '.vhs-chroma-noise',
        '.composite-artifacts',
        '.vhs-dropout',
        '.interlace-field-odd',
        '.interlace-field-even',
        '.phosphor-trails'
      ];

      heavyEffects.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => (el.style.display = 'none'));
      });
    },

    adjustAnimationDurations(level) {
      const multiplier = ANIM_MULTIPLIERS[level.toUpperCase()] || 1;

      // Adjust CSS custom properties for animation timing
      document.documentElement.style.setProperty(
        '--fade-dur',
        `${9 * multiplier}s`
      );
      document.documentElement.style.setProperty(
        '--period',
        `${20 * multiplier}s`
      );
      document.documentElement.style.setProperty(
        '--sweep-dur',
        `${25 * multiplier}s`
      );
    },

    enablePerformanceMode() {
      if (document.documentElement.classList.contains('perf-reduce')) {
        return;
      }

      console.log('[Performance] Emergency performance mode enabled');
      document.documentElement.classList.add('perf-reduce');
      this.disableHeavyEffects();

      // Reduce glitch system intensity
      if (window.CRTTemporalState) {
        window.CRTTemporalState.performanceMode = true;
      }
    },

    getPerformanceLevel() {
      return this.performanceLevel;
    },

    isLowEndDevice() {
      return this.isLowEnd;
    }
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () =>
      PerformanceMonitor.init()
    );
  } else {
    PerformanceMonitor.init();
  }

  // Expose for system coordination
  window.PerformanceMonitor = PerformanceMonitor;
})();
