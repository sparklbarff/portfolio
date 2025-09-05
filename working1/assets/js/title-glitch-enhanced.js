/*
 * Enhanced CRT Title Glitch System v3.66
 * Authentic phosphor decay simulation with magnetic field physics
 * Position-dependent convergence errors and NTSC timing
 */
"use strict";

(function () {
  const title = document.getElementById("glitch-title");
  if (!title) return;

  const text = title.textContent;
  title.innerHTML = "";

  // Setup letters with position tracking
  const letters = [];
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement("span");
    span.className = "tg-letter";
    span.textContent = text[i];
    span.dataset.char = text[i];
    span.dataset.index = i;
    title.appendChild(span);
    letters.push({
      element: span,
      originalChar: text[i],
      position: i,
      normalizedX: i / (text.length - 1), // 0 to 1 across screen
      glitchState: {
        active: false,
        intensity: 0,
        decayStart: 0,
        persistenceLayers: [],
      },
    });
  }

  const glitchChars = "!@#$%^&*()_+{}|:<>?-=[]\\;',./`~";

  // CRT phosphor colors (P22 standard)
  const phosphorColors = {
    red: "rgba(255, 64, 32, 0.9)", // Red-orange phosphor
    green: "rgba(32, 255, 64, 0.9)", // Green phosphor
    blue: "rgba(64, 128, 255, 0.9)", // Blue-purple phosphor
  };

  const settings = {
    baseInterval: 60,
    magneticFieldStrength: 0.3,
    phosphorDecayTime: 350,
    convergenceError: 1.2, // Worse at screen edges
    syncInstability: 0.15,
    verticalHoldError: 0.08,
    frameRate: 60, // NTSC standard
    rollProbability: 0.02,
  };

  let lastFrameTime = 0;
  let verticalDrift = 0;
  let horizontalSyncError = 0;
  let magneticPhase = 0;

  // Simulate magnetic field interference with curved distortion
  function getMagneticDistortion(normalizedX, intensity) {
    const fieldAngle = magneticPhase + normalizedX * Math.PI * 2;
    const fieldStrength = intensity * settings.magneticFieldStrength;

    // Curved displacement simulating deflection coil interference
    const xDisplace = Math.sin(fieldAngle) * fieldStrength * 25;
    const yDisplace = Math.cos(fieldAngle * 1.3) * fieldStrength * 15;
    const rotation = Math.sin(fieldAngle * 0.7) * fieldStrength * 8;

    return { xDisplace, yDisplace, rotation };
  }

  // Calculate position-dependent RGB convergence error
  function getConvergenceError(normalizedX) {
    // Error increases toward screen edges (CRT geometry)
    const edgeDistance = Math.abs(normalizedX - 0.5) * 2; // 0 at center, 1 at edges
    return settings.convergenceError * (0.3 + edgeDistance * 0.7);
  }

  // Create phosphor persistence effect
  function addPersistenceLayer(letter, intensity) {
    const persistence = {
      id: Date.now() + Math.random(),
      startTime: performance.now(),
      intensity: intensity,
      char: letter.element.textContent,
    };

    letter.glitchState.persistenceLayers.push(persistence);

    // Clean up old persistence layers
    const now = performance.now();
    letter.glitchState.persistenceLayers =
      letter.glitchState.persistenceLayers.filter(
        (layer) => now - layer.startTime < settings.phosphorDecayTime
      );
  }

  // Apply phosphor decay with exponential falloff
  function updatePhosphorDecay(letter) {
    const now = performance.now();
    const layers = letter.glitchState.persistenceLayers;

    if (layers.length === 0) return;

    // Calculate composite persistence effect
    let totalIntensity = 0;
    let dominantChar = letter.originalChar;
    let shadowLayers = [];

    layers.forEach((layer) => {
      const age = now - layer.startTime;
      const decay = Math.exp(-age / (settings.phosphorDecayTime * 0.4));
      const layerIntensity = layer.intensity * decay;

      if (layerIntensity > 0.05) {
        totalIntensity += layerIntensity;
        if (layerIntensity > 0.3) {
          dominantChar = layer.char;
        }

        // Create shadow layers for trailing effect
        shadowLayers.push({
          offset: layerIntensity * 3,
          opacity: layerIntensity * 0.6,
          color:
            layerIntensity > 0.5 ? phosphorColors.green : phosphorColors.blue,
        });
      }
    });

    // Apply composite effect
    if (totalIntensity > 0.02) {
      letter.element.textContent = dominantChar;

      // Build multi-layer text shadow for persistence
      const shadows = shadowLayers.map(
        (layer) =>
          `${layer.offset}px 0 ${layer.color.replace(
            "0.9)",
            `${layer.opacity})`
          )}`
      );

      if (shadows.length > 0) {
        letter.element.style.textShadow = shadows.join(", ");
      }

      letter.element.style.opacity = Math.min(1, 0.7 + totalIntensity * 0.3);
    } else {
      // Reset when persistence fades
      letter.element.textContent = letter.originalChar;
      letter.element.style.textShadow = "";
      letter.element.style.opacity = "";
      letter.glitchState.persistenceLayers = [];
    }
  }

  // Simulate horizontal sync instability
  function updateSyncErrors() {
    magneticPhase += 0.02 + (Math.random() - 0.5) * 0.01;

    if (Math.random() < settings.syncInstability) {
      horizontalSyncError = (Math.random() - 0.5) * 8;
      setTimeout(() => {
        horizontalSyncError = 0;
      }, 50 + Math.random() * 100);
    }

    if (Math.random() < settings.verticalHoldError) {
      verticalDrift += (Math.random() - 0.5) * 2;
      verticalDrift *= 0.95; // Gradual correction
    }
  }

  // Main glitch application with enhanced realism
  function applyEnhancedGlitch(letter, intensity) {
    const distortion = getMagneticDistortion(letter.normalizedX, intensity);
    const convergenceError = getConvergenceError(letter.normalizedX);

    // Apply curved magnetic distortion
    const totalX = distortion.xDisplace + horizontalSyncError;
    const totalY = distortion.yDisplace + verticalDrift;
    const rotation = distortion.rotation;

    letter.element.style.transform = `translate(${totalX}px, ${totalY}px) rotate(${rotation}deg)`;

    // Position-dependent RGB separation with phosphor colors
    if (intensity > 0.3) {
      const baseOffset = convergenceError * intensity;
      const redOffset = baseOffset * (1 + letter.normalizedX * 0.5);
      const blueOffset = baseOffset * (1 + (1 - letter.normalizedX) * 0.5);

      letter.element.style.textShadow = `
        ${redOffset}px 0 ${phosphorColors.red},
        ${-blueOffset}px 0 ${phosphorColors.blue},
        0 0 ${intensity * 8}px rgba(255, 255, 255, ${intensity * 0.3})
      `;

      // Add phosphor persistence
      addPersistenceLayer(letter, intensity);
    }

    // Character replacement with temporal correlation
    if (intensity > 0.6 && Math.random() < 0.7) {
      const replacementChar =
        glitchChars[Math.floor(Math.random() * glitchChars.length)];
      letter.element.textContent = replacementChar;
    }

    // Apply gamma-corrected brightness modulation
    const brightness = 0.8 + intensity * 0.4;
    const gamma = 2.2; // CRT gamma curve
    const correctedBrightness = Math.pow(brightness, 1 / gamma);
    letter.element.style.filter = `brightness(${correctedBrightness})`;
  }

  // Rolling effect simulation (vertical sync loss)
  function triggerRollingEffect() {
    if (Math.random() < settings.rollProbability) {
      const rollSpeed = 2 + Math.random() * 4;
      const rollDuration = 800 + Math.random() * 1200;

      title.style.transform = `translateY(${rollSpeed}px)`;
      title.style.transition = `transform ${rollDuration}ms linear`;

      setTimeout(() => {
        title.style.transform = "";
        title.style.transition = "";
      }, rollDuration);
    }
  }

  function runRealisticGlitchLoop(currentTime) {
    if (document.documentElement.dataset.motion === "paused") {
      letters.forEach((letter) => {
        letter.element.style.transform = "";
        letter.element.style.filter = "";
        letter.element.style.textShadow = "";
        letter.element.style.opacity = "";
        letter.element.textContent = letter.originalChar;
        letter.glitchState.persistenceLayers = [];
      });

      requestAnimationFrame(runRealisticGlitchLoop);
      return;
    }

    // Frame rate limiting to 60 FPS for authenticity
    if (currentTime - lastFrameTime < 1000 / settings.frameRate) {
      requestAnimationFrame(runRealisticGlitchLoop);
      return;
    }

    lastFrameTime = currentTime;

    updateSyncErrors();
    triggerRollingEffect();

    // Determine glitch intensity (organic, not uniform)
    const isStrongGlitch = Math.random() < 0.08;
    const baseIntensity = isStrongGlitch
      ? 0.8 + Math.random() * 0.2
      : Math.random() * 0.3;

    letters.forEach((letter) => {
      // Update phosphor persistence
      updatePhosphorDecay(letter);

      // Apply position-based intensity variation
      const localIntensity = baseIntensity * (0.7 + Math.random() * 0.6);

      if (localIntensity > 0.1) {
        applyEnhancedGlitch(letter, localIntensity);
        letter.glitchState.active = true;
        letter.glitchState.intensity = localIntensity;
      } else if (letter.glitchState.active) {
        // Gradual restoration with decay
        letter.glitchState.intensity *= 0.85;
        if (letter.glitchState.intensity < 0.05) {
          letter.element.style.transform = "";
          letter.element.style.filter = "";
          letter.glitchState.active = false;
        }
      }
    });

    requestAnimationFrame(runRealisticGlitchLoop);
  }

  // Start the enhanced glitch system
  setTimeout(() => {
    requestAnimationFrame(runRealisticGlitchLoop);
  }, 500);
})();
