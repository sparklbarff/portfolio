/**
 * CRT Scanlines Effect Module
 * Isolated scanline rendering with authentic CRT behavior
 */
(function() {
  'use strict';

  class ScanlinesEffect {
    constructor(options = {}) {
      this.options = {
        intensity: options.intensity || 0.7,
        size: options.size || 2,
        curvature: options.curvature || 0.8,
        flicker: options.flicker || true,
        enabled: options.enabled !== false,
        ...options
      };

      this.element = null;
      this.animationId = null;
      this.lastUpdate = 0;
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
      // Find or create the scanlines element
      this.element =
        document.querySelector('.effect-scanlines') ||
        document.createElement('div');
      this.element.className = 'effect-scanlines crt-effect-component';

      // Add to appropriate layer
      const overlayLayer = document.querySelector('.crt-overlay-layer');
      if (overlayLayer && !this.element.parentElement) {
        overlayLayer.appendChild(this.element);
      }
    }

    applyStyles() {
      if (!this.element) {
        return;
      }

      Object.assign(this.element.style, {
        position: 'absolute',
        inset: '0',
        pointerEvents: 'none',
        zIndex: '1',
        mixBlendMode: 'overlay',

        // Scanline pattern
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, ${this.options.intensity * 0.9}) 0px,
            rgba(0, 0, 0, ${this.options.intensity * 0.8}) ${
    this.options.size * 0.3
  }px,
            rgba(0, 0, 0, ${this.options.intensity * 0.5}) ${
    this.options.size * 0.6
  }px,
            rgba(0, 0, 0, ${this.options.intensity * 0.8}) ${
    this.options.size * 0.9
  }px,
            rgba(0, 0, 0, ${this.options.intensity * 0.4}) ${
    this.options.size
  }px
          ),
          repeating-linear-gradient(
            90deg,
            transparent 0px,
            rgba(0, 0, 0, ${this.options.intensity * 0.3}) 20px,
            transparent 40px,
            rgba(0, 0, 0, ${this.options.intensity * 0.35}) 60px,
            transparent 80px
          )
        `,

        // Curved masking for CRT authenticity
        clipPath: `ellipse(${55 * this.options.curvature}% ${
          53 * this.options.curvature
        }% at center)`,

        // Hardware acceleration
        willChange: 'opacity, transform',
        transform: 'translateZ(0)'
      });

      // Add flicker animation if enabled
      if (this.options.flicker) {
        this.element.style.animation =
          'scanlineFlicker 3s steps(3) infinite, scanlineIntensityVar 8s ease-in-out infinite';
      }
    }

    enable() {
      if (!this.element) {
        return;
      }
      this.element.style.display = 'block';
      this.options.enabled = true;

      // Start animation loop for dynamic effects
      if (this.options.flicker && !this.animationId) {
        this.startAnimation();
      }
    }

    disable() {
      if (!this.element) {
        return;
      }
      this.element.style.display = 'none';
      this.options.enabled = false;

      // Stop animation loop
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    startAnimation() {
      const animate = (timestamp) => {
        // Throttle updates to 30fps for performance
        if (timestamp - this.lastUpdate > 33) {
          this.updateFlicker();
          this.lastUpdate = timestamp;
        }

        if (this.options.enabled) {
          this.animationId = requestAnimationFrame(animate);
        }
      };

      this.animationId = requestAnimationFrame(animate);
    }

    updateFlicker() {
      if (!this.element || !this.options.flicker) {
        return;
      }

      // Subtle opacity variation for realistic flicker
      const flickerIntensity = 0.95 + Math.random() * 0.1;
      this.element.style.opacity = flickerIntensity;
    }

    setIntensity(intensity) {
      this.options.intensity = Math.max(0, Math.min(1, intensity));
      this.applyStyles();
    }

    setSize(size) {
      this.options.size = Math.max(1, size);
      this.applyStyles();
    }

    setCurvature(curvature) {
      this.options.curvature = Math.max(0, Math.min(1, curvature));
      this.applyStyles();
    }

    destroy() {
      this.disable();
      if (this.element && this.element.parentElement) {
        this.element.parentElement.removeChild(this.element);
      }
      this.element = null;
    }

    // Get current state for debugging
    getState() {
      return {
        enabled: this.options.enabled,
        intensity: this.options.intensity,
        size: this.options.size,
        curvature: this.options.curvature,
        flicker: this.options.flicker,
        animating: !!this.animationId
      };
    }
  }

  // Export for global use
  window.ScanlinesEffect = ScanlinesEffect;

  // Register with effect registry if available
  if (window.CRTEffectRegistry) {
    window.CRTEffectRegistry.register('scanlines', ScanlinesEffect);
  }
})();
