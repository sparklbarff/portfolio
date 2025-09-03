/*
 * CRT Background Loader System
 * Manages dynamic background image cycling with brightness analysis
 * Physics: Background luminance affects CRT phosphor excitation patterns
 * Implementation: Canvas-based brightness sampling feeds system coordination
 * Coordinates sweep effects with image transitions for realistic timing
 * Performance: Adaptive preloading, optimized transition intervals
 */
(function () {
  "use strict";

  /* Background system constants */
  const BG_CONSTANTS = {
    SAMPLE_SIZE: 100 /* Canvas sample dimensions for analysis */,
    PRELOAD_COUNTS: {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
    } /* Images to preload by performance */,
    DEFAULT_PERIOD: 20000 /* Default transition interval (ms) */,
    AUTONOMOUS_SWEEP_MIN: 45000 /* Minimum autonomous sweep interval */,
    AUTONOMOUS_SWEEP_MAX: 90000 /* Maximum autonomous sweep interval */,
  };

  /* Sweep effect probabilities by performance level */
  const SWEEP_CHANCES = {
    LOW: { VHS: 0.2, RETRACE: 0.1, TRACKING: 0.05, HEAD: 0.0 },
    MEDIUM: { VHS: 0.4, RETRACE: 0.5, TRACKING: 0.1, HEAD: 0.05 },
    HIGH: { VHS: 0.6, RETRACE: 0.8, TRACKING: 0.2, HEAD: 0.15 },
  };

  const bgContainer = document.getElementById("bg-container");
  if (!bgContainer) {
    console.error("[Background] Container not found: bg-container");
    return;
  }

  let manifest = null;
  let currentIndex = 0;
  let images = [];
  let preloadedImages = new Map();
  let cycleTimer = null;
  let isTransitioning = false;
  let performanceLevel = "high";
  let preloadQueue = [];
  let isPreloading = false;

  // Cleanup registry for background system
  const BgCleanup = {
    timers: new Set(),
    intervals: new Set(),

    registerTimer(id) {
      this.timers.add(id);
    },

    registerInterval(id) {
      this.intervals.add(id);
    },

    cleanupAll() {
      this.timers.forEach((id) => clearTimeout(id));
      this.timers.clear();
      this.intervals.forEach((id) => clearInterval(id));
      this.intervals.clear();
      console.log("[Background] Cleanup completed");
    },
  };

  // Register with unified CRT system (with fallback)
  function registerWithCRTSystem() {
    if (window.CRTTemporalState) {
      window.CRTTemporalState.registerSystem("background");
      console.log("[Background] Registered with CRT system");
    } else {
      console.log(
        "[Background] CRT system not available, running independently"
      );
    }
  }

  // Try to register now, or wait for system to be ready
  registerWithCRTSystem();

  function updatePerformanceSettings() {
    const monitor = window.PerformanceMonitor;
    performanceLevel = monitor ? monitor.getPerformanceLevel() : "high";
  }

  // Background brightness analysis for CRT coordination
  function analyzeBackgroundIntensity(imageSrc) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = function () {
      canvas.width = BG_CONSTANTS.SAMPLE_SIZE;
      canvas.height = BG_CONSTANTS.SAMPLE_SIZE;
      ctx.drawImage(
        img,
        0,
        0,
        BG_CONSTANTS.SAMPLE_SIZE,
        BG_CONSTANTS.SAMPLE_SIZE
      );

      try {
        const imageData = ctx.getImageData(
          0,
          0,
          BG_CONSTANTS.SAMPLE_SIZE,
          BG_CONSTANTS.SAMPLE_SIZE
        );
        const data = imageData.data;
        let totalBrightness = 0;

        // Calculate luminance using standard RGB weights
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          totalBrightness += brightness;
        }

        const avgBrightness = totalBrightness / (data.length / 4);

        // Update global CRT state with background intensity (optional)
        if (window.CRTTemporalState) {
          window.CRTTemporalState.updateBackgroundIntensity(avgBrightness);
          console.log(
            `[Background] Updated CRT state with brightness: ${avgBrightness.toFixed(
              3
            )}`
          );
        } else {
          console.log(
            `[Background] Brightness analyzed (CRT system not available): ${avgBrightness.toFixed(
              3
            )}`
          );
        }
      } catch (error) {
        console.error("[Background] Could not analyze brightness:", error);
      }
    };

    img.crossOrigin = "anonymous";
    img.src = imageSrc;
  }

  function fetchManifest() {
    console.log(
      "[Background] Fetching manifest from:",
      window.location.origin + "/manifest.json"
    );
    return fetch("manifest.json")
      .then((response) => {
        console.log("[Background] Manifest response status:", response.status);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("[Background] Manifest loaded successfully:", data);
        return data;
      })
      .catch((error) => {
        console.error("[Background] Manifest load failed:", error);
        console.log("[Background] Using fallback manifest");
        return {
          count: 31,
          pad: false,
          path: "assets/images",
          extension: "png",
          preload: 3,
        };
      });
  }

  function generateImagePaths() {
    if (!manifest || manifest.count <= 0) {
      console.error("[Background] Invalid manifest:", manifest);
      return [];
    }

    const results = [];
    const padZero = manifest.pad && manifest.count > 9;

    for (let i = 1; i <= manifest.count; i++) {
      const num = padZero ? String(i).padStart(2, "0") : i;
      const path = `${manifest.path}/bg${num}.${manifest.extension}`;
      results.push(path);
    }

    console.log(
      "[Background] Generated image paths:",
      results.slice(0, 3),
      "... (" + results.length + " total)"
    );
    return results;
  }

  function preloadImage(src) {
    if (preloadedImages.has(src)) {
      return Promise.resolve(preloadedImages.get(src));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();

      // Enhanced loading with progressive JPEG support
      img.crossOrigin = "anonymous";
      img.decoding = "async";

      img.onload = () => {
        preloadedImages.set(src, img);
        console.log(
          `[Background] Preloaded: ${src} (${img.naturalWidth}x${img.naturalHeight})`
        );
        resolve(img);
      };

      img.onerror = () => {
        console.error("[Background] Failed to load:", src);
        reject(new Error(`Failed to load: ${src}`));
      };

      img.src = src;
    });
  }

  function preloadNext(count) {
    updatePerformanceSettings();

    // Enhanced preload count with connection speed awareness
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const isSlowConnection =
      connection &&
      (connection.saveData ||
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g");

    let adjustedCount =
      BG_CONSTANTS.PRELOAD_COUNTS[performanceLevel.toUpperCase()] || count;

    // Further reduce preload on slow connections
    if (isSlowConnection) {
      adjustedCount = Math.max(1, Math.floor(adjustedCount * 0.5));
      console.log(
        `[Background] Reduced preload for slow connection: ${adjustedCount}`
      );
    }

    if (!images.length) return Promise.resolve();

    const promises = [];
    for (let i = 0; i < adjustedCount; i++) {
      const idx = (currentIndex + i) % images.length;

      // Add timeout based on connection speed
      const timeoutMs = isSlowConnection ? 15000 : 8000;
      const preloadPromise = Promise.race([
        preloadImage(images[idx]),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Preload timeout")), timeoutMs);
        }),
      ]).catch((err) => {
        console.warn(`[Background] Preload failed: ${images[idx]}`, err);
        return null;
      });

      promises.push(preloadPromise);
    }

    return Promise.all(promises);
  }

  function createBackgroundElement(src) {
    const div = document.createElement("div");
    div.className = "bg-image";
    div.style.backgroundImage = `url(${src})`;
    return div;
  }

  function triggerScanlineSweep() {
    if (document.documentElement.dataset.motion === "paused") return;

    updatePerformanceSettings();

    // Get CRT system state if available, or use defaults
    const crtState = window.CRTTemporalState;

    // Enhanced sweep chances based on CRT system state
    let baseChances =
      SWEEP_CHANCES[performanceLevel.toUpperCase()] || SWEEP_CHANCES.HIGH;
    let chances = { ...baseChances };

    // Modify chances based on system state (if available)
    if (crtState) {
      const stateMultiplier = crtState.mode === "failure" ? 2 : 1;
      const thermalMultiplier = 1 + crtState.thermalLevel;
      const backgroundMultiplier = 0.5 + crtState.backgroundIntensity;

      Object.keys(chances).forEach((key) => {
        chances[key] *=
          stateMultiplier * thermalMultiplier * backgroundMultiplier;
      });
      console.log("[Background] Applied CRT state modifiers to sweep chances");
    } else {
      console.log(
        "[Background] Using base sweep chances (CRT system not available)"
      );
    }

    // Trigger coordinated sweeps
    if (Math.random() < chances.VHS) {
      const vhsSweep = document.getElementById("vhsSweep");
      if (vhsSweep) {
        vhsSweep.classList.remove("active");
        void vhsSweep.offsetWidth;
        vhsSweep.classList.add("active");

        // Trigger background cascade if intense enough
        if (crtState && chances.VHS > 0.8) {
          crtState.triggerUnifiedCascade(0.4, "background");
          console.log("[Background] Triggered unified cascade");
        }
      }
    }

    if (Math.random() < chances.RETRACE) {
      const crtRetrace = document.getElementById("crtRetrace");
      if (crtRetrace) {
        crtRetrace.classList.remove("active");
        void crtRetrace.offsetWidth;
        crtRetrace.classList.add("active");
      }
    }

    // Only trigger expensive effects on higher performance levels
    if (performanceLevel !== "low") {
      if (Math.random() < chances.TRACKING) {
        const elements = document.querySelectorAll("header, nav");
        elements.forEach((el) => {
          if (Math.random() < 0.25) {
            el.classList.add("horizontal-hold-error");
            const errorTimer = setTimeout(
              () => el.classList.remove("horizontal-hold-error"),
              1300
            );
            BgCleanup.registerTimer(errorTimer);
          }
        });
      }

      if (Math.random() < chances.HEAD) {
        const headSwitch = document.getElementById("vhsHeadSwitch");
        if (headSwitch) {
          headSwitch.style.top = Math.random() * 80 + 10 + "%";
          headSwitch.classList.remove("active");
          void headSwitch.offsetWidth;
          headSwitch.classList.add("active");
        }
      }
    }
  }

  function transitionToNext() {
    if (isTransitioning || !images.length) return;
    isTransitioning = true;

    const nextIndex = (currentIndex + 1) % images.length;
    const nextSrc = images[nextIndex];

    // Analyze new background intensity
    analyzeBackgroundIntensity(nextSrc);

    const current = bgContainer.querySelector(".bg-image.active");
    let next = bgContainer.querySelector(
      `.bg-image[style*="${nextSrc.split("/").pop()}"]`
    );

    if (!next) {
      next = createBackgroundElement(nextSrc);
      bgContainer.appendChild(next);
    }

    const transitionTimer = setTimeout(() => {
      if (current) current.classList.remove("active");
      next.classList.add("active");
      triggerScanlineSweep();

      const cleanupTimer = setTimeout(() => {
        currentIndex = nextIndex;
        isTransitioning = false;
        preloadNext(manifest.preload || 2).catch(() => {});

        // Cleanup old images
        const oldImages = bgContainer.querySelectorAll(
          ".bg-image:not(.active)"
        );
        if (oldImages.length > 3) {
          Array.from(oldImages)
            .slice(0, oldImages.length - 3)
            .forEach((img) => img.remove());
        }
      }, 500);
      BgCleanup.registerTimer(cleanupTimer);
    }, 50);
    BgCleanup.registerTimer(transitionTimer);
  }

  function setupCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
    }

    if (document.documentElement.dataset.motion !== "paused") {
      const period =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--period"
          )
        ) * 1000 || BG_CONSTANTS.DEFAULT_PERIOD;
      console.log("[Background] Setting up cycle with period:", period);
      cycleTimer = setInterval(transitionToNext, period);
      BgCleanup.registerInterval(cycleTimer);
    }
  }

  function setupFirstBg() {
    if (!images.length) {
      console.error("[Background] No images available for first background");

      // FIXED: Create lighter fallback background
      const fallback = document.createElement("div");
      fallback.className = "bg-image active";
      fallback.style.background =
        "linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%)";
      fallback.style.filter = "none";
      bgContainer.appendChild(fallback);
      console.log("[Background] Created lighter fallback background");

      // Set reasonable background intensity
      if (window.CRTTemporalState) {
        window.CRTTemporalState.updateBackgroundIntensity(0.3);
      }

      return Promise.resolve();
    }

    const firstSrc = images[0];
    console.log("[Background] Setting up first background:", firstSrc);

    return preloadImage(firstSrc)
      .then(() => {
        const first = createBackgroundElement(firstSrc);
        bgContainer.appendChild(first);

        const activateTimer = setTimeout(() => {
          first.classList.add("active");
          console.log("[Background] First background activated");
          document.documentElement.style.setProperty(
            "--bg-current",
            `url(${firstSrc})`
          );
          isTransitioning = false;

          // Analyze first background intensity
          analyzeBackgroundIntensity(firstSrc);
        }, 100);
        BgCleanup.registerTimer(activateTimer);

        return preloadNext(manifest.preload || 2);
      })
      .catch((error) => {
        console.error(
          "[Background] Error setting up initial background:",
          error
        );

        // FIXED: Create much lighter fallback background
        const fallback = document.createElement("div");
        fallback.className = "bg-image active";
        fallback.style.background =
          "linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%)";
        fallback.style.filter = "none";
        bgContainer.appendChild(fallback);
        console.log(
          "[Background] Created lighter emergency fallback background"
        );

        // Set reasonable background intensity for fallback
        if (window.CRTTemporalState) {
          window.CRTTemporalState.updateBackgroundIntensity(0.3);
        }
      });
  }

  function initBackgrounds() {
    console.log("[Background] Initializing backgrounds...");

    // IMMEDIATE FALLBACK: If bgContainer doesn't exist, create basic visual
    if (!bgContainer) {
      console.error(
        "[Background] bg-container element not found! Creating emergency fallback."
      );
      const body = document.body;
      if (body) {
        body.style.background =
          "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)";
        console.log("[Background] Applied emergency body background");
      }
      return Promise.reject(new Error("Missing bg-container element"));
    }

    return fetchManifest()
      .then((data) => {
        manifest = data;
        images = generateImagePaths();

        if (!images.length) {
          console.error(
            "[Background] No background images defined in manifest"
          );

          // Create immediate fallback
          const fallback = document.createElement("div");
          fallback.className = "bg-image active";
          fallback.style.background =
            "linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%)";
          fallback.style.filter = "none";
          bgContainer.appendChild(fallback);
          console.log("[Background] Created manifest fallback");

          // Optional CRT state update
          if (window.CRTTemporalState) {
            window.CRTTemporalState.updateBackgroundIntensity(0.3);
          }
          return Promise.resolve(); // Continue with basic background
        }

        return setupFirstBg();
      })
      .then(() => {
        setupCycle();

        // Setup autonomous sweep effects with unified timing
        const autonomousSweepInterval = setInterval(() => {
          if (document.documentElement.dataset.motion === "paused") return;
          const performanceMode =
            document.documentElement.classList.contains("perf-reduce");

          // Autonomous retrace sweep based on performance level
          if (!performanceMode && Math.random() < 0.3) {
            const crtRetrace = document.getElementById("crtRetrace");
            if (crtRetrace) {
              crtRetrace.classList.remove("active");
              void crtRetrace.offsetWidth;
              crtRetrace.classList.add("active");
              console.log("[Background] Autonomous CRT retrace triggered");
            }
          }
        }, BG_CONSTANTS.AUTONOMOUS_SWEEP_MIN + Math.random() * (BG_CONSTANTS.AUTONOMOUS_SWEEP_MAX - BG_CONSTANTS.AUTONOMOUS_SWEEP_MIN));
        BgCleanup.registerInterval(autonomousSweepInterval);

        // Window focus/blur handling
        const focusHandler = () => setupCycle();
        const blurHandler = () => {
          if (cycleTimer) clearInterval(cycleTimer);
        };

        window.addEventListener("focus", focusHandler);
        window.addEventListener("blur", blurHandler);

        console.log("[Background] Initialization completed successfully");
      })
      .catch((error) => {
        console.error("[Background] Failed to initialize backgrounds:", error);

        // GUARANTEED FALLBACK: Always provide some background
        if (bgContainer) {
          const fallback = document.createElement("div");
          fallback.className = "bg-image active";
          fallback.style.background =
            "linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%)";
          fallback.style.filter = "none";
          bgContainer.appendChild(fallback);
          console.log("[Background] Emergency fallback background created");
        } else {
          // Last resort: apply to body
          document.body.style.background =
            "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)";
          console.log("[Background] Applied body fallback background");
        }

        // Optional CRT state update
        if (window.CRTTemporalState) {
          window.CRTTemporalState.updateBackgroundIntensity(0.3);
        }
      });
  }

  // Initialize with proper DOM ready handling
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBackgrounds);
  } else {
    initBackgrounds();
  }

  // Enhanced cleanup with error handling
  const cleanupHandler = () => {
    try {
      BgCleanup.cleanupAll();
    } catch (error) {
      console.error("[Background] Cleanup failed:", error);
    }
  };

  window.addEventListener("beforeunload", cleanupHandler);
  window.addEventListener("pagehide", cleanupHandler);

  // Listen for unified cascade events with error handling
  const cascadeHandler = (event) => {
    try {
      const { intensity, origin } = event.detail;
      if (origin === "background") return;

      console.log(`[Background] Cascade received: ${origin} -> ${intensity}`);

      if (intensity > 0.5) {
        const sweepTimer = setTimeout(
          () => triggerScanlineSweep(),
          Math.random() * 500
        );
        BgCleanup.registerTimer(sweepTimer);
      }
    } catch (error) {
      console.error("[Background] Cascade handler failed:", error);
    }
  };

  window.addEventListener("crtCascade", cascadeHandler);
})();
