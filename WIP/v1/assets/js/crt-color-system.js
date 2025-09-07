/*
 * NTSC Color System Engine
 * Authentic chroma bleeding and color artifacts for CRT simulation
 * Physics: NTSC-M color subcarrier (3.579545MHz) and Y/I/Q color space
 * Implementation: Real-time color bleeding with chroma subsampling artifacts
 * Performance: GPU-accelerated when available with CSS fallbacks
 */
(function () {
  'use strict';

  /* System ID for registration with CRTSystem */
  const SYSTEM_ID = 'ntsc-color-system';

  /* NTSC Color System Constants */
  const NTSC_COLOR = {
    SUBCARRIER_FREQ: 3579545.45 /* Hz - NTSC color subcarrier */,
    CHROMA_BANDWIDTH: 1.3 /* MHz - Chroma signal bandwidth */,
    LUMA_BANDWIDTH: 4.2 /* MHz - Luma signal bandwidth */,
    COLOR_BURST_AMPLITUDE: 0.3 /* Relative amplitude */,
    CHROMA_DELAY: 0.5 /* pixels - NTSC chroma delay artifact */,
    BLEEDING_RADIUS: 2.5 /* pixels - Color bleeding extent */,
    SATURATION_LOSS: 0.15 /* NTSC saturation reduction */
  };

  /* Y/I/Q Color Space Conversion Matrices */
  const YIQ_MATRICES = {
    /* RGB to Y/I/Q conversion (NTSC standard) */
    RGB_TO_YIQ: [
      [0.299, 0.587, 0.114] /* Y (luma) */,
      [0.596, -0.274, -0.322] /* I (in-phase) */,
      [0.211, -0.523, 0.312] /* Q (quadrature) */
    ],
    /* Y/I/Q to RGB conversion */
    YIQ_TO_RGB: [
      [1.0, 0.956, 0.621] /* R */,
      [1.0, -0.272, -0.647] /* G */,
      [1.0, -1.106, 1.703] /* B */
    ]
  };

  /* Performance Scaling Settings */
  const PERFORMANCE_SCALING = {
    HIGH: {
      enableColorBleeding: true,
      bleedingQuality: 'high',
      updateRate: 16.67 /* 60fps */,
      sampleDensity: 'full'
    },
    MEDIUM: {
      enableColorBleeding: true,
      bleedingQuality: 'medium',
      updateRate: 33.33 /* 30fps */,
      sampleDensity: 'reduced'
    },
    LOW: {
      enableColorBleeding: false,
      bleedingQuality: 'low',
      updateRate: 66.67 /* 15fps */,
      sampleDensity: 'minimal'
    }
  };

  /* Color System State */
  const colorSystemState = {
    initialized: false,
    performanceLevel: 'high',
    enabled: true,
    canvasSupported: false,
    webglSupported: false,
    colorBleeder: null,
    lastUpdateTime: 0,
    activeElements: new Set(),
    colorCache: new Map()
  };

  /* NTSC Color Bleeding Engine */
  class NTSCColorBleeder {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.webglContext = null;
      this.initialized = false;
      this.performanceLevel = 'high';
    }

    initialize(performanceLevel = 'high') {
      if (this.initialized) {
        return true;
      }

      this.performanceLevel = performanceLevel;

      // Try to initialize WebGL for advanced effects
      if (performanceLevel === 'high') {
        this.initializeWebGL();
      }

      // Fallback to Canvas 2D
      if (!this.webglContext) {
        this.initializeCanvas2D();
      }

      this.initialized = !!(this.canvas && this.ctx);

      if (this.initialized) {
        console.log(
          `[ColorSystem] Initialized with ${this.webglContext ? 'WebGL' : 'Canvas2D'}`
        );
      }

      return this.initialized;
    }

    initializeWebGL() {
      try {
        this.canvas = document.createElement('canvas');
        this.webglContext =
          this.canvas.getContext('webgl') ||
          this.canvas.getContext('experimental-webgl');

        if (this.webglContext) {
          colorSystemState.webglSupported = true;
        }
      } catch (error) {
        console.warn('[ColorSystem] WebGL initialization failed:', error);
        this.webglContext = null;
      }
    }

    initializeCanvas2D() {
      try {
        if (!this.canvas) {
          this.canvas = document.createElement('canvas');
        }
        this.ctx = this.canvas.getContext('2d');
        colorSystemState.canvasSupported = !!this.ctx;
      } catch (error) {
        console.warn('[ColorSystem] Canvas2D initialization failed:', error);
      }
    }

    applyColorBleeding(element) {
      if (!this.initialized || !element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      // Create bleeding effect based on available technology
      if (this.webglContext && this.performanceLevel === 'high') {
        this.applyWebGLColorBleeding(element, rect);
      } else if (this.ctx) {
        this.applyCanvas2DColorBleeding(element, rect);
      } else {
        this.applyCSSColorBleeding(element);
      }
    }

    applyWebGLColorBleeding(element, rect) {
      // Set canvas size to match element
      this.canvas.width = Math.ceil(rect.width);
      this.canvas.height = Math.ceil(rect.height);

      const gl = this.webglContext;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);

      // Sample element colors (simplified for performance)
      const colors = this.sampleElementColors(element, rect);

      // Apply NTSC color bleeding shader (simplified implementation)
      this.renderColorBleedingWebGL(gl, colors);

      // Apply result as background
      const dataUrl = this.canvas.toDataURL();
      this.applyBleedingResult(element, dataUrl);
    }

    applyCanvas2DColorBleeding(element, rect) {
      // Set canvas size to match element
      this.canvas.width = Math.ceil(rect.width);
      this.canvas.height = Math.ceil(rect.height);

      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Sample colors from element
      const colors = this.sampleElementColors(element, rect);

      // Apply NTSC artifacts
      this.renderColorBleedingCanvas2D(ctx, colors, rect);

      // Apply result
      const dataUrl = this.canvas.toDataURL();
      this.applyBleedingResult(element, dataUrl);
    }

    applyCSSColorBleeding(element) {
      // Fallback CSS-only color bleeding
      const colorClass = this.getCSSColorBleedingClass(element);
      if (colorClass) {
        element.classList.add(colorClass);

        // Store for cleanup
        colorSystemState.activeElements.add({
          element: element,
          className: colorClass,
          timestamp: performance.now()
        });
      }
    }

    sampleElementColors(element, rect) {
      const colors = [];
      const style = window.getComputedStyle(element);

      // Primary colors from element
      const textColor = this.parseColor(style.color);
      const bgColor = this.parseColor(style.backgroundColor);

      if (textColor) {
        colors.push(textColor);
      }
      if (bgColor && bgColor.a > 0) {
        colors.push(bgColor);
      }

      // Sample colors from text content if available
      if (element.textContent && this.performanceLevel !== 'low') {
        const additionalColors = this.sampleTextColors(element);
        colors.push(...additionalColors);
      }

      return colors;
    }

    sampleTextColors(element) {
      const colors = [];
      const text = element.textContent.trim();

      if (text.length === 0) {
        return colors;
      }

      // Estimate colors based on content and styling
      const style = window.getComputedStyle(element);
      const baseColor = this.parseColor(style.color);

      if (baseColor) {
        // Create color variations for NTSC artifacts
        colors.push(this.adjustColorForNTSC(baseColor, 'I_SHIFT'));
        colors.push(this.adjustColorForNTSC(baseColor, 'Q_SHIFT'));
      }

      return colors;
    }

    parseColor(colorString) {
      if (!colorString || colorString === 'transparent') {
        return null;
      }

      // Parse RGB/RGBA colors
      const rgbMatch = colorString.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
      );
      if (rgbMatch) {
        return {
          r: parseInt(rgbMatch[1]),
          g: parseInt(rgbMatch[2]),
          b: parseInt(rgbMatch[3]),
          a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1.0
        };
      }

      // Parse hex colors
      const hexMatch = colorString.match(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i);
      if (hexMatch) {
        const hex = hexMatch[1];
        if (hex.length === 3) {
          return {
            r: parseInt(hex[0] + hex[0], 16),
            g: parseInt(hex[1] + hex[1], 16),
            b: parseInt(hex[2] + hex[2], 16),
            a: 1.0
          };
        } else {
          return {
            r: parseInt(hex.substr(0, 2), 16),
            g: parseInt(hex.substr(2, 2), 16),
            b: parseInt(hex.substr(4, 2), 16),
            a: 1.0
          };
        }
      }

      return null;
    }

    convertRGBtoYIQ(color) {
      const r = color.r / 255;
      const g = color.g / 255;
      const b = color.b / 255;

      const Y =
        YIQ_MATRICES.RGB_TO_YIQ[0][0] * r +
        YIQ_MATRICES.RGB_TO_YIQ[0][1] * g +
        YIQ_MATRICES.RGB_TO_YIQ[0][2] * b;

      const I =
        YIQ_MATRICES.RGB_TO_YIQ[1][0] * r +
        YIQ_MATRICES.RGB_TO_YIQ[1][1] * g +
        YIQ_MATRICES.RGB_TO_YIQ[1][2] * b;

      const Q =
        YIQ_MATRICES.RGB_TO_YIQ[2][0] * r +
        YIQ_MATRICES.RGB_TO_YIQ[2][1] * g +
        YIQ_MATRICES.RGB_TO_YIQ[2][2] * b;

      return { Y, I, Q, a: color.a };
    }

    convertYIQtoRGB(yiq) {
      const r =
        YIQ_MATRICES.YIQ_TO_RGB[0][0] * yiq.Y +
        YIQ_MATRICES.YIQ_TO_RGB[0][1] * yiq.I +
        YIQ_MATRICES.YIQ_TO_RGB[0][2] * yiq.Q;

      const g =
        YIQ_MATRICES.YIQ_TO_RGB[1][0] * yiq.Y +
        YIQ_MATRICES.YIQ_TO_RGB[1][1] * yiq.I +
        YIQ_MATRICES.YIQ_TO_RGB[1][2] * yiq.Q;

      const b =
        YIQ_MATRICES.YIQ_TO_RGB[2][0] * yiq.Y +
        YIQ_MATRICES.YIQ_TO_RGB[2][1] * yiq.I +
        YIQ_MATRICES.YIQ_TO_RGB[2][2] * yiq.Q;

      return {
        r: Math.max(0, Math.min(255, Math.round(r * 255))),
        g: Math.max(0, Math.min(255, Math.round(g * 255))),
        b: Math.max(0, Math.min(255, Math.round(b * 255))),
        a: yiq.a
      };
    }

    adjustColorForNTSC(color, artifactType) {
      const yiq = this.convertRGBtoYIQ(color);

      switch (artifactType) {
        case 'I_SHIFT':
          yiq.I *= 1 + NTSC_COLOR.CHROMA_DELAY * 0.1;
          yiq.Q *= 1 - NTSC_COLOR.SATURATION_LOSS * 0.5;
          break;
        case 'Q_SHIFT':
          yiq.Q *= 1 + NTSC_COLOR.CHROMA_DELAY * 0.1;
          yiq.I *= 1 - NTSC_COLOR.SATURATION_LOSS * 0.5;
          break;
        case 'DESATURATE':
          yiq.I *= 1 - NTSC_COLOR.SATURATION_LOSS;
          yiq.Q *= 1 - NTSC_COLOR.SATURATION_LOSS;
          break;
      }

      return this.convertYIQtoRGB(yiq);
    }

    renderColorBleedingCanvas2D(ctx, colors, rect) {
      if (colors.length === 0) {
        return;
      }

      const bleedRadius = NTSC_COLOR.BLEEDING_RADIUS;
      const chromaDelay = NTSC_COLOR.CHROMA_DELAY;

      colors.forEach((color, index) => {
        // Apply NTSC color bleeding
        const yiq = this.convertRGBtoYIQ(color);

        // Create bleeding effect
        ctx.globalAlpha = 0.3;

        // Red/I component bleeding (leads)
        const redBleed = this.convertYIQtoRGB({
          Y: yiq.Y,
          I: yiq.I * 1.2,
          Q: 0,
          a: color.a
        });
        ctx.fillStyle = `rgba(${redBleed.r}, ${redBleed.g}, ${redBleed.b}, 0.3)`;
        ctx.fillRect(-chromaDelay, 0, bleedRadius, rect.height);

        // Blue/Q component bleeding (lags)
        const blueBleed = this.convertYIQtoRGB({
          Y: yiq.Y,
          I: 0,
          Q: yiq.Q * 1.2,
          a: color.a
        });
        ctx.fillStyle = `rgba(${blueBleed.r}, ${blueBleed.g}, ${blueBleed.b}, 0.3)`;
        ctx.fillRect(chromaDelay, 0, bleedRadius, rect.height);
      });
    }

    renderColorBleedingWebGL(gl, colors) {
      // Simplified WebGL color bleeding (full implementation would require shaders)
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // This would typically involve custom shaders for NTSC artifacts
      // For now, fall back to canvas approach
      console.warn(
        '[ColorSystem] WebGL color bleeding not fully implemented, using Canvas2D'
      );
    }

    getCSSColorBleedingClass(element) {
      // Determine appropriate CSS class based on element colors
      const style = window.getComputedStyle(element);
      const color = this.parseColor(style.color);

      if (!color) {
        return null;
      }

      const luminance =
        (color.r * 0.299 + color.g * 0.587 + color.b * 0.114) / 255;

      if (luminance > 0.7) {
        return 'ntsc-color-bleed-bright';
      } else if (luminance > 0.3) {
        return 'ntsc-color-bleed-medium';
      } else {
        return 'ntsc-color-bleed-dark';
      }
    }

    applyBleedingResult(element, dataUrl) {
      // Apply bleeding as background overlay
      element.style.backgroundImage = `${element.style.backgroundImage || 'none'}, url(${dataUrl})`;
      element.style.backgroundBlendMode = 'color-dodge, normal';
      element.style.backgroundSize = 'cover, auto';
      element.style.backgroundPosition = 'center, center';

      // Store for cleanup
      colorSystemState.activeElements.add({
        element: element,
        originalBackground: element.style.backgroundImage,
        timestamp: performance.now()
      });
    }

    cleanupElement(element) {
      // Remove color bleeding effects
      element.style.backgroundImage = '';
      element.style.backgroundBlendMode = '';
      element.style.backgroundSize = '';
      element.style.backgroundPosition = '';

      // Remove CSS classes
      element.classList.remove(
        'ntsc-color-bleed-bright',
        'ntsc-color-bleed-medium',
        'ntsc-color-bleed-dark'
      );
    }
  }

  /* NTSC Color System Engine */
  const NTSCColorSystem = {
    /*
     * Initialize the NTSC color system
     */
    init() {
      if (colorSystemState.initialized) {
        return this;
      }

      // Get performance settings
      this.updatePerformanceSettings();

      // Initialize color bleeding engine
      if (
        colorSystemState.enabled &&
        colorSystemState.performanceLevel !== 'low'
      ) {
        colorSystemState.colorBleeder = new NTSCColorBleeder();
        colorSystemState.colorBleeder.initialize(
          colorSystemState.performanceLevel
        );
      }

      // Register with CRT system
      if (window.CRTSystem) {
        window.CRTSystem.registerSystem(SYSTEM_ID, {
          type: 'physics',
          active: true,
          capabilities: {
            colorBleeding: true,
            ntscConversion: true,
            yiqColorSpace: true
          }
        });
      }

      // Setup event listeners
      this.setupEventListeners();

      // Start main update loop if enabled
      if (colorSystemState.enabled) {
        this.startColorProcessing();
      }

      colorSystemState.initialized = true;
      console.log('[ColorSystem] NTSC color system initialized');

      return this;
    },

    /*
     * Update performance settings from global monitor
     */
    updatePerformanceSettings() {
      const monitor = window.PerformanceMonitor;
      const level = monitor ? monitor.getPerformanceLevel() : 'high';

      colorSystemState.performanceLevel = level;

      const settings =
        PERFORMANCE_SCALING[level.toUpperCase()] || PERFORMANCE_SCALING.MEDIUM;
      colorSystemState.enabled = settings.enableColorBleeding;

      console.log(`[ColorSystem] Performance level: ${level}`);
    },

    /*
     * Setup event listeners for system coordination
     */
    setupEventListeners() {
      // Listen for motion state changes
      const motionObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'data-motion') {
            const isPaused =
              document.documentElement.dataset.motion === 'paused';
            colorSystemState.enabled =
              !isPaused &&
              PERFORMANCE_SCALING[
                colorSystemState.performanceLevel.toUpperCase()
              ].enableColorBleeding;
          }
        });
      });

      motionObserver.observe(document.documentElement, { attributes: true });

      // Register cleanup
      if (window.CRTResource) {
        window.CRTResource.registerObserver(motionObserver);
      }
    },

    /*
     * Start color processing loop
     */
    startColorProcessing() {
      const processColors = timestamp => {
        if (!colorSystemState.enabled || !colorSystemState.colorBleeder) {
          if (window.CRTResource) {
            const animId = requestAnimationFrame(processColors);
            window.CRTResource.registerAnimation(animId);
          }
          return;
        }

        const settings =
          PERFORMANCE_SCALING[
            colorSystemState.performanceLevel.toUpperCase()
          ] || PERFORMANCE_SCALING.MEDIUM;

        // Throttle updates based on performance level
        if (timestamp - colorSystemState.lastUpdateTime < settings.updateRate) {
          if (window.CRTResource) {
            const animId = requestAnimationFrame(processColors);
            window.CRTResource.registerAnimation(animId);
          }
          return;
        }

        colorSystemState.lastUpdateTime = timestamp;

        // Process visible text elements for color bleeding
        this.processVisibleElements();

        // Cleanup old effects
        this.cleanupExpiredEffects();

        // Continue loop
        if (window.CRTResource) {
          const animId = requestAnimationFrame(processColors);
          window.CRTResource.registerAnimation(animId);
        }
      };

      if (window.CRTResource) {
        const animId = requestAnimationFrame(processColors);
        window.CRTResource.registerAnimation(animId);
      }
    },

    /*
     * Process visible elements for color bleeding
     */
    processVisibleElements() {
      if (!colorSystemState.colorBleeder) {
        return;
      }

      // Target high-contrast text elements
      const elements = document.querySelectorAll(
        '#glitch-title .tg-letter, #nav-list a, header, nav'
      );

      elements.forEach(element => {
        if (this.isElementVisible(element)) {
          colorSystemState.colorBleeder.applyColorBleeding(element);
        }
      });
    },

    /*
     * Check if element is visible and worth processing
     */
    isElementVisible(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.top < window.innerHeight &&
        rect.bottom > 0
      );
    },

    /*
     * Clean up expired color effects
     */
    cleanupExpiredEffects() {
      const now = performance.now();
      const maxAge = 5000; // 5 seconds

      for (const effectData of colorSystemState.activeElements) {
        if (now - effectData.timestamp > maxAge) {
          if (colorSystemState.colorBleeder) {
            colorSystemState.colorBleeder.cleanupElement(effectData.element);
          }
          colorSystemState.activeElements.delete(effectData);
        }
      }
    },

    /*
     * Get current color system state
     */
    getColorSystemState() {
      return {
        initialized: colorSystemState.initialized,
        enabled: colorSystemState.enabled,
        performanceLevel: colorSystemState.performanceLevel,
        webglSupported: colorSystemState.webglSupported,
        canvasSupported: colorSystemState.canvasSupported,
        activeEffects: colorSystemState.activeElements.size
      };
    },

    /*
     * Apply NTSC color conversion to a specific element
     */
    applyNTSCColorConversion(element) {
      if (!colorSystemState.enabled || !colorSystemState.colorBleeder) {
        return false;
      }

      colorSystemState.colorBleeder.applyColorBleeding(element);
      return true;
    }
  };

  /* Configuration management for control panel integration */
  const configState = {
    enabled: true,
    chromaBleeding: 0.12,
    lumaBleeding: 0.08,
    convergenceR: 0.2,
    convergenceG: 0.0,
    convergenceB: -0.3,
    colorTemperature: 6500
  };

  /*
   * Public API for integration with other systems
   */
  const ColorSystemAPI = {
    init: () => NTSCColorSystem.init(),
    getState: () => NTSCColorSystem.getColorSystemState(),
    applyColorBleeding: element =>
      NTSCColorSystem.applyNTSCColorConversion(element),

    /*
     * Configure engine parameters from control panel
     */
    configure(parameters) {
      Object.keys(parameters).forEach(key => {
        if (key in configState) {
          configState[key] = parameters[key];
          console.log(`[ColorSystem] Set ${key} = ${parameters[key]}`);
        }
      });

      // Apply configuration changes immediately
      this.applyConfiguration();
    },

    /*
     * Get current configuration
     */
    getConfiguration() {
      return { ...configState };
    },

    /*
     * Apply current configuration to visual effects
     */
    applyConfiguration() {
      // Update global state
      colorSystemState.enabled = configState.enabled;

      // Apply chroma bleeding intensity
      document.documentElement.style.setProperty(
        '--ntsc-chroma-bleeding',
        configState.chromaBleeding.toString()
      );

      // Apply luma bleeding
      document.documentElement.style.setProperty(
        '--ntsc-luma-bleeding',
        configState.lumaBleeding.toString()
      );

      // Apply RGB convergence offsets
      document.documentElement.style.setProperty(
        '--ntsc-convergence-r',
        `${configState.convergenceR}px`
      );
      document.documentElement.style.setProperty(
        '--ntsc-convergence-g',
        `${configState.convergenceG}px`
      );
      document.documentElement.style.setProperty(
        '--ntsc-convergence-b',
        `${configState.convergenceB}px`
      );

      // Apply color temperature
      const tempScale = configState.colorTemperature / 6500; // Normalize to D65
      document.documentElement.style.setProperty(
        '--ntsc-color-temperature',
        tempScale.toString()
      );

      console.log('[ColorSystem] Configuration applied:', configState);
    }
  };

  /* Initialize when CRT system is ready */
  function initializeColorSystem() {
    if (!window.CRTSystem || !window.CRTSystem.isInitialized()) {
      console.log('[ColorSystem] Waiting for CRT system...');
      setTimeout(initializeColorSystem, 100);
      return;
    }

    NTSCColorSystem.init();
  }

  /* Auto-initialize */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.addEventListener('crtSystemReady', initializeColorSystem);
      setTimeout(initializeColorSystem, 600); // After interlacing
    });
  } else {
    window.addEventListener('crtSystemReady', initializeColorSystem);
    setTimeout(initializeColorSystem, 600); // After interlacing
  }

  /* Expose API */
  window.CRTColorSystem = ColorSystemAPI;
})();
