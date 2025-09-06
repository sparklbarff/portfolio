(function() {
  "use strict";
  
  const navLinks = document.querySelectorAll('#nav-list a');
  if (!navLinks.length) return;
  
  const originalText = Array.from(navLinks).map(link => link.textContent);
  const linkStates = Array.from(navLinks).map((link, index) => ({
    element: link,
    originalText: originalText[index],
    normalizedX: index / (navLinks.length - 1),
    glitchState: {
      active: false,
      intensity: 0,
      lastGlitch: 0
    }
  }));
  
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\\'"`~0123456789';
  
  // EXTREME CRT settings - maximum chaos
  const crtSettings = {
    frameRate: 30,
    magneticFieldStrength: 0.4, // MASSIVE increase from 0.275
    convergenceErrorBase: 1.5, // EXTREME from 1.1
    trackingErrorProbability: 0.06, // DOUBLED from 0.033
    glitchChance: 0.2, // CONSTANT chaos from 0.132
    maxSimultaneousGlitches: 4, // ALL nav items
    
    // EXTREME organic failure patterns
    cascadeFailureChance: 0.02, // MUCH higher
    thermalDriftChance: 0.03,
    powerSupplyInstability: 0.015,
    
    // NEW: Signal integration
    colorBleedRange: 2,
    interlaceFlickerChance: 0.4
  };
  
  // NEW: Navigation color bleeding
  function applyNavColorBleeding(linkState, intensity) {
    if (intensity < 0.4) return;
    
    const currentIndex = linkStates.indexOf(linkState);
    const bleedRange = crtSettings.colorBleedRange;
    
    linkStates.forEach((sibling, index) => {
      const distance = Math.abs(index - currentIndex);
      if (distance <= bleedRange && distance > 0) {
        const bleedIntensity = intensity * 0.3 * (1 / distance);
        
        if (bleedIntensity > 0.1) {
          const hueShift = (Math.random() - 0.5) * 40;
          sibling.element.style.filter = `
            hue-rotate(${hueShift}deg) 
            saturate(${1.3 + bleedIntensity * 0.7})
            brightness(${1 + bleedIntensity * 0.4})
          `;
          
          setTimeout(() => {
            sibling.element.style.filter = '';
          }, 150 + Math.random() * 200);
        }
      }
    });
  }

  // NEW: Navigation interlacing
  function applyNavInterlacing(linkState, intensity) {
    if (Math.random() < crtSettings.interlaceFlickerChance) {
      const linkIndex = linkStates.indexOf(linkState);
      const isEvenField = linkIndex % 2 === 0;
      const flickerOffset = isEvenField ? -0.3 : 0.3;
      
      linkState.element.style.transform += ` translateY(${flickerOffset}px)`;
      linkState.element.style.opacity = isEvenField ? 0.9 : 1.0;
      
      // Rapid field flicker
      const flickerCount = 2 + Math.floor(Math.random() * 3);
      let flickers = 0;
      
      const flickerInterval = setInterval(() => {
        linkState.element.style.opacity = linkState.element.style.opacity === '1' ? '0.9' : '1';
        flickers++;
        
        if (flickers >= flickerCount) {
          clearInterval(flickerInterval);
          linkState.element.style.opacity = '';
        }
      }, 16);
    }
  }

  // ENHANCED: Extreme magnetic distortion
  function calculateMagneticDistortion(linkState, globalIntensity) {
    const localPhase = globalMagneticPhase + (linkState.normalizedX * Math.PI);
    const wearMultiplier = 1 + navWearPatterns.groupMagneticWear * 120; // MORE sensitive
    const fieldIntensity = globalIntensity * crtSettings.magneticFieldStrength * wearMultiplier;
    
    // EXTREME multiple field interactions
    const primaryField = Math.sin(localPhase) * fieldIntensity;
    const secondaryField = Math.cos(localPhase * 1.3 + navWearPatterns.thermalStress * 12) * fieldIntensity * 0.7;
    const thermalDrift = Math.sin(localPhase * 0.3) * fieldIntensity * navWearPatterns.thermalStress * 8;
    const chaosField = Math.sin(localPhase * 2.7 + Math.random() * Math.PI) * fieldIntensity * 0.5; // NEW: Pure chaos
    
    // MASSIVE displacement
    const xDisplace = (primaryField + secondaryField + thermalDrift + chaosField) * 40; // EXTREME from 27.5
    const yDisplace = (secondaryField * 0.8 + thermalDrift + chaosField * 0.6) * 24; // EXTREME from 16.5
    const rotation = (primaryField * 0.3 + thermalDrift + chaosField * 0.4) * 18; // EXTREME from 13.2
    
    return { xDisplace, yDisplace, rotation };
  }
  
  // --- Priority 1: Temporal Sophistication ---
  // Use global CRTTemporalState from title-glitch.js

  // Helper: check if a persistent problem is active
  function isPersistent(problem) {
    return window.CRTTemporalState && window.CRTTemporalState.persistentProblems.has(problem) && window.CRTTemporalState.mode === "failure";
  }

  // --- Violent, Abrupt Glitches ---
  function applyViolentNavGlitch(linkState, intensity) {
    // Rapid shake
    if (Math.random() < 0.5) {
      linkState.element.style.animation = 'violentShake 0.18s cubic-bezier(.7,.1,.2,.9)';
      setTimeout(() => { linkState.element.style.animation = ''; }, 180);
    }
    // Sync loss: hard horizontal/vertical offset
    if (Math.random() < 0.3) {
      const x = (Math.random() - 0.5) * 16 * intensity;
      const y = (Math.random() - 0.5) * 8 * intensity;
      linkState.element.style.transform += ` translate(${x}px,${y}px)`;
    }
    // Hard color channel separation
    if (Math.random() < 0.4) {
      linkState.element.style.textShadow +=
        `,${intensity * 8}px 0 #00ffc8,${-intensity * 8}px 0 #ffdc80`;
    }
  }

  // --- Glitch Storms ---
  let navGlitchStormActive = false;
  function maybeStartNavGlitchStorm() {
    const state = window.CRTTemporalState || { mode: "stable", thermalLevel: 0 };
    if (!navGlitchStormActive && state.mode === "failure" && Math.random() < 0.15 + state.thermalLevel * 0.5) {
      navGlitchStormActive = true;
      setTimeout(() => { navGlitchStormActive = false; }, 1200 + Math.random() * 1800);
    }
  }

  // --- Overlapping Persistent Problems ---
  function updateNavPersistentProblems() {
    const state = window.CRTTemporalState || { persistentProblems: new Set(), mode: "stable", thermalLevel: 0 };
    if (state.mode === "failure") {
      if (Math.random() < 0.25) state.persistentProblems.add("scanlineWarp");
      if (Math.random() < 0.18) state.persistentProblems.add("colorBleed");
      if (Math.random() < 0.12) state.persistentProblems.add("phosphorBurn");
    } else if (state.mode === "stable" && Math.random() < 0.05) {
      const arr = Array.from(state.persistentProblems);
      if (arr.length) state.persistentProblems.delete(arr[Math.floor(Math.random() * arr.length)]);
    }
    setTimeout(updateNavPersistentProblems, 1200 + Math.random() * 1800);
  }
  updateNavPersistentProblems();

  // --- Surprise Glitches in Stable Mode ---
  function maybeSurpriseNavGlitch(linkState, intensity) {
    const state = window.CRTTemporalState || { mode: "stable", thermalLevel: 0 };
    if (state.mode === "stable" && Math.random() < 0.03 + state.thermalLevel * 0.07) {
      applyViolentNavGlitch(linkState, intensity * 1.2);
    }
  }

  // --- Integrate into nav glitch logic ---
  function applyOptimizedDistortion(linkState, intensity) {
    const state = window.CRTTemporalState || { mode: "stable", thermalLevel: 0 };
    let effectiveIntensity = intensity;
    if (state.mode === "stable") {
      effectiveIntensity *= 0.6 - state.thermalLevel * 0.2;
    } else {
      effectiveIntensity *= 1.2 + state.thermalLevel * 0.5;
    }

    // Violent glitches during failure or glitch storm
    maybeStartNavGlitchStorm();
    if (navGlitchStormActive || (state.mode === "failure" && Math.random() < 0.25 + state.thermalLevel * 0.2)) {
      applyViolentNavGlitch(linkState, effectiveIntensity * 1.5);
    }
    // Surprise glitches in stable mode
    maybeSurpriseNavGlitch(linkState, effectiveIntensity);

    // Persistent problems can overlap and accumulate
    if (isPersistent("scanlineWarp")) {
      linkState.element.style.transform += " skewY(" + ((Math.random() - 0.5) * 2.5) + "deg)";
    }
    if (isPersistent("colorBleed")) {
      applyNavColorBleeding(linkState, effectiveIntensity * 1.2);
    }
    if (isPersistent("phosphorBurn")) {
      linkState.element.classList.add('phosphor-burn');
      setTimeout(() => linkState.element.classList.remove('phosphor-burn'), 1200 + Math.random() * 800);
    }

    const distortion = calculateMagneticDistortion(linkState, effectiveIntensity);
    linkState.element.style.transform =
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;
    
    // EXTREME RGB separation
    if (effectiveIntensity > 0.3) { // LOWERED threshold
      const redOffset = convergenceError * (1.5 + linkState.normalizedX * 0.6); // INCREASED
      const blueOffset = convergenceError * (1.5 + (1 - linkState.normalizedX) * 0.6); // INCREASED
      
      const shadowLayers = [
        `${redOffset}px 0 ${phosphorColors.red}`,
        `${-blueOffset}px 0 ${phosphorColors.blue}`,
        `0 0 ${effectiveIntensity * 18}px rgba(232, 227, 216, ${effectiveIntensity * 0.6})`, // INCREASED
        `0 0 ${effectiveIntensity * 35}px rgba(0, 255, 200, ${effectiveIntensity * 0.3})` // INCREASED
      ];
      
      linkState.element.style.textShadow = shadowLayers.join(', ');
    }
    
    // EXTREME character replacement
    const linkWear = navWearPatterns.linkWear.get(linkStates.indexOf(linkState)) || 0;
    const replaceChance = 0.8 + linkWear * 4; // HIGHER base chance
    
    if (effectiveIntensity > 0.4 && Math.random() < replaceChance) { // LOWERED threshold
      const text = linkState.originalText;
      let newText = '';
      
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < (effectiveIntensity * 0.7 + linkWear)) { // HIGHER corruption rate
          newText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          newText += text[i];
        }
      }
      
      linkState.element.textContent = newText;
      
      setTimeout(() => {
        if (linkState.element.textContent === newText) {
          linkState.element.textContent = linkState.originalText;
        }
      }, 40 + Math.random() * 60); // FASTER restore
    }
    
    // EXTREME brightness modulation
    if (effectiveIntensity > 0.2) { // LOWERED threshold
      const brightness = 0.6 + (effectiveIntensity * 0.8); // MORE dramatic range
      const contrast = 1 + (effectiveIntensity * 0.6);
      linkState.element.style.filter = `brightness(${brightness}) contrast(${contrast})`;
    }
    
    // Apply ALL signal integration effects
    applyNavColorEffects(linkState, effectiveIntensity);
    applyNavColorBleeding(linkState, effectiveIntensity);
    applyNavInterlacing(linkState, effectiveIntensity);
    addNavPhosphorEffects(linkState, effectiveIntensity);
    
    if (effectiveIntensity > 0.6) { // LOWERED threshold
      triggerGroupCascadeFailure(effectiveIntensity);
    }
  }

  // ENHANCED: Glitch loop with EXTREME chaos
  function runOptimizedGlitchSystem(currentTime) {
    performanceMode = document.documentElement.classList.contains('perf-reduce');
    
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
    
    const targetFrameRate = performanceMode ? 15 : crtSettings.frameRate;
    if (currentTime - lastFrameTime < 1000 / targetFrameRate) {
      requestAnimationFrame(runOptimizedGlitchSystem);
      return;
    }
    
    lastFrameTime = currentTime;
    
    // Update organic wear patterns
    updateNavWearPatterns();
    
    // EXTREME sync updates
    globalMagneticPhase += performanceMode ? 0.04 : 0.055; // MUCH faster
    
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
  
  // Start with performance-aware delay
  const startDelay = performanceMode ? 500 : 300;
  setTimeout(() => {
    requestAnimationFrame(runOptimizedGlitchSystem);
  }, startDelay);
})();