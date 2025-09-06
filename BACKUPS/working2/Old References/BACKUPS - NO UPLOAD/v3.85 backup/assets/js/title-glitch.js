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
  
  // Optimized settings
  const settings = {
    frameRate: 30, // Reduced from 60 for better performance
    magneticFieldStrength: 0.2, // Reduced from 0.3
    convergenceError: 0.8, // Reduced from 1.2
    glitchChance: 0.06, // Reduced from 0.08
    strongGlitchChance: 0.04 // Reduced from 0.08
  };
  
  let lastFrameTime = 0;
  let magneticPhase = 0;
  let performanceMode = false;
  
  // Simplified magnetic distortion calculation
  function getMagneticDistortion(normalizedX, intensity) {
    const fieldAngle = magneticPhase + (normalizedX * Math.PI);
    const fieldStrength = intensity * settings.magneticFieldStrength;
    
    // Simplified curved displacement
    const xDisplace = Math.sin(fieldAngle) * fieldStrength * 20;
    const yDisplace = Math.cos(fieldAngle * 1.2) * fieldStrength * 10;
    const rotation = Math.sin(fieldAngle * 0.6) * fieldStrength * 6;
    
    return { xDisplace, yDisplace, rotation };
  }
  
  // Simplified convergence error
  function getConvergenceError(normalizedX) {
    const edgeDistance = Math.abs(normalizedX - 0.5) * 2;
    return settings.convergenceError * (0.4 + edgeDistance * 0.6);
  }
  
  // Optimized glitch application - focus on most impactful effects
  function applyOptimizedGlitch(letter, intensity) {
    const distortion = getMagneticDistortion(letter.normalizedX, intensity);
    
    // Apply magnetic distortion (keep this - it's the core visual effect)
    letter.element.style.transform = 
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;
    
    // Simplified RGB separation - only for high intensity
    if (intensity > 0.4) {
      const convergenceError = getConvergenceError(letter.normalizedX);
      const baseOffset = convergenceError * intensity;
      const redOffset = baseOffset * (1 + letter.normalizedX * 0.3);
      const blueOffset = baseOffset * (1 + (1 - letter.normalizedX) * 0.3);
      
      letter.element.style.textShadow = `
        ${redOffset}px 0 ${phosphorColors.red},
        ${-blueOffset}px 0 ${phosphorColors.blue},
        0 0 ${intensity * 6}px rgba(255, 255, 255, ${intensity * 0.2})
      `;
    }
    
    // Character replacement - simplified probability
    if (intensity > 0.6 && Math.random() < 0.5) {
      const replacementChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      letter.element.textContent = replacementChar;
      
      // Shorter restore time for better performance
      setTimeout(() => {
        if (letter.element.textContent === replacementChar) {
          letter.element.textContent = letter.originalChar;
        }
      }, 80 + Math.random() * 60);
    }
    
    // Simplified brightness modulation
    if (intensity > 0.3) {
      const brightness = 0.85 + (intensity * 0.3);
      letter.element.style.filter = `brightness(${brightness})`;
    }
  }
  
  // Performance-aware glitch loop
  function runOptimizedGlitchLoop(currentTime) {
    // Check performance mode
    performanceMode = document.documentElement.classList.contains('perf-reduce');
    
    if (document.documentElement.dataset.motion === "paused") {
      // Reset states when paused
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
    
    // Adaptive frame rate based on performance mode
    const targetFrameRate = performanceMode ? 15 : settings.frameRate;
    if (currentTime - lastFrameTime < 1000 / targetFrameRate) {
      requestAnimationFrame(runOptimizedGlitchLoop);
      return;
    }
    
    lastFrameTime = currentTime;
    
    // Simplified sync updates
    magneticPhase += performanceMode ? 0.015 : 0.02;
    
    // Reduced glitch intensity calculation
    const isStrongGlitch = Math.random() < settings.strongGlitchChance;
    const baseIntensity = isStrongGlitch ? 
      (0.7 + Math.random() * 0.3) : 
      (Math.random() * 0.25);
    
    // Performance mode: glitch fewer letters at once
    const maxActiveGlitches = performanceMode ? 2 : letters.length;
    let activeGlitches = 0;
    
    letters.forEach(letter => {
      const timeSinceLastGlitch = currentTime - letter.glitchState.lastGlitch;
      const shouldGlitch = Math.random() < settings.glitchChance && 
                          activeGlitches < maxActiveGlitches &&
                          timeSinceLastGlitch > 100; // Minimum cooldown
      
      if (shouldGlitch) {
        const localIntensity = baseIntensity * (0.8 + Math.random() * 0.4);
        applyOptimizedGlitch(letter, localIntensity);
        letter.glitchState.active = true;
        letter.glitchState.intensity = localIntensity;
        letter.glitchState.lastGlitch = currentTime;
        activeGlitches++;
      } else if (letter.glitchState.active) {
        // Faster decay for better performance
        letter.glitchState.intensity *= 0.75;
        if (letter.glitchState.intensity < 0.08) {
          // Reset to normal state
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