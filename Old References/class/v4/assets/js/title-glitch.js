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

  // System constants - CRT physics simulation parameters
  const CRT_CONSTANTS = {
    MAGNETIC_FIELD_STRENGTH: 0.35,      // Yoke deflection coil intensity
    CONVERGENCE_ERROR_BASE: 1.2,        // RGB gun misalignment factor
    PHOSPHOR_TRAIL_LENGTH: 8,           // Persistence frame count
    THERMAL_STRESS_MAX: 0.08,           // Maximum thermal drift (-0.08 to 0.08)
    MAGNETIC_WEAR_MAX: 0.05,            // Maximum magnetic degradation (0-0.05)
    POWER_SUPPLY_WEAR_MAX: 0.04         // Maximum power instability (0-0.04)
  };

  // Effect intensity thresholds
  const INTENSITY_THRESHOLDS = {
    RGB_SEPARATION: 0.3,                // Minimum for color channel separation
    CHARACTER_REPLACE: 0.4,             // Minimum for glyph corruption
    BRIGHTNESS_MOD: 0.2,                // Minimum for luminance effects
    PHOSPHOR_TRAIL: 0.5,                // Minimum for persistence trails
    CASCADE_TRIGGER: 0.6                // Minimum for system cascade
  };

  // Performance frame rates per level
  const FRAME_RATES = { LOW: 15, MEDIUM: 20, HIGH: 30 };

  // Glitch timing constants
  const GLITCH_TIMINGS = {
    RESTORE_DELAY: 60,                  // Character restore time (ms)
    FLICKER_INTERVAL: 16,               // 60fps interlace flicker
    CASCADE_DELAY_BASE: 5,              // Base cascade propagation delay
    WEAR_ACCUMULATION: 0.0001           // Per-frame wear increment
  };

  // Performance and state management
  let performanceMode = false;
  let performanceLevel = 'high';
  let lastFrameTime = 0;
  let targetFPS = FRAME_RATES.HIGH;

  // CRT hardware simulation state
  let magneticPhase = 0;                // Deflection coil phase accumulator
  const wearPatterns = {                // Hardware degradation simulation
    magneticWear: 0,                    // Magnetic field instability (0-0.05)
    thermalStress: 0,                   // Thermal cycling stress (-0.08 to 0.08)
    powerSupplyWear: 0,                 // Power regulation degradation (0-0.04)
    phosphorWear: new Map(),            // Per-pixel burn-in tracking
    convergenceWear: 0                  // RGB alignment drift
  };

  // Cleanup registry for memory management
  const SystemCleanup = {
    timers: new Set(),
    elements: new Set(),
    listeners: new Map(),
    
    registerTimer(id) { 
      this.timers.add(id);
      console.log('[Title] Registered timer for cleanup');
    },
    
    registerElement(el) { 
      this.elements.add(el);
      console.log('[Title] Registered element for cleanup');
    },
    
    registerListener(target, event, handler) {
      const key = `${target.constructor.name}-${event}`;
      if (!this.listeners.has(key)) this.listeners.set(key, []);
      this.listeners.get(key).push({ target, handler });
      console.log('[Title] Registered event listener for cleanup');
    },
    
    cleanupAll() {
      // Clear timers
      this.timers.forEach(id => clearTimeout(id));
      this.timers.clear();
      
      // Remove DOM elements
      this.elements.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      this.elements.clear();
      
      // Remove event listeners
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

  function updatePerformanceSettings() {
    const monitor = window.PerformanceMonitor;
    if (monitor) {
      performanceLevel = monitor.getPerformanceLevel();
      performanceMode = monitor.isLowEndDevice();
      console.log(`[Title] Performance level: ${performanceLevel}`);
    } else {
      performanceMode = document.documentElement.classList.contains('perf-reduce');
    }
    
    // Adjust settings based on performance level
    targetFPS = FRAME_RATES[performanceLevel.toUpperCase()] || FRAME_RATES.HIGH;
    
    switch (performanceLevel) {
      case 'low':
        settings.glitchChance = 0.05;
        settings.strongGlitchChance = 0.02;
        break;
      case 'medium':
        settings.glitchChance = 0.08;
        settings.strongGlitchChance = 0.04;
        break;
      default:
        settings.glitchChance = 0.15;
        settings.strongGlitchChance = 0.08;
    }
  }

  function updateWearPatterns() {
    // Organic wear accumulation - simulates component aging
    wearPatterns.magneticWear += Math.random() * GLITCH_TIMINGS.WEAR_ACCUMULATION;
    wearPatterns.thermalStress += (Math.random() - 0.5) * 0.0002;
    wearPatterns.powerSupplyWear += Math.random() * 0.00008;
    
    // Cap wear values at realistic maximums
    wearPatterns.magneticWear = Math.min(wearPatterns.magneticWear, CRT_CONSTANTS.MAGNETIC_WEAR_MAX);
    wearPatterns.thermalStress = Math.max(-CRT_CONSTANTS.THERMAL_STRESS_MAX, 
      Math.min(wearPatterns.thermalStress, CRT_CONSTANTS.THERMAL_STRESS_MAX));
    wearPatterns.powerSupplyWear = Math.min(wearPatterns.powerSupplyWear, CRT_CONSTANTS.POWER_SUPPLY_WEAR_MAX);
  }

  function getRealisticConvergenceError(normalizedX) {
    // Physics: RGB guns misalign more at screen edges due to geometry
    return CRT_CONSTANTS.CONVERGENCE_ERROR_BASE * (1 + normalizedX * 0.3);
  }

  function addPhosphorPersistence(letter, effectIntensity) {
    // Physics: Phosphor compounds exhibit afterglow proportional to excitation
    if (effectIntensity > INTENSITY_THRESHOLDS.PHOSPHOR_TRAIL) {
      const burnLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
      wearPatterns.phosphorWear.set(letter.position, burnLevel + effectIntensity * 0.001);
    }
  }

  function triggerScanlineInteraction(letter, effectIntensity) {
    // Physics: Bright phosphor interacts with electron beam raster
    if (effectIntensity > 0.7) {
      const scanlineInteraction = document.getElementById('scanlineInteraction');
      if (scanlineInteraction) {
        scanlineInteraction.style.opacity = effectIntensity * 0.3;
        const timerId = setTimeout(() => {
          scanlineInteraction.style.opacity = '0';
        }, 200);
        SystemCleanup.registerTimer(timerId);
      }
    }
  }

  // Letter DOM setup and state tracking
  const text = title.textContent;
  title.innerHTML = '';
  
  const letters = [];
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.className = 'tg-letter';
    span.textContent = text[i];
    span.dataset.char = text[i];
    span.dataset.index = i;
    title.appendChild(span);
    letters.push({
      element: span,
      originalChar: text[i],
      position: i,
      normalizedX: i / (text.length - 1),     // Horizontal position (0-1)
      glitchState: {
        active: false,
        intensity: 0,
        lastGlitch: 0
      }
    });
    SystemCleanup.registerElement(span);
  }

  // Character corruption and color simulation
  const glitchChars = '!@#$%^&*()_+{}|:<>?-=[]\\;\',./`~';
  const phosphorColors = {                   // CRT phosphor emission spectra
    red: 'rgba(255, 64, 32, 0.8)',          // P22 red phosphor
    green: 'rgba(32, 255, 64, 0.8)',        // P22 green phosphor  
    blue: 'rgba(64, 128, 255, 0.8)'         // P22 blue phosphor
  };

  // CRT simulation configuration
  const settings = {
    magneticFieldStrength: CRT_CONSTANTS.MAGNETIC_FIELD_STRENGTH,
    convergenceError: CRT_CONSTANTS.CONVERGENCE_ERROR_BASE,
    glitchChance: 0.15,                     // Base probability per frame
    strongGlitchChance: 0.08,               // High-intensity glitch probability
    colorTrackingIntensity: 0.25,           // Chroma tracking error strength
    chromaSkewChance: 0.18,                 // Color channel separation probability
    colorVibrateChance: 0.25,               // Color oscillation probability
    colorFadeChance: 0.12,                  // Phosphor fade probability
    colorBleedIntensity: 0.2,               // Adjacent pixel contamination
    phosphorTrailLength: CRT_CONSTANTS.PHOSPHOR_TRAIL_LENGTH,
    interlaceFlickerChance: 0.3             // Field flicker probability
  };

  // Phosphor persistence trail system
  const phosphorTrails = new Map();

  function createPhosphorTrail(letter, effectIntensity) {
    // Implementation: Clone letter DOM and animate decay with CSS transforms
    const trailId = `trail-${letter.position}-${Date.now()}`;
    const trail = {
      element: letter.element.cloneNode(true),
      intensity: effectIntensity,
      decay: 0.9,                           // Exponential decay factor
      position: letter.element.getBoundingClientRect()
    };
    
    // Style the trail element with phosphor glow
    trail.element.id = trailId;
    trail.element.style.position = 'absolute';
    trail.element.style.pointerEvents = 'none';
    trail.element.style.zIndex = '19';
    trail.element.style.left = trail.position.left + 'px';
    trail.element.style.top = trail.position.top + 'px';
    trail.element.style.opacity = effectIntensity * 0.6;
    trail.element.style.filter = 'blur(0.5px) brightness(1.2)';
    trail.element.style.textShadow = `
      0 0 4px rgba(232, 227, 216, ${effectIntensity * 0.8}),
      0 0 8px rgba(0, 255, 200, ${effectIntensity * 0.4})
    `;
    
    document.body.appendChild(trail.element);
    phosphorTrails.set(trailId, trail);
    SystemCleanup.registerElement(trail.element);
    
    // Animate trail decay with exponential falloff
    const decayInterval = setInterval(() => {
      trail.intensity *= trail.decay;
      trail.element.style.opacity = trail.intensity * 0.6;
      trail.element.style.filter = `blur(${(1 - trail.intensity) * 2}px) brightness(${1.2 - trail.intensity * 0.2})`;
      
      if (trail.intensity < 0.1) {
        clearInterval(decayInterval);
        if (trail.element.parentNode) {
          trail.element.parentNode.removeChild(trail.element);
        }
        phosphorTrails.delete(trailId);
      }
    }, 60);
    SystemCleanup.registerTimer(decayInterval);
  }

  // NEW: Color bleeding system - Complete implementation
  function applyColorBleeding(letter, effectIntensity) {
    if (effectIntensity < INTENSITY_THRESHOLDS.RGB_SEPARATION) return;
    
    const siblings = letters.filter(l => 
      Math.abs(l.position - letter.position) <= 2 && l !== letter
    );
    
    siblings.forEach(sibling => {
      const distance = Math.abs(sibling.position - letter.position);
      const bleedIntensity = effectIntensity * settings.colorBleedIntensity * (1 / distance);
      
      if (bleedIntensity > 0.1) {
        const hueShift = (Math.random() - 0.5) * 30;
        sibling.element.style.filter = `
          hue-rotate(${hueShift}deg) 
          saturate(${1.2 + bleedIntensity * 0.5})
          brightness(${1 + bleedIntensity * 0.3})
        `;
        
        // Physics: Color bleeding creates chromatic shadows
        sibling.element.style.textShadow = `
          0 0 ${bleedIntensity * 6}px rgba(255, 64, 32, ${bleedIntensity * 0.6}),
          0 0 ${bleedIntensity * 10}px rgba(64, 128, 255, ${bleedIntensity * 0.4})
        `;
        
        const resetTimer = setTimeout(() => {
          sibling.element.style.filter = '';
          sibling.element.style.textShadow = '';
        }, 200 + Math.random() * 300);
        SystemCleanup.registerTimer(resetTimer);
      }
    });
  }

  // NEW: Interlacing with field flicker - Complete implementation
  function applyInterlacing(letter, effectIntensity) {
    if (Math.random() < settings.interlaceFlickerChance) {
      const isEvenField = letter.position % 2 === 0;
      const flickerOffset = isEvenField ? -0.5 : 0.5;
      
      letter.element.style.transform += ` translateY(${flickerOffset}px)`;
      letter.element.style.opacity = isEvenField ? 0.85 : 1.0;
      
      // Physics: Interlaced fields flicker at 60Hz
      const flickerCount = 3 + Math.floor(Math.random() * 4);
      let flickers = 0;
      
      const flickerInterval = setInterval(() => {
        letter.element.style.opacity = letter.element.style.opacity === '1' ? '0.85' : '1';
        flickers++;
        
        if (flickers >= flickerCount) {
          clearInterval(flickerInterval);
          letter.element.style.opacity = '';
        }
      }, GLITCH_TIMINGS.FLICKER_INTERVAL);
      SystemCleanup.registerTimer(flickerInterval);
    }
  }

  // Enhanced magnetic distortion with standardized constants
  function getMagneticDistortion(normalizedX, effectIntensity) {
    const fieldAngle = magneticPhase + (normalizedX * Math.PI);
    const wearEffect = 1 + wearPatterns.magneticWear * 100;
    const fieldStrength = effectIntensity * CRT_CONSTANTS.MAGNETIC_FIELD_STRENGTH * wearEffect;
    
    // Physics: Multiple interfering magnetic fields create complex distortion
    const primaryField = Math.sin(fieldAngle) * fieldStrength;
    const deflectionCoil = Math.cos(fieldAngle * 1.3 + wearPatterns.thermalStress * 10) * fieldStrength * 0.8;
    const powerSupplyRipple = Math.sin(fieldAngle * 7.2) * fieldStrength * 0.4 * wearPatterns.powerSupplyWear * 25;
    const chaosField = Math.sin(fieldAngle * 3.7 + Math.random() * Math.PI) * fieldStrength * 0.6;
    
    // Implementation: CSS transform calculations for maximum distortion
    const xDisplace = (primaryField + deflectionCoil + powerSupplyRipple + chaosField) * 35;
    const yDisplace = (deflectionCoil * 0.8 + powerSupplyRipple + chaosField * 0.7) * 18;
    const rotation = (primaryField * 0.6 + powerSupplyRipple + chaosField * 0.4) * 12;
    
    return { xDisplace, yDisplace, rotation };
  }
  
  // Enhanced color tracking with standardized intensity levels
  function applyColorTracking(letter, effectIntensity) {
    const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
    const colorIntensity = effectIntensity * settings.colorTrackingIntensity * (1 + wearLevel);
    
    // Physics: CRT color guns misalign due to magnetic interference
    if (Math.random() < settings.chromaSkewChance) {
      const redSkew = (Math.random() - 0.5) * colorIntensity * 6;
      const blueSkew = (Math.random() - 0.5) * colorIntensity * 5;
      const greenSkew = (Math.random() - 0.5) * colorIntensity * 4;
      
      letter.element.style.filter = `
        hue-rotate(${redSkew * 25}deg) 
        saturate(${0.6 + colorIntensity * 0.8}) 
        contrast(${1 + colorIntensity * 0.6})
        brightness(${0.8 + colorIntensity * 0.4})
      `;
    }
    
    // Physics: Phosphor persistence creates color vibration at field frequency
    if (Math.random() < settings.colorVibrateChance) {
      const vibratePhase = performance.now() * 0.02;
      const vibrateIntensity = colorIntensity * 1.2;
      
      letter.element.style.textShadow = `
        ${Math.sin(vibratePhase) * vibrateIntensity * 4}px 0 rgba(255, 64, 32, ${vibrateIntensity}),
        ${Math.cos(vibratePhase * 1.3) * vibrateIntensity * 4}px 0 rgba(64, 128, 255, ${vibrateIntensity}),
        ${Math.sin(vibratePhase * 0.7) * vibrateIntensity * 3}px 0 rgba(32, 255, 64, ${vibrateIntensity * 0.8}),
        0 0 ${vibrateIntensity * 20}px rgba(232, 227, 216, ${vibrateIntensity * 0.8})
      `;
    }
    
    // Physics: Phosphor wear causes luminance degradation
    if (Math.random() < settings.colorFadeChance) {
      const fadeAmount = wearLevel * 0.4 + colorIntensity * 0.3;
      letter.element.style.opacity = Math.max(0.6, 1 - fadeAmount);
    }
  }

  // Standardized cascade failure with unified coordination
  function triggerCascadeFailure(triggerIntensity) {
    const cascadeChance = triggerIntensity * wearPatterns.magneticWear * 150;
    
    if (Math.random() < cascadeChance * 2) {
      console.log('[Title] Local cascade failure triggered');
      
      // Trigger unified cascade instead of local-only effects
      if (window.CRTTemporalState) {
        window.CRTTemporalState.triggerUnifiedCascade(triggerIntensity, 'title');
      }
      
      // Local cascade effects with cleanup registration
      letters.forEach((letter, index) => {
        const delay = index * (GLITCH_TIMINGS.CASCADE_DELAY_BASE + Math.random() * 15);
        const cascadeTimer = setTimeout(() => {
          const cascadeIntensity = triggerIntensity * (0.8 + Math.random() * 0.7);
          
          // Apply coordinated effects
          applyOptimizedGlitch(letter, cascadeIntensity);
          applyColorTracking(letter, cascadeIntensity);
          applyColorBleeding(letter, cascadeIntensity);
          applyInterlacing(letter, cascadeIntensity);
          createPhosphorTrail(letter, cascadeIntensity);
          
          // Physics: Cascade increases phosphor burn-in
          const burnWear = wearPatterns.phosphorWear.get(letter.position) || 0;
          wearPatterns.phosphorWear.set(letter.position, burnWear + 0.003);
          
        }, delay);
        SystemCleanup.registerTimer(cascadeTimer);
      });
      
      // System-wide wear accumulation
      wearPatterns.convergenceWear += triggerIntensity * 0.003;
      wearPatterns.thermalStress += triggerIntensity * 0.005;
      wearPatterns.powerSupplyWear += triggerIntensity * 0.002;
    }
  }

  // --- Priority 1: Temporal Sophistication ---
  // Global CRT temporal state
  window.CRTTemporalState = {
    mode: "stable", // "stable" or "failure"
    thermalLevel: 0.2, // 0-1
    timeInMode: 0,
    persistentProblems: new Set(),
    lastSwitch: performance.now(),
    
    // NEW: System coordination
    registeredSystems: new Set(),
    backgroundIntensity: 0.5, // 0-1 from background brightness analysis
    cascadeLevel: 0, // 0-5 cascade intensity
    activeCascades: new Set(), // ['title', 'nav', 'effects', 'background']
    
    // Unified frame rate management
    targetFPS: FRAME_RATES.HIGH,
    lastFrameTime: 0,
    
    // System state coordination
    registerSystem(systemName) {
      this.registeredSystems.add(systemName);
      console.log(`[CRT] Registered system: ${systemName}`);
    },
    
    broadcastStateChange(newMode, thermalLevel) {
      this.mode = newMode;
      this.thermalLevel = thermalLevel;
      
      console.log(`[CRT] State change: ${newMode}, thermal: ${thermalLevel.toFixed(3)}`);
      
      // Notify all registered systems
      this.registeredSystems.forEach(system => {
        window.dispatchEvent(new CustomEvent('crtStateChange', {
          detail: { mode: newMode, thermalLevel, backgroundIntensity: this.backgroundIntensity }
        }));
      });
    },
    
    triggerUnifiedCascade(cascadeIntensity, originSystem) {
      if (this.cascadeLevel >= 3) return; // Prevent cascade overflow
      
      this.cascadeLevel = Math.min(5, this.cascadeLevel + cascadeIntensity);
      this.activeCascades.add(originSystem);
      
      console.log(`[CRT] Unified cascade: ${originSystem} -> level ${this.cascadeLevel}`);
      
      // Broadcast cascade to all systems
      window.dispatchEvent(new CustomEvent('crtCascade', {
        detail: { 
          intensity: this.cascadeLevel, 
          origin: originSystem,
          backgroundIntensity: this.backgroundIntensity 
        }
      }));
      
      // Cascade decay with cleanup
      const decayTimer = setTimeout(() => {
        this.cascadeLevel = Math.max(0, this.cascadeLevel - 0.5);
        this.activeCascades.delete(originSystem);
      }, 2000 + Math.random() * 3000);
      SystemCleanup.registerTimer(decayTimer);
    },
    
    updateBackgroundIntensity(brightness) {
      this.backgroundIntensity = Math.max(0, Math.min(1, brightness));
      
      // Notify systems of background change
      window.dispatchEvent(new CustomEvent('backgroundIntensityChange', {
        detail: { intensity: this.backgroundIntensity }
      }));
    }
  };

  // Register this system
  window.CRTTemporalState.registerSystem('title');

  // Enhanced temporal state manager with unified coordination
  function updateTemporalState() {
    const now = performance.now();
    const crtState = window.CRTTemporalState;
    crtState.timeInMode = now - crtState.lastSwitch;

    // Thermal cycling influenced by background intensity
    const backgroundInfluence = (crtState.backgroundIntensity - 0.5) * 0.002;
    crtState.thermalLevel += (Math.sin(now / 60000) * 0.003) + 
                         ((Math.random() - 0.5) * 0.002) + 
                         backgroundInfluence;
    crtState.thermalLevel = Math.max(0, Math.min(1, crtState.thermalLevel));

    // Background-influenced durations
    const backgroundFactor = 1 + (crtState.backgroundIntensity - 0.5) * 0.3;
    const stableDuration = (18000 + Math.random() * 90000) * backgroundFactor;
    const failureDuration = (3000 + Math.random() * 18000) / backgroundFactor;

    if (crtState.mode === "stable" && crtState.timeInMode > stableDuration) {
      if (crtState.thermalLevel > 0.5 || Math.random() < 0.08 + crtState.thermalLevel * 0.3) {
        crtState.broadcastStateChange("failure", crtState.thermalLevel);
        crtState.lastSwitch = now;
      }
    } else if (crtState.mode === "failure" && crtState.timeInMode > failureDuration) {
      if (crtState.thermalLevel < 0.4 || Math.random() < 0.2) {
        crtState.broadcastStateChange("stable", crtState.thermalLevel);
        crtState.lastSwitch = now;
      }
    }

    const nextUpdate = setTimeout(updateTemporalState, 1000 + Math.random() * 800);
    SystemCleanup.registerTimer(nextUpdate);
  }
  updateTemporalState();

  // Helper: check if a persistent problem is active
  function isPersistent(problem) {
    return window.CRTTemporalState.persistentProblems.has(problem) && window.CRTTemporalState.mode === "failure";
  }

  // --- Violent, Abrupt Glitches ---
  function applyViolentGlitch(letter, intensity) {
    // Rapid shake
    if (Math.random() < 0.5) {
      letter.element.style.animation = 'violentShake 0.18s cubic-bezier(.7,.1,.2,.9)';
      setTimeout(() => { letter.element.style.animation = ''; }, 180);
    }
    // Sync loss: hard horizontal/vertical offset
    if (Math.random() < 0.3) {
      const x = (Math.random() - 0.5) * 16 * intensity;
      const y = (Math.random() - 0.5) * 8 * intensity;
      letter.element.style.transform += ` translate(${x}px,${y}px)`;
    }
    // Hard color channel separation
    if (Math.random() < 0.4) {
      letter.element.style.textShadow +=
        `,${intensity * 8}px 0 #00ffc8,${-intensity * 8}px 0 #ffdc80`;
    }
  }

  // --- Glitch Storms ---
  let glitchStormActive = false;
  function maybeStartGlitchStorm() {
    const state = window.CRTTemporalState;
    if (!glitchStormActive && state.mode === "failure" && Math.random() < 0.15 + state.thermalLevel * 0.5) {
      glitchStormActive = true;
      setTimeout(() => { glitchStormActive = false; }, 1200 + Math.random() * 1800);
    }
  }

  // --- Overlapping Persistent Problems ---
  function updatePersistentProblems() {
    const state = window.CRTTemporalState;
    if (state.mode === "failure") {
      // Accumulate persistent problems, don't clear on mode switch
      if (Math.random() < 0.25) state.persistentProblems.add("scanlineWarp");
      if (Math.random() < 0.18) state.persistentProblems.add("colorBleed");
      if (Math.random() < 0.12) state.persistentProblems.add("phosphorBurn");
    } else if (state.mode === "stable" && Math.random() < 0.05) {
      // Occasionally clear one persistent problem
      const arr = Array.from(state.persistentProblems);
      if (arr.length) state.persistentProblems.delete(arr[Math.floor(Math.random() * arr.length)]);
    }
    setTimeout(updatePersistentProblems, 1200 + Math.random() * 1800);
  }
  updatePersistentProblems();

  // --- Surprise Glitches in Stable Mode ---
  function maybeSurpriseGlitch(letter, intensity) {
    const state = window.CRTTemporalState;
    if (state.mode === "stable" && Math.random() < 0.03 + state.thermalLevel * 0.07) {
      applyViolentGlitch(letter, intensity * 1.2);
    }
  }

  // --- Integrate into glitch logic ---
  function applyOptimizedGlitch(letter, baseIntensity) {
    const crtState = window.CRTTemporalState;
    let effectiveIntensity = baseIntensity;
    
    // Physics: System state affects all glitch intensity
    if (crtState.mode === "stable") {
      effectiveIntensity *= 0.6 - crtState.thermalLevel * 0.2;
    } else {
      effectiveIntensity *= 1.2 + crtState.thermalLevel * 0.5;
    }

    // Apply temporal glitch behaviors
    maybeStartGlitchStorm();
    if (glitchStormActive || (crtState.mode === "failure" && Math.random() < 0.25 + crtState.thermalLevel * 0.2)) {
      applyViolentGlitch(letter, effectiveIntensity * 1.5);
    }
    maybeSurpriseGlitch(letter, effectiveIntensity);

    // Apply persistent problem overlays
    if (isPersistent("scanlineWarp")) {
      letter.element.style.transform += " skewY(" + ((Math.random() - 0.5) * 2.5) + "deg)";
    }
    if (isPersistent("colorBleed")) {
      applyColorBleeding(letter, effectiveIntensity * 1.2);
    }
    if (isPersistent("phosphorBurn")) {
      letter.element.classList.add('phosphor-burn');
      const burnTimer = setTimeout(() => letter.element.classList.remove('phosphor-burn'), 1200 + Math.random() * 800);
      SystemCleanup.registerTimer(burnTimer);
    }

    // Core CRT distortion effects
    const distortion = getMagneticDistortion(letter.normalizedX, effectiveIntensity);
    letter.element.style.transform =
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;

    // RGB color separation effects
    if (effectiveIntensity > INTENSITY_THRESHOLDS.RGB_SEPARATION) {
      const convergenceError = getRealisticConvergenceError(letter.normalizedX);
      const baseOffset = convergenceError * effectiveIntensity;
      const redOffset = baseOffset * (1 + letter.normalizedX * 0.4);
      const blueOffset = baseOffset * (1 + (1 - letter.normalizedX) * 0.4);
      
      letter.element.style.textShadow = `
        ${redOffset * 1.5}px 0 ${phosphorColors.red},
        ${-blueOffset * 1.5}px 0 ${phosphorColors.blue},
        0 0 ${effectiveIntensity * 15}px rgba(232, 227, 216, ${effectiveIntensity * 0.6}),
        0 0 ${effectiveIntensity * 25}px rgba(0, 255, 200, ${effectiveIntensity * 0.3})
      `;
    }
    
    // Character corruption with standardized thresholds
    const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
    const replaceChance = 0.7 + wearLevel * 3;
    
    if (effectiveIntensity > INTENSITY_THRESHOLDS.CHARACTER_REPLACE && Math.random() < replaceChance) {
      const replacementChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      letter.element.textContent = replacementChar;
      
      const restoreTimer = setTimeout(() => {
        if (letter.element.textContent === replacementChar) {
          letter.element.textContent = letter.originalChar;
        }
      }, GLITCH_TIMINGS.RESTORE_DELAY + Math.random() * 40);
      SystemCleanup.registerTimer(restoreTimer);
    }
    
    // Brightness modulation
    if (effectiveIntensity > INTENSITY_THRESHOLDS.BRIGHTNESS_MOD) {
      const brightness = 0.7 + (effectiveIntensity * 0.6);
      letter.element.style.filter = `brightness(${brightness}) contrast(${1 + effectiveIntensity * 0.4})`;
    }
    
    // Apply all signal integration effects
    applyColorTracking(letter, effectiveIntensity);
    applyColorBleeding(letter, effectiveIntensity);
    applyInterlacing(letter, effectiveIntensity);

    // Create phosphor trails for high intensity
    if (effectiveIntensity > INTENSITY_THRESHOLDS.PHOSPHOR_TRAIL) {
      createPhosphorTrail(letter, effectiveIntensity);
    }
    
    // Trigger cascade for extreme intensity
    if (effectiveIntensity > INTENSITY_THRESHOLDS.CASCADE_TRIGGER) {
      triggerCascadeFailure(effectiveIntensity);
    }
    
    addPhosphorPersistence(letter, effectiveIntensity);
    triggerScanlineInteraction(letter, effectiveIntensity);
  }

  // Performance-aware glitch loop
  function runOptimizedGlitchLoop(currentTime) {
    updatePerformanceSettings();
    
    if (document.documentElement.dataset.motion === "paused") {
      letters.forEach(letter => {
        letter.element.style.transform = '';
        letter.element.style.filter = '';
        letter.element.style.textShadow = '';
        letter.textContent = letter.originalChar;
        letter.glitchState.active = false;
      });
      
      requestAnimationFrame(runOptimizedGlitchLoop);
      return;
    }
    
    // Performance-based frame limiting
    if (currentTime - lastFrameTime < 1000 / targetFPS) {
      requestAnimationFrame(runOptimizedGlitchLoop);
      return;
    }
    
    lastFrameTime = currentTime;
    
    // Skip expensive operations on low-end devices
    if (performanceLevel !== 'low') {
      updateWearPatterns();
      magneticPhase += performanceMode ? 0.02 : 0.035;
    }
    
    // EXTREME organic intensity
    const wearInfluence = Math.min(wearPatterns.magneticWear * 15, 0.5); // MORE wear influence
    const isStrongGlitch = Math.random() < (settings.strongGlitchChance + wearInfluence);
    
    // EXTREME base intensity
    const baseIntensity = isStrongGlitch ? 
      (0.85 + Math.random() * 0.35) : // MAXIMUM chaos
      (Math.random() * 0.4 + wearInfluence); // HIGHER minimum
    
    const maxActiveGlitches = performanceMode ? 3 : letters.length;
    let activeGlitches = 0;
    
    letters.forEach(letter => {
      const timeSinceLastGlitch = currentTime - letter.glitchState.lastGlitch;
      const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
      
      // EXTREME organic glitch probability
      const organicGlitchChance = settings.glitchChance + 
        wearLevel * 0.2 + 
        wearPatterns.thermalStress * 0.1 +
        wearPatterns.powerSupplyWear * 0.15; // MORE wear factors
      
      const shouldGlitch = Math.random() < organicGlitchChance && 
                          activeGlitches < maxActiveGlitches &&
                          timeSinceLastGlitch > (50 - wearLevel * 40); // MUCH faster glitching
      
      if (shouldGlitch) {
        const localIntensity = baseIntensity * (0.7 + Math.random() * 0.6);
        applyOptimizedGlitch(letter, localIntensity);
        letter.glitchState.active = true;
        letter.glitchState.intensity = localIntensity;
        letter.glitchState.lastGlitch = currentTime;
        activeGlitches++;
      } else if (letter.glitchState.active) {
        letter.glitchState.intensity *= 0.7; // FASTER decay
        if (letter.glitchState.intensity < 0.06) { // LOWER threshold
          letter.element.style.transform = '';
          letter.element.style.filter = '';
          letter.element.style.textShadow = '';
          letter.textContent = letter.originalChar;
          letter.glitchState.active = false;
        }
      }
    });
    
    requestAnimationFrame(runOptimizedGlitchLoop);
  }

  // Event listener registration with cleanup
  const cascadeHandler = (event) => {
    const { intensity, origin } = event.detail;
    if (origin === 'title') return;
    
    console.log(`[Title] Cascade received: ${origin} -> ${intensity}`);
    
    letters.forEach((letter, index) => {
      const delay = index * (3 + Math.random() * 8);
      const delayTimer = setTimeout(() => {
        const cascadeIntensity = intensity * 0.2 * (0.8 + Math.random() * 0.4);
        applyAuthenticGlitch(letter, cascadeIntensity);
      }, delay);
      SystemCleanup.registerTimer(delayTimer);
    });
  };

  window.addEventListener('crtCascade', cascadeHandler);
  SystemCleanup.registerListener(window, 'crtCascade', cascadeHandler);

  // Cleanup on page unload - SINGLE DECLARATION
  const titleCleanupHandler = () => SystemCleanup.cleanupAll();
  window.addEventListener('beforeunload', titleCleanupHandler);
  window.addEventListener('pagehide', titleCleanupHandler);
  SystemCleanup.registerListener(window, 'beforeunload', titleCleanupHandler);
  SystemCleanup.registerListener(window, 'pagehide', titleCleanupHandler);

  title.style.fontSize = "65%";

  // Initialize with performance-based delay
  const startDelay = performanceLevel === 'low' ? 1200 : 500;
  const initTimer = setTimeout(() => {
    updatePerformanceSettings();
    requestAnimationFrame(runOptimizedGlitchLoop);
  }, startDelay);
  SystemCleanup.registerTimer(initTimer);

  // Phase 4: Visual Authenticity Enhancement
  const AUTHENTICITY_CONSTANTS = {
    // Physics-based P22 phosphor decay timing (microseconds to milliseconds conversion)
    PHOSPHOR_P22_INITIAL_DECAY: 0.01,   // 10μs initial decay (imperceptible)
    PHOSPHOR_P22_VISIBLE_DECAY: 5,       // 5ms visible afterglow
    PHOSPHOR_P22_PERSISTENCE: 150,       // 150ms long persistence
    
    // Magnetic field hysteresis modeling
    MAGNETIC_HYSTERESIS_LAG: 0.12,       // 120ms lag for field changes
    MAGNETIC_SATURATION_POINT: 0.85,     // Saturation threshold
    
    // Authentic color temperature ranges (Kelvin)
    COLOR_TEMP_COOL: 6500,               // New CRT
    COLOR_TEMP_WARM: 3200,               // Aged CRT
    
    // Geometric distortion authenticity
    PINCUSHION_INTENSITY: 0.08,          // Real CRT pincushion distortion
    EDGE_CONVERGENCE_ERROR: 2.4          // Parabolic convergence error multiplier
  };

  // Dynamic intensity scaling based on physics
  function getAuthenticIntensity(baseIntensity, effectType, crtState) {
    const thermalMultiplier = 1 + (crtState.thermalLevel * 0.8);
    const wearMultiplier = 1 + (getTotalSystemWear() * 0.6);
    const backgroundMultiplier = 0.7 + (crtState.backgroundIntensity * 0.6);
    
    // Physics-based intensity curves for different effect types
    const intensityCurves = {
      phosphor: baseIntensity * Math.pow(thermalMultiplier, 1.2), // Non-linear thermal response
      magnetic: baseIntensity * wearMultiplier * backgroundMultiplier,
      convergence: baseIntensity * Math.pow(wearMultiplier, 0.8), // Convergence degrades slower
      color: baseIntensity * thermalMultiplier * Math.pow(backgroundMultiplier, 1.3)
    };
    
    return Math.min(1.2, intensityCurves[effectType] || baseIntensity); // Allow over-saturation up to 120%
  }

  function getTotalSystemWear() {
    return (wearPatterns.magneticWear + 
            Math.abs(wearPatterns.thermalStress) + 
            wearPatterns.powerSupplyWear + 
            wearPatterns.convergenceWear) / 4;
  }

  // Enhanced phosphor persistence with realistic P22 timing
  function createAuthenticPhosphorTrail(letter, effectIntensity) {
    const authenticIntensity = getAuthenticIntensity(effectIntensity, 'phosphor', window.CRTTemporalState);
    
    if (authenticIntensity < INTENSITY_THRESHOLDS.PHOSPHOR_TRAIL) return;
    
    const trailId = `trail-${letter.position}-${Date.now()}`;
    const trail = {
      element: letter.element.cloneNode(true),
      intensity: authenticIntensity,
      
      // Multi-stage P22 phosphor decay
      decayStages: [
        { duration: AUTHENTICITY_CONSTANTS.PHOSPHOR_P22_INITIAL_DECAY, factor: 0.99 },
        { duration: AUTHENTICITY_CONSTANTS.PHOSPHOR_P22_VISIBLE_DECAY, factor: 0.7 },
        { duration: AUTHENTICITY_CONSTANTS.PHOSPHOR_P22_PERSISTENCE, factor: 0.1 }
      ],
      currentStage: 0,
      stageStartTime: performance.now(),
      
      position: letter.element.getBoundingClientRect()
    };
    
    // Enhanced phosphor glow with wavelength-accurate colors
    trail.element.id = trailId;
    trail.element.style.position = 'absolute';
    trail.element.style.pointerEvents = 'none';
    trail.element.style.zIndex = '23'; // Phosphor persistence layer
    trail.element.style.left = trail.position.left + 'px';
    trail.element.style.top = trail.position.top + 'px';
    trail.element.style.opacity = authenticIntensity * 0.8;
    trail.element.style.filter = 'blur(0.3px) brightness(1.4) contrast(1.2)';
    
    // Wavelength-accurate P22 phosphor colors
    trail.element.style.textShadow = `
      0 0 2px rgba(232, 227, 216, ${authenticIntensity}),
      0 0 6px rgba(255, 64, 32, ${authenticIntensity * 0.6}),
      0 0 12px rgba(32, 255, 64, ${authenticIntensity * 0.7}),
      0 0 24px rgba(64, 128, 255, ${authenticIntensity * 0.5}),
      0 0 48px rgba(232, 227, 216, ${authenticIntensity * 0.3})
    `;
    
    document.body.appendChild(trail.element);
    phosphorTrails.set(trailId, trail);
    SystemCleanup.registerElement(trail.element);
    
    // Authentic P22 phosphor decay animation
    function animatePhosphorDecay() {
      const now = performance.now();
      const elapsedInStage = now - trail.stageStartTime;
      const currentStage = trail.decayStages[trail.currentStage];
      
      if (!currentStage) {
        // Decay complete
        if (trail.element.parentNode) {
          trail.element.parentNode.removeChild(trail.element);
        }
        phosphorTrails.delete(trailId);
        return;
      }
      
      if (elapsedInStage >= currentStage.duration) {
        // Move to next decay stage
        trail.currentStage++;
        trail.stageStartTime = now;
        trail.intensity *= currentStage.factor;
      } else {
        // Smooth decay within stage
        const stageProgress = elapsedInStage / currentStage.duration;
        const stageIntensity = trail.intensity * (1 - stageProgress * (1 - currentStage.factor));
        
        trail.element.style.opacity = stageIntensity * 0.8;
        trail.element.style.filter = `blur(${(1 - stageIntensity) * 1.5}px) brightness(${1.4 - stageIntensity * 0.3}) contrast(${1.2 - stageIntensity * 0.1})`;
      }
      
      requestAnimationFrame(animatePhosphorDecay);
    }
    
    requestAnimationFrame(animatePhosphorDecay);
  }

  // Magnetic field hysteresis modeling
  let magneticFieldHistory = [];
  const HYSTERESIS_MEMORY = 8; // Frames to remember
  
  function getHysteresisAdjustedField(targetField) {
    magneticFieldHistory.push(targetField);
    if (magneticFieldHistory.length > HYSTERESIS_MEMORY) {
      magneticFieldHistory.shift();
    }
    
    // Weighted average favoring recent history
    let adjustedField = 0;
    let totalWeight = 0;
    
    magneticFieldHistory.forEach((field, index) => {
      const weight = Math.pow(0.8, magneticFieldHistory.length - 1 - index);
      adjustedField += field * weight;
      totalWeight += weight;
    });
    
    adjustedField /= totalWeight;
    
    // Apply saturation curve
    if (Math.abs(adjustedField) > AUTHENTICITY_CONSTANTS.MAGNETIC_SATURATION_POINT) {
      const sign = Math.sign(adjustedField);
      adjustedField = sign * (AUTHENTICITY_CONSTANTS.MAGNETIC_SATURATION_POINT + 
        (Math.abs(adjustedField) - AUTHENTICITY_CONSTANTS.MAGNETIC_SATURATION_POINT) * 0.3);
    }
    
    return adjustedField;
  }

  // Enhanced magnetic distortion with hysteresis and non-linear field interactions
  function getAuthenticMagneticDistortion(normalizedX, effectIntensity) {
    const crtState = window.CRTTemporalState;
    const authenticIntensity = getAuthenticIntensity(effectIntensity, 'magnetic', crtState);
    
    const fieldAngle = magneticPhase + (normalizedX * Math.PI);
    const wearEffect = 1 + wearPatterns.magneticWear * 120;
    const baseFieldStrength = authenticIntensity * CRT_CONSTANTS.MAGNETIC_FIELD_STRENGTH * wearEffect;
    
    // Apply hysteresis to field strength
    const hysteresisAdjustedField = getHysteresisAdjustedField(baseFieldStrength);
    
    // Non-linear magnetic field interactions
    const primaryField = Math.sin(fieldAngle) * hysteresisAdjustedField;
    const deflectionCoil = Math.cos(fieldAngle * 1.3 + wearPatterns.thermalStress * 15) * hysteresisAdjustedField * 0.75;
    
    // Cross-talk between H/V coils (authentic CRT behavior)
    const hCoilCrosstalk = Math.sin(fieldAngle * 2.1) * hysteresisAdjustedField * 0.15;
    const vCoilCrosstalk = Math.cos(fieldAngle * 1.7) * hysteresisAdjustedField * 0.12;
    
    const powerSupplyRipple = Math.sin(fieldAngle * 7.8) * hysteresisAdjustedField * 0.35 * wearPatterns.powerSupplyWear * 30;
    
    // Position-dependent pincushion distortion
    const pincushionX = Math.pow(normalizedX - 0.5, 2) * AUTHENTICITY_CONSTANTS.PINCUSHION_INTENSITY;
    const pincushionY = Math.pow(normalizedX - 0.5, 2) * AUTHENTICITY_CONSTANTS.PINCUSHION_INTENSITY * 0.6;
    
    // Calculate displacement with authentic CRT physics
    const xDisplace = (primaryField + deflectionCoil + hCoilCrosstalk + powerSupplyRipple + pincushionX) * 42;
    const yDisplace = (deflectionCoil * 0.8 + vCoilCrosstalk + powerSupplyRipple * 0.7 + pincushionY) * 22;
    const rotation = (primaryField * 0.5 + powerSupplyRipple + (hCoilCrosstalk - vCoilCrosstalk)) * 15;
    
    return { xDisplace, yDisplace, rotation };
  }
  
  // Color temperature shift with aging
  function getAuthenticColorTemperature(crtState) {
    const totalWear = getTotalSystemWear();
    const thermalInfluence = crtState.thermalLevel * 0.3;
    
    // Color temperature shifts from cool (6500K) to warm (3200K) with age
    const tempShift = totalWear * 0.8 + thermalInfluence;
    const currentTemp = AUTHENTICITY_CONSTANTS.COLOR_TEMP_COOL - 
      (tempShift * (AUTHENTICITY_CONSTANTS.COLOR_TEMP_COOL - AUTHENTICITY_CONSTANTS.COLOR_TEMP_WARM));
    
    return Math.max(AUTHENTICITY_CONSTANTS.COLOR_TEMP_WARM, currentTemp);
  }

  // Enhanced RGB separation with parabolic convergence curves
  function getAuthenticConvergenceError(normalizedX, effectIntensity) {
    const crtState = window.CRTTemporalState;
    const authenticIntensity = getAuthenticIntensity(effectIntensity, 'convergence', crtState);
    
    // Parabolic convergence error - more accurate to real CRT geometry
    const edgeFactor = Math.pow(Math.abs(normalizedX - 0.5) * 2, 1.8);
    const baseError = CRT_CONSTANTS.CONVERGENCE_ERROR_BASE * (1 + edgeFactor * AUTHENTICITY_CONSTANTS.EDGE_CONVERGENCE_ERROR);
    
    return baseError * authenticIntensity * (1 + wearPatterns.convergenceWear * 8);
  }

  // Enhanced color tracking with wavelength-accurate simulation
  function applyAuthenticColorTracking(letter, effectIntensity) {
    const crtState = window.CRTTemporalState;
    const authenticIntensity = getAuthenticIntensity(effectIntensity, 'color', crtState);
    const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
    const colorIntensity = authenticIntensity * settings.colorTrackingIntensity * (1 + wearLevel);
    
    // Color temperature adjustment based on CRT aging
    const colorTemp = getAuthenticColorTemperature(crtState);
    const tempShift = (6500 - colorTemp) / 3300; // Normalize temperature shift
    
    if (Math.random() < settings.chromaSkewChance) {
      // Wavelength-accurate color shifts
      const redShift = (Math.random() - 0.5) * colorIntensity * 8 + tempShift * 15;
      const blueShift = (Math.random() - 0.5) * colorIntensity * 6 - tempShift * 10;
      const greenShift = (Math.random() - 0.5) * colorIntensity * 5;
      
      letter.element.style.filter = `
        hue-rotate(${redShift * 30}deg) 
        saturate(${0.5 + colorIntensity * 1.0}) 
        contrast(${1 + colorIntensity * 0.8})
        brightness(${0.7 + colorIntensity * 0.5})
        sepia(${tempShift * 0.2})
      `;
    }
    
    // Enhanced phosphor persistence with accurate P22 wavelengths
    if (Math.random() < settings.colorVibrateChance) {
      const vibratePhase = performance.now() * 0.025;
      const vibrateIntensity = colorIntensity * 1.4;
      
      // P22 phosphor wavelength simulation
      letter.element.style.textShadow = `
        ${Math.sin(vibratePhase) * vibrateIntensity * 5}px 0 rgba(255, 64, 32, ${vibrateIntensity * 0.8}),
        ${Math.cos(vibratePhase * 1.3) * vibrateIntensity * 5}px 0 rgba(64, 128, 255, ${vibrateIntensity * 0.9}),
        ${Math.sin(vibratePhase * 0.7) * vibrateIntensity * 4}px 0 rgba(32, 255, 64, ${vibrateIntensity}),
        0 0 ${vibrateIntensity * 25}px rgba(232, 227, 216, ${vibrateIntensity * 0.9}),
        0 0 ${vibrateIntensity * 50}px rgba(0, 255, 200, ${vibrateIntensity * 0.3})
      `;
    }
    
    // Intensity-dependent phosphor fade (bright pixels fade slower)
    if (Math.random() < settings.colorFadeChance) {
      const fadeAmount = wearLevel * 0.5 + colorIntensity * 0.4;
      const brightnessDependent = Math.pow(colorIntensity, 0.7); // Non-linear brightness relationship
      letter.element.style.opacity = Math.max(0.5, 1 - fadeAmount + brightnessDependent * 0.2);
    }
  }

  // Enhanced color bleeding with electron path simulation
  function applyAuthenticColorBleeding(letter, effectIntensity) {
    const crtState = window.CRTTemporalState;
    const authenticIntensity = getAuthenticIntensity(effectIntensity, 'color', crtState);
    
    if (authenticIntensity < INTENSITY_THRESHOLDS.RGB_SEPARATION) return;
    
    // Extended bleeding range during thermal stress
    const thermalMultiplier = 1 + crtState.thermalLevel * 2;
    const bleedRange = Math.min(5, Math.floor(2 * thermalMultiplier)); // Up to 5 characters during extreme thermal stress
    
    const siblings = letters.filter(l => 
      Math.abs(l.position - letter.position) <= bleedRange && l !== letter
    );
    
    siblings.forEach(sibling => {
      const distance = Math.abs(sibling.position - letter.position);
      const bleedIntensity = authenticIntensity * settings.colorBleedIntensity * (1 / Math.pow(distance, 0.8));
      
      if (bleedIntensity > 0.08) {
        // Frequency-dependent bleeding (high frequency = less bleed)
        const frequencyFactor = 1 - (distance * 0.15);
        const effectiveBleed = bleedIntensity * Math.max(0.3, frequencyFactor);
        
        const hueShift = (Math.random() - 0.5) * 40 * effectiveBleed;
        sibling.element.style.filter = `
          hue-rotate(${hueShift}deg) 
          saturate(${1.1 + effectiveBleed * 0.7})
          brightness(${1 + effectiveBleed * 0.4})
        `;
        
        // Enhanced chromatic shadows following electron paths
        sibling.element.style.textShadow = `
          ${effectiveBleed * 8}px 0 rgba(255, 64, 32, ${effectiveBleed * 0.7}),
          ${-effectiveBleed * 6}px 0 rgba(64, 128, 255, ${effectiveBleed * 0.6}),
          0 0 ${effectiveBleed * 15}px rgba(32, 255, 64, ${effectiveBleed * 0.5})
        `;
        
        const resetTimer = setTimeout(() => {
          sibling.element.style.filter = '';
          sibling.element.style.textShadow = '';
        }, 150 + Math.random() * 400);
        SystemCleanup.registerTimer(resetTimer);
      }
    });
  }

  // Enhanced main glitch function with authentic physics
  function applyAuthenticGlitch(letter, baseIntensity) {
    const crtState = window.CRTTemporalState;
    
    // Apply temporal behaviors first
    maybeStartGlitchStorm();
    if (glitchStormActive || (crtState.mode === "failure" && Math.random() < 0.25 + crtState.thermalLevel * 0.2)) {
      applyViolentGlitch(letter, baseIntensity * 1.5);
    }
    maybeSurpriseGlitch(letter, baseIntensity);

    // Persistent problem overlays
    if (isPersistent("scanlineWarp")) {
      letter.element.style.transform += " skewY(" + ((Math.random() - 0.5) * 3) + "deg)";
    }
    if (isPersistent("colorBleed")) {
      applyAuthenticColorBleeding(letter, baseIntensity * 1.3);
    }
    if (isPersistent("phosphorBurn")) {
      letter.element.classList.add('phosphor-burn');
      const burnTimer = setTimeout(() => letter.element.classList.remove('phosphor-burn'), 1500 + Math.random() * 1000);
      SystemCleanup.registerTimer(burnTimer);
    }

    // Core authentic CRT distortion effects
    const distortion = getAuthenticMagneticDistortion(letter.normalizedX, baseIntensity);
    letter.element.style.transform =
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;

    // Authentic RGB separation with parabolic convergence
    const authenticIntensity = getAuthenticIntensity(baseIntensity, 'convergence', crtState);
    if (authenticIntensity > INTENSITY_THRESHOLDS.RGB_SEPARATION) {
      const convergenceError = getAuthenticConvergenceError(letter.normalizedX, authenticIntensity);
      const baseOffset = convergenceError * authenticIntensity;
      
      // Position-dependent convergence errors
      const redOffset = baseOffset * (1.2 + letter.normalizedX * 0.6);
      const blueOffset = baseOffset * (1.2 + (1 - letter.normalizedX) * 0.6);
      const greenOffset = baseOffset * (1.0 + Math.abs(letter.normalizedX - 0.5) * 0.4);
      
      letter.element.style.textShadow = `
        ${redOffset * 1.8}px 0 ${phosphorColors.red},
        ${-blueOffset * 1.8}px 0 ${phosphorColors.blue},
        0 ${greenOffset * 0.3}px ${phosphorColors.green},
        0 0 ${authenticIntensity * 18}px rgba(232, 227, 216, ${authenticIntensity * 0.7}),
        0 0 ${authenticIntensity * 35}px rgba(0, 255, 200, ${authenticIntensity * 0.4})
      `;
    }
    
    // Character corruption with wear-based probability
    const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
    const replaceChance = 0.6 + wearLevel * 4;
    
    if (authenticIntensity > INTENSITY_THRESHOLDS.CHARACTER_REPLACE && Math.random() < replaceChance) {
      const replacementChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      letter.element.textContent = replacementChar;
      
      const restoreTimer = setTimeout(() => {
        if (letter.element.textContent === replacementChar) {
          letter.element.textContent = letter.originalChar;
        }
      }, GLITCH_TIMINGS.RESTORE_DELAY + Math.random() * 50);
      SystemCleanup.registerTimer(restoreTimer);
    }
    
    // Intensity-dependent brightness modulation
    if (authenticIntensity > INTENSITY_THRESHOLDS.BRIGHTNESS_MOD) {
      const brightness = 0.6 + (authenticIntensity * 0.8);
      letter.element.style.filter = `brightness(${brightness}) contrast(${1 + authenticIntensity * 0.5})`;
    }
    
    // Apply all authentic signal effects
    applyAuthenticColorTracking(letter, baseIntensity);
    applyAuthenticColorBleeding(letter, baseIntensity);
    applyInterlacing(letter, baseIntensity);

    // Create authentic phosphor trails for high intensity
    if (authenticIntensity > INTENSITY_THRESHOLDS.PHOSPHOR_TRAIL) {
      createAuthenticPhosphorTrail(letter, baseIntensity);
    }
    
    // Cascade trigger for extreme intensity
    if (authenticIntensity > INTENSITY_THRESHOLDS.CASCADE_TRIGGER) {
      triggerCascadeFailure(baseIntensity);
    }
    
    addPhosphorPersistence(letter, authenticIntensity);
    triggerScanlineInteraction(letter, authenticIntensity);
  }

  // Update main glitch loop to use authentic physics
  function runOptimizedGlitchLoop(currentTime) {
    updatePerformanceSettings();
    
    if (document.documentElement.dataset.motion === "paused") {
      letters.forEach(letter => {
        letter.element.style.transform = '';
        letter.element.style.filter = '';
        letter.element.style.textShadow = '';
        letter.textContent = letter.originalChar;
        letter.glitchState.active = false;
      });
      
      requestAnimationFrame(runOptimizedGlitchLoop);
      return;
    }
    
    // Performance-based frame limiting
    if (currentTime - lastFrameTime < 1000 / targetFPS) {
      requestAnimationFrame(runOptimizedGlitchLoop);
      return;
    }
    
    lastFrameTime = currentTime;
    
    // Skip expensive operations on low-end devices
    if (performanceLevel !== 'low') {
      updateWearPatterns();
      magneticPhase += performanceMode ? 0.02 : 0.035;
    }
    
    // Enhanced organic intensity with authenticity scaling
    const wearInfluence = Math.min(wearPatterns.magneticWear * 18, 0.6);
    const isStrongGlitch = Math.random() < (settings.strongGlitchChance + wearInfluence);
    
    // Authentic base intensity with over-saturation capability
    const baseIntensity = isStrongGlitch ? 
      (0.9 + Math.random() * 0.5) : // Allow up to 140% intensity
      (Math.random() * 0.5 + wearInfluence);
    
    const maxActiveGlitches = performanceMode ? 3 : letters.length;
    let activeGlitches = 0;
    
    letters.forEach(letter => {
      const timeSinceLastGlitch = currentTime - letter.glitchState.lastGlitch;
      const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
      
      const organicGlitchChance = settings.glitchChance + 
        wearLevel * 0.25 + 
        wearPatterns.thermalStress * 0.12 +
        wearPatterns.powerSupplyWear * 0.18;
      
      const shouldGlitch = Math.random() < organicGlitchChance && 
                          activeGlitches < maxActiveGlitches &&
                          timeSinceLastGlitch > (45 - wearLevel * 35);
      
      if (shouldGlitch) {
        const localIntensity = baseIntensity * (0.6 + Math.random() * 0.8);
        applyAuthenticGlitch(letter, localIntensity); // Use authentic glitch function
        letter.glitchState.active = true;
        letter.glitchState.intensity = localIntensity;
        letter.glitchState.lastGlitch = currentTime;
        activeGlitches++;
      } else if (letter.glitchState.active) {
        letter.glitchState.intensity *= 0.65;
        if (letter.glitchState.intensity < 0.05) {
          letter.element.style.transform = '';
          letter.element.style.filter = '';
          letter.element.style.textShadow = '';
          letter.textContent = letter.originalChar;
          letter.glitchState.active = false;
        }
      }
    });
    
    requestAnimationFrame(runOptimizedGlitchLoop);
  }
})();