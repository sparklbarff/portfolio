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

  /* Effect timing constants - SIGNIFICANTLY INCREASED intervals */
  const EFFECT_INTERVALS = {
    GLOW: { LOW: 180000, MEDIUM: 120000, HIGH: 60000 },     /* Increased from 120k/75k/45k */
    TRACKING: { LOW: 900000, MEDIUM: 600000, HIGH: 360000 }, /* Increased from 600k/360k/240k */
    RETRACE: { LOW: 15000, MEDIUM: 10000, HIGH: 8000 }      /* Increased from 8k/4k/2k */
  };

  /* Effect probability constants - SIGNIFICANTLY REDUCED */
  const EFFECT_CHANCES = {
    PHOSPHOR_GLOW: { LOW: 0.0002, MEDIUM: 0.0005, HIGH: 0.001 },  /* Reduced from 0.0005/0.001/0.003 */
    TRACKING_ERROR: { LOW: 0.00005, MEDIUM: 0.0001, HIGH: 0.0005 }, /* Reduced from 0.0001/0.0005/0.002 */
    VHS_DROPOUT: 0.0001,                          /* Reduced from 0.0002 */
    HEAD_SWITCH: 0.0002,                          /* Reduced from 0.0005 */
    RETRACE_BASE: 0.003                           /* Reduced from 0.008 */
  };

  /* Effect durations - add explicit control */
  const EFFECT_DURATIONS = {
    PHOSPHOR_GLOW: 400,        /* Duration of phosphor glow effect */
    TRACKING_ERROR: 500,       /* Duration of tracking error effect */
    RETRACE_SWEEP: 1800,       /* Duration of retrace sweep effect */
    VHS_SWEEP: 2400,           /* Duration of VHS sweep effect */
    DROPOUT: 200,              /* Duration of dropout effect */
    HEAD_SWITCH: 300           /* Duration of head switch effect */
  };

  let performanceLevel = 'high';
  let animationFrameId = null;
  let unifiedFrameRate = 30;
  let directorAvailable = false;
  let lastEffectTime = {};

  /* Cleanup registry for effects system */
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
    
    if (!baseIntervals) return 10000; // Increased default
    
    let interval = baseIntervals[performanceLevel.toUpperCase()] || baseIntervals.HIGH;
    
    // Adjust based on CRT system state
    if (crtState) {
      if (crtState.mode === 'failure') {
        interval *= 0.6; // Reduced from 0.4 - less frequent during failure
      }
      
      // Background intensity influence - brighter backgrounds trigger more effects
      const backgroundFactor = 1 + (crtState.backgroundIntensity - 0.5) * 0.4; // Reduced from 0.6
      interval /= backgroundFactor;
    }
    
    // Add randomness to prevent synchronized effects
    return interval + Math.random() * (interval * 0.5);
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
      
      // Check with director if available
      if (directorAvailable && window.CRTDirector) {
        if (!window.CRTDirector.requestEffect('PHOSPHOR', 0.3, 'crt-effects')) {
          const nextGlow = setTimeout(triggerGlow, getInterval('glow'));
          EffectsCleanup.registerTimer(nextGlow);
          return;
        }
      } else if (Math.random() >= chance) {
        const nextGlow = setTimeout(triggerGlow, getInterval('glow'));
        EffectsCleanup.registerTimer(nextGlow);
        return;
      }
      
      // Apply to random target with reduced intensity
      const target = elements[Math.floor(Math.random() * elements.length)];
      target.classList.add('phosphor-glow');
      
      const duration = performanceLevel === 'low' ? 200 : EFFECT_DURATIONS.PHOSPHOR_GLOW;
      const glowTimer = setTimeout(() => {
        target.classList.remove('phosphor-glow');
        
        if (directorAvailable && window.CRTDirector) {
          window.CRTDirector.completeEffect('PHOSPHOR', 'crt-effects');
        }
      }, duration);
      EffectsCleanup.registerTimer(glowTimer);
      
      const nextGlow = setTimeout(triggerGlow, getInterval('glow'));
      EffectsCleanup.registerTimer(nextGlow);
    }
    
    // Longer initial delay
    const initialDelay = setTimeout(triggerGlow, 45000); // Increased from 30000
    EffectsCleanup.registerTimer(initialDelay);
  }

  // Coordinated retrace sweep that responds to system state
  function coordinatedRetraceSweep() {
    if (!shouldRun()) return;
    
    updatePerformanceSettings();
    
    // Check if we've run a sweep recently
    const now = Date.now();
    const lastSweepTime = lastEffectTime.RETRACE || 0;
    const minSweepInterval = EFFECT_INTERVALS.RETRACE[performanceLevel.toUpperCase()] || 8000;
    
    if (now - lastSweepTime < minSweepInterval) {
      const nextRetrace = setTimeout(coordinatedRetraceSweep, minSweepInterval - (now - lastSweepTime) + 1000);
      EffectsCleanup.registerTimer(nextRetrace);
      return;
    }
    
    // Check with director if available
    if (directorAvailable && window.CRTDirector) {
      if (!window.CRTDirector.requestEffect('RETRACE', 0.6, 'crt-effects')) {
        const nextRetrace = setTimeout(coordinatedRetraceSweep, getInterval('retrace'));
        EffectsCleanup.registerTimer(nextRetrace);
        return;
      }
    } else {
      // Base chance influenced by system state
      const crtState = window.CRTTemporalState;
      
      let chance = EFFECT_CHANCES.RETRACE_BASE;
      if (crtState) {
        if (crtState.mode === 'failure') chance *= 2; // Reduced from 3
        if (crtState.cascadeLevel > 0) chance *= (1 + crtState.cascadeLevel * 0.7); // Reduced from 1.0
        
        // Background brightness influence
        chance *= (0.5 + crtState.backgroundIntensity * 0.7); // Reduced factor
      }
      
      if (Math.random() >= chance) {
        const nextRetrace = setTimeout(coordinatedRetraceSweep, getInterval('retrace'));
        EffectsCleanup.registerTimer(nextRetrace);
        return;
      }
    }
    
    // Trigger retrace sweep with tracking
    const retrace = document.getElementById('crtRetrace');
    if (retrace) {
      retrace.classList.remove('active');
      void retrace.offsetWidth;
      retrace.classList.add('active');
      console.log('[Effects] Coordinated retrace triggered');
      
      lastEffectTime.RETRACE = now;
      
      // Complete after animation duration
      setTimeout(() => {
        if (directorAvailable && window.CRTDirector) {
          window.CRTDirector.completeEffect('RETRACE', 'crt-effects');
        }
      }, EFFECT_DURATIONS.RETRACE_SWEEP);
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
      
      // Check with director if available
      if (directorAvailable && window.CRTDirector) {
        if (!window.CRTDirector.requestEffect('TRACKING', 0.4, 'crt-effects')) {
          const nextTracking = setTimeout(triggerTracking, getInterval('tracking'));
          EffectsCleanup.registerTimer(nextTracking);
          return;
        }
      } else {
        // Performance-based probability
        const chances = EFFECT_CHANCES.TRACKING_ERROR;
        const chance = chances[performanceLevel.toUpperCase()] || chances.HIGH;
        
        if (Math.random() >= chance) {
          const nextTracking = setTimeout(triggerTracking, getInterval('tracking'));
          EffectsCleanup.registerTimer(nextTracking);
          return;
        }
      }
      
      // Apply to random target with limited duration
      const target = elements[Math.floor(Math.random() * elements.length)];
      target.classList.add('horizontal-hold-error');
      
      const errorTimer = setTimeout(() => {
        target.classList.remove('horizontal-hold-error');
      }, EFFECT_DURATIONS.TRACKING_ERROR);
      EffectsCleanup.registerTimer(errorTimer);
      
      // Tracking line only in normal mode with reduced chance
      if (performanceLevel !== 'low' && trackingLine && Math.random() < 0.2) { // Reduced from 0.3
        trackingLine.style.top = (Math.random() * 60 + 20) + '%';
        trackingLine.classList.add('active');
        
        const lineTimer = setTimeout(() => {
          trackingLine.classList.remove('active');
          
          if (directorAvailable && window.CRTDirector) {
            window.CRTDirector.completeEffect('TRACKING', 'crt-effects');
          }
        }, 150);
        EffectsCleanup.registerTimer(lineTimer);
      } else {
        if (directorAvailable && window.CRTDirector) {
          window.CRTDirector.completeEffect('TRACKING', 'crt-effects');
        }
      }
      
      const nextTracking = setTimeout(triggerTracking, getInterval('tracking'));
      EffectsCleanup.registerTimer(nextTracking);
    }
    
    // Longer initial delay
    const initialDelay = setTimeout(triggerTracking, 180000); // Increased from 120000
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
    
    // Only react to high-intensity cascades with 50% probability
    if (intensity > 0.7 && Math.random() < 0.5) {
      // Only trigger if director approves
      if (directorAvailable && window.CRTDirector) {
        if (!window.CRTDirector.requestEffect('CASCADE_RETRACE', intensity, 'crt-effects')) {
          return;
        }
      }
      
      const retrace = document.getElementById('crtRetrace');
      if (retrace) {
        retrace.classList.remove('active');
        void retrace.offsetWidth;
        retrace.classList.add('active');
        
        setTimeout(() => {
          if (directorAvailable && window.CRTDirector) {
            window.CRTDirector.completeEffect('CASCADE_RETRACE', 'crt-effects');
          }
        }, EFFECT_DURATIONS.RETRACE_SWEEP);
      }
    }
  };

  // Enhanced initialization with staggered startup
  function initializeEffects() {
    if (directorAvailable && window.CRTDirector) {
      // Get staggered startup delay from director
      const delay = window.CRTDirector.getStartupDelay('EFFECTS') || 2500;
      
      const initTimer = setTimeout(() => {
        try {
          // Start effect systems with staggered delays
          setTimeout(briefPhosphorGlow, 500);
          setTimeout(vhsTrackingErrors, 3000);
          
          if (performanceLevel !== 'low') {
            setTimeout(vhsDropouts, 5000);
            setTimeout(vhsHeadSwitchingNoise, 7000);
            setTimeout(subtleContinuousRetrace, 9000);
          }
          
          setTimeout(coordinatedRetraceSweep, 6000);
          console.log('[Effects] System initialized with director');
        } catch (error) {
          console.error('[Effects] Initialization failed:', error);
        }
      }, delay);
      EffectsCleanup.registerTimer(initTimer);
    } else {
      // Use longer fallback delay without director
      const delay = performanceLevel === 'low' ? 20000 : 12000; // Increased from 15000/8000
      
      const initTimer = setTimeout(() => {
        try {
          // Start effect systems with much longer staggered delays
          setTimeout(briefPhosphorGlow, 2000);
          setTimeout(vhsTrackingErrors, 6000);
          
          if (performanceLevel !== 'low') {
            setTimeout(vhsDropouts, 10000);
            setTimeout(vhsHeadSwitchingNoise, 15000);
            setTimeout(subtleContinuousRetrace, 20000);
          }
          
          setTimeout(coordinatedRetraceSweep, 12000);
          console.log('[Effects] System initialized with fallback timing');
        } catch (error) {
          console.error('[Effects] Initialization failed:', error);
        }
      }, delay);
      EffectsCleanup.registerTimer(initTimer);
    }
  }

  // Check for director availability
  function checkDirector() {
    if (window.CRTDirector) {
      directorAvailable = true;
      console.log('[Effects] Director system available');
      initializeEffects();
    } else {
      console.log('[Effects] Director not available, using fallback timing');
      initializeEffects();
    }
  }

  // Wait for director or start after timeout
  window.addEventListener('DOMContentLoaded', () => {
    if (!shouldRun()) {
      console.log('[Effects] Motion paused or reduced - effects disabled');
      return;
    }
    
    updatePerformanceSettings();
    
    window.addEventListener('directorReady', checkDirector);
    window.addEventListener('crtCascade', cascadeHandler);
    
    // Fallback if director doesn't initialize
    setTimeout(checkDirector, 2000);
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
