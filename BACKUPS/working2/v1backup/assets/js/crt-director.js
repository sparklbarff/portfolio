/*
 * CRT Effects Director System
 * Coordinates visual effects timing to prevent seizure-inducing animations
 * Physics: Simulates authentic CRT/VHS physical hardware limitations
 * Implementation: Event-based coordination with mandatory cooldowns
 * Performance: Centralized throttling, adaptive timing based on device capability
 */
(function() {
  "use strict";

  /* Effect coordination timing constants */
  const TIMING = {
    MINIMUM_COOLDOWN: 800,                /* Minimum ms between any intense effects */
    SYSTEM_COOLDOWNS: {                   /* System-specific cooldown periods (ms) */
      TITLE: 1200,
      NAV: 900,
      RETRACE: 8000,                      /* Significantly reduced from 2-4s */
      TRACKING: 5000,
      DROPOUT: 9000,
      SWEEP: 12000,                       /* Very long cooldown for VHS sweep */
      PHOSPHOR: 2000
    },
    INTENSITY_RECOVERY: 2500,             /* Recovery time after intense effects */
    STARTUP_DELAY: {                      /* Staggered startup delays */
      TITLE: 800,
      NAV: 1500,
      EFFECTS: 2500,
      BACKGROUND: 300
    },
    MAXIMUM_SIMULTANEOUS: 2               /* Maximum simultaneous effects */
  };

  /* System rate limiting - protect photosensitive users */
  const RATE_LIMITS = {
    HIGH_INTENSITY_COOLDOWN: 8000,        /* 8s between high-intensity effects */
    MEDIUM_INTENSITY_COOLDOWN: 3000,      /* 3s between medium-intensity effects */
    LOW_INTENSITY_COOLDOWN: 900           /* 900ms between subtle effects */
  };

  /* Available performance levels */
  const PERFORMANCE_LEVELS = {
    LOW: { 
      effectProbability: 0.4,             /* 60% reduction from baseline */
      cooldownMultiplier: 1.6,            /* 60% longer cooldowns */
      intensityMultiplier: 0.5            /* Half intensity */
    },
    MEDIUM: { 
      effectProbability: 0.7,             /* 30% reduction from baseline */
      cooldownMultiplier: 1.2,            /* 20% longer cooldowns */
      intensityMultiplier: 0.8            /* 80% intensity */
    },
    HIGH: { 
      effectProbability: 1.0,             /* Baseline probability */
      cooldownMultiplier: 1.0,            /* Baseline cooldown */
      intensityMultiplier: 1.0            /* Full intensity */
    }
  };

  /* Director state */
  const state = {
    activeEffects: new Set(),
    lastEffectTimes: new Map(),
    activeIntensity: 0,
    globalCooldown: false,
    performanceSettings: null,
    enabled: true
  };

  const CRTDirector = {
    /*
     * Initialize the director system
     */
    init() {
      this.updatePerformanceSettings();
      this.setupEventListeners();
      console.log('[Director] Initialized with performance level:', 
        state.performanceSettings ? state.performanceSettings.level : 'unknown');
      
      // Broadcast ready state to all systems
      window.dispatchEvent(new CustomEvent('directorReady'));
      return this;
    },

    /*
     * Update performance settings from the global monitor
     */
    updatePerformanceSettings() {
      const monitor = window.PerformanceMonitor;
      const level = monitor ? monitor.getPerformanceLevel() : 'high';
      
      state.performanceSettings = {
        level,
        ...PERFORMANCE_LEVELS[level.toUpperCase()]
      };
      
      return state.performanceSettings;
    },
    
    /*
     * Set up event listeners for system coordination
     */
    setupEventListeners() {
      // Listen for motion pause/resume
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'data-motion') {
            const isPaused = document.documentElement.dataset.motion === "paused";
            state.enabled = !isPaused;
          }
        });
      });
      
      observer.observe(document.documentElement, { attributes: true });
      
      // Listen for animation events from other systems
      window.addEventListener('effectStart', this.handleEffectStart.bind(this));
      window.addEventListener('effectEnd', this.handleEffectEnd.bind(this));
      
      // Handle global cascade events
      window.addEventListener('crtCascade', this.handleCascade.bind(this));
    },
    
    /*
     * Check if an effect can run based on timing and system state
     */
    canRunEffect(effectType, intensity = 0.5) {
      if (!state.enabled) return false;
      
      const settings = state.performanceSettings || PERFORMANCE_LEVELS.MEDIUM;
      
      // Apply performance-based probability reduction
      if (Math.random() > settings.effectProbability) return false;
      
      // Check if system is in global cooldown
      if (state.globalCooldown) return false;
      
      // Check system-specific cooldown
      const lastRunTime = state.lastEffectTimes.get(effectType) || 0;
      const cooldownTime = TIMING.SYSTEM_COOLDOWNS[effectType] || TIMING.MINIMUM_COOLDOWN;
      const adjustedCooldown = cooldownTime * settings.cooldownMultiplier;
      
      const timeSinceLastRun = Date.now() - lastRunTime;
      if (timeSinceLastRun < adjustedCooldown) return false;
      
      // Intensity-based rate limiting
      if (intensity > 0.7) {
        const highIntensityLastRun = state.lastEffectTimes.get('HIGH_INTENSITY') || 0;
        if (Date.now() - highIntensityLastRun < RATE_LIMITS.HIGH_INTENSITY_COOLDOWN) {
          return false;
        }
      } else if (intensity > 0.4) {
        const mediumIntensityLastRun = state.lastEffectTimes.get('MEDIUM_INTENSITY') || 0;
        if (Date.now() - mediumIntensityLastRun < RATE_LIMITS.MEDIUM_INTENSITY_COOLDOWN) {
          return false;
        }
      } else {
        const lowIntensityLastRun = state.lastEffectTimes.get('LOW_INTENSITY') || 0;
        if (Date.now() - lowIntensityLastRun < RATE_LIMITS.LOW_INTENSITY_COOLDOWN) {
          return false;
        }
      }
      
      // Check maximum simultaneous effects
      if (state.activeEffects.size >= TIMING.MAXIMUM_SIMULTANEOUS) return false;
      
      return true;
    },
    
    /*
     * Register the start of an effect
     */
    handleEffectStart(event) {
      const { effectType, intensity, source } = event.detail;
      
      // Record effect start
      state.activeEffects.add(effectType);
      state.lastEffectTimes.set(effectType, Date.now());
      
      // Record intensity tier
      if (intensity > 0.7) {
        state.lastEffectTimes.set('HIGH_INTENSITY', Date.now());
      } else if (intensity > 0.4) {
        state.lastEffectTimes.set('MEDIUM_INTENSITY', Date.now());
      } else {
        state.lastEffectTimes.set('LOW_INTENSITY', Date.now());
      }
      
      // Update cumulative intensity
      state.activeIntensity = Math.max(state.activeIntensity, intensity);
      
      console.log(`[Director] Effect started: ${effectType} (${intensity.toFixed(2)}) from ${source}`);
      
      // Trigger global cooldown for very intense effects
      if (intensity > 0.8) {
        this.triggerGlobalCooldown(TIMING.INTENSITY_RECOVERY);
      }
    },
    
    /*
     * Register the end of an effect
     */
    handleEffectEnd(event) {
      const { effectType } = event.detail;
      state.activeEffects.delete(effectType);
      
      // Recalculate active intensity based on remaining effects
      if (state.activeEffects.size === 0) {
        state.activeIntensity = 0;
      }
    },
    
    /*
     * Handle cascade events from any system
     */
    handleCascade(event) {
      const { intensity, origin } = event.detail;
      
      if (intensity > 0.7) {
        this.triggerGlobalCooldown(TIMING.INTENSITY_RECOVERY * 1.5);
      }
    },
    
    /*
     * Trigger a global cooldown period
     */
    triggerGlobalCooldown(duration) {
      state.globalCooldown = true;
      
      setTimeout(() => {
        state.globalCooldown = false;
      }, duration);
    },
    
    /*
     * Get startup delay for a specific system
     */
    getStartupDelay(system) {
      return TIMING.STARTUP_DELAY[system] || 1000;
    },
    
    /*
     * Calculate intensity factor based on performance settings
     */
    getIntensityFactor() {
      const settings = state.performanceSettings || PERFORMANCE_LEVELS.MEDIUM;
      return settings.intensityMultiplier;
    },
    
    /*
     * Register an effect request - returns true if allowed to run
     */
    requestEffect(effectType, intensity = 0.5, source = 'unknown') {
      if (!this.canRunEffect(effectType, intensity)) {
        return false;
      }
      
      // Apply intensity reduction based on performance level
      const adjustedIntensity = intensity * this.getIntensityFactor();
      
      // Broadcast effect start
      window.dispatchEvent(new CustomEvent('effectStart', {
        detail: { 
          effectType, 
          intensity: adjustedIntensity, 
          source 
        }
      }));
      
      return true;
    },
    
    /*
     * Complete an effect - notify the system
     */
    completeEffect(effectType, source = 'unknown') {
      window.dispatchEvent(new CustomEvent('effectEnd', {
        detail: { effectType, source }
      }));
    }
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CRTDirector.init());
  } else {
    CRTDirector.init();
  }
  
  // Expose director API
  window.CRTDirector = CRTDirector;
})();
