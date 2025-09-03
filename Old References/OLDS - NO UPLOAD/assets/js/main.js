/* Core functionality for website */
"use strict";

// Main namespace for site functionality
const Site = {
  // Motion state
  motion: {
    paused: false
  },
  
  // Initialize site functionality
  init() {
    this.setupBackdropSupport();
    this.setupViewportMetrics();
    this.setupMotionToggle();
    this.initBackgrounds();
    this.setupScanEffects();
    this.setupMiniWindows();
    
    // Handle visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.wasPaused = document.documentElement.dataset.motion === "paused";
        this.setMotion(false);
      } else {
        this.setMotion(!this.wasPaused);
      }
    });
  },
  
  // Check for backdrop filter support
  setupBackdropSupport() {
    const weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
    const supportsBdf = CSS && (CSS.supports('backdrop-filter: blur(1px)') || 
                               CSS.supports('-webkit-backdrop-filter: blur(1px)'));
    
    if (!supportsBdf || weak) {
      document.documentElement.classList.add('no-bdf');
    }
  },
  
  // Set up viewport metrics for mobile
  setupViewportMetrics() {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', vh + 'px');
    };
    
    const measureBottomUI = () => {
      const f = document.querySelector('footer');
      const fh = f ? f.getBoundingClientRect().height : 0;
      const pad = Math.ceil(fh + 18);
      document.documentElement.style.setProperty('--ui-bottom-pad', pad + 'px');
    };
    
    setVH();
    measureBottomUI();
    
    window.addEventListener('resize', () => {
      setVH();
      measureBottomUI();
    }, {passive: true});
    
    window.addEventListener('orientationchange', () => {
      setVH();
      setTimeout(measureBottomUI, 120);
    });
    
    window.addEventListener('load', () => {
      measureBottomUI();
      setTimeout(measureBottomUI, 500);
    });
    
    this.measureBottomUI = measureBottomUI;
  },
  
  // Handle motion toggle button
  setupMotionToggle() {
    const btn = document.getElementById('motionBtn');
    if (!btn) return;
    
    this.setMotion(true);
    
    btn.addEventListener('click', () => {
      this.setMotion(btn.getAttribute('aria-pressed') !== 'true');
    }, {passive: true});
  },
  
  // Set motion state
  setMotion(on) {
    this.motion.paused = !on;
    document.documentElement.dataset.motion = on ? "on" : "paused";
    const btn = document.getElementById('motionBtn');
    if (btn) {
      btn.textContent = on ? "Motion: On" : "Motion: Off";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
  },
  
  // Helper functions
  $ : s => document.querySelector(s),
  pad2: n => n < 10 ? "0" + n : "" + n,
  rnd: (a, b) => a + Math.random() * (b - a),
  shuffle: a => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  imgOk: url => new Promise(res => {
    const im = new Image();
    im.onload = () => res(true);
    im.onerror = () => res(false);
    im.src = url;
  }),
  
  // Background management
  async initBackgrounds() {
    const BASE = "/mybg";
    const DEFAULT_COUNT = 65;
    const PERIOD_MS = 20000;
    
    const bgContainer = this.$("#bg-container");
    if (!bgContainer) return;
    
    // Try to load manifest
    const manifest = await this.loadManifest(BASE);
    const src = manifest || { count: DEFAULT_COUNT, pad: false };
    const count = src.count || DEFAULT_COUNT;
    
    // Create background layers - first one already created in HTML
    const layers = Array.from(document.querySelectorAll('.bg-image'));
    if (layers.length === 0) {
      // Only create if not already present
      const layer = document.createElement("div");
      layer.className = "bg-image";
      bgContainer.appendChild(layer);
      layers.push(layer);
      
      // Add second layer
      const layer2 = document.createElement("div");
      layer2.className = "bg-image";
      bgContainer.appendChild(layer2);
      layers.push(layer2);
    } else if (layers.length === 1) {
      // Add second layer if only one exists
      const layer2 = document.createElement("div");
      layer2.className = "bg-image";
      bgContainer.appendChild(layer2);
      layers.push(layer2);
    }
    
    let active = 0;
    let lastShown = null;
    
    // Setup initial image
    const state = { order: this.playlist(count, lastShown), p: 0, count };
    const firstIdx = state.order[0];
    const firstUrl = await this.chooseUrl(BASE, src, firstIdx);
    
    if (firstUrl && !layers[active].style.backgroundImage) {
      layers[active].style.backgroundImage = `url("${firstUrl}")`;
      layers[active].classList.add("active");
      document.documentElement.style.setProperty("--bg-current", `url("${firstUrl}")`);
    }
    
    // Setup background rotation
    setInterval(async () => {
      if (this.motion.paused) return;
      
      const idx = this.nextIndex(state, lastShown);
      lastShown = idx;
      
      const url = await this.chooseUrl(BASE, src, idx);
      if (!url) return;
      
      const prevEl = document.querySelector(".bg-image.active");
      const nextEl = layers[active ^ 1];
      active ^= 1;
      
      nextEl.style.backgroundImage = `url("${url}")`;
      void nextEl.offsetWidth;
      nextEl.classList.add("active");
      
      if (prevEl) prevEl.classList.remove("active");
      document.documentElement.style.setProperty("--bg-current", `url("${url}")`);
      
      this.measureBottomUI();
    }, PERIOD_MS);
  },
  
  // Load background manifest
  async loadManifest(base) {
    try {
      const resp = await fetch(`${base}/manifest.json`, {cache: "no-store"});
      if (!resp.ok) throw new Error("no manifest");
      
      const data = await resp.json();
      if (!data) return null;
      
      // Old format with images array
      if (Array.isArray(data.images)) {
        return { count: data.images.length, pad: false };
      }
      
      // New format with count
      if (typeof data.count === "number") {
        return { count: data.count, pad: !!data.pad };
      }
    } catch (e) {
      console.warn("Manifest load failed:", e);
    }
    
    return null;
  },
  
  // Create shuffled playlist
  playlist(n, lastShown) {
    const a = Array.from({length: n}, (_, i) => i + 1);
    this.shuffle(a);
    
    if (n > 1 && a[0] === lastShown) {
      const s = 1;
      [a[0], a[s]] = [a[s], a[0]];
    }
    
    return a;
  },
  
  // Get next background index
  nextIndex(state, lastShown) {
    if (++state.p >= state.order.length) {
      state.order = this.playlist(state.count, lastShown);
      state.p = 0;
    }
    
    if (state.order[state.p] === lastShown && state.order.length > 1) {
      const s = (state.p + 1) % state.order.length;
      [state.order[state.p], state.order[s]] = [state.order[s], state.order[state.p]];
    }
    
    return state.order[state.p];
  },
  
  // URL cache for background images
  urlCache: new Map(),
  
  // Choose URL for background image
  async chooseUrl(base, src, i) {
    const key = `${i}`;
    if (this.urlCache.has(key)) return this.urlCache.get(key);
    
    const cands = [
      `${base}/webp/bg${src.pad ? this.pad2(i) : i}.webp`,
      `${base}/webp/bg${i}.webp`
    ];
    
    for (const u of cands) {
      if (await this.imgOk(u)) {
        this.urlCache.set(key, u);
        return u;
      }
    }
    
    return null;
  },
  
  // Setup scan effects
  setupScanEffects() {
    const sweepEl = document.getElementById("scanSweep");
    const rgbEl = document.getElementById("scanRGB");
    if (!sweepEl || !rgbEl) return;
    
    // Run sweep animation
    const runSweep = () => {
      const dur = (this.rnd(4.2, 6.5)).toFixed(2) + "s";
      sweepEl.style.setProperty('--sweep-dur', dur);
      sweepEl.style.opacity = (this.rnd(0.3, 0.4)).toFixed(2);
      sweepEl.classList.remove('run');
      void sweepEl.offsetWidth;
      sweepEl.classList.add('run');
      
      const tick = () => {
        if (document.documentElement.dataset.motion === "paused" || 
            !sweepEl.classList.contains('run')) return;
        
        sweepEl.style.transform = `translateX(${(Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2.2)}px)`;
        requestAnimationFrame(tick);
      };
      
      requestAnimationFrame(tick);
    };
    
    // Handle animation end
    sweepEl.addEventListener('animationend', e => {
      if (e.animationName === 'sweepDown') {
        sweepEl.classList.remove('run');
        sweepEl.style.transform = 'translateX(0)';
      }
    });
    
    // Periodic sweeps
    const sweepLoop = () => {
      const t = 5000 + Math.random() * 10000;
      setTimeout(() => {
        if (document.documentElement.dataset.motion !== "paused") runSweep();
        sweepLoop();
      }, t);
    };
    
    // RGB glitch loop
    const rgbGlitchLoop = () => {
      const t = 3000 + Math.random() * 7000;
      setTimeout(() => {
        if (document.documentElement.dataset.motion !== "paused") {
          rgbEl.classList.add('glitch');
          setTimeout(() => rgbEl.classList.remove('glitch'), Math.random() * 240 + 180);
        }
        rgbGlitchLoop();
      }, t);
    };
    
    sweepLoop();
    rgbGlitchLoop();
    
    // Immediately run a sweep on load
    if (document.documentElement.dataset.motion !== "paused") {
      setTimeout(runSweep, 800);
    }
  },
  
  // Setup mini window system
  setupMiniWindows() {
    // Handle clicks on nav links
    document.querySelectorAll('#nav-list a[href^="#"]').forEach(a => {
      a.addEventListener("click", async e => {
        e.preventDefault();
        const id = a.getAttribute("href").slice(1);
        
        // Remove existing mini if present
        const existing = document.querySelector('.mini');
        if (existing) {
          existing.remove();
          if (existing.dataset.src === id) return;
        }
        
        // Load content
        let frag = "";
        try {
          if (id === "about") frag = await this.fetchMini("/assets/minis/about.html");
          else if (id === "portfolio") frag = await this.fetchMini("/assets/minis/portfolio.html");
          else if (id === "contact") frag = await this.fetchMini("/assets/minis/contact.html");
        } catch (err) {
          console.error("Failed to load mini:", err);
          return;
        }
        
        // Show mini window
        this.openMiniFromLink(a, frag);
      }, { passive: false });
    });
  },
  
  // Fetch mini window content
  async fetchMini(path) {
    const resp = await fetch(path, { cache: "no-store" });
    if (!resp.ok) throw new Error("mini fetch failed");
    return resp.text();
  },
  
  // Open mini window from link
  openMiniFromLink(linkEl, html) {
    const mini = document.createElement("div");
    mini.className = "mini";
    mini.dataset.src = linkEl.getAttribute("href").slice(1);
    mini.innerHTML = `<button class="close" aria-label="Close">✕</button>${html}`;
    document.body.appendChild(mini);
    
    // Position relative to nav
    const nav = document.getElementById('nav-list');
    const nr = nav.getBoundingClientRect();
    const mr = mini.getBoundingClientRect();
    const left = window.innerWidth / 2;
    const top = nr.top - mr.height - 16;
    
    mini.style.left = `${left}px`;
    mini.style.top = `${Math.max(16, top)}px`;
    mini.style.transform = "translate(-50%, 0)";
    
    // Setup close handlers
    const close = () => {
      mini.remove();
      linkEl.focus();
    };
    
    mini.querySelector(".close").addEventListener("click", close);
    
    const outside = e => {
      if (!mini.contains(e.target)) {
        close();
        document.removeEventListener("mousedown", outside);
      }
    };
    
    setTimeout(() => document.addEventListener("mousedown", outside), 0);
    
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", esc);
      }
    });
  }
};

// Initial CRT power-on effect
document.addEventListener('DOMContentLoaded', () => {
  // Start animation immediately
  setTimeout(() => {
    document.body.classList.remove('crt-off');
    // Trigger initial sweep
    const sweepEl = document.getElementById('scanSweep');
    if (sweepEl) {
      sweepEl.style.setProperty('--sweep-dur', '6s');
      sweepEl.classList.add('run');
    }
  }, 400);
  
  // Initialize site functionality
  Site.init();
});