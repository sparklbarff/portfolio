(function () {
  "use strict";

  const bgContainer = document.getElementById("bg-container");
  if (!bgContainer) {
    console.error("[BG-DEBUG] No bg-container found!");
    return;
  }

  // Hardcode the images for testing
  const images = [];
  for (let i = 1; i <= 31; i++) {
    images.push(`assets/images/bg${i}.png`);
  }

  let currentIndex = 0;
  let cycleTimer = null;

  console.log("[BG-DEBUG] Starting with", images.length, "hardcoded images");

  function createBackgroundElement(src) {
    const div = document.createElement("div");
    div.className = "bg-image";
    div.style.backgroundImage = `url(${src})`;
    return div;
  }

  function transitionToNext() {
    console.log(
      "[BG-DEBUG] Transitioning from index",
      currentIndex,
      "to",
      (currentIndex + 1) % images.length
    );

    const nextIndex = (currentIndex + 1) % images.length;
    const nextSrc = images[nextIndex];

    const current = bgContainer.querySelector(".bg-image.active");
    const next = createBackgroundElement(nextSrc);

    bgContainer.appendChild(next);

    setTimeout(() => {
      if (current) {
        current.classList.remove("active");
      }

      next.classList.add("active");
      currentIndex = nextIndex;

      // Clean up old images
      setTimeout(() => {
        const oldImages = bgContainer.querySelectorAll(
          ".bg-image:not(.active)"
        );
        oldImages.forEach((img) => img.remove());
      }, 3000);
    }, 50);
  }

  function startCycle() {
    console.log("[BG-DEBUG] Starting 7-second cycle");
    if (cycleTimer) clearInterval(cycleTimer);
    cycleTimer = setInterval(transitionToNext, 7000);
  }

  // Set up first image
  const first = createBackgroundElement(images[0]);
  bgContainer.appendChild(first);

  setTimeout(() => {
    first.classList.add("active");
    console.log(
      "[BG-DEBUG] First image activated, starting cycle in 2 seconds"
    );

    setTimeout(() => {
      startCycle();
    }, 2000);
  }, 100);
})();
