/* Title glitch engine: immediate initialization */
(function() {
  "use strict";

  const root = document.documentElement;
  const container = document.getElementById("glitch-title");
  if (!container) return;

  const text = container.dataset.text || (container.textContent || "").trim() || "TRAVIS INSKEEP";
  container.textContent = "";
  const frag = document.createDocumentFragment();
  const letters = [];

  // Create letter elements
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = 'tg-letter';
    s.textContent = ch;
    frag.appendChild(s);
    letters.push(s);
  }
  container.appendChild(frag);

  let rafId = 0, destroyed = false;

  // Apply glitch effect to a letter
  function jitterLetter(el, nudge) {
    const dx = (Math.random() * 2 - 1) * nudge;
    const dy = (Math.random() * 2 - 1) * nudge * 0.6;
    const r = Math.random() * 1.2;
    
    // RGB channel split via text-shadow
    el.style.textShadow =
      `${0.9 + r}px 0 rgba(255, 0, 76, .35), ${-0.9 - r}px 0 rgba(0, 255, 200, .35), 0 ${0.7 + r}px rgba(0, 170, 255, .35)`;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    el.style.opacity = 0.94 + Math.random() * 0.06;
  }

  let burstUntil = 0;
  
  // Animation loop
  function loop() {
    if (destroyed) return;
    
    if (root.dataset.motion === "paused") {
      rafId = requestAnimationFrame(loop);
      return;
    }

    const now = performance.now();
    // Occasionally create a burst effect
    if (Math.random() < 0.005) {
      burstUntil = now + 300 + Math.random() * 200;
    }
    
    const inBurst = now < burstUntil;
    const nudge = inBurst ? 3.0 : 0.4; // More dramatic during bursts
    
    // Apply to all letters
    letters.forEach(l => jitterLetter(l, nudge));
    
    rafId = requestAnimationFrame(loop);
  }

  // Start animation immediately
  rafId = requestAnimationFrame(loop);

  // Cleanup
  function destroy() {
    destroyed = true;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }
  
  window.addEventListener("beforeunload", destroy);
  
  // Expose cleanup method
  window.titleGlitchCleanup = destroy;
})();