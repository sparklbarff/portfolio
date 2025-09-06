(function() {
  "use strict";
  
  const navLinks = document.querySelectorAll('#nav-list a');
  if (!navLinks.length) return;
  
  const settings = {
    baseSpeed: 220,
    randRange: 3000,
    glitchChance: 0.25,
    colorGlitchChance: 0.85,
    positionJitter: 15,
    blurChance: 0.7,
    blurAmount: '4px',
    skewChance: 0.8,
    skewAmount: '12deg',
    letterGlitchChance: 0.5,
    rgbSplitAmount: 12,
    trackingErrorChance: 0.3
  };
  
  const rgbColors = [
    'rgba(255, 0, 76, 0.95)',
    'rgba(0, 255, 200, 0.95)',
    'rgba(255, 255, 0, 0.95)',
    'rgba(0, 120, 255, 0.95)'
  ];
  
  const originalText = Array.from(navLinks).map(link => link.textContent);
  
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\\'"`~0123456789';
  
  let lastStrongGlitch = 0;
  
  function applyTrackingError() {
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
    link.style.transform = '';
    link.style.filter = '';
    link.style.textShadow = '';
    link.style.color = '';
    link.style.background = '';
    link.style.opacity = '';
    
    const effects = [];
    
    if (Math.random() < 0.9) {
      const xOffset = (Math.random() - 0.5) * settings.positionJitter * 4;
      const yOffset = (Math.random() - 0.5) * settings.positionJitter * 2;
      effects.push(`translate(${xOffset}px, ${yOffset}px)`);
    }
    
    if (Math.random() < settings.skewChance) {
      const skewX = (Math.random() - 0.5) * parseFloat(settings.skewAmount) * 3;
      const skewY = (Math.random() - 0.5) * parseFloat(settings.skewAmount) * 1.5;
      effects.push(`skewX(${skewX}deg) skewY(${skewY}deg)`);
    }
    
    if (Math.random() < 0.4) {
      const scaleX = 0.7 + Math.random() * 0.6;
      const scaleY = 0.7 + Math.random() * 0.6;
      effects.push(`scaleX(${scaleX}) scaleY(${scaleY})`);
    }
    
    if (effects.length) {
      link.style.transform = effects.join(' ');
    }
    
    if (Math.random() < settings.colorGlitchChance) {
      const colorIndex = Math.floor(Math.random() * rgbColors.length);
      link.style.color = rgbColors[colorIndex];
      
      const xOffsetR = (Math.random() - 0.5) * settings.rgbSplitAmount;
      const xOffsetB = (Math.random() - 0.5) * settings.rgbSplitAmount;
      link.style.textShadow = `
        ${xOffsetR}px 0 rgba(255,0,76,0.9),
        ${xOffsetB}px 0 rgba(0,255,200,0.9),
        0 0 8px rgba(255,255,255,0.4)
      `;
    }
    
    if (Math.random() < settings.blurChance) {
      const blurAmount = parseFloat(settings.blurAmount) * (1 + Math.random() * 2);
      link.style.filter = `blur(${blurAmount}px) brightness(${0.7 + Math.random() * 0.6}) contrast(${1 + Math.random()})`;
      link.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);
    }
    
    if (Math.random() < settings.letterGlitchChance) {
      const text = originalText[index];
      let newText = '';
      
      for (let i = 0; i < text.length; i++) {
        if (Math.random() < 0.6) {
          newText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          newText += text[i];
        }
      }
      
      link.textContent = newText;
      
      setTimeout(() => {
        link.textContent = originalText[index];
      }, 60 + Math.random() * 100);
    }
  }
  
  function glitchNav() {
    if (document.documentElement.dataset.motion === "paused") {
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
      
      if (Math.random() < settings.trackingErrorChance) {
        applyTrackingError();
      }
      
      navLinks.forEach((link, index) => {
        distortLink(link, index);
      });
      
    } else if (Math.random() < settings.glitchChance) {
      const glitchCount = Math.floor(Math.random() * 2) + 1;
      const indices = [];
      
      for (let i = 0; i < glitchCount; i++) {
        indices.push(Math.floor(Math.random() * navLinks.length));
      }
      
      indices.forEach(idx => {
        if (navLinks[idx]) distortLink(navLinks[idx], idx);
      });
    }
    
    const nextTime = settings.baseSpeed + Math.random() * settings.randRange;
    setTimeout(glitchNav, nextTime);
  }
  
  setTimeout(glitchNav, 300);
})();