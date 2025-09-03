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
  
  // Optimized CRT settings
  const crtSettings = {
    frameRate: 30, // Reduced from 60
    magneticFieldStrength: 0.25, // Reduced from 0.4
    convergenceErrorBase: 1.0, // Reduced from 1.5
    trackingErrorProbability: 0.03, // Reduced from 0.05
    glitchChance: 0.12, // Reduced from 0.15
    maxSimultaneousGlitches: 2 // Limit concurrent effects
  };
  
  // Simplified phosphor colors
  const phosphorColors = {
    red: 'rgba(255, 69, 0, 0.85)',
    green: 'rgba(0, 255, 100, 0.85)',
    blue: 'rgba(70, 130, 255, 0.85)'
  };
  
  let globalMagneticPhase = 0;
  let lastFrameTime = 0;
  let trackingErrorActive = false;
  let performanceMode = false;
  
  // Simplified magnetic distortion
  function calculateMagneticDistortion(linkState, globalIntensity) {
    const localPhase = globalMagneticPhase + (linkState.normalizedX * Math.PI);
    const fieldIntensity = globalIntensity * crtSettings.magneticFieldStrength;
    
    // Simplified field pattern
    const primaryField = Math.sin(localPhase) * fieldIntensity;
    const secondaryField = Math.cos(localPhase * 1.3) * fieldIntensity * 0.5;
    
    // Reduced displacement calculations
    const xDisplace = primaryField * 25;
    const yDisplace = secondaryField * 15;
    const rotation = primaryField * 0.3 * 12;
    
    return { xDisplace, yDisplace, rotation };
  }
  
  // Simplified convergence error
  function getConvergenceError(normalizedX, intensity) {
    const edgeDistance = Math.abs(normalizedX - 0.5) * 2;
    const baseError = crtSettings.convergenceErrorBase;
    return baseError * (0.5 + edgeDistance * 0.5) * intensity;
  }
  
  // Simplified tracking error (affects all elements)
  function applyTrackingError() {
    if (trackingErrorActive || performanceMode) return;
    
    trackingErrorActive = true;
    const verticalShift = (Math.random() - 0.5) * 20;
    const duration = 80 + Math.random() * 100;
    
    linkStates.forEach(linkState => {
      const originalTransform = linkState.element.style.transform || '';
      linkState.element.style.transform = `${originalTransform} translateY(${verticalShift}px)`;
      linkState.element.style.filter = 'brightness(1.3) contrast(1.6)';
    });
    
    setTimeout(() => {
      linkStates.forEach(linkState => {
        linkState.element.style.filter = '';
      });
      trackingErrorActive = false;
    }, duration);
  }
  
  // Optimized distortion application
  function applyOptimizedDistortion(linkState, intensity) {
    const distortion = calculateMagneticDistortion(linkState, intensity);
    const convergenceError = getConvergenceError(linkState.normalizedX, intensity);
    
    // Apply transform (keep this - core visual effect)
    linkState.element.style.transform = 
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;
    
    // Simplified RGB separation - only for higher intensity
    if (intensity > 0.5) {
      const redOffset = convergenceError * (1.1 + linkState.normalizedX * 0.4);
      const blueOffset = convergenceError * (1.1 + (1 - linkState.normalizedX) * 0.4);
      
      const shadowLayers = [
        `${redOffset}px 0 ${phosphorColors.red}`,
        `${-blueOffset}px 0 ${phosphorColors.blue}`,
        `0 0 ${intensity * 8}px rgba(255, 255, 255, ${intensity * 0.3})`
      ];
      
      linkState.element.style.textShadow = shadowLayers.join(', ');
    }
    
    // Simplified character replacement
    if (intensity > 0.6 && Math.random() < 0.6) {
      const text = linkState.originalText;
      let newText = '';
      
      // Replace fewer characters for better performance
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < (intensity * 0.5)) {
          newText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          newText += text[i];
        }
      }
      
      linkState.element.textContent = newText;
      
      // Faster restore
      setTimeout(() => {
        if (linkState.element.textContent === newText) {
          linkState.element.textContent = linkState.originalText;
        }
      }, 60 + Math.random() * 80);
    }
    
    // Simplified focus simulation
    if (intensity > 0.4) {
      const brightness = 0.9 + (intensity * 0.2);
      const contrast = 1 + (intensity * 0.3);
      linkState.element.style.filter = `brightness(${brightness}) contrast(${contrast})`;
    }
  }
  
  // Optimized main glitch loop
  function runOptimizedGlitchSystem(currentTime) {
    // Check performance mode
    performanceMode = document.documentElement.classList.contains('perf-reduce');
    
    if (document.documentElement.dataset.motion === "paused") {
      // Reset all states when paused
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
    
    // Adaptive frame rate
    const targetFrameRate = performanceMode ? 15 : crtSettings.frameRate;
    if (currentTime - lastFrameTime < 1000 / targetFrameRate) {
      requestAnimationFrame(runOptimizedGlitchSystem);
      return;
    }
    
    lastFrameTime = currentTime;
    
    // Simplified sync updates
    globalMagneticPhase += performanceMode ? 0.015 : 0.025;
    
    // Reduced tracking error frequency
    if (Math.random() < crtSettings.trackingErrorProbability) {
      applyTrackingError();
    }
    
    // Simplified intensity calculation
    const baseIntensity = Math.random() < 0.1 ? 
      (0.6 + Math.random() * 0.4) : 
      (Math.random() * 0.3);
    
    // Limit simultaneous glitches for performance
    let activeGlitches = 0;
    const maxGlitches = performanceMode ? 1 : crtSettings.maxSimultaneousGlitches;
    
    linkStates.forEach(linkState => {
      const timeSinceLastGlitch = currentTime - linkState.glitchState.lastGlitch;
      const shouldGlitch = Math.random() < crtSettings.glitchChance && 
                          activeGlitches < maxGlitches &&
                          timeSinceLastGlitch > 120; // Minimum cooldown
      
      if (shouldGlitch) {
        const localIntensity = baseIntensity * (0.7 + Math.random() * 0.6);
        applyOptimizedDistortion(linkState, localIntensity);
        linkState.glitchState.active = true;
        linkState.glitchState.intensity = localIntensity;
        linkState.glitchState.lastGlitch = currentTime;
        activeGlitches++;
      } else if (linkState.glitchState.active) {
        // Faster decay
        linkState.glitchState.intensity *= 0.8;
        if (linkState.glitchState.intensity < 0.1) {
          // Reset to normal state
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