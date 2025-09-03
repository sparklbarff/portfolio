/*
 * Mini Windows System
 * Manages modal window overlays for navigation content
 * Implementation: Dynamic content loading with focus management
 * Accessibility: ARIA attributes, keyboard navigation, focus trapping
 * Performance: Lazy loading, cleanup on close, memory management
 */
(function() {
  'use strict';
  
  const navLinks = document.querySelectorAll('#nav-list a');
  let activeMini = null;
  let lastFocusedElement = null;
  let focusableElements = [];

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
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.substring(1);
        
        const clickHandler = function(e) {
          e.preventDefault();
          openMini(id);
        };
        
        link.addEventListener('click', clickHandler);
        MiniCleanup.registerListener(link, 'click', clickHandler);
      }
    });
    
    const keyHandler = function(e) {
      if (e.key === 'Escape' && activeMini) {
        closeMini();
      }
    };
    
    document.addEventListener('keydown', keyHandler);
    MiniCleanup.registerListener(document, 'keydown', keyHandler);
    
    const backdropHandler = () => closeMini();
    backdrop.addEventListener('click', backdropHandler);
    MiniCleanup.registerListener(backdrop, 'click', backdropHandler);
    
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
      document.body.appendChild(mini);
      MiniCleanup.registerElement(mini);
      
      loadContent(id, content);
    }
    
    mini.style.display = 'block';
    backdrop.style.display = 'block';
    
    mini.offsetHeight;
    
    mini.style.opacity = '1';
    mini.style.transform = 'translateY(0)';
    backdrop.style.opacity = '1';
    
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
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);">Loading...</div>';
    
    // Enhanced path resolution
    const basePath = window.location.pathname.includes('/assets/') ? '../..' : '.';
    const contentPath = `${basePath}/assets/minis/${id}.html`;
    
    console.log(`[Mini] Loading content from: ${contentPath}`);
    
    fetch(contentPath)
      .then(response => {
        console.log(`[Mini] Response status: ${response.status} for ${id}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load ${id}`);
        }
        return response.text();
      })
      .then(html => {
        console.log(`[Mini] Content loaded successfully for ${id}`);
        container.innerHTML = html;
        
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
          const repositionTimer = setTimeout(() => {
            positionMini(activeMini);
          }, 100);
          MiniCleanup.registerTimer(repositionTimer);
        }
      })
      .catch(error => {
        console.error('[Mini] Content load failed:', error);
        container.innerHTML = `
          <div style="text-align: center; padding: 2rem;">
            <p style="color: rgba(255,100,100,0.8); margin-bottom: 1rem;">
              Failed to load ${id} content
            </p>
            <p style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">
              ${error.message}
            </p>
            <button onclick="location.reload()" 
                    style="margin-top: 1rem; padding: 0.5rem 1rem; 
                           background: rgba(0,255,200,0.2); border: 1px solid rgba(0,255,200,0.4);
                           color: #fff; border-radius: 4px; cursor: pointer;">
              Reload Page
            </button>
          </div>
        `;
      });
  }
  
  // Enhanced positioning with better mobile support
  function positionMini(mini) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    /* Calculate footer height for clearance */
    const footer = document.querySelector('footer');
    const footerHeight = footer ? footer.offsetHeight : 60;
    
    /* Calculate optimal position with footer clearance */
    const padding = Math.min(viewportWidth * 0.05, 30);
    const maxWidth = Math.min(viewportWidth - (padding * 2), 1200);
    const maxHeight = viewportHeight - (padding * 2) - footerHeight;
    
    /* Apply constraints */
    mini.style.maxWidth = `${maxWidth}px`;
    mini.style.maxHeight = `${maxHeight}px`;
    
    /* Force reflow to get accurate dimensions */
    mini.style.width = 'auto';
    mini.style.height = 'auto';
    void mini.offsetWidth;
    
    const rect = mini.getBoundingClientRect();
    
    /* Center with constraints and footer clearance */
    let left = Math.max(padding, (viewportWidth - rect.width) / 2);
    let top = Math.max(padding, (viewportHeight - rect.height - footerHeight) / 2);
    
    /* Ensure doesn't exceed bounds */
    left = Math.min(left, viewportWidth - rect.width - padding);
    top = Math.min(top, viewportHeight - rect.height - footerHeight - padding);
    
    /* Apply safe area adjustments */
    const safeAreaTop = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--safe-area-inset-top') || '0');
    
    if (safeAreaTop > 0) top = Math.max(top, safeAreaTop + padding);
    
    /* Apply positioning */
    mini.style.left = `${Math.round(left)}px`;
    mini.style.top = `${Math.round(top)}px`;
    
    console.log(`[Mini] Positioned at ${Math.round(left)}x${Math.round(top)}, size ${Math.round(rect.width)}x${Math.round(rect.height)}`);
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
      activeMini.style.opacity = '0';
      activeMini.style.transform = 'translateY(-20px)';
      backdrop.style.opacity = '0';
      
      const closeTimer = setTimeout(() => {
        activeMini.style.display = 'none';
        backdrop.style.display = 'none';
        
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
  const cleanupHandler = () => MiniCleanup.cleanupAll();
  window.addEventListener('beforeunload', cleanupHandler);
  window.addEventListener('pagehide', cleanupHandler);
  
  // Public API
  window.miniWindows = {
    open: openMini,
    close: closeMini
  };
})();
