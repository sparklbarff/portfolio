/*
 * CRT Navigation Glitch System  
 * Simulates CRT magnetic deflection errors affecting navigation elements
 * Physics: Magnetic coil interference creates geometric distortion patterns
 * Implementation: CSS transform manipulation with realistic timing patterns
 * Coordinates with title-glitch.js through shared temporal state system
 * Performance: Adaptive complexity reduction, unified frame rate management
 */
(function() {
  "use strict";
  
  const navLinks = document.querySelectorAll('#nav-list a');
  if (!navLinks.length) {
    console.warn('[Nav] No navigation links found');
    return;
  }

  // Navigation-specific CRT constants
  const NAV_CONSTANTS = {
    MAGNETIC_FIELD_STRENGTH: 0.4,       // Enhanced for navigation prominence
    CONVERGENCE_ERROR_BASE: 1.5,        // Navigation requires sharper convergence
    COLOR_BLEED_RANGE: 2,               // Adjacent link contamination distance
    INTERLACE_FLICKER_CHANCE: 0.4       // Field flicker probability
  };

  // Effect intensity thresholds
  const NAV_THRESHOLDS = {
    RGB_SEPARATION: 0.3,                // Color channel separation minimum
    CHARACTER_REPLACE: 0.4,             // Text corruption minimum
    BRIGHTNESS_MOD: 0.2,                // Luminance effect minimum
    CASCADE_TRIGGER: 0.6                // System cascade minimum
  };

  // Performance and timing constants
  const NAV_TIMINGS = {
    RESTORE_DELAY_BASE: 40,             // Character restore base time (ms)
    FLICKER_INTERVAL: 16,               // 60fps field flicker
    CASCADE_DELAY_BASE: 20,             // Cascade propagation delay
    WEAR_ACCUMULATION: 0.0001           // Per-frame degradation
  };

  // State management
  let performanceMode = false;
  let performanceLevel = 'high';
  let lastFrameTime = 0;
  let targetFPS = 30;

  // Navigation-specific magnetic phase
  let globalMagneticPhase = 0;
  let convergenceError = NAV_CONSTANTS.CONVERGENCE_ERROR_BASE;
  
  // CRT phosphor colors for navigation
  const phosphorColors = {
    red: 'rgba(255, 64, 32, 0.8)',
    green: 'rgba(32, 255, 64, 0.8)',
    blue: 'rgba(64, 128, 255, 0.8)'
  };
  
  // Navigation wear patterns system
  const navWearPatterns = {
    groupMagneticWear: 0,               // Group magnetic field degradation
    thermalStress: 0,                   // Thermal cycling effects
    trackingWear: 0,                    // Tracking system degradation
    linkWear: new Map(),                // Per-link wear tracking
    powerSupplyWear: 0                  // Power regulation instability
  };

  // Cleanup registry for navigation system
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
  
  // ADD MISSING ESSENTIAL VARIABLES
  const glitchChars = '!@#$%^&*()_+{}|:<>?-=[]\\;\',./`~';

  // Link state management
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
      }
    });
  });

  // Navigation CRT settings
  const crtSettings = {
    glitchChance: 0.25, // INCREASED from 0.2 for more chaos
    maxSimultaneousGlitches: 6, // INCREASED from 4 for more chaos
    trackingErrorProbability: 0.0008 // INCREASED from 0.0005
  };

  function updateNavWearPatterns() {
    // Organic wear accumulation - navigation-specific degradation
    navWearPatterns.groupMagneticWear += Math.random() * NAV_TIMINGS.WEAR_ACCUMULATION;
    navWearPatterns.thermalStress += (Math.random() - 0.5) * 0.0002;
    navWearPatterns.trackingWear += Math.random() * 0.00005;
    navWearPatterns.powerSupplyWear += Math.random() * 0.00008;
    
    // Cap wear values at realistic limits
    navWearPatterns.groupMagneticWear = Math.min(navWearPatterns.groupMagneticWear, 0.05);
    navWearPatterns.thermalStress = Math.max(0, Math.min(navWearPatterns.thermalStress, 0.08));
    navWearPatterns.trackingWear = Math.min(navWearPatterns.trackingWear, 0.03);
    navWearPatterns.powerSupplyWear = Math.min(navWearPatterns.powerSupplyWear, 0.04);
  }

  function updatePerformanceSettings() {
    const monitor = window.PerformanceMonitor;
    if (monitor) {
      performanceLevel = monitor.getPerformanceLevel();
      performanceMode = monitor.isLowEndDevice();
    } else {
      performanceMode = document.documentElement.classList.contains('perf-reduce');
    }
    
    // Use unified frame rate from CRTTemporalState
    if (window.CRTTemporalState) {
      targetFPS = window.CRTTemporalState.targetFPS;
    } else {
      // Fallback frame rates
      const fallbackRates = { low: 15, medium: 20, high: 30 };
      targetFPS = fallbackRates[performanceLevel] || 30;
    }
    
    // Adjust navigation-specific settings - MORE AGGRESSIVE
    switch (performanceLevel) {
      case 'low':
        crtSettings.glitchChance = 0.12; // INCREASED from 0.08
        crtSettings.maxSimultaneousGlitches = 2; // INCREASED from 1
        break;
      case 'medium':
        crtSettings.glitchChance = 0.18; // INCREASED from 0.12
        crtSettings.maxSimultaneousGlitches = 4; // INCREASED from 2
        break;
      default:
        crtSettings.glitchChance = 0.3; // INCREASED from 0.2
        crtSettings.maxSimultaneousGlitches = 8; // INCREASED from 4
    }
  }

  // Register with unified CRT system
  if (window.CRTTemporalState) {
    window.CRTTemporalState.registerSystem('nav');
  }

  function applyTrackingError() {
    // Physics: VHS tracking misalignment creates horizontal distortion
    const elements = document.querySelectorAll('header, nav, footer');
    const randomElement = elements[Math.floor(Math.random() * elements.length)];
    
    if (randomElement) {
      randomElement.classList.add('horizontal-hold-error');
      console.log('[Nav] Tracking error applied');
      
      const errorTimer = setTimeout(() => {
        randomElement.classList.remove('horizontal-hold-error');
      }, 800 + Math.random() * 500);
      NavCleanup.registerTimer(errorTimer);
    }
  }
  
  function applyNavColorEffects(linkState, effectIntensity) {
    // Physics: CRT color tracking errors affect navigation phosphor
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
  
  function addNavPhosphorEffects(linkState, effectIntensity) {
    // Physics: Navigation phosphor persistence creates afterglow
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

  // Enhanced navigation color bleeding with standardized constants
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

  // Enhanced navigation interlacing with standardized timing
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

  // Standardized magnetic distortion with enhanced field calculations
  function calculateMagneticDistortion(linkState, globalIntensity) {
    const localPhase = globalMagneticPhase + (linkState.normalizedX * Math.PI);
    const wearMultiplier = 1 + navWearPatterns.groupMagneticWear * 120;
    const fieldIntensity = globalIntensity * NAV_CONSTANTS.MAGNETIC_FIELD_STRENGTH * wearMultiplier;
    
    // Physics: Multiple magnetic field interactions create complex distortion
    const primaryField = Math.sin(localPhase) * fieldIntensity;
    const secondaryField = Math.cos(localPhase * 1.3 + navWearPatterns.thermalStress * 12) * fieldIntensity * 0.7;
    const thermalDrift = Math.sin(localPhase * 0.3) * fieldIntensity * navWearPatterns.thermalStress * 8;
    const chaosField = Math.sin(localPhase * 2.7 + Math.random() * Math.PI) * fieldIntensity * 0.5;
    
    // Implementation: Extreme displacement calculations for maximum visual impact
    const xDisplace = (primaryField + secondaryField + thermalDrift + chaosField) * 40;
    const yDisplace = (secondaryField * 0.8 + thermalDrift + chaosField * 0.6) * 24;
    const rotation = (primaryField * 0.3 + thermalDrift + chaosField * 0.4) * 18;
    
    return { xDisplace, yDisplace, rotation };
  }

  // Standardized glitch application with unified coordination
  function applyOptimizedDistortion(linkState, baseIntensity) {
    const crtState = window.CRTTemporalState || { mode: "stable", thermalLevel: 0 };
    let effectiveIntensity = baseIntensity;
    
    // System state modulation
    if (crtState.mode === "stable") {
      effectiveIntensity *= 0.6 - crtState.thermalLevel * 0.2;
    } else {
      effectiveIntensity *= 1.2 + crtState.thermalLevel * 0.5;
    }

    // Apply temporal behaviors
    maybeStartNavGlitchStorm();
    if (navGlitchStormActive || (crtState.mode === "failure" && Math.random() < 0.25 + crtState.thermalLevel * 0.2)) {
      applyViolentNavGlitch(linkState, effectiveIntensity * 1.5);
    }
    maybeSurpriseNavGlitch(linkState, effectiveIntensity);

    // Apply persistent problem overlays
    if (isPersistent("scanlineWarp")) {
      linkState.element.style.transform += " skewY(" + ((Math.random() - 0.5) * 2.5) + "deg)";
    }
    if (isPersistent("colorBleed")) {
      applyNavColorBleeding(linkState, effectiveIntensity * 1.2);
    }
    if (isPersistent("phosphorBurn")) {
      linkState.element.classList.add('phosphor-burn');
      const burnTimer = setTimeout(() => linkState.element.classList.remove('phosphor-burn'), 1200 + Math.random() * 800);
      NavCleanup.registerTimer(burnTimer);
    }

    // Core magnetic distortion
    const distortion = calculateMagneticDistortion(linkState, effectiveIntensity);
    linkState.element.style.transform =
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;
    
    // RGB separation effects with standardized thresholds
    if (effectiveIntensity > NAV_THRESHOLDS.RGB_SEPARATION) {
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
    
    // Character replacement with standardized timing
    const linkWear = navWearPatterns.linkWear.get(linkStates.indexOf(linkState)) || 0;
    const replaceChance = 0.8 + linkWear * 4;
    
    if (effectiveIntensity > NAV_THRESHOLDS.CHARACTER_REPLACE && Math.random() < replaceChance) {
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
    
    // Brightness modulation with standardized thresholds
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
    
    // Trigger cascade for extreme intensity
    if (effectiveIntensity > NAV_THRESHOLDS.CASCADE_TRIGGER) {
      triggerGroupCascadeFailure(effectiveIntensity);
    }
  }

  // Performance-optimized glitch system
  function runOptimizedGlitchSystem(currentTime) {
    updatePerformanceSettings();
    
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
    
    // EXTREME tracking error with wear
    const wearInfluence = navWearPatterns.trackingWear * 30; // MORE sensitive
    if (Math.random() < (crtSettings.trackingErrorProbability + wearInfluence)) {
      applyTrackingError();
    }
    
    // --- Priority 1: Temporal Sophistication ---
    // Use global CRTTemporalState from title-glitch.js

    const state = window.CRTTemporalState || { mode: "stable", thermalLevel: 0 };
    // EXTREME organic base intensity
    const systemWear = Math.min(navWearPatterns.groupMagneticWear * 8, 0.6); // MORE wear influence
    const isStrongGlitch = Math.random() < 0.4; // HIGHER strong glitch chance
    
    // EXTREME base intensity
    const baseIntensity = isStrongGlitch ? 
      (0.8 + Math.random() * 0.5) : // MAXIMUM chaos
      (Math.random() * 0.5 + systemWear); // HIGHER minimum
    
    if (state.mode === "stable") baseIntensity *= 0.7 - state.thermalLevel * 0.2;
    else baseIntensity *= 1.3 + state.thermalLevel * 0.5;
    
    let glitchChance = crtSettings.glitchChance;
    if (state.mode === "failure") glitchChance *= 2 + state.thermalLevel;
    else glitchChance *= 0.5 - state.thermalLevel * 0.2;
    
    const maxGlitches = performanceMode ? 2 : crtSettings.maxSimultaneousGlitches;
    let activeGlitches = 0;
    
    linkStates.forEach(linkState => {
      const timeSinceLastGlitch = currentTime - linkState.glitchState.lastGlitch;
      const linkWear = navWearPatterns.linkWear.get(linkStates.indexOf(linkState)) || 0;
      
      // EXTREME organic glitch probability
      const organicGlitchChance = glitchChance + 
        linkWear * 0.25 + 
        navWearPatterns.thermalStress * 0.15 +
        navWearPatterns.groupMagneticWear * 0.2; // MORE factors
      
      const shouldGlitch = Math.random() < organicGlitchChance && 
                          activeGlitches < maxGlitches &&
                          timeSinceLastGlitch > (80 - linkWear * 70); // MUCH faster glitching
      
      if (shouldGlitch) {
        const localIntensity = baseIntensity * (0.6 + Math.random() * 0.8);
        applyOptimizedDistortion(linkState, localIntensity);
        linkState.glitchState.active = true;
        linkState.glitchState.intensity = localIntensity;
        linkState.glitchState.lastGlitch = currentTime;
        activeGlitches++;
      } else if (linkState.glitchState.active) {
        linkState.glitchState.intensity *= 0.75; // FASTER decay
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
  
  // ADD MISSING TEMPORAL BEHAVIOR FUNCTIONS
  let navGlitchStormActive = false;
  function maybeStartNavGlitchStorm() {
    const state = window.CRTTemporalState;
    if (!navGlitchStormActive && state.mode === "failure" && Math.random() < 0.15 + state.thermalLevel * 0.5) {
      navGlitchStormActive = true;
      setTimeout(() => { navGlitchStormActive = false; }, 1500 + Math.random() * 2000);
    }
  }

  function applyViolentNavGlitch(linkState, intensity) {
    if (Math.random() < 0.5) {
      linkState.element.style.animation = 'violentShake 0.18s cubic-bezier(.7,.1,.2,.9)';
      setTimeout(() => { linkState.element.style.animation = ''; }, 180);
    }
    if (Math.random() < 0.4) {
      const x = (Math.random() - 0.5) * 18 * intensity;
      const y = (Math.random() - 0.5) * 10 * intensity;
      linkState.element.style.transform += ` translate(${x}px,${y}px)`;
    }
    if (Math.random() < 0.5) {
      linkState.element.style.textShadow +=
        `,${intensity * 10}px 0 #00ffc8,${-intensity * 10}px 0 #ffdc80`;
    }
  }

  function maybeSurpriseNavGlitch(linkState, intensity) {
    const state = window.CRTTemporalState;
    if (state.mode === "stable" && Math.random() < 0.04 + state.thermalLevel * 0.08) {
      applyViolentNavGlitch(linkState, intensity * 1.3);
    }
  }

  function isPersistent(problem) {
    return window.CRTTemporalState.persistentProblems.has(problem) && window.CRTTemporalState.mode === "failure";
  }

  function triggerGroupCascadeFailure(intensity) {
    console.log('[Nav] Group cascade triggered');
    if (window.CRTTemporalState) {
      window.CRTTemporalState.triggerUnifiedCascade(intensity, 'nav');
    }
  }

  // Cleanup on page unload
  const cleanupHandler = () => NavCleanup.cleanupAll();
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