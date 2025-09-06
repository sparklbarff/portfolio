/**
 * VHS Chroma Bleed Effect Module
 * Isolated chroma bleeding and color distortion for VHS authenticity
 */
(function () {
  "use strict";

  class ChromaBleedEffect {
    constructor(options = {}) {
      this.options = {
        intensity: options.intensity || 0.6,
        spread: options.spread || 1.2,
        saturation: options.saturation || 1.1,
        blurAmount: options.blurAmount || 0.8,
        enabled: options.enabled !== false,
        ...options,
      };

      this.element = null;
    }

    init() {
      this.createElement();
      this.applyStyles();
      if (this.options.enabled) {
        this.enable();
      }
      return this;
    }

    createElement() {
      this.element =
        document.querySelector(".effect-chroma-bleed") ||
        document.createElement("div");
      this.element.className = "effect-chroma-bleed crt-effect-component";

      const filterLayer = document.querySelector(".crt-filter-layer");
      if (filterLayer && !this.element.parentElement) {
        filterLayer.appendChild(this.element);
      }
    }

    applyStyles() {
      if (!this.element) return;

      Object.assign(this.element.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        zIndex: "3",

        // Apply chroma bleeding through backdrop filters
        backdropFilter: `
          saturate(${this.options.saturation})
          blur(${this.options.blurAmount}px)
          hue-rotate(${this.options.intensity * 2}deg)
        `,
        WebkitBackdropFilter: `
          saturate(${this.options.saturation})
          blur(${this.options.blurAmount}px)
          hue-rotate(${this.options.intensity * 2}deg)
        `,

        // Use SVG filter for more complex chroma effects
        filter: "url(#vhs-chroma-bleed)",

        // Blend mode for color interaction
        mixBlendMode: "color-burn",
        opacity: this.options.intensity,

        // Hardware acceleration
        willChange: "filter, backdrop-filter",
        transform: "translateZ(0)",
      });
    }

    enable() {
      if (!this.element) return;
      this.element.style.display = "block";
      this.options.enabled = true;
    }

    disable() {
      if (!this.element) return;
      this.element.style.display = "none";
      this.options.enabled = false;
    }

    setIntensity(intensity) {
      this.options.intensity = Math.max(0, Math.min(1, intensity));
      this.applyStyles();
    }

    setSaturation(saturation) {
      this.options.saturation = Math.max(0, Math.min(3, saturation));
      this.applyStyles();
    }

    setSpread(spread) {
      this.options.spread = Math.max(0, spread);
      this.applyStyles();
    }

    destroy() {
      this.disable();
      if (this.element && this.element.parentElement) {
        this.element.parentElement.removeChild(this.element);
      }
      this.element = null;
    }

    getState() {
      return {
        enabled: this.options.enabled,
        intensity: this.options.intensity,
        spread: this.options.spread,
        saturation: this.options.saturation,
        blurAmount: this.options.blurAmount,
      };
    }
  }

  window.ChromaBleedEffect = ChromaBleedEffect;

  if (window.CRTEffectRegistry) {
    window.CRTEffectRegistry.register("chromaBleed", ChromaBleedEffect);
  }
})();
