(function () {
  "use strict";

  const bgContainer = document.getElementById("bg-container");
  if (!bgContainer) return;

  const scanSweep = document.getElementById("scanSweep");
  let manifest = null;
  let currentIndex = 0;
  let images = [];
  let preloadedImages = new Map();
  let cycleTimer = null;
  let isTransitioning = false;

  // Cross-browser compatibility detection
  const browserSupport = {
    fetch: typeof fetch !== "undefined",
    cssCustomProperties: (() => {
      try {
        const testEl = document.createElement("div");
        testEl.style.setProperty("--test", "1");
        const value = getComputedStyle(testEl).getPropertyValue("--test");
        return value.trim() === "1";
      } catch (e) {
        return false;
      }
    })(),
    requestAnimationFrame: typeof requestAnimationFrame !== "undefined",
    visibilityAPI: typeof document.hidden !== "undefined",
  };

  console.log("🔍 Background Loader - Browser Support:", browserSupport);

  // Enhanced manifest fetching with fallback
  function fetchManifest() {
    if (browserSupport.fetch) {
      return fetch("manifest.json")
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .catch((error) => {
          console.warn("Fetch failed, trying XMLHttpRequest fallback:", error);
          return fetchManifestFallback();
        });
    } else {
      console.log("Using XMLHttpRequest for manifest loading");
      return fetchManifestFallback();
    }
  }

  // XMLHttpRequest fallback for older browsers
  function fetchManifestFallback() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "manifest.json", true);
      xhr.timeout = 5000; // 5 second timeout

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              console.error("JSON parse error:", e);
              resolve(getDefaultManifest());
            }
          } else {
            console.error(`XMLHttpRequest failed: ${xhr.status}`);
            resolve(getDefaultManifest());
          }
        }
      };

      xhr.onerror = () => {
        console.error("Network error loading manifest");
        resolve(getDefaultManifest());
      };

      xhr.ontimeout = () => {
        console.error("Timeout loading manifest");
        resolve(getDefaultManifest());
      };

      xhr.send();
    });
  }

  // Default manifest if loading fails
  function getDefaultManifest() {
    console.log("Using default manifest configuration");
    return {
      count: 31,
      pad: false,
      path: "assets/images",
      extension: "png",
      preload: 2,
    };
  }

  function generateImagePaths() {
    if (!manifest || manifest.count <= 0) return [];

    const results = [];
    const padZero = manifest.pad && manifest.count > 9;

    for (let i = 1; i <= manifest.count; i++) {
      const num = padZero ? String(i).padStart(2, "0") : i;
      const path = `${manifest.path}/bg${num}.${manifest.extension}`;
      results.push(path);
    }

    return results;
  }

  // Enhanced image preloading with timeout and retry
  function preloadImage(src, timeout = 10000) {
    if (preloadedImages.has(src)) {
      return Promise.resolve(preloadedImages.get(src));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      let timeoutId;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
      };

      const onSuccess = () => {
        cleanup();
        preloadedImages.set(src, img);
        resolve(img);
      };

      const onError = (error) => {
        cleanup();
        console.warn(`⚠️ Failed to load: ${src}`, error);
        // Don't reject - just resolve with null to continue
        resolve(null);
      };

      img.onload = onSuccess;
      img.onerror = onError;

      // Timeout handling
      timeoutId = setTimeout(() => {
        console.warn(`⏰ Timeout loading: ${src}`);
        onError(new Error("Image load timeout"));
      }, timeout);

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

    // Use allSettled to continue even if some images fail
    return Promise.allSettled
      ? Promise.allSettled(promises)
      : Promise.all(promises.map((p) => p.catch((e) => null)));
  }

  function createBackgroundElement(src) {
    const div = document.createElement("div");
    div.className = "bg-image";
    div.style.backgroundImage = `url(${src})`;

    // Fallback inline styles for browsers with poor CSS support
    if (!browserSupport.cssCustomProperties) {
      div.style.position = "absolute";
      div.style.top = "0";
      div.style.left = "0";
      div.style.width = "100%";
      div.style.height = "100%";
      div.style.backgroundSize = "cover";
      div.style.backgroundPosition = "center";
      div.style.opacity = "0";
      div.style.transition = "opacity 2s ease-in-out";
    }

    return div;
  }

  function triggerScanlineSweep() {
    if (!scanSweep || document.documentElement.dataset.motion === "paused")
      return;

    // Very rarely trigger any effect on transition
    if (Math.random() < 0.05) {
      // 5% chance
      // Brief tracking error
      const elements = document.querySelectorAll("header, nav");
      elements.forEach((el) => {
        if (Math.random() < 0.1) {
          // 10% chance
          el.classList.add("horizontal-hold-error");
          setTimeout(() => el.classList.remove("horizontal-hold-error"), 800);
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

    const current = bgContainer.querySelector(
      `.bg-image[style*="${currentSrc}"]`
    );
    let next = bgContainer.querySelector(`.bg-image[style*="${nextSrc}"]`);

    if (!next) {
      next = createBackgroundElement(nextSrc);
      bgContainer.appendChild(next);
    }

    // Enhanced timing with requestAnimationFrame fallback
    const scheduleTransition = (callback, delay) => {
      if (browserSupport.requestAnimationFrame && delay < 100) {
        requestAnimationFrame(callback);
      } else {
        setTimeout(callback, delay);
      }
    };

    scheduleTransition(() => {
      if (current) {
        current.classList.remove("active");
        // Fallback for browsers without CSS custom properties
        if (!browserSupport.cssCustomProperties) {
          current.style.opacity = "0";
        }
      }

      next.classList.add("active");
      // Fallback for browsers without CSS custom properties
      if (!browserSupport.cssCustomProperties) {
        next.style.opacity = "1";
      }

      triggerScanlineSweep();

      scheduleTransition(() => {
        currentIndex = nextIndex;
        isTransitioning = false;
        preloadNext(manifest.preload || 2).catch(() => {});

        // Update CSS custom property if supported
        if (browserSupport.cssCustomProperties) {
          document.documentElement.style.setProperty(
            "--bg-current",
            `url(${nextSrc})`
          );
        }

        const oldImages = bgContainer.querySelectorAll(
          ".bg-image:not(.active)"
        );
        if (oldImages.length > 3) {
          Array.from(oldImages)
            .slice(0, oldImages.length - 3)
            .forEach((img) => img.remove());
        }
      }, 500);
    }, 50);
  }

  // Enhanced cycle setup with cross-browser timing
  function setupCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
      cycleTimer = null;
    }

    let period = 7000; // Default 7 seconds

    // Try to get period from CSS if supported
    if (browserSupport.cssCustomProperties) {
      try {
        const cssValue = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--period");
        if (cssValue) {
          const parsed = parseFloat(cssValue) * 1000;
          if (parsed > 1000) {
            // Minimum 1 second
            period = parsed;
          }
        }
      } catch (e) {
        console.warn("Error reading CSS --period value:", e);
      }
    }

    cycleTimer = setInterval(transitionToNext, period);
  }

  function setupFirstBg() {
    if (!images.length)
      return Promise.reject(new Error("No background images available"));

    const firstSrc = images[0];
    return preloadImage(firstSrc)
      .then((img) => {
        // Continue even if image failed to load
        const first = createBackgroundElement(firstSrc);
        bgContainer.appendChild(first);

        setTimeout(() => {
          first.classList.add("active");

          // Fallback for browsers without CSS custom properties
          if (!browserSupport.cssCustomProperties) {
            first.style.opacity = "1";
          } else {
            document.documentElement.style.setProperty(
              "--bg-current",
              `url(${firstSrc})`
            );
          }

          isTransitioning = false;
        }, 100);

        return preloadNext(manifest.preload || 2);
      })
      .catch((error) => {
        console.error("Error setting up initial background:", error);
        // Continue anyway with basic setup
        isTransitioning = false;
      });
  }

  // Enhanced visibility handling
  function handleVisibilityChange() {
    if (!browserSupport.visibilityAPI) return;

    if (document.hidden) {
      if (cycleTimer) {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
    } else {
      setupCycle();
    }
  }

  function initBackgrounds() {
    return fetchManifest()
      .then((data) => {
        manifest = data;
        images = generateImagePaths();

        if (!images.length) {
          console.error("No background images defined in manifest");
          return;
        }

        return setupFirstBg();
      })
      .then(() => {
        setupCycle();

        // Enhanced event listeners
        window.addEventListener("focus", () => {
          setupCycle();
        });

        window.addEventListener("blur", () => {
          if (cycleTimer) {
            clearInterval(cycleTimer);
            cycleTimer = null;
          }
        });

        // Visibility API support
        if (browserSupport.visibilityAPI) {
          document.addEventListener("visibilitychange", handleVisibilityChange);
        }

        const motionBtn = document.getElementById("motionBtn");
        if (motionBtn) {
          motionBtn.addEventListener("click", () => {
            const isPaused =
              document.documentElement.dataset.motion === "paused";
            document.documentElement.dataset.motion = isPaused
              ? null
              : "paused";
            motionBtn.textContent = isPaused ? "Motion: On" : "Motion: Off";
            motionBtn.setAttribute("aria-pressed", isPaused ? "false" : "true");

            if (isPaused) {
              setupCycle();
            } else if (cycleTimer) {
              clearInterval(cycleTimer);
              cycleTimer = null;
            }
          });
        }
      })
      .catch((error) => {
        console.error("Failed to initialize backgrounds:", error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBackgrounds);
  } else {
    initBackgrounds();
  }

  // Export for debugging
  window.bgLoader = {
    browserSupport,
    manifest: () => manifest,
    images: () => images,
    currentIndex: () => currentIndex,
    forceNext: () => transitionToNext(),
    restart: () => {
      if (cycleTimer) clearInterval(cycleTimer);
      setupCycle();
    },
  };
})();
