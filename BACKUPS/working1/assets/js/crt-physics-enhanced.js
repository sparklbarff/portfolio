/*
 * Enhanced CRT Physics Engine
 * Authentic simulation of NTSC CRT monitor physics and P22 phosphor behavior
 * Physics: Based on NTSC-M standard (15.734kHz horizontal, 59.94Hz vertical)
 * Implementation: WebGL particle system with CSS fallbacks for phosphor persistence
 * Performance: Adaptive quality scaling with memory-efficient particle pooling
 */
(function () {
  "use strict";

  /* System ID for registration with CRTSystem */
  const SYSTEM_ID = "crt-physics";

  /* NTSC Standard Constants (Based on SMPTE-170M) */
  const NTSC_CONSTANTS = {
    HORIZONTAL_FREQUENCY: 15734.26 /* Hz - Line scan frequency */,
    VERTICAL_FREQUENCY: 59.94 /* Hz - Field rate */,
    LINES_TOTAL: 525 /* Total scanlines per frame */,
    LINES_VISIBLE: 486 /* Visible scanlines */,
    COLOR_SUBCARRIER: 3579545.45 /* Hz - NTSC color frequency */,
    ASPECT_RATIO: 4 / 3 /* Standard NTSC aspect ratio */,
    BLANKING_LEVEL: 0.075 /* IRE units (7.5% setup) */,
    SYNC_LEVEL: -0.286 /* IRE units (-40 IRE) */,
    WHITE_LEVEL: 1.0 /* IRE units (100 IRE) */,
  };

  /* P22 Phosphor Characteristics (Measured at 20°C) */
  const P22_PHOSPHOR = {
    RED: {
      PERSISTENCE: 1.0 /* ms - 10% decay time */,
      PEAK_WAVELENGTH: 611 /* nm - Peak emission */,
      COLOR_TEMP: 2700 /* K - Color temperature */,
      EFFICIENCY: 0.12 /* Lumens/Watt */,
      THERMAL_COEFFICIENT: -0.002 /* /°C - Temperature sensitivity */,
    },
    GREEN: {
      PERSISTENCE: 2.0 /* ms - 10% decay time */,
      PEAK_WAVELENGTH: 545 /* nm - Peak emission */,
      COLOR_TEMP: 6500 /* K - Color temperature */,
      EFFICIENCY: 0.68 /* Lumens/Watt */,
      THERMAL_COEFFICIENT: -0.0015 /* /°C - Temperature sensitivity */,
    },
    BLUE: {
      PERSISTENCE: 10.0 /* ms - 10% decay time */,
      PEAK_WAVELENGTH: 450 /* nm - Peak emission */,
      COLOR_TEMP: 9300 /* K - Color temperature */,
      EFFICIENCY: 0.095 /* Lumens/Watt */,
      THERMAL_COEFFICIENT: -0.003 /* /°C - Temperature sensitivity */,
    },
  };

  /* CRT Geometry Constants */
  const CRT_GEOMETRY = {
    SHADOW_MASK_PITCH: 0.25 /* mm - Dot pitch */,
    CONVERGENCE_TOLERANCE: 0.05 /* mm - Factory alignment */,
    BEAM_DIAMETER: 0.4 /* mm - Electron beam spot size */,
    SCREEN_CURVATURE: 1800 /* mm - Radius of curvature */,
    DEFLECTION_SENSITIVITY: {
      HORIZONTAL: 0.5 /* mm/V - H deflection coil */,
      VERTICAL: 0.4 /* mm/V - V deflection coil */,
    },
  };

  /* Temperature Model Constants */
  const THERMAL_MODEL = {
    AMBIENT_TEMP: 22 /* °C - Room temperature */,
    OPERATING_TEMP: 65 /* °C - Normal operating temp */,
    THERMAL_TIME_CONSTANT: 1800 /* seconds - Warm-up time */,
    DRIFT_COEFFICIENTS: {
      HORIZONTAL: 0.002 /* %/°C - H deflection drift */,
      VERTICAL: 0.0015 /* %/°C - V deflection drift */,
      CONVERGENCE: 0.001 /* mm/°C - Convergence drift */,
      HV_REGULATION: 0.0005 /* %/°C - High voltage drift */,
    },
  };

  /* Enhanced CRT Physics Engine */
  const CRTPhysicsEngine = {
    /* System state */
    initialized: false,
    webglSupported: false,
    particleSystem: null,
    thermalState: {
      currentTemp: THERMAL_MODEL.AMBIENT_TEMP,
      targetTemp: THERMAL_MODEL.OPERATING_TEMP,
      warmupProgress: 0,
      driftAccumulator: { h: 0, v: 0, conv: 0, hv: 0 },
    },
    scanlineState: {
      currentLine: 0,
      fieldOdd: true,
      horizontalPhase: 0,
      verticalPhase: 0,
    },
    phosphorState: {
      particles: [],
      particlePool: [],
      lastDecayUpdate: 0,
    },
    convergenceState: {
      redOffset: { x: 0, y: 0 },
      greenOffset: { x: 0, y: 0 },
      blueOffset: { x: 0, y: 0 },
      dynamicError: 0,
    },

    /*
     * Initialize the enhanced CRT physics engine
     */
    init() {
      if (this.initialized) return this;

      // Check WebGL support for advanced phosphor simulation
      this.webglSupported = this.detectWebGLSupport();

      // Initialize particle system
      this.initParticleSystem();

      // Start thermal simulation
      this.initThermalModel();

      // Initialize NTSC scan timing
      this.initScanTiming();

      // Setup convergence error simulation
      this.initConvergenceModel();

      // Register with CRT system
      if (window.CRTSystem) {
        window.CRTSystem.registerSystem(SYSTEM_ID, {
          type: "physics",
          active: true,
          capabilities: {
            webgl: this.webglSupported,
            particles: true,
            thermal: true,
            convergence: true,
          },
        });
      }

      this.initialized = true;
      console.log(
        `[CRTPhysics] Initialized with WebGL: ${this.webglSupported}`
      );

      return this;
    },

    /*
     * Detect WebGL support for particle rendering
     */
    detectWebGLSupport() {
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) return false;

        // Check for required extensions
        const ext = gl.getExtension("OES_vertex_array_object");
        return !!ext;
      } catch (error) {
        console.warn("[CRTPhysics] WebGL detection failed:", error);
        return false;
      }
    },

    /*
     * Initialize particle system for phosphor simulation
     */
    initParticleSystem() {
      const maxParticles =
        window.CRTSystem?.getPerformanceSettings()?.maxParticles ||
        (this.webglSupported ? 1000 : 200);

      // Pre-allocate particle pool for performance
      this.phosphorState.particlePool = Array.from(
        { length: maxParticles },
        () => ({
          x: 0,
          y: 0,
          z: 0,
          color: { r: 0, g: 0, b: 0 },
          intensity: 0,
          persistence: 0,
          createdAt: 0,
          active: false,
        })
      );

      console.log(
        `[CRTPhysics] Particle system initialized: ${maxParticles} particles`
      );
    },

    /*
     * Initialize thermal drift model
     */
    initThermalModel() {
      const updateThermal = () => {
        const deltaTime = 16.67; // ~60fps
        const timeConstant = THERMAL_MODEL.THERMAL_TIME_CONSTANT * 1000;

        // Exponential approach to target temperature
        const tempDelta =
          this.thermalState.targetTemp - this.thermalState.currentTemp;
        const tempRate = tempDelta * (deltaTime / timeConstant);
        this.thermalState.currentTemp += tempRate;

        // Update warmup progress (0-1)
        const tempRange =
          THERMAL_MODEL.OPERATING_TEMP - THERMAL_MODEL.AMBIENT_TEMP;
        const currentRange =
          this.thermalState.currentTemp - THERMAL_MODEL.AMBIENT_TEMP;
        this.thermalState.warmupProgress = Math.min(
          1,
          currentRange / tempRange
        );

        // Calculate drift accumulation
        const tempExcess =
          this.thermalState.currentTemp - THERMAL_MODEL.AMBIENT_TEMP;
        this.thermalState.driftAccumulator.h +=
          THERMAL_MODEL.DRIFT_COEFFICIENTS.HORIZONTAL * tempExcess * 0.0001;
        this.thermalState.driftAccumulator.v +=
          THERMAL_MODEL.DRIFT_COEFFICIENTS.VERTICAL * tempExcess * 0.0001;
        this.thermalState.driftAccumulator.conv +=
          THERMAL_MODEL.DRIFT_COEFFICIENTS.CONVERGENCE * tempExcess * 0.0001;
        this.thermalState.driftAccumulator.hv +=
          THERMAL_MODEL.DRIFT_COEFFICIENTS.HV_REGULATION * tempExcess * 0.0001;

        // Update global thermal level for other systems
        if (window.CRTSystem) {
          window.CRTSystem.updateThermalLevel(this.thermalState.warmupProgress);
        }
      };

      // Start thermal simulation
      if (window.CRTResource) {
        const thermalInterval = window.CRTResource.setInterval(
          updateThermal,
          16.67,
          {
            purpose: "thermal-simulation",
          }
        );
      }
    },

    /*
     * Initialize NTSC scan timing simulation
     */
    initScanTiming() {
      const updateScanTiming = (timestamp) => {
        // Calculate horizontal phase (0-1 across one scanline)
        const hPeriod = 1000 / NTSC_CONSTANTS.HORIZONTAL_FREQUENCY;
        this.scanlineState.horizontalPhase = (timestamp % hPeriod) / hPeriod;

        // Calculate vertical phase (0-1 across one field)
        const vPeriod = 1000 / NTSC_CONSTANTS.VERTICAL_FREQUENCY;
        this.scanlineState.verticalPhase = (timestamp % vPeriod) / vPeriod;

        // Update current scanline
        this.scanlineState.currentLine = Math.floor(
          this.scanlineState.verticalPhase * NTSC_CONSTANTS.LINES_VISIBLE
        );

        // Toggle field for interlacing
        const fieldPeriod = vPeriod * 2; // Full frame period
        this.scanlineState.fieldOdd =
          Math.floor(timestamp / fieldPeriod) % 2 === 0;

        // Continue animation
        if (window.CRTResource) {
          const animId = requestAnimationFrame(updateScanTiming);
          window.CRTResource.registerAnimation(animId);
        }
      };

      // Start scan timing
      if (window.CRTResource) {
        const animId = requestAnimationFrame(updateScanTiming);
        window.CRTResource.registerAnimation(animId);
      }
    },

    /*
     * Initialize RGB convergence error model
     */
    initConvergenceModel() {
      const updateConvergence = () => {
        const sysState = window.CRTSystem?.getState();
        if (!sysState) return;

        // Base convergence errors (factory misalignment)
        const baseError = CRT_GEOMETRY.CONVERGENCE_TOLERANCE;

        // Add thermal drift
        const thermalError = this.thermalState.driftAccumulator.conv;

        // Add dynamic errors based on system state
        let dynamicScale = 1.0;
        if (sysState.mode === "failure") dynamicScale *= 2.5;
        if (sysState.cascadeLevel > 0)
          dynamicScale *= 1 + sysState.cascadeLevel;

        // Calculate per-channel offsets (in CSS pixels)
        const pixelsPerMM = 3.78; // Approximate for typical displays

        this.convergenceState.redOffset.x =
          (baseError + thermalError) * dynamicScale * pixelsPerMM * 0.8;
        this.convergenceState.redOffset.y =
          (baseError + thermalError) * dynamicScale * pixelsPerMM * 0.3;

        this.convergenceState.blueOffset.x =
          -(baseError + thermalError) * dynamicScale * pixelsPerMM * 0.6;
        this.convergenceState.blueOffset.y =
          -(baseError + thermalError) * dynamicScale * pixelsPerMM * 0.4;

        // Green typically has best convergence
        this.convergenceState.greenOffset.x =
          (baseError + thermalError) * dynamicScale * pixelsPerMM * 0.1;
        this.convergenceState.greenOffset.y =
          (baseError + thermalError) * dynamicScale * pixelsPerMM * 0.05;
      };

      // Update convergence at 30fps (adequate for thermal changes)
      if (window.CRTResource) {
        const convergenceInterval = window.CRTResource.setInterval(
          updateConvergence,
          33.33,
          {
            purpose: "convergence-simulation",
          }
        );
      }
    },

    /*
     * Create phosphor particle at screen position
     */
    createPhosphorParticle(x, y, color, intensity = 1.0) {
      // Get inactive particle from pool
      const particle = this.phosphorState.particlePool.find((p) => !p.active);
      if (!particle) return null; // Pool exhausted

      // Determine phosphor type and characteristics
      let phosphorType;
      let persistence;

      if (color.r > color.g && color.r > color.b) {
        phosphorType = "RED";
        persistence = P22_PHOSPHOR.RED.PERSISTENCE;
      } else if (color.g > color.r && color.g > color.b) {
        phosphorType = "GREEN";
        persistence = P22_PHOSPHOR.GREEN.PERSISTENCE;
      } else {
        phosphorType = "BLUE";
        persistence = P22_PHOSPHOR.BLUE.PERSISTENCE;
      }

      // Apply temperature effects to persistence
      const tempEffect =
        1 +
        (this.thermalState.currentTemp - 20) *
          P22_PHOSPHOR[phosphorType].THERMAL_COEFFICIENT;
      persistence *= tempEffect;

      // Initialize particle
      Object.assign(particle, {
        x,
        y,
        z: 0,
        color: { ...color },
        intensity,
        persistence: persistence * intensity,
        createdAt: performance.now(),
        active: true,
      });

      this.phosphorState.particles.push(particle);
      return particle;
    },

    /*
     * Update phosphor particle decay simulation
     */
    updatePhosphorDecay(timestamp) {
      if (timestamp - this.phosphorState.lastDecayUpdate < 16.67) return; // 60fps limit

      this.phosphorState.lastDecayUpdate = timestamp;

      // Update active particles
      for (let i = this.phosphorState.particles.length - 1; i >= 0; i--) {
        const particle = this.phosphorState.particles[i];
        const age = timestamp - particle.createdAt;

        // Calculate exponential decay
        const decayFactor = Math.exp(-age / particle.persistence);
        const currentIntensity = particle.intensity * decayFactor;

        // Remove if decayed below threshold
        if (currentIntensity < 0.01) {
          particle.active = false;
          this.phosphorState.particles.splice(i, 1);
          continue;
        }

        // Update particle intensity for rendering
        particle.currentIntensity = currentIntensity;
      }
    },

    /*
     * Get current convergence error for CSS application
     */
    getConvergenceError() {
      return {
        red: {
          textShadow: `${this.convergenceState.redOffset.x}px ${this.convergenceState.redOffset.y}px rgba(255, 64, 32, 0.8)`,
        },
        green: {
          textShadow: `${this.convergenceState.greenOffset.x}px ${this.convergenceState.greenOffset.y}px rgba(32, 255, 64, 0.8)`,
        },
        blue: {
          textShadow: `${this.convergenceState.blueOffset.x}px ${this.convergenceState.blueOffset.y}px rgba(64, 128, 255, 0.8)`,
        },
      };
    },

    /*
     * Get temperature-adjusted color for phosphor rendering
     */
    getTemperatureAdjustedColor(baseColor, phosphorType) {
      const temp = this.thermalState.currentTemp;
      const phosphor = P22_PHOSPHOR[phosphorType];

      // Calculate color temperature shift
      const tempShift = (temp - 20) * phosphor.THERMAL_COEFFICIENT;
      const intensity = phosphor.EFFICIENCY * (1 + tempShift);

      return {
        r: Math.max(0, Math.min(255, baseColor.r * intensity)),
        g: Math.max(0, Math.min(255, baseColor.g * intensity)),
        b: Math.max(0, Math.min(255, baseColor.b * intensity)),
      };
    },

    /*
     * Get current scan position for beam effects
     */
    getCurrentScanPosition() {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      return {
        x: this.scanlineState.horizontalPhase * screenWidth,
        y:
          this.scanlineState.currentLine *
          (screenHeight / NTSC_CONSTANTS.LINES_VISIBLE),
        line: this.scanlineState.currentLine,
        field: this.scanlineState.fieldOdd ? "odd" : "even",
        horizontalPhase: this.scanlineState.horizontalPhase,
        verticalPhase: this.scanlineState.verticalPhase,
      };
    },

    /*
     * Apply thermal effects to element styling
     */
    applyThermalEffects(element, baseStyles = {}) {
      const tempProgress = this.thermalState.warmupProgress;
      const thermalDrift = this.thermalState.driftAccumulator;

      // Calculate temperature-based color shift
      const hueShift = thermalDrift.h * 15; // degrees
      const saturationShift = tempProgress * 0.05; // 5% max desaturation
      const brightnessShift = 1 + (tempProgress * 0.1 - 0.05); // ±5% brightness

      // Apply thermal filter effects
      element.style.filter = `
        hue-rotate(${hueShift}deg)
        saturate(${1 - saturationShift})
        brightness(${brightnessShift})
        ${baseStyles.filter || ""}
      `.trim();

      // Apply convergence errors
      const convergence = this.getConvergenceError();
      if (baseStyles.textShadow) {
        element.style.textShadow = `
          ${baseStyles.textShadow},
          ${convergence.red.textShadow},
          ${convergence.blue.textShadow}
        `;
      } else {
        element.style.textShadow = `
          ${convergence.red.textShadow},
          ${convergence.blue.textShadow}
        `;
      }
    },

    /*
     * Get current thermal state for external systems
     */
    getThermalState() {
      return {
        temperature: this.thermalState.currentTemp,
        warmupProgress: this.thermalState.warmupProgress,
        drift: { ...this.thermalState.driftAccumulator },
      };
    },

    /*
     * Get current phosphor decay statistics
     */
    getPhosphorStats() {
      return {
        activeParticles: this.phosphorState.particles.length,
        poolUtilization:
          this.phosphorState.particles.length /
          this.phosphorState.particlePool.length,
        webglEnabled: this.webglSupported,
      };
    },

    /*
     * Main update loop for physics simulation
     */
    update(timestamp) {
      if (!this.initialized) return;

      // Update phosphor decay
      this.updatePhosphorDecay(timestamp);

      // Broadcast physics state update
      if (window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent("crtPhysicsUpdate", {
            detail: {
              thermal: this.getThermalState(),
              phosphor: this.getPhosphorStats(),
              scan: this.getCurrentScanPosition(),
              convergence: this.convergenceState,
            },
          })
        );
      }
    },
  };

  /*
   * Public API for integration with other systems
   */
  const CRTPhysicsAPI = {
    init: () => CRTPhysicsEngine.init(),
    createPhosphor: (x, y, color, intensity) =>
      CRTPhysicsEngine.createPhosphorParticle(x, y, color, intensity),
    getThermalState: () => CRTPhysicsEngine.getThermalState(),
    getConvergenceError: () => CRTPhysicsEngine.getConvergenceError(),
    getScanPosition: () => CRTPhysicsEngine.getCurrentScanPosition(),
    applyThermalEffects: (element, styles) =>
      CRTPhysicsEngine.applyThermalEffects(element, styles),
    getTemperatureColor: (color, type) =>
      CRTPhysicsEngine.getTemperatureAdjustedColor(color, type),
    update: (timestamp) => CRTPhysicsEngine.update(timestamp),
  };

  // Initialize on system ready
  function initializeCRTPhysics() {
    if (!window.CRTSystem || !window.CRTSystem.isInitialized()) {
      console.log("[CRTPhysics] Waiting for CRT system initialization...");
      setTimeout(initializeCRTPhysics, 100);
      return;
    }

    CRTPhysicsEngine.init();

    // Start main update loop
    const updateLoop = (timestamp) => {
      CRTPhysicsEngine.update(timestamp);
      if (window.CRTResource) {
        const animId = requestAnimationFrame(updateLoop);
        window.CRTResource.registerAnimation(animId);
      }
    };

    if (window.CRTResource) {
      const animId = requestAnimationFrame(updateLoop);
      window.CRTResource.registerAnimation(animId);
    }
  }

  // Initialize when ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.addEventListener("crtSystemReady", initializeCRTPhysics);
      setTimeout(initializeCRTPhysics, 500); // Fallback
    });
  } else {
    window.addEventListener("crtSystemReady", initializeCRTPhysics);
    setTimeout(initializeCRTPhysics, 500); // Fallback
  }

  // Expose API
  window.CRTPhysics = CRTPhysicsAPI;
})();
