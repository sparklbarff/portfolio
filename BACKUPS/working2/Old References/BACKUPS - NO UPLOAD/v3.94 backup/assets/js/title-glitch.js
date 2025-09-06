"use strict";

(function() {
  const title = document.getElementById('glitch-title');
  if (!title) return;
  
  const text = title.textContent;
  title.innerHTML = '';
  
  // Simplified letter setup for better performance
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
      normalizedX: i / (text.length - 1),
      glitchState: {
        active: false,
        intensity: 0,
        lastGlitch: 0
      }
    });
  }
  
  const glitchChars = '!@#$%^&*()_+{}|:<>?-=[]\\;\',./`~';
  
  // Simplified phosphor colors
  const phosphorColors = {
    red: 'rgba(255, 64, 32, 0.8)',
    green: 'rgba(32, 255, 64, 0.8)',
    blue: 'rgba(64, 128, 255, 0.8)'
  };

  // AMPLIFIED settings - 10% increase + color tracking/skewing effects
  const settings = {
    frameRate: 30,
    magneticFieldStrength: 0.22, // +10% from 0.2
    convergenceError: 0.88, // +10% from 0.8
    glitchChance: 0.066, // +10% from 0.06
    strongGlitchChance: 0.044, // +10% from 0.04
    
    // NEW: Color tracking system
    colorTrackingIntensity: 0.15,
    chromaSkewChance: 0.08,
    colorVibrateChance: 0.12,
    colorFadeChance: 0.06
  };

  // NEW: Organic wear pattern system
  const wearPatterns = {
    magneticWear: 0, // Accumulates over time
    convergenceWear: 0,
    phosphorWear: new Map(), // Per-letter wear tracking
    thermalStress: 0,
    powerSupplyWear: 0
  };

  // NEW: Color tracking and skewing system
  function applyColorTracking(letter, intensity) {
    const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
    const colorIntensity = intensity * settings.colorTrackingIntensity * (1 + wearLevel);
    
    // Color channel separation with organic drift
    if (Math.random() < settings.chromaSkewChance) {
      const redSkew = (Math.random() - 0.5) * colorIntensity * 3;
      const blueSkew = (Math.random() - 0.5) * colorIntensity * 2.5;
      const greenSkew = (Math.random() - 0.5) * colorIntensity * 1.8;
      
      letter.element.style.filter = `
        hue-rotate(${redSkew * 15}deg) 
        saturate(${0.8 + colorIntensity * 0.4}) 
        contrast(${1 + colorIntensity * 0.3})
        brightness(${0.9 + colorIntensity * 0.2})
      `;
    }
    
    // Color vibration effect
    if (Math.random() < settings.colorVibrateChance) {
      const vibratePhase = performance.now() * 0.01;
      const vibrateIntensity = colorIntensity * 0.8;
      
      letter.element.style.textShadow = `
        ${Math.sin(vibratePhase) * vibrateIntensity * 2}px 0 rgba(255, 64, 32, ${vibrateIntensity}),
        ${Math.cos(vibratePhase * 1.3) * vibrateIntensity * 2}px 0 rgba(64, 128, 255, ${vibrateIntensity}),
        0 0 ${vibrateIntensity * 12}px rgba(232, 227, 216, ${vibrateIntensity * 0.6})
      `;
    }
    
    // Color fade tracking
    if (Math.random() < settings.colorFadeChance) {
      const fadeAmount = wearLevel * 0.3 + colorIntensity * 0.2;
      letter.element.style.opacity = Math.max(0.7, 1 - fadeAmount);
    }
  }

  // NEW: Accumulating wear simulation
  function updateWearPatterns() {
    // Magnetic field wear accumulates from constant operation
    wearPatterns.magneticWear += 0.0001;
    
    // Convergence wear from electron gun aging
    wearPatterns.convergenceWear += 0.00008;
    
    // Thermal stress cycles
    wearPatterns.thermalStress += Math.random() * 0.00005;
    
    // Power supply capacitor aging
    wearPatterns.powerSupplyWear += 0.00003;
    
    // Per-letter phosphor burn-in tracking
    letters.forEach(letter => {
      const currentWear = wearPatterns.phosphorWear.get(letter.position) || 0;
      const burnRate = 0.00002 * (1 + Math.random() * 0.5); // Random phosphor aging
      wearPatterns.phosphorWear.set(letter.position, currentWear + burnRate);
    });
  }

  // NEW: Cascade failure system
  function triggerCascadeFailure(triggerIntensity) {
    const cascadeChance = triggerIntensity * wearPatterns.magneticWear * 100;
    
    if (Math.random() < cascadeChance) {
      console.log('CASCADE FAILURE: Magnetic field instability triggered');
      
      // Magnetic instability affects multiple letters
      letters.forEach((letter, index) => {
        setTimeout(() => {
          const cascadeIntensity = triggerIntensity * (0.7 + Math.random() * 0.6);
          applyOptimizedGlitch(letter, cascadeIntensity);
          applyColorTracking(letter, cascadeIntensity);
          
          // Phosphor burn-in from cascade
          const burnWear = wearPatterns.phosphorWear.get(letter.position) || 0;
          wearPatterns.phosphorWear.set(letter.position, burnWear + 0.001);
          
        }, index * (20 + Math.random() * 30)); // Organic cascade timing
      });
      
      // Cascade affects system wear
      wearPatterns.convergenceWear += triggerIntensity * 0.001;
      wearPatterns.thermalStress += triggerIntensity * 0.002;
    }
  }

  // NEW: Realistic convergence errors based on screen position and wear
  function getRealisticConvergenceError(normalizedX) {
    const baseError = settings.convergenceError;
    const wearMultiplier = 1 + wearPatterns.convergenceWear * 50;
    const thermalEffect = 1 + wearPatterns.thermalStress * 30;
    
    // Real CRTs have worse convergence at edges and corners
    const edgeDistance = Math.abs(normalizedX - 0.5) * 2;
    const edgeMultiplier = 1 + edgeDistance * edgeDistance * 0.8;
    
    // Yoke distortion creates non-linear convergence errors
    const yokeDistortion = Math.sin(normalizedX * Math.PI) * 0.3;
    
    return baseError * wearMultiplier * thermalEffect * edgeMultiplier * (1 + yokeDistortion);
  }

  // ENHANCED: Magnetic distortion with organic wear patterns
  function getMagneticDistortion(normalizedX, intensity) {
    const fieldAngle = magneticPhase + (normalizedX * Math.PI);
    const wearEffect = 1 + wearPatterns.magneticWear * 100;
    const fieldStrength = intensity * settings.magneticFieldStrength * wearEffect;
    
    // Multiple interfering magnetic fields (realistic CRT behavior)
    const primaryField = Math.sin(fieldAngle) * fieldStrength;
    const deflectionCoil = Math.cos(fieldAngle * 1.3 + wearPatterns.thermalStress * 10) * fieldStrength * 0.7;
    const powerSupplyRipple = Math.sin(fieldAngle * 7.2) * fieldStrength * 0.3 * wearPatterns.powerSupplyWear * 20;
    
    // AMPLIFIED displacement - 10% increase
    const xDisplace = (primaryField + deflectionCoil + powerSupplyRipple) * 22; // +10% from 20
    const yDisplace = (deflectionCoil * 0.8 + powerSupplyRipple) * 11; // +10% from 10
    const rotation = (primaryField * 0.6 + powerSupplyRipple) * 6.6; // +10% from 6
    
    return { xDisplace, yDisplace, rotation };
  }
  
  // Enhanced glitch application with phosphor simulation
  function applyOptimizedGlitch(letter, intensity) {
    const distortion = getMagneticDistortion(letter.normalizedX, intensity);
    
    // Apply magnetic distortion with 10% amplification
    letter.element.style.transform = 
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;
    
    // Enhanced RGB separation with realistic convergence
    if (intensity > 0.4) {
      const convergenceError = getRealisticConvergenceError(letter.normalizedX);
      const baseOffset = convergenceError * intensity;
      const redOffset = baseOffset * (1 + letter.normalizedX * 0.3);
      const blueOffset = baseOffset * (1 + (1 - letter.normalizedX) * 0.3);
      
      // AMPLIFIED shadow effects - 10% increase
      letter.element.style.textShadow = `
        ${redOffset * 1.1}px 0 ${phosphorColors.red},
        ${-blueOffset * 1.1}px 0 ${phosphorColors.blue},
        0 0 ${intensity * 8.8}px rgba(232, 227, 216, ${intensity * 0.44}),
        0 0 ${intensity * 17.6}px rgba(0, 255, 200, ${intensity * 0.22})
      `;
    }
    
    // Character replacement with wear-based probability
    const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
    const replaceChance = 0.5 + wearLevel * 2; // Worn phosphor more likely to fail
    
    if (intensity > 0.6 && Math.random() < replaceChance) {
      const replacementChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      letter.element.textContent = replacementChar;
      
      setTimeout(() => {
        if (letter.element.textContent === replacementChar) {
          letter.element.textContent = letter.originalChar;
        }
      }, 80 + Math.random() * 60);
    }
    
    // Enhanced brightness modulation - 10% amplification
    if (intensity > 0.3) {
      const brightness = 0.835 + (intensity * 0.44); // AMPLIFIED
      letter.element.style.filter = `brightness(${brightness}) contrast(${1 + intensity * 0.22})`;
    }
    
    // Apply color tracking effects
    applyColorTracking(letter, intensity);
    
    // Trigger cascade failure check
    if (intensity > 0.7) {
      triggerCascadeFailure(intensity);
    }
    
    // Update wear patterns
    addPhosphorPersistence(letter, intensity);
    triggerScanlineInteraction(letter, intensity);
  }
  
  // Performance-aware glitch loop
  function runOptimizedGlitchLoop(currentTime) {
    performanceMode = document.documentElement.classList.contains('perf-reduce');
    
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
    
    const targetFrameRate = performanceMode ? 15 : settings.frameRate;
    if (currentTime - lastFrameTime < 1000 / targetFrameRate) {
      requestAnimationFrame(runOptimizedGlitchLoop);
      return;
    }
    
    lastFrameTime = currentTime;
    
    // Update organic wear patterns
    updateWearPatterns();
    
    // AMPLIFIED sync updates - 10% faster
    magneticPhase += performanceMode ? 0.0165 : 0.022; // +10%
    
    // Organic intensity with wear influence
    const wearInfluence = Math.min(wearPatterns.magneticWear * 10, 0.3);
    const isStrongGlitch = Math.random() < (settings.strongGlitchChance + wearInfluence);
    
    // AMPLIFIED base intensity - 10% increase
    const baseIntensity = isStrongGlitch ? 
      (0.77 + Math.random() * 0.33) : // +10% 
      (Math.random() * 0.275); // +10%
    
    const maxActiveGlitches = performanceMode ? 2 : letters.length;
    let activeGlitches = 0;
    
    letters.forEach(letter => {
      const timeSinceLastGlitch = currentTime - letter.glitchState.lastGlitch;
      const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
      
      // Organic glitch probability based on wear and thermal stress
      const organicGlitchChance = settings.glitchChance + 
        wearLevel * 0.1 + 
        wearPatterns.thermalStress * 0.05;
      
      const shouldGlitch = Math.random() < organicGlitchChance && 
                          activeGlitches < maxActiveGlitches &&
                          timeSinceLastGlitch > (100 - wearLevel * 50); // Worn elements glitch more frequently
      
      if (shouldGlitch) {
        const localIntensity = baseIntensity * (0.8 + Math.random() * 0.4);
        applyOptimizedGlitch(letter, localIntensity);
        letter.glitchState.active = true;
        letter.glitchState.intensity = localIntensity;
        letter.glitchState.lastGlitch = currentTime;
        activeGlitches++;
      } else if (letter.glitchState.active) {
        letter.glitchState.intensity *= 0.75;
        if (letter.glitchState.intensity < 0.08) {
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
  
  // Start with delay based on performance mode
  const startDelay = performanceMode ? 800 : 500;
  setTimeout(() => {
    requestAnimationFrame(runOptimizedGlitchLoop);
  }, startDelay);
})();