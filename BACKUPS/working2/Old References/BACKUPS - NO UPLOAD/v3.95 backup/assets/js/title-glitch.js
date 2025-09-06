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

  // MAXIMUM CHAOS settings - extreme action
  const settings = {
    frameRate: 30,
    magneticFieldStrength: 0.35, // MASSIVE increase from 0.22
    convergenceError: 1.2, // EXTREME from 0.88
    glitchChance: 0.15, // CONSTANT chaos from 0.066
    strongGlitchChance: 0.08, // FREQUENT mayhem from 0.044
    
    // EXTREME color tracking
    colorTrackingIntensity: 0.25, // +67% increase
    chromaSkewChance: 0.18, // CONSTANT color chaos
    colorVibrateChance: 0.25, // ALWAYS vibrating
    colorFadeChance: 0.12, // MORE fading
    
    // NEW: Signal integration
    colorBleedIntensity: 0.2,
    phosphorTrailLength: 8,
    interlaceFlickerChance: 0.3
  };

  // NEW: Phosphor persistence trail system
  const phosphorTrails = new Map();

  function createPhosphorTrail(letter, intensity) {
    const trailId = `trail-${letter.position}-${Date.now()}`;
    const trail = {
      element: letter.element.cloneNode(true),
      intensity: intensity,
      decay: 0.9,
      position: letter.element.getBoundingClientRect()
    };
    
    // Style the trail element
    trail.element.id = trailId;
    trail.element.style.position = 'absolute';
    trail.element.style.pointerEvents = 'none';
    trail.element.style.zIndex = '19'; // Behind main content
    trail.element.style.left = trail.position.left + 'px';
    trail.element.style.top = trail.position.top + 'px';
    trail.element.style.opacity = intensity * 0.6;
    trail.element.style.filter = 'blur(0.5px) brightness(1.2)';
    trail.element.style.textShadow = `
      0 0 4px rgba(232, 227, 216, ${intensity * 0.8}),
      0 0 8px rgba(0, 255, 200, ${intensity * 0.4})
    `;
    
    document.body.appendChild(trail.element);
    phosphorTrails.set(trailId, trail);
    
    // Animate trail decay
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
  }

  // NEW: Color bleeding system
  function applyColorBleeding(letter, intensity) {
    if (intensity < 0.4) return;
    
    const siblings = letters.filter(l => 
      Math.abs(l.position - letter.position) <= 2 && l !== letter
    );
    
    siblings.forEach(sibling => {
      const distance = Math.abs(sibling.position - letter.position);
      const bleedIntensity = intensity * settings.colorBleedIntensity * (1 / distance);
      
      if (bleedIntensity > 0.1) {
        const hueShift = (Math.random() - 0.5) * 30;
        sibling.element.style.filter = `
          hue-rotate(${hueShift}deg) 
          saturate(${1.2 + bleedIntensity * 0.5})
          brightness(${1 + bleedIntensity * 0.3})
        `;
        
        // Bleeding text shadow
        sibling.element.style.textShadow = `
          0 0 ${bleedIntensity * 6}px rgba(255, 64, 32, ${bleedIntensity * 0.6}),
          0 0 ${bleedIntensity * 10}px rgba(64, 128, 255, ${bleedIntensity * 0.4})
        `;
        
        setTimeout(() => {
          sibling.element.style.filter = '';
          sibling.element.style.textShadow = '';
        }, 200 + Math.random() * 300);
      }
    });
  }

  // NEW: Interlacing with field flicker
  function applyInterlacing(letter, intensity) {
    if (Math.random() < settings.interlaceFlickerChance) {
      const isEvenField = letter.position % 2 === 0;
      const flickerOffset = isEvenField ? -0.5 : 0.5;
      
      letter.element.style.transform += ` translateY(${flickerOffset}px)`;
      letter.element.style.opacity = isEvenField ? 0.85 : 1.0;
      
      // Field flicker animation
      const flickerCount = 3 + Math.floor(Math.random() * 4);
      let flickers = 0;
      
      const flickerInterval = setInterval(() => {
        letter.element.style.opacity = letter.element.style.opacity === '1' ? '0.85' : '1';
        flickers++;
        
        if (flickers >= flickerCount) {
          clearInterval(flickerInterval);
          letter.element.style.opacity = '';
        }
      }, 16); // 60fps flicker
    }
  }

  // ENHANCED: Extreme magnetic distortion
  function getMagneticDistortion(normalizedX, intensity) {
    const fieldAngle = magneticPhase + (normalizedX * Math.PI);
    const wearEffect = 1 + wearPatterns.magneticWear * 100;
    const fieldStrength = intensity * settings.magneticFieldStrength * wearEffect;
    
    // EXTREME multiple interfering fields
    const primaryField = Math.sin(fieldAngle) * fieldStrength;
    const deflectionCoil = Math.cos(fieldAngle * 1.3 + wearPatterns.thermalStress * 10) * fieldStrength * 0.8;
    const powerSupplyRipple = Math.sin(fieldAngle * 7.2) * fieldStrength * 0.4 * wearPatterns.powerSupplyWear * 25;
    const chaosField = Math.sin(fieldAngle * 3.7 + Math.random() * Math.PI) * fieldStrength * 0.6; // NEW: Pure chaos
    
    // MASSIVE displacement - extreme motion
    const xDisplace = (primaryField + deflectionCoil + powerSupplyRipple + chaosField) * 35; // EXTREME from 22
    const yDisplace = (deflectionCoil * 0.8 + powerSupplyRipple + chaosField * 0.7) * 18; // EXTREME from 11
    const rotation = (primaryField * 0.6 + powerSupplyRipple + chaosField * 0.4) * 12; // EXTREME from 6.6
    
    return { xDisplace, yDisplace, rotation };
  }
  
  // ENHANCED: Color tracking with EXTREME chaos
  function applyColorTracking(letter, intensity) {
    const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
    const colorIntensity = intensity * settings.colorTrackingIntensity * (1 + wearLevel);
    
    // EXTREME color channel separation
    if (Math.random() < settings.chromaSkewChance) {
      const redSkew = (Math.random() - 0.5) * colorIntensity * 6; // DOUBLED
      const blueSkew = (Math.random() - 0.5) * colorIntensity * 5; // DOUBLED
      const greenSkew = (Math.random() - 0.5) * colorIntensity * 4; // DOUBLED
      
      letter.element.style.filter = `
        hue-rotate(${redSkew * 25}deg) 
        saturate(${0.6 + colorIntensity * 0.8}) 
        contrast(${1 + colorIntensity * 0.6})
        brightness(${0.8 + colorIntensity * 0.4})
      `;
    }
    
    // CONSTANT color vibration
    if (Math.random() < settings.colorVibrateChance) {
      const vibratePhase = performance.now() * 0.02; // FASTER vibration
      const vibrateIntensity = colorIntensity * 1.2; // MORE intense
      
      letter.element.style.textShadow = `
        ${Math.sin(vibratePhase) * vibrateIntensity * 4}px 0 rgba(255, 64, 32, ${vibrateIntensity}),
        ${Math.cos(vibratePhase * 1.3) * vibrateIntensity * 4}px 0 rgba(64, 128, 255, ${vibrateIntensity}),
        ${Math.sin(vibratePhase * 0.7) * vibrateIntensity * 3}px 0 rgba(32, 255, 64, ${vibrateIntensity * 0.8}),
        0 0 ${vibrateIntensity * 20}px rgba(232, 227, 216, ${vibrateIntensity * 0.8})
      `;
    }
    
    // MORE color fading
    if (Math.random() < settings.colorFadeChance) {
      const fadeAmount = wearLevel * 0.4 + colorIntensity * 0.3;
      letter.element.style.opacity = Math.max(0.6, 1 - fadeAmount);
    }
  }

  // ENHANCED: Cascade failure with EXTREME chaos
  function triggerCascadeFailure(triggerIntensity) {
    const cascadeChance = triggerIntensity * wearPatterns.magneticWear * 150; // MORE sensitive
    
    if (Math.random() < cascadeChance * 2) { // DOUBLED chance
      console.log('EXTREME CASCADE FAILURE: Total system chaos');
      
      // CHAOS affects ALL letters simultaneously
      letters.forEach((letter, index) => {
        const delay = index * (5 + Math.random() * 15); // FASTER cascade
        setTimeout(() => {
          const cascadeIntensity = triggerIntensity * (0.8 + Math.random() * 0.7); // HIGHER intensity
          
          // Apply ALL effects
          applyOptimizedGlitch(letter, cascadeIntensity);
          applyColorTracking(letter, cascadeIntensity);
          applyColorBleeding(letter, cascadeIntensity);
          applyInterlacing(letter, cascadeIntensity);
          createPhosphorTrail(letter, cascadeIntensity);
          
          // EXTREME phosphor burn-in
          const burnWear = wearPatterns.phosphorWear.get(letter.position) || 0;
          wearPatterns.phosphorWear.set(letter.position, burnWear + 0.003); // TRIPLED
          
        }, delay);
      });
      
      // CASCADE affects ALL system wear
      wearPatterns.convergenceWear += triggerIntensity * 0.003;
      wearPatterns.thermalStress += triggerIntensity * 0.005;
      wearPatterns.powerSupplyWear += triggerIntensity * 0.002;
    }
  }

  // ENHANCED: Glitch application with ALL signal integration effects
  function applyOptimizedGlitch(letter, intensity) {
    const distortion = getMagneticDistortion(letter.normalizedX, intensity);
    
    // Apply EXTREME magnetic distortion
    letter.element.style.transform = 
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;
    
    // EXTREME RGB separation
    if (intensity > 0.3) { // LOWERED threshold for more effects
      const convergenceError = getRealisticConvergenceError(letter.normalizedX);
      const baseOffset = convergenceError * intensity;
      const redOffset = baseOffset * (1 + letter.normalizedX * 0.4);
      const blueOffset = baseOffset * (1 + (1 - letter.normalizedX) * 0.4);
      
      // MASSIVE shadow effects
      letter.element.style.textShadow = `
        ${redOffset * 1.5}px 0 ${phosphorColors.red},
        ${-blueOffset * 1.5}px 0 ${phosphorColors.blue},
        0 0 ${intensity * 15}px rgba(232, 227, 216, ${intensity * 0.6}),
        0 0 ${intensity * 25}px rgba(0, 255, 200, ${intensity * 0.3})
      `;
    }
    
    // EXTREME character replacement
    const wearLevel = wearPatterns.phosphorWear.get(letter.position) || 0;
    const replaceChance = 0.7 + wearLevel * 3; // HIGHER base chance
    
    if (intensity > 0.4 && Math.random() < replaceChance) { // LOWERED threshold
      const replacementChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      letter.element.textContent = replacementChar;
      
      setTimeout(() => {
        if (letter.element.textContent === replacementChar) {
          letter.element.textContent = letter.originalChar;
        }
      }, 60 + Math.random() * 40); // FASTER restoration
    }
    
    // EXTREME brightness modulation
    if (intensity > 0.2) { // LOWERED threshold
      const brightness = 0.7 + (intensity * 0.6); // MORE dramatic range
      letter.element.style.filter = `brightness(${brightness}) contrast(${1 + intensity * 0.4})`;
    }
    
    // Apply ALL signal integration effects
    applyColorTracking(letter, intensity);
    applyColorBleeding(letter, intensity);
    applyInterlacing(letter, intensity);
    
    // Create phosphor trails for high intensity
    if (intensity > 0.5) {
      createPhosphorTrail(letter, intensity);
    }
    
    // EXTREME cascade trigger
    if (intensity > 0.6) { // LOWERED threshold
      triggerCascadeFailure(intensity);
    }
    
    addPhosphorPersistence(letter, intensity);
    triggerScanlineInteraction(letter, intensity);
  }

  // ENHANCED: Glitch loop with EXTREME chaos
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
    
    // EXTREME sync updates
    magneticPhase += performanceMode ? 0.025 : 0.035; // MUCH faster
    
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
  
  // Start with delay based on performance mode
  const startDelay = performanceMode ? 800 : 500;
  setTimeout(() => {
    requestAnimationFrame(runOptimizedGlitchLoop);
  }, startDelay);
})();