/*
 * Enhanced CRT Navigation Glitch System v3.66
 * Independent per-link animations with authentic CRT physics
 * Electromagnetic field interference patterns and tracking errors
 */
(function () {
  "use strict";

  const navLinks = document.querySelectorAll("#nav-list a");
  if (!navLinks.length) return;

  const originalText = Array.from(navLinks).map((link) => link.textContent);
  const linkStates = Array.from(navLinks).map((link, index) => ({
    element: link,
    originalText: originalText[index],
    normalizedX: index / (navLinks.length - 1), // Position across nav
    glitchState: {
      active: false,
      intensity: 0,
      magneticField: 0,
      persistenceLayers: [],
      lastGlitchTime: 0,
    },
  }));

  const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/\\'\"`~0123456789";

  // CRT-specific parameters
  const crtSettings = {
    phosphorDecay: 280,
    magneticFieldStrength: 0.4,
    deflectionCoilNoise: 0.25,
    convergenceErrorBase: 1.5,
    beamFocusError: 0.3,
    horizontalSyncJitter: 0.12,
    trackingErrorProbability: 0.05,
    frameRate: 60,
  };

  // Authentic CRT phosphor colors
  const phosphorColors = {
    red: "rgba(255, 69, 0, 0.95)", // Red phosphor (P22)
    green: "rgba(0, 255, 100, 0.95)", // Green phosphor
    blue: "rgba(70, 130, 255, 0.95)", // Blue phosphor
  };

  let globalMagneticPhase = 0;
  let horizontalSyncError = 0;
  let lastFrameTime = 0;
  let trackingErrorActive = false;

  // Simulate electromagnetic field interference patterns
  function calculateMagneticDistortion(linkState, globalIntensity) {
    const localPhase =
      globalMagneticPhase + linkState.normalizedX * Math.PI * 1.7;
    const fieldIntensity = globalIntensity * crtSettings.magneticFieldStrength;

    // Complex field pattern simulating deflection coil interaction
    const primaryField = Math.sin(localPhase) * fieldIntensity;
    const secondaryField = Math.cos(localPhase * 1.6) * fieldIntensity * 0.6;
    const harmonicField = Math.sin(localPhase * 2.3) * fieldIntensity * 0.3;

    // Curved displacement (not linear like before)
    const xDisplace = (primaryField + harmonicField) * 35;
    const yDisplace = secondaryField * Math.sin(localPhase * 0.8) * 20;

    // Rotational distortion from magnetic field interaction
    const rotation = (primaryField * 0.4 + secondaryField * 0.6) * 15;

    // Scaling distortion from beam focus errors
    const scaleX = 1 + Math.sin(localPhase * 1.2) * fieldIntensity * 0.25;
    const scaleY = 1 + Math.cos(localPhase * 0.9) * fieldIntensity * 0.15;

    return {
      xDisplace: xDisplace + horizontalSyncError,
      yDisplace,
      rotation,
      scaleX,
      scaleY,
    };
  }

  // Position-dependent convergence error (worse at screen edges)
  function getConvergenceError(normalizedX, intensity) {
    const edgeDistance = Math.abs(normalizedX - 0.5) * 2; // 0 at center, 1 at edges
    const baseError = crtSettings.convergenceErrorBase;
    const positionError = baseError * (0.4 + edgeDistance * 1.2);

    // Add some randomness for authenticity
    const jitter = (Math.random() - 0.5) * 0.3;
    return (positionError + jitter) * intensity;
  }

  // Simulate tracking error (affects all elements simultaneously)
  function applyTrackingError() {
    if (trackingErrorActive) return;

    trackingErrorActive = true;
    const verticalShift = (Math.random() - 0.5) * 25;
    const duration = 100 + Math.random() * 150;

    // Apply to all nav links simultaneously
    linkStates.forEach((linkState) => {
      const originalTransform = linkState.element.style.transform;
      linkState.element.style.transform = `${originalTransform} translateY(${verticalShift}px)`;
      linkState.element.style.filter =
        "brightness(1.4) contrast(1.8) saturate(0.7)";
    });

    setTimeout(() => {
      linkStates.forEach((linkState) => {
        linkState.element.style.filter = "";
        // Don't reset transform here - let normal glitch system handle it
      });
      trackingErrorActive = false;
    }, duration);
  }

  // Simulate phosphor persistence with multiple decay layers
  function addPhosphorPersistence(linkState, char, intensity) {
    const persistence = {
      id: Date.now() + Math.random(),
      startTime: performance.now(),
      char: char,
      intensity: intensity,
      decayRate: 0.4 + Math.random() * 0.3, // Slightly random decay
    };

    linkState.glitchState.persistenceLayers.push(persistence);

    // Clean up old layers
    const now = performance.now();
    linkState.glitchState.persistenceLayers =
      linkState.glitchState.persistenceLayers.filter(
        (layer) => now - layer.startTime < crtSettings.phosphorDecay * 2
      );
  }

  // Apply realistic CRT distortion to a single navigation link
  function applyRealisticDistortion(linkState, intensity) {
    const distortion = calculateMagneticDistortion(linkState, intensity);
    const convergenceError = getConvergenceError(
      linkState.normalizedX,
      intensity
    );

    // Build transform string with multiple effects
    const transforms = [
      `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px)`,
      `rotate(${distortion.rotation}deg)`,
      `scale(${distortion.scaleX}, ${distortion.scaleY})`,
    ];

    linkState.element.style.transform = transforms.join(" ");

    // Apply position-dependent RGB separation
    if (intensity > 0.4) {
      const redOffset = convergenceError * (1.2 + linkState.normalizedX * 0.8);
      const blueOffset =
        convergenceError * (1.2 + (1 - linkState.normalizedX) * 0.8);
      const greenOffset = convergenceError * 0.3;

      const shadowLayers = [
        `${redOffset}px ${greenOffset * 0.5}px ${phosphorColors.red}`,
        `${-blueOffset}px ${-greenOffset * 0.5}px ${phosphorColors.blue}`,
        `0 0 ${intensity * 12}px rgba(255, 255, 255, ${intensity * 0.4})`,
      ];

      linkState.element.style.textShadow = shadowLayers.join(", ");

      // Add phosphor persistence for high-intensity glitches
      if (intensity > 0.6) {
        addPhosphorPersistence(
          linkState,
          linkState.element.textContent,
          intensity
        );
      }
    }

    // Character replacement with weighted probability
    if (intensity > 0.5 && Math.random() < 0.8) {
      const text = linkState.originalText;
      let newText = "";

      for (let i = 0; i < text.length; i++) {
        // Higher replacement probability for higher intensity
        if (Math.random() < intensity * 0.7) {
          newText +=
            glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          newText += text[i];
        }
      }

      linkState.element.textContent = newText;

      // Restore with exponential decay timing
      const restoreTime = 40 + Math.random() * 120;
      setTimeout(() => {
        if (linkState.element.textContent === newText) {
          linkState.element.textContent = linkState.originalText;
        }
      }, restoreTime);
    }

    // Beam focus simulation (blur + brightness variation)
    if (intensity > 0.3) {
      const focusError = crtSettings.beamFocusError * intensity;
      const blurAmount = focusError * 6;
      const brightness = 0.85 + intensity * 0.4 + focusError * 0.2;
      const contrast = 1 + intensity * 0.5;

      linkState.element.style.filter = `blur(${blurAmount}px) brightness(${brightness}) contrast(${contrast})`;
      linkState.element.style.opacity = Math.max(0.6, 1 - focusError);
    }
  }

  // Update horizontal sync stability
  function updateSyncStability() {
    globalMagneticPhase += 0.025 + (Math.random() - 0.5) * 0.008;

    if (Math.random() < crtSettings.horizontalSyncJitter) {
      horizontalSyncError = (Math.random() - 0.5) * 12;
      setTimeout(() => {
        horizontalSyncError *= 0.3; // Gradual correction
      }, 60 + Math.random() * 80);
    } else {
      horizontalSyncError *= 0.92; // Continuous decay
    }
  }

  // Main glitch loop with frame rate control
  function runEnhancedGlitchSystem(currentTime) {
    if (document.documentElement.dataset.motion === "paused") {
      // Reset all states when paused
      linkStates.forEach((linkState) => {
        linkState.element.style.transform = "";
        linkState.element.style.filter = "";
        linkState.element.style.textShadow = "";
        linkState.element.style.opacity = "";
        linkState.element.textContent = linkState.originalText;
        linkState.glitchState.persistenceLayers = [];
      });

      requestAnimationFrame(runEnhancedGlitchSystem);
      return;
    }

    // Frame rate limiting for authentic 60Hz operation
    if (currentTime - lastFrameTime < 1000 / crtSettings.frameRate) {
      requestAnimationFrame(runEnhancedGlitchSystem);
      return;
    }

    lastFrameTime = currentTime;

    updateSyncStability();

    // Determine global glitch intensity with organic variation
    const baseIntensity =
      Math.random() < 0.15 ? 0.7 + Math.random() * 0.3 : Math.random() * 0.4;

    linkStates.forEach((linkState) => {
      // Individual link intensity with position-based variation
      const localIntensity = baseIntensity * (0.6 + Math.random() * 0.8);

      if (localIntensity > 0.15) {
        applyRealisticDistortion(linkState, localIntensity);
        linkState.glitchState.active = true;
        linkState.glitchState.intensity = localIntensity;
        linkState.glitchState.lastGlitchTime = currentTime;
      } else {
        // Gradual restoration when not actively glitching
        if (linkState.glitchState.active) {
          const timeSinceGlitch =
            currentTime - linkState.glitchState.lastGlitchTime;
          const decayFactor = Math.exp(-timeSinceGlitch / 150); // Exponential decay

          if (decayFactor < 0.1) {
            // Reset to normal state
            linkState.element.style.transform = "";
            linkState.element.style.filter = "";
            linkState.element.style.textShadow = "";
            linkState.element.style.opacity = "";
            linkState.glitchState.active = false;
          }
        }
      }
    });

    requestAnimationFrame(runEnhancedGlitchSystem);
  }

  // Initialize the enhanced navigation glitch system
  setTimeout(() => {
    requestAnimationFrame(runEnhancedGlitchSystem);
  }, 300);
})();
