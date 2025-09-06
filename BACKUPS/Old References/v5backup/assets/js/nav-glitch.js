/*
 * CRT Navigation Glitch System  
 * Simulates CRT magnetic deflection errors affecting navigation elements
 * Physics: Magnetic coil interference creates geometric distortion patterns
 * Implementation: CSS transform manipulation with realistic timing patterns
 * Performance: Adaptive complexity reduction, unified frame rate management
 */
(function() {
  "use strict";
  
  const navLinks = document.querySelectorAll('#nav-list a');
  if (!navLinks.length) {
    console.warn('[Nav] No navigation links found');
    return;
  }

  /* Navigation-specific CRT constants */
  const NAV_CONSTANTS = {
    MAGNETIC_FIELD_STRENGTH: 0.4,       /* Enhanced for navigation prominence */
    CONVERGENCE_ERROR_BASE: 1.5,        /* Navigation requires sharper convergence */
    COLOR_BLEED_RANGE: 2,               /* Adjacent link contamination distance */
    INTERLACE_FLICKER_CHANCE: 0.4,      /* Field flicker probability */
    CURSOR_INFLUENCE_RADIUS: 150,       /* Mouse proximity effect radius (px) */
    CURSOR_STRENGTH: 0.25,              /* Mouse influence strength */
    MAGNETIC_DROPOUTS: 0.2,             /* VHS dropout probability */
    TRACKING_ERROR_AMPLITUDE: 4,        /* Tracking error line amplitude */
    ELECTRON_FOCUS_SPEED: 0.15,         /* Beam focusing transition speed */
    AUDIO_REACTIVITY: 0.04              /* Audio influence multiplier */
  };

  /* Effect intensity thresholds */
  const NAV_THRESHOLDS = {
    RGB_SEPARATION: 0.3,                /* Color channel separation minimum */
    CHARACTER_REPLACE: 0.4,             /* Text corruption minimum */
    BRIGHTNESS_MOD: 0.2,                /* Luminance effect minimum */
    CASCADE_TRIGGER: 0.6,               /* System cascade minimum */
    MAGNETIC_ATTRACTION: 0.1,           /* Minimum for magnetic attraction */
    TRACKING_ERROR: 0.4,                /* Minimum for tracking error lines */
    DROPOUT_MIN: 0.7                    /* Minimum for color dropout effect */
  };

  /* Performance frame rates per level */
  const FRAME_RATES = { LOW: 15, MEDIUM: 20, HIGH: 30 };

  /* Glitch timing constants */
  const NAV_TIMINGS = {
    RESTORE_DELAY_BASE: 40,             /* Character restore base time (ms) */
    FLICKER_INTERVAL: 16,               /* 60fps field flicker */
    CASCADE_DELAY_BASE: 20,             /* Cascade propagation delay */
    WEAR_ACCUMULATION: 0.0001,          /* Per-frame degradation */
    FOCUS_TRANSITION: 300,              /* Electron beam focus transition time */
    TRACKING_ERROR_DURATION: 180,       /* Tracking error line duration */
    DROPOUT_DURATION: 250               /* Color dropout effect duration */
  };

  /* Performance and state management */
  let performanceMode = false;
  let performanceLevel = 'high';
  let lastFrameTime = 0;
  let targetFPS = FRAME_RATES.HIGH;

  /* Navigation-specific magnetic phase */
  let globalMagneticPhase = 0;
  let convergenceError = NAV_CONSTANTS.CONVERGENCE_ERROR_BASE;
  
  /* Navigation-specific local state */
  const NavState = {
    mode: "stable",                     /* "stable", "failure", "cascade" */
    thermalLevel: 0,                    /* 0-1 thermal stress indicator */
    cascadeLevel: 0,                    /* 0-1 cascade failure intensity */
    persistentProblems: new Set(),      /* Set of ongoing issues */
    
    /* Nav-specific states */
    cursorPosition: { x: -1000, y: -1000 }, /* Current cursor position */
    audioAmplitude: 0,                  /* Current audio reactivity level 0-1 */
    trackingErrors: [],                 /* Active tracking error lines */
    magneticAttractions: {},            /* Per-link magnetic attraction state */
    dropoutActive: false,               /* Whether color dropout is active */
    
    updateThermalLevel(level) {
      this.thermalLevel = Math.max(0, Math.min(1, level));
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
    },
    
    // Update cursor position for magnetic effects
    updateCursorPosition(x, y) {
      this.cursorPosition.x = x;
      this.cursorPosition.y = y;
    },
    
    // Update audio amplitude for reactive effects
    updateAudioAmplitude(amplitude) {
      // Smoothly interpolate to avoid jarring changes
      this.audioAmplitude = this.audioAmplitude * 0.9 + amplitude * 0.1;
    }
  };
  
  /* CRT phosphor colors for navigation */
  const phosphorColors = {
    red: 'rgba(255, 64, 32, 0.8)',
    green: 'rgba(32, 255, 64, 0.8)',
    blue: 'rgba(64, 128, 255, 0.8)'
  };
  
  /* Navigation wear patterns system */
  const navWearPatterns = {
    groupMagneticWear: 0,               // Group magnetic field degradation
    thermalStress: 0,                   // Thermal cycling effects
    trackingWear: 0,                    // Tracking system degradation
    linkWear: new Map(),                // Per-link wear tracking
    powerSupplyWear: 0                  // Power regulation instability
  };

  /* Cleanup registry for navigation system */
  const NavCleanup = {
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
      console.log('[Nav] Cleanup completed');
    }
  };
  
  /* Glitch character set for authentic corruption */
  const glitchChars = '!@#$%^&*()_+{}|:<>?-=[]\\;\',./`~ĂĐĚĽŇŘŦŽ¡¿©®±×÷';

  /* Link state management with enhanced tracking */
  const linkStates = [];
  navLinks.forEach((link, index) => {
    linkStates.push({
      element: link,
      originalText: link.textContent,
      normalizedX: index / (navLinks.length - 1),
      glitchState: {
        active: false,
        intensity: 0,
        lastGlitch: 0
      },
      /* Nav-specific states */
      magneticState: {
        attraction: 0,
        lastAttraction: 0,
        focusIntensity: 0
      },
      audioReactiveState: {
        lastPeak: 0,
        peakIntensity: 0
      },
      vhsState: {
        dropoutActive: false,
        trackingErrorActive: false,
        lastDropout: 0
      }
    });
  });

  /* Navigation CRT settings */
  const crtSettings = {
    glitchChance: 0.25,                 // Base glitch probability
    maxSimultaneousGlitches: 6,         // Max concurrent glitches
    trackingErrorProbability: 0.0008    // Tracking error line probability
  };

  /* Update navigation wear patterns */
  function updateNavWearPatterns() {
    // Organic wear accumulation - navigation-specific degradation
    navWearPatterns.groupMagneticWear += Math.random() * NAV_TIMINGS.WEAR_ACCUMULATION;
    navWearPatterns.thermalStress += (Math.random() - 0.5) * 0.0002;
    navWearPatterns.trackingWear += Math.random() * 0.00005;
    navWearPatterns.powerSupplyWear += Math.random() * 0.00008;
    
    // Cap wear values at realistic limits
    navWearPatterns.groupMagneticWear = Math.min(navWearPatterns.groupMagneticWear, 0.05);
    navWearPatterns.thermalStress = Math.max(-0.08, Math.min(navWearPatterns.thermalStress, 0.08));
    navWearPatterns.trackingWear = Math.min(navWearPatterns.trackingWear, 0.03);
    navWearPatterns.powerSupplyWear = Math.min(navWearPatterns.powerSupplyWear, 0.04);
    
    // Update navigation thermal level
    NavState.updateThermalLevel(Math.abs(navWearPatterns.thermalStress));
  }

  /* Update performance settings */
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
    
    // Adjust navigation-specific settings
    switch (performanceLevel) {
      case 'low':
        crtSettings.glitchChance = 0.12;
        crtSettings.maxSimultaneousGlitches = 2;
        break;
      case 'medium':
        crtSettings.glitchChance = 0.18;
        crtSettings.maxSimultaneousGlitches = 4;
        break;
      default:
        crtSettings.glitchChance = 0.3;
        crtSettings.maxSimultaneousGlitches = 8;
    }
  }

  /* Apply tracking error effect */
  function applyTrackingError() {
    if (NavState.trackingErrors.length >= 2 || performanceMode) return;
    
    // Physics: VHS tracking misalignment creates horizontal distortion
    const navContainer = document.querySelector('nav');
    if (!navContainer) return;
    
    // Create tracking error line element
    const trackingLine = document.createElement('div');
    trackingLine.className = 'nav-tracking-error';
    
    // Get container dimensions
    const rect = navContainer.getBoundingClientRect();
    const yPosition = Math.random() * rect.height;
    
    // Calculate tracking error intensity
    const intensity = 0.6 + Math.random() * 0.4;
    const errorAmplitude = NAV_CONSTANTS.TRACKING_ERROR_AMPLITUDE * (1 + navWearPatterns.trackingWear * 10);
    
    // Apply tracking line styles
    trackingLine.style.cssText = `
      position: absolute;
      left: 0;
      top: ${yPosition}px;
      width: 100%;
      height: ${errorAmplitude}px;
      background: rgba(255, 255, 255, ${intensity * 0.5});
      box-shadow: 
        0 0 ${errorAmplitude}px rgba(255, 255, 255, ${intensity * 0.4}),
        0 0 ${errorAmplitude * 2}px rgba(0, 255, 200, ${intensity * 0.3});
      z-index: 22;
      pointer-events: none;
      transform: translateY(0);
    `;
    
    navContainer.appendChild(trackingLine);
    NavCleanup.registerElement(trackingLine);
    
    // Store tracking error state
    NavState.trackingErrors.push({
      element: trackingLine,
      startTime: performance.now(),
      intensity: intensity
    });
    
    console.log('[Nav] Tracking error applied');
    
    // Animate tracking error
    const trackingAnimation = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - NavState.trackingErrors[0].startTime;
      
      if (elapsed >= NAV_TIMINGS.TRACKING_ERROR_DURATION) {
        // Remove expired tracking error
        const error = NavState.trackingErrors.shift();
        if (error.element.parentNode) {
          error.element.parentNode.removeChild(error.element);
        }
        return;
      }
      
      // VHS tracking jitter simulation
      const jitterY = (Math.random() - 0.5) * errorAmplitude * 0.5;
      trackingLine.style.transform = `translateY(${jitterY}px)`;
      
      // Continue animation
      const animTimer = requestAnimationFrame(trackingAnimation);
      NavCleanup.registerTimer(animTimer);
    };
    
    const animTimer = requestAnimationFrame(trackingAnimation);
    NavCleanup.registerTimer(animTimer);
  }
  
  /* Apply navigation color effects */
  function applyNavColorEffects(linkState, effectIntensity) {
    if (effectIntensity < NAV_THRESHOLDS.RGB_SEPARATION) return;
    
    const hueShift = (Math.random() - 0.5) * effectIntensity * 60;
    const saturation = 1 + effectIntensity * 0.5;
    const brightness = 0.8 + effectIntensity * 0.4;
    
    linkState.element.style.filter = `
      hue-rotate(${hueShift}deg) 
      saturate(${saturation})
      brightness(${brightness})
    `;
    
    const resetTimer = setTimeout(() => {
      linkState.element.style.filter = '';
    }, 150 + Math.random() * 200);
    NavCleanup.registerTimer(resetTimer);
  }
  
  /* Apply VHS dropout effect to navigation */
  function applyNavDropoutEffect(linkState, intensity) {
    if (linkState.vhsState.dropoutActive || 
        NavState.dropoutActive || 
        intensity < NAV_THRESHOLDS.DROPOUT_MIN ||
        performanceMode) return;
    
    linkState.vhsState.dropoutActive = true;
    NavState.dropoutActive = true;
    
    // Store original colors
    const originalColor = window.getComputedStyle(linkState.element).color;
    const originalTextShadow = linkState.element.style.textShadow;
    
    // Calculate dropout color - authentic VHS color loss
    let dropoutColor;
    const dropoutType = Math.random();
    
    if (dropoutType < 0.33) {
      // Red dropout - only green and blue remain
      dropoutColor = 'rgba(0, 200, 255, 0.7)';
    } else if (dropoutType < 0.66) {
      // Green dropout - only red and blue remain
      dropoutColor = 'rgba(255, 0, 255, 0.7)';
    } else {
      // Blue dropout - only red and green remain
      dropoutColor = 'rgba(255, 200, 0, 0.7)';
    }
    
    // Apply dropout effect
    linkState.element.style.color = dropoutColor;
    linkState.element.style.textShadow = 'none';
    
    // Create glitchy static overlay
    const staticOverlay = document.createElement('div');
    staticOverlay.className = 'nav-static-overlay';
    
    const rect = linkState.element.getBoundingClientRect();
    staticOverlay.style.cssText = `
      position: absolute;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMDEwMTAiLz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMTAxMDEwIi8+PC9zdmc+');
      opacity: ${intensity * 0.3};
      mix-blend-mode: screen;
      pointer-events: none;
      z-index: 23;
    `;
    
    document.body.appendChild(staticOverlay);
    NavCleanup.registerElement(staticOverlay);
    
    // Restore after dropout duration
    const restoreTimer = setTimeout(() => {
      linkState.element.style.color = originalColor;
      linkState.element.style.textShadow = originalTextShadow;
      linkState.vhsState.dropoutActive = false;
      NavState.dropoutActive = false;
      
      if (staticOverlay.parentNode) {
        staticOverlay.parentNode.removeChild(staticOverlay);
      }
    }, NAV_TIMINGS.DROPOUT_DURATION);
    
    NavCleanup.registerTimer(restoreTimer);
  }
  
  /* Add phosphor glow effects to navigation links */
  function addNavPhosphorEffects(linkState, effectIntensity) {
    if (effectIntensity > 0.6) {
      linkState.element.classList.add('phosphor-glow');
      
      const glowTimer = setTimeout(() => {
        linkState.element.classList.remove('phosphor-glow');
      }, 300 + Math.random() * 200);
      NavCleanup.registerTimer(glowTimer);
      
      // Track phosphor wear for this link
      const linkIndex = linkStates.indexOf(linkState);
      const currentWear = navWearPatterns.linkWear.get(linkIndex) || 0;
      navWearPatterns.linkWear.set(linkIndex, currentWear + effectIntensity * 0.001);
    }
  }

  /* Apply color bleeding between navigation links */
  function applyNavColorBleeding(linkState, effectIntensity) {
    if (effectIntensity < NAV_THRESHOLDS.RGB_SEPARATION) return;
    
    const currentIndex = linkStates.indexOf(linkState);
    const bleedRange = NAV_CONSTANTS.COLOR_BLEED_RANGE;
    
    linkStates.forEach((sibling, index) => {
      const distance = Math.abs(index - currentIndex);
      if (distance <= bleedRange && distance > 0) {
        const bleedIntensity = effectIntensity * 0.3 * (1 / distance);
        
        if (bleedIntensity > 0.1) {
          const hueShift = (Math.random() - 0.5) * 40;
          sibling.element.style.filter = `
            hue-rotate(${hueShift}deg) 
            saturate(${1.3 + bleedIntensity * 0.7})
            brightness(${1 + bleedIntensity * 0.4})
          `;
          
          const resetTimer = setTimeout(() => {
            sibling.element.style.filter = '';
          }, 150 + Math.random() * 200);
          NavCleanup.registerTimer(resetTimer);
        }
      }
    });
  }

  /* Apply interlacing effects to navigation links */
  function applyNavInterlacing(linkState, effectIntensity) {
    if (Math.random() < NAV_CONSTANTS.INTERLACE_FLICKER_CHANCE) {
      const linkIndex = linkStates.indexOf(linkState);
      const isEvenField = linkIndex % 2 === 0;
      const flickerOffset = isEvenField ? -0.3 : 0.3;
      
      linkState.element.style.transform += ` translateY(${flickerOffset}px)`;
      linkState.element.style.opacity = isEvenField ? 0.9 : 1.0;
      
      // Physics: Field flicker at 60fps interlace rate
      const flickerCount = 2 + Math.floor(Math.random() * 3);
      let flickers = 0;
      
      const flickerInterval = setInterval(() => {
        linkState.element.style.opacity = linkState.element.style.opacity === '1' ? '0.9' : '1';
        flickers++;
        
        if (flickers >= flickerCount) {
          clearInterval(flickerInterval);
          linkState.element.style.opacity = '';
        }
      }, NAV_TIMINGS.FLICKER_INTERVAL);
      NavCleanup.registerTimer(flickerInterval);
    }
  }

  /* Calculate magnetic distortion for navigation links */
  function calculateMagneticDistortion(linkState, globalIntensity) {
    const localPhase = globalMagneticPhase + (linkState.normalizedX * Math.PI);
    const wearMultiplier = 1 + navWearPatterns.groupMagneticWear * 120;
    const fieldIntensity = globalIntensity * NAV_CONSTANTS.MAGNETIC_FIELD_STRENGTH * wearMultiplier;
    
    // Physics: Multiple magnetic field interactions create complex distortion
    const primaryField = Math.sin(localPhase) * fieldIntensity;
    const secondaryField = Math.cos(localPhase * 1.3 + navWearPatterns.thermalStress * 12) * fieldIntensity * 0.7;
    const thermalDrift = Math.sin(localPhase * 0.3) * fieldIntensity * navWearPatterns.thermalStress * 8;
    const chaosField = Math.sin(localPhase * 2.7 + Math.random() * Math.PI) * fieldIntensity * 0.5;
    
    // Implementation: Enhanced displacement calculations
    const xDisplace = (primaryField + secondaryField + thermalDrift + chaosField) * 40;
    const yDisplace = (secondaryField * 0.8 + thermalDrift + chaosField * 0.6) * 24;
    const rotation = (primaryField * 0.3 + thermalDrift + chaosField * 0.4) * 18;
    
    return { xDisplace, yDisplace, rotation };
  }

  /* Calculate cursor magnetic influence on links */
  function calculateCursorInfluence(linkState) {
    // Skip if no cursor position or feature disabled
    if (NavState.cursorPosition.x < 0 || performanceMode) return { x: 0, y: 0 };
    
    // Get element position
    const rect = linkState.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance to cursor
    const dx = NavState.cursorPosition.x - centerX;
    const dy = NavState.cursorPosition.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Skip if beyond influence radius
    if (distance > NAV_CONSTANTS.CURSOR_INFLUENCE_RADIUS) return { x: 0, y: 0 };
    
    // Calculate influence factor (stronger as cursor gets closer)
    const influenceFactor = 1 - (distance / NAV_CONSTANTS.CURSOR_INFLUENCE_RADIUS);
    const strength = influenceFactor * NAV_CONSTANTS.CURSOR_STRENGTH;
    
    // Track magnetic attraction state
    linkState.magneticState.attraction = strength;
    
    // Return normalized attraction vector
    return {
      x: dx * strength,
      y: dy * strength
    };
  }
  
  /* Calculate audio reactivity influence */
  function calculateAudioReactivity(linkState) {
    // Skip if no audio reactivity or feature disabled
    if (NavState.audioAmplitude < 0.05 || performanceMode) return 0;
    
    // Calculate per-link reactivity - varies across menu items
    const linkIndex = linkStates.indexOf(linkState);
    const normalizedPosition = linkIndex / (linkStates.length - 1);
    const phaseOffset = normalizedPosition * Math.PI * 2; // Distribute phase across menu
    
    // Use sine wave to create wave effect across navigation
    const waveEffect = Math.sin(globalMagneticPhase * 3 + phaseOffset);
    
    // Calculate reactivity intensity
    const reactivity = NavState.audioAmplitude * NAV_CONSTANTS.AUDIO_REACTIVITY * (0.5 + Math.abs(waveEffect) * 0.5);
    
    // Store peak data for aftereffects
    if (reactivity > linkState.audioReactiveState.peakIntensity) {
      linkState.audioReactiveState.peakIntensity = reactivity;
      linkState.audioReactiveState.lastPeak = performance.now();
    } else {
      // Decay peak intensity over time
      const timeSincePeak = performance.now() - linkState.audioReactiveState.lastPeak;
      if (timeSincePeak > 100) {
        linkState.audioReactiveState.peakIntensity *= 0.95;
      }
    }
    
    return reactivity;
  }
  
  /* Update electron beam focus effect for hover states */
  function updateElectronBeamFocus(linkState, isFocused) {
    if (performanceMode) return;
    
    // Target focus intensity
    const targetIntensity = isFocused ? 1.0 : 0.0;
    const currentIntensity = linkState.magneticState.focusIntensity;
    
    // Smooth transition to target
    const newIntensity = currentIntensity + (targetIntensity - currentIntensity) * NAV_CONSTANTS.ELECTRON_FOCUS_SPEED;
    linkState.magneticState.focusIntensity = newIntensity;
    
    // Apply electron beam focusing effect
    if (newIntensity > 0.01) {
      // Calculate focus glow intensity
      const glowIntensity = Math.min(1, newIntensity * 1.2);
      
      // Apply electron beam focusing effect
      linkState.element.style.textShadow = `
        0 0 ${4 * glowIntensity}px rgba(232, 227, 216, ${0.7 * glowIntensity}),
        0 0 ${8 * glowIntensity}px rgba(0, 255, 200, ${0.4 * glowIntensity})
      `;
      
      linkState.element.style.transition = `filter ${NAV_TIMINGS.FOCUS_TRANSITION}ms ease-out, 
                                           text-shadow ${NAV_TIMINGS.FOCUS_TRANSITION}ms ease-out`;
      
      // Adjust filter brightness
      linkState.element.style.filter = `brightness(${1 + 0.3 * glowIntensity})`;
    } else if (newIntensity < 0.01 && currentIntensity > 0.01) {
      // Reset styles only when transition is complete
      linkState.element.style.textShadow = '';
      linkState.element.style.filter = '';
      linkState.element.style.transition = '';
    }
  }

  /* Apply optimized distortion to navigation links */
  function applyOptimizedDistortion(linkState, baseIntensity) {
    let effectiveIntensity = baseIntensity;
    
    /* System state modulation */
    if (NavState.mode === "stable") {
      effectiveIntensity *= 0.7 - NavState.thermalLevel * 0.3;
    } else {
      effectiveIntensity *= 1.3 + NavState.thermalLevel * 0.7;
    }

    /* Calculate cursor magnetic influence */
    const cursorInfluence = calculateCursorInfluence(linkState);
    
    /* Calculate audio reactivity */
    const audioReactivity = calculateAudioReactivity(linkState);
    
    /* Combine with standard magnetic distortion */
    const distortion = calculateMagneticDistortion(linkState, effectiveIntensity);
    
    /* Apply combined transform */
    const totalX = distortion.xDisplace + cursorInfluence.x * 40 + audioReactivity * 15 * (Math.random() - 0.5);
    const totalY = distortion.yDisplace + cursorInfluence.y * 40 + audioReactivity * 10 * (Math.random() - 0.5);
    const totalRotation = distortion.rotation + audioReactivity * 20 * (Math.random() - 0.5);
    
    linkState.element.style.transform =
      `translate(${totalX}px, ${totalY}px) rotate(${totalRotation}deg)`;
    
    /* Ensure transform isolation */
    linkState.element.style.position = 'relative';
    linkState.element.style.display = 'inline-block';
    linkState.element.style.zIndex = '1';
    
    // RGB separation effects
    if (effectiveIntensity > NAV_THRESHOLDS.RGB_SEPARATION || audioReactivity > 0.1) {
      const redOffset = NAV_CONSTANTS.CONVERGENCE_ERROR_BASE * (1.5 + linkState.normalizedX * 0.6);
      const blueOffset = NAV_CONSTANTS.CONVERGENCE_ERROR_BASE * (1.5 + (1 - linkState.normalizedX) * 0.6);
      
      const shadowLayers = [
        `${redOffset}px 0 ${phosphorColors.red}`,
        `${-blueOffset}px 0 ${phosphorColors.blue}`,
        `0 0 ${effectiveIntensity * 18}px rgba(232, 227, 216, ${effectiveIntensity * 0.6})`,
        `0 0 ${effectiveIntensity * 35}px rgba(0, 255, 200, ${effectiveIntensity * 0.3})`
      ];
      
      linkState.element.style.textShadow = shadowLayers.join(', ');
    }
    
    // Character replacement with wear
    if (effectiveIntensity > NAV_THRESHOLDS.CHARACTER_REPLACE) {
      const linkWear = navWearPatterns.linkWear.get(linkStates.indexOf(linkState)) || 0;
      const replaceChance = 0.8 + linkWear * 4;
      
      if (Math.random() < replaceChance) {
        const text = linkState.originalText;
        let newText = '';
        
        for (let i = 0; i < text.length; i++) {
          if (Math.random() < (effectiveIntensity * 0.7 + linkWear)) {
            newText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
          } else {
            newText += text[i];
          }
        }
        
        linkState.element.textContent = newText;
        
        const restoreTimer = setTimeout(() => {
          if (linkState.element.textContent === newText) {
            linkState.element.textContent = linkState.originalText;
          }
        }, NAV_TIMINGS.RESTORE_DELAY_BASE + Math.random() * 60);
        NavCleanup.registerTimer(restoreTimer);
      }
    }
    
    // Brightness modulation
    if (effectiveIntensity > NAV_THRESHOLDS.BRIGHTNESS_MOD) {
      const brightness = 0.6 + (effectiveIntensity * 0.8);
      const contrast = 1 + (effectiveIntensity * 0.6);
      linkState.element.style.filter = `brightness(${brightness}) contrast(${contrast})`;
    }
    
    // Apply all signal integration effects
    applyNavColorEffects(linkState, effectiveIntensity);
    applyNavColorBleeding(linkState, effectiveIntensity);
    applyNavInterlacing(linkState, effectiveIntensity);
    addNavPhosphorEffects(linkState, effectiveIntensity);
    
    // Apply VHS dropout effects for extreme glitches
    if (effectiveIntensity > NAV_THRESHOLDS.DROPOUT_MIN && Math.random() < 0.2) {
      applyNavDropoutEffect(linkState, effectiveIntensity);
    }
    
    // Trigger cascade for extreme intensity
    if (effectiveIntensity > NAV_THRESHOLDS.CASCADE_TRIGGER) {
      NavState.triggerCascade(effectiveIntensity);
    }
  }

  /* Main glitch system loop */
  function runOptimizedGlitchSystem(currentTime) {
    updatePerformanceSettings();
    
    // Handle motion pause
    if (document.documentElement.dataset.motion === "paused") {
      linkStates.forEach(linkState => {
        linkState.element.style.transform = '';
        linkState.element.style.filter = '';
        linkState.element.style.textShadow = '';
        linkState.element.textContent = linkState.originalText;
        linkState.glitchState.active = false;
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
      updateNavWearPatterns();
      globalMagneticPhase += performanceMode ? 0.03 : 0.055;
    }
    
    // Apply tracking error with wear
    const wearInfluence = navWearPatterns.trackingWear * 30;
    if (Math.random() < (crtSettings.trackingErrorProbability + wearInfluence)) {
      applyTrackingError();
    }
    
    // Update electron beam focus effects for all links
    linkStates.forEach(linkState => {
      // Check if link is being hovered
      const isHovered = linkState.element.matches(':hover');
      updateElectronBeamFocus(linkState, isHovered);
    });
    
    // Organic base intensity with system state influence
    const systemWear = Math.min(navWearPatterns.groupMagneticWear * 8, 0.6);
    const isStrongGlitch = Math.random() < 0.4;
    
    let baseIntensity = isStrongGlitch ? 
      (0.8 + Math.random() * 0.5) : 
      (Math.random() * 0.5 + systemWear);
    
    // System state modulation
    if (NavState.mode === "stable") {
      baseIntensity *= 0.7 - NavState.thermalLevel * 0.3;
    } else {
      baseIntensity *= 1.3 + NavState.thermalLevel * 0.7;
    }
    
    // Calculate glitch chance
    let glitchChance = crtSettings.glitchChance;
    if (NavState.mode === "failure") {
      glitchChance *= 2 + NavState.thermalLevel;
    } else {
      glitchChance *= 0.5 - NavState.thermalLevel * 0.2;
    }
    
    // Apply glitches to links
    const maxGlitches = performanceMode ? 2 : crtSettings.maxSimultaneousGlitches;
    let activeGlitches = 0;
    
    linkStates.forEach(linkState => {
      const timeSinceLastGlitch = currentTime - linkState.glitchState.lastGlitch;
      const linkWear = navWearPatterns.linkWear.get(linkStates.indexOf(linkState)) || 0;
      
      // Organic glitch probability
      const organicGlitchChance = glitchChance + 
        linkWear * 0.25 + 
        NavState.thermalLevel * 0.15 +
        navWearPatterns.groupMagneticWear * 0.2;
      
      const shouldGlitch = Math.random() < organicGlitchChance && 
                          activeGlitches < maxGlitches &&
                          timeSinceLastGlitch > (80 - linkWear * 70);
      
      if (shouldGlitch) {
        const localIntensity = baseIntensity * (0.6 + Math.random() * 0.8);
        applyOptimizedDistortion(linkState, localIntensity);
        linkState.glitchState.active = true;
        linkState.glitchState.intensity = localIntensity;
        linkState.glitchState.lastGlitch = currentTime;
        activeGlitches++;
      } else if (linkState.glitchState.active) {
        linkState.glitchState.intensity *= 0.75;
        if (linkState.glitchState.intensity < 0.08) {
          linkState.element.style.transform = '';
          linkState.element.style.filter = '';
          linkState.element.style.textShadow = '';
          linkState.element.textContent = linkState.originalText;
          linkState.glitchState.active = false;
        }
      }
    });
    
    requestAnimationFrame(runOptimizedGlitchSystem);
  }
  
  /* Detect audio system for reactivity */
  function setupAudioReactivity() {
    if (!window.CRTTemporalState) return;
    
    // Listen for audio data from portfolio
    window.addEventListener('audioData', event => {
      if (event.detail && typeof event.detail.amplitude === 'number') {
        NavState.updateAudioAmplitude(event.detail.amplitude);
      }
    });
  }
  
  /* Setup mouse tracking for magnetic effects */
  function setupMouseTracking() {
    const mouseHandler = (e) => {
      NavState.updateCursorPosition(e.clientX, e.clientY);
    };
    
    document.addEventListener('mousemove', mouseHandler);
    NavCleanup.registerListener(document, 'mousemove', mouseHandler);
    
    // Reset cursor position when mouse leaves
    const mouseLeaveHandler = () => {
      NavState.updateCursorPosition(-1000, -1000);
    };
    
    document.addEventListener('mouseleave', mouseLeaveHandler);
    NavCleanup.registerListener(document, 'mouseleave', mouseLeaveHandler);
  }

  // Initialize audio reactivity and mouse tracking
  setupAudioReactivity();
  setupMouseTracking();
  
  // Cleanup on page unload
  const cleanupHandler = () => {
    try {
      NavCleanup.cleanupAll();
    } catch (error) {
      console.error('[Nav] Cleanup failed:', error);
    }
  };
  
  window.addEventListener('beforeunload', cleanupHandler);
  window.addEventListener('pagehide', cleanupHandler);
  NavCleanup.registerListener(window, 'beforeunload', cleanupHandler);
  NavCleanup.registerListener(window, 'pagehide', cleanupHandler);
  
  // Start with performance-aware delay
  const startDelay = performanceMode ? 500 : 300;
  const initTimer = setTimeout(() => {
    requestAnimationFrame(runOptimizedGlitchSystem);
  }, startDelay);
  NavCleanup.registerTimer(initTimer);
})();