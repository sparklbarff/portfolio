/*
 * CRT Configuration System
 * Centralized constants for all CRT/VHS simulation effects
 * Physics: Parameter ranges based on authentic CRT monitor specifications
 * Implementation: Grouped constants with performance-aware adjustments
 */
(function() {
  "use strict";

  /* Early initialization for immediate access */
  window.CRTConfig = {};

  /* System Timing Constants */
  const TIMING = {
    /* Effect cooldown periods (ms) */
    MINIMUM_COOLDOWN: 800,
    SYSTEM_COOLDOWNS: {
      TITLE: 1200,
      NAV: 900,
      RETRACE: 8000,
      TRACKING: 5000,
      DROPOUT: 9000,
      SWEEP: 12000,
      PHOSPHOR: 2000,
      CASCADE_RETRACE: 6000,
      BACKGROUND: 10000
    },
    
    /* Recovery timing */
    INTENSITY_RECOVERY: 2500,
    CASCADE_RECOVERY: 4000,
    
    /* System startup delays */
    STARTUP_DELAY: {
      TITLE: 800,
      NAV: 1500,
      EFFECTS: 2500,
      BACKGROUND: 300,
      SWEEP: 1200,
      AUDIO: 2000
    },
    
    /* Animation durations */
    DURATIONS: {
      PHOSPHOR_GLOW: 400,
      TRACKING_ERROR: 500,
      RETRACE_SWEEP: 1800,
      VHS_SWEEP: 2400,
      DROPOUT: 200,
      HEAD_SWITCH: 300,
      FRAGMENT: 700,
      BLOOM: 350,
      DIMENSION_SHIFT: 200,
      CHARACTER_RESTORE: 120
    },
    
    /* Intervals */
    INTERVALS: {
      FLICKER: 33,
      BACKGROUND_CYCLE: 20000,
      AUTONOMOUS_SWEEP_MIN: 45000,
      AUTONOMOUS_SWEEP_MAX: 90000
    }
  };

  /* Rate Limiting Constants */
  const RATE_LIMITS = {
    HIGH_INTENSITY_COOLDOWN: 8000,
    MEDIUM_INTENSITY_COOLDOWN: 3000,
    LOW_INTENSITY_COOLDOWN: 900,
    MAXIMUM_SIMULTANEOUS: 2
  };

  /* Performance Levels */
  const PERFORMANCE_LEVELS = {
    LOW: {
      effectProbability: 0.4,
      cooldownMultiplier: 1.6,
      intensityMultiplier: 0.5,
      animationMultiplier: 3,
      maxSimultaneousGlitches: 2,
      useSimplifiedEffects: true
    },
    MEDIUM: {
      effectProbability: 0.7,
      cooldownMultiplier: 1.2,
      intensityMultiplier: 0.8,
      animationMultiplier: 1.5,
      maxSimultaneousGlitches: 4,
      useSimplifiedEffects: false
    },
    HIGH: {
      effectProbability: 1.0,
      cooldownMultiplier: 1.0,
      intensityMultiplier: 1.0,
      animationMultiplier: 1,
      maxSimultaneousGlitches: 8,
      useSimplifiedEffects: false
    }
  };

  /* Frame Rates by Performance Level */
  const FRAME_RATES = {
    LOW: 12,
    MEDIUM: 15,
    HIGH: 20
  };

  /* Effect Probability Tables */
  const EFFECT_PROBABILITIES = {
    /* Title system glitch probabilities */
    TITLE: {
      BASE_GLITCH_CHANCE: 0.1,
      CHARACTER_REPLACE_CHANCE: 0.45,
      PHOSPHOR_BLOOM_CHANCE: 0.3,
      FRAGMENT_CHANCE: 0.25,
      CASCADE_CHANCE: 0.5
    },
    
    /* Navigation system glitch probabilities */
    NAV: {
      BASE_GLITCH_CHANCE: 0.18,
      TRACKING_ERROR_CHANCE: 0.0002,
      CHARACTER_REPLACE_CHANCE: 0.8,
      COLOR_BLEED_CHANCE: 0.3,
      DROPOUT_CHANCE: 0.2,
      INTERLACE_CHANCE: 0.4
    },
    
    /* General effect probabilities */
    EFFECTS: {
      PHOSPHOR_GLOW: { LOW: 0.0002, MEDIUM: 0.0005, HIGH: 0.001 },
      TRACKING_ERROR: { LOW: 0.00005, MEDIUM: 0.0001, HIGH: 0.0005 },
      VHS_DROPOUT: 0.0001,
      HEAD_SWITCH: 0.0002,
      RETRACE_BASE: 0.003
    },
    
    /* Background effect probabilities */
    BACKGROUND: {
      SWEEP_CHANCES: {
        LOW: { VHS: 0.2, RETRACE: 0.1, TRACKING: 0.05, HEAD: 0.0 },
        MEDIUM: { VHS: 0.4, RETRACE: 0.5, TRACKING: 0.1, HEAD: 0.05 },
        HIGH: { VHS: 0.6, RETRACE: 0.8, TRACKING: 0.2, HEAD: 0.15 }
      }
    }
  };

  /* Effect Intensity Thresholds */
  const INTENSITY_THRESHOLDS = {
    /* Title effect thresholds */
    TITLE: {
      RGB_SEPARATION: 0.4,
      CHARACTER_REPLACE: 0.5,
      BRIGHTNESS_MOD: 0.3,
      PHOSPHOR_TRAIL: 0.6,
      CASCADE_TRIGGER: 0.7,
      Z_MOVEMENT: 0.6,
      DECOMPOSITION: 0.8
    },
    
    /* Navigation effect thresholds */
    NAV: {
      RGB_SEPARATION: 0.3,
      CHARACTER_REPLACE: 0.4,
      BRIGHTNESS_MOD: 0.2,
      CASCADE_TRIGGER: 0.6,
      MAGNETIC_ATTRACTION: 0.1,
      TRACKING_ERROR: 0.4,
      DROPOUT_MIN: 0.7
    }
  };

  /* CRT Physics Parameters */
  const PHYSICS = {
    /* Title physics parameters */
    TITLE: {
      MAGNETIC_FIELD_STRENGTH: 0.25,
      CONVERGENCE_ERROR_BASE: 0.9,
      PHOSPHOR_TRAIL_LENGTH: 8,
      THERMAL_STRESS_MAX: 0.08,
      MAGNETIC_WEAR_MAX: 0.05,
      POWER_SUPPLY_WEAR_MAX: 0.04,
      PERSPECTIVE_MAX: 25,
      FRAGMENT_THRESHOLD: 0.8,
      COLOR_TEMP_MIN: 6500,
      COLOR_TEMP_MAX: 9300
    },
    
    /* Navigation physics parameters */
    NAV: {
      MAGNETIC_FIELD_STRENGTH: 0.4,
      CONVERGENCE_ERROR_BASE: 1.5,
      COLOR_BLEED_RANGE: 2,
      CURSOR_INFLUENCE_RADIUS: 150,
      CURSOR_STRENGTH: 0.25,
      MAGNETIC_DROPOUTS: 0.2,
      TRACKING_ERROR_AMPLITUDE: 4,
      ELECTRON_FOCUS_SPEED: 0.15,
      AUDIO_REACTIVITY: 0.04
    },
    
    /* Background system parameters */
    BACKGROUND: {
      SAMPLE_SIZE: 100,
      PRELOAD_COUNTS: { LOW: 1, MEDIUM: 2, HIGH: 3 }
    }
  };

  /* Wear Simulation Parameters */
  const WEAR_RATES = {
    MAGNETIC: 0.00005,
    THERMAL: 0.0001,
    POWER: 0.00004,
    CONVERGENCE: 0.00003,
    TRACKING: 0.00005,
    PHOSPHOR: 0.00006,
    SIGNAL: 0.00002
  };

  /* Glitch Character Sets */
  const GLITCH_SETS = {
    DEFAULT: '!@#$%^&*()_+{}|:<>?-=[]\\;\',./`~ĂĐĚĽŇŘŦŽ¡¿©®±×÷',
    EXTENDED: '!@#$%^&*()_+{}|:<>?-=[]\\;\',./`~ĂĐĚĽŇŘŦŽ¡¿©®±×÷¥€£¢§µ¶°•○●□■♦♥♠♣←↑→↓↔↕↖↗↘↙⌂¤ÆæØøÞþÐðßÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ',
    MINIMAL: '!@#$%^&*()_+{}|:<>?-=[]\\;\',./`~'
  };

  /* Combine all configuration */
  const CRTConfig = {
    TIMING,
    RATE_LIMITS,
    PERFORMANCE_LEVELS,
    FRAME_RATES,
    EFFECT_PROBABILITIES,
    INTENSITY_THRESHOLDS,
    PHYSICS,
    WEAR_RATES,
    GLITCH_SETS,
    
    /* Helper methods */
    getGlitchCharacters(type = 'DEFAULT') {
      return GLITCH_SETS[type] || GLITCH_SETS.DEFAULT;
    },
    
    getSystemCooldown(system) {
      return TIMING.SYSTEM_COOLDOWNS[system] || TIMING.MINIMUM_COOLDOWN;
    },
    
    getEffectDuration(effect) {
      return TIMING.DURATIONS[effect] || 500;
    },
    
    getStartupDelay(system) {
      return TIMING.STARTUP_DELAY[system] || 1000;
    },
    
    getFrameRate(level) {
      return FRAME_RATES[level.toUpperCase()] || FRAME_RATES.HIGH;
    },
    
    getPerformanceSettings(level) {
      return PERFORMANCE_LEVELS[level.toUpperCase()] || PERFORMANCE_LEVELS.HIGH;
    },
    
    getThreshold(system, effect) {
      return INTENSITY_THRESHOLDS[system]?.[effect] || 0.5;
    },
    
    getPhysicsParameter(system, parameter) {
      return PHYSICS[system]?.[parameter] || null;
    }
  };

  // Assign API to global reference
  window.CRTConfig = CRTConfig;
})();
