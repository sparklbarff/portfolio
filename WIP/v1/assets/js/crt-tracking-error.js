/*
 * VHS Tape Tracking Error System
 * Sweeping scan tracking error effect that overlays everything except mini windows
 * Simulates authentic VHS tape tracking distortion and horizontal sync errors
 */
(function () {
  "use strict";

  let trackingErrorActive = false;
  let trackingErrorElement = null;
  let sweepPosition = 0;
  let sweepDirection = 1;
  let lastSweepTime = 0;

  const trackingSettings = {
    sweepSpeed: 0.8, // Speed of the tracking error sweep
    errorHeight: 45, // Height of the tracking error band
    errorIntensity: 0.7, // Intensity of the distortion
    sweepFrequency: 0.03, // Probability of tracking error occurring per frame
    minSweepInterval: 2000, // Minimum time between sweeps (ms)
    maxSweepInterval: 8000, // Maximum time between sweeps (ms)
    horizontalShift: 25, // Maximum horizontal displacement
    verticalJitter: 8, // Vertical position jitter
    persistence: 180, // How long the effect lasts (ms)
  };

  // Create the tracking error overlay element
  function createTrackingErrorOverlay() {
    if (trackingErrorElement) return;

    trackingErrorElement = document.createElement("div");
    trackingErrorElement.id = "tracking-error-overlay";
    trackingErrorElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999;
      opacity: 0;
      background: transparent;
      mix-blend-mode: screen;
      transition: opacity 0.1s ease-out;
    `;

    document.body.appendChild(trackingErrorElement);
  }

  // Apply tracking error distortion to all elements except mini windows
  function applyTrackingError() {
    if (trackingErrorActive) return;

    const currentTime = performance.now();
    if (currentTime - lastSweepTime < trackingSettings.minSweepInterval) return;

    trackingErrorActive = true;
    lastSweepTime = currentTime;

    // Random sweep parameters
    const sweepHeight =
      trackingSettings.errorHeight + (Math.random() - 0.5) * 20;
    const sweepIntensity =
      trackingSettings.errorIntensity + (Math.random() - 0.5) * 0.3;
    const horizontalShift =
      (Math.random() - 0.5) * trackingSettings.horizontalShift;
    const verticalJitter =
      (Math.random() - 0.5) * trackingSettings.verticalJitter;

    // Create tracking error visual effect
    if (trackingErrorElement) {
      const sweepY = Math.random() * (window.innerHeight - sweepHeight);

      trackingErrorElement.style.background = `
        linear-gradient(
          to bottom,
          transparent ${(sweepY / window.innerHeight) * 100}%,
          rgba(255, 255, 255, ${sweepIntensity * 0.2}) ${
        (sweepY / window.innerHeight) * 100
      }%,
          rgba(255, 255, 255, ${sweepIntensity * 0.4}) ${
        ((sweepY + sweepHeight / 3) / window.innerHeight) * 100
      }%,
          rgba(255, 255, 255, ${sweepIntensity * 0.2}) ${
        ((sweepY + sweepHeight) / window.innerHeight) * 100
      }%,
          transparent ${((sweepY + sweepHeight) / window.innerHeight) * 100}%
        )
      `;

      trackingErrorElement.style.opacity = "1";
      trackingErrorElement.style.transform = `translateX(${horizontalShift}px) translateY(${verticalJitter}px)`;
    }

    // Apply distortion to all elements except mini windows
    const elementsToDistort = document.querySelectorAll(
      "*:not(.mini-window):not(.mini-window *)"
    );
    const distortedElements = [];

    elementsToDistort.forEach((element) => {
      // Skip mini windows and their children
      if (
        element.closest(".mini-window") ||
        element.classList.contains("mini-window")
      ) {
        return;
      }

      // Skip the tracking error overlay itself
      if (element === trackingErrorElement) return;

      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const sweepCenter = sweepPosition;
      const distance = Math.abs(elementCenter - sweepCenter);

      // Apply distortion based on proximity to sweep
      if (distance < sweepHeight) {
        const distortionFactor = 1 - distance / sweepHeight;
        const intensity = sweepIntensity * distortionFactor;

        // Store original styles for restoration
        const originalTransform = element.style.transform || "";
        const originalFilter = element.style.filter || "";

        distortedElements.push({
          element,
          originalTransform,
          originalFilter,
        });

        // Apply tracking error distortion
        const xShift = horizontalShift * intensity * (Math.random() - 0.5) * 2;
        const yShift = verticalJitter * intensity * (Math.random() - 0.5);
        const skew = (Math.random() - 0.5) * 3 * intensity;

        element.style.transform = `${originalTransform} translateX(${xShift}px) translateY(${yShift}px) skewX(${skew}deg)`;
        element.style.filter = `${originalFilter} brightness(${
          1 + intensity * 0.5
        }) contrast(${1 + intensity * 0.8}) saturate(${0.7 + intensity * 0.3})`;

        // Add scan line effect for high intensity
        if (intensity > 0.6) {
          element.style.textShadow = `
            1px 0 rgba(255, 0, 0, ${intensity * 0.6}),
            -1px 0 rgba(0, 255, 255, ${intensity * 0.6}),
            0 0 ${intensity * 8}px rgba(255, 255, 255, ${intensity * 0.4})
          `;
        }
      }
    });

    // Gradual restoration with realistic timing
    const restoreDuration = trackingSettings.persistence + Math.random() * 100;

    setTimeout(() => {
      // Fade out overlay
      if (trackingErrorElement) {
        trackingErrorElement.style.opacity = "0";
        trackingErrorElement.style.transform = "";
      }

      // Restore element styles
      distortedElements.forEach(
        ({ element, originalTransform, originalFilter }) => {
          if (element && element.parentNode) {
            element.style.transform = originalTransform;
            element.style.filter = originalFilter;
            element.style.textShadow = "";
          }
        }
      );

      trackingErrorActive = false;
    }, restoreDuration);
  }

  // Update sweep position for continuous animation
  function updateSweepPosition() {
    sweepPosition += trackingSettings.sweepSpeed * sweepDirection;

    if (sweepPosition >= window.innerHeight + trackingSettings.errorHeight) {
      sweepDirection = -1;
    } else if (sweepPosition <= -trackingSettings.errorHeight) {
      sweepDirection = 1;
    }
  }

  // Main tracking error animation loop
  function runTrackingErrorSystem(currentTime) {
    if (document.documentElement.dataset.motion === "paused") {
      // Reset when paused
      if (trackingErrorElement) {
        trackingErrorElement.style.opacity = "0";
      }
      requestAnimationFrame(runTrackingErrorSystem);
      return;
    }

    updateSweepPosition();

    // Random tracking error events
    if (Math.random() < trackingSettings.sweepFrequency) {
      applyTrackingError();
    }

    requestAnimationFrame(runTrackingErrorSystem);
  }

  // Initialize the tracking error system
  function initializeTrackingError() {
    createTrackingErrorOverlay();

    // Start the animation loop after a brief delay
    setTimeout(() => {
      requestAnimationFrame(runTrackingErrorSystem);
    }, 1000);
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeTrackingError);
  } else {
    initializeTrackingError();
  }
})();
