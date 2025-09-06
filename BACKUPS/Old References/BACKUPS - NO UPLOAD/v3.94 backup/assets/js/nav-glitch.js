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
  
  // AMPLIFIED CRT settings - 10% increase + organic patterns
  const crtSettings = {
    frameRate: 30,
    magneticFieldStrength: 0.275, // +10% from 0.25
    convergenceErrorBase: 1.1, // +10% from 1.0
    trackingErrorProbability: 0.033, // +10% from 0.03
    glitchChance: 0.132, // +10% from 0.12
    maxSimultaneousGlitches: 2,
    
    // NEW: Organic failure patterns
    cascadeFailureChance: 0.008,
    thermalDriftChance: 0.015,
    powerSupplyInstability: 0.006
  };
  
  // NEW: Navigation wear tracking system
  const navWearPatterns = {
    groupMagneticWear: 0,
    trackingWear: 0,
    thermalStress: 0,
    linkWear: new Map() // Per-link wear tracking
  };
  
  let groupTrackingActive = false;
  
  // NEW: Group cascade failure system
  function triggerGroupCascadeFailure(triggerIntensity) {
    if (groupTrackingActive) return;
    
    const cascadeChance = triggerIntensity * navWearPatterns.groupMagneticWear * 50;
    
    if (Math.random() < crtSettings.cascadeFailureChance + cascadeChance) {
      console.log('NAV CASCADE: Group tracking failure triggered');
      groupTrackingActive = true;
      
      // All links affected in sequence
      linkStates.forEach((linkState, index) => {
        setTimeout(() => {
          const cascadeIntensity = triggerIntensity * (0.6 + Math.random() * 0.8);
          applyOptimizedDistortion(linkState, cascadeIntensity);
          
          // Apply color effects during cascade
          applyNavColorEffects(linkState, cascadeIntensity);
          
          // Update link wear
          const currentWear = navWearPatterns.linkWear.get(index) || 0;
          navWearPatterns.linkWear.set(index, currentWear + 0.002);
          
        }, index * (30 + Math.random() * 40)); // Organic cascade timing
      });
      
      // Cascade affects overall system
      navWearPatterns.trackingWear += triggerIntensity * 0.001;
      navWearPatterns.thermalStress += triggerIntensity * 0.0015;
      
      setTimeout(() => {
        groupTrackingActive = false;
      }, 2000 + Math.random() * 1000);
    }
  }

  // NEW: Navigation color effects system
  function applyNavColorEffects(linkState, intensity) {
    const wearLevel = navWearPatterns.linkWear.get(linkState.normalizedX * linkStates.length) || 0;
    
    // Color channel separation
    if (Math.random() < 0.1 + wearLevel) {
      const colorShift = intensity * (1 + wearLevel * 2);
      linkState.element.style.filter = `
        hue-rotate(${(Math.random() - 0.5) * colorShift * 20}deg)
        saturate(${0.7 + colorShift * 0.6})
        contrast(${1 + colorShift * 0.4})
      `;
    }
    
    // Color vibration
    if (Math.random() < 0.08) {
      const vibratePhase = performance.now() * 0.008;
      const vibrateAmount = intensity * 0.6;
      
      linkState.element.style.textShadow = `
        ${Math.sin(vibratePhase) * vibrateAmount * 3}px 0 rgba(255, 69, 0, ${vibrateAmount}),
        ${Math.cos(vibratePhase * 1.4) * vibrateAmount * 3}px 0 rgba(70, 130, 255, ${vibrateAmount}),
        0 0 ${vibrateAmount * 15}px rgba(232, 227, 216, ${vibrateAmount * 0.5})
      `;
    }
  }

  // NEW: Organic wear pattern updates
  function updateNavWearPatterns() {
    navWearPatterns.groupMagneticWear += 0.00008;
    navWearPatterns.trackingWear += 0.00006;
    navWearPatterns.thermalStress += Math.random() * 0.00004;
    
    // Per-link wear accumulation
    linkStates.forEach((linkState, index) => {
      const currentWear = navWearPatterns.linkWear.get(index) || 0;
      const wearRate = 0.00001 * (1 + Math.random() * 0.3);
      navWearPatterns.linkWear.set(index, currentWear + wearRate);
    });
  }
  
  // ENHANCED: Magnetic distortion with wear patterns and 10% amplification
  function calculateMagneticDistortion(linkState, globalIntensity) {
    const localPhase = globalMagneticPhase + (linkState.normalizedX * Math.PI);
    const wearMultiplier = 1 + navWearPatterns.groupMagneticWear * 80;
    const fieldIntensity = globalIntensity * crtSettings.magneticFieldStrength * wearMultiplier;
    
    // Multiple field interactions with thermal drift
    const primaryField = Math.sin(localPhase) * fieldIntensity;
    const secondaryField = Math.cos(localPhase * 1.3 + navWearPatterns.thermalStress * 8) * fieldIntensity * 0.5;
    const thermalDrift = Math.sin(localPhase * 0.3) * fieldIntensity * navWearPatterns.thermalStress * 5;
    
    // AMPLIFIED displacement - 10% increase
    const xDisplace = (primaryField + secondaryField + thermalDrift) * 27.5; // +10% from 25
    const yDisplace = (secondaryField * 0.8 + thermalDrift) * 16.5; // +10% from 15
    const rotation = (primaryField * 0.3 + thermalDrift) * 13.2; // +10% from 12
    
    return { xDisplace, yDisplace, rotation };
  }
  
  // ENHANCED: Convergence error with realistic positioning
  function getConvergenceError(normalizedX, intensity) {
    const baseError = crtSettings.convergenceErrorBase;
    const wearEffect = 1 + navWearPatterns.trackingWear * 60;
    
    // Navigation is typically horizontally centered - different convergence pattern
    const centerDistance = Math.abs(normalizedX - 0.5);
    const edgeMultiplier = 1 + centerDistance * centerDistance * 0.6;
    
    return baseError * wearEffect * edgeMultiplier * (1.1); // +10% amplification
  }
  
  // ENHANCED: Distortion application with wear and cascade effects
  function applyOptimizedDistortion(linkState, intensity) {
    const distortion = calculateMagneticDistortion(linkState, intensity);
    const convergenceError = getConvergenceError(linkState.normalizedX, intensity);
    
    linkState.element.style.transform = 
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;
    
    // Enhanced RGB separation - 10% amplification
    if (intensity > 0.5) {
      const redOffset = convergenceError * (1.21 + linkState.normalizedX * 0.44); // +10%
      const blueOffset = convergenceError * (1.21 + (1 - linkState.normalizedX) * 0.44); // +10%
      
      const shadowLayers = [
        `${redOffset}px 0 ${phosphorColors.red}`,
        `${-blueOffset}px 0 ${phosphorColors.blue}`,
        `0 0 ${intensity * 11}px rgba(232, 227, 216, ${intensity * 0.44})`, // +10%
        `0 0 ${intensity * 22}px rgba(0, 255, 200, ${intensity * 0.22})` // +10%
      ];
      
      linkState.element.style.textShadow = shadowLayers.join(', ');
    }
    
    // Character replacement with wear influence
    const linkWear = navWearPatterns.linkWear.get(linkStates.indexOf(linkState)) || 0;
    const replaceChance = 0.6 + linkWear * 3; // Worn links more likely to corrupt
    
    if (intensity > 0.6 && Math.random() < replaceChance) {
      const text = linkState.originalText;
      let newText = '';
      
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < (intensity * 0.5 + linkWear)) {
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
      }, 60 + Math.random() * 80);
    }
    
    // Enhanced brightness modulation - 10% amplification
    if (intensity > 0.4) {
      const brightness = 0.78 + (intensity * 0.55); // +10%
      const contrast = 1 + (intensity * 0.44); // +10%
      linkState.element.style.filter = `brightness(${brightness}) contrast(${contrast})`;
    }
    
    // Apply color effects and check for cascade
    applyNavColorEffects(linkState, intensity);
    addNavPhosphorEffects(linkState, intensity);
    
    if (intensity > 0.7) {
      triggerGroupCascadeFailure(intensity);
    }
  }

  // ENHANCED: Optimized glitch loop with organic timing and wear patterns
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
    
    // AMPLIFIED sync updates - 10% faster
    globalMagneticPhase += performanceMode ? 0.0275 : 0.0385; // +10%
    
    // Tracking error with wear influence
    const wearInfluence = navWearPatterns.trackingWear * 20;
    if (Math.random() < (crtSettings.trackingErrorProbability + wearInfluence)) {
      applyTrackingError();
    }
    
    // Organic base intensity with wear
    const systemWear = Math.min(navWearPatterns.groupMagneticWear * 5, 0.4);
    const isStrongGlitch = Math.random() < 0.3;
    
    // AMPLIFIED base intensity - 10% increase
    const baseIntensity = isStrongGlitch ? 
      (0.66 + Math.random() * 0.44) : // +10%
      (Math.random() * 0.33 + systemWear); // +10% + wear influence
    
    const maxGlitches = performanceMode ? 1 : crtSettings.maxSimultaneousGlitches;
    let activeGlitches = 0;
    
    linkStates.forEach(linkState => {
      const timeSinceLastGlitch = currentTime - linkState.glitchState.lastGlitch;
      const linkWear = navWearPatterns.linkWear.get(linkStates.indexOf(linkState)) || 0;
      
      // Organic glitch probability
      const organicGlitchChance = crtSettings.glitchChance + 
        linkWear * 0.15 + 
        navWearPatterns.thermalStress * 0.08;
      
      const shouldGlitch = Math.random() < organicGlitchChance && 
                          activeGlitches < maxGlitches &&
                          timeSinceLastGlitch > (120 - linkWear * 60);
      
      if (shouldGlitch) {
        const localIntensity = baseIntensity * (0.7 + Math.random() * 0.6);
        applyOptimizedDistortion(linkState, localIntensity);
        linkState.glitchState.active = true;
        linkState.glitchState.intensity = localIntensity;
        linkState.glitchState.lastGlitch = currentTime;
        activeGlitches++;
      } else if (linkState.glitchState.active) {
        linkState.glitchState.intensity *= 0.8;
        if (linkState.glitchState.intensity < 0.1) {
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