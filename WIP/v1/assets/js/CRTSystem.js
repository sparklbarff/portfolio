/*
 * Unified CRT System
 * Central management system for CRT/VHS simulation effects
 * Consolidates state management, effect coordination, and performance adaptation
 * Physics: Realistic simulation of CRT monitor wear patterns and failures
 * Implementation: Event-based architecture with adaptive timing
 */
(function() {
  'use strict';

  /* Early initialization for immediate access */
  window.CRTSystem = {};

  /* Shared references to required components */
  let CRTConfig, CRTResource;
  let InterlacingEngine, ColorSystem, GeometryEngine, ShadowMaskEngine;

  /* System event tracking and coordination */
  const pendingEffects = new Map();
  const activeEffects = new Set();
  const lastEffectTimes = new Map();
  const registeredSystems = new Set();
  const systemStates = new Map();

  /* Global system state */
  const globalState = {
    mode: 'stable' /* "stable", "failure", "cascade" */,
    thermalLevel: 0 /* 0-1 thermal stress indicator */,
    cascadeLevel: 0 /* 0-1 cascade failure intensity */,
    backgroundIntensity: 0.5 /* 0-1 background brightness */,
    audioAmplitude: 0 /* 0-1 audio level */,
    performanceLevel: 'high' /* Performance tier from monitor */,
    currentFPS: 60 /* Real-time frame rate */,
    frameDropCount: 0 /* Dropped frame counter */,
    lastPerformanceUpdate: 0 /* Timestamp of last perf update */,
    globalWear: 0 /* 0-1 overall system degradation */,
    systemInitialized: false /* System initialization flag */,
    activeIntensity: 0 /* Current active effect intensity */,
    enabled: true /* Master effect enable/disable */,

    /* Performance-related state */
    performanceSettings: null /* Current performance config */,
    targetFPS: 30 /* Current target frame rate */,
    isLowEndDevice: false /* Low-end device flag */,

    /* Cursor state for magnetic effects */
    cursor: {
      x: -1000 /* Cursor X position */,
      y: -1000 /* Cursor Y position */,
      active: false /* Cursor in viewport flag */
    },

    /* Wear pattern simulation state */
    wearPatterns: {
      magneticWear: 0 /* Magnetic field instability (0-0.05) */,
      thermalStress: 0 /* Thermal cycling stress (-0.08 to 0.08) */,
      powerSupplyWear: 0 /* Power regulation degradation (0-0.04) */,
      convergenceWear: 0 /* RGB convergence wear (0-0.06) */,
      phosphorMask: 0 /* Phosphor mask degradation (0-0.08) */,
      trackingWear: 0 /* VHS tracking system wear (0-0.07) */,
      signalNoise: 0 /* Signal interference level (0-0.1) */
    }
  };

  /* System API implementation */
  const CRTSystem = {
    /*
     * Initialize the unified CRT system
     */
    init() {
      if (globalState.systemInitialized) {
        return this;
      }

      // Dynamically load required components
      CRTConfig = window.CRTConfig || this.loadDefaultConfig();
      CRTResource = window.CRTResource || this.loadDefaultResource();

      // Load physics engines
      InterlacingEngine = window.CRTInterlacingEngine;
      ColorSystem = window.CRTColorSystem;
      GeometryEngine = window.CRTGeometryEngine;
      ShadowMaskEngine = window.CRTShadowMaskEngine;

      // Update performance settings from monitor
      this.updatePerformanceSettings();

      // Setup core event listeners
      this.setupEventListeners();

      // Initialize wear patterns
      this.initializeWearPatterns();

      // Initialize physics engines
      this.initializePhysicsEngines();

      // Signal system ready
      globalState.systemInitialized = true;

      // Broadcast ready state to all systems
      window.dispatchEvent(new CustomEvent('crtSystemReady'));

      console.log(
        '[CRTSystem] Initialized with performance level:',
        globalState.performanceLevel
      );
      return this;
    },

    /*
     * Load default configuration if CRTConfig is not available
     */
    loadDefaultConfig() {
      console.warn('[CRTSystem] CRTConfig not found, using defaults');
      return {
        TIMING: {
          MINIMUM_COOLDOWN: 800,
          SYSTEM_COOLDOWNS: { TITLE: 1200, NAV: 900, RETRACE: 8000 },
          INTENSITY_RECOVERY: 2500,
          STARTUP_DELAY: { TITLE: 800, NAV: 1500, EFFECTS: 2500 }
        },
        RATE_LIMITS: {
          HIGH_INTENSITY_COOLDOWN: 8000,
          MEDIUM_INTENSITY_COOLDOWN: 3000,
          LOW_INTENSITY_COOLDOWN: 900
        },
        PERFORMANCE_LEVELS: {
          LOW: {
            effectProbability: 0.4,
            cooldownMultiplier: 1.6,
            intensityMultiplier: 0.5
          },
          MEDIUM: {
            effectProbability: 0.7,
            cooldownMultiplier: 1.2,
            intensityMultiplier: 0.8
          },
          HIGH: {
            effectProbability: 1.0,
            cooldownMultiplier: 1.0,
            intensityMultiplier: 1.0
          }
        },
        FRAME_RATES: { LOW: 12, MEDIUM: 15, HIGH: 20 },
        WEAR_RATES: {
          MAGNETIC: 0.00005,
          THERMAL: 0.0001,
          POWER: 0.00004,
          CONVERGENCE: 0.00003,
          TRACKING: 0.00005
        }
      };
    },

    /*
     * Load default resource manager if CRTResource is not available
     */
    loadDefaultResource() {
      console.warn(
        '[CRTSystem] CRTResource not found, using minimal implementation'
      );
      return {
        registerTimer: () => {},
        registerElement: () => {},
        registerListener: () => {},
        cleanupAll: () => {}
      };
    },

    /*
     * Update performance settings from the performance monitor
     */
    updatePerformanceSettings() {
      const monitor = window.PerformanceMonitor;
      const level = monitor ? monitor.getPerformanceLevel() : 'high';
      const isLowEnd = monitor ? monitor.isLowEndDevice() : false;

      globalState.performanceLevel = level;
      globalState.isLowEndDevice = isLowEnd;

      // Get performance settings from config
      const settings =
        CRTConfig.PERFORMANCE_LEVELS[level.toUpperCase()] ||
        CRTConfig.PERFORMANCE_LEVELS.HIGH;

      globalState.performanceSettings = settings;

      // Set target FPS based on performance level
      globalState.targetFPS =
        CRTConfig.FRAME_RATES[level.toUpperCase()] ||
        CRTConfig.FRAME_RATES.HIGH;

      // Broadcast frame rate change
      window.dispatchEvent(
        new CustomEvent('frameRateChange', {
          detail: {
            targetFPS: globalState.targetFPS,
            performanceLevel: level
          }
        })
      );

      return globalState.performanceSettings;
    },

    /*
     * Set up core event listeners for system coordination
     */
    setupEventListeners() {
      // Listen for motion pause/resume
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'data-motion') {
            const isPaused =
              document.documentElement.dataset.motion === 'paused';
            globalState.enabled = !isPaused;

            // Broadcast pause state
            window.dispatchEvent(
              new CustomEvent('motionStateChange', {
                detail: { enabled: globalState.enabled }
              })
            );
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });
      CRTResource.registerObserver(observer);

      // Setup cursor tracking for magnetic effects
      const mouseHandler = e => {
        globalState.cursor.x = e.clientX;
        globalState.cursor.y = e.clientY;
        globalState.cursor.active = true;

        // Broadcast cursor data at throttled rate (performance optimization)
        if (!mouseHandler.throttled) {
          mouseHandler.throttled = true;
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('cursorUpdate', {
                detail: {
                  x: globalState.cursor.x,
                  y: globalState.cursor.y,
                  active: true
                }
              })
            );
            mouseHandler.throttled = false;
          }, 16); // ~60fps maximum
        }
      };

      document.addEventListener('mousemove', mouseHandler);
      CRTResource.registerListener(document, 'mousemove', mouseHandler);

      // Reset cursor position when mouse leaves
      const mouseLeaveHandler = () => {
        globalState.cursor.active = false;
        globalState.cursor.x = -1000;
        globalState.cursor.y = -1000;

        window.dispatchEvent(
          new CustomEvent('cursorUpdate', {
            detail: {
              x: -1000,
              y: -1000,
              active: false
            }
          })
        );
      };

      document.addEventListener('mouseleave', mouseLeaveHandler);
      CRTResource.registerListener(document, 'mouseleave', mouseLeaveHandler);

      // Audio data handler
      window.addEventListener('audioData', event => {
        if (event.detail && typeof event.detail.amplitude === 'number') {
          // Smooth amplitude transitions
          globalState.audioAmplitude =
            globalState.audioAmplitude * 0.8 + event.detail.amplitude * 0.2;

          // Broadcast audio state change at throttled rate
          if (!this.audioThrottled && globalState.audioAmplitude > 0.05) {
            this.audioThrottled = true;
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent('crtAudioUpdate', {
                  detail: { amplitude: globalState.audioAmplitude }
                })
              );
              this.audioThrottled = false;
            }, 33); // ~30fps for audio updates
          }
        }
      });

      // Effect coordination listeners
      window.addEventListener(
        'effectRequest',
        this.handleEffectRequest.bind(this)
      );
      window.addEventListener(
        'effectComplete',
        this.handleEffectComplete.bind(this)
      );
      window.addEventListener(
        'cascadeEvent',
        this.handleCascadeEvent.bind(this)
      );

      // Broadcast system ready again for late listeners
      window.addEventListener('systemQuery', () => {
        window.dispatchEvent(new CustomEvent('crtSystemReady'));
      });
    },

    /*
     * Initialize wear pattern simulation
     */
    initializeWearPatterns() {
      // Start with minimal wear
      Object.keys(globalState.wearPatterns).forEach(key => {
        globalState.wearPatterns[key] = Math.random() * 0.01;
      });

      // Initialize wear accumulation interval
      const wearInterval = setInterval(() => {
        if (!globalState.enabled) {
          return;
        }

        // Slow degradation based on performance level
        const wearMultiplier = globalState.isLowEndDevice ? 0.5 : 1.0;

        // Update wear patterns organically
        globalState.wearPatterns.magneticWear +=
          Math.random() * CRTConfig.WEAR_RATES.MAGNETIC * wearMultiplier;

        globalState.wearPatterns.thermalStress +=
          (Math.random() - 0.5) * CRTConfig.WEAR_RATES.THERMAL * wearMultiplier;

        globalState.wearPatterns.powerSupplyWear +=
          Math.random() * CRTConfig.WEAR_RATES.POWER * wearMultiplier;

        globalState.wearPatterns.convergenceWear +=
          Math.random() * CRTConfig.WEAR_RATES.CONVERGENCE * wearMultiplier;

        globalState.wearPatterns.trackingWear +=
          Math.random() * CRTConfig.WEAR_RATES.TRACKING * wearMultiplier;

        // Cap wear values at realistic limits
        globalState.wearPatterns.magneticWear = Math.min(
          globalState.wearPatterns.magneticWear,
          0.05
        );
        globalState.wearPatterns.thermalStress = Math.max(
          -0.08,
          Math.min(globalState.wearPatterns.thermalStress, 0.08)
        );
        globalState.wearPatterns.powerSupplyWear = Math.min(
          globalState.wearPatterns.powerSupplyWear,
          0.04
        );
        globalState.wearPatterns.convergenceWear = Math.min(
          globalState.wearPatterns.convergenceWear,
          0.06
        );
        globalState.wearPatterns.trackingWear = Math.min(
          globalState.wearPatterns.trackingWear,
          0.07
        );

        // Update global wear average
        const wearValues = Object.values(globalState.wearPatterns);
        globalState.globalWear =
          wearValues.reduce((sum, val) => sum + Math.abs(val), 0) /
          wearValues.length;

        // Update thermal level based on thermal stress
        this.updateThermalLevel(
          Math.abs(globalState.wearPatterns.thermalStress) / 0.08
        );

        // Broadcast wear update at a slow rate
        if (Math.random() < 0.1) {
          window.dispatchEvent(
            new CustomEvent('wearUpdate', {
              detail: {
                patterns: { ...globalState.wearPatterns },
                globalWear: globalState.globalWear,
                thermalLevel: globalState.thermalLevel
              }
            })
          );
        }
      }, 500); // Slower update rate to conserve resources

      CRTResource.registerInterval(wearInterval);
    },

    /*
     * Initialize all physics engines with CRT system integration
     */
    initializePhysicsEngines() {
      console.log('[CRTSystem] Initializing physics engines...');

      // Initialize NTSC Interlacing Engine
      if (InterlacingEngine && typeof InterlacingEngine.init === 'function') {
        InterlacingEngine.init();
        console.log('[CRTSystem] NTSC Interlacing Engine initialized');
      }

      // Initialize NTSC Color Bleeding System
      if (ColorSystem && typeof ColorSystem.init === 'function') {
        ColorSystem.init();
        console.log('[CRTSystem] NTSC Color System initialized');
      }

      // Initialize CRT Geometry Engine
      if (GeometryEngine && typeof GeometryEngine.init === 'function') {
        GeometryEngine.init();
        console.log('[CRTSystem] CRT Geometry Engine initialized');
      }

      // Initialize Shadow Mask Engine
      if (ShadowMaskEngine && typeof ShadowMaskEngine.init === 'function') {
        ShadowMaskEngine.init();
        console.log('[CRTSystem] Shadow Mask Engine initialized');
      }

      // Setup physics engine coordination
      this.setupPhysicsCoordination();
    },

    /*
     * Setup coordination between physics engines
     */
    setupPhysicsCoordination() {
      // Listen for geometry changes to update other engines
      window.addEventListener('geometryDistortion', event => {
        const { distortionLevel, thermalWear } = event.detail;

        // Update color system with geometry-related chromatic aberration
        if (ColorSystem && ColorSystem.setChromaBleeding) {
          ColorSystem.setChromaBleeding(distortionLevel * 0.3);
        }

        // Update shadow mask with geometry distortion data
        if (ShadowMaskEngine && ShadowMaskEngine.setDistortion) {
          ShadowMaskEngine.setDistortion(distortionLevel);
        }
      });

      // Listen for thermal changes to coordinate all engines
      window.addEventListener('thermalChange', event => {
        const { thermalLevel, convergenceDrift } = event.detail;

        // Update interlacing with thermal jitter
        if (InterlacingEngine && InterlacingEngine.setThermalJitter) {
          InterlacingEngine.setThermalJitter(thermalLevel);
        }

        // Update color system convergence
        if (ColorSystem && ColorSystem.setConvergenceDrift) {
          ColorSystem.setConvergenceDrift(convergenceDrift);
        }

        // Update shadow mask thermal expansion
        if (ShadowMaskEngine && ShadowMaskEngine.setThermalExpansion) {
          ShadowMaskEngine.setThermalExpansion(thermalLevel);
        }
      });

      // Listen for power supply variations
      window.addEventListener('powerSupplyRipple', event => {
        const { rippleLevel, voltageVariation } = event.detail;

        // Update geometry engine with power supply distortions
        if (GeometryEngine && GeometryEngine.setPowerRipple) {
          GeometryEngine.setPowerRipple(rippleLevel);
        }

        // Update interlacing timing with power variations
        if (InterlacingEngine && InterlacingEngine.setPowerVariation) {
          InterlacingEngine.setPowerVariation(voltageVariation);
        }
      });

      // Coordinate performance scaling across all engines
      window.addEventListener('performanceUpdate', event => {
        const { performanceRatio } = event.detail;

        // Scale physics engine complexity based on performance
        if (InterlacingEngine && InterlacingEngine.setPerformanceLevel) {
          InterlacingEngine.setPerformanceLevel(performanceRatio);
        }
        if (ColorSystem && ColorSystem.setPerformanceLevel) {
          ColorSystem.setPerformanceLevel(performanceRatio);
        }
        if (GeometryEngine && GeometryEngine.setPerformanceLevel) {
          GeometryEngine.setPerformanceLevel(performanceRatio);
        }
        if (ShadowMaskEngine && ShadowMaskEngine.setPerformanceLevel) {
          ShadowMaskEngine.setPerformanceLevel(performanceRatio);
        }
      });

      console.log('[CRTSystem] Physics engine coordination established');
    },

    /*
     * Handle effect request from any system
     */
    handleEffectRequest(event) {
      const { effectType, intensity, source, systemId } = event.detail;

      if (!this.canRunEffect(effectType, intensity)) {
        // Reject effect request
        window.dispatchEvent(
          new CustomEvent('effectRejected', {
            detail: { effectType, source, systemId }
          })
        );
        return;
      }

      // Record effect start
      pendingEffects.set(effectType, {
        intensity,
        source,
        systemId,
        time: Date.now()
      });
      activeEffects.add(effectType);
      lastEffectTimes.set(effectType, Date.now());

      // Record intensity tier
      if (intensity > 0.7) {
        lastEffectTimes.set('HIGH_INTENSITY', Date.now());
      } else if (intensity > 0.4) {
        lastEffectTimes.set('MEDIUM_INTENSITY', Date.now());
      } else {
        lastEffectTimes.set('LOW_INTENSITY', Date.now());
      }

      // Update cumulative intensity
      globalState.activeIntensity = Math.max(
        globalState.activeIntensity,
        intensity
      );

      console.log(
        `[CRTSystem] Effect approved: ${effectType} (${intensity.toFixed(2)}) from ${source}`
      );

      // Approve effect request
      window.dispatchEvent(
        new CustomEvent('effectApproved', {
          detail: {
            effectType,
            intensity: intensity * this.getIntensityFactor(),
            source,
            systemId
          }
        })
      );

      // Trigger global cooldown for very intense effects
      if (intensity > 0.8) {
        this.triggerGlobalCooldown(CRTConfig.TIMING.INTENSITY_RECOVERY);
      }
    },

    /*
     * Handle effect completion from any system
     */
    handleEffectComplete(event) {
      const { effectType, source, systemId } = event.detail;

      // Remove from active effects
      activeEffects.delete(effectType);
      pendingEffects.delete(effectType);

      // Recalculate active intensity based on remaining effects
      if (activeEffects.size === 0) {
        globalState.activeIntensity = 0;
      } else {
        let maxIntensity = 0;
        for (const [type, data] of pendingEffects.entries()) {
          maxIntensity = Math.max(maxIntensity, data.intensity);
        }
        globalState.activeIntensity = maxIntensity;
      }

      console.log(`[CRTSystem] Effect completed: ${effectType} from ${source}`);
    },

    /*
     * Handle cascade events from any system
     */
    handleCascadeEvent(event) {
      const { intensity, origin, systemId } = event.detail;

      this.triggerCascade(intensity, origin);

      if (intensity > 0.7) {
        this.triggerGlobalCooldown(CRTConfig.TIMING.INTENSITY_RECOVERY * 1.5);
      }
    },

    /*
     * Check if an effect can run based on timing and system state
     */
    canRunEffect(effectType, intensity = 0.5) {
      if (!globalState.enabled) {
        return false;
      }

      const settings =
        globalState.performanceSettings || CRTConfig.PERFORMANCE_LEVELS.MEDIUM;

      // Apply performance-based probability reduction
      if (Math.random() > settings.effectProbability) {
        return false;
      }

      // Check if system is in global cooldown
      if (this.isInGlobalCooldown()) {
        return false;
      }

      // Check system-specific cooldown
      const lastRunTime = lastEffectTimes.get(effectType) || 0;
      const cooldownTime =
        CRTConfig.TIMING.SYSTEM_COOLDOWNS[effectType] ||
        CRTConfig.TIMING.MINIMUM_COOLDOWN;
      const adjustedCooldown = cooldownTime * settings.cooldownMultiplier;

      const timeSinceLastRun = Date.now() - lastRunTime;
      if (timeSinceLastRun < adjustedCooldown) {
        return false;
      }

      // Intensity-based rate limiting
      if (intensity > 0.7) {
        const highIntensityLastRun = lastEffectTimes.get('HIGH_INTENSITY') || 0;
        if (
          Date.now() - highIntensityLastRun <
          CRTConfig.RATE_LIMITS.HIGH_INTENSITY_COOLDOWN
        ) {
          return false;
        }
      } else if (intensity > 0.4) {
        const mediumIntensityLastRun =
          lastEffectTimes.get('MEDIUM_INTENSITY') || 0;
        if (
          Date.now() - mediumIntensityLastRun <
          CRTConfig.RATE_LIMITS.MEDIUM_INTENSITY_COOLDOWN
        ) {
          return false;
        }
      } else {
        const lowIntensityLastRun = lastEffectTimes.get('LOW_INTENSITY') || 0;
        if (
          Date.now() - lowIntensityLastRun <
          CRTConfig.RATE_LIMITS.LOW_INTENSITY_COOLDOWN
        ) {
          return false;
        }
      }

      // Check maximum simultaneous effects (default 2)
      const MAXIMUM_SIMULTANEOUS = 2;
      if (activeEffects.size >= MAXIMUM_SIMULTANEOUS) {
        return false;
      }

      return true;
    },

    /*
     * Get startup delay for a specific system
     */
    getStartupDelay(system) {
      return CRTConfig.TIMING.STARTUP_DELAY[system] || 1000;
    },

    /*
     * Calculate intensity factor based on performance settings
     */
    getIntensityFactor() {
      const settings =
        globalState.performanceSettings || CRTConfig.PERFORMANCE_LEVELS.MEDIUM;
      return settings.intensityMultiplier;
    },

    /*
     * Register a system with the CRT system
     */
    registerSystem(systemId, initialState = {}) {
      if (registeredSystems.has(systemId)) {
        console.warn(`[CRTSystem] System already registered: ${systemId}`);
        return;
      }

      registeredSystems.add(systemId);
      systemStates.set(systemId, {
        ...initialState,
        registeredAt: Date.now(),
        lastActive: Date.now()
      });

      console.log(`[CRTSystem] System registered: ${systemId}`);

      return true;
    },

    /*
     * Unregister a system from the CRT system
     */
    unregisterSystem(systemId) {
      if (!registeredSystems.has(systemId)) {
        console.warn(`[CRTSystem] System not registered: ${systemId}`);
        return;
      }

      registeredSystems.delete(systemId);
      systemStates.delete(systemId);

      console.log(`[CRTSystem] System unregistered: ${systemId}`);

      return true;
    },

    /*
     * Update performance metrics from the performance monitor
     */
    updatePerformanceMetrics(metrics) {
      const { fps, frameCount } = metrics;
      const now = performance.now();

      // Update global state
      globalState.currentFPS = fps;
      globalState.lastPerformanceUpdate = now;

      // Calculate frame drops
      const expectedFrames = (now - globalState.lastPerformanceUpdate) / 16.67; // 60fps = 16.67ms per frame
      const actualFrames = frameCount;
      if (expectedFrames > 0 && actualFrames < expectedFrames * 0.9) {
        globalState.frameDropCount++;
      }

      // Adaptive effect intensity based on performance
      const performanceRatio = Math.min(fps / 60, 1.0);

      // Reduce effect intensity on poor performance
      if (performanceRatio < 0.8) {
        this.adaptEffectIntensity(performanceRatio);
      }

      // Broadcast performance update to all systems
      window.dispatchEvent(
        new CustomEvent('performanceUpdate', {
          detail: {
            fps,
            frameDrops: globalState.frameDropCount,
            performanceRatio,
            adaptiveIntensity: performanceRatio
          }
        })
      );
    },

    /*
     * Adapt effect intensity based on performance
     */
    adaptEffectIntensity(performanceRatio) {
      const intensityScale = Math.max(0.3, performanceRatio);

      // Update CSS custom properties for effect intensity
      document.documentElement.style.setProperty(
        '--adaptive-intensity',
        intensityScale
      );
      document.documentElement.style.setProperty(
        '--adaptive-opacity',
        intensityScale * 0.8
      );
      document.documentElement.style.setProperty(
        '--adaptive-animation-speed',
        Math.max(0.5, performanceRatio)
      );

      console.log(
        `[CRTSystem] Adapted effect intensity: ${intensityScale.toFixed(2)}`
      );
    },

    /*
     * Request an effect through the unified system
     */
    requestEffect(
      effectType,
      intensity = 0.5,
      source = 'unknown',
      systemId = null
    ) {
      if (!this.canRunEffect(effectType, intensity)) {
        return false;
      }

      // Broadcast effect request
      window.dispatchEvent(
        new CustomEvent('effectRequest', {
          detail: {
            effectType,
            intensity,
            source,
            systemId
          }
        })
      );

      return true;
    },

    /*
     * Complete an effect - notify the system
     */
    completeEffect(effectType, source = 'unknown', systemId = null) {
      window.dispatchEvent(
        new CustomEvent('effectComplete', {
          detail: { effectType, source, systemId }
        })
      );
    },

    /*
     * Trigger a cascade effect in the system
     */
    triggerCascade(intensity, origin = 'unknown') {
      globalState.cascadeLevel = Math.max(globalState.cascadeLevel, intensity);
      globalState.mode = intensity > 0.7 ? 'failure' : 'cascade';

      // Broadcast cascade event to all systems
      window.dispatchEvent(
        new CustomEvent('crtCascade', {
          detail: {
            intensity,
            origin,
            mode: globalState.mode,
            cascadeLevel: globalState.cascadeLevel
          }
        })
      );

      console.log(
        `[CRTSystem] Cascade triggered: ${intensity.toFixed(2)} from ${origin}`
      );

      // Auto-recovery after cascade
      const recoveryTimer = setTimeout(
        () => {
          globalState.cascadeLevel *= 0.7;
          if (globalState.cascadeLevel < 0.1) {
            globalState.mode = 'stable';
            globalState.cascadeLevel = 0;

            // Broadcast recovery
            window.dispatchEvent(
              new CustomEvent('crtRecovery', {
                detail: { mode: 'stable', origin }
              })
            );
          }
        },
        2000 + Math.random() * 3000
      );

      CRTResource.registerTimer(recoveryTimer);
    },

    /*
     * Trigger a global cooldown period
     */
    triggerGlobalCooldown(duration) {
      this._globalCooldownEnd = Date.now() + duration;

      console.log(`[CRTSystem] Global cooldown: ${duration}ms`);
    },

    /*
     * Check if the system is in global cooldown
     */
    isInGlobalCooldown() {
      if (!this._globalCooldownEnd) {
        return false;
      }
      return Date.now() < this._globalCooldownEnd;
    },

    /*
     * Update the thermal level of the system
     */
    updateThermalLevel(level) {
      globalState.thermalLevel = Math.max(0, Math.min(1, level));
    },

    /*
     * Update background intensity
     */
    updateBackgroundIntensity(intensity) {
      globalState.backgroundIntensity = Math.max(0, Math.min(1, intensity));

      // Update CSS variable for background intensity
      document.documentElement.style.setProperty(
        '--crt-background-intensity',
        globalState.backgroundIntensity.toString()
      );
    },

    /*
     * Get current system state
     */
    getState() {
      return { ...globalState };
    },

    /*
     * Get wear patterns
     */
    getWearPatterns() {
      return { ...globalState.wearPatterns };
    },

    /*
     * Get cursor state
     */
    getCursorState() {
      return { ...globalState.cursor };
    },

    /*
     * Get performance settings
     */
    getPerformanceSettings() {
      return { ...globalState.performanceSettings };
    },

    /*
     * Get the current target FPS
     */
    getTargetFPS() {
      return globalState.targetFPS;
    },

    /*
     * Check if the system is enabled
     */
    isEnabled() {
      return globalState.enabled;
    },

    /*
     * Check if the system is initialized
     */
    isInitialized() {
      return globalState.systemInitialized;
    },

    /*
     * Get physics engine references
     */
    getPhysicsEngines() {
      return {
        interlacing: InterlacingEngine,
        colorSystem: ColorSystem,
        geometry: GeometryEngine,
        shadowMask: ShadowMaskEngine
      };
    },

    /*
     * Configure physics engine parameters
     */
    configurePhysicsEngine(engineName, parameters) {
      const engines = this.getPhysicsEngines();
      const engine = engines[engineName];

      if (engine && typeof engine.configure === 'function') {
        engine.configure(parameters);
        console.log(`[CRTSystem] Configured ${engineName} engine:`, parameters);
        return true;
      }

      console.warn(`[CRTSystem] Physics engine not found: ${engineName}`);
      return false;
    },

    /*
     * Get current physics engine configurations
     */
    getPhysicsConfigurations() {
      const engines = this.getPhysicsEngines();
      const configs = {};

      Object.keys(engines).forEach(name => {
        const engine = engines[name];
        if (engine && typeof engine.getConfiguration === 'function') {
          configs[name] = engine.getConfiguration();
        }
      });

      return configs;
    }
  };

  // Assign API to global reference
  window.CRTSystem = CRTSystem;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Defer initialization to ensure other components are loaded
      setTimeout(() => CRTSystem.init(), 10);
    });
  } else {
    // Defer initialization to ensure other components are loaded
    setTimeout(() => CRTSystem.init(), 10);
  }
})();
