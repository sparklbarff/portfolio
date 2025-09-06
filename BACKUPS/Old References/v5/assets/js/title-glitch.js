/*
 * CRT Title Glitch System
 * Simulates authentic CRT phosphor decay through DOM manipulation and CSS filters
 * Physics: Electron beam deflection by magnetic coils creates spatial distortion
 * Implements magnetic yoke distortion algorithms based on electron beam physics
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
    POWER_SUPPLY_WEAR_MAX: 0.04,        /* Maximum power instability (0-0.04) */
    PERSPECTIVE_MAX: 40,                /* Maximum perspective transform distance */
    FRAGMENT_THRESHOLD: 0.8,            /* Minimum intensity for fragmenting letters */
    COLOR_TEMP_MIN: 6500,               /* Color temperature range in Kelvin */
    COLOR_TEMP_MAX: 9300                /* Maximum color temperature (blue shift) */
  };

  /* Effect intensity thresholds */
  const INTENSITY_THRESHOLDS = {
    RGB_SEPARATION: 0.3,                /* Minimum for color channel separation */
    CHARACTER_REPLACE: 0.4,             /* Minimum for glyph corruption */
    BRIGHTNESS_MOD: 0.2,                /* Minimum for luminance effects */
    PHOSPHOR_TRAIL: 0.5,                /* Minimum for persistence trails */
    CASCADE_TRIGGER: 0.6,               /* Minimum for system cascade */
    Z_MOVEMENT: 0.45,                   /* Minimum for z-axis transformations */
    DECOMPOSITION: 0.7                  /* Minimum for character fragmentation */
  };

  /* Performance frame rates per level */
  const FRAME_RATES = { LOW: 15, MEDIUM: 20, HIGH: 30 };

  /* Glitch timing constants */
  const GLITCH_TIMINGS = {
    RESTORE_DELAY: 60,                  /* Character restore time (ms) */
    FLICKER_INTERVAL: 16,               /* 60fps interlace flicker */
    CASCADE_DELAY_BASE: 5,              /* Base cascade propagation delay */
    WEAR_ACCUMULATION: 0.0001,          /* Per-frame wear increment */
    FRAGMENT_DURATION: 700,             /* Duration of character fragments (ms) */
    BLOOM_DURATION: 350,                /* Duration of phosphor bloom effect (ms) */
    DIMENSION_SHIFT: 200                /* Duration of dimensional shift (ms) */
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
    convergenceWear: 0,                 /* RGB alignment drift */
    colorTemperature: 6500              /* CRT color temperature in Kelvin */
  };

  /* Title-specific local state */
  const TitleState = {
    mode: "stable",                     /* "stable", "failure", "cascade" */
    thermalLevel: 0,                    /* 0-1 thermal stress indicator */
    cascadeLevel: 0,                    /* 0-1 cascade failure intensity */
    persistentProblems: new Set(),      /* Set of ongoing issues */
    
    /* Title-specific states */
    dimensionalDepth: 0,                /* Current perspective depth 0-1 */
    fragmentationActive: false,         /* Whether letter fragmentation is active */
    phosphorBloomActive: false,         /* Whether phosphor bloom effect is active */
    
    updateThermalLevel(level) {
      this.thermalLevel = Math.max(0, Math.min(1, level));
      // Update color temperature based on thermal level
      wearPatterns.colorTemperature = CRT_CONSTANTS.COLOR_TEMP_MIN + 
        (CRT_CONSTANTS.COLOR_TEMP_MAX - CRT_CONSTANTS.COLOR_TEMP_MIN) * this.thermalLevel;
    },
    
    triggerCascade(intensity) {
      this.cascadeLevel = Math.max(this.cascadeLevel, intensity);
      this.mode = intensity > 0.7 ? "failure" : "cascade";
      
      // Auto-recovery after cascade
      setTimeout(() => {
        this.cascadeLevel *= 0.7;
        if (this.cascadeLevel < 0.1) {
          this.mode = "stable";
          this.cascadeLevel = 0;
        }
      }, 2000 + Math.random() * 3000);
      
      // Dimensional depth surge
      if (intensity > 0.6) {
        this.dimensionalDepth = Math.min(1, intensity * 1.2);
        setTimeout(() => {
          this.dimensionalDepth *= 0.5;
        }, GLITCH_TIMINGS.DIMENSION_SHIFT);
      }
    }
  };

  /* Glitch character set for authentic corruption */
  const glitchChars = '!@#$%^&*()_+{}|:<>?-=[]\\;\',./`~ĂĐĚĽŇŘŦŽ¡¿©®±×÷';

  /* Letter state management */
  const letters = [];
  const originalText = title.textContent;
  
  /* Character fragment presets for decomposition effect */
  const fragmentPresets = [
    // Top half
    { clip: "rect(0, auto, 50%, 0)" },
    // Bottom half
    { clip: "rect(50%, auto, auto, 0)" },
    // Left half
    { clip: "rect(0, 50%, auto, 0)" },
    // Right half
    { clip: "rect(0, auto, auto, 50%)" },
    // Top-left quarter
    { clip: "rect(0, 50%, 50%, 0)" },
    // Top-right quarter
    { clip: "rect(0, auto, 50%, 50%)" },
    // Bottom-left quarter
    { clip: "rect(50%, 50%, auto, 0)" },
    // Bottom-right quarter
    { clip: "rect(50%, auto, auto, 50%)" }
  ];

  /* Initialize letter DOM structure */
  function initializeLetters() {
    title.innerHTML = '';
    
    for (let i = 0; i < originalText.length; i++) {
      const char = originalText[i];
      const span = document.createElement('span');
      span.className = 'tg-letter';
      span.textContent = char;
      span.style.display = 'inline-block';
      span.dataset.index = i;
      
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
          convergenceError: 0,
          fragments: [],         /* Character fragments for decomposition */
          zPosition: 0,          /* Z-axis position for 3D transforms */
          fragmentsActive: false /* Track if this letter is currently fragmented */
        }
      });
      
      title.appendChild(span);
    }
    
    // Setup phosphor trails container
    const trailsContainer = document.createElement('div');
    trailsContainer.className = 'title-phosphor-trails';
    trailsContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:-1;';
    title.appendChild(trailsContainer);
  }

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
    
    // Update title thermal level
    TitleState.updateThermalLevel(Math.abs(wearPatterns.thermalStress) / CRT_CONSTANTS.THERMAL_STRESS_MAX);
  }

  /* Color temperature to RGB conversion for authentic CRT warmth/coolness */
  function colorTemperatureToRGB(kelvin) {
    let temp = kelvin / 100;
    let r, g, b;
    
    // Red component
    if (temp <= 66) {
      r = 255;
    } else {
      r = temp - 60;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      r = Math.max(0, Math.min(255, r));
    }
    
    // Green component
    if (temp <= 66) {
      g = temp;
      g = 99.4708025861 * Math.log(g) - 161.1195681661;
    } else {
      g = temp - 60;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
    }
    g = Math.max(0, Math.min(255, g));
    
    // Blue component
    if (temp >= 66) {
      b = 255;
    } else if (temp <= 19) {
      b = 0;
    } else {
      b = temp - 10;
      b = 138.5177312231 * Math.log(b) - 305.0447927307;
      b = Math.max(0, Math.min(255, b));
    }
    
    return {r: Math.round(r), g: Math.round(g), b: Math.round(b)};
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
    
    // Add z-axis movement for dimensional depth
    const zDisplace = TitleState.dimensionalDepth * 
                      Math.sin(localPhase * 0.5) * 
                      CRT_CONSTANTS.PERSPECTIVE_MAX * 
                      globalIntensity;
    
    return { xDisplace, yDisplace, zDisplace, rotation };
  }
  
  /* Create phosphor trail for persistence simulation */
  function createPhosphorTrail(letter, intensity) {
    if (performanceMode || performanceLevel === 'low') return;
    
    const trailsContainer = document.querySelector('.title-phosphor-trails');
    if (!trailsContainer) return;
    
    const rect = letter.element.getBoundingClientRect();
    const parentRect = title.getBoundingClientRect();
    
    // Create trail element
    const trail = document.createElement('div');
    trail.className = 'phosphor-trail';
    trail.textContent = letter.currentChar;
    
    // Position trail relative to container
    trail.style.cssText = `
      position: absolute;
      left: ${rect.left - parentRect.left}px;
      top: ${rect.top - parentRect.top}px;
      font-size: ${window.getComputedStyle(letter.element).fontSize};
      font-weight: ${window.getComputedStyle(letter.element).fontWeight};
      color: rgba(232, 227, 216, ${0.5 * intensity});
      opacity: ${intensity * 0.8};
      text-shadow: 
        0 0 ${3 * intensity}px rgba(232, 227, 216, ${0.6 * intensity}),
        0 0 ${6 * intensity}px rgba(0, 255, 200, ${0.3 * intensity});
      transform: ${letter.element.style.transform || 'none'};
      pointer-events: none;
      z-index: -1;
    `;
    
    trailsContainer.appendChild(trail);
    TitleCleanup.registerElement(trail);
    
    // Decay animation
    let opacity = intensity * 0.8;
    const decayRate = opacity / 10;
    
    const decayInterval = setInterval(() => {
      opacity -= decayRate;
      if (opacity <= 0) {
        clearInterval(decayInterval);
        if (trail.parentNode) {
          trail.parentNode.removeChild(trail);
        }
      } else {
        trail.style.opacity = opacity.toString();
      }
    }, 50);
    
    TitleCleanup.registerTimer(decayInterval);
  }
  
  /* Create character fragments for decomposition effect */
  function createCharacterFragments(letter, intensity) {
    if (performanceMode || performanceLevel === 'low' || 
        letter.glitchState.fragmentsActive) return;
    
    letter.glitchState.fragmentsActive = true;
    
    // Store original letter position and styling
    const rect = letter.element.getBoundingClientRect();
    const parentRect = title.getBoundingClientRect();
    const styles = window.getComputedStyle(letter.element);
    
    // Hide original letter temporarily
    const originalVisibility = letter.element.style.visibility;
    letter.element.style.visibility = 'hidden';
    
    // Create 2-4 fragments
    const fragmentCount = Math.floor(2 + Math.random() * 3);
    const fragments = [];
    
    for (let i = 0; i < fragmentCount; i++) {
      const fragment = document.createElement('div');
      fragment.className = 'letter-fragment';
      fragment.textContent = letter.currentChar;
      
      // Apply a random fragment preset
      const preset = fragmentPresets[Math.floor(Math.random() * fragmentPresets.length)];
      
      // Calculate random displacement
      const xOffset = (Math.random() - 0.5) * 30 * intensity;
      const yOffset = (Math.random() - 0.5) * 30 * intensity;
      const rotationZ = (Math.random() - 0.5) * 40 * intensity;
      
      // Position fragment
      fragment.style.cssText = `
        position: absolute;
        left: ${rect.left - parentRect.left}px;
        top: ${rect.top - parentRect.top}px;
        font-size: ${styles.fontSize};
        font-weight: ${styles.fontWeight};
        color: ${styles.color};
        text-shadow: ${styles.textShadow};
        transform: translate(${xOffset}px, ${yOffset}px) rotate(${rotationZ}deg);
        clip: ${preset.clip};
        pointer-events: none;
        z-index: 25;
      `;
      
      title.appendChild(fragment);
      fragments.push(fragment);
      TitleCleanup.registerElement(fragment);
    }
    
    // Restore original letter after fragments are done
    const fragmentTimer = setTimeout(() => {
      fragments.forEach(fragment => {
        if (fragment.parentNode) {
          fragment.parentNode.removeChild(fragment);
        }
      });
      letter.glitchState.fragmentsActive = false;
      letter.element.style.visibility = originalVisibility;
    }, GLITCH_TIMINGS.FRAGMENT_DURATION);
    
    TitleCleanup.registerTimer(fragmentTimer);
  }
  
  /* Create phosphor bloom effect */
  function createPhosphorBloom(letter, intensity) {
    if (performanceMode || performanceLevel === 'low') return;
    
    // Create bloom overlay
    const rect = letter.element.getBoundingClientRect();
    const bloom = document.createElement('div');
    bloom.className = 'phosphor-bloom';
    
    // Apply bloom styles
    bloom.style.cssText = `
      position: absolute;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border-radius: 50%;
      background: radial-gradient(
        circle at center,
        rgba(0, 255, 200, ${0.4 * intensity}) 0%,
        rgba(0, 255, 200, ${0.2 * intensity}) 40%,
        rgba(0, 255, 200, 0) 70%
      );
      filter: blur(${4 * intensity}px);
      pointer-events: none;
      z-index: 24;
      opacity: ${intensity * 0.8};
    `;
    
    document.body.appendChild(bloom);
    TitleCleanup.registerElement(bloom);
    
    // Animate bloom expansion and fade
    let scale = 1;
    let opacity = intensity * 0.8;
    
    const bloomInterval = setInterval(() => {
      scale += 0.05;
      opacity -= 0.03;
      
      bloom.style.transform = `scale(${scale})`;
      bloom.style.opacity = opacity.toString();
      
      if (opacity <= 0) {
        clearInterval(bloomInterval);
        if (bloom.parentNode) {
          bloom.parentNode.removeChild(bloom);
        }
      }
    }, 16);
    
    TitleCleanup.registerTimer(bloomInterval);
  }

  /* Apply comprehensive glitch effects to a letter */
  function applyOptimizedGlitch(letter, baseIntensity) {
    let effectiveIntensity = baseIntensity;
    
    /* System state modulation */
    if (TitleState.mode === "stable") {
      effectiveIntensity *= 0.7 - TitleState.thermalLevel * 0.3;
    } else {
      effectiveIntensity *= 1.3 + TitleState.thermalLevel * 0.7;
    }

    /* Magnetic distortion with dimensional depth */
    const distortion = calculateMagneticDistortion(letter, effectiveIntensity);
    
    // Apply 3D transform with perspective for dimensional depth
    if (effectiveIntensity > INTENSITY_THRESHOLDS.Z_MOVEMENT) {
      letter.element.style.transform = 
        `translate3d(${distortion.xDisplace}px, ${distortion.yDisplace}px, ${distortion.zDisplace}px) 
         rotate3d(${Math.random()}, ${Math.random()}, ${Math.random()}, ${distortion.rotation}deg)`;
      
      // Enhanced 3D effect with perspective
      title.style.perspective = '800px';
      title.style.perspectiveOrigin = '50% 50%';
      title.style.transformStyle = 'preserve-3d';
    } else {
      letter.element.style.transform = 
        `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;
    }
    
    /* Ensure transform isolation */
    letter.element.style.position = 'relative';
    letter.element.style.display = 'inline-block';
    letter.element.style.zIndex = '1';
    
    // RGB convergence error effects with dynamic color temperature
    if (effectiveIntensity > INTENSITY_THRESHOLDS.RGB_SEPARATION) {
      const convergenceError = CRT_CONSTANTS.CONVERGENCE_ERROR_BASE * (1.5 + letter.normalizedX * 0.8);
      const redOffset = convergenceError * (1 + wearPatterns.convergenceWear);
      const blueOffset = convergenceError * (1 + wearPatterns.convergenceWear * 0.8);
      
      // Convert color temperature to RGB values
      const tempRGB = colorTemperatureToRGB(wearPatterns.colorTemperature);
      const redIntensity = tempRGB.r / 255;
      const greenIntensity = tempRGB.g / 255;
      const blueIntensity = tempRGB.b / 255;
      
      const shadowLayers = [
        `${redOffset}px 0 rgba(255, ${64 * redIntensity}, ${32 * redIntensity}, ${effectiveIntensity * 0.8})`,
        `${-blueOffset}px 0 rgba(${64 * blueIntensity}, ${128 * blueIntensity}, 255, ${effectiveIntensity * 0.8})`,
        `0 0 ${effectiveIntensity * 15}px rgba(${tempRGB.r}, ${tempRGB.g}, ${tempRGB.b}, ${effectiveIntensity * 0.6})`,
        `0 0 ${effectiveIntensity * 30}px rgba(0, 255, 200, ${effectiveIntensity * 0.3})`
      ];
      
      letter.element.style.textShadow = shadowLayers.join(', ');
    }
    
    // Character replacement with partial corruption
    if (effectiveIntensity > INTENSITY_THRESHOLDS.CHARACTER_REPLACE) {
      const letterWear = wearPatterns.phosphorWear.get(letters.indexOf(letter)) || 0;
      const replaceChance = 0.6 + letterWear * 3;
      
      if (Math.random() < replaceChance) {
        // Enhanced partial character corruption
        let newChar = letter.originalChar;
        
        // 70% chance of full replacement, 30% chance of partial corruption
        if (Math.random() < 0.7) {
          newChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          // Partial corruption - replace part of the character
          const parts = letter.originalChar.split('');
          const corruptIndex = Math.floor(Math.random() * parts.length);
          parts[corruptIndex] = glitchChars[Math.floor(Math.random() * glitchChars.length)];
          newChar = parts.join('');
        }
        
        letter.element.textContent = newChar;
        letter.currentChar = newChar;
        
        const restoreTimer = setTimeout(() => {
          if (letter.element.textContent === newChar) {
            letter.element.textContent = letter.originalChar;
            letter.currentChar = letter.originalChar;
          }
        }, GLITCH_TIMINGS.RESTORE_DELAY + Math.random() * 40);
        TitleCleanup.registerTimer(restoreTimer);
      }
    }
    
    // Brightness modulation with phosphor glow simulation
    if (effectiveIntensity > INTENSITY_THRESHOLDS.BRIGHTNESS_MOD) {
      const brightness = 0.7 + (effectiveIntensity * 0.6);
      const contrast = 1 + (effectiveIntensity * 0.4);
      letter.element.style.filter = `brightness(${brightness}) contrast(${contrast})`;
    }
    
    // Phosphor persistence trail effect
    if (effectiveIntensity > INTENSITY_THRESHOLDS.PHOSPHOR_TRAIL) {
      letter.element.classList.add('phosphor-glow');
      createPhosphorTrail(letter, effectiveIntensity);
      
      const glowTimer = setTimeout(() => {
        letter.element.classList.remove('phosphor-glow');
      }, 200 + Math.random() * 150);
      TitleCleanup.registerTimer(glowTimer);
      
      // Track phosphor wear
      const letterIndex = letters.indexOf(letter);
      const currentWear = wearPatterns.phosphorWear.get(letterIndex) || 0;
      wearPatterns.phosphorWear.set(letterIndex, currentWear + effectiveIntensity * 0.001);
    }
    
    // Apply phosphor bloom effect
    if (effectiveIntensity > 0.8 && Math.random() < 0.3) {
      createPhosphorBloom(letter, effectiveIntensity);
    }
    
    // Character decomposition for extreme glitches
    if (effectiveIntensity > INTENSITY_THRESHOLDS.DECOMPOSITION && 
        Math.random() < 0.25 && !letter.glitchState.fragmentsActive) {
      createCharacterFragments(letter, effectiveIntensity);
    }
    
    // Trigger cascade for extreme intensity
    if (effectiveIntensity > INTENSITY_THRESHOLDS.CASCADE_TRIGGER) {
      TitleState.triggerCascade(effectiveIntensity);
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
    const systemWear = Math.min(wearPatterns.magneticWear * 6, 0.5);
    const isStrongGlitch = Math.random() < 0.3;
    
    let baseIntensity = isStrongGlitch ? 
      (0.6 + Math.random() * 0.4) : 
      (Math.random() * 0.4 + systemWear);
    
    // System state modulation
    if (TitleState.mode === "stable") {
      baseIntensity *= 0.8 - TitleState.thermalLevel * 0.3;
    } else {
      baseIntensity *= 1.2 + TitleState.thermalLevel * 0.6;
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
  
  // Cleanup on page unload
  const cleanupHandler = () => {
    try {
      TitleCleanup.cleanupAll();
    } catch (error) {
      console.error('[Title] Cleanup failed:', error);
    }
  };
  
  window.addEventListener('beforeunload', cleanupHandler);
  window.addEventListener('pagehide', cleanupHandler);
  TitleCleanup.registerListener(window, 'beforeunload', cleanupHandler);
  TitleCleanup.registerListener(window, 'pagehide', cleanupHandler);
  
  // Start with performance-aware delay
  const startDelay = performanceMode ? 800 : 500;
  const initTimer = setTimeout(() => {
    requestAnimationFrame(runOptimizedGlitchSystem);
  }, startDelay);
  TitleCleanup.registerTimer(initTimer);
})();