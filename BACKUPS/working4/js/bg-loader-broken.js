(function() {
  "use strict";
  
  const bgContainer = document.getElementById('bg-container');
  if (!bgContainer) return;
  
  const scanSweep = document.getElementById('scanSweep');
  let manifest = null;
  let currentIndex = 0;
  let images = [];
  let preloadedImages = new Map();
  let cycleTimer = null;
  let isTransitioning = false;
  
  function fetchManifest() {
    return fetch('manifest.json')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load manifest.json');
        return response.json();
      })
      .catch(error => {
        console.error('Error loading background manifest:', error);
        return {
          count: 0,
          pad: false,
          path: 'assets/images',
          extension: 'png',
          preload: 0
        };
      });
  }
  
  function generateImagePaths() {
    if (!manifest || manifest.count <= 0) return [];
    
    const results = [];
    const padZero = manifest.pad && manifest.count > 9;
    
    for (let i = 1; i <= manifest.count; i++) {
      const num = padZero ? String(i).padStart(2, '0') : i;
      const path = `${manifest.path}/bg${num}.${manifest.extension}`;
      results.push(path);
    }
    
    return results;
  }
  
  function preloadImage(src) {
    if (preloadedImages.has(src)) {
      return Promise.resolve(preloadedImages.get(src));
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        preloadedImages.set(src, img);
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  }
  
  function preloadNext(count) {
    if (!images.length) return Promise.resolve();
    
    const promises = [];
    for (let i = 0; i < count; i++) {
      const idx = (currentIndex + i) % images.length;
      promises.push(preloadImage(images[idx]));
    }
    
    return Promise.all(promises);
  }
  
  function createBackgroundElement(src) {
    const div = document.createElement('div');
    div.className = 'bg-image';
    div.style.backgroundImage = `url(${src})`;
    return div;
  }
  
  function triggerScanlineSweep() {
    if (!scanSweep || document.documentElement.dataset.motion === "paused") return;
    
    // Very rarely trigger any effect on transition
    if (Math.random() < 0.05) { // 5% chance
      // Brief tracking error
      const elements = document.querySelectorAll('header, nav');
      elements.forEach(el => {
        if (Math.random() < 0.1) { // 10% chance
          el.classList.add('horizontal-hold-error');
          setTimeout(() => el.classList.remove('horizontal-hold-error'), 800);
        }
      });
    }
  }
  
  function transitionToNext() {
    if (isTransitioning || !images.length) return;
    isTransitioning = true;
    
    const nextIndex = (currentIndex + 1) % images.length;
    const currentSrc = images[currentIndex];
    const nextSrc = images[nextIndex];
    
    const current = bgContainer.querySelector(`.bg-image[style*="${currentSrc}"]`);
    let next = bgContainer.querySelector(`.bg-image[style*="${nextSrc}"]`);
    
    if (!next) {
      next = createBackgroundElement(nextSrc);
      bgContainer.appendChild(next);
    }
    
    setTimeout(() => {
      if (current) {
        current.classList.remove('active');
      }
      
      next.classList.add('active');
      triggerScanlineSweep();
      
      setTimeout(() => {
        currentIndex = nextIndex;
        isTransitioning = false;
        preloadNext(manifest.preload || 2).catch(() => {});
        
        document.documentElement.style.setProperty('--bg-current', `url(${nextSrc})`);
        
        const oldImages = bgContainer.querySelectorAll('.bg-image:not(.active)');
        if (oldImages.length > 3) {
          Array.from(oldImages)
            .slice(0, oldImages.length - 3)
            .forEach(img => img.remove());
        }
      }, 500);
    }, 50);
  }
  
  function setupCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
    }
    
    if (document.documentElement.dataset.motion !== "paused") {
      // Fast rotation - 4 seconds instead of 20
      const period = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--period')) * 1000 || 4000;
      cycleTimer = setInterval(transitionToNext, period);
    }
  }
  
  function setupFirstBg() {
    if (!images.length) return Promise.reject(new Error('No background images available'));
    
    const firstSrc = images[0];
    return preloadImage(firstSrc)
      .then(() => {
        const first = createBackgroundElement(firstSrc);
        bgContainer.appendChild(first);
        
        setTimeout(() => {
          first.classList.add('active');
          document.documentElement.style.setProperty('--bg-current', `url(${firstSrc})`);
          isTransitioning = false;
        }, 100);
        
        return preloadNext(manifest.preload || 2);
      })
      .catch(error => {
        console.error('Error setting up initial background:', error);
      });
  }
  
  function initBackgrounds() {
    return fetchManifest()
      .then(data => {
        manifest = data;
        images = generateImagePaths();
        
        if (!images.length) {
          console.error('No background images defined in manifest');
          return;
        }
        
        return setupFirstBg();
      })
      .then(() => {
        setupCycle();
        
        window.addEventListener('focus', () => {
          setupCycle();
        });
        
        window.addEventListener('blur', () => {
          if (cycleTimer) clearInterval(cycleTimer);
        });
        
        const motionBtn = document.getElementById('motionBtn');
        if (motionBtn) {
          motionBtn.addEventListener('click', () => {
            const isPaused = document.documentElement.dataset.motion === "paused";
            document.documentElement.dataset.motion = isPaused ? null : "paused";
            motionBtn.textContent = isPaused ? "Motion: On" : "Motion: Off";
            motionBtn.setAttribute('aria-pressed', isPaused ? 'false' : 'true');
            
            if (isPaused) {
              setupCycle();
            } else if (cycleTimer) {
              clearInterval(cycleTimer);
            }
          });
        }
      })
      .catch(error => {
        console.error('Failed to initialize backgrounds:', error);
      });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackgrounds);
  } else {
    initBackgrounds();
  }
})();
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
