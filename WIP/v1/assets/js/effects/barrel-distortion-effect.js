/**
 * CRT Barrel Distortion Effect Module
 * Isolated barrel distortion rendering for authentic CRT geometry
 */
(function() {
  'use strict';

  class BarrelDistortionEffect {
    constructor(options = {}) {
      this.options = {
        strength: options.strength || 0.6,
        perspective: options.perspective || 2000,
        rotationX: options.rotationX || -0.4,
        rotationY: options.rotationY || 0.8,
        scale: options.scale || 0.998,
        animate: options.animate !== false,
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
      // Find or create the barrel distortion element
      this.element =
        document.querySelector('.effect-barrel-distortion') ||
        document.createElement('div');
      this.element.className = 'effect-barrel-distortion crt-effect-component';

      // Add to base layer (lowest z-index for structural effects)
      const baseLayer = document.querySelector('.crt-base-layer');
      if (baseLayer && !this.element.parentElement) {
        baseLayer.appendChild(this.element);
      }
    }

    applyStyles() {
      if (!this.element) {
        return;
      }

      Object.assign(this.element.style, {
        position: 'absolute',
        inset: '-2%', // Slight expansion to prevent edge artifacts
        pointerEvents: 'none',
        zIndex: '1',

        // 3D perspective transformation for barrel effect
        transform: `perspective(${this.options.perspective}px) 
                   rotateY(${this.options.rotationY}deg) 
                   rotateX(${this.options.rotationX}deg) 
                   scale(${this.options.scale})`,
        transformOrigin: 'center center',
        transformStyle: 'preserve-3d',

        // Backdrop filters for tube simulation
        backdropFilter: `
          contrast(${1 + this.options.strength * 0.05}) 
          brightness(${1 + this.options.strength * 0.01}) 
          hue-rotate(${this.options.strength * 0.5}deg)
          blur(${this.options.strength * 0.15}px)
        `,
        WebkitBackdropFilter: `
          contrast(${1 + this.options.strength * 0.05}) 
          brightness(${1 + this.options.strength * 0.01}) 
          hue-rotate(${this.options.strength * 0.5}deg)
          blur(${this.options.strength * 0.15}px)
        `,

        // SVG filter for fine distortion control
        filter: 'url(#crt-barrel-distortion)',

        // Hardware acceleration
        willChange: 'transform, filter',
        backfaceVisibility: 'hidden'
      });
    }

    enable() {
      if (!this.element) {
        return;
      }
      this.element.style.display = 'block';
      this.options.enabled = true;

      // Start subtle animation if enabled
      if (this.options.animate && !this.animationId) {
        this.startAnimation();
      }
    }

    disable() {
      if (!this.element) {
        return;
      }
      this.element.style.display = 'none';
      this.options.enabled = false;

      // Stop animation
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    startAnimation() {
      const startTime = performance.now();

      const animate = (timestamp) => {
        // Animate at 15fps for subtle effect
        if (timestamp - this.lastUpdate > 66) {
          this.updateGeometry(timestamp - startTime);
          this.lastUpdate = timestamp;
        }

        if (this.options.enabled) {
          this.animationId = requestAnimationFrame(animate);
        }
      };

      this.animationId = requestAnimationFrame(animate);
    }

    updateGeometry(elapsed) {
      if (!this.element || !this.options.animate) {
        return;
      }

      // Subtle variation in geometry over time (45 second cycle)
      const cycle = (elapsed / 45000) * Math.PI * 2;

      // Vary perspective and rotation slightly
      const perspectiveVar = this.options.perspective + Math.sin(cycle) * 100;
      const rotationYVar = this.options.rotationY + Math.sin(cycle * 0.7) * 0.1;
      const rotationXVar = this.options.rotationX + Math.cos(cycle * 0.5) * 0.1;
      const scaleVar = this.options.scale + Math.sin(cycle * 1.2) * 0.001;

      this.element.style.transform = `
        perspective(${perspectiveVar}px) 
        rotateY(${rotationYVar}deg) 
        rotateX(${rotationXVar}deg) 
        scale(${scaleVar})
      `;
    }

    setStrength(strength) {
      this.options.strength = Math.max(0, Math.min(1, strength));
      this.applyStyles();
    }

    setPerspective(perspective) {
      this.options.perspective = Math.max(500, perspective);
      this.applyStyles();
    }

    setRotation(x, y) {
      this.options.rotationX = x;
      this.options.rotationY = y;
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
        strength: this.options.strength,
        perspective: this.options.perspective,
        rotationX: this.options.rotationX,
        rotationY: this.options.rotationY,
        scale: this.options.scale,
        animate: this.options.animate,
        animating: !!this.animationId
      };
    }
  }

  // Export for global use
  window.BarrelDistortionEffect = BarrelDistortionEffect;

  // Register with effect registry if available
  if (window.CRTEffectRegistry) {
    window.CRTEffectRegistry.register(
      'barrelDistortion',
      BarrelDistortionEffect
    );
  }
})();
