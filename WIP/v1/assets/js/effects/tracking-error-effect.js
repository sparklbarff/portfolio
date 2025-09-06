/**
 * VHS Tracking Error Effect Module
 * Isolated VHS tracking distortion with authentic tape behavior
 */
(function () {
  "use strict";

  class TrackingErrorEffect {
    constructor(options = {}) {
      this.options = {
        intensity: options.intensity || 0.5,
        frequency: options.frequency || 0.001,
        duration: options.duration || 400,
        horizontalShift: options.horizontalShift || 20,
        verticalJump: options.verticalJump || 15,
        brightness: options.brightness || 1.4,
        enabled: options.enabled !== false,
        ...options,
      };

      this.element = null;
      this.isActive = false;
      this.timeoutId = null;
      this.lastTrigger = 0;
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
      // Find or create the tracking error element
      this.element =
        document.querySelector(".effect-tracking-error") ||
        document.createElement("div");
      this.element.className = "effect-tracking-error crt-effect-component";

      // Add to content layer for interaction with page content
      const contentLayer = document.querySelector(".crt-content-layer");
      if (contentLayer && !this.element.parentElement) {
        contentLayer.appendChild(this.element);
      }
    }

    applyStyles() {
      if (!this.element) return;

      Object.assign(this.element.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        zIndex: "10",
        display: "none", // Hidden by default, shown during effects

        // Hardware acceleration
        willChange: "transform, filter",
        transform: "translateZ(0)",

        // Initial state
        opacity: "1",
        filter: "brightness(1)",
      });
    }

    enable() {
      this.options.enabled = true;
      this.startRandomTrigger();
    }

    disable() {
      this.options.enabled = false;
      this.stopEffect();
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }

    startRandomTrigger() {
      if (!this.options.enabled) return;

      // Random interval between triggers
      const interval = Math.random() * (1 / this.options.frequency);

      this.timeoutId = setTimeout(() => {
        if (this.canTrigger()) {
          this.trigger();
        }
        this.startRandomTrigger(); // Schedule next trigger
      }, interval);
    }

    canTrigger() {
      // Check with performance monitor if available
      if (
        window.PerformanceMonitor &&
        !window.PerformanceMonitor.canPlayEffect("medium")
      ) {
        return false;
      }

      // Don't trigger too frequently
      const now = performance.now();
      const timeSinceLastTrigger = now - this.lastTrigger;
      return timeSinceLastTrigger > 1000; // Minimum 1 second between triggers
    }

    trigger() {
      if (this.isActive || !this.options.enabled) return;

      this.isActive = true;
      this.lastTrigger = performance.now();

      if (!this.element) return;

      // Show the effect element
      this.element.style.display = "block";

      // Create tracking error animation
      this.animateTrackingError();

      // Mark with performance monitor
      if (window.PerformanceMonitor) {
        window.PerformanceMonitor.markEffectStart();
      }
    }

    animateTrackingError() {
      if (!this.element) return;

      const keyframes = [
        {
          transform: "translateY(0px)",
          filter: "brightness(1)",
        },
        {
          transform: `translateY(${
            -this.options.horizontalShift * this.options.intensity
          }px)`,
          filter: `brightness(${this.options.brightness})`,
        },
        {
          transform: `translateY(${
            this.options.verticalJump * this.options.intensity
          }px)`,
          filter: "brightness(0.8)",
        },
        {
          transform: `translateY(${
            -this.options.verticalJump * 0.5 * this.options.intensity
          }px)`,
          filter: "brightness(1.2)",
        },
        {
          transform: `translateY(${
            this.options.verticalJump * 0.25 * this.options.intensity
          }px)`,
          filter: "brightness(0.9)",
        },
        {
          transform: `translateY(${
            -this.options.verticalJump * 0.1 * this.options.intensity
          }px)`,
          filter: "brightness(1.1)",
        },
        {
          transform: "translateY(0px)",
          filter: "brightness(1)",
        },
      ];

      const animation = this.element.animate(keyframes, {
        duration: this.options.duration,
        easing: "ease-out",
        fill: "forwards",
      });

      animation.addEventListener("finish", () => {
        this.stopEffect();
      });
    }

    stopEffect() {
      this.isActive = false;
      if (this.element) {
        this.element.style.display = "none";
        this.element.style.transform = "translateY(0px)";
        this.element.style.filter = "brightness(1)";
      }
    }

    setIntensity(intensity) {
      this.options.intensity = Math.max(0, Math.min(1, intensity));
    }

    setFrequency(frequency) {
      this.options.frequency = Math.max(0.0001, frequency);
    }

    setDuration(duration) {
      this.options.duration = Math.max(100, duration);
    }

    // Manual trigger for testing
    triggerManual() {
      if (this.canTrigger()) {
        this.trigger();
      }
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
        frequency: this.options.frequency,
        duration: this.options.duration,
        isActive: this.isActive,
        lastTrigger: this.lastTrigger,
      };
    }
  }

  // Export for global use
  window.TrackingErrorEffect = TrackingErrorEffect;

  // Register with effect registry if available
  if (window.CRTEffectRegistry) {
    window.CRTEffectRegistry.register("trackingError", TrackingErrorEffect);
  }
})();
