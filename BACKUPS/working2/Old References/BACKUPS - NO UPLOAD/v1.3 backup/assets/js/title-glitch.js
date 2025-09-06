"use strict";

// Creating a much more aggressive title glitch effect with VHS aesthetics

(function() {
  
  const title = document.getElementById('glitch-title');
  if (!title) return;
  
  const text = title.textContent;
  title.innerHTML = '';
  
  // Create individual letter spans for manipulation
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.className = 'tg-letter';
    span.textContent = text[i];
    span.dataset.char = text[i];
    title.appendChild(span);
  }
  
  const letters = title.querySelectorAll('.tg-letter');
  const glitchChars = '!@#$%^&*()_+{}|:<>?-=[]\\;\',./`~';
  
  // VHS/industrial themed settings
  const settings = {
    baseInterval: 50,           // More frequent updates
    strongGlitchInterval: 1000, // How often to trigger major glitches
    letterGlitchChance: 0.3,    // Chance of character replacement
    rgbSplitChance: 0.8,        // Higher chance of RGB splitting
    positionJitterChance: 0.7,  // Higher chance of position glitches
    positionJitterAmount: 12,   // More extreme position shifts
    sliceChance: 0.4,           // Chance of horizontal slice effect
    flickerChance: 0.3,         // Chance of flicker
    staticNoiseChance: 0.25,    // Chance of static overlay
    trackingErrorChance: 0.2    // Chance of vertical tracking errors
  };
  
  // Track the last time a major glitch occurred
  let lastStrongGlitch = 0;
  
  function applyVhsGlitch() {
    if (document.documentElement.dataset.motion === "paused") {
      // Reset when paused
      letters.forEach(letter => {
        letter.style.transform = '';
        letter.style.color = '';
        letter.style.textShadow = '';
        letter.style.filter = '';
        letter.textContent = letter.dataset.char;
      });
      
      setTimeout(applyVhsGlitch, 1000);
      return;
    }
    
    const now = Date.now();
    const isStrongGlitch = (now - lastStrongGlitch > settings.strongGlitchInterval) && 
                           (Math.random() < 0.3);
    
    if (isStrongGlitch) {
      lastStrongGlitch = now;
      
      // Major VHS tracking error effect
      const verticalShift = (Math.random() * 40 - 20) + 'px';
      const horizontalSlice = Math.floor(Math.random() * letters.length);
      
      letters.forEach((letter, i) => {
        // Reset first
        letter.style.transform = '';
        letter.style.color = '';
        letter.style.textShadow = '';
        letter.style.filter = '';
        
        // Apply extreme distortion
        if (i > horizontalSlice) {
          letter.style.transform = `translateY(${verticalShift})`;
        }
        
        // RGB color splitting (very pronounced)
        const xOffsetR = (Math.random() * 16 - 8) + 'px';
        const xOffsetB = (Math.random() * 16 - 8) + 'px';
        letter.style.textShadow = `
          ${xOffsetR} 0 rgba(255,0,0,0.8),
          ${xOffsetB} 0 rgba(0,0,255,0.8),
          0 0 5px rgba(255,255,255,0.4)
        `;
        
        // Randomly replace characters
        if (Math.random() < 0.5) {
          letter.textContent = glitchChars[Math.floor(Math.random() * glitchChars.length)];
          // Schedule reset
          setTimeout(() => {
            letter.textContent = letter.dataset.char;
          }, 50 + Math.random() * 150);
        }
      });
      
      // Add whole-title effects
      title.style.filter = 'brightness(1.4) contrast(1.2)';
      
      // Reset whole-title effects
      setTimeout(() => {
        title.style.filter = '';
      }, 120 + Math.random() * 200);
      
    } else {
      // Subtle continuous glitches
      letters.forEach((letter, index) => {
        // Reset previous effects first
        letter.style.transform = '';
        letter.style.color = '';
        letter.style.textShadow = '';
        
        // Character replacement (subtle)
        if (Math.random() < 0.05) {
          letter.textContent = glitchChars[Math.floor(Math.random() * glitchChars.length)];
          setTimeout(() => {
            letter.textContent = letter.dataset.char;
          }, 40 + Math.random() * 60);
        }
        
        // Subtle position jitter
        if (Math.random() < 0.1) {
          const xOffset = (Math.random() * 6 - 3) + 'px';
          const yOffset = (Math.random() * 6 - 3) + 'px';
          letter.style.transform = `translate(${xOffset}, ${yOffset})`;
        }
        
        // Subtle RGB splitting
        if (Math.random() < 0.08) {
          const xOffset = (Math.random() * 3 - 1.5) + 'px';
          letter.style.textShadow = `
            ${xOffset} 0 rgba(255,0,76,0.7),
            -${xOffset} 0 rgba(0,255,200,0.7)
          `;
        }
      });
    }
    
    // Schedule next update with varying intervals for more organic effect
    const nextInterval = Math.random() * 200 + settings.baseInterval;
    setTimeout(applyVhsGlitch, nextInterval);
  }
  
  // Start with a slight delay
  setTimeout(applyVhsGlitch, 500);
})();

// Additional title animation script

(function() {
  "use strict";
  
  const titleEl = document.getElementById('glitch-title');
  if (!titleEl) return;
  
  const originalText = titleEl.textContent;
  const letters = originalText.split('');
  
  // Create span for each letter
  titleEl.innerHTML = letters.map(letter => 
    `<span class="tg-letter">${letter}</span>`
  ).join('');
  
  const letterElements = titleEl.querySelectorAll('.tg-letter');
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\\'"`~0123456789';
  let isActive = true;
  
  function glitchLetter(el) {
    if (!isActive || document.documentElement.dataset.motion === "paused") return;
    
    const original = el.textContent;
    if (original === ' ') return;
    
    // Store original color
    const originalColor = el.style.color;
    
    // Apply effects
    if (Math.random() < 0.5) {
      // Character replacement
      el.textContent = glitchChars[Math.floor(Math.random() * glitchChars.length)];
    }
    
    if (Math.random() < 0.3) {
      // Color glitch
      const colors = ['#ff005c', '#00ffc8', '#fffc00'];
      el.style.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    if (Math.random() < 0.4) {
      // Text shadow RGB split
      const offset = Math.floor(Math.random() * 5) + 2;
      el.style.textShadow = `
        ${offset}px 0 rgba(255,0,76,0.8),
        -${offset}px 0 rgba(0,255,200,0.8),
        0 0 12px rgba(255,255,255,0.5)
      `;
    }
    
    // Restore after random time
    setTimeout(() => {
      el.textContent = original;
      el.style.color = originalColor;
      el.style.textShadow = '';
    }, 50 + Math.random() * 150);
  }
  
  function runGlitchLoop() {
    if (!isActive || document.documentElement.dataset.motion === "paused") {
      setTimeout(runGlitchLoop, 1000);
      return;
    }
    
    // Random glitch strength
    const glitchCount = Math.floor(Math.random() * 5) + (Math.random() < 0.2 ? 8 : 1);
    
    // Apply glitch to random letters
    for (let i = 0; i < glitchCount; i++) {
      const index = Math.floor(Math.random() * letterElements.length);
      glitchLetter(letterElements[index]);
    }
    
    // Schedule next glitch with variable timing
    const nextTime = 100 + Math.random() * 4000;
    setTimeout(runGlitchLoop, nextTime);
  }
  
  // Track visibility
  document.addEventListener('visibilitychange', () => {
    isActive = document.visibilityState === 'visible';
  });
  
  // Start the glitch loop
  setTimeout(runGlitchLoop, 1000);
})();

// Create the missing title glitch effect script

(function() {
  "use strict";
  
  // Get the title element
  const titleElement = document.getElementById('glitch-title');
  if (!titleElement) return;
  
  // Get the original text
  const originalText = titleElement.textContent;
  
  // Create individual letter spans
  function setupLetters() {
    titleElement.innerHTML = '';
    originalText.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = 'tg-letter';
      span.textContent = char;
      titleElement.appendChild(span);
    });
  }
  
  // Glitch character set
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/\\\'"`~0123456789';
  
  // Apply glitch effect to random letters
  function glitchLetters() {
    if (document.documentElement.dataset.motion === "paused") {
      setTimeout(glitchLetters, 2000);
      return;
    }
    
    const letters = titleElement.querySelectorAll('.tg-letter');
    if (!letters.length) return;
    
    // Determine if this is a major or minor glitch
    const isMajorGlitch = Math.random() < 0.2;
    const glitchCount = isMajorGlitch ? Math.floor(letters.length * 0.6) : Math.floor(Math.random() * 3) + 1;
    
    // Reset all letters first
    letters.forEach(letter => {
      letter.style.transform = '';
      letter.style.filter = '';
      letter.style.textShadow = '';
      letter.style.color = '';
      letter.originalChar = letter.originalChar || letter.textContent;
      letter.textContent = letter.originalChar;
    });
    
    // Apply glitch to random letters
    for (let i = 0; i < glitchCount; i++) {
      const index = Math.floor(Math.random() * letters.length);
      const letter = letters[index];
      
      // Replace character temporarily
      if (Math.random() < 0.7) {
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        letter.textContent = randomChar;
      }
      
      // Apply visual effects
      if (Math.random() < 0.5) {
        const xOffset = (Math.random() - 0.5) * 10;
        const yOffset = (Math.random() - 0.5) * 10;
        letter.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      }
      
      if (Math.random() < 0.3) {
        letter.style.filter = `blur(${Math.random() * 4}px)`;
      }
      
      // RGB split effect
      if (Math.random() < 0.4) {
        const xOffsetR = (Math.random() - 0.5) * 8;
        const xOffsetB = (Math.random() - 0.5) * 8;
        letter.style.textShadow = `
          ${xOffsetR}px 0 rgba(255,0,76,0.8),
          ${xOffsetB}px 0 rgba(0,255,200,0.8)
        `;
      }
      
      // Reset this letter after a short delay
      setTimeout(() => {
        letter.textContent = letter.originalChar;
        letter.style.transform = '';
        letter.style.filter = '';
        letter.style.textShadow = '';
        letter.style.color = '';
      }, 50 + Math.random() * 150);
    }
    
    // Schedule next glitch
    const nextDelay = isMajorGlitch ? 
      100 + Math.random() * 200 : 
      800 + Math.random() * 2000;
    
    setTimeout(glitchLetters, nextDelay);
  }
  
  // Initialize and start the effect
  setupLetters();
  setTimeout(glitchLetters, 1000);
})();