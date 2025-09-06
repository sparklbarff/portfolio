(function () {
  "use strict";

  const bgContainer = document.getElementById("bg-container");
  if (!bgContainer) {
    console.error("bg-container not found!");
    return;
  }

  let manifest = null;
  let currentIndex = 0;
  let images = [];
  let preloadedImages = new Map();
  let cycleTimer = null;
  let isTransitioning = false;

  console.log("[BG] Background loader starting...");

  function fetchManifest() {
    return fetch("manifest.json")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load manifest.json");
        return response.json();
      })
      .catch((error) => {
        console.error("Error loading background manifest:", error);
        return {
          count: 0,
          pad: false,
          path: "assets/images",
          extension: "png",
          preload: 0,
        };
      });
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

    console.log(`[BG] Generated ${results.length} image paths`);
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
        console.error(`[BG] Failed to load image: ${src}`);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  }

  function createBackgroundElement(src, index) {
    const div = document.createElement("div");
    div.className = "bg-image";
    div.style.backgroundImage = `url(${src})`;
    div.dataset.index = index;
    div.dataset.src = src;
    return div;
  }

  function transitionToNext() {
    if (isTransitioning || !images.length) return;
    isTransitioning = true;

    const nextIndex = (currentIndex + 1) % images.length;
    const nextSrc = images[nextIndex];

    console.log(
      `[BG] Transitioning from ${currentIndex} to ${nextIndex}: ${nextSrc}`
    );

    // Find current active image
    const current = bgContainer.querySelector(".bg-image.active");

    // Create or find next image
    let next = bgContainer.querySelector(`[data-index="${nextIndex}"]`);
    if (!next) {
      next = createBackgroundElement(nextSrc, nextIndex);
      bgContainer.appendChild(next);
      console.log(`[BG] Created new image element for index ${nextIndex}`);
    }

    // Transition
    setTimeout(() => {
      if (current) {
        current.classList.remove("active");
        console.log(`[BG] Removed active from index ${current.dataset.index}`);
      }

      next.classList.add("active");
      console.log(`[BG] Added active to index ${nextIndex}`);

      setTimeout(() => {
        currentIndex = nextIndex;
        isTransitioning = false;

        // Clean up old elements (keep 3 for smooth transitions)
        const allImages = bgContainer.querySelectorAll(
          ".bg-image:not(.active)"
        );
        if (allImages.length > 3) {
          Array.from(allImages)
            .slice(0, allImages.length - 3)
            .forEach((img) => {
              console.log(
                `[BG] Cleaning up old image index ${img.dataset.index}`
              );
              img.remove();
            });
        }
      }, 100);
    }, 50);
  }

  function setupCycle() {
    if (cycleTimer) {
      clearInterval(cycleTimer);
    }

    if (document.documentElement.dataset.motion !== "paused") {
      // Get period from CSS variable
      const period =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--period"
          )
        ) * 1000 || 7000;
      console.log(`[BG] Setting up cycle with period: ${period}ms`);
      cycleTimer = setInterval(() => {
        console.log(`[BG] Timer triggered - calling transitionToNext`);
        transitionToNext();
      }, period);
    }
  }

  function setupFirstBg() {
    if (!images.length)
      return Promise.reject(new Error("No background images available"));

    const firstSrc = images[0];
    console.log(`[BG] Setting up first background: ${firstSrc}`);

    return preloadImage(firstSrc)
      .then(() => {
        const first = createBackgroundElement(firstSrc, 0);
        bgContainer.appendChild(first);

        setTimeout(() => {
          first.classList.add("active");
          console.log(`[BG] First image activated`);
          isTransitioning = false;
        }, 100);
      })
      .catch((error) => {
        console.error("Error setting up initial background:", error);
      });
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

        console.log(`[BG] Manifest loaded: ${manifest.count} images`);
        return setupFirstBg();
      })
      .then(() => {
        setupCycle();
        console.log("[BG] Background system initialized successfully");

        // Test transition after 2 seconds
        setTimeout(() => {
          console.log("[BG] Testing manual transition...");
          transitionToNext();
        }, 2000);
      })
      .catch((error) => {
        console.error("Failed to initialize backgrounds:", error);
      });
  }

  // Start initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBackgrounds);
  } else {
    initBackgrounds();
  }
})();
