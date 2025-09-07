/*
 * CRT Resource Management System
 * Centralized tracking and cleanup of timers, DOM elements, and event listeners
 * Implementation: Registry-based resource tracking with consistent cleanup API
 * Performance: Optimized cleanup to prevent memory leaks and resource consumption
 */
(function() {
  'use strict';

  /* Early initialization for immediate access */
  window.CRTResource = {};

  /* Resource registries with enhanced metadata */
  const resourceRegistries = {
    timers: new Map(), // setTimeout IDs
    intervals: new Map(), // setInterval IDs
    animations: new Map(), // requestAnimationFrame IDs
    elements: new Map(), // DOM elements
    listeners: new Map(), // Event listeners
    observers: new Set(), // MutationObservers and other observers
    workers: new Set(), // Web workers
    streams: new Set(), // Media streams
    contexts: new Set() // Canvas contexts and other contexts
  };

  /* Statistics for tracking and diagnostics */
  const statistics = {
    registered: {
      timers: 0,
      intervals: 0,
      animations: 0,
      elements: 0,
      listeners: 0,
      observers: 0,
      workers: 0,
      streams: 0,
      contexts: 0
    },
    cleaned: {
      timers: 0,
      intervals: 0,
      animations: 0,
      elements: 0,
      listeners: 0,
      observers: 0,
      workers: 0,
      streams: 0,
      contexts: 0
    },
    errors: {
      timers: 0,
      intervals: 0,
      animations: 0,
      elements: 0,
      listeners: 0,
      observers: 0,
      workers: 0,
      streams: 0,
      contexts: 0
    }
  };

  /* Error handling and logging */
  const errorHandlers = {
    default: (error, type, id, metadata) => {
      console.error(
        `[CRTResource] Error cleaning up ${type}:`,
        error,
        metadata
      );
      statistics.errors[type]++;
    }
  };

  /* Resource API implementation */
  const CRTResource = {
    /*
     * Register a timer for tracking and automatic cleanup
     */
    registerTimer(id, metadata = {}) {
      if (id === undefined || id === null) {
        return;
      }

      resourceRegistries.timers.set(id, {
        id,
        createdAt: Date.now(),
        createdBy: metadata.createdBy || 'unknown',
        purpose: metadata.purpose || 'unknown',
        ...metadata
      });

      statistics.registered.timers++;
      return id;
    },

    /*
     * Register an interval for tracking and automatic cleanup
     */
    registerInterval(id, metadata = {}) {
      if (id === undefined || id === null) {
        return;
      }

      resourceRegistries.intervals.set(id, {
        id,
        createdAt: Date.now(),
        createdBy: metadata.createdBy || 'unknown',
        purpose: metadata.purpose || 'unknown',
        ...metadata
      });

      statistics.registered.intervals++;
      return id;
    },

    /*
     * Register an animation frame ID for tracking and automatic cleanup
     */
    registerAnimation(id, metadata = {}) {
      if (id === undefined || id === null) {
        return;
      }

      resourceRegistries.animations.set(id, {
        id,
        createdAt: Date.now(),
        createdBy: metadata.createdBy || 'unknown',
        purpose: metadata.purpose || 'unknown',
        ...metadata
      });

      statistics.registered.animations++;
      return id;
    },

    /*
     * Register a DOM element for tracking and automatic cleanup
     */
    registerElement(element, metadata = {}) {
      if (!element || !element.nodeType) {
        return;
      }

      // Generate a unique ID if the element doesn't have one
      const id =
        element.id ||
        `crt-el-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      resourceRegistries.elements.set(id, {
        element,
        createdAt: Date.now(),
        createdBy: metadata.createdBy || 'unknown',
        purpose: metadata.purpose || 'unknown',
        ...metadata
      });

      statistics.registered.elements++;
      return element;
    },

    /*
     * Register an event listener for tracking and automatic cleanup
     */
    registerListener(target, event, handler, options = {}, metadata = {}) {
      if (!target || !event || !handler) {
        return;
      }

      // Generate a unique ID for this listener
      const id = `${target.constructor.name}-${event}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      resourceRegistries.listeners.set(id, {
        target,
        event,
        handler,
        options,
        createdAt: Date.now(),
        createdBy: metadata.createdBy || 'unknown',
        purpose: metadata.purpose || 'unknown',
        ...metadata
      });

      statistics.registered.listeners++;
      return id;
    },

    /*
     * Register an observer (MutationObserver, etc.) for tracking and automatic cleanup
     */
    registerObserver(observer, metadata = {}) {
      if (!observer) {
        return;
      }

      resourceRegistries.observers.add({
        observer,
        createdAt: Date.now(),
        createdBy: metadata.createdBy || 'unknown',
        purpose: metadata.purpose || 'unknown',
        ...metadata
      });

      statistics.registered.observers++;
      return observer;
    },

    /*
     * Register a worker for tracking and automatic cleanup
     */
    registerWorker(worker, metadata = {}) {
      if (!worker) {
        return;
      }

      resourceRegistries.workers.add({
        worker,
        createdAt: Date.now(),
        createdBy: metadata.createdBy || 'unknown',
        purpose: metadata.purpose || 'unknown',
        ...metadata
      });

      statistics.registered.workers++;
      return worker;
    },

    /*
     * Register a media stream for tracking and automatic cleanup
     */
    registerStream(stream, metadata = {}) {
      if (!stream) {
        return;
      }

      resourceRegistries.streams.add({
        stream,
        createdAt: Date.now(),
        createdBy: metadata.createdBy || 'unknown',
        purpose: metadata.purpose || 'unknown',
        ...metadata
      });

      statistics.registered.streams++;
      return stream;
    },

    /*
     * Register a context (canvas context, etc.) for tracking and automatic cleanup
     */
    registerContext(context, metadata = {}) {
      if (!context) {
        return;
      }

      resourceRegistries.contexts.add({
        context,
        createdAt: Date.now(),
        createdBy: metadata.createdBy || 'unknown',
        purpose: metadata.purpose || 'unknown',
        ...metadata
      });

      statistics.registered.contexts++;
      return context;
    },

    /*
     * Clean up all registered resources
     */
    cleanupAll() {
      this.cleanupTimers();
      this.cleanupIntervals();
      this.cleanupAnimations();
      this.cleanupElements();
      this.cleanupListeners();
      this.cleanupObservers();
      this.cleanupWorkers();
      this.cleanupStreams();
      this.cleanupContexts();

      console.log('[CRTResource] All resources cleaned up successfully');
      return true;
    },

    /*
     * Clean up all registered timers
     */
    cleanupTimers() {
      try {
        for (const [id, metadata] of resourceRegistries.timers.entries()) {
          try {
            clearTimeout(id);
            statistics.cleaned.timers++;
          } catch (error) {
            errorHandlers.default(error, 'timers', id, metadata);
          }
        }
        resourceRegistries.timers.clear();
        return true;
      } catch (error) {
        console.error('[CRTResource] Error cleaning up timers:', error);
        return false;
      }
    },

    /*
     * Clean up all registered intervals
     */
    cleanupIntervals() {
      try {
        for (const [id, metadata] of resourceRegistries.intervals.entries()) {
          try {
            clearInterval(id);
            statistics.cleaned.intervals++;
          } catch (error) {
            errorHandlers.default(error, 'intervals', id, metadata);
          }
        }
        resourceRegistries.intervals.clear();
        return true;
      } catch (error) {
        console.error('[CRTResource] Error cleaning up intervals:', error);
        return false;
      }
    },

    /*
     * Clean up all registered animation frames
     */
    cleanupAnimations() {
      try {
        for (const [id, metadata] of resourceRegistries.animations.entries()) {
          try {
            cancelAnimationFrame(id);
            statistics.cleaned.animations++;
          } catch (error) {
            errorHandlers.default(error, 'animations', id, metadata);
          }
        }
        resourceRegistries.animations.clear();
        return true;
      } catch (error) {
        console.error('[CRTResource] Error cleaning up animations:', error);
        return false;
      }
    },

    /*
     * Clean up all registered DOM elements
     */
    cleanupElements() {
      try {
        for (const [id, data] of resourceRegistries.elements.entries()) {
          try {
            const { element } = data;
            if (element && element.parentNode) {
              element.parentNode.removeChild(element);
              statistics.cleaned.elements++;
            }
          } catch (error) {
            errorHandlers.default(error, 'elements', id, data);
          }
        }
        resourceRegistries.elements.clear();
        return true;
      } catch (error) {
        console.error('[CRTResource] Error cleaning up elements:', error);
        return false;
      }
    },

    /*
     * Clean up all registered event listeners
     */
    cleanupListeners() {
      try {
        for (const [id, data] of resourceRegistries.listeners.entries()) {
          try {
            const { target, event, handler, options } = data;
            if (target && typeof target.removeEventListener === 'function') {
              target.removeEventListener(event, handler, options);
              statistics.cleaned.listeners++;
            }
          } catch (error) {
            errorHandlers.default(error, 'listeners', id, data);
          }
        }
        resourceRegistries.listeners.clear();
        return true;
      } catch (error) {
        console.error('[CRTResource] Error cleaning up listeners:', error);
        return false;
      }
    },

    /*
     * Clean up all registered observers
     */
    cleanupObservers() {
      try {
        for (const data of resourceRegistries.observers) {
          try {
            const { observer } = data;
            if (observer && typeof observer.disconnect === 'function') {
              observer.disconnect();
              statistics.cleaned.observers++;
            }
          } catch (error) {
            errorHandlers.default(error, 'observers', null, data);
          }
        }
        resourceRegistries.observers.clear();
        return true;
      } catch (error) {
        console.error('[CRTResource] Error cleaning up observers:', error);
        return false;
      }
    },

    /*
     * Clean up all registered workers
     */
    cleanupWorkers() {
      try {
        for (const data of resourceRegistries.workers) {
          try {
            const { worker } = data;
            if (worker && typeof worker.terminate === 'function') {
              worker.terminate();
              statistics.cleaned.workers++;
            }
          } catch (error) {
            errorHandlers.default(error, 'workers', null, data);
          }
        }
        resourceRegistries.workers.clear();
        return true;
      } catch (error) {
        console.error('[CRTResource] Error cleaning up workers:', error);
        return false;
      }
    },

    /*
     * Clean up all registered media streams
     */
    cleanupStreams() {
      try {
        for (const data of resourceRegistries.streams) {
          try {
            const { stream } = data;
            if (stream && typeof stream.getTracks === 'function') {
              stream.getTracks().forEach(track => track.stop());
              statistics.cleaned.streams++;
            }
          } catch (error) {
            errorHandlers.default(error, 'streams', null, data);
          }
        }
        resourceRegistries.streams.clear();
        return true;
      } catch (error) {
        console.error('[CRTResource] Error cleaning up streams:', error);
        return false;
      }
    },

    /*
     * Clean up all registered contexts
     */
    cleanupContexts() {
      try {
        for (const data of resourceRegistries.contexts) {
          try {
            const { context } = data;
            // For WebGL contexts, call loseContext
            if (
              context &&
              (context instanceof WebGLRenderingContext ||
                context instanceof WebGL2RenderingContext) &&
              typeof context.getExtension === 'function'
            ) {
              const ext = context.getExtension('WEBGL_lose_context');
              if (ext) {
                ext.loseContext();
              }
            }
            statistics.cleaned.contexts++;
          } catch (error) {
            errorHandlers.default(error, 'contexts', null, data);
          }
        }
        resourceRegistries.contexts.clear();
        return true;
      } catch (error) {
        console.error('[CRTResource] Error cleaning up contexts:', error);
        return false;
      }
    },

    /*
     * Set a custom error handler for resource cleanup
     */
    setErrorHandler(type, handler) {
      if (typeof handler !== 'function') {
        console.error('[CRTResource] Error handler must be a function');
        return false;
      }

      errorHandlers[type] = handler;
      return true;
    },

    /*
     * Reset error handlers to defaults
     */
    resetErrorHandlers() {
      for (const type in errorHandlers) {
        if (type !== 'default') {
          delete errorHandlers[type];
        }
      }
      return true;
    },

    /*
     * Get statistics about registered and cleaned resources
     */
    getStatistics() {
      return {
        registered: { ...statistics.registered },
        cleaned: { ...statistics.cleaned },
        errors: { ...statistics.errors },
        active: {
          timers: resourceRegistries.timers.size,
          intervals: resourceRegistries.intervals.size,
          animations: resourceRegistries.animations.size,
          elements: resourceRegistries.elements.size,
          listeners: resourceRegistries.listeners.size,
          observers: resourceRegistries.observers.size,
          workers: resourceRegistries.workers.size,
          streams: resourceRegistries.streams.size,
          contexts: resourceRegistries.contexts.size
        }
      };
    },

    /*
     * Utility: Create and register a timeout in one call
     */
    setTimeout(callback, delay, metadata = {}) {
      const id = setTimeout(callback, delay);
      return this.registerTimer(id, metadata);
    },

    /*
     * Utility: Create and register an interval in one call
     */
    setInterval(callback, delay, metadata = {}) {
      const id = setInterval(callback, delay);
      return this.registerInterval(id, metadata);
    },

    /*
     * Utility: Create and register an animation frame in one call
     */
    requestAnimationFrame(callback, metadata = {}) {
      const id = requestAnimationFrame(callback);
      return this.registerAnimation(id, metadata);
    },

    /*
     * Utility: Add and register an event listener in one call
     */
    addEventListener(target, event, handler, options = {}, metadata = {}) {
      if (!target || !event || !handler) {
        return;
      }

      target.addEventListener(event, handler, options);
      return this.registerListener(target, event, handler, options, metadata);
    },

    /*
     * Utility: Create and register a DOM element in one call
     */
    createElement(tagName, attributes = {}, parent = null, metadata = {}) {
      const element = document.createElement(tagName);

      // Apply attributes
      for (const [key, value] of Object.entries(attributes)) {
        if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value);
        } else if (key === 'className') {
          element.className = value;
        } else if (key === 'dataset' && typeof value === 'object') {
          Object.assign(element.dataset, value);
        } else {
          element.setAttribute(key, value);
        }
      }

      // Append to parent if provided
      if (parent && parent.appendChild) {
        parent.appendChild(element);
      }

      return this.registerElement(element, metadata);
    }
  };

  // Register cleanup event listeners
  function setupCleanupEvents() {
    const cleanupHandler = () => {
      try {
        CRTResource.cleanupAll();
      } catch (error) {
        console.error('[CRTResource] Cleanup on unload failed:', error);
      }
    };

    window.addEventListener('beforeunload', cleanupHandler);
    window.addEventListener('pagehide', cleanupHandler);

    // Auto-register these listeners
    CRTResource.registerListener(window, 'beforeunload', cleanupHandler);
    CRTResource.registerListener(window, 'pagehide', cleanupHandler);
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCleanupEvents);
  } else {
    setupCleanupEvents();
  }

  // Assign API to global reference
  window.CRTResource = CRTResource;
})();
