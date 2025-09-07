/*
 * NTSC Interlacing Engine
 * Authentic CRT field separation and motion artifact simulation
 * Physics: NTSC-M standard (59.94Hz field rate, 262.5 lines per field)
 * Implementation: Hardware-accurate field switching with motion detection
 * Performance: Optimized for 60fps with adaptive quality scaling
 */
(function () {
  'use strict';

  /* System ID for registration with CRTSystem */
  const SYSTEM_ID = 'interlacing-engine';

  /* NTSC Interlacing Constants (SMPTE-170M Standard) */
  const NTSC_INTERLACING = {
    FIELD_RATE: 59.94 /* Hz - NTSC field rate */,
    FIELD_DURATION: 16.683 /* ms - Duration of one field */,
    LINES_PER_FIELD: 262.5 /* Lines in each field */,
    TOTAL_LINES: 525 /* Total scanlines per frame */,
    VISIBLE_LINES: 486 /* Visible scanlines */,
    VISIBLE_LINES_PER_FIELD: 243 /* Visible lines per field */,
    LINE_TIME: 63.555 /* microseconds per horizontal line */,
    VERTICAL_BLANKING: 21 /* Lines of vertical blanking */
  };

  /* Motion Detection Thresholds */
  const MOTION_DETECTION = {
    VELOCITY_THRESHOLD: 50 /* pixels/second minimum for artifacts */,
    COMBING_STRENGTH_MAX: 0.8 /* Maximum combing artifact intensity */,
    DETECTION_INTERVAL: 33.367 /* ms - Detection update rate (30fps) */,
    MOTION_HISTORY_SIZE: 3 /* Frames to track for motion analysis */
  };

  /* Performance Scaling */
  const PERFORMANCE_SCALING = {
    HIGH: {
      enableMotionDetection: true,
      combingQuality: 'high',
      updateRate: 16.683 /* 60fps field updates */
    },
    MEDIUM: {
      enableMotionDetection: true,
      combingQuality: 'medium',
      updateRate: 33.367 /* 30fps field updates */
    },
    LOW: {
      enableMotionDetection: false,
      combingQuality: 'low',
      updateRate: 66.733 /* 15fps field updates */
    }
  };

  /* Interlacing Engine State */
  const interlacingState = {
    initialized: false,
    currentField: 'odd' /* 'odd' | 'even' */,
    fieldStartTime: 0,
    fieldProgress: 0,
    currentLine: 0,
    frameCount: 0,
    motionDetector: null,
    performanceLevel: 'high',
    enabled: true,
    lastUpdateTime: 0
  };

  /* Motion Detection System */
  class MotionDetector {
    constructor() {
      this.motionHistory = [];
      this.samplePoints = [];
      this.lastSampleTime = 0;
      this.initialized = false;
    }

    initialize() {
      if (this.initialized) {
        return;
      }

      // Create sample points grid across viewport
      const gridSize = interlacingState.performanceLevel === 'high' ? 20 : 10;
      const stepX = window.innerWidth / gridSize;
      const stepY = window.innerHeight / gridSize;

      for (let y = stepY; y < window.innerHeight; y += stepY) {
        for (let x = stepX; x < window.innerWidth; x += stepX) {
          this.samplePoints.push({
            x: Math.floor(x),
            y: Math.floor(y),
            lastColor: null,
            velocity: 0,
            motionStrength: 0
          });
        }
      }

      this.initialized = true;
      console.log(
        `[InterlacingEngine] Motion detector initialized with ${this.samplePoints.length} sample points`
      );
    }

    detectMotion() {
      if (!this.initialized || interlacingState.performanceLevel === 'low') {
        return [];
      }

      const now = performance.now();
      if (now - this.lastSampleTime < MOTION_DETECTION.DETECTION_INTERVAL) {
        return this.getActiveMotionAreas();
      }

      this.lastSampleTime = now;
      const motionAreas = [];

      // Sample colors at each point
      this.samplePoints.forEach(point => {
        try {
          const element = document.elementFromPoint(point.x, point.y);
          if (!element) {
            return;
          }

          const currentColor = this.sampleElementColor(
            element,
            point.x,
            point.y
          );

          if (point.lastColor) {
            const colorDifference = this.calculateColorDifference(
              currentColor,
              point.lastColor
            );

            // Estimate velocity based on color change
            const timeDelta = MOTION_DETECTION.DETECTION_INTERVAL / 1000;
            point.velocity = colorDifference / timeDelta;

            if (point.velocity > MOTION_DETECTION.VELOCITY_THRESHOLD) {
              point.motionStrength = Math.min(
                point.velocity / 200,
                MOTION_DETECTION.COMBING_STRENGTH_MAX
              );

              motionAreas.push({
                x: point.x,
                y: point.y,
                velocity: point.velocity,
                strength: point.motionStrength,
                element: element
              });
            } else {
              point.motionStrength *= 0.8; // Decay motion strength
            }
          }

          point.lastColor = currentColor;
        } catch (error) {
          // Silent error handling for robustness
        }
      });

      // Store motion history
      this.motionHistory.push({
        timestamp: now,
        areas: motionAreas
      });

      // Limit history size
      if (this.motionHistory.length > MOTION_DETECTION.MOTION_HISTORY_SIZE) {
        this.motionHistory.shift();
      }

      return motionAreas;
    }

    sampleElementColor(element, x, y) {
      const style = window.getComputedStyle(element);
      const color = style.color || style.backgroundColor || 'rgb(0,0,0)';

      // Parse RGB values
      const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        return {
          r: parseInt(rgbMatch[1]),
          g: parseInt(rgbMatch[2]),
          b: parseInt(rgbMatch[3])
        };
      }

      return { r: 0, g: 0, b: 0 };
    }

    calculateColorDifference(color1, color2) {
      // Euclidean distance in RGB space
      const dr = color1.r - color2.r;
      const dg = color1.g - color2.g;
      const db = color1.b - color2.b;
      return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    getActiveMotionAreas() {
      if (this.motionHistory.length === 0) {
        return [];
      }

      const latestMotion = this.motionHistory[this.motionHistory.length - 1];
      return latestMotion.areas.filter(area => area.strength > 0.1);
    }
  }

  /* NTSC Interlacing Engine */
  const NTSCInterlacingEngine = {
    /*
     * Initialize the interlacing engine
     */
    init() {
      if (interlacingState.initialized) {
        return this;
      }

      // Initialize motion detector
      interlacingState.motionDetector = new MotionDetector();
      interlacingState.motionDetector.initialize();

      // Get performance settings
      this.updatePerformanceSettings();

      // Start field timing
      interlacingState.fieldStartTime = performance.now();

      // Register with CRT system
      if (window.CRTSystem) {
        window.CRTSystem.registerSystem(SYSTEM_ID, {
          type: 'physics',
          active: true,
          capabilities: {
            interlacing: true,
            motionDetection: true,
            fieldSeparation: true
          }
        });
      }

      // Setup event listeners
      this.setupEventListeners();

      // Start main update loop
      this.startUpdateLoop();

      interlacingState.initialized = true;
      console.log('[InterlacingEngine] Initialized with NTSC timing');

      return this;
    },

    /*
     * Update performance settings from global monitor
     */
    updatePerformanceSettings() {
      const monitor = window.PerformanceMonitor;
      const level = monitor ? monitor.getPerformanceLevel() : 'high';

      interlacingState.performanceLevel = level;

      // Update motion detector if needed
      if (
        interlacingState.motionDetector &&
        !interlacingState.motionDetector.initialized
      ) {
        interlacingState.motionDetector.initialize();
      }

      console.log(`[InterlacingEngine] Performance level: ${level}`);
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
            interlacingState.enabled = !isPaused;
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
     * Start the main interlacing update loop
     */
    startUpdateLoop() {
      const updateInterlacing = timestamp => {
        if (!interlacingState.enabled) {
          if (window.CRTResource) {
            const animId = requestAnimationFrame(updateInterlacing);
            window.CRTResource.registerAnimation(animId);
          }
          return;
        }

        this.updateFieldTiming(timestamp);
        this.detectAndApplyMotionArtifacts();

        // Continue loop
        if (window.CRTResource) {
          const animId = requestAnimationFrame(updateInterlacing);
          window.CRTResource.registerAnimation(animId);
        }
      };

      if (window.CRTResource) {
        const animId = requestAnimationFrame(updateInterlacing);
        window.CRTResource.registerAnimation(animId);
      }
    },

    /*
     * Update NTSC field timing
     */
    updateFieldTiming(timestamp) {
      const settings =
        PERFORMANCE_SCALING[interlacingState.performanceLevel.toUpperCase()] ||
        PERFORMANCE_SCALING.MEDIUM;

      // Throttle updates based on performance level
      if (timestamp - interlacingState.lastUpdateTime < settings.updateRate) {
        return;
      }

      interlacingState.lastUpdateTime = timestamp;

      // Calculate field progress (0-1 across one field)
      const timeSinceFieldStart = timestamp - interlacingState.fieldStartTime;
      interlacingState.fieldProgress =
        timeSinceFieldStart / NTSC_INTERLACING.FIELD_DURATION;

      // Switch fields when complete
      if (interlacingState.fieldProgress >= 1.0) {
        this.switchField();
        interlacingState.fieldStartTime = timestamp;
        interlacingState.fieldProgress = 0;
        interlacingState.frameCount++;
      }

      // Calculate current scanline within field
      interlacingState.currentLine = Math.floor(
        interlacingState.fieldProgress *
          NTSC_INTERLACING.VISIBLE_LINES_PER_FIELD
      );

      // Apply field separation effects
      this.applyFieldSeparation();
    },

    /*
     * Switch between odd and even fields
     */
    switchField() {
      interlacingState.currentField =
        interlacingState.currentField === 'odd' ? 'even' : 'odd';

      // Broadcast field switch for other systems
      if (window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('ntscFieldSwitch', {
            detail: {
              field: interlacingState.currentField,
              frameCount: interlacingState.frameCount,
              timestamp: performance.now()
            }
          })
        );
      }

      console.log(
        `[InterlacingEngine] Field switch: ${interlacingState.currentField} (frame ${interlacingState.frameCount})`
      );
    },

    /*
     * Apply field separation effects to DOM
     */
    applyFieldSeparation() {
      document.documentElement.setAttribute(
        'data-interlace-field',
        interlacingState.currentField
      );

      // Apply subtle field offset for authenticity
      const fieldOffset = interlacingState.currentField === 'odd' ? 0.5 : -0.5;
      document.documentElement.style.setProperty(
        '--interlace-field-offset',
        `${fieldOffset}px`
      );
    },

    /*
     * Detect motion and apply interlacing artifacts
     */
    detectAndApplyMotionArtifacts() {
      if (
        !interlacingState.motionDetector ||
        interlacingState.performanceLevel === 'low'
      ) {
        return;
      }

      const motionAreas = interlacingState.motionDetector.detectMotion();

      motionAreas.forEach(area => {
        this.applyMotionCombingEffect(area);
      });
    },

    /*
     * Apply authentic interlacing combing effect to moving areas
     */
    applyMotionCombingEffect(area) {
      if (!area.element) {
        return;
      }

      const combingStrength = area.strength;
      const field = interlacingState.currentField;

      // Create CSS class for combing effect
      const combingClass = `interlace-combing-${field}-${this.getCombingLevel(combingStrength)}`;

      // Apply combing effect
      area.element.classList.add(combingClass);
      area.element.classList.add('interlace-motion-artifact');

      // Set CSS custom properties for fine control
      area.element.style.setProperty(
        '--combing-strength',
        combingStrength.toString()
      );
      area.element.style.setProperty(
        '--combing-field',
        field === 'odd' ? '1' : '-1'
      );

      // Remove effect after field duration
      const cleanupTimer = setTimeout(() => {
        area.element.classList.remove(combingClass);
        area.element.classList.remove('interlace-motion-artifact');
        area.element.style.removeProperty('--combing-strength');
        area.element.style.removeProperty('--combing-field');
      }, NTSC_INTERLACING.FIELD_DURATION * 1.2); // Slightly longer for overlap

      // Register cleanup
      if (window.CRTResource) {
        window.CRTResource.registerTimer(cleanupTimer);
      }
    },

    /*
     * Get combing effect level based on strength
     */
    getCombingLevel(strength) {
      if (strength < 0.2) {
        return 'subtle';
      }
      if (strength < 0.5) {
        return 'medium';
      }
      return 'strong';
    },

    /*
     * Get current interlacing state for external systems
     */
    getInterlacingState() {
      return {
        currentField: interlacingState.currentField,
        fieldProgress: interlacingState.fieldProgress,
        currentLine: interlacingState.currentLine,
        frameCount: interlacingState.frameCount,
        motionAreas: interlacingState.motionDetector
          ? interlacingState.motionDetector.getActiveMotionAreas().length
          : 0
      };
    },

    /*
     * Get NTSC timing information
     */
    getNTSCTiming() {
      return {
        fieldRate: NTSC_INTERLACING.FIELD_RATE,
        fieldDuration: NTSC_INTERLACING.FIELD_DURATION,
        linesPerField: NTSC_INTERLACING.LINES_PER_FIELD,
        currentLine: interlacingState.currentLine,
        fieldProgress: interlacingState.fieldProgress
      };
    },

    /*
     * Force a field switch (for testing)
     */
    forceFieldSwitch() {
      this.switchField();
      interlacingState.fieldStartTime = performance.now();
      interlacingState.fieldProgress = 0;
    }
  };

  /*
   * Configuration management for control panel integration
   */
  const configState = {
    enabled: true,
    intensity: 0.7,
    fieldOffset: 0.5,
    jitterAmount: 0.002,
    fieldBlending: 0.85,
    vsyncTiming: 15.734
  };

  /*
   * Public API for integration with other systems
   */
  const InterlacingAPI = {
    init: () => NTSCInterlacingEngine.init(),
    getState: () => NTSCInterlacingEngine.getInterlacingState(),
    getTiming: () => NTSCInterlacingEngine.getNTSCTiming(),
    forceFieldSwitch: () => NTSCInterlacingEngine.forceFieldSwitch(),

    /*
     * Configure engine parameters from control panel
     */
    configure(parameters) {
      Object.keys(parameters).forEach(key => {
        if (key in configState) {
          configState[key] = parameters[key];
          console.log(`[InterlacingEngine] Set ${key} = ${parameters[key]}`);
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
      interlacingState.enabled = configState.enabled;

      // Apply intensity to CSS
      document.documentElement.style.setProperty(
        '--interlace-intensity',
        configState.intensity.toString()
      );

      // Apply field offset
      document.documentElement.style.setProperty(
        '--interlace-field-offset-base',
        `${configState.fieldOffset}px`
      );

      // Apply thermal jitter
      document.documentElement.style.setProperty(
        '--interlace-thermal-jitter',
        configState.jitterAmount.toString()
      );

      // Apply field blending
      document.documentElement.style.setProperty(
        '--interlace-field-blending',
        configState.fieldBlending.toString()
      );

      // Apply vsync timing (affects field rate)
      if (
        Math.abs(configState.vsyncTiming - NTSC_INTERLACING.FIELD_RATE / 1000) >
        0.001
      ) {
        // Adjust field timing based on sync frequency
        const timingAdjustment =
          configState.vsyncTiming / (NTSC_INTERLACING.FIELD_RATE / 1000);
        document.documentElement.style.setProperty(
          '--interlace-timing-adjustment',
          timingAdjustment.toString()
        );
      }

      console.log('[InterlacingEngine] Configuration applied:', configState);
    }
  };

  /* Initialize when CRT system is ready */
  function initializeInterlacing() {
    if (!window.CRTSystem || !window.CRTSystem.isInitialized()) {
      console.log('[InterlacingEngine] Waiting for CRT system...');
      setTimeout(initializeInterlacing, 100);
      return;
    }

    NTSCInterlacingEngine.init();
  }

  /* Auto-initialize */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.addEventListener('crtSystemReady', initializeInterlacing);
      setTimeout(initializeInterlacing, 500); // Fallback
    });
  } else {
    window.addEventListener('crtSystemReady', initializeInterlacing);
    setTimeout(initializeInterlacing, 500); // Fallback
  }

  /* Expose API */
  window.CRTInterlacing = InterlacingAPI;
})();
