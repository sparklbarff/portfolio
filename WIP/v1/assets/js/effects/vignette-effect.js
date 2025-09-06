/**
 * CRT Vignette Effect Module
 * Isolated vignette rendering with corner darkening and edge effects
 */
(function() {
  'use strict';

  class VignetteEffect {
    constructor(options = {}) {
      this.options = {
        intensity: options.intensity || 0.8,
        size: options.size || '120%',
        cornerDarkening: options.cornerDarkening !== false,
        edgeGlow: options.edgeGlow !== false,
        enabled: options.enabled !== false,
        ...options
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
        document.querySelector('.effect-vignette') ||
        document.createElement('div');
      this.element.className = 'effect-vignette crt-effect-component';

      const overlayLayer = document.querySelector('.crt-overlay-layer');
      if (overlayLayer && !this.element.parentElement) {
        overlayLayer.appendChild(this.element);
      }
    }

    applyStyles() {
      if (!this.element) {
        return;
      }

      const gradients = [];

      // Corner darkening effects
      if (this.options.cornerDarkening) {
        const cornerOpacity = this.options.intensity * 0.3;
        gradients.push(
          `radial-gradient(ellipse 130% 120% at 15% 15%, rgba(0, 0, 0, ${cornerOpacity}), transparent 45%)`,
          `radial-gradient(ellipse 130% 120% at 85% 15%, rgba(0, 0, 0, ${cornerOpacity}), transparent 45%)`,
          `radial-gradient(ellipse 130% 120% at 15% 85%, rgba(0, 0, 0, ${cornerOpacity}), transparent 45%)`,
          `radial-gradient(ellipse 130% 120% at 85% 85%, rgba(0, 0, 0, ${cornerOpacity}), transparent 45%)`
        );
      }

      // Main vignette
      gradients.push(`
        radial-gradient(
          ellipse ${this.options.size} ${this.options.size} at 50% 50%,
          rgba(0, 0, 0, 0) 20%,
          rgba(0, 0, 0, ${this.options.intensity * 0.15}) 60%,
          rgba(0, 0, 0, ${this.options.intensity * 0.35}) 85%,
          rgba(0, 0, 0, ${this.options.intensity * 0.6}) 100%
        )
      `);

      // Edge glow
      if (this.options.edgeGlow) {
        gradients.push(`
          radial-gradient(
            ellipse 88% 82% at 50% 50%,
            rgba(255, 255, 255, 0) 70%,
            rgba(255, 255, 255, 0.02) 85%,
            rgba(255, 255, 255, 0.04) 95%
          )
        `);
      }

      Object.assign(this.element.style, {
        position: 'absolute',
        inset: '0',
        pointerEvents: 'none',
        zIndex: '5',
        background: gradients.join(', '),
        mixBlendMode: 'multiply',
        opacity: this.options.intensity,
        willChange: 'opacity',
        transform: 'translateZ(0)'
      });
    }

    enable() {
      if (!this.element) {
        return;
      }
      this.element.style.display = 'block';
      this.options.enabled = true;
    }

    disable() {
      if (!this.element) {
        return;
      }
      this.element.style.display = 'none';
      this.options.enabled = false;
    }

    setIntensity(intensity) {
      this.options.intensity = Math.max(0, Math.min(1, intensity));
      this.applyStyles();
    }

    setSize(size) {
      this.options.size = size;
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
        size: this.options.size,
        cornerDarkening: this.options.cornerDarkening,
        edgeGlow: this.options.edgeGlow
      };
    }
  }

  window.VignetteEffect = VignetteEffect;

  if (window.CRTEffectRegistry) {
    window.CRTEffectRegistry.register('vignette', VignetteEffect);
  }
})();
