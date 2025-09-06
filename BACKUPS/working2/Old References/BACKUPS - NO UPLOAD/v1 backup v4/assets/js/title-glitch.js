"use strict";

(function() {
  "use strict";
  
  const titleEl = document.getElementById('glitch-title');
  if (!titleEl) return;

  const text = "TRAVIS INSKEEP";
  let html = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      html += '<span class="tg-space" aria-hidden="true">&nbsp;</span>';
    } else {
      html += `<span class="tg-letter">${char}</span>`;
    }
  }
  
  titleEl.innerHTML = html;
  
  const letters = titleEl.querySelectorAll('.tg-letter');
  const numLetters = letters.length;
  
  const settings = {
    baseSpeed: 80,
    randRange: 600,
    glitchChance: 0.22,
    letterGlitchChance: 0.28,
    colorGlitchChance: 0.35,
    positionJitter: 4,
    verticalJitter: 3,
    blurChance: 0.35,
    blurAmount: '2px',
    skewChance: 0.4,
    skewAmount: '3deg',
    noiseChance: 0.45,
    colorCycles: ['#ff004c', '#00ffc8', '#0af', '#f0f']
  };
  
  const rgbColors = settings.colorCycles;
  
  const noisePatterns = [
    'radial-gradient(circle, transparent 20%, rgba(255,255,255,0.3) 21%, transparent 21.5%)',
    'linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.5) 50%, transparent 52%)',
    'linear-gradient(135deg, rgba(255,255,255,0.2) 10%, transparent 10.5%)'
  ];
  
  function distortLetter(letter) {
    letter.style.transform = '';
    letter.style.filter = '';
    letter.style.textShadow = '';
    letter.style.color = '';
    letter.style.background = '';
    letter.style.opacity = '';
    
    const effects = [];
    
    if (Math.random() < 0.7) {
      const xOffset = (Math.random() - 0.5) * settings.positionJitter * 2;
      const yOffset = (Math.random() - 0.5) * settings.verticalJitter * 2;
      effects.push(`translate(${xOffset}px, ${yOffset}px)`);
    }
    
    if (Math.random() < settings.skewChance) {
      const skewX = (Math.random() - 0.5) * parseFloat(settings.skewAmount) * 2;
      effects.push(`skewX(${skewX}deg)`);
    }
    
    if (Math.random() < 0.25) {
      const rotation = (Math.random() - 0.5) * 3;
      effects.push(`rotate(${rotation}deg)`);
    }
    
    if (effects.length) {
      letter.style.transform = effects.join(' ');
    }
    
    if (Math.random() < settings.colorGlitchChance) {
      const colorIndex = Math.floor(Math.random() * rgbColors.length);
      letter.style.color = rgbColors[colorIndex];
      
      if (Math.random() < settings.splitChance) {
        const shadowColor = rgbColors[(colorIndex + 1) % rgbColors.length];
        const xOffset = (Math.random() - 0.5) * 6;
        letter.style.textShadow = `${xOffset}px 0 ${shadowColor}`;
      }
    }
    
    if (Math.random() < settings.blurChance) {
      const blurAmount = parseFloat(settings.blurAmount) * (1 + Math.random());
      letter.style.filter = `blur(${blurAmount}px)`;
      letter.style.opacity = '0.9';
    }
    
    if (Math.random() < settings.noiseChance) {
      const noisePattern = noisePatterns[Math.floor(Math.random() * noisePatterns.length)];
      letter.style.background = noisePattern;
    }
    
    if (Math.random() < 0.3) {
      letter.style.opacity = (0.7 + Math.random() * 0.3).toString();
    }
  }
  
  function glitchTitle() {
    // Check if motion is paused
    if (document.documentElement.dataset.motion === "paused") {
      // Reset all letters when motion is paused
      letters.forEach(letter => {
        letter.style.transform = '';
        letter.style.filter = '';
        letter.style.textShadow = '';
        letter.style.color = '';
        letter.style.background = '';
        letter.style.opacity = '';
      });
      
      // Still check for next iteration even when paused
      const nextTime = settings.baseSpeed + Math.random() * settings.randRange;
      setTimeout(glitchTitle, nextTime);
      return;
    }
    
    if (Math.random() < settings.glitchChance) {
      letters.forEach(letter => {
        if (Math.random() < settings.letterGlitchChance) {
          distortLetter(letter);
        } else {
          letter.style.transform = '';
          letter.style.filter = '';
          letter.style.textShadow = '';
          letter.style.color = '';
          letter.style.background = '';
          letter.style.opacity = '';
        }
      });
      
      // Letter swapping removed - don't change the letters themselves
    } else {
      letters.forEach(letter => {
        letter.style.transform = '';
        letter.style.filter = '';
        letter.style.textShadow = '';
        letter.style.color = '';
        letter.style.background = '';
        letter.style.opacity = '';
      });
    }
    
    const nextTime = settings.baseSpeed + Math.random() * settings.randRange;
    setTimeout(glitchTitle, nextTime);
  }
  
  setTimeout(glitchTitle, 1000);
})();