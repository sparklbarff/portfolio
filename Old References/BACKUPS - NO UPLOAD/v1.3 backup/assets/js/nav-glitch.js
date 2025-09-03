// Making nav glitches much more extreme and VHS-like

(function() {
  "use strict";
  
  // Get all nav links
  const navLinks = document.querySelectorAll('#nav-list a');
  if (!navLinks.length) return;
  
  // Much more extreme VHS/industrial glitch settings
  const settings = {
    baseSpeed: 220,          // Faster base interval
    randRange: 3000,         // More random timing
    glitchChance: 0.25,      // More frequent overall
    colorGlitchChance: 0.85, // Much more color distortion
    positionJitter: 15,      // Extreme position jumps
    blurChance: 0.7,         // More blur effect
    blurAmount: '4px',       // Much stronger blur
    skewChance: 0.8,         // More skewing
    skewAmount: '12deg',     // Extreme skew
    letterGlitchChance: 0.5, // More letter distortion
    rgbSplitAmount: 12,      // Stronger RGB splitting
    trackingErrorChance: 0.3 // VHS tracking errors
  };
  
  // More aggressive colors for RGB shifting
  const rgbColors = [
    'rgba(255, 0, 76, 0.95)',
    'rgba(0, 255, 200, 0.95)',
    'rgba(255, 255, 0, 0.95)',
    'rgba(0, 120, 255, 0.95)'
  ];
  
  // Store original text for each link
  const originalText = Array.from(navLinks).map(link => link.textContent);
  
  // Distortion characters for text scrambling
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\\'"`~0123456789';
  
  // Track strong glitch timing
  let lastStrongGlitch = 0;
  
  function applyTrackingError() {
    // Apply a global tracking error like on VHS tapes
    const offset = (Math.random() * 20 - 10) + 'px';
    navLinks.forEach(link => {
      link.style.transform = `translateY(${offset})`;
      link.style.filter = 'brightness(1.3) contrast(1.5)';
      
      setTimeout(() => {
        link.style.transform = '';
        link.style.filter = '';
      }, 120 + Math.random() * 80);
    });
  }
  
  function distortLink(link, index) {
    // Reset previous effects
    link.style.transform = '';
    link.style.filter = '';
    link.style.textShadow = '';
    link.style.color = '';
    link.style.background = '';
    link.style.opacity = '';
    
    // EXTREME effects
    const effects = [];
    
    // Position jitter (industrial level)
    if (Math.random() < 0.9) {
      const xOffset = (Math.random() - 0.5) * settings.positionJitter * 4;
      const yOffset = (Math.random() - 0.5) * settings.positionJitter * 2;
      effects.push(`translate(${xOffset}px, ${yOffset}px)`);
    }
    
    // Skew (severe VHS tracking error)
    if (Math.random() < settings.skewChance) {
      const skewX = (Math.random() - 0.5) * parseFloat(settings.skewAmount) * 3;
      const skewY = (Math.random() - 0.5) * parseFloat(settings.skewAmount) * 1.5;
      effects.push(`skewX(${skewX}deg) skewY(${skewY}deg)`);
    }
    
    // Random scaling (tape stretch effect)
    if (Math.random() < 0.4) {
      const scaleX = 0.7 + Math.random() * 0.6;
      const scaleY = 0.7 + Math.random() * 0.6;
      effects.push(`scaleX(${scaleX}) scaleY(${scaleY})`);
    }
    
    // Apply transforms
    if (effects.length) {
      link.style.transform = effects.join(' ');
    }
    
    // Color RGB shift (extreme VHS color bleed)
    if (Math.random() < settings.colorGlitchChance) {
      const colorIndex = Math.floor(Math.random() * rgbColors.length);
      link.style.color = rgbColors[colorIndex];
      
      // RGB split effect (extreme)
      const xOffsetR = (Math.random() - 0.5) * settings.rgbSplitAmount;
      const xOffsetB = (Math.random() - 0.5) * settings.rgbSplitAmount;
      link.style.textShadow = `
        ${xOffsetR}px 0 rgba(255,0,76,0.9),
        ${xOffsetB}px 0 rgba(0,255,200,0.9),
        0 0 8px rgba(255,255,255,0.4)
      `;
    }
    
    // Blur effect (tracking loss)
    if (Math.random() < settings.blurChance) {
      const blurAmount = parseFloat(settings.blurAmount) * (1 + Math.random() * 2);
      link.style.filter = `blur(${blurAmount}px) brightness(${0.7 + Math.random() * 0.6}) contrast(${1 + Math.random()})`;
      link.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);
    }
    
    // Letter distortion (static interference)
    if (Math.random() < settings.letterGlitchChance) {
      const text = originalText[index];
      let newText = '';
      
      // Much more aggressive character replacement
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < 0.6) {
          newText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          newText += text[i];
        }
      }
      
      link.textContent = newText;
      
      // Restore after short delay
      setTimeout(() => {
        link.textContent = originalText[index];
      }, 60 + Math.random() * 100);
    }
  }
  
  function glitchNav() {
    if (document.documentElement.dataset.motion === "paused") {
      // Reset all links when motion is paused
      navLinks.forEach((link, index) => {
        link.style.transform = '';
        link.style.filter = '';
        link.style.textShadow = '';
        link.style.color = '';
        link.style.background = '';
        link.style.opacity = '';
        link.textContent = originalText[index];
      });
      
      setTimeout(glitchNav, 1000);
      return;
    }
    
    const now = Date.now();
    const isStrongGlitch = (now - lastStrongGlitch > 2000) && (Math.random() < 0.3);
    
    if (isStrongGlitch) {
      lastStrongGlitch = now;
      
      // Apply global tracking error
      if (Math.random() < settings.trackingErrorChance) {
        applyTrackingError();
      }
      
      // Glitch ALL links for dramatic effect
      navLinks.forEach((link, index) => {
        distortLink(link, index);
      });
      
    } else if (Math.random() < settings.glitchChance) {
      // Regular glitches - affect 1-2 random links
      const glitchCount = Math.floor(Math.random() * 2) + 1;
      const indices = [];
      
      // Pick random links to glitch
      for (let i = 0; i < glitchCount; i++) {
        indices.push(Math.floor(Math.random() * navLinks.length));
      }
      
      // Apply effects to selected links
      indices.forEach(idx => {
        if (navLinks[idx]) distortLink(navLinks[idx], idx);
      });
    }
    
    // More varied timing between glitches
    const nextTime = settings.baseSpeed + Math.random() * settings.randRange;
    setTimeout(glitchNav, nextTime);
  }
  
  // Start immediately for faster initial effect
  setTimeout(glitchNav, 300);
})();