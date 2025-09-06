/*
 * CRT Effects Coordination System
 * Manages ambient CRT artifacts: phosphor glow, tracking errors, retrace sweeps
 * Physics: Simulates electron gun retrace timing and VHS tape head switching
 * Implementation: Event-driven effects triggered by system state changes
 * Coordinates with unified CRT temporal state for realistic failure patterns
 * Performance: Adaptive effect intervals, selective disabling on low-end devices
 */
(function() {
  "use strict";

  // Effect timing constants
  const EFFECT_INTERVALS = {
    GLOW: { LOW: 120000, MEDIUM: 75000, HIGH: 45000 },         // Phosphor glow intervals
    TRACKING: { LOW: 600000, MEDIUM: 360000, HIGH: 240000 },   // VHS tracking errors
    RETRACE: { LOW: 8000, MEDIUM: 4000, HIGH: 2000 }          // CRT retrace sweeps
  };

  // Effect probability constants
  const EFFECT_CHANCES = {
    PHOSPHOR_GLOW: { LOW: 0.0005, MEDIUM: 0.001, HIGH: 0.003 },
    TRACKING_ERROR: { LOW: 0.0001, MEDIUM: 0.0005, HIGH: 0.002 },
    VHS_DROPOUT: 0.0002,                          // Very rare dropout events
    HEAD_SWITCH: 0.0005,                          // Head switching probability
    RETRACE_BASE: 0.008                           // Base retrace probability
  };

  let performanceLevel = 'high';
  let animationFrameId = null;
  let unifiedFrameRate = 30;

  // Cleanup registry for effects system
  const EffectsCleanup = {
    timers: new Set(),
    intervals: new Set(),
    
    registerTimer(id) { 
      this.timers.add(id);
    },
    
    registerInterval(id) {
      this.intervals.add(id);
    },
    
    cleanupAll() {
      this.timers.forEach(id => clearTimeout(id));
      this.timers.clear();
      this.intervals.forEach(id => clearInterval(id));
      this.intervals.clear();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      console.log('[Effects] Cleanup completed');
    }
  };
  
  // Register with unified CRT system
  if (window.CRTTemporalState) {
    window.CRTTemporalState.registerSystem('effects');
  }

  function updatePerformanceSettings() {
    const monitor = window.PerformanceMonitor;
    performanceLevel = monitor ? monitor.getPerformanceLevel() : 'high';
    
    // Use unified frame rate
    if (window.CRTTemporalState) {
      unifiedFrameRate = window.CRTTemporalState.targetFPS;
    }
  }

  function shouldRun() {
    return document.documentElement.dataset.motion !== "paused" && 
           !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Enhanced effect intervals based on CRT state
  function getInterval(effectType) {
    const crtState = window.CRTTemporalState;
    const baseIntervals = EFFECT_INTERVALS[effectType.toUpperCase()];
    
    if (!baseIntervals) return 5000;
    
    let interval = baseIntervals[performanceLevel.toUpperCase()] || baseIntervals.HIGH;
    
    // Adjust based on CRT system state
    if (crtState) {
      if (crtState.mode === 'failure') {
        interval *= 0.4; // More frequent effects during failure
      }
      
      // Background intensity influence - brighter backgrounds trigger more effects
      const backgroundFactor = 1 + (crtState.backgroundIntensity - 0.5) * 0.6;
      interval /= backgroundFactor;
    }
    
    return interval + Math.random() * interval;
  }

  function briefPhosphorGlow() {
    const elements = document.querySelectorAll('#glitch-title .tg-letter, #nav-list a');
    
    function triggerGlow() {
      if (!shouldRun()) {
        const retryTimer = setTimeout(triggerGlow, getInterval('glow'));
        EffectsCleanup.registerTimer(retryTimer);
        return;
      }
      
      updatePerformanceSettings();
      
      // Performance-based probability
      const chances = EFFECT_CHANCES.PHOSPHOR_GLOW;
      const chance = chances[performanceLevel.toUpperCase()] || chances.HIGH;
      
      if (Math.random() < chance) {
        const target = elements[Math.floor(Math.random() * elements.length)];
        target.classList.add('phosphor-glow');
        
        const duration = performanceLevel === 'low' ? 100 : 300;
        const glowTimer = setTimeout(() => target.classList.remove('phosphor-glow'), duration);
        EffectsCleanup.registerTimer(glowTimer);
      }
      
      const nextGlow = setTimeout(triggerGlow, getInterval('glow'));
      EffectsCleanup.registerTimer(nextGlow);
    }
    
    const initialDelay = setTimeout(triggerGlow, 30000);
    EffectsCleanup.registerTimer(initialDelay);
  }

  // Coordinated retrace sweep that responds to system state
  function coordinatedRetraceSweep() {
    if (!shouldRun()) return;
    
    updatePerformanceSettings();
    const crtState = window.CRTTemporalState;
    
    // Base chance influenced by system state
    let chance = EFFECT_CHANCES.RETRACE_BASE;
    if (crtState) {
      if (crtState.mode === 'failure') chance *= 3;
      if (crtState.cascadeLevel > 0) chance *= (1 + crtState.cascadeLevel);
      
      // Background brightness influence
      chance *= (0.5 + crtState.backgroundIntensity);
    }
    
    if (Math.random() < chance) {
      const retrace = document.getElementById('crtRetrace');
      if (retrace) {
        retrace.classList.remove('active');
        void retrace.offsetWidth;
        retrace.classList.add('active');
        console.log('[Effects] Coordinated retrace triggered');
      }
    }
    
    const nextRetrace = setTimeout(coordinatedRetraceSweep, getInterval('retrace'));
    EffectsCleanup.registerTimer(nextRetrace);
  }

  function vhsTrackingErrors() {
    const elements = document.querySelectorAll('header, nav, footer');
    const trackingLine = document.getElementById('vhsTracking');
    
    function triggerTracking() {
      if (!shouldRun()) {
        const retryTimer = setTimeout(triggerTracking, getInterval('tracking'));
        EffectsCleanup.registerTimer(retryTimer);
        return;
      }
      
      updatePerformanceSettings();
      
      // Performance-based probability
      const chances = EFFECT_CHANCES.TRACKING_ERROR;
      const chance = chances[performanceLevel.toUpperCase()] || chances.HIGH;
      
      if (Math.random() < chance) {
        const target = elements[Math.floor(Math.random() * elements.length)];
        target.classList.add('horizontal-hold-error');
        
        const errorTimer = setTimeout(() => {
          target.classList.remove('horizontal-hold-error');
        }, 800);
        EffectsCleanup.registerTimer(errorTimer);
        
        // Tracking line only in normal mode
        if (performanceLevel !== 'low' && trackingLine && Math.random() < 0.3) {
          trackingLine.style.top = (Math.random() * 60 + 20) + '%';
          trackingLine.classList.add('active');
          
          const lineTimer = setTimeout(() => {
            trackingLine.classList.remove('active');
          }, 150);
          EffectsCleanup.registerTimer(lineTimer);
        }
      }
      
      const nextTracking = setTimeout(triggerTracking, getInterval('tracking'));
      EffectsCleanup.registerTimer(nextTracking);
    }
    
    const initialDelay = setTimeout(triggerTracking, 120000);
    EffectsCleanup.registerTimer(initialDelay);
  }
  
  function vhsDropouts() {
    const dropout = document.getElementById('vhsDropout');
    if (!dropout) {
      console.warn('[Effects] VHS dropout element not found');
      return;
    }
    
    function triggerDropout() {
      if (!shouldRun()) {
        const retryTimer = setTimeout(triggerDropout, 600000);
        EffectsCleanup.registerTimer(retryTimer);
        return;
      }
      
      updatePerformanceSettings();
      
      // Skip dropouts in performance mode
      if (performanceLevel === 'low') {
        const skipTimer = setTimeout(triggerDropout, 600000);
        EffectsCleanup.registerTimer(skipTimer);
        return;
      }
      
      if (Math.random() < EFFECT_CHANCES.VHS_DROPOUT) {
        // Physics: VHS dropouts appear as rectangular signal loss
        dropout.style.left = (Math.random() * 40 + 10) + '%';
        dropout.style.width = (Math.random() * 60 + 20) + '%';
        dropout.style.top = (Math.random() * 50 + 25) + '%';
        dropout.style.height = (Math.random() * 30 + 10) + '%';
        dropout.classList.add('active');
        
        const clearTimer = setTimeout(() => {
          dropout.classList.remove('active');
        }, 200);
        EffectsCleanup.registerTimer(clearTimer);
      }
      
      const nextDropout = setTimeout(triggerDropout, 600000 + Math.random() * 600000);
      EffectsCleanup.registerTimer(nextDropout);
    }
    
    const initialDelay = setTimeout(triggerDropout, 300000);
    EffectsCleanup.registerTimer(initialDelay);
  }

  function vhsHeadSwitchingNoise() {
    const headSwitch = document.getElementById('vhsHeadSwitch');
    if (!headSwitch) {
      console.warn('[Effects] VHS head switch element not found');
      return;
    }
    
    function triggerHeadSwitch() {
      if (!shouldRun()) {
        const retryTimer = setTimeout(triggerHeadSwitch, 5000);
        EffectsCleanup.registerTimer(retryTimer);
        return;
      }
      
      updatePerformanceSettings();
      
      // Skip in performance mode
      if (performanceLevel === 'low') {
        const skipTimer = setTimeout(triggerHeadSwitch, 10000);
        EffectsCleanup.registerTimer(skipTimer);
        return;
      }
      
      if (Math.random() < EFFECT_CHANCES.HEAD_SWITCH) {
        // Physics: VHS head switching creates horizontal lines at random positions
        headSwitch.style.top = (Math.random() * 80 + 10) + '%';
        headSwitch.classList.remove('active');
        void headSwitch.offsetWidth; // Force reflow
        headSwitch.classList.add('active');
        console.log('[Effects] VHS head switch triggered');
      }
      
      const nextSwitch = setTimeout(triggerHeadSwitch, 5000 + Math.random() * 10000);
      EffectsCleanup.registerTimer(nextSwitch);
    }
    
    const initialDelay = setTimeout(triggerHeadSwitch, 15000);
    EffectsCleanup.registerTimer(initialDelay);
  }

  // Enhanced continuous retrace with coordinated timing
  function subtleContinuousRetrace() {
    const retrace = document.getElementById('crtRetrace');
    if (!retrace) {
      console.warn('[Effects] CRT retrace element not found');
      return;
    }
    
    function triggerSubtleRetrace() {
      if (!shouldRun()) {
        const retryTimer = setTimeout(triggerSubtleRetrace, getInterval('retrace'));
        EffectsCleanup.registerTimer(retryTimer);
        return;
      }
      
      updatePerformanceSettings();
      
      // Skip in performance mode
      if (performanceLevel === 'low') {
        const skipTimer = setTimeout(triggerSubtleRetrace, 6000);
        EffectsCleanup.registerTimer(skipTimer);
        return;
      }
      
      const crtState = window.CRTTemporalState;
      let chance = EFFECT_CHANCES.RETRACE_BASE;
      
      // Enhance probability based on system state
      if (crtState) {
        if (crtState.mode === 'failure') chance *= 2;
        chance *= (0.8 + crtState.backgroundIntensity * 0.4);
      }
      
      if (Math.random() < chance) {
        retrace.classList.remove('active');
        void retrace.offsetWidth;
        retrace.classList.add('active');
        console.log('[Effects] Continuous retrace triggered');
      }
      
      const nextRetrace = setTimeout(triggerSubtleRetrace, getInterval('retrace'));
      EffectsCleanup.registerTimer(nextRetrace);
    }
    
    const initialDelay = setTimeout(triggerSubtleRetrace, 5000);
    EffectsCleanup.registerTimer(initialDelay);
  }
  
  // Listen for unified system events
  const cascadeHandler = (event) => {
    const { intensity, origin } = event.detail;
    
    console.log(`[Effects] Cascade received: ${origin} -> ${intensity}`);
    
    // Trigger multiple effects during cascade
    if (intensity > 0.3) {
      const retrace = document.getElementById('crtRetrace');
      if (retrace) {
        retrace.classList.remove('active');
        void retrace.offsetWidth;
        retrace.classList.add('active');
      }
    }
    
    if (intensity > 0.5) {
      const elements = document.querySelectorAll('header, nav');
      elements.forEach(el => {
        el.classList.add('horizontal-hold-error');
        const errorTimer = setTimeout(() => el.classList.remove('horizontal-hold-error'), 1300);
        EffectsCleanup.registerTimer(errorTimer);
      });
    }
    
    if (intensity > 0.7) {
      const headSwitch = document.getElementById('vhsHeadSwitch');
      if (headSwitch) {
        headSwitch.style.top = (Math.random() * 80 + 10) + '%';
        headSwitch.classList.remove('active');
        void headSwitch.offsetWidth;
        headSwitch.classList.add('active');
      }
    }
  };

  const frameRateHandler = (event) => {
    const { targetFPS } = event.detail;
    unifiedFrameRate = targetFPS;
    console.log(`[Effects] Frame rate updated: ${targetFPS}fps`);
  };

  // Register event listeners
  window.addEventListener('crtCascade', cascadeHandler);
  window.addEventListener('frameRateChange', frameRateHandler);

  // Initialize effects system with error handling
  window.addEventListener('DOMContentLoaded', () => {
    if (!shouldRun()) {
      console.log('[Effects] Motion paused or reduced - effects disabled');
      return;
    }
    
    updatePerformanceSettings();
    const delay = performanceLevel === 'low' ? 15000 : 8000;
    
    const initTimer = setTimeout(() => {
      try {
        briefPhosphorGlow();
        vhsTrackingErrors();
        
        if (performanceLevel !== 'low') {
          vhsDropouts();
          vhsHeadSwitchingNoise();
          subtleContinuousRetrace();
        }
        
        coordinatedRetraceSweep();
        console.log('[Effects] System initialized successfully');
      } catch (error) {
        console.error('[Effects] Initialization failed:', error);
      }
    }, delay);
    EffectsCleanup.registerTimer(initTimer);
  });

  // Enhanced cleanup on page unload
  const cleanupHandler = () => {
    try {
      EffectsCleanup.cleanupAll();
    } catch (error) {
      console.error('[Effects] Cleanup failed:', error);
    }
  };
  
  window.addEventListener('beforeunload', cleanupHandler);
  window.addEventListener('pagehide', cleanupHandler);
})();
