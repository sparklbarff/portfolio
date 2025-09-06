/* Nav glitch: immediate initialization */
(function() {
  "use strict";

  const root = document.documentElement;
  const links = Array.from(document.querySelectorAll("#nav-list a"));
  if (!links.length) return;

  const states = links.map(() => ({ raf: 0, burstUntil: 0, destroyed: false }));

  function tick(i) {
    const st = states[i];
    if (st.destroyed) return;

    if (root.dataset.motion === "paused") {
      st.raf = requestAnimationFrame(() => tick(i));
      return;
    }

    const a = links[i];
    const now = performance.now();
    const inBurst = now < st.burstUntil;

    // Subtle but more erratic than title
    const nudge = inBurst ? 0.9 : 0.35;
    const dx = (Math.random() * 2 - 1) * nudge;
    const dy = (Math.random() * 2 - 1) * nudge;
    const dx2 = (Math.random() * 2 - 1) * nudge;
    const dy2 = (Math.random() * 2 - 1) * nudge;
    
    a.style.textShadow =
      `${dx}px ${dy}px rgba(255, 0, 76, .34), ` +
      `${-dx}px ${-dy}px rgba(0, 255, 200, .34), ` +
      `${dx2}px ${dy2}px rgba(0, 170, 255, .30)`;

    // Random burst effect
    if (Math.random() < 0.0035) {
      st.burstUntil = now + 100 + Math.random() * 150;
    }

    st.raf = requestAnimationFrame(() => tick(i));
  }

  // Start all animations immediately
  states.forEach((_, i) => {
    states[i].raf = requestAnimationFrame(() => tick(i));
  });

  // Cleanup function
  function destroy() {
    states.forEach((st, i) => {
      st.destroyed = true;
      if (st.raf) {
        cancelAnimationFrame(st.raf);
        st.raf = 0;
      }
      
      // Reset nav items
      if (links[i]) {
        links[i].style.textShadow = '';
        links[i].style.transform = '';
        links[i].style.opacity = '';
      }
    });
  }
  
  window.addEventListener("beforeunload", destroy);
  
  // Pause during visibility change
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      states.forEach(st => {
        if (st.raf) {
          cancelAnimationFrame(st.raf);
          st.raf = 0;
        }
      });
    } else {
      states.forEach((st, i) => {
        if (!st.destroyed && !st.raf) {
          st.raf = requestAnimationFrame(() => tick(i));
        }
      });
    }
  }, { passive: true });
  
  // Expose cleanup method
  window.navGlitchCleanup = destroy;
})();