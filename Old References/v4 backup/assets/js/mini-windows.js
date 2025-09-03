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

  // Cleanup registry for mini windows
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
  
  function positionMini(mini) {
    const rect = mini.getBoundingClientRect();
    const left = Math.max(0, (window.innerWidth - rect.width) / 2);
    const top = Math.max(0, Math.min((window.innerHeight - rect.height) / 2, window.innerHeight * 0.8));
    
    mini.style.left = `${left}px`;
    mini.style.top = `${top}px`;
  }
  
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
  
  function loadContent(id, container) {
    container.innerHTML = '<p>Loading...</p>';
    
    fetch(`assets/minis/${id}.html`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load ${id}`);
        }
        return response.text();
      })
      .then(html => {
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
        
        if (activeMini) positionMini(activeMini);
      })
      .catch(error => {
        console.error('[Mini] Content load failed:', error);
        container.innerHTML = '<p>Failed to load content. Please try again later.</p>';
      });
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
