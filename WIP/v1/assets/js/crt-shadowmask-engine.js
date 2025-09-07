/**
 * CRT Shadow Mask Engine
 * Simulates authentic CRT shadow mask effects including RGB phosphor dots,
 * aperture grille patterns, shadow mask hole alignment, and moiré effects
 */

class CRTShadowMaskEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      enabled: true,
      maskType: 'SHADOW_MASK', // SHADOW_MASK, APERTURE_GRILLE, SLOT_MASK
      dotPitch: 0.28, // mm - typical 14" CRT dot pitch
      dotSize: 0.85, // Phosphor dot size factor
      dotSpacing: 1.2, // Spacing between RGB triads
      brightness: 0.95, // Overall brightness factor
      contrast: 1.05, // Shadow mask contrast
      rgbAlignment: { r: 0, g: 0, b: 0.1 }, // RGB gun alignment
      bloomAmount: 0.15, // Phosphor bloom/glow
      persistenceFactor: 0.8, // Phosphor persistence
      moireIntensity: 0.1, // Moiré pattern strength
      viewingDistance: 24, // inches - affects visible detail
      performanceLevel: 'HIGH', // HIGH, MEDIUM, LOW
      ...options
    };

    this.maskState = {
      dotPattern: null,
      maskTexture: null,
      bloomBuffer: null,
      persistenceBuffer: null,
      moirePhase: 0,
      frameCount: 0,
      needsRebuild: true
    };

    this.phosphorDecay = {
      red: 0.999, // P22 red phosphor decay
      green: 0.995, // P22 green phosphor decay
      blue: 0.985 // P22 blue phosphor decay
    };

    this.initialized = false;
    this.init();
  }

  init() {
    try {
      this.calculateDotMetrics();
      this.generateShadowMask();
      this.setupPhosphorBuffers();
      this.initialized = true;
      console.log('CRT Shadow Mask Engine initialized');
    } catch (error) {
      console.error('Failed to initialize CRT Shadow Mask Engine:', error);
    }
  }

  calculateDotMetrics() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Calculate actual dot pitch in pixels based on viewing distance and DPI
    const assumedDPI = 96;
    const mmPerInch = 25.4;
    const pixelsPerMM = assumedDPI / mmPerInch;

    this.dotMetrics = {
      pitchPixels: this.options.dotPitch * pixelsPerMM,
      dotRadius:
        (this.options.dotPitch * pixelsPerMM * this.options.dotSize) / 2,
      triadWidth: this.options.dotPitch * pixelsPerMM * this.options.dotSpacing,
      horizontalTriads: Math.ceil(
        width / (this.options.dotPitch * pixelsPerMM * 3)
      ),
      verticalTriads: Math.ceil(
        height / (this.options.dotPitch * pixelsPerMM * 2)
      )
    };

    console.log('Shadow mask metrics:', this.dotMetrics);
  }

  generateShadowMask() {
    if (!this.dotMetrics) {
      return;
    }

    const { width, height } = this.canvas;
    const { pitchPixels, dotRadius, triadWidth } = this.dotMetrics;

    // Create off-screen canvas for mask generation
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');

    // Fill with black background
    maskCtx.fillStyle = '#000000';
    maskCtx.fillRect(0, 0, width, height);

    switch (this.options.maskType) {
      case 'SHADOW_MASK':
        this.generateTriadMask(maskCtx, width, height);
        break;
      case 'APERTURE_GRILLE':
        this.generateApertureGrille(maskCtx, width, height);
        break;
      case 'SLOT_MASK':
        this.generateSlotMask(maskCtx, width, height);
        break;
    }

    this.maskState.maskTexture = maskCanvas;
    this.maskState.needsRebuild = false;
  }

  generateTriadMask(ctx, width, height) {
    const { pitchPixels, dotRadius } = this.dotMetrics;
    const spacing = pitchPixels;

    for (let y = 0; y < height; y += spacing * 2) {
      for (let x = 0; x < width; x += spacing * 3) {
        const offset = (Math.floor(y / (spacing * 2)) % 2) * (spacing * 1.5);

        // Red phosphor dot
        this.drawPhosphorDot(ctx, x + offset, y, dotRadius, '#FF0000');

        // Green phosphor dot
        this.drawPhosphorDot(
          ctx,
          x + spacing + offset,
          y,
          dotRadius,
          '#00FF00'
        );

        // Blue phosphor dot
        this.drawPhosphorDot(
          ctx,
          x + spacing * 2 + offset,
          y,
          dotRadius,
          '#0000FF'
        );

        // Add slight vertical offset for next row
        if (y + spacing < height) {
          this.drawPhosphorDot(
            ctx,
            x + spacing * 0.5 + offset,
            y + spacing,
            dotRadius,
            '#FF0000'
          );
          this.drawPhosphorDot(
            ctx,
            x + spacing * 1.5 + offset,
            y + spacing,
            dotRadius,
            '#00FF00'
          );
          this.drawPhosphorDot(
            ctx,
            x + spacing * 2.5 + offset,
            y + spacing,
            dotRadius,
            '#0000FF'
          );
        }
      }
    }
  }

  generateApertureGrille(ctx, width, height) {
    const { pitchPixels } = this.dotMetrics;
    const stripeWidth = pitchPixels * 0.8;
    const stripeSpacing = pitchPixels;

    for (let x = 0; x < width; x += stripeSpacing * 3) {
      // Red stripe
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x, 0, stripeWidth, height);

      // Green stripe
      ctx.fillStyle = '#00FF00';
      ctx.fillRect(x + stripeSpacing, 0, stripeWidth, height);

      // Blue stripe
      ctx.fillStyle = '#0000FF';
      ctx.fillRect(x + stripeSpacing * 2, 0, stripeWidth, height);
    }

    // Add horizontal grille wires
    const wireSpacing = pitchPixels * 8;
    ctx.fillStyle = '#000000';
    for (let y = 0; y < height; y += wireSpacing) {
      ctx.fillRect(0, y, width, 1);
    }
  }

  generateSlotMask(ctx, width, height) {
    const { pitchPixels, dotRadius } = this.dotMetrics;
    const slotWidth = dotRadius * 2;
    const slotHeight = pitchPixels * 1.5;
    const spacing = pitchPixels;

    for (let y = 0; y < height; y += slotHeight + spacing) {
      for (let x = 0; x < width; x += spacing * 3) {
        // Red slot
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x, y, slotWidth, slotHeight);

        // Green slot
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x + spacing, y, slotWidth, slotHeight);

        // Blue slot
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(x + spacing * 2, y, slotWidth, slotHeight);
      }
    }
  }

  drawPhosphorDot(ctx, x, y, radius, color) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.7, color + '80'); // Semi-transparent
    gradient.addColorStop(1, color + '00'); // Fully transparent

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  setupPhosphorBuffers() {
    const { width, height } = this.canvas;

    // Create bloom buffer for phosphor glow
    const bloomCanvas = document.createElement('canvas');
    bloomCanvas.width = width;
    bloomCanvas.height = height;
    this.maskState.bloomBuffer = bloomCanvas;

    // Create persistence buffer for phosphor decay
    const persistenceCanvas = document.createElement('canvas');
    persistenceCanvas.width = width;
    persistenceCanvas.height = height;
    this.maskState.persistenceBuffer = persistenceCanvas;
  }

  updateShadowMask() {
    if (!this.initialized || !this.options.enabled) {
      return;
    }

    this.maskState.frameCount++;

    // Update moiré phase
    this.maskState.moirePhase += 0.01;

    // Rebuild mask if needed (resolution change, etc.)
    if (this.maskState.needsRebuild) {
      this.generateShadowMask();
    }

    // Apply performance throttling
    if (this.shouldThrottleUpdate()) {
      return;
    }

    this.applyShadowMaskEffect();
  }

  applyShadowMaskEffect() {
    if (!this.ctx || !this.maskState.maskTexture) {
      return;
    }

    const { width, height } = this.canvas;

    // Get current frame buffer
    const sourceData = this.ctx.getImageData(0, 0, width, height);

    // Apply phosphor persistence
    this.applyPhosphorPersistence(sourceData);

    // Apply shadow mask
    this.applyShadowMaskBlending(sourceData);

    // Apply phosphor bloom
    if (this.options.bloomAmount > 0) {
      this.applyPhosphorBloom(sourceData);
    }

    // Apply moiré effects
    if (this.options.moireIntensity > 0) {
      this.applyMoirePattern(sourceData);
    }

    // Put processed image back
    this.ctx.putImageData(sourceData, 0, 0);
  }

  applyPhosphorPersistence(imageData) {
    if (!this.maskState.persistenceBuffer) {
      return;
    }

    const persistenceCtx = this.maskState.persistenceBuffer.getContext('2d');
    const currentData = imageData.data;
    const persistenceData = persistenceCtx.getImageData(
      0,
      0,
      imageData.width,
      imageData.height
    ).data;

    // Combine current frame with decayed persistence buffer
    for (let i = 0; i < currentData.length; i += 4) {
      // Apply phosphor-specific decay rates
      const persistentR = persistenceData[i] * this.phosphorDecay.red;
      const persistentG = persistenceData[i + 1] * this.phosphorDecay.green;
      const persistentB = persistenceData[i + 2] * this.phosphorDecay.blue;

      // Take maximum of current and persistent values (phosphor behavior)
      currentData[i] = Math.max(currentData[i], persistentR);
      currentData[i + 1] = Math.max(currentData[i + 1], persistentG);
      currentData[i + 2] = Math.max(currentData[i + 2], persistentB);
    }

    // Store current frame in persistence buffer
    persistenceCtx.putImageData(imageData, 0, 0);
  }

  applyShadowMaskBlending(imageData) {
    if (!this.maskState.maskTexture) {
      return;
    }

    const maskCtx = this.maskState.maskTexture.getContext('2d');
    const maskData = maskCtx.getImageData(
      0,
      0,
      imageData.width,
      imageData.height
    ).data;
    const sourceData = imageData.data;

    for (let i = 0; i < sourceData.length; i += 4) {
      const maskR = maskData[i] / 255;
      const maskG = maskData[i + 1] / 255;
      const maskB = maskData[i + 2] / 255;

      // Apply RGB alignment offsets
      const offsetR = this.options.rgbAlignment.r;
      const offsetG = this.options.rgbAlignment.g;
      const offsetB = this.options.rgbAlignment.b;

      // Blend source with shadow mask
      sourceData[i] *= maskR * this.options.brightness; // Red
      sourceData[i + 1] *= maskG * this.options.brightness; // Green
      sourceData[i + 2] *= maskB * this.options.brightness; // Blue

      // Apply contrast adjustment
      sourceData[i] = this.applyContrast(sourceData[i], this.options.contrast);
      sourceData[i + 1] = this.applyContrast(
        sourceData[i + 1],
        this.options.contrast
      );
      sourceData[i + 2] = this.applyContrast(
        sourceData[i + 2],
        this.options.contrast
      );
    }
  }

  applyPhosphorBloom(imageData) {
    if (!this.maskState.bloomBuffer) {
      return;
    }

    const bloomCtx = this.maskState.bloomBuffer.getContext('2d');
    const sourceData = imageData.data;

    // Create bloom effect by blurring bright areas
    bloomCtx.filter = `blur(${this.options.bloomAmount * 2}px)`;
    bloomCtx.globalCompositeOperation = 'screen';
    bloomCtx.putImageData(imageData, 0, 0);

    // Blend bloom back into source
    const bloomData = bloomCtx.getImageData(
      0,
      0,
      imageData.width,
      imageData.height
    ).data;

    for (let i = 0; i < sourceData.length; i += 4) {
      const bloomIntensity = this.options.bloomAmount;
      sourceData[i] += bloomData[i] * bloomIntensity * 0.3; // Red bloom
      sourceData[i + 1] += bloomData[i + 1] * bloomIntensity * 0.3; // Green bloom
      sourceData[i + 2] += bloomData[i + 2] * bloomIntensity * 0.3; // Blue bloom

      // Clamp values
      sourceData[i] = Math.min(255, sourceData[i]);
      sourceData[i + 1] = Math.min(255, sourceData[i + 1]);
      sourceData[i + 2] = Math.min(255, sourceData[i + 2]);
    }
  }

  applyMoirePattern(imageData) {
    const data = imageData.data;
    const { width, height } = imageData;
    const moireFreq = this.options.moireIntensity;
    const phase = this.maskState.moirePhase;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;

        // Create interference pattern
        const moireX = Math.sin((x * 0.1 + phase) * moireFreq) * 0.1;
        const moireY = Math.sin((y * 0.1 + phase) * moireFreq) * 0.1;
        const moirePattern = (moireX + moireY) * 0.5 + 1;

        data[index] *= moirePattern; // Red
        data[index + 1] *= moirePattern; // Green
        data[index + 2] *= moirePattern; // Blue
      }
    }
  }

  applyContrast(value, contrast) {
    return Math.max(0, Math.min(255, (value - 128) * contrast + 128));
  }

  shouldThrottleUpdate() {
    switch (this.options.performanceLevel) {
      case 'LOW':
        return this.maskState.frameCount % 6 !== 0;
      case 'MEDIUM':
        return this.maskState.frameCount % 3 !== 0;
      case 'HIGH':
      default:
        return false;
    }
  }

  // Public API
  setPerformanceLevel(level) {
    this.options.performanceLevel = level;
    console.log(`CRT Shadow Mask Engine performance set to: ${level}`);
  }

  setMaskType(type) {
    if (['SHADOW_MASK', 'APERTURE_GRILLE', 'SLOT_MASK'].includes(type)) {
      this.options.maskType = type;
      this.maskState.needsRebuild = true;
      console.log(`Shadow mask type set to: ${type}`);
    }
  }

  setDotPitch(pitchMM) {
    this.options.dotPitch = Math.max(0.1, Math.min(2.0, pitchMM));
    this.calculateDotMetrics();
    this.maskState.needsRebuild = true;
  }

  setBloomAmount(amount) {
    this.options.bloomAmount = Math.max(0, Math.min(1, amount));
  }

  setMoireIntensity(intensity) {
    this.options.moireIntensity = Math.max(0, Math.min(1, intensity));
  }

  getMaskState() {
    return {
      maskType: this.options.maskType,
      dotPitch: this.options.dotPitch,
      dotMetrics: this.dotMetrics,
      enabled: this.options.enabled,
      frameCount: this.maskState.frameCount,
      needsRebuild: this.maskState.needsRebuild
    };
  }

  reset() {
    this.maskState.moirePhase = 0;
    this.maskState.frameCount = 0;
    this.maskState.needsRebuild = true;

    // Clear buffers
    if (this.maskState.bloomBuffer) {
      const ctx = this.maskState.bloomBuffer.getContext('2d');
      ctx.clearRect(
        0,
        0,
        this.maskState.bloomBuffer.width,
        this.maskState.bloomBuffer.height
      );
    }

    if (this.maskState.persistenceBuffer) {
      const ctx = this.maskState.persistenceBuffer.getContext('2d');
      ctx.clearRect(
        0,
        0,
        this.maskState.persistenceBuffer.width,
        this.maskState.persistenceBuffer.height
      );
    }

    console.log('CRT Shadow Mask Engine reset');
  }

  destroy() {
    this.initialized = false;
    this.maskState.maskTexture = null;
    this.maskState.bloomBuffer = null;
    this.maskState.persistenceBuffer = null;
    console.log('CRT Shadow Mask Engine destroyed');
  }
}

/**
 * CRT Shadow Mask Manager
 * Coordinates shadow mask effects with the main CRT system
 */
class CRTShadowMaskManager {
  constructor() {
    this.engines = new Map();
    this.globalSettings = {
      masterEnabled: true,
      performanceLevel: 'HIGH',
      defaultMaskType: 'SHADOW_MASK',
      adaptiveQuality: true
    };
  }

  registerCanvas(canvasId, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas not found: ${canvasId}`);
      return null;
    }

    const engine = new CRTShadowMaskEngine(canvas, {
      maskType: this.globalSettings.defaultMaskType,
      performanceLevel: this.globalSettings.performanceLevel,
      ...options
    });

    this.engines.set(canvasId, engine);
    console.log(`CRT Shadow Mask Engine registered for canvas: ${canvasId}`);

    return engine;
  }

  updateAll() {
    if (!this.globalSettings.masterEnabled) {
      return;
    }

    this.engines.forEach((engine, canvasId) => {
      try {
        engine.updateShadowMask();
      } catch (error) {
        console.error(`Shadow mask update failed for ${canvasId}:`, error);
      }
    });
  }

  setGlobalPerformance(level) {
    this.globalSettings.performanceLevel = level;
    this.engines.forEach(engine => {
      engine.setPerformanceLevel(level);
    });
    console.log(`Global shadow mask performance set to: ${level}`);
  }

  setGlobalMaskType(type) {
    this.globalSettings.defaultMaskType = type;
    this.engines.forEach(engine => {
      engine.setMaskType(type);
    });
    console.log(`Global shadow mask type set to: ${type}`);
  }

  getSystemStatus() {
    const status = {
      enabled: this.globalSettings.masterEnabled,
      performanceLevel: this.globalSettings.performanceLevel,
      defaultMaskType: this.globalSettings.defaultMaskType,
      activeEngines: this.engines.size,
      engines: {}
    };

    this.engines.forEach((engine, canvasId) => {
      status.engines[canvasId] = engine.getMaskState();
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
        case 'maskType':
          this.setGlobalMaskType(parameters[key]);
          break;
        case 'dotPitch':
          this.engines.forEach(engine => engine.setDotPitch(parameters[key]));
          break;
        case 'intensity':
          this.engines.forEach(engine => {
            engine.options.brightness = parameters[key];
          });
          break;
        case 'brightness':
          this.engines.forEach(engine => {
            engine.options.brightness = parameters[key];
          });
          break;
        case 'wearPattern':
          this.engines.forEach(engine => {
            engine.options.contrast = 1.0 - parameters[key] * 0.2;
          });
          break;
        case 'thermalExpansion':
          this.engines.forEach(engine => {
            engine.options.moireIntensity = parameters[key] * 0.5;
          });
          break;
      }
      console.log(`[ShadowMaskEngine] Set ${key} = ${parameters[key]}`);
    });

    // Apply shadow mask CSS variables for immediate visual feedback
    this.applyShadowMaskConfiguration();
  }

  /*
   * Get current configuration
   */
  getConfiguration() {
    const firstEngine = this.engines.values().next().value;
    return {
      enabled: this.globalSettings.masterEnabled,
      maskType: this.globalSettings.defaultMaskType,
      dotPitch: firstEngine?.options.dotPitch || 0.28,
      intensity: firstEngine?.options.brightness || 0.95,
      brightness: firstEngine?.options.brightness || 0.95,
      wearPattern: firstEngine
        ? (1.0 - firstEngine.options.contrast) / 0.2
        : 0.05,
      thermalExpansion: firstEngine
        ? firstEngine.options.moireIntensity / 0.5
        : 0.002
    };
  }

  /*
   * Apply shadow mask configuration to CSS for immediate visual effects
   */
  applyShadowMaskConfiguration() {
    const config = this.getConfiguration();

    // Apply mask type
    document.documentElement.style.setProperty(
      '--crt-mask-type',
      config.maskType.toLowerCase()
    );

    // Apply dot pitch
    document.documentElement.style.setProperty(
      '--crt-dot-pitch',
      `${config.dotPitch}mm`
    );

    // Apply intensity/brightness
    document.documentElement.style.setProperty(
      '--crt-mask-intensity',
      config.intensity.toString()
    );

    // Apply brightness
    document.documentElement.style.setProperty(
      '--crt-mask-brightness',
      config.brightness.toString()
    );

    // Apply wear pattern
    document.documentElement.style.setProperty(
      '--crt-mask-wear',
      config.wearPattern.toString()
    );

    // Apply thermal expansion
    document.documentElement.style.setProperty(
      '--crt-thermal-expansion',
      config.thermalExpansion.toString()
    );

    // Enable/disable shadow mask effects
    document.documentElement.style.setProperty(
      '--crt-mask-enabled',
      config.enabled ? '1' : '0'
    );

    console.log('[ShadowMaskEngine] Configuration applied:', config);
  }

  reset() {
    this.engines.forEach(engine => engine.reset());
    console.log('All shadow mask engines reset');
  }

  destroy() {
    this.engines.forEach(engine => engine.destroy());
    this.engines.clear();
    console.log('CRT Shadow Mask Manager destroyed');
  }
}

// Global instance
window.CRTShadowMaskManager =
  window.CRTShadowMaskManager || new CRTShadowMaskManager();

// Export for module systems
/* eslint-env node */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CRTShadowMaskEngine, CRTShadowMaskManager };
}
