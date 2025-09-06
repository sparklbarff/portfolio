/**
 * Advanced CRT Performance Optimizer
 * Intelligent performance management with machine learning-inspired adaptation
 */
(function () {
  "use strict";

  class AdvancedPerformanceOptimizer {
    constructor() {
      this.config = {
        targetFPS: 60,
        minAcceptableFPS: 30,
        adaptationSensitivity: 0.8,
        learningRate: 0.1,
        memoryWindow: 50, // Frames to remember for learning
        enableMLOptimization: true,
      };

      this.state = {
        currentFPS: 60,
        fpsHistory: [],
        performanceScore: 1.0,
        adaptationHistory: [],
        effectLoadMap: new Map(),
        deviceCapabilities: null,
        optimizationLevel: 0, // 0-4 scale
      };

      this.effects = new Map();
      this.optimizationStrategies = new Map();
      this.isOptimizing = false;
    }

    init() {
      this.detectDeviceCapabilities();
      this.setupOptimizationStrategies();
      this.startMonitoring();
      return this;
    }

    // Detect device capabilities using various metrics
    detectDeviceCapabilities() {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

      this.state.deviceCapabilities = {
        // Hardware info
        devicePixelRatio: window.devicePixelRatio || 1,
        maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 2048,
        webglSupported: !!gl,

        // Performance indicators
        cores: navigator.hardwareConcurrency || 4,
        memory: navigator.deviceMemory || 4,

        // Browser capabilities
        backdropFilterSupported: CSS.supports("backdrop-filter", "blur(1px)"),
        clipPathSupported: CSS.supports("clip-path", "circle(50%)"),

        // Estimated performance tier (1-5, 5 being highest)
        estimatedTier: this.calculatePerformanceTier(),
      };

      console.log(
        "[Optimizer] Device capabilities detected:",
        this.state.deviceCapabilities
      );
    }

    calculatePerformanceTier() {
      let score = 1;

      const caps = this.state.deviceCapabilities || {};

      // Core count factor
      if (caps.cores >= 8) score += 2;
      else if (caps.cores >= 4) score += 1;

      // Memory factor
      if (caps.memory >= 8) score += 2;
      else if (caps.memory >= 4) score += 1;

      // WebGL support
      if (caps.webglSupported) score += 1;

      // Feature support
      if (caps.backdropFilterSupported) score += 0.5;
      if (caps.clipPathSupported) score += 0.5;

      return Math.min(5, Math.max(1, Math.round(score)));
    }

    // Setup optimization strategies for different performance levels
    setupOptimizationStrategies() {
      this.optimizationStrategies.set(0, {
        name: "Maximum Quality",
        effectModifiers: {},
        animationQuality: 1.0,
        filterQuality: 1.0,
      });

      this.optimizationStrategies.set(1, {
        name: "High Quality",
        effectModifiers: {
          animationDuration: 1.2,
          filterIntensity: 0.9,
        },
        animationQuality: 0.9,
        filterQuality: 0.95,
      });

      this.optimizationStrategies.set(2, {
        name: "Balanced",
        effectModifiers: {
          animationDuration: 1.5,
          filterIntensity: 0.8,
          disableExpensive: ["barrelDistortion"],
        },
        animationQuality: 0.7,
        filterQuality: 0.8,
      });

      this.optimizationStrategies.set(3, {
        name: "Performance",
        effectModifiers: {
          animationDuration: 2.0,
          filterIntensity: 0.6,
          disableExpensive: ["barrelDistortion", "chromaBleed"],
        },
        animationQuality: 0.5,
        filterQuality: 0.6,
      });

      this.optimizationStrategies.set(4, {
        name: "Maximum Performance",
        effectModifiers: {
          animationDuration: 3.0,
          filterIntensity: 0.4,
          disableExpensive: [
            "barrelDistortion",
            "chromaBleed",
            "rgbSeparation",
          ],
          enableOnly: ["scanlines", "vignette"],
        },
        animationQuality: 0.3,
        filterQuality: 0.4,
      });
    }

    // Start performance monitoring
    startMonitoring() {
      let lastTime = performance.now();
      let frameCount = 0;

      const monitor = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - lastTime;

        frameCount++;

        // Calculate FPS every second
        if (elapsed >= 1000) {
          this.state.currentFPS = (frameCount * 1000) / elapsed;
          this.updateFPSHistory(this.state.currentFPS);

          // Trigger optimization if needed
          this.evaluatePerformance();

          frameCount = 0;
          lastTime = currentTime;
        }

        requestAnimationFrame(monitor);
      };

      requestAnimationFrame(monitor);
    }

    // Update FPS history and calculate performance score
    updateFPSHistory(fps) {
      this.state.fpsHistory.push({
        fps: fps,
        timestamp: performance.now(),
      });

      // Keep only recent history
      if (this.state.fpsHistory.length > this.config.memoryWindow) {
        this.state.fpsHistory.shift();
      }

      // Calculate performance score (0-1 scale)
      const avgFPS =
        this.state.fpsHistory.reduce((sum, entry) => sum + entry.fps, 0) /
        this.state.fpsHistory.length;
      this.state.performanceScore = Math.min(1, avgFPS / this.config.targetFPS);
    }

    // Evaluate performance and trigger optimization
    evaluatePerformance() {
      if (this.isOptimizing) return;

      const avgFPS =
        this.state.fpsHistory.reduce((sum, entry) => sum + entry.fps, 0) /
        this.state.fpsHistory.length;

      // Determine if we need to optimize
      let targetOptimizationLevel = this.state.optimizationLevel;

      if (avgFPS < this.config.minAcceptableFPS) {
        // Performance is poor, increase optimization
        targetOptimizationLevel = Math.min(4, this.state.optimizationLevel + 1);
      } else if (
        avgFPS > this.config.targetFPS * 0.9 &&
        this.state.optimizationLevel > 0
      ) {
        // Performance is good, we can reduce optimization
        targetOptimizationLevel = Math.max(0, this.state.optimizationLevel - 1);
      }

      if (targetOptimizationLevel !== this.state.optimizationLevel) {
        this.applyOptimizationLevel(targetOptimizationLevel);
      }
    }

    // Apply optimization strategy
    async applyOptimizationLevel(level) {
      if (this.isOptimizing) return;

      this.isOptimizing = true;
      const strategy = this.optimizationStrategies.get(level);

      if (!strategy) {
        console.error("[Optimizer] Invalid optimization level:", level);
        this.isOptimizing = false;
        return;
      }

      console.log(
        `[Optimizer] Applying optimization level ${level}: ${strategy.name}`
      );

      try {
        // Apply effect modifications
        await this.applyEffectModifications(strategy.effectModifiers);

        // Update CSS custom properties for performance
        this.updatePerformanceCSS(strategy);

        // Update optimization level
        this.state.optimizationLevel = level;

        // Log the change
        this.state.adaptationHistory.push({
          timestamp: performance.now(),
          level: level,
          strategy: strategy.name,
          avgFPS:
            this.state.fpsHistory.reduce((sum, entry) => sum + entry.fps, 0) /
            this.state.fpsHistory.length,
        });

        console.log(`[Optimizer] Optimization applied: ${strategy.name}`);
      } catch (error) {
        console.error("[Optimizer] Failed to apply optimization:", error);
      } finally {
        this.isOptimizing = false;
      }
    }

    // Apply modifications to effects
    async applyEffectModifications(modifiers) {
      if (!window.CRTEffectRegistry) return;

      const registry = window.CRTEffectRegistry;

      // Disable expensive effects if specified
      if (modifiers.disableExpensive) {
        modifiers.disableExpensive.forEach((effectName) => {
          const instance = registry.getInstance(effectName);
          if (instance && typeof instance.disable === "function") {
            instance.disable();
          }
        });
      }

      // Enable only specific effects if specified
      if (modifiers.enableOnly) {
        const allEffects = [
          "scanlines",
          "barrelDistortion",
          "vignette",
          "chromaBleed",
          "rgbSeparation",
          "trackingError",
        ];
        allEffects.forEach((effectName) => {
          const instance = registry.getInstance(effectName);
          if (instance) {
            if (modifiers.enableOnly.includes(effectName)) {
              if (typeof instance.enable === "function") instance.enable();
            } else {
              if (typeof instance.disable === "function") instance.disable();
            }
          }
        });
      }

      // Apply intensity modifications
      if (modifiers.filterIntensity) {
        ["scanlines", "vignette", "chromaBleed", "rgbSeparation"].forEach(
          (effectName) => {
            const instance = registry.getInstance(effectName);
            if (instance && typeof instance.setIntensity === "function") {
              // Get current intensity and apply modifier
              const currentState = instance.getState();
              const newIntensity =
                (currentState.intensity || 0.7) * modifiers.filterIntensity;
              instance.setIntensity(newIntensity);
            }
          }
        );
      }
    }

    // Update CSS custom properties for performance
    updatePerformanceCSS(strategy) {
      const root = document.documentElement;

      // Animation quality
      root.style.setProperty(
        "--perf-animation-quality",
        strategy.animationQuality
      );
      root.style.setProperty("--perf-filter-quality", strategy.filterQuality);

      // Animation duration multiplier
      if (strategy.effectModifiers.animationDuration) {
        const multiplier = strategy.effectModifiers.animationDuration;
        root.style.setProperty("--perf-animation-multiplier", multiplier);

        // Apply to specific animation durations
        root.style.setProperty(
          "--scanline-drift-speed",
          `${4000 * multiplier}ms`
        );
        root.style.setProperty("--tracking-speed", `${400 * multiplier}ms`);
      }

      // Update body class for CSS-based optimizations
      document.body.className = document.body.className.replace(
        /perf-level-\d+/g,
        ""
      );
      document.body.classList.add(`perf-level-${this.state.optimizationLevel}`);
    }

    // Register an effect for monitoring
    registerEffect(name, instance) {
      this.effects.set(name, instance);
      this.state.effectLoadMap.set(name, {
        enabled: true,
        lastPerformanceImpact: 0,
        enabledTime: performance.now(),
      });
    }

    // Get performance report
    getPerformanceReport() {
      return {
        currentFPS: this.state.currentFPS,
        performanceScore: this.state.performanceScore,
        optimizationLevel: this.state.optimizationLevel,
        strategyName: this.optimizationStrategies.get(
          this.state.optimizationLevel
        )?.name,
        deviceCapabilities: this.state.deviceCapabilities,
        fpsHistory: this.state.fpsHistory.slice(-10), // Last 10 entries
        adaptationHistory: this.state.adaptationHistory,
        effectStatus: Array.from(this.state.effectLoadMap.entries()).map(
          ([name, data]) => ({
            name,
            ...data,
          })
        ),
      };
    }

    // Force optimization level
    setOptimizationLevel(level) {
      if (level >= 0 && level <= 4) {
        this.applyOptimizationLevel(level);
      }
    }

    // Enable/disable machine learning optimization
    setMLOptimization(enabled) {
      this.config.enableMLOptimization = enabled;
      console.log(
        `[Optimizer] ML optimization: ${enabled ? "enabled" : "disabled"}`
      );
    }
  }

  // Create global optimizer instance
  window.AdvancedPerformanceOptimizer = new AdvancedPerformanceOptimizer();

  // Auto-initialize when ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.AdvancedPerformanceOptimizer.init();
    });
  } else {
    window.AdvancedPerformanceOptimizer.init();
  }

  console.log("[Optimizer] Advanced Performance Optimizer loaded");
})();
