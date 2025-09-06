/**
 * CRT Effects Integration Module
 * Bridges the legacy CRT effect system with the new optimized implementation
 */
(function () {
  "use strict";

  // Map of legacy effect classes to new effect names
  const EFFECT_MAPPING = {
    scanlines: "scanlines",
    "crt-barrel-distortion": "barrelDistortion",
    "vhs-chroma-noise": "chromaBleed",
    "crt-vignette": "vignette",
    "vhs-tracking-error": "trackingErrors",
    "crt-convergence-error": "rgbSeparation",
    "crt-phosphor-persistence": "phosphorPersistence",
  };

  // Wait for both systems to be available
  function init() {
    // Check if both old and new systems are available
    const legacySystemAvailable = window.CRTSystem != null;
    const newSystemAvailable = window.CRTEffectsManager != null;
    const performanceMonitorAvailable = window.PerformanceMonitor != null;

    if (!legacySystemAvailable || !newSystemAvailable) {
      // Retry after a delay
      setTimeout(init, 100);
      return;
    }

    console.log(
      "[Integration] Bridging legacy CRT effects to optimized system"
    );

    // Connect to legacy system events
    if (
      legacySystemAvailable &&
      typeof window.CRTSystem.addEventListener === "function"
    ) {
      window.CRTSystem.addEventListener(
        "effectsEnabled",
        handleLegacyEffectsEnabled
      );
      window.CRTSystem.addEventListener(
        "effectsDisabled",
        handleLegacyEffectsDisabled
      );
      window.CRTSystem.addEventListener(
        "effectTriggered",
        handleLegacyEffectTriggered
      );
    }

    // Initialize effects based on current state
    initializeEffectsFromLegacy();

    // Set up body class observer
    observeBodyClasses();

    // Set performance level if available
    if (
      performanceMonitorAvailable &&
      typeof window.CRTSystem.getPerformanceLevel === "function"
    ) {
      const legacyPerformance = window.CRTSystem.getPerformanceLevel();
      if (legacyPerformance) {
        window.CRTEffectsManager.setPerformanceLevel(legacyPerformance);
      }
    }

    // Log successful initialization
    console.log("[Integration] Effects bridging complete");
  }

  // Initialize effects based on current visible legacy elements
  function initializeEffectsFromLegacy() {
    // Check which legacy effects are visible
    Object.entries(EFFECT_MAPPING).forEach(([legacyClass, newEffectName]) => {
      const legacyElement = document.querySelector(`.${legacyClass}`);
      if (legacyElement && getComputedStyle(legacyElement).display !== "none") {
        // Enable in new system
        window.CRTEffectsManager.enableEffect(newEffectName);
      }
    });
  }

  // Observe body class changes to detect motion state
  function observeBodyClasses() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-motion") {
          const motionState = document.body.getAttribute("data-motion");
          window.CRTEffectsManager.toggleEffects(motionState === "active");
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-motion", "class"],
    });
  }

  // Handle legacy system enabling effects
  function handleLegacyEffectsEnabled(event) {
    window.CRTEffectsManager.toggleEffects(true);
  }

  // Handle legacy system disabling effects
  function handleLegacyEffectsDisabled(event) {
    window.CRTEffectsManager.toggleEffects(false);
  }

  // Handle specific legacy effect triggers
  function handleLegacyEffectTriggered(event) {
    const effectName = event.detail?.effect;
    if (!effectName) return;

    // Map legacy effect name to new effect name
    const mappedEffect = Object.entries(EFFECT_MAPPING).find(
      ([legacyClass, _]) =>
        legacyClass.includes(effectName) || effectName.includes(legacyClass)
    );

    if (mappedEffect) {
      window.CRTEffectsManager.triggerRandomEffect(mappedEffect[1]);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
