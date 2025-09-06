"use strict";

document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('glitch-title');
  if (!titleEl) return;

  // Ensure correct capitalization
  const titleText = "Travis Inskeep";
  
  // Clear any existing content
  titleEl.innerHTML = '';
  
  // Split into individual letters for per-letter effects
  const letters = titleText.split('');
  
  letters.forEach((letter, i) => {
    const span = document.createElement('span');
    span.className = 'tg-letter';
    span.textContent = letter;
    span.dataset.char = letter;
    span.dataset.index = i;
    
    // Add slightly randomized base transforms for variation
    span.style.display = 'inline-block';
    span.style.position = 'relative';
    span.style.transform = `rotate(${(Math.random() * 2 - 1) * 0.5}deg)`;
    
    titleEl.appendChild(span);
  });

  // Set up advanced glitch effects
  const glitchElements = document.querySelectorAll('.tg-letter');
  
  // VHS/CRT glitch parameters
  const effects = {
    rgbSplit: { chance: 0.1, duration: [50, 350] },
    blackout: { chance: 0.03, duration: [30, 150] },
    skew: { chance: 0.08, duration: [100, 400] },
    flicker: { chance: 0.15, duration: [50, 250] },
    jitter: { chance: 0.2, amount: 3, duration: [50, 200] },
    noise: { chance: 0.12, duration: [80, 300] },
    ghosting: { chance: 0.07, duration: [150, 450] }
  };

  // Colors for RGB shifting
  const rgbColors = [
    'rgba(255, 0, 76, 0.7)',   // Red (increased opacity)
    'rgba(0, 255, 200, 0.7)',  // Cyan (increased opacity)
    'rgba(0, 170, 255, 0.7)'   // Blue (increased opacity)
  ];
  
  // VHS noise patterns
  const noisePatterns = [
    'repeating-linear-gradient(110deg, rgba(255,255,255,0.15) 0px, transparent 1px, rgba(255,255,255,0.15) 2px)',
    'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0) 1px, rgba(255,255,255,0.18) 2px)',
    'linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 20%, rgba(255,255,255,0.15) 30%, transparent 40%)'
  ];
  
  // Main glitch loop
  function runGlitchLoop() {
    if (document.hidden || document.documentElement.dataset.motion === "paused") {
      setTimeout(runGlitchLoop, 500);
      return;
    }

    // Randomly apply effects to different letters
    glitchElements.forEach(el => {
      // Reset for new effects
      el.style.color = '';
      el.style.textShadow = '';
      el.style.transform = `rotate(${(Math.random() * 2 - 1) * 0.5}deg)`;
      el.style.opacity = '1';
      el.style.filter = '';
      
      // RGB Split effect (channel separation)
      if (Math.random() < effects.rgbSplit.chance) {
        const dur = Math.floor(Math.random() * 
          (effects.rgbSplit.duration[1] - effects.rgbSplit.duration[0]) + 
          effects.rgbSplit.duration[0]);
        
        const offsetX = (Math.random() * 2 - 1) * 3;
        const offsetY = (Math.random() * 2 - 1) * 2;
        
        el.style.textShadow = `
          ${offsetX}px ${offsetY}px 3px rgba(255,0,76,0.8),
          ${-offsetX}px ${-offsetY}px 3px rgba(0,255,200,0.8),
          0 0 5px rgba(255,255,255,0.5)
        `;
        
        setTimeout(() => {
          if (document.hidden) return;
          el.style.textShadow = '';
        }, dur);
      }
      
      // Blackout effect (letter disappears)
      if (Math.random() < effects.blackout.chance) {
        const dur = Math.floor(Math.random() * 
          (effects.blackout.duration[1] - effects.blackout.duration[0]) + 
          effects.blackout.duration[0]);
          
        el.style.opacity = '0';
        
        setTimeout(() => {
          if (document.hidden) return;
          el.style.opacity = '1';
        }, dur);
      }
      
      // Skew effect (letter distorts)
      if (Math.random() < effects.skew.chance) {
        const dur = Math.floor(Math.random() * 
          (effects.skew.duration[1] - effects.skew.duration[0]) + 
          effects.skew.duration[0]);
          
        const skewX = (Math.random() * 2 - 1) * 20;
        const skewY = (Math.random() * 2 - 1) * 10;
        const rotate = (Math.random() * 2 - 1) * 5;
        
        el.style.transform = `skew(${skewX}deg, ${skewY}deg) rotate(${rotate}deg)`;
        
        setTimeout(() => {
          if (document.hidden) return;
          el.style.transform = `rotate(${(Math.random() * 2 - 1) * 0.5}deg)`;
        }, dur);
      }
      
      // Flicker effect (brightness variation)
      if (Math.random() < effects.flicker.chance) {
        const dur = Math.floor(Math.random() * 
          (effects.flicker.duration[1] - effects.flicker.duration[0]) + 
          effects.flicker.duration[0]);
          
        const brightness = Math.random() * 0.5 + 0.5;
        
        el.style.filter = `brightness(${brightness})`;
        
        setTimeout(() => {
          if (document.hidden) return;
          el.style.filter = '';
        }, dur);
      }
      
      // Jitter effect (position jumping)
      if (Math.random() < effects.jitter.chance) {
        const dur = Math.floor(Math.random() * 
          (effects.jitter.duration[1] - effects.jitter.duration[0]) + 
          effects.jitter.duration[0]);
          
        const amount = effects.jitter.amount;
        const x = (Math.random() * 2 - 1) * amount;
        const y = (Math.random() * 2 - 1) * amount;
        
        el.style.transform += ` translate(${x}px, ${y}px)`;
        
        setTimeout(() => {
          if (document.hidden) return;
          el.style.transform = `rotate(${(Math.random() * 2 - 1) * 0.5}deg)`;
        }, dur);
      }
      
      // Noise effect (static)
      if (Math.random() < effects.noise.chance) {
        const dur = Math.floor(Math.random() * 
          (effects.noise.duration[1] - effects.noise.duration[0]) + 
          effects.noise.duration[0]);
          
        // Create noise using text-shadow with multiple offsets
        let noiseShadow = '';
        for (let i = 0; i < 5; i++) {
          const nx = (Math.random() * 2 - 1) * 2;
          const ny = (Math.random() * 2 - 1) * 2;
          const opacity = Math.random() * 0.4;
          noiseShadow += `${nx}px ${ny}px 0px rgba(255,255,255,${opacity}),`;
        }
        noiseShadow = noiseShadow.slice(0, -1); // remove trailing comma
        
        el.style.textShadow = noiseShadow;
        
        setTimeout(() => {
          if (document.hidden) return;
          el.style.textShadow = '';
        }, dur);
      }
      
      // Ghosting effect (afterimage)
      if (Math.random() < effects.ghosting.chance) {
        const dur = Math.floor(Math.random() * 
          (effects.ghosting.duration[1] - effects.ghosting.duration[0]) + 
          effects.ghosting.duration[0]);
          
        // Create ghosting using colored text-shadows with offsets
        const offsetX = (Math.random() * 2 - 1) * 6;
        const offsetY = (Math.random() * 2 - 1) * 3;
        
        el.style.textShadow = `
          ${offsetX * 0.5}px ${offsetY * 0.5}px 2px rgba(255,255,255,0.3),
          ${offsetX}px ${offsetY}px 3px rgba(50,255,255,0.2),
          ${offsetX * 1.5}px ${offsetY * 1.5}px 4px rgba(255,50,255,0.1)
        `;
        
        setTimeout(() => {
          if (document.hidden) return;
          el.style.textShadow = '';
        }, dur);
      }
    });

    // Schedule next glitch cycle after a random delay
    const nextDelay = Math.floor(Math.random() * 700) + 100;
    setTimeout(runGlitchLoop, nextDelay);
  }

  // Start the glitch loop
  setTimeout(runGlitchLoop, 1000);
});

// Title glitch engine - enhanced for more erratic VHS-like behavior
(function() {
  "use strict";
  
  // Get title element
  const titleEl = document.getElementById('glitch-title');
  if (!titleEl) return;
  
  // Get original text and create spans for each letter
  const text = titleEl.textContent.trim();
  let html = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Add space if it's a space character
    if (char === ' ') {
      html += '<span class="tg-space"> </span>';
    } else {
      html += `<span class="tg-letter">${char}</span>`;
    }
  }
  
  titleEl.innerHTML = html;
  
  const letters = titleEl.querySelectorAll('.tg-letter');
  const numLetters = letters.length;
  
  // More aggressive glitch settings
  const settings = {
    baseSpeed: 80,            // Base milliseconds between effects
    randRange: 600,           // Random additional time
    glitchChance: 0.22,       // Chance of glitch per cycle (increased)
    letterGlitchChance: 0.28, // Chance per letter (increased)
    colorGlitchChance: 0.35,  // Chance of color shift (increased)
    positionJitter: 4,        // Position distortion amount (increased)
    verticalJitter: 3,        // Vertical offset (increased)
    blurChance: 0.35,         // Chance of blur effect (increased)
    blurAmount: '2px',        // Blur amount
    skewChance: 0.4,          // Chance of skew (increased)
    skewAmount: '3deg',       // Skew amount (increased)
    noiseChance: 0.45,        // Chance of noise overlay (increased)
    letterSwapChance: 0.18,   // Chance of swapping adjacent letters (new)
    splitChance: 0.12,        // Chance of color split (new)
    colorCycles: ['#ff004c', '#00ffc8', '#0af', '#f0f'] // RGB shift colors
  };
  
  // Letter distortion effects - more VHS like
  function distortLetter(letter) {
    // Reset previous effects
    letter.style.transform = '';
    letter.style.filter = '';
    letter.style.textShadow = '';
    letter.style.color = '';
    letter.style.background = '';
    letter.style.opacity = '';
    
    // Apply random effects with higher intensity
    const effects = [];
    
    // Position jitter (more extreme)
    if (Math.random() < 0.7) {
      const xOffset = (Math.random() - 0.5) * settings.positionJitter * 2;
      const yOffset = (Math.random() - 0.5) * settings.verticalJitter * 2;
      effects.push(`translate(${xOffset}px, ${yOffset}px)`);
    }
    
    // Skew (more extreme)
    if (Math.random() < settings.skewChance) {
      const skewX = (Math.random() - 0.5) * parseFloat(settings.skewAmount) * 2;
      effects.push(`skewX(${skewX}deg)`);
    }
    
    // Random rotation (new)
    if (Math.random() < 0.25) {
      const rotation = (Math.random() - 0.5) * 3;
      effects.push(`rotate(${rotation}deg)`);
    }
    
    // Apply transforms
    if (effects.length) {
      letter.style.transform = effects.join(' ');
    }
    
    // Color RGB shift (more intense)
    if (Math.random() < settings.colorGlitchChance) {
      const colorIndex = Math.floor(Math.random() * rgbColors.length);
      letter.style.color = rgbColors[colorIndex];
      
      // RGB split effect (new)
      if (Math.random() < settings.splitChance) {
        const shadowColor = rgbColors[(colorIndex + 1) % rgbColors.length];
        const xOffset = (Math.random() - 0.5) * 6;
        letter.style.textShadow = `${xOffset}px 0 ${shadowColor}`;
      }
    }
    
    // Blur effect (more common)
    if (Math.random() < settings.blurChance) {
      const blurAmount = parseFloat(settings.blurAmount) * (1 + Math.random());
      letter.style.filter = `blur(${blurAmount}px)`;
      letter.style.opacity = '0.9';
    }
    
    // VHS noise overlay (new)
    if (Math.random() < settings.noiseChance) {
      const noisePattern = noisePatterns[Math.floor(Math.random() * noisePatterns.length)];
      letter.style.background = noisePattern;
    }
    
    // Opacity jitter (new)
    if (Math.random() < 0.3) {
      letter.style.opacity = (0.7 + Math.random() * 0.3).toString();
    }
  }
  
  // Apply glitch effect to the whole title
  function glitchTitle() {
    if (Math.random() < settings.glitchChance) {
      // Individual letter distortions
      letters.forEach(letter => {
        if (Math.random() < settings.letterGlitchChance) {
          distortLetter(letter);
        } else {
          // Reset this letter
          letter.style.transform = '';
          letter.style.filter = '';
          letter.style.textShadow = '';
          letter.style.color = '';
          letter.style.background = '';
          letter.style.opacity = '';
        }
      });
      
      // Letter swapping effect (new)
      if (Math.random() < settings.letterSwapChance && numLetters > 3) {
        const idx1 = Math.floor(Math.random() * (numLetters - 1));
        const temp = letters[idx1].textContent;
        letters[idx1].textContent = letters[idx1 + 1].textContent;
        letters[idx1 + 1].textContent = temp;
        
        // Reset after short delay
        setTimeout(() => {
          letters[idx1].textContent = text[idx1];
          letters[idx1 + 1].textContent = text[idx1 + 1];
        }, 120);
      }
    } else {
      // Reset all letters
      letters.forEach(letter => {
        letter.style.transform = '';
        letter.style.filter = '';
        letter.style.textShadow = '';
        letter.style.color = '';
        letter.style.background = '';
        letter.style.opacity = '';
      });
    }
    
    // Schedule next glitch with variable timing
    const nextTime = settings.baseSpeed + Math.random() * settings.randRange;
    setTimeout(glitchTitle, nextTime);
  }
  
  // Start the glitch loop
  setTimeout(glitchTitle, 1000);
})();