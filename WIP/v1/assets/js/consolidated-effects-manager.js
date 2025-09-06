/**
 * Consolidated CRT/VHS Effect Manager
 * Optimized implementation of retro display effects with performance controls
 * Consolidates multiple effect layers to improve rendering efficiency
 */
(function() {
  'use strict';

  // Effect configuration
  const EFFECTS_CONFIG = {
    // Core CRT effects
    scanlines: {
      intensity: 0.7,         // 0-1 intensity of scanline effect
      animationDuration: 4000, // Duration of scanline animation in ms
      priorityLevel: 'high',  // Always enable this effect (essential)
      renderLayer: 'overlay', // Render on overlay layer
      cssVariables: {
        '--scanline-opacity': '0.7',
        '--scanline-size': '2px'
      }
    },
    phosphorPersistence: {
      intensity: 0.5,
      animationDuration: 300,
      priorityLevel: 'medium',
      renderLayer: 'content',
      cssVariables: {
        '--persistence-trail': '3',
        '--persistence-opacity': '0.5'
      }
    },
    barrelDistortion: {
      intensity: 0.6,
      animationDuration: 0,    // Static effect
      priorityLevel: 'low',    // Disable first when performance is low
      renderLayer: 'base',
      cssVariables: {
        '--barrel-strength': '0.6'
      }
    },
    rgbSeparation: {
      intensity: 0.4,
      animationDuration: 6000,
      priorityLevel: 'medium',
      renderLayer: 'overlay',
      cssVariables: {
        '--rgb-offset': '1.5px',
        '--rgb-opacity': '0.4'
      }
    },
    
    // VHS effects
    trackingErrors: {
      intensity: 0.5,
      animationDuration: 400,
      priorityLevel: 'low',
      renderLayer: 'overlay',
      randomTrigger: true,     // Randomly trigger this effect
      triggerProbability: 0.001, // Probability per frame
      cssVariables: {
        '--tracking-intensity': '0.5',
        '--tracking-speed': '400ms'
      }
    },
    chromaBleed: {
      intensity: 0.6,
      animationDuration: 8000,
      priorityLevel: 'medium',
      renderLayer: 'overlay',
      cssVariables: {
        '--chroma-spread': '1.2px',
        '--chroma-saturation': '1.1'
      }
    },
    vignette: {
      intensity: 0.8,
      animationDuration: 0,    // Static effect
      priorityLevel: 'high',
      renderLayer: 'overlay',
      cssVariables: {
        '--vignette-size': '120%',
        '--vignette-opacity': '0.8'
      }
    }
  };
  
  // Layer definitions for consolidated rendering
  const RENDER_LAYERS = {
    base: {
      zIndex: 1,
      blendMode: 'normal',
      selector: '.crt-base-layer',
      effects: []
    },
    content: {
      zIndex: 20,
      blendMode: 'normal',
      selector: '.crt-content-layer',
      effects: []
    },
    overlay: {
      zIndex: 30,
      blendMode: 'overlay',
      selector: '.crt-overlay-layer',
      effects: []
    },
    filter: {
      zIndex: 40,
      blendMode: 'screen',
      selector: '.crt-filter-layer',
      effects: []
    }
  };
  
  // Active effects state
  let effectsState = {
    active: {},           // Currently active effects
    pending: {},          // Effects queued to activate
    layers: {},           // DOM elements for each layer
    performanceLevel: 'high',  // Current performance level
    enabled: true,        // Master toggle for effects
    lastRenderTime: 0,    // Last render timestamp
    viewportVisible: true // Whether viewport is visible
  };
  
  // Initialize system
  function init() {
    // Create effect layers
    createEffectLayers();
    
    // Assign effects to layers
    assignEffectsToLayers();
    
    // Set up viewport visibility detection
    setupVisibilityDetection();
    
    // Initial render
    render();
    
    // Set up animation loop
    requestAnimationFrame(animationLoop);
    
    // Expose API
    window.CRTEffectsManager = {
      getState: () => ({...effectsState}),
      setPerformanceLevel: setPerformanceLevel,
      enableEffect: enableEffect,
      disableEffect: disableEffect,
      triggerRandomEffect: triggerRandomEffect,
      toggleEffects: toggleEffects
    };
    
    // Connect to performance monitor if available
    if (window.PerformanceMonitor) {
      // Update performance level when it changes
      setInterval(() => {
        const newLevel = window.PerformanceMonitor.getPerformanceLevel();
        if (newLevel !== effectsState.performanceLevel) {
          setPerformanceLevel(newLevel);
        }
      }, 2000);
    }
  }
  
  // Create DOM elements for effect layers
  function createEffectLayers() {
    Object.entries(RENDER_LAYERS).forEach(([layerName, layerConfig]) => {
      // Check if layer already exists
      let layer = document.querySelector(layerConfig.selector);
      
      // Create layer if it doesn't exist
      if (!layer) {
        layer = document.createElement('div');
        layer.className = layerConfig.selector.substring(1); // Remove leading .
        
        // Apply base styles
        Object.assign(layer.style, {
          position: 'fixed',
          inset: '0',
          zIndex: layerConfig.zIndex,
          pointerEvents: 'none',
          mixBlendMode: layerConfig.blendMode,
          willChange: 'opacity, transform',
          transform: 'translateZ(0)'
        });
        
        // Add to DOM
        document.body.appendChild(layer);
      }
      
      // Store reference
      effectsState.layers[layerName] = layer;
    });
  }
  
  // Assign effects to appropriate layers
  function assignEffectsToLayers() {
    Object.entries(EFFECTS_CONFIG).forEach(([effectName, effectConfig]) => {
      // Add effect to its layer
      const layerName = effectConfig.renderLayer;
      if (RENDER_LAYERS[layerName]) {
        RENDER_LAYERS[layerName].effects.push(effectName);
      }
    });
  }
  
  // Set up intersection observer to detect when effects are visible
  function setupVisibilityDetection() {
    const observer = new IntersectionObserver((entries) => {
      // Update visibility state
      effectsState.viewportVisible = entries[0].isIntersecting;
      
      // Pause/resume animations based on visibility
      Object.values(effectsState.layers).forEach(layer => {
        layer.style.animationPlayState = effectsState.viewportVisible ? 'running' : 'paused';
      });
    }, { threshold: 0.1 });
    
    // Observe the first layer (all have same dimensions)
    const firstLayer = Object.values(effectsState.layers)[0];
    if (firstLayer) {
      observer.observe(firstLayer);
    }
  }
  
  // Main animation loop
  function animationLoop(timestamp) {
    // Skip rendering if effects are disabled or not visible
    if (effectsState.enabled && effectsState.viewportVisible) {
      // Calculate time since last render
      const timeSinceLastRender = timestamp - effectsState.lastRenderTime;
      
      // Render at most once every 16ms (approx 60fps)
      if (timeSinceLastRender >= 16) {
        effectsState.lastRenderTime = timestamp;
        render();
        triggerRandomEffects();
      }
    }
    
    // Continue loop
    requestAnimationFrame(animationLoop);
  }
  
  // Render all effects
  function render() {
    // Apply CSS variables for active effects
    Object.entries(effectsState.active).forEach(([effectName, isActive]) => {
      if (isActive && EFFECTS_CONFIG[effectName]) {
        const config = EFFECTS_CONFIG[effectName];
        
        // Apply CSS variables
        Object.entries(config.cssVariables || {}).forEach(([varName, value]) => {
          document.documentElement.style.setProperty(varName, value);
        });
      }
    });
    
    // Update layer classes based on active effects
    Object.entries(RENDER_LAYERS).forEach(([layerName, layerConfig]) => {
      const layer = effectsState.layers[layerName];
      if (!layer) return;
      
      // Check which effects in this layer are active
      const activeEffects = layerConfig.effects.filter(
        effectName => effectsState.active[effectName]
      );
      
      // Set data attribute with active effects
      layer.setAttribute('data-active-effects', activeEffects.join(' '));
      
      // Toggle visibility of layer
      layer.style.display = activeEffects.length > 0 ? 'block' : 'none';
    });
  }
  
  // Randomly trigger effects based on probability
  function triggerRandomEffects() {
    if (!window.PerformanceMonitor?.canPlayEffect) return;
    
    // Check each effect with random trigger
    Object.entries(EFFECTS_CONFIG)
      .filter(([_, config]) => config.randomTrigger)
      .forEach(([effectName, config]) => {
        // Skip if already active or performance level too low
        if (effectsState.active[effectName]) return;
        if (shouldDisableForPerformance(config.priorityLevel)) return;
        
        // Random chance based on probability
        if (Math.random() < config.triggerProbability) {
          // Check with performance monitor if we can play an effect now
          if (window.PerformanceMonitor.canPlayEffect(config.priorityLevel)) {
            triggerTemporaryEffect(effectName, config.animationDuration);
          }
        }
      });
  }
  
  // Trigger a specific random effect
  function triggerRandomEffect(effectName) {
    if (!EFFECTS_CONFIG[effectName]) return false;
    const config = EFFECTS_CONFIG[effectName];
    
    // Skip if performance level too low
    if (shouldDisableForPerformance(config.priorityLevel)) return false;
    
    // Check with performance monitor if we can play an effect now
    if (!window.PerformanceMonitor?.canPlayEffect(config.priorityLevel)) {
      return false;
    }
    
    // Trigger the effect
    triggerTemporaryEffect(effectName, config.animationDuration);
    return true;
  }
  
  // Enable a temporary effect for a duration
  function triggerTemporaryEffect(effectName, duration) {
    if (!EFFECTS_CONFIG[effectName]) return;
    
    // Enable the effect
    enableEffect(effectName);
    
    // Disable after duration
    if (duration > 0) {
      setTimeout(() => {
        disableEffect(effectName);
      }, duration);
    }
  }
  
  // Enable an effect
  function enableEffect(effectName) {
    if (!EFFECTS_CONFIG[effectName]) return;
    
    // Skip if this effect should be disabled for performance
    if (shouldDisableForPerformance(EFFECTS_CONFIG[effectName].priorityLevel)) {
      return;
    }
    
    // Set as active
    effectsState.active[effectName] = true;
    
    // Add class to body
    document.body.classList.add(`effect-${effectName}`);
    
    // Update render
    render();
  }
  
  // Disable an effect
  function disableEffect(effectName) {
    if (!EFFECTS_CONFIG[effectName]) return;
    
    // Remove from active
    effectsState.active[effectName] = false;
    
    // Remove class from body
    document.body.classList.remove(`effect-${effectName}`);
    
    // Update render
    render();
  }
  
  // Set performance level and adjust effects
  function setPerformanceLevel(level) {
    // Store new level
    effectsState.performanceLevel = level;
    
    // Enable/disable effects based on priority and performance level
    Object.entries(EFFECTS_CONFIG).forEach(([effectName, config]) => {
      if (shouldDisableForPerformance(config.priorityLevel)) {
        disableEffect(effectName);
      } else {
        // Enable persistent effects (not random triggers)
        if (!config.randomTrigger) {
          enableEffect(effectName);
        }
      }
    });
  }
  
  // Check if an effect should be disabled based on performance
  function shouldDisableForPerformance(priorityLevel) {
    switch (effectsState.performanceLevel) {
      case 'low':
        return priorityLevel !== 'high';
      case 'medium':
        return priorityLevel === 'low';
      default:
        return false;
    }
  }
  
  // Toggle all effects on/off
  function toggleEffects(enabled) {
    if (enabled !== undefined) {
      effectsState.enabled = enabled;
    } else {
      effectsState.enabled = !effectsState.enabled;
    }
    
    // Show/hide all layers
    Object.values(effectsState.layers).forEach(layer => {
      layer.style.display = effectsState.enabled ? 'block' : 'none';
    });
    
    // Update body class
    if (effectsState.enabled) {
      document.body.classList.add('crt-effects-enabled');
      document.body.classList.remove('crt-effects-disabled');
    } else {
      document.body.classList.add('crt-effects-disabled');
      document.body.classList.remove('crt-effects-enabled');
    }
    
    return effectsState.enabled;
  }
  
  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
