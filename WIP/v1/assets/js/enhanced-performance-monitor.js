/**
 * Enhanced Performance Monitor for CRT Effects System
 * Provides real-time metrics and adaptive quality settings based on device capabilities
 * Helps identify and mitigate performance bottlenecks in the effect system
 */
(function () {
  "use strict";

  // Configuration
  const CONFIG = {
    sampleSize: 20, // Frames to sample for FPS calculation
    lowThreshold: 30, // FPS threshold for low performance mode
    mediumThreshold: 50, // FPS threshold for medium performance mode
    highThreshold: 55, // FPS threshold for high performance mode
    measureInterval: 1000, // Interval for performance measurement (ms)
    adaptiveMode: true, // Auto-adjust effects based on performance
    debugMode: false, // Show debug overlay
    minEffectDuration: 300, // Minimum duration between major effects (ms)
  };

  // Performance metrics
  let metrics = {
    fps: 0, // Current FPS
    avgFps: 0, // Average FPS over sample period
    frameCount: 0, // Frame count in current sample
    frameTimes: [], // Array of recent frame times
    lastFrameTime: 0, // Timestamp of last frame
    performanceLevel: "high", // Current performance level
    lastEffectTime: 0, // Last time a major effect was triggered
    renderTime: 0, // Time to render a frame (ms)
    devicePixelRatio: window.devicePixelRatio || 1,
    memoryUsage: 0, // Memory usage if available
    effectsEnabled: {}, // Map of effects and their enabled status
  };

  // DOM Elements
  let debugOverlay = null;
  let fpsCounter = null;
  let statusIndicator = null;

  // Track frame times
  function trackFrame(timestamp) {
    if (!metrics.lastFrameTime) {
      metrics.lastFrameTime = timestamp;
      requestAnimationFrame(trackFrame);
      return;
    }

    // Calculate time since last frame
    const elapsed = timestamp - metrics.lastFrameTime;
    metrics.lastFrameTime = timestamp;

    // Skip huge jumps (e.g. after tab becomes visible again)
    if (elapsed > 200) {
      requestAnimationFrame(trackFrame);
      return;
    }

    // Calculate current FPS
    metrics.fps = 1000 / elapsed;

    // Store frame time in rolling buffer
    metrics.frameTimes.push(elapsed);
    if (metrics.frameTimes.length > CONFIG.sampleSize) {
      metrics.frameTimes.shift();
    }

    // Calculate average FPS
    const avgFrameTime =
      metrics.frameTimes.reduce((sum, time) => sum + time, 0) /
      metrics.frameTimes.length;
    metrics.avgFps = 1000 / avgFrameTime;
    metrics.frameCount++;

    // Update debug display
    if (CONFIG.debugMode && debugOverlay) {
      updateDebugDisplay();
    }

    // Check if we need to adjust performance level
    if (CONFIG.adaptiveMode && metrics.frameCount % 10 === 0) {
      updatePerformanceLevel();
    }

    // Continue monitoring
    requestAnimationFrame(trackFrame);
  }

  // Update the performance level based on metrics
  function updatePerformanceLevel() {
    const avgFps = metrics.avgFps;
    let newLevel = metrics.performanceLevel;

    if (avgFps < CONFIG.lowThreshold) {
      newLevel = "low";
    } else if (avgFps < CONFIG.mediumThreshold) {
      newLevel = "medium";
    } else {
      newLevel = "high";
    }

    // Only apply changes if performance level has changed
    if (newLevel !== metrics.performanceLevel) {
      metrics.performanceLevel = newLevel;
      applyPerformanceSettings(newLevel);

      if (CONFIG.debugMode) {
        console.log(
          `[Performance] Switching to ${newLevel} performance mode (${avgFps.toFixed(
            1
          )} FPS)`
        );
      }
    }
  }

  // Apply performance settings based on level
  function applyPerformanceSettings(level) {
    // Remove existing performance classes
    document.body.classList.remove("perf-high", "perf-medium", "perf-low");

    // Add new performance class
    document.body.classList.add(`perf-${level}`);

    // Update status indicator
    if (statusIndicator) {
      statusIndicator.className = `status-indicator status-${level}`;
      statusIndicator.textContent = level;
    }

    // Configure effect levels based on performance
    switch (level) {
      case "low":
        configureEffects({
          scanlines: true, // Keep basic scanlines
          "barrel-distortion": false, // Disable expensive distortion
          "chroma-noise": false, // Disable chroma noise
          "tracking-error": false, // Disable tracking errors
          dropout: false, // Disable dropouts
          "phosphor-glow": false, // Disable phosphor glow
        });
        break;

      case "medium":
        configureEffects({
          scanlines: true, // Keep scanlines
          "barrel-distortion": true, // Enable basic distortion
          "chroma-noise": true, // Enable chroma noise
          "tracking-error": false, // Disable tracking errors
          dropout: true, // Enable dropouts
          "phosphor-glow": true, // Enable phosphor glow
        });
        break;

      case "high":
      default:
        configureEffects({
          scanlines: true, // Full scanlines
          "barrel-distortion": true, // Full barrel distortion
          "chroma-noise": true, // Full chroma noise
          "tracking-error": true, // Enable tracking errors
          dropout: true, // Enable dropouts
          "phosphor-glow": true, // Enable phosphor glow
        });
        break;
    }
  }

  // Configure which effects are enabled
  function configureEffects(effectSettings) {
    metrics.effectsEnabled = { ...metrics.effectsEnabled, ...effectSettings };

    // Apply to CSS variables
    Object.entries(effectSettings).forEach(([effect, enabled]) => {
      document.documentElement.style.setProperty(
        `--effect-${effect}`,
        enabled ? "1" : "0"
      );
    });

    // Apply to effect elements
    Object.entries(effectSettings).forEach(([effect, enabled]) => {
      const elements = document.querySelectorAll(
        `.${effect}, .crt-${effect}, .vhs-${effect}`
      );
      elements.forEach((el) => {
        el.style.display = enabled ? "" : "none";
      });
    });

    // Update debug display
    if (CONFIG.debugMode) {
      updateEffectsDebugDisplay();
    }
  }

  // Create debug overlay
  function createDebugOverlay() {
    if (debugOverlay) return;

    // Create overlay container
    debugOverlay = document.createElement("div");
    debugOverlay.className = "crt-debug-overlay";
    debugOverlay.innerHTML = `
      <div class="debug-header">
        <span class="fps-counter">0 FPS</span>
        <span class="status-indicator status-high">high</span>
      </div>
      <div class="effects-status"></div>
    `;

    // Style the overlay
    const style = document.createElement("style");
    style.textContent = `
      .crt-debug-overlay {
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: #00ff00;
        padding: 10px;
        border: 1px solid #00ff00;
        font-family: monospace;
        z-index: 9999;
        font-size: 12px;
        pointer-events: none;
      }
      .debug-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .fps-counter {
        font-weight: bold;
      }
      .status-indicator {
        padding: 2px 5px;
        border-radius: 3px;
      }
      .status-high {
        background: #00aa00;
      }
      .status-medium {
        background: #aaaa00;
      }
      .status-low {
        background: #aa0000;
      }
      .effects-status {
        display: grid;
        grid-template-columns: auto auto;
        gap: 3px 10px;
      }
      .effect-enabled {
        color: #00ff00;
      }
      .effect-disabled {
        color: #ff0000;
        text-decoration: line-through;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(debugOverlay);

    fpsCounter = debugOverlay.querySelector(".fps-counter");
    statusIndicator = debugOverlay.querySelector(".status-indicator");
  }

  // Update the debug display
  function updateDebugDisplay() {
    if (!fpsCounter) return;

    // Update FPS counter
    fpsCounter.textContent = `${metrics.avgFps.toFixed(1)} FPS`;

    // Update status indicator color
    statusIndicator.className = `status-indicator status-${metrics.performanceLevel}`;
  }

  // Update the effects status in debug display
  function updateEffectsDebugDisplay() {
    if (!debugOverlay) return;

    const effectsContainer = debugOverlay.querySelector(".effects-status");
    if (!effectsContainer) return;

    effectsContainer.innerHTML = "";

    // Add each effect status
    Object.entries(metrics.effectsEnabled).forEach(([effect, enabled]) => {
      const effectElement = document.createElement("div");
      effectElement.className = enabled ? "effect-enabled" : "effect-disabled";
      effectElement.textContent = effect.replace(/-/g, " ");
      effectsContainer.appendChild(effectElement);
    });
  }

  // Initialize the performance monitor
  function init() {
    // Check for Performance API support
    if (window.performance && window.performance.memory) {
      setInterval(() => {
        metrics.memoryUsage =
          window.performance.memory.usedJSHeapSize / 1048576; // Convert to MB
      }, CONFIG.measureInterval);
    }

    // Create debug overlay if enabled
    if (CONFIG.debugMode) {
      createDebugOverlay();
    }

    // Start tracking frames
    requestAnimationFrame(trackFrame);

    // Set initial performance level
    updatePerformanceLevel();

    // Set up event listeners for visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        // Reset metrics when tab becomes visible again
        metrics.lastFrameTime = 0;
        metrics.frameTimes = [];
      }
    });

    // Expose API
    window.PerformanceMonitor = {
      getMetrics: () => ({ ...metrics }),
      getPerformanceLevel: () => metrics.performanceLevel,
      setDebugMode: (enabled) => {
        CONFIG.debugMode = enabled;
        if (enabled && !debugOverlay) {
          createDebugOverlay();
        } else if (!enabled && debugOverlay) {
          debugOverlay.remove();
          debugOverlay = null;
        }
      },
      canPlayEffect: (effectIntensity = "medium") => {
        // Check if it's too soon for another effect
        const now = performance.now();
        const timeSinceLastEffect = now - metrics.lastEffectTime;

        // Don't play effects too close together on low performance devices
        if (metrics.performanceLevel === "low" && effectIntensity !== "low") {
          return false;
        }

        // Adjust minimum time between effects based on performance level
        let minTime = CONFIG.minEffectDuration;
        if (metrics.performanceLevel === "medium") minTime *= 2;
        if (metrics.performanceLevel === "low") minTime *= 4;

        // Allow effect if enough time has passed
        if (timeSinceLastEffect > minTime) {
          metrics.lastEffectTime = now;
          return true;
        }

        return false;
      },
      markEffectStart: () => {
        metrics.lastEffectTime = performance.now();
      },
    };
  }

  // Initialize on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
