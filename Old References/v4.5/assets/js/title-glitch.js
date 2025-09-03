/*
 * CRT Title Glitch System
 * Simulates authentic CRT phosphor decay through DOM manipulation and CSS filters
 * Physics: Electron beam deflection by magnetic coils creates spatial distortion
 * Implements magnetic yoke distortion algorithms based on electron beam physics
 * Coordinates with nav-glitch.js and bg-loader.js through unified temporal state
 * Performance: Adaptive frame limiting (15/20/30fps), selective effect disabling
 */
"use strict";

(function() {
  const title = document.getElementById('glitch-title');
  if (!title) {
    console.warn('[Title] Element not found: glitch-title');
    return;
  }

  /* System constants - CRT physics simulation parameters */
  const CRT_CONSTANTS = {
    MAGNETIC_FIELD_STRENGTH: 0.35,      /* Yoke deflection coil intensity */
    CONVERGENCE_ERROR_BASE: 1.2,        /* RGB gun misalignment factor */
    PHOSPHOR_TRAIL_LENGTH: 8,           /* Persistence frame count */
    THERMAL_STRESS_MAX: 0.08,           /* Maximum thermal drift (-0.08 to 0.08) */
    MAGNETIC_WEAR_MAX: 0.05,            /* Maximum magnetic degradation (0-0.05) */
    POWER_SUPPLY_WEAR_MAX: 0.04         /* Maximum power instability (0-0.04) */
  };

  /* Effect intensity thresholds */
  const INTENSITY_THRESHOLDS = {
    RGB_SEPARATION: 0.3,                /* Minimum for color channel separation */
    CHARACTER_REPLACE: 0.4,             /* Minimum for glyph corruption */
    BRIGHTNESS_MOD: 0.2,                /* Minimum for luminance effects */
    PHOSPHOR_TRAIL: 0.5,                /* Minimum for persistence trails */
    CASCADE_TRIGGER: 0.6                /* Minimum for system cascade */
  };

  /* Performance frame rates per level */
  const FRAME_RATES = { LOW: 15, MEDIUM: 20, HIGH: 30 };

  /* Glitch timing constants */
  const GLITCH_TIMINGS = {
    RESTORE_DELAY: 60,                  /* Character restore time (ms) */
    FLICKER_INTERVAL: 16,               /* 60fps interlace flicker */
    CASCADE_DELAY_BASE: 5,              /* Base cascade propagation delay */
    WEAR_ACCUMULATION: 0.0001           /* Per-frame wear increment */
  };

  /* Performance and state management */
  let performanceMode = false;
  let performanceLevel = 'high';
  let lastFrameTime = 0;
  let targetFPS = FRAME_RATES.HIGH;

  /* CRT hardware simulation state */
  let magneticPhase = 0;                /* Deflection coil phase accumulator */
  const wearPatterns = {                /* Hardware degradation simulation */
    magneticWear: 0,                    /* Magnetic field instability (0-0.05) */
    thermalStress: 0,                   /* Thermal cycling stress (-0.08 to 0.08) */
    powerSupplyWear: 0,                 /* Power regulation degradation (0-0.04) */
    phosphorWear: new Map(),            /* Per-pixel burn-in tracking */
    convergenceWear: 0                  /* RGB alignment drift */
  };

  /* Glitch character set for authentic corruption */
  const glitchChars = '!@#$%^&*()_+{}|:<>?-=[]\\;\',./`~ĂĐĚĽŇŘŦŽ¡¿©®±×÷';

  /* Letter state management */
  const letters = [];
  const originalText = title.textContent;

  /* Initialize letter DOM structure */
  function initializeLetters() {
    title.innerHTML = '';
    
    for (let i = 0; i < originalText.length; i++) {
      const char = originalText[i];
      const span = document.createElement('span');
      span.className = 'tg-letter';
      span.textContent = char;
      span.style.display = 'inline-block';
      
      letters.push({
        element: span,
        originalChar: char,
        currentChar: char,
        normalizedX: i / (originalText.length - 1),
        glitchState: {
          active: false,
          intensity: 0,
          lastGlitch: 0,
          phosphorTrail: [],
          convergenceError: 0
        }
      });
      
      title.appendChild(span);
    }
    
    console.log(`[Title] Initialized ${letters.length} letters`);
  }

  /* UNIFIED CRT TEMPORAL STATE - Central coordination system */
  window.CRTTemporalState = {
    mode: "stable",                     /* "stable", "failure", "cascade" */
    thermalLevel: 0,                    /* 0-1 thermal stress indicator */
    backgroundIntensity: 0.5,           /* 0-1 background brightness level */
    cascadeLevel: 0,                    /* 0-1 cascade failure intensity */
    persistentProblems: new Set(),      /* Set of ongoing issues */
    targetFPS: FRAME_RATES.HIGH,        /* Unified frame rate target */
    performanceMode: false,             /* Global performance reduction flag */
    registeredSystems: new Set(),       /* Systems using this coordination */
    
    registerSystem(name) {
      this.registeredSystems.add(name);
      console.log(`[CRTState] System registered: ${name}`);
    },
    
    updateBackgroundIntensity(intensity) {
      this.backgroundIntensity = Math.max(0, Math.min(1, intensity));
      
      // Update CSS custom property for real-time effects
      document.documentElement.style.setProperty('--crt-background-intensity', this.backgroundIntensity);
    },
    
    triggerUnifiedCascade(intensity, origin) {
      this.cascadeLevel = Math.max(this.cascadeLevel, intensity);
      this.mode = intensity > 0.7 ? "failure" : "cascade";
      
      // Broadcast cascade to all systems
      window.dispatchEvent(new CustomEvent('crtCascade', {
        detail: { intensity, origin, mode: this.mode }
      }));
      
      console.log(`[CRTState] Unified cascade triggered: ${origin} -> ${intensity}`);
      
      // Auto-recovery after cascade
      setTimeout(() => {
        this.cascadeLevel *= 0.7;
        if (this.cascadeLevel < 0.1) {
          this.mode = "stable";
          this.cascadeLevel = 0;
        }
      }, 2000 + Math.random() * 3000);
    }
  };

  /* Cleanup registry for title system */
  const TitleCleanup = {
    timers: new Set(),
    elements: new Set(),
    listeners: new Map(),
    
    registerTimer(id) { 
      this.timers.add(id);
    },
    
    registerElement(el) { 
      this.elements.add(el);
    },
    
    registerListener(target, event, handler) {
      const key = `${target.constructor.name}-${event}`;
      if (!this.listeners.has(key)) this.listeners.set(key, []);
      this.listeners.get(key).push({ target, handler });
    },
    
    cleanupAll() {
      this.timers.forEach(id => clearTimeout(id));
      this.timers.clear();
      this.elements.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      this.elements.clear();
      this.listeners.forEach((handlers, key) => {
        handlers.forEach(({ target, handler }) => {
          const eventType = key.split('-')[1];
          target.removeEventListener(eventType, handler);
        });
      });
      this.listeners.clear();
      console.log('[Title] Cleanup completed');
    }
  };

  /* Performance settings update */
  function updatePerformanceSettings() {
    const monitor = window.PerformanceMonitor;
    if (monitor) {
      performanceLevel = monitor.getPerformanceLevel();
      performanceMode = monitor.isLowEndDevice();
      targetFPS = FRAME_RATES[performanceLevel.toUpperCase()] || FRAME_RATES.HIGH;
    } else {
      performanceMode = document.documentElement.classList.contains('perf-reduce');
      targetFPS = performanceMode ? FRAME_RATES.LOW : FRAME_RATES.HIGH;
    }
    
    // Update unified state
    window.CRTTemporalState.targetFPS = targetFPS;
    window.CRTTemporalState.performanceMode = performanceMode;
  }

  /* CRT wear pattern simulation */
  function updateWearPatterns() {
    wearPatterns.magneticWear += Math.random() * GLITCH_TIMINGS.WEAR_ACCUMULATION;
    wearPatterns.thermalStress += (Math.random() - 0.5) * 0.0002;
    wearPatterns.powerSupplyWear += Math.random() * 0.00008;
    
    // Cap wear values at realistic limits
    wearPatterns.magneticWear = Math.min(wearPatterns.magneticWear, CRT_CONSTANTS.MAGNETIC_WEAR_MAX);
    wearPatterns.thermalStress = Math.max(-CRT_CONSTANTS.THERMAL_STRESS_MAX, 
      Math.min(wearPatterns.thermalStress, CRT_CONSTANTS.THERMAL_STRESS_MAX));
    wearPatterns.powerSupplyWear = Math.min(wearPatterns.powerSupplyWear, CRT_CONSTANTS.POWER_SUPPLY_WEAR_MAX);
    
    // Update global thermal level
    window.CRTTemporalState.thermalLevel = Math.abs(wearPatterns.thermalStress) / CRT_CONSTANTS.THERMAL_STRESS_MAX;
  }

  /* Magnetic field distortion calculation */
  function calculateMagneticDistortion(letter, globalIntensity) {
    const localPhase = magneticPhase + (letter.normalizedX * Math.PI);
    const wearMultiplier = 1 + wearPatterns.magneticWear * 100;
    const fieldIntensity = globalIntensity * CRT_CONSTANTS.MAGNETIC_FIELD_STRENGTH * wearMultiplier;
    
    const primaryField = Math.sin(localPhase) * fieldIntensity;
    const secondaryField = Math.cos(localPhase * 1.3 + wearPatterns.thermalStress * 10) * fieldIntensity * 0.7;
    const thermalDrift = Math.sin(localPhase * 0.3) * fieldIntensity * Math.abs(wearPatterns.thermalStress) * 6;
    
    const xDisplace = (primaryField + secondaryField + thermalDrift) * 30;
    const yDisplace = (secondaryField * 0.8 + thermalDrift) * 20;
    const rotation = (primaryField * 0.3 + thermalDrift) * 15;
    
    return { xDisplace, yDisplace, rotation };
  }

  /* Apply comprehensive glitch effects to a letter */
  function applyOptimizedGlitch(letter, baseIntensity) {
    const crtState = window.CRTTemporalState;
    let effectiveIntensity = baseIntensity;
    
    /* System state modulation */
    if (crtState.mode === "stable") {
      effectiveIntensity *= 0.7 - crtState.thermalLevel * 0.3;
    } else {
      effectiveIntensity *= 1.3 + crtState.thermalLevel * 0.7;
    }

    /* Magnetic distortion applied only to individual letter element */
    const distortion = calculateMagneticDistortion(letter, effectiveIntensity);
    letter.element.style.transform = 
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;
    
    /* Ensure transform isolation - prevents affecting parent containers */
    letter.element.style.position = 'relative';
    letter.element.style.display = 'inline-block';
    letter.element.style.zIndex = '1';
    
    // RGB convergence error effects
    if (effectiveIntensity > INTENSITY_THRESHOLDS.RGB_SEPARATION) {
      const convergenceError = CRT_CONSTANTS.CONVERGENCE_ERROR_BASE * (1.5 + letter.normalizedX * 0.8);
      const redOffset = convergenceError * (1 + wearPatterns.convergenceWear);
      const blueOffset = convergenceError * (1 + wearPatterns.convergenceWear * 0.8);
      
      const shadowLayers = [
        `${redOffset}px 0 rgba(255, 64, 32, ${effectiveIntensity * 0.8})`,
        `${-blueOffset}px 0 rgba(64, 128, 255, ${effectiveIntensity * 0.8})`,
        `0 0 ${effectiveIntensity * 15}px rgba(232, 227, 216, ${effectiveIntensity * 0.6})`,
        `0 0 ${effectiveIntensity * 30}px rgba(0, 255, 200, ${effectiveIntensity * 0.3})`
      ];
      
      letter.element.style.textShadow = shadowLayers.join(', ');
    }
    
    // Character replacement with wear
    if (effectiveIntensity > INTENSITY_THRESHOLDS.CHARACTER_REPLACE) {
      const letterWear = wearPatterns.phosphorWear.get(letters.indexOf(letter)) || 0;
      const replaceChance = 0.6 + letterWear * 3;
      
      if (Math.random() < replaceChance) {
        const glitchChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        letter.element.textContent = glitchChar;
        letter.currentChar = glitchChar;
        
        const restoreTimer = setTimeout(() => {
          if (letter.element.textContent === glitchChar) {
            letter.element.textContent = letter.originalChar;
            letter.currentChar = letter.originalChar;
          }
        }, GLITCH_TIMINGS.RESTORE_DELAY + Math.random() * 40);
        TitleCleanup.registerTimer(restoreTimer);
      }
    }
    
    // Brightness modulation
    if (effectiveIntensity > INTENSITY_THRESHOLDS.BRIGHTNESS_MOD) {
      const brightness = 0.7 + (effectiveIntensity * 0.6);
      const contrast = 1 + (effectiveIntensity * 0.4);
      letter.element.style.filter = `brightness(${brightness}) contrast(${contrast})`;
    }
    
    // Phosphor effects
    if (effectiveIntensity > INTENSITY_THRESHOLDS.PHOSPHOR_TRAIL) {
      letter.element.classList.add('phosphor-glow');
      
      const glowTimer = setTimeout(() => {
        letter.element.classList.remove('phosphor-glow');
      }, 200 + Math.random() * 150);
      TitleCleanup.registerTimer(glowTimer);
      
      // Track phosphor wear
      const letterIndex = letters.indexOf(letter);
      const currentWear = wearPatterns.phosphorWear.get(letterIndex) || 0;
      wearPatterns.phosphorWear.set(letterIndex, currentWear + effectiveIntensity * 0.001);
    }
    
    // Trigger cascade for extreme intensity
    if (effectiveIntensity > INTENSITY_THRESHOLDS.CASCADE_TRIGGER) {
      crtState.triggerUnifiedCascade(effectiveIntensity, 'title');
    }
  }

  /* Main glitch system loop */
  function runOptimizedGlitchSystem(currentTime) {
    updatePerformanceSettings();
    
    // Handle motion pause
    if (document.documentElement.dataset.motion === "paused") {
      letters.forEach(letter => {
        letter.element.style.transform = '';
        letter.element.style.filter = '';
        letter.element.style.textShadow = '';
        letter.element.textContent = letter.originalChar;
        letter.glitchState.active = false;
      });
      
      requestAnimationFrame(runOptimizedGlitchSystem);
      return;
    }
    
    // Frame rate limiting
    const frameInterval = 1000 / targetFPS;
    if (currentTime - lastFrameTime < frameInterval) {
      requestAnimationFrame(runOptimizedGlitchSystem);
      return;
    }
    
    lastFrameTime = currentTime;
    
    // Skip expensive operations on low-end devices
    if (performanceLevel !== 'low') {
      updateWearPatterns();
      magneticPhase += performanceMode ? 0.025 : 0.045;
    }
    
    // Organic base intensity with system state influence
    const crtState = window.CRTTemporalState;
    const systemWear = Math.min(wearPatterns.magneticWear * 6, 0.5);
    const isStrongGlitch = Math.random() < 0.3;
    
    let baseIntensity = isStrongGlitch ? 
      (0.6 + Math.random() * 0.4) : 
      (Math.random() * 0.4 + systemWear);
    
    // System state modulation
    if (crtState.mode === "stable") {
      baseIntensity *= 0.8 - crtState.thermalLevel * 0.3;
    } else {
      baseIntensity *= 1.2 + crtState.thermalLevel * 0.6;
    }
    
    // Apply glitches to letters
    const maxGlitches = performanceMode ? 2 : 4;
    let activeGlitches = 0;
    
    letters.forEach(letter => {
      const timeSinceLastGlitch = currentTime - letter.glitchState.lastGlitch;
      const letterWear = wearPatterns.phosphorWear.get(letters.indexOf(letter)) || 0;
      
      const organicGlitchChance = 0.15 + 
        letterWear * 0.2 + 
        Math.abs(wearPatterns.thermalStress) * 0.1 +
        wearPatterns.magneticWear * 0.15;
      
      const shouldGlitch = Math.random() < organicGlitchChance && 
                          activeGlitches < maxGlitches &&
                          timeSinceLastGlitch > (100 - letterWear * 80);
      
      if (shouldGlitch) {
        const localIntensity = baseIntensity * (0.7 + Math.random() * 0.6);
        applyOptimizedGlitch(letter, localIntensity);
        letter.glitchState.active = true;
        letter.glitchState.intensity = localIntensity;
        letter.glitchState.lastGlitch = currentTime;
        activeGlitches++;
      } else if (letter.glitchState.active) {
        letter.glitchState.intensity *= 0.85;
        if (letter.glitchState.intensity < 0.05) {
          letter.element.style.transform = '';
          letter.element.style.filter = '';
          letter.element.style.textShadow = '';
        }
      }
    });
    
    requestAnimationFrame(runOptimizedGlitchSystem);
  }

  // Initialize and start the system
  initializeLetters();
  window.CRTTemporalState.registerSystem('title');
  
  // Cleanup on page unload
  const cleanupHandler = () => TitleCleanup.cleanupAll();
  window.addEventListener('beforeunload', cleanupHandler);
  window.addEventListener('pagehide', cleanupHandler);
  TitleCleanup.registerListener(window, 'beforeunload', cleanupHandler);
  TitleCleanup.registerListener(window, 'pagehide', cleanupHandler);
  
  // Start with performance-aware delay
  const startDelay = performanceMode ? 800 : 500;
  const initTimer = setTimeout(() => {
    requestAnimationFrame(runOptimizedGlitchSystem);
    console.log('[Title] CRT glitch system started');
  }, startDelay);
  TitleCleanup.registerTimer(initTimer);

})();