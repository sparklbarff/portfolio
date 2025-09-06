/**
 * CRT RGB Separation Effect Module
 * Isolated RGB convergence error simulation
 */
(function() {
  'use strict';

  class RGBSeparationEffect {
    constructor(options = {}) {
      this.options = {
        offset: options.offset || 1.5,
        opacity: options.opacity || 0.4,
        redOffset: options.redOffset || { x: -1, y: 0 },
        blueOffset: options.blueOffset || { x: 1, y: 0 },
        greenOffset: options.greenOffset || { x: 0, y: 0 },
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
      this.element =
        document.querySelector('.effect-rgb-separation') ||
        document.createElement('div');
      this.element.className = 'effect-rgb-separation crt-effect-component';

      const filterLayer = document.querySelector('.crt-filter-layer');
      if (filterLayer && !this.element.parentElement) {
        filterLayer.appendChild(this.element);
      }
    }

    applyStyles() {
      if (!this.element) {
        return;
      }

      const redOffsetX = this.options.redOffset.x * this.options.offset;
      const redOffsetY = this.options.redOffset.y * this.options.offset;
      const blueOffsetX = this.options.blueOffset.x * this.options.offset;
      const blueOffsetY = this.options.blueOffset.y * this.options.offset;

      Object.assign(this.element.style, {
        position: 'absolute',
        inset: '0',
        pointerEvents: 'none',
        zIndex: '8',

        // Create RGB separation through backdrop filters
        backdropFilter: `
          drop-shadow(${redOffsetX}px ${redOffsetY}px 0 rgba(255, 0, 0, 0.7))
          drop-shadow(${blueOffsetX}px ${blueOffsetY}px 0 rgba(0, 0, 255, 0.7))
        `,
        WebkitBackdropFilter: `
          drop-shadow(${redOffsetX}px ${redOffsetY}px 0 rgba(255, 0, 0, 0.7))
          drop-shadow(${blueOffsetX}px ${blueOffsetY}px 0 rgba(0, 0, 255, 0.7))
        `,

        mixBlendMode: 'screen',
        opacity: this.options.opacity,

        // Hardware acceleration
        willChange: 'backdrop-filter, filter',
        transform: 'translateZ(0)'
      });
    }

    enable() {
      if (!this.element) {
        return;
      }
      this.element.style.display = 'block';
      this.options.enabled = true;

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

      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    startAnimation() {
      const startTime = performance.now();

      const animate = (timestamp) => {
        // Animate at 20fps for smooth convergence error
        if (timestamp - this.lastUpdate > 50) {
          this.updateConvergence(timestamp - startTime);
          this.lastUpdate = timestamp;
        }

        if (this.options.enabled) {
          this.animationId = requestAnimationFrame(animate);
        }
      };

      this.animationId = requestAnimationFrame(animate);
    }

    updateConvergence(elapsed) {
      if (!this.element) {
        return;
      }

      // 7-second convergence error cycle
      const cycle = (elapsed / 7000) * Math.PI * 2;

      // Calculate dynamic offsets
      const redX =
        this.options.redOffset.x *
        this.options.offset *
        (0.8 + Math.sin(cycle) * 0.4);
      const redY =
        this.options.redOffset.y *
        this.options.offset *
        (0.8 + Math.cos(cycle * 0.7) * 0.3);
      const blueX =
        this.options.blueOffset.x *
        this.options.offset *
        (0.8 + Math.sin(cycle * 0.9) * 0.4);
      const blueY =
        this.options.blueOffset.y *
        this.options.offset *
        (0.8 + Math.cos(cycle * 1.1) * 0.3);

      this.element.style.backdropFilter = `
        drop-shadow(${redX}px ${redY}px 0 rgba(255, 0, 0, 0.7))
        drop-shadow(${blueX}px ${blueY}px 0 rgba(0, 0, 255, 0.7))
      `;

      this.element.style.WebkitBackdropFilter = `
        drop-shadow(${redX}px ${redY}px 0 rgba(255, 0, 0, 0.7))
        drop-shadow(${blueX}px ${blueY}px 0 rgba(0, 0, 255, 0.7))
      `;
    }

    setOffset(offset) {
      this.options.offset = Math.max(0, offset);
      this.applyStyles();
    }

    setOpacity(opacity) {
      this.options.opacity = Math.max(0, Math.min(1, opacity));
      this.applyStyles();
    }

    setRedOffset(x, y) {
      this.options.redOffset = { x, y };
      this.applyStyles();
    }

    setBlueOffset(x, y) {
      this.options.blueOffset = { x, y };
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
        offset: this.options.offset,
        opacity: this.options.opacity,
        redOffset: { ...this.options.redOffset },
        blueOffset: { ...this.options.blueOffset },
        greenOffset: { ...this.options.greenOffset },
        animate: this.options.animate,
        animating: !!this.animationId
      };
    }
  }

  window.RGBSeparationEffect = RGBSeparationEffect;

  if (window.CRTEffectRegistry) {
    window.CRTEffectRegistry.register('rgbSeparation', RGBSeparationEffect);
  }
})();
