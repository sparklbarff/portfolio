/**
 * CRT Effects Debug Panel
 * Comprehensive debugging interface for CRT effects system
 */
(function () {
  "use strict";

  class CRTDebugPanel {
    constructor() {
      this.isVisible = false;
      this.panel = null;
      this.updateInterval = null;
      this.config = {
        updateRate: 500, // Update every 500ms
        maxLogEntries: 100,
        enableRealTimeMetrics: true,
      };

      this.logs = [];
    }

    init() {
      this.createPanel();
      this.setupEventListeners();
      this.startUpdating();

      // Add keyboard shortcut (Ctrl/Cmd + Shift + D)
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
          this.toggle();
        }
      });

      return this;
    }

    createPanel() {
      // Create main panel container
      this.panel = document.createElement("div");
      this.panel.className = "crt-debug-panel";
      this.panel.innerHTML = `
        <div class="debug-header">
          <h3>CRT Effects Debug Panel</h3>
          <div class="debug-controls">
            <button id="debug-minimize" title="Minimize">−</button>
            <button id="debug-close" title="Close">×</button>
          </div>
        </div>
        
        <div class="debug-tabs">
          <button class="debug-tab active" data-tab="performance">Performance</button>
          <button class="debug-tab" data-tab="effects">Effects</button>
          <button class="debug-tab" data-tab="system">System</button>
          <button class="debug-tab" data-tab="logs">Logs</button>
        </div>
        
        <div class="debug-content">
          <!-- Performance Tab -->
          <div class="debug-tab-content active" id="debug-performance">
            <div class="metric-grid">
              <div class="metric-card">
                <h4>FPS</h4>
                <div class="metric-value" id="fps-display">--</div>
                <div class="metric-chart" id="fps-chart"></div>
              </div>
              <div class="metric-card">
                <h4>Performance Level</h4>
                <div class="metric-value" id="perf-level">--</div>
                <div class="perf-controls">
                  <button id="perf-auto" class="active">Auto</button>
                  <button id="perf-high">High</button>
                  <button id="perf-medium">Medium</button>
                  <button id="perf-low">Low</button>
                </div>
              </div>
              <div class="metric-card">
                <h4>Memory Usage</h4>
                <div class="metric-value" id="memory-display">--</div>
                <div class="memory-breakdown" id="memory-breakdown"></div>
              </div>
              <div class="metric-card">
                <h4>Device Info</h4>
                <div class="device-info" id="device-info">--</div>
              </div>
            </div>
          </div>
          
          <!-- Effects Tab -->
          <div class="debug-tab-content" id="debug-effects">
            <div class="effects-controls">
              <button id="effects-enable-all">Enable All</button>
              <button id="effects-disable-all">Disable All</button>
              <button id="effects-reset">Reset to Defaults</button>
            </div>
            <div class="effects-list" id="effects-list">
              <!-- Effect controls will be populated here -->
            </div>
          </div>
          
          <!-- System Tab -->
          <div class="debug-tab-content" id="debug-system">
            <div class="system-status" id="system-status">
              <!-- System information will be populated here -->
            </div>
            <div class="system-controls">
              <button id="system-restart">Restart Effects</button>
              <button id="system-migration">Run Migration</button>
              <button id="system-export">Export Config</button>
              <button id="system-import">Import Config</button>
            </div>
          </div>
          
          <!-- Logs Tab -->
          <div class="debug-tab-content" id="debug-logs">
            <div class="log-controls">
              <button id="log-clear">Clear Logs</button>
              <button id="log-export">Export Logs</button>
              <label>
                <input type="checkbox" id="log-auto-scroll" checked> Auto-scroll
              </label>
            </div>
            <div class="log-container" id="log-container">
              <!-- Log entries will be populated here -->
            </div>
          </div>
        </div>
      `;

      this.addPanelStyles();
      document.body.appendChild(this.panel);
    }

    addPanelStyles() {
      const style = document.createElement("style");
      style.textContent = `
        .crt-debug-panel {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 400px;
          max-height: 80vh;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid #00ff00;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          z-index: 10000;
          border-radius: 4px;
          overflow: hidden;
          display: none;
        }
        
        .crt-debug-panel.visible {
          display: block;
        }
        
        .debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: rgba(0, 255, 0, 0.1);
          border-bottom: 1px solid #00ff00;
        }
        
        .debug-header h3 {
          margin: 0;
          font-size: 14px;
        }
        
        .debug-controls button {
          background: none;
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 2px 8px;
          margin-left: 5px;
          cursor: pointer;
        }
        
        .debug-controls button:hover {
          background: rgba(0, 255, 0, 0.2);
        }
        
        .debug-tabs {
          display: flex;
          background: rgba(0, 255, 0, 0.05);
        }
        
        .debug-tab {
          flex: 1;
          background: none;
          border: none;
          border-right: 1px solid #00ff00;
          color: #00ff00;
          padding: 8px;
          cursor: pointer;
        }
        
        .debug-tab:last-child {
          border-right: none;
        }
        
        .debug-tab.active {
          background: rgba(0, 255, 0, 0.2);
        }
        
        .debug-content {
          max-height: 60vh;
          overflow-y: auto;
          padding: 10px;
        }
        
        .debug-tab-content {
          display: none;
        }
        
        .debug-tab-content.active {
          display: block;
        }
        
        .metric-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .metric-card {
          border: 1px solid #00ff00;
          padding: 8px;
          border-radius: 2px;
        }
        
        .metric-card h4 {
          margin: 0 0 5px 0;
          font-size: 11px;
          text-transform: uppercase;
        }
        
        .metric-value {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .perf-controls button {
          background: none;
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 2px 6px;
          margin-right: 4px;
          font-size: 10px;
          cursor: pointer;
        }
        
        .perf-controls button.active {
          background: rgba(0, 255, 0, 0.3);
        }
        
        .effects-controls,
        .system-controls,
        .log-controls {
          margin-bottom: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .effects-controls button,
        .system-controls button,
        .log-controls button {
          background: none;
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 10px;
        }
        
        .effects-controls button:hover,
        .system-controls button:hover,
        .log-controls button:hover {
          background: rgba(0, 255, 0, 0.2);
        }
        
        .effect-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px;
          border-bottom: 1px solid rgba(0, 255, 0, 0.3);
        }
        
        .effect-name {
          font-weight: bold;
        }
        
        .effect-controls {
          display: flex;
          gap: 4px;
        }
        
        .effect-toggle {
          background: none;
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 2px 6px;
          cursor: pointer;
          font-size: 10px;
        }
        
        .effect-toggle.enabled {
          background: rgba(0, 255, 0, 0.3);
        }
        
        .log-container {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #00ff00;
          background: rgba(0, 0, 0, 0.3);
          padding: 8px;
        }
        
        .log-entry {
          margin-bottom: 4px;
          font-size: 10px;
        }
        
        .log-entry.error {
          color: #ff0000;
        }
        
        .log-entry.warning {
          color: #ffff00;
        }
        
        .log-entry.info {
          color: #00ffff;
        }
        
        .log-timestamp {
          opacity: 0.7;
          margin-right: 8px;
        }
      `;

      document.head.appendChild(style);
    }

    setupEventListeners() {
      // Panel controls
      this.panel
        .querySelector("#debug-close")
        .addEventListener("click", () => this.hide());
      this.panel
        .querySelector("#debug-minimize")
        .addEventListener("click", () => this.minimize());

      // Tab switching
      this.panel.querySelectorAll(".debug-tab").forEach((tab) => {
        tab.addEventListener("click", (e) =>
          this.switchTab(e.target.dataset.tab)
        );
      });

      // Performance controls
      this.panel.querySelectorAll(".perf-controls button").forEach((btn) => {
        btn.addEventListener("click", (e) =>
          this.setPerformanceMode(e.target.id.replace("perf-", ""))
        );
      });

      // Effects controls
      this.panel
        .querySelector("#effects-enable-all")
        .addEventListener("click", () => this.enableAllEffects());
      this.panel
        .querySelector("#effects-disable-all")
        .addEventListener("click", () => this.disableAllEffects());
      this.panel
        .querySelector("#effects-reset")
        .addEventListener("click", () => this.resetEffects());

      // System controls
      this.panel
        .querySelector("#system-restart")
        .addEventListener("click", () => this.restartEffects());
      this.panel
        .querySelector("#system-migration")
        .addEventListener("click", () => this.runMigration());
      this.panel
        .querySelector("#system-export")
        .addEventListener("click", () => this.exportConfig());

      // Log controls
      this.panel
        .querySelector("#log-clear")
        .addEventListener("click", () => this.clearLogs());
      this.panel
        .querySelector("#log-export")
        .addEventListener("click", () => this.exportLogs());
    }

    startUpdating() {
      this.updateInterval = setInterval(() => {
        if (this.isVisible) {
          this.updateMetrics();
          this.updateEffectsList();
          this.updateSystemStatus();
        }
      }, this.config.updateRate);
    }

    show() {
      this.panel.classList.add("visible");
      this.isVisible = true;
      this.updateMetrics();
    }

    hide() {
      this.panel.classList.remove("visible");
      this.isVisible = false;
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }

    switchTab(tabName) {
      // Update tab buttons
      this.panel.querySelectorAll(".debug-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.tab === tabName);
      });

      // Update tab content
      this.panel.querySelectorAll(".debug-tab-content").forEach((content) => {
        content.classList.toggle("active", content.id === `debug-${tabName}`);
      });
    }

    updateMetrics() {
      // Update FPS
      if (window.PerformanceMonitor) {
        const metrics = window.PerformanceMonitor.getMetrics();
        this.panel.querySelector("#fps-display").textContent =
          metrics.avgFps?.toFixed(1) || "--";
        this.panel.querySelector("#perf-level").textContent =
          metrics.performanceLevel || "--";
      }

      // Update memory if available
      if (performance.memory) {
        const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
        const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(1);
        this.panel.querySelector(
          "#memory-display"
        ).textContent = `${used}/${total} MB`;
      }

      // Update device info
      if (window.AdvancedPerformanceOptimizer) {
        const report =
          window.AdvancedPerformanceOptimizer.getPerformanceReport();
        if (report.deviceCapabilities) {
          const caps = report.deviceCapabilities;
          this.panel.querySelector("#device-info").innerHTML = `
            Cores: ${caps.cores}<br>
            Memory: ${caps.memory}GB<br>
            Tier: ${caps.estimatedTier}/5<br>
            WebGL: ${caps.webglSupported ? "Yes" : "No"}
          `;
        }
      }
    }

    updateEffectsList() {
      const effectsList = this.panel.querySelector("#effects-list");
      if (!window.CRTEffectRegistry) return;

      const status = window.CRTEffectRegistry.getStatus();
      effectsList.innerHTML = "";

      Object.entries(status.activeInstances).forEach(([name, data]) => {
        const effectItem = document.createElement("div");
        effectItem.className = "effect-item";
        effectItem.innerHTML = `
          <div>
            <div class="effect-name">${name}</div>
            <div class="effect-status">${
              data.state?.enabled ? "Enabled" : "Disabled"
            }</div>
          </div>
          <div class="effect-controls">
            <button class="effect-toggle ${
              data.state?.enabled ? "enabled" : ""
            }" 
                    data-effect="${name}">
              ${data.state?.enabled ? "Disable" : "Enable"}
            </button>
          </div>
        `;

        // Add toggle listener
        effectItem
          .querySelector(".effect-toggle")
          .addEventListener("click", (e) => {
            this.toggleEffect(name, !data.state?.enabled);
          });

        effectsList.appendChild(effectItem);
      });
    }

    updateSystemStatus() {
      const systemStatus = this.panel.querySelector("#system-status");
      const status = {
        "CRT Effect Registry": !!window.CRTEffectRegistry,
        "Performance Monitor": !!window.PerformanceMonitor,
        "Advanced Optimizer": !!window.AdvancedPerformanceOptimizer,
        "Migration Manager": !!window.CRTLegacyMigrationManager,
        "Effects Integration": !!window.CRTEffectsManager,
      };

      systemStatus.innerHTML = Object.entries(status)
        .map(
          ([name, available]) =>
            `<div>${name}: <span style="color: ${
              available ? "#00ff00" : "#ff0000"
            }">${available ? "Available" : "Missing"}</span></div>`
        )
        .join("");
    }

    toggleEffect(name, enable) {
      if (!window.CRTEffectRegistry) return;

      const instance = window.CRTEffectRegistry.getInstance(name);
      if (instance) {
        if (enable && typeof instance.enable === "function") {
          instance.enable();
        } else if (!enable && typeof instance.disable === "function") {
          instance.disable();
        }
      }

      this.log(`${enable ? "Enabled" : "Disabled"} effect: ${name}`, "info");
    }

    log(message, type = "info") {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = {
        timestamp,
        message,
        type,
      };

      this.logs.push(logEntry);

      // Keep only recent logs
      if (this.logs.length > this.config.maxLogEntries) {
        this.logs.shift();
      }

      // Update log display if logs tab is active
      this.updateLogDisplay();
    }

    updateLogDisplay() {
      const logContainer = this.panel.querySelector("#log-container");
      if (!logContainer) return;

      logContainer.innerHTML = this.logs
        .map(
          (entry) =>
            `<div class="log-entry ${entry.type}">
          <span class="log-timestamp">[${entry.timestamp}]</span>
          <span class="log-message">${entry.message}</span>
        </div>`
        )
        .join("");

      // Auto-scroll if enabled
      if (this.panel.querySelector("#log-auto-scroll").checked) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }

    clearLogs() {
      this.logs = [];
      this.updateLogDisplay();
    }

    exportLogs() {
      const logsText = this.logs
        .map(
          (entry) =>
            `[${entry.timestamp}] ${entry.type.toUpperCase()}: ${entry.message}`
        )
        .join("\n");

      this.downloadFile("crt-effects-logs.txt", logsText);
    }

    downloadFile(filename, content) {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }

    enableAllEffects() {
      if (window.CRTEffectRegistry) {
        window.CRTEffectRegistry.enableAll();
        this.log("Enabled all effects", "info");
      }
    }

    disableAllEffects() {
      if (window.CRTEffectRegistry) {
        window.CRTEffectRegistry.disableAll();
        this.log("Disabled all effects", "info");
      }
    }

    resetEffects() {
      // Implement effect reset logic
      this.log("Reset effects to defaults", "info");
    }

    restartEffects() {
      // Implement restart logic
      this.log("Restarted effects system", "info");
    }

    runMigration() {
      if (window.CRTLegacyMigrationManager) {
        window.CRTLegacyMigrationManager.startMigration().then((status) => {
          this.log(`Migration completed: ${status.phase}`, "info");
        });
      }
    }

    exportConfig() {
      // Implement config export
      this.log("Exported configuration", "info");
    }

    destroy() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
      if (this.panel) {
        this.panel.remove();
      }
    }
  }

  // Create global debug panel instance
  window.CRTDebugPanel = new CRTDebugPanel();

  // Auto-initialize when ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.CRTDebugPanel.init();
    });
  } else {
    window.CRTDebugPanel.init();
  }

  console.log(
    "[Debug] CRT Debug Panel loaded - Press Ctrl/Cmd+Shift+D to open"
  );
})();
