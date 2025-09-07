/**
 * CRT Geometry Distortion Engine
 * Simulates authentic CRT geometry effects including pincushion, barrel distortion,
 * keystone effects, and power supply ripple-induced geometry variations
 */

class CRTGeometryEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      enabled: true,
      pincushionAmount: 0.015, // Horizontal pincushion strength
      barrelAmount: 0.008, // Vertical barrel distortion
      keystoneH: 0.005, // Horizontal keystone
      keystoneV: 0.003, // Vertical keystone
      rippleFrequency: 60, // Power supply frequency (Hz)
      rippleAmplitude: 0.002, // Geometry ripple strength
      convergenceError: 0.001, // RGB convergence misalignment
      thermalDrift: 0.0005, // Thermal expansion effects
      performanceLevel: 'HIGH', // HIGH, MEDIUM, LOW
      ...options
    };

    this.geometryState = {
      time: 0,
      thermalFactor: 1.0,
      powerRipple: 0,
      convergenceOffset: { r: 0, g: 0, b: 0 },
      frameCount: 0
    };

    this.initialized = false;
    this.init();
  }

  init() {
    try {
      this.setupGeometryTransforms();
      this.setupPowerSupplySimulation();
      this.setupThermalModel();
      this.initialized = true;
      console.log('CRT Geometry Engine initialized');
    } catch (error) {
      console.error('Failed to initialize CRT Geometry Engine:', error);
    }
  }

  setupGeometryTransforms() {
    // Create distortion lookup tables for performance
    this.distortionLUT = new Map();
    this.convergenceLUT = new Map();

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Pre-calculate distortion vectors for common points
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const key = `${x},${y}`;
        this.distortionLUT.set(
          key,
          this.calculateDistortion(x, y, width, height)
        );
      }
    }
  }

  calculateDistortion(x, y, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;

    // Normalize coordinates to [-1, 1]
    const normX = (x - centerX) / centerX;
    const normY = (y - centerY) / centerY;

    // Calculate radial distance
    const r = Math.sqrt(normX * normX + normY * normY);
    const r2 = r * r;
    const r4 = r2 * r2;

    // Pincushion distortion (stronger at edges)
    const pincushionX = normX * (1 + this.options.pincushionAmount * r2);
    const pincushionY = normY * (1 + this.options.pincushionAmount * r2);

    // Barrel distortion (opposite effect)
    const barrelX = normX * (1 - this.options.barrelAmount * r2);
    const barrelY = normY * (1 - this.options.barrelAmount * r2);

    // Keystone effects (trapezoidal distortion)
    const keystoneX = normX * (1 + this.options.keystoneH * normY);
    const keystoneY = normY * (1 + this.options.keystoneV * normX);

    // Combine distortions
    const finalX = (pincushionX + barrelX + keystoneX) / 3;
    const finalY = (pincushionY + barrelY + keystoneY) / 3;

    return {
      x: centerX + finalX * centerX,
      y: centerY + finalY * centerY,
      intensity: r // For ripple effects
    };
  }

  setupPowerSupplySimulation() {
    // Simulate power supply ripple effects on geometry
    this.powerSupply = {
      voltage: 115, // Base voltage
      ripplePhase: 0,
      loadVariation: 0,
      regulation: 0.95 // Voltage regulation factor
    };
  }

  setupThermalModel() {
    // Model CRT thermal expansion effects
    this.thermalModel = {
      temperature: 20, // Celsius
      warmupTime: 300000, // 5 minutes in milliseconds
      expansionCoefficient: 1.2e-5, // Steel/glass expansion
      stabilized: false
    };
  }

  updateGeometry() {
    if (!this.initialized || !this.options.enabled) {
      return;
    }

    this.geometryState.time += 16.67; // ~60fps
    this.geometryState.frameCount++;

    // Update power supply ripple
    this.updatePowerRipple();

    // Update thermal effects
    this.updateThermalEffects();

    // Update convergence errors
    this.updateConvergence();

    // Apply performance throttling
    if (this.shouldThrottleUpdate()) {
      return;
    }

    this.applyGeometryDistortion();
  }

  updatePowerRipple() {
    const time = this.geometryState.time / 1000;
    const rippleFreq = this.options.rippleFrequency * 2 * Math.PI;

    // 60Hz ripple from power supply
    const primaryRipple = Math.sin(rippleFreq * time);

    // 120Hz secondary ripple (full-wave rectification)
    const secondaryRipple = Math.sin(rippleFreq * 2 * time) * 0.3;

    // Load-dependent voltage variation
    const loadFactor = 1 + (Math.random() - 0.5) * 0.01;

    this.geometryState.powerRipple =
      (primaryRipple + secondaryRipple) *
      this.options.rippleAmplitude *
      loadFactor;

    // Update power supply voltage
    this.powerSupply.voltage = 115 + this.geometryState.powerRipple * 10;
  }

  updateThermalEffects() {
    const elapsed = this.geometryState.time;
    const warmupProgress = Math.min(elapsed / this.thermalModel.warmupTime, 1);

    // Thermal expansion curve (exponential warmup)
    const thermalCurve = 1 - Math.exp(-warmupProgress * 3);

    // Calculate expansion factor
    this.geometryState.thermalFactor =
      1 + thermalCurve * this.thermalModel.expansionCoefficient * 50;

    // Mark as stabilized after warmup
    if (warmupProgress > 0.95) {
      this.thermalModel.stabilized = true;
    }
  }

  updateConvergence() {
    const time = this.geometryState.time / 1000;
    const baseError = this.options.convergenceError;

    // Red gun convergence (typically worst)
    this.geometryState.convergenceOffset.r =
      baseError * 1.5 * Math.sin(time * 0.1) * this.geometryState.thermalFactor;

    // Green gun convergence (usually best aligned)
    this.geometryState.convergenceOffset.g =
      baseError * 0.3 * Math.cos(time * 0.15);

    // Blue gun convergence (moderate drift)
    this.geometryState.convergenceOffset.b =
      baseError * 0.8 * Math.sin(time * 0.12 + Math.PI / 3);
  }

  applyGeometryDistortion() {
    if (!this.ctx) {
      return;
    }

    const canvas = this.canvas;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newImageData = this.ctx.createImageData(canvas.width, canvas.height);

    this.processDistortion(imageData, newImageData);

    // Apply convergence errors
    this.applyConvergenceErrors(newImageData);

    // Apply power ripple geometry effects
    this.applyRippleEffects(newImageData);

    this.ctx.putImageData(newImageData, 0, 0);
  }

  processDistortion(sourceData, targetData) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const source = sourceData.data;
    const target = targetData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distortion = this.getDistortionAtPoint(x, y, width, height);

        if (distortion) {
          const sourceX = Math.floor(distortion.x);
          const sourceY = Math.floor(distortion.y);

          if (
            sourceX >= 0 &&
            sourceX < width &&
            sourceY >= 0 &&
            sourceY < height
          ) {
            const sourceIndex = (sourceY * width + sourceX) * 4;
            const targetIndex = (y * width + x) * 4;

            // Apply thermal and ripple modulation
            const modulation = this.calculateModulation(distortion.intensity);

            target[targetIndex] = source[sourceIndex] * modulation; // R
            target[targetIndex + 1] = source[sourceIndex + 1] * modulation; // G
            target[targetIndex + 2] = source[sourceIndex + 2] * modulation; // B
            target[targetIndex + 3] = source[sourceIndex + 3]; // A
          }
        }
      }
    }
  }

  getDistortionAtPoint(x, y, width, height) {
    // Use lookup table for performance, interpolate for missing values
    const key = `${Math.floor(x / 4) * 4},${Math.floor(y / 4) * 4}`;
    let distortion = this.distortionLUT.get(key);

    if (!distortion) {
      // Calculate on demand for non-cached points
      distortion = this.calculateDistortion(x, y, width, height);
    }

    return distortion;
  }

  calculateModulation(intensity) {
    // Combine thermal and power ripple effects
    let modulation = this.geometryState.thermalFactor;

    // Power ripple affects brightness at screen edges more
    modulation += this.geometryState.powerRipple * intensity * 0.5;

    // Ensure reasonable bounds
    return Math.max(0.7, Math.min(1.3, modulation));
  }

  applyConvergenceErrors(imageData) {
    if (this.options.performanceLevel === 'LOW') {
      return;
    }

    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Apply RGB convergence misalignment
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;

        // Red convergence offset
        const redOffset = Math.floor(
          this.geometryState.convergenceOffset.r * width
        );
        if (x + redOffset >= 0 && x + redOffset < width) {
          const redIndex = (y * width + x + redOffset) * 4;
          data[index] = data[redIndex];
        }

        // Blue convergence offset
        const blueOffset = Math.floor(
          this.geometryState.convergenceOffset.b * height
        );
        if (y + blueOffset >= 0 && y + blueOffset < height) {
          const blueIndex = ((y + blueOffset) * width + x) * 4 + 2;
          data[index + 2] = data[blueIndex];
        }
      }
    }
  }

  applyRippleEffects(imageData) {
    if (this.options.performanceLevel === 'LOW') {
      return;
    }

    const rippleStrength = this.geometryState.powerRipple * 5;
    const data = imageData.data;

    // Apply subtle brightness ripple across entire screen
    for (let i = 0; i < data.length; i += 4) {
      const brightness = 1 + rippleStrength * 0.1;
      data[i] *= brightness; // R
      data[i + 1] *= brightness; // G
      data[i + 2] *= brightness; // B
    }
  }

  shouldThrottleUpdate() {
    switch (this.options.performanceLevel) {
      case 'LOW':
        return this.geometryState.frameCount % 4 !== 0;
      case 'MEDIUM':
        return this.geometryState.frameCount % 2 !== 0;
      case 'HIGH':
      default:
        return false;
    }
  }

  // Public API
  setPerformanceLevel(level) {
    this.options.performanceLevel = level;
    console.log(`CRT Geometry Engine performance set to: ${level}`);
  }

  setPincushionAmount(amount) {
    this.options.pincushionAmount = Math.max(0, Math.min(0.1, amount));
    this.setupGeometryTransforms(); // Rebuild lookup tables
  }

  setBarrelAmount(amount) {
    this.options.barrelAmount = Math.max(0, Math.min(0.05, amount));
    this.setupGeometryTransforms(); // Rebuild lookup tables
  }

  setRippleEffects(frequency, amplitude) {
    this.options.rippleFrequency = frequency;
    this.options.rippleAmplitude = Math.max(0, Math.min(0.01, amplitude));
  }

  getGeometryState() {
    return {
      ...this.geometryState,
      powerVoltage: this.powerSupply.voltage,
      thermalStabilized: this.thermalModel.stabilized,
      enabled: this.options.enabled
    };
  }

  reset() {
    this.geometryState = {
      time: 0,
      thermalFactor: 1.0,
      powerRipple: 0,
      convergenceOffset: { r: 0, g: 0, b: 0 },
      frameCount: 0
    };

    this.thermalModel.stabilized = false;
    console.log('CRT Geometry Engine reset');
  }

  destroy() {
    this.initialized = false;
    this.distortionLUT.clear();
    this.convergenceLUT.clear();
    this.geometryState = null;
    console.log('CRT Geometry Engine destroyed');
  }
}

/**
 * CRT Geometry Manager
 * Coordinates geometry effects with the main CRT system
 */
class CRTGeometryManager {
  constructor() {
    this.engines = new Map();
    this.globalSettings = {
      masterEnabled: true,
      performanceLevel: 'HIGH',
      adaptiveQuality: true
    };
  }

  registerCanvas(canvasId, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas not found: ${canvasId}`);
      return null;
    }

    const engine = new CRTGeometryEngine(canvas, {
      ...options,
      performanceLevel: this.globalSettings.performanceLevel
    });

    this.engines.set(canvasId, engine);
    console.log(`CRT Geometry Engine registered for canvas: ${canvasId}`);

    return engine;
  }

  updateAll() {
    if (!this.globalSettings.masterEnabled) {
      return;
    }

    this.engines.forEach((engine, canvasId) => {
      try {
        engine.updateGeometry();
      } catch (error) {
        console.error(`Geometry update failed for ${canvasId}:`, error);
      }
    });
  }

  setGlobalPerformance(level) {
    this.globalSettings.performanceLevel = level;
    this.engines.forEach(engine => {
      engine.setPerformanceLevel(level);
    });
    console.log(`Global geometry performance set to: ${level}`);
  }

  getSystemStatus() {
    const status = {
      enabled: this.globalSettings.masterEnabled,
      performanceLevel: this.globalSettings.performanceLevel,
      activeEngines: this.engines.size,
      engines: {}
    };

    this.engines.forEach((engine, canvasId) => {
      status.engines[canvasId] = engine.getGeometryState();
    });

    return status;
  }

  /*
   * Configure engine parameters from control panel
   */
  configure(parameters) {
    Object.keys(parameters).forEach(key => {
      switch (key) {
        case 'enabled':
          this.globalSettings.masterEnabled = parameters[key];
          break;
        case 'barrelDistortion':
          this.engines.forEach(engine =>
            engine.setBarrelAmount(parameters[key])
          );
          break;
        case 'pincushionH':
          this.engines.forEach(engine =>
            engine.setPincushionAmount(parameters[key])
          );
          break;
        case 'pincushionV':
          // Apply as keystone vertical effect
          this.engines.forEach(engine => {
            engine.options.keystoneV = parameters[key];
            engine.setupGeometryTransforms();
          });
          break;
        case 'cornerDistortion':
          this.engines.forEach(engine => {
            engine.options.keystoneH = parameters[key];
            engine.setupGeometryTransforms();
          });
          break;
        case 'thermalDrift':
          this.engines.forEach(engine => {
            engine.options.thermalDrift = parameters[key];
          });
          break;
        case 'powerRipple':
          this.engines.forEach(engine => {
            engine.setRippleEffects(60, parameters[key]);
          });
          break;
      }
      console.log(`[GeometryEngine] Set ${key} = ${parameters[key]}`);
    });

    // Apply geometry CSS variables for immediate visual feedback
    this.applyGeometryConfiguration();
  }

  /*
   * Get current configuration
   */
  getConfiguration() {
    const firstEngine = this.engines.values().next().value;
    return {
      enabled: this.globalSettings.masterEnabled,
      barrelDistortion: firstEngine?.options.barrelAmount || 0.008,
      pincushionH: firstEngine?.options.pincushionAmount || 0.015,
      pincushionV: firstEngine?.options.keystoneV || 0.003,
      cornerDistortion: firstEngine?.options.keystoneH || 0.005,
      thermalDrift: firstEngine?.options.thermalDrift || 0.0005,
      powerRipple: firstEngine?.options.rippleAmplitude || 0.002
    };
  }

  /*
   * Apply geometry configuration to CSS for immediate visual effects
   */
  applyGeometryConfiguration() {
    const config = this.getConfiguration();

    // Apply barrel distortion
    document.documentElement.style.setProperty(
      '--crt-barrel-distortion',
      config.barrelDistortion.toString()
    );

    // Apply pincushion effects
    document.documentElement.style.setProperty(
      '--crt-pincushion-h',
      config.pincushionH.toString()
    );
    document.documentElement.style.setProperty(
      '--crt-pincushion-v',
      config.pincushionV.toString()
    );

    // Apply corner distortion
    document.documentElement.style.setProperty(
      '--crt-corner-distortion',
      config.cornerDistortion.toString()
    );

    // Apply thermal drift
    document.documentElement.style.setProperty(
      '--crt-thermal-drift',
      config.thermalDrift.toString()
    );

    // Apply power ripple
    document.documentElement.style.setProperty(
      '--crt-power-ripple',
      config.powerRipple.toString()
    );

    // Enable/disable geometry effects
    document.documentElement.style.setProperty(
      '--crt-geometry-enabled',
      config.enabled ? '1' : '0'
    );

    console.log('[GeometryEngine] Configuration applied:', config);
  }

  reset() {
    this.engines.forEach(engine => engine.reset());
    console.log('All geometry engines reset');
  }

  destroy() {
    this.engines.forEach(engine => engine.destroy());
    this.engines.clear();
    console.log('CRT Geometry Manager destroyed');
  }
}

// Global instance
window.CRTGeometryManager =
  window.CRTGeometryManager || new CRTGeometryManager();

// Export for module systems
/* eslint-env node */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CRTGeometryEngine, CRTGeometryManager };
}
