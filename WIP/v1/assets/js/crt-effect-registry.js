/**
 * CRT Effect Registry System
 * Manages isolated effect components with pluggable architecture
 */
(function () {
  "use strict";

  class CRTEffectRegistry {
    constructor() {
      this.effects = new Map();
      this.instances = new Map();
      this.globalConfig = {
        performanceLevel: "high",
        enabled: true,
        debugMode: false,
      };
    }

    // Register an effect class
    register(name, effectClass) {
      if (typeof effectClass !== "function") {
        console.error(
          `[EffectRegistry] Effect "${name}" must be a constructor function`
        );
        return false;
      }

      this.effects.set(name, effectClass);
      console.log(`[EffectRegistry] Registered effect: ${name}`);
      return true;
    }

    // Unregister an effect
    unregister(name) {
      // Destroy any active instances first
      if (this.instances.has(name)) {
        this.destroyInstance(name);
      }

      const success = this.effects.delete(name);
      if (success) {
        console.log(`[EffectRegistry] Unregistered effect: ${name}`);
      }
      return success;
    }

    // Create an instance of an effect
    createInstance(name, options = {}) {
      const EffectClass = this.effects.get(name);
      if (!EffectClass) {
        console.error(`[EffectRegistry] Effect "${name}" not found`);
        return null;
      }

      // Merge global config with instance options
      const mergedOptions = {
        ...this.getDefaultOptions(),
        ...options,
        enabled: this.globalConfig.enabled && options.enabled !== false,
      };

      try {
        const instance = new EffectClass(mergedOptions);
        instance.init();

        this.instances.set(name, instance);
        console.log(`[EffectRegistry] Created instance: ${name}`);

        return instance;
      } catch (error) {
        console.error(
          `[EffectRegistry] Failed to create instance "${name}":`,
          error
        );
        return null;
      }
    }

    // Get an existing instance
    getInstance(name) {
      return this.instances.get(name) || null;
    }

    // Destroy an instance
    destroyInstance(name) {
      const instance = this.instances.get(name);
      if (instance) {
        try {
          if (typeof instance.destroy === "function") {
            instance.destroy();
          }
          this.instances.delete(name);
          console.log(`[EffectRegistry] Destroyed instance: ${name}`);
          return true;
        } catch (error) {
          console.error(
            `[EffectRegistry] Failed to destroy instance "${name}":`,
            error
          );
        }
      }
      return false;
    }

    // Enable all instances
    enableAll() {
      this.globalConfig.enabled = true;
      this.instances.forEach((instance, name) => {
        if (typeof instance.enable === "function") {
          instance.enable();
        }
      });
      console.log("[EffectRegistry] Enabled all effects");
    }

    // Disable all instances
    disableAll() {
      this.globalConfig.enabled = false;
      this.instances.forEach((instance, name) => {
        if (typeof instance.disable === "function") {
          instance.disable();
        }
      });
      console.log("[EffectRegistry] Disabled all effects");
    }

    // Set performance level for all instances
    setPerformanceLevel(level) {
      this.globalConfig.performanceLevel = level;

      // Define effect priorities based on performance impact
      const effectPriorities = {
        scanlines: "high", // Always keep
        vignette: "high", // Low cost, high impact
        barrelDistortion: "low", // High cost
        trackingError: "low", // Medium cost, infrequent
        chromaBleed: "medium", // Medium cost
        rgbSeparation: "medium", // Medium cost
      };

      this.instances.forEach((instance, name) => {
        const priority = effectPriorities[name] || "medium";
        const shouldEnable = this.shouldEnableForPerformance(level, priority);

        if (shouldEnable && typeof instance.enable === "function") {
          instance.enable();
        } else if (!shouldEnable && typeof instance.disable === "function") {
          instance.disable();
        }
      });

      console.log(`[EffectRegistry] Set performance level: ${level}`);
    }

    // Determine if an effect should be enabled for the given performance level
    shouldEnableForPerformance(level, priority) {
      switch (level) {
        case "low":
          return priority === "high";
        case "medium":
          return priority === "high" || priority === "medium";
        case "high":
        default:
          return true;
      }
    }

    // Get default options based on global config
    getDefaultOptions() {
      return {
        enabled: this.globalConfig.enabled,
        debugMode: this.globalConfig.debugMode,
      };
    }

    // Batch create multiple effects
    createEffects(effectConfigs) {
      const results = {};

      Object.entries(effectConfigs).forEach(([name, config]) => {
        const instance = this.createInstance(name, config);
        results[name] = {
          success: !!instance,
          instance: instance,
        };
      });

      return results;
    }

    // Get status of all effects
    getStatus() {
      const status = {
        globalConfig: { ...this.globalConfig },
        registeredEffects: Array.from(this.effects.keys()),
        activeInstances: {},
        totalRegistered: this.effects.size,
        totalActive: this.instances.size,
      };

      // Get state from each active instance
      this.instances.forEach((instance, name) => {
        status.activeInstances[name] = {
          hasState: typeof instance.getState === "function",
          state:
            typeof instance.getState === "function"
              ? instance.getState()
              : null,
        };
      });

      return status;
    }

    // Trigger a specific effect if it supports manual triggering
    triggerEffect(name, ...args) {
      const instance = this.instances.get(name);
      if (!instance) {
        console.warn(`[EffectRegistry] Instance "${name}" not found`);
        return false;
      }

      if (typeof instance.trigger === "function") {
        instance.trigger(...args);
        return true;
      } else if (typeof instance.triggerManual === "function") {
        instance.triggerManual(...args);
        return true;
      } else {
        console.warn(
          `[EffectRegistry] Effect "${name}" does not support manual triggering`
        );
        return false;
      }
    }

    // Set debug mode
    setDebugMode(enabled) {
      this.globalConfig.debugMode = enabled;

      // Apply to all instances
      this.instances.forEach((instance, name) => {
        if (instance.options) {
          instance.options.debugMode = enabled;
        }
      });

      console.log(
        `[EffectRegistry] Debug mode: ${enabled ? "enabled" : "disabled"}`
      );
    }

    // Clean up all effects
    destroy() {
      // Destroy all instances
      Array.from(this.instances.keys()).forEach((name) => {
        this.destroyInstance(name);
      });

      // Clear registrations
      this.effects.clear();
      console.log("[EffectRegistry] Registry destroyed");
    }
  }

  // Create global registry instance
  window.CRTEffectRegistry = new CRTEffectRegistry();

  // Auto-register effects when they load
  console.log("[EffectRegistry] CRT Effect Registry initialized");
})();
