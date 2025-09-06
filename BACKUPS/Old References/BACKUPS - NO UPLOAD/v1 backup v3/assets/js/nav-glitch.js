// Nav glitch engine - enhanced for more erratic VHS-like behavior
(function() {
  "use strict";
  
  // Get all nav links
  const navLinks = document.querySelectorAll('#nav-list a');
  if (!navLinks.length) return;
  
  // More aggressive glitch settings
  const settings = {
    baseSpeed: 120,          // Base milliseconds between effects
    randRange: 800,          // Random additional time
    glitchChance: 0.25,      // Chance of glitch per cycle (increased)
    linkGlitchChance: 0.3,   // Chance per link (increased)
    colorGlitchChance: 0.4,  // Chance of color shift (increased)
    positionJitter: 2.5,     // Position distortion amount (increased)
    blurChance: 0.35,        // Chance of blur effect (increased)
    blurAmount: '1.8px',     // Blur amount (increased)
    skewChance: 0.45,        // Chance of skew (increased)
    skewAmount: '4deg',      // Skew amount (increased)
    letterGlitchChance: 0.2, // Chance of letter distortion (new)
    splitChance: 0.25,       // Chance of color split (new)
    noiseChance: 0.3,        // Chance of noise effect (new)
  };
  
  // Colors for RGB shifting
  const rgbColors = [
    'rgba(255, 0, 76, 0.8)',   // Red (increased opacity)
    'rgba(0, 255, 200, 0.8)',  // Cyan (increased opacity)
    'rgba(0, 170, 255, 0.8)'   // Blue (increased opacity)
  ];
  
  // Store original text for each link
  const originalText = Array.from(navLinks).map(link => link.textContent);
  
  // VHS noise patterns
  const noisePatterns = [
    'repeating-linear-gradient(110deg, rgba(255,255,255,0.15) 0px, transparent 1px, rgba(255,255,255,0.15) 2px)',
    'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0) 1px, rgba(255,255,255,0.18) 2px)',
    'linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 20%, rgba(255,255,255,0.15) 30%, transparent 40%)'
  ];
  
  // Distortion characters for text scrambling
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\\'"`~';
  
  // Link distortion effects - more VHS like
  function distortLink(link, index) {
    // Reset previous effects
    link.style.transform = '';
    link.style.filter = '';
    link.style.textShadow = '';
    link.style.color = '';
    link.style.background = '';
    link.style.opacity = '';
    
    // Apply random effects with higher intensity
    const effects = [];
    
    // Position jitter (more extreme)
    if (Math.random() < 0.7) {
      const xOffset = (Math.random() - 0.5) * settings.positionJitter * 2;
      const yOffset = (Math.random() - 0.5) * settings.positionJitter;
      effects.push(`translate(${xOffset}px, ${yOffset}px)`);
    }
    
    // Skew (more extreme)
    if (Math.random() < settings.skewChance) {
      const skewX = (Math.random() - 0.5) * parseFloat(settings.skewAmount) * 2;
      effects.push(`skewX(${skewX}deg)`);
    }
    
    // Random scaling (new)
    if (Math.random() < 0.2) {
      const scale = 0.95 + Math.random() * 0.1;
      effects.push(`scale(${scale})`);
    }
    
    // Apply transforms
    if (effects.length) {
      link.style.transform = effects.join(' ');
    }
    
    // Color RGB shift (more intense)
    if (Math.random() < settings.colorGlitchChance) {
      const colorIndex = Math.floor(Math.random() * rgbColors.length);
      link.style.color = rgbColors[colorIndex];
      
      // RGB split effect (new)
      if (Math.random() < settings.splitChance) {
        const shadowColor = rgbColors[(colorIndex + 1) % rgbColors.length];
        const xOffset = (Math.random() - 0.5) * 4;
        link.style.textShadow = `${xOffset}px 0 ${shadowColor}`;
      }
    }
    
    // Blur effect (more common)
    if (Math.random() < settings.blurChance) {
      const blurAmount = parseFloat(settings.blurAmount) * (1 + Math.random());
      link.style.filter = `blur(${blurAmount}px)`;
      link.style.opacity = '0.85';
    }
    
    // VHS noise overlay (new)
    if (Math.random() < settings.noiseChance) {
      const noisePattern = noisePatterns[Math.floor(Math.random() * noisePatterns.length)];
      link.style.background = noisePattern;
    }
    
    // Letter distortion (new) - scramble some characters
    if (Math.random() < settings.letterGlitchChance) {
      const text = originalText[index];
      let newText = '';
      
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < 0.2) { // 20% chance to change each letter
          newText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          newText += text[i];
        }
      }
      
      link.textContent = newText;
      
      // Restore after short delay
      setTimeout(() => {
        link.textContent = originalText[index];
      }, 100 + Math.random() * 150);
    }
  }
  
  // Apply glitch effect to all nav links
  function glitchNav() {
    if (Math.random() < settings.glitchChance) {
      // Individual link distortions
      navLinks.forEach((link, index) => {
        if (Math.random() < settings.linkGlitchChance) {
          distortLink(link, index);
        } else {
          // Reset this link
          link.style.transform = '';
          link.style.filter = '';
          link.style.textShadow = '';
          link.style.color = '';
          link.style.background = '';
          link.style.opacity = '';
          link.textContent = originalText[index];
        }
      });
    } else {
      // Reset all links
      navLinks.forEach((link, index) => {
        link.style.transform = '';
        link.style.filter = '';
        link.style.textShadow = '';
        link.style.color = '';
        link.style.background = '';
        link.style.opacity = '';
        link.textContent = originalText[index];
      });
    }
    
    // Schedule next glitch with variable timing
    const nextTime = settings.baseSpeed + Math.random() * settings.randRange;
    setTimeout(glitchNav, nextTime);
  }
  
  // Start the glitch loop
  setTimeout(glitchNav, 1000);
})();