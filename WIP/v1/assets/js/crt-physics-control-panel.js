/*
 * CRT Physics Control Panel
 * User interface for configuring realistic CRT monitor simulation
 * Provides real-time control over NTSC timing, color bleeding, geometry, and shadow mask effects
 * Integration: Works with CRTSystem and all four physics engines
 */
(function () {
  'use strict';

  /* Control panel state management */
  const panelState = {
    visible: false,
    initialized: false,
    engines: {}
  };

  /* Physics engine parameter definitions */
  const engineParameters = {
    interlacing: {
      name: 'NTSC Interlacing',
      description: 'Authentic interlaced scan pattern with field artifacts',
      parameters: {
        enabled: {
          type: 'boolean',
          default: true,
          label: 'Enable Interlacing'
        },
        intensity: {
          type: 'range',
          min: 0,
          max: 1,
          step: 0.01,
          default: 0.7,
          label: 'Interlace Intensity'
        },
        fieldOffset: {
          type: 'range',
          min: -2,
          max: 2,
          step: 0.1,
          default: 0.5,
          label: 'Field Offset (lines)'
        },
        jitterAmount: {
          type: 'range',
          min: 0,
          max: 0.1,
          step: 0.001,
          default: 0.002,
          label: 'Thermal Jitter'
        },
        fieldBlending: {
          type: 'range',
          min: 0,
          max: 1,
          step: 0.01,
          default: 0.85,
          label: 'Field Blending'
        },
        vsyncTiming: {
          type: 'range',
          min: 15.7,
          max: 15.8,
          step: 0.001,
          default: 15.734,
          label: 'H-Sync (kHz)'
        }
      }
    },
    colorSystem: {
      name: 'NTSC Color System',
      description: 'Color bleeding and chroma/luminance separation artifacts',
      parameters: {
        enabled: {
          type: 'boolean',
          default: true,
          label: 'Enable Color Bleeding'
        },
        chromaBleeding: {
          type: 'range',
          min: 0,
          max: 0.5,
          step: 0.01,
          default: 0.12,
          label: 'Chroma Bleeding'
        },
        lumaBleeding: {
          type: 'range',
          min: 0,
          max: 0.3,
          step: 0.01,
          default: 0.08,
          label: 'Luma Bleeding'
        },
        convergenceR: {
          type: 'range',
          min: -2,
          max: 2,
          step: 0.1,
          default: 0.2,
          label: 'Red Convergence'
        },
        convergenceG: {
          type: 'range',
          min: -2,
          max: 2,
          step: 0.1,
          default: 0.0,
          label: 'Green Convergence'
        },
        convergenceB: {
          type: 'range',
          min: -2,
          max: 2,
          step: 0.1,
          default: -0.3,
          label: 'Blue Convergence'
        },
        colorTemperature: {
          type: 'range',
          min: 5000,
          max: 9300,
          step: 100,
          default: 6500,
          label: 'Color Temperature (K)'
        }
      }
    },
    geometry: {
      name: 'CRT Geometry',
      description: 'Barrel distortion, pincushion, and thermal geometry drift',
      parameters: {
        enabled: {
          type: 'boolean',
          default: true,
          label: 'Enable Geometry Effects'
        },
        barrelDistortion: {
          type: 'range',
          min: 0,
          max: 0.15,
          step: 0.001,
          default: 0.025,
          label: 'Barrel Distortion'
        },
        pincushionH: {
          type: 'range',
          min: 0,
          max: 0.1,
          step: 0.001,
          default: 0.015,
          label: 'H-Pincushion'
        },
        pincushionV: {
          type: 'range',
          min: 0,
          max: 0.1,
          step: 0.001,
          default: 0.012,
          label: 'V-Pincushion'
        },
        cornerDistortion: {
          type: 'range',
          min: 0,
          max: 0.05,
          step: 0.001,
          default: 0.008,
          label: 'Corner Distortion'
        },
        thermalDrift: {
          type: 'range',
          min: 0,
          max: 0.02,
          step: 0.0001,
          default: 0.003,
          label: 'Thermal Drift'
        },
        powerRipple: {
          type: 'range',
          min: 0,
          max: 0.01,
          step: 0.0001,
          default: 0.001,
          label: 'Power Supply Ripple'
        }
      }
    },
    shadowMask: {
      name: 'Shadow Mask',
      description: 'RGB phosphor dot patterns and aperture grille simulation',
      parameters: {
        enabled: {
          type: 'boolean',
          default: true,
          label: 'Enable Shadow Mask'
        },
        maskType: {
          type: 'select',
          options: ['trinitron', 'delta', 'inline'],
          default: 'trinitron',
          label: 'Mask Type'
        },
        dotPitch: {
          type: 'range',
          min: 0.24,
          max: 0.31,
          step: 0.001,
          default: 0.265,
          label: 'Dot Pitch (mm)'
        },
        intensity: {
          type: 'range',
          min: 0,
          max: 1,
          step: 0.01,
          default: 0.7,
          label: 'Mask Intensity'
        },
        brightness: {
          type: 'range',
          min: 0.5,
          max: 1.5,
          step: 0.01,
          default: 1.0,
          label: 'Phosphor Brightness'
        },
        wearPattern: {
          type: 'range',
          min: 0,
          max: 0.3,
          step: 0.01,
          default: 0.05,
          label: 'Phosphor Wear'
        },
        thermalExpansion: {
          type: 'range',
          min: 0,
          max: 0.02,
          step: 0.0001,
          default: 0.002,
          label: 'Thermal Expansion'
        }
      }
    }
  };

  /* Control Panel API */
  const CRTControlPanel = {
    /*
     * Initialize the control panel system
     */
    init() {
      if (panelState.initialized) {
        return this;
      }

      // Wait for CRT system to be ready
      if (window.CRTSystem && window.CRTSystem.isInitialized()) {
        this.createControlPanel();
        this.setupEventListeners();
        panelState.initialized = true;
        console.log('[CRTControlPanel] Initialized successfully');
      } else {
        // Wait for CRT system
        window.addEventListener('crtSystemReady', () => {
          this.init();
        });
      }

      return this;
    },

    /*
     * Create the control panel UI
     */
    createControlPanel() {
      // Create panel container
      const panel = document.createElement('div');
      panel.id = 'crt-control-panel';
      panel.className = 'crt-panel hidden';
      panel.innerHTML = this.generatePanelHTML();

      // Add panel to document
      document.body.appendChild(panel);

      // Create toggle button
      const toggleButton = document.createElement('button');
      toggleButton.id = 'crt-panel-toggle';
      toggleButton.className = 'crt-toggle-btn';
      toggleButton.innerHTML = '⚙️ CRT';
      toggleButton.title = 'CRT Physics Control Panel';

      document.body.appendChild(toggleButton);

      // Add CSS styles
      this.addControlPanelStyles();

      // Setup panel controls
      this.setupPanelControls();

      console.log('[CRTControlPanel] UI created successfully');
    },

    /*
     * Generate the HTML structure for the control panel
     */
    generatePanelHTML() {
      const html = `
        <div class="panel-header">
          <h3>CRT Physics Control</h3>
          <button class="close-btn" id="panel-close">×</button>
        </div>
        <div class="panel-content">
          <div class="panel-tabs">
            ${Object.keys(engineParameters)
              .map(
                (key, index) =>
                  `<button class="tab-btn ${index === 0 ? 'active' : ''}" data-engine="${key}">${engineParameters[key].name}</button>`
              )
              .join('')}
          </div>
          <div class="panel-sections">
            ${Object.entries(engineParameters)
              .map(([engineKey, engine], index) =>
                this.generateEngineSection(engineKey, engine, index === 0)
              )
              .join('')}
          </div>
          <div class="panel-footer">
            <button id="reset-defaults" class="btn btn-secondary">Reset to Defaults</button>
            <button id="save-preset" class="btn btn-primary">Save Preset</button>
          </div>
        </div>
      `;
      return html;
    },

    /*
     * Generate HTML for a specific engine's controls
     */
    generateEngineSection(engineKey, engine, active = false) {
      const parameters = engine.parameters;
      const controlsHTML = Object.entries(parameters)
        .map(([paramKey, param]) => {
          return this.generateControlHTML(engineKey, paramKey, param);
        })
        .join('');

      return `
        <div class="engine-section ${active ? 'active' : ''}" data-engine="${engineKey}">
          <div class="engine-header">
            <h4>${engine.name}</h4>
            <p class="engine-description">${engine.description}</p>
          </div>
          <div class="controls-grid">
            ${controlsHTML}
          </div>
        </div>
      `;
    },

    /*
     * Generate HTML for individual parameter control
     */
    generateControlHTML(engineKey, paramKey, param) {
      const controlId = `${engineKey}-${paramKey}`;
      let inputHTML = '';

      switch (param.type) {
        case 'boolean':
          inputHTML = `
            <input type="checkbox" id="${controlId}" ${param.default ? 'checked' : ''}>
            <label for="${controlId}" class="checkbox-label">${param.label}</label>
          `;
          break;
        case 'range':
          inputHTML = `
            <label for="${controlId}" class="range-label">${param.label}</label>
            <input type="range" id="${controlId}" min="${param.min}" max="${param.max}" step="${param.step}" value="${param.default}">
            <span class="range-value" id="${controlId}-value">${param.default}</span>
          `;
          break;
        case 'select': {
          const optionsHTML = param.options
            .map(
              option =>
                `<option value="${option}" ${option === param.default ? 'selected' : ''}>${option}</option>`
            )
            .join('');
          inputHTML = `
            <label for="${controlId}" class="select-label">${param.label}</label>
            <select id="${controlId}">${optionsHTML}</select>
          `;
          break;
        }
      }

      return `<div class="control-group" data-param="${paramKey}">${inputHTML}</div>`;
    },

    /*
     * Add CSS styles for the control panel
     */
    addControlPanelStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .crt-toggle-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          background: rgba(0, 255, 0, 0.8);
          border: 2px solid #00ff00;
          color: black;
          padding: 8px 12px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
          transition: all 0.3s ease;
        }

        .crt-toggle-btn:hover {
          background: rgba(0, 255, 0, 1);
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
        }

        .crt-panel {
          position: fixed;
          top: 70px;
          right: 20px;
          width: 400px;
          max-height: calc(100vh - 100px);
          background: rgba(0, 20, 0, 0.95);
          border: 2px solid #00ff00;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          color: #00ff00;
          z-index: 9999;
          overflow-y: auto;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .crt-panel.hidden {
          display: none;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #00ff00;
          background: rgba(0, 255, 0, 0.1);
        }

        .panel-header h3 {
          margin: 0;
          font-size: 16px;
          text-shadow: 0 0 5px #00ff00;
        }

        .close-btn {
          background: none;
          border: 1px solid #00ff00;
          color: #00ff00;
          width: 25px;
          height: 25px;
          cursor: pointer;
          border-radius: 3px;
          font-size: 16px;
          line-height: 1;
        }

        .panel-content {
          padding: 15px;
        }

        .panel-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 15px;
        }

        .tab-btn {
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 6px 10px;
          cursor: pointer;
          border-radius: 3px;
          font-size: 11px;
          flex: 1;
          min-width: 80px;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          background: rgba(0, 255, 0, 0.2);
        }

        .tab-btn.active {
          background: rgba(0, 255, 0, 0.3);
          text-shadow: 0 0 3px #00ff00;
        }

        .engine-section {
          display: none;
        }

        .engine-section.active {
          display: block;
        }

        .engine-header h4 {
          margin: 0 0 5px 0;
          font-size: 14px;
          text-shadow: 0 0 3px #00ff00;
        }

        .engine-description {
          font-size: 11px;
          margin: 0 0 15px 0;
          opacity: 0.8;
          line-height: 1.3;
        }

        .controls-grid {
          display: grid;
          gap: 12px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .control-group label {
          font-size: 11px;
          font-weight: bold;
        }

        .control-group input[type="range"] {
          width: 100%;
          height: 4px;
          background: rgba(0, 255, 0, 0.2);
          outline: none;
          border-radius: 2px;
        }

        .control-group input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #00ff00;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
        }

        .range-value {
          font-size: 10px;
          text-align: right;
          opacity: 0.8;
        }

        .control-group input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .control-group select {
          background: rgba(0, 20, 0, 0.8);
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 4px;
          border-radius: 3px;
          font-family: inherit;
          font-size: 11px;
        }

        .panel-footer {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid rgba(0, 255, 0, 0.3);
        }

        .btn {
          flex: 1;
          padding: 8px;
          border: 1px solid #00ff00;
          background: rgba(0, 255, 0, 0.1);
          color: #00ff00;
          cursor: pointer;
          border-radius: 3px;
          font-family: inherit;
          font-size: 11px;
          transition: all 0.2s ease;
        }

        .btn:hover {
          background: rgba(0, 255, 0, 0.2);
        }

        .btn-primary {
          background: rgba(0, 255, 0, 0.2);
        }

        /* Custom scrollbar for panel */
        .crt-panel::-webkit-scrollbar {
          width: 6px;
        }

        .crt-panel::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        .crt-panel::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 0, 0.5);
          border-radius: 3px;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .crt-panel {
            width: calc(100vw - 40px);
            right: 20px;
          }
        }
      `;
      document.head.appendChild(style);
    },

    /*
     * Setup event listeners for panel controls
     */
    setupEventListeners() {
      // Toggle button
      document
        .getElementById('crt-panel-toggle')
        .addEventListener('click', () => {
          this.togglePanel();
        });

      // Close button
      document.getElementById('panel-close').addEventListener('click', () => {
        this.hidePanel();
      });

      // Tab switching
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          this.switchTab(e.target.dataset.engine);
        });
      });

      // Reset button
      document
        .getElementById('reset-defaults')
        .addEventListener('click', () => {
          this.resetToDefaults();
        });

      // Save preset button
      document.getElementById('save-preset').addEventListener('click', () => {
        this.savePreset();
      });

      console.log('[CRTControlPanel] Event listeners setup complete');
    },

    /*
     * Setup control event listeners for each parameter
     */
    setupPanelControls() {
      Object.keys(engineParameters).forEach(engineKey => {
        const parameters = engineParameters[engineKey].parameters;

        Object.keys(parameters).forEach(paramKey => {
          const controlId = `${engineKey}-${paramKey}`;
          const control = document.getElementById(controlId);
          const param = parameters[paramKey];

          if (control) {
            switch (param.type) {
              case 'boolean':
                control.addEventListener('change', e => {
                  this.updateEngineParameter(
                    engineKey,
                    paramKey,
                    e.target.checked
                  );
                });
                break;
              case 'range':
                control.addEventListener('input', e => {
                  const value = parseFloat(e.target.value);
                  document.getElementById(`${controlId}-value`).textContent =
                    value;
                  this.updateEngineParameter(engineKey, paramKey, value);
                });
                break;
              case 'select':
                control.addEventListener('change', e => {
                  this.updateEngineParameter(
                    engineKey,
                    paramKey,
                    e.target.value
                  );
                });
                break;
            }
          }
        });
      });
    },

    /*
     * Toggle panel visibility
     */
    togglePanel() {
      const panel = document.getElementById('crt-control-panel');
      if (panelState.visible) {
        this.hidePanel();
      } else {
        this.showPanel();
      }
    },

    /*
     * Show the control panel
     */
    showPanel() {
      const panel = document.getElementById('crt-control-panel');
      panel.classList.remove('hidden');
      panelState.visible = true;
    },

    /*
     * Hide the control panel
     */
    hidePanel() {
      const panel = document.getElementById('crt-control-panel');
      panel.classList.add('hidden');
      panelState.visible = false;
    },

    /*
     * Switch to a different tab
     */
    switchTab(engineKey) {
      // Update tab buttons
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document
        .querySelector(`[data-engine="${engineKey}"]`)
        .classList.add('active');

      // Update sections
      document.querySelectorAll('.engine-section').forEach(section => {
        section.classList.remove('active');
      });
      document
        .querySelector(`.engine-section[data-engine="${engineKey}"]`)
        .classList.add('active');
    },

    /*
     * Update a physics engine parameter
     */
    updateEngineParameter(engineKey, paramKey, value) {
      if (window.CRTSystem) {
        const config = { [paramKey]: value };
        window.CRTSystem.configurePhysicsEngine(engineKey, config);
        console.log(
          `[CRTControlPanel] Updated ${engineKey}.${paramKey} = ${value}`
        );
      }
    },

    /*
     * Reset all parameters to default values
     */
    resetToDefaults() {
      Object.entries(engineParameters).forEach(([engineKey, engine]) => {
        Object.entries(engine.parameters).forEach(([paramKey, param]) => {
          const controlId = `${engineKey}-${paramKey}`;
          const control = document.getElementById(controlId);

          if (control) {
            switch (param.type) {
              case 'boolean':
                control.checked = param.default;
                break;
              case 'range':
                control.value = param.default;
                document.getElementById(`${controlId}-value`).textContent =
                  param.default;
                break;
              case 'select':
                control.value = param.default;
                break;
            }

            // Trigger the update
            this.updateEngineParameter(engineKey, paramKey, param.default);
          }
        });
      });

      console.log('[CRTControlPanel] Reset to default values');
    },

    /*
     * Save current settings as a preset
     */
    savePreset() {
      const preset = {};

      Object.keys(engineParameters).forEach(engineKey => {
        preset[engineKey] = {};
        const parameters = engineParameters[engineKey].parameters;

        Object.keys(parameters).forEach(paramKey => {
          const controlId = `${engineKey}-${paramKey}`;
          const control = document.getElementById(controlId);
          const param = parameters[paramKey];

          if (control) {
            switch (param.type) {
              case 'boolean':
                preset[engineKey][paramKey] = control.checked;
                break;
              case 'range':
                preset[engineKey][paramKey] = parseFloat(control.value);
                break;
              case 'select':
                preset[engineKey][paramKey] = control.value;
                break;
            }
          }
        });
      });

      // Save to localStorage
      localStorage.setItem('crt-physics-preset', JSON.stringify(preset));
      console.log('[CRTControlPanel] Preset saved', preset);

      // Visual feedback
      const btn = document.getElementById('save-preset');
      const originalText = btn.textContent;
      btn.textContent = 'Saved!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 1500);
    },

    /*
     * Load a saved preset
     */
    loadPreset() {
      try {
        const preset = JSON.parse(localStorage.getItem('crt-physics-preset'));
        if (preset) {
          Object.entries(preset).forEach(([engineKey, engineParams]) => {
            Object.entries(engineParams).forEach(([paramKey, value]) => {
              const controlId = `${engineKey}-${paramKey}`;
              const control = document.getElementById(controlId);
              const param = engineParameters[engineKey]?.parameters[paramKey];

              if (control && param) {
                switch (param.type) {
                  case 'boolean':
                    control.checked = value;
                    break;
                  case 'range':
                    control.value = value;
                    document.getElementById(`${controlId}-value`).textContent =
                      value;
                    break;
                  case 'select':
                    control.value = value;
                    break;
                }

                this.updateEngineParameter(engineKey, paramKey, value);
              }
            });
          });

          console.log('[CRTControlPanel] Preset loaded', preset);
        }
      } catch (error) {
        console.warn('[CRTControlPanel] Failed to load preset:', error);
      }
    }
  };

  // Export to global scope
  window.CRTControlPanel = CRTControlPanel;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => CRTControlPanel.init(), 100);
    });
  } else {
    setTimeout(() => CRTControlPanel.init(), 100);
  }
})();
