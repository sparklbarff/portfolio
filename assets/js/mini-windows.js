/*
 * Mini Windows System
 * Manages modal window overlays for navigation content
 * Implementation: Dynamic content loading with focus management
 * Accessibility: ARIA attributes, keyboard navigation, focus trap
 * Performance: Lazy loading, cleanup on close, memory management
 */
(function() {
  'use strict';
  
  const navLinks = document.querySelectorAll('#nav-list a');
  let activeMini = null;
  let lastFocusedElement = null;
  let focusableElements = [];
  
  /* Enhanced content caching system */
  const contentCache = new Map();
  const loadingPromises = new Map();
  const retryAttempts = new Map();
  
  /* Fallback content for when fetch fails */
  const fallbackContent = {
    about: `
      <style>
        .about{
          font-family: var(--font-ui, "JetBrains Mono", monospace);
          color: var(--fg, #e6e6e6);
        }
        .about h2{ margin:0 0 .6rem; font-size:1.05rem; letter-spacing:.04em; }
        .about p{ margin:0; line-height:1.45; }
      </style>
      <div class="about">
        <p>I design visuals and sound with a soft spot for CRT glow, tape wear, and signals that misbehave politely.</p>
      </div>
    `,
    contact: `
      <style>
        .contact{
          font-family: var(--font-ui, "JetBrains Mono", monospace);
          color: var(--fg, #e6e6e6);
        }
        .contact h2{ margin:0 0 .6rem; font-size:1.05rem; letter-spacing:.04em; }
        .contact p{ margin:0; line-height:1.45; }
      </style>
      <div class="contact">
        <h2>Contact</h2>
        <p>Get in touch for creative collaborations.</p>
      </div>
    `,
    portfolio: `
      <style>
        .portfolio{
          font-family: var(--font-ui, "JetBrains Mono", monospace);
          color: var(--fg, #e6e6e6);
        }
        .portfolio h2{ margin:0 0 .6rem; font-size:1.05rem; letter-spacing:.04em; }
        .portfolio p{ margin:0; line-height:1.45; }
      </style>
      <div class="portfolio">
        <h2>Portfolio</h2>
        <p>Selected works in visual design and sound.</p>
      </div>
    `
  };

  /* Cleanup registry for mini windows */
  const MiniCleanup = {
    timers: new Set(),
    elements: new Set(),
    listeners: new Map(),
    
    registerTimer(id) { 
      this.timers.add(id);
    },
    
    registerElement(el) { 
      this.elements.add(el);
    },
    
    registerListener(target, event, handler) {
      const key = `${target.constructor.name}-${event}`;
      if (!this.listeners.has(key)) this.listeners.set(key, []);
      this.listeners.get(key).push({ target, handler });
    },
    
    cleanupAll() {
      this.timers.forEach(id => clearTimeout(id));
      this.timers.clear();
      this.elements.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      this.elements.clear();
      this.listeners.forEach((handlers, key) => {
        handlers.forEach(({ target, handler }) => {
          const eventType = key.split('-')[1];
          target.removeEventListener(eventType, handler);
        });
      });
      this.listeners.clear();
      console.log('[Mini] Cleanup completed');
    }
  };
  
  const backdrop = document.createElement('div');
  backdrop.className = 'mini-backdrop';
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99;display:none;opacity:0;transition:opacity 0.3s ease';
  document.body.appendChild(backdrop);
  MiniCleanup.registerElement(backdrop);
  
  function init() {
    console.log('[Mini] Initializing mini windows system...');
    
    // Check if nav links exist
    if (navLinks.length === 0) {
      console.warn('[Mini] No navigation links found with #nav-list selector');
      return;
    }
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.substring(1);
        
        const clickHandler = function(e) {
          e.preventDefault();
          console.log(`[Mini] Opening mini window: ${id}`);
          openMini(id);
        };
        
        link.addEventListener('click', clickHandler);
        MiniCleanup.registerListener(link, 'click', clickHandler);
        console.log(`[Mini] Registered click handler for ${id}`);
      }
    });
    
    const keyHandler = function(e) {
      if (e.key === 'Escape' && activeMini) {
        console.log('[Mini] ESC key pressed, closing mini');
        closeMini();
      }
    };
    
    document.addEventListener('keydown', keyHandler);
    MiniCleanup.registerListener(document, 'keydown', keyHandler);
    
    // Use overlay for backdrop clicks
    const overlay = document.getElementById('mini-overlay');
    if (overlay) {
      const backdropHandler = (e) => {
        if (e.target === overlay) {
          console.log('[Mini] Backdrop clicked, closing mini');
          closeMini();
        }
      };
      overlay.addEventListener('click', backdropHandler);
      MiniCleanup.registerListener(overlay, 'click', backdropHandler);
      console.log('[Mini] Registered overlay backdrop handler');
    } else {
      console.warn('[Mini] mini-overlay element not found!');
    }
    
    const resizeHandler = () => {
      if (activeMini) positionMini(activeMini);
    };
    window.addEventListener('resize', resizeHandler);
    MiniCleanup.registerListener(window, 'resize', resizeHandler);
    
    // Add orientation change handler for mobile
    const orientationHandler = () => {
      // Delay to allow browser to adjust
      const orientationTimer = setTimeout(debouncedResize, 300);
      MiniCleanup.registerTimer(orientationTimer);
    };
    window.addEventListener('orientationchange', orientationHandler);
    MiniCleanup.registerListener(window, 'orientationchange', orientationHandler);
  }
  
  function openMini(id) {
    if (activeMini) {
      closeMini();
    }
    
    lastFocusedElement = document.activeElement;
    
    // Use the overlay container from HTML
    const overlay = document.getElementById('mini-overlay');
    if (!overlay) {
      console.error('[Mini] Overlay container not found!');
      return;
    }
    
    let mini = document.getElementById(`mini-${id}`);
    
    if (!mini) {
      mini = document.createElement('div');
      mini.id = `mini-${id}`;
      mini.className = 'mini';
      mini.setAttribute('role', 'dialog');
      mini.setAttribute('aria-labelledby', `mini-title-${id}`);
      mini.setAttribute('aria-modal', 'true');
      mini.style.opacity = '0';
      mini.style.transform = 'translateY(-20px)';
      mini.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      // Add flag to track initialization state
      mini.dataset.initialized = 'false';
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close';
      closeBtn.innerHTML = '&times;';
      closeBtn.setAttribute('aria-label', 'Close');
      
      const closeBtnHandler = () => closeMini();
      closeBtn.addEventListener('click', closeBtnHandler);
      MiniCleanup.registerListener(closeBtn, 'click', closeBtnHandler);
      
      const content = document.createElement('div');
      content.id = `mini-content-${id}`;
      
      mini.appendChild(closeBtn);
      mini.appendChild(content);
      overlay.appendChild(mini);  // Use overlay container instead of body
      MiniCleanup.registerElement(mini);
      
      loadContent(id, content);
    }
    
    // Show overlay and mini
    overlay.classList.add('active');
    mini.style.display = 'block';
    
    mini.offsetHeight;
    
    mini.style.opacity = '1';
    mini.style.transform = 'translateY(0)';
    
    activeMini = mini;
    positionMini(mini);
    
    const focusTimer = setTimeout(() => {
      const closeBtn = mini.querySelector('.close');
      if (closeBtn) closeBtn.focus();
      setupFocusTrap(mini);
    }, 50);
    MiniCleanup.registerTimer(focusTimer);
  }
  
  function loadContent(id, container) {
    console.log(`[Mini] Starting loadContent for ${id}`);
    
    // Check cache first
    if (contentCache.has(id)) {
      console.log(`[Mini] Loading from cache: ${id}`);
      container.innerHTML = contentCache.get(id);
      
      // Re-position after content loads from cache
      if (activeMini) {
        const repositionTimer = setTimeout(() => {
          positionMini(activeMini);
        }, 50);
        MiniCleanup.registerTimer(repositionTimer);
      }
      return Promise.resolve();
    }
    
    // Check if already loading
    if (loadingPromises.has(id)) {
      console.log(`[Mini] Already loading ${id}, waiting for existing promise`);
      return loadingPromises.get(id);
    }
    
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);">Loading...</div>';
    
    // Phase 1: Protocol Detection and Path Resolution
    const isFileProtocol = window.location.protocol === 'file:';
    const isHttpProtocol = window.location.protocol.startsWith('http');
    
    if (isFileProtocol) {
      console.warn('[Mini] File protocol detected - CORS will block fetch requests');
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p style="color: rgba(255,100,100,0.8); margin-bottom: 1rem;">
            ⚠️ File Protocol Detected
          </p>
          <p style="color: rgba(255,255,255,0.7); line-height: 1.5;">
            Please serve this site via HTTP server.<br>
            Run: <code style="background: rgba(0,0,0,0.3); padding: 0.2rem;">python3 -m http.server 8000</code><br>
            Then visit: <code style="background: rgba(0,0,0,0.3); padding: 0.2rem;">http://localhost:8000</code>
          </p>
        </div>
      `;
      return Promise.reject(new Error('File protocol not supported'));
    }
    
    // Enhanced loading with retry logic
    const maxRetries = 3;
    const currentRetries = retryAttempts.get(id) || 0;
    
    // Phase 1: Robust path resolution
    const contentPath = `assets/minis/${id}.html`;
    
    console.log(`[Mini] Protocol: ${window.location.protocol}`);
    console.log(`[Mini] Loading content from: ${contentPath} (attempt ${currentRetries + 1}/${maxRetries})`);
    console.log(`[Mini] Current window location: ${window.location.href}`);
    console.log(`[Mini] Full URL would be: ${new URL(contentPath, window.location.href).href}`);
    console.log(`[Mini] Container element:`, container);
    
    const loadPromise = fetch(contentPath)
      .then(response => {
        console.log(`[Mini] Response status: ${response.status} for ${contentPath}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        console.log(`[Mini] Fetch succeeded for ${id}`);
        return response.text();
      })
      .then(html => {
        console.log(`[Mini] Content loaded successfully for ${id}`);
        console.log(`[Mini] HTML content length: ${html.length} characters`);
        console.log(`[Mini] HTML preview:`, html.substring(0, 100) + '...');
        
        // Cache the content for future use
        contentCache.set(id, html);
        retryAttempts.delete(id); // Reset retry count on success
        
        container.innerHTML = html;
        console.log(`[Mini] Content inserted into container for ${id}`);
        
        try {
          // Re-execute scripts for dynamic content
          const scripts = container.querySelectorAll('script');
          scripts.forEach(script => {
            const newScript = document.createElement('script');
            
            Array.from(script.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
            
            newScript.textContent = script.textContent;
            script.parentNode.replaceChild(newScript, script);
          });
          
          // Re-position after content loads
          if (activeMini) {
            console.log(`[Mini] Scheduling repositioning for ${id}`);
            const repositionTimer = setTimeout(() => {
              console.log(`[Mini] Executing repositioning for ${id}`);
              positionMini(activeMini);
              console.log(`[Mini] Repositioning completed for ${id}`);
            }, 100);
            MiniCleanup.registerTimer(repositionTimer);
          }
        } catch (error) {
          console.error('[Mini] Script execution error:', error);
        }
        
        console.log(`[Mini] Promise chain completed successfully for ${id}`);
      })
      .catch(error => {
        console.error('[Mini] Primary fetch failed:', error);
        
        // Increment retry counter
        retryAttempts.set(id, currentRetries + 1);
        
        // If we haven't exceeded max retries, try again
        if (currentRetries < maxRetries - 1) {
          console.log(`[Mini] Retrying in 1 second... (${currentRetries + 1}/${maxRetries})`);
          return new Promise(resolve => {
            setTimeout(() => {
              loadingPromises.delete(id); // Clear the promise so we can retry
              resolve(loadContent(id, container));
            }, 1000);
          });
        }
        
        console.log('[Mini] Attempting fallback path resolution...');
        
        // Try fallback path (absolute from root)
        const fallbackPath = `/assets/minis/${id}.html`;
        console.log(`[Mini] Trying fallback: ${fallbackPath}`);
        
        return fetch(fallbackPath)
          .then(response => {
            console.log(`[Mini] Fallback response status: ${response.status} for ${id}`);
            if (!response.ok) {
              throw new Error(`Fallback failed: HTTP ${response.status}`);
            }
            console.log(`[Mini] Fallback succeeded for ${id}`);
            return response.text();
          })
          .then(html => {
            console.log(`[Mini] Fallback content loaded for ${id}`);
            
            // Cache the fallback content
            contentCache.set(id, html);
            retryAttempts.delete(id);
            
            container.innerHTML = html;
            
            // Re-position after fallback content loads
            if (activeMini) {
              const repositionTimer = setTimeout(() => {
                positionMini(activeMini);
              }, 100);
              MiniCleanup.registerTimer(repositionTimer);
            }
          })
          .catch(fallbackError => {
            console.error('[Mini] All fetch attempts failed:', fallbackError);
            console.log(`[Mini] Using built-in fallback content for ${id}`);
            retryAttempts.delete(id); // Reset for next time
            
            // Use built-in fallback content
            const staticContent = fallbackContent[id];
            if (staticContent) {
              container.innerHTML = staticContent;
              contentCache.set(id, staticContent);
              console.log(`[Mini] Loaded static fallback content for ${id}`);
              
              // Re-position after static content loads
              if (activeMini) {
                const repositionTimer = setTimeout(() => {
                  positionMini(activeMini);
                }, 100);
                MiniCleanup.registerTimer(repositionTimer);
              }
            } else {
              // Final fallback with helpful error
              container.innerHTML = `
                <div style="text-align: center; padding: 2rem; font-family: var(--font-ui, monospace);">
                  <p style="color: rgba(255,100,100,0.8); margin-bottom: 1rem;">
                    ⚠️ Content Unavailable
                  </p>
                  <p style="color: rgba(255,255,255,0.6); margin-bottom: 1rem;">
                    Unable to load ${id} content
                  </p>
                  <p style="color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-bottom: 1rem;">
                    This may happen when:<br>
                    • Files are accessed via file:// protocol<br>
                    • Network connectivity issues<br>
                    • Missing content files
                  </p>
                  <button onclick="location.reload()" 
                          style="margin-top: 1rem; padding: 0.5rem 1rem; 
                                 background: rgba(0,255,200,0.2); border: 1px solid rgba(0,255,200,0.4);
                                 color: #fff; border-radius: 4px; cursor: pointer; font-family: inherit;">
                    Reload Page
                  </button>
                </div>
              `;
            }
          });
      });
      
    // Store the promise for deduplication
    loadingPromises.set(id, loadPromise);
    
    // Clean up the promise when it completes
    loadPromise.finally(() => {
      loadingPromises.delete(id);
    });
    
    return loadPromise;
  }
  
  // Simplified positioning for flexbox-centered overlay
  function positionMini(mini) {
    // With flexbox centering, we just need to set max dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const padding = Math.min(viewportWidth * 0.05, 30);
    const maxWidth = Math.min(viewportWidth - (padding * 2), 1200);
    const maxHeight = viewportHeight - (padding * 2);
    
    mini.style.maxWidth = `${maxWidth}px`;
    mini.style.maxHeight = `${maxHeight}px`;
    mini.style.width = 'auto';
    mini.style.height = 'auto';
    
    // Mark as initialized
    mini.dataset.initialized = 'true';
    
    console.log(`[Mini] Positioned with max dimensions ${maxWidth}x${maxHeight}`);
  }

  // Debounced resize handler for better performance
  let resizeTimeout;
  const debouncedResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (activeMini) {
        positionMini(activeMini);
      }
    }, 100); // 100ms debounce
    MiniCleanup.registerTimer(resizeTimeout);
  };

  function setupFocusTrap(mini) {
    focusableElements = mini.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      const trapHandler = (e) => trapFocus(e);
      mini.addEventListener('keydown', trapHandler);
      MiniCleanup.registerListener(mini, 'keydown', trapHandler);
    }
  }
  
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    
    const firstFocusableEl = focusableElements[0];
    const lastFocusableEl = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus();
        e.preventDefault();
      }
    }
  }
  
  function closeMini() {
    if (activeMini) {
      const overlay = document.getElementById('mini-overlay');
      
      activeMini.style.opacity = '0';
      activeMini.style.transform = 'translateY(-20px)';
      
      const closeTimer = setTimeout(() => {
        activeMini.style.display = 'none';
        if (overlay) {
          overlay.classList.remove('active');
        }
        
        if (lastFocusedElement) {
          lastFocusedElement.focus();
        }
        
        activeMini = null;
      }, 300);
      MiniCleanup.registerTimer(closeTimer);
    }
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Cleanup on page unload
  const cleanupHandler = () => {
    try {
      MiniCleanup.cleanupAll();
    } catch (error) {
      console.error('[Mini] Cleanup failed:', error);
    }
  };
  window.addEventListener('beforeunload', cleanupHandler);
  window.addEventListener('pagehide', cleanupHandler);
  
  // Public API
  window.miniWindows = {
    open: openMini,
    close: closeMini
  };
})();
