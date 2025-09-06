/**
 * CRT Legacy Migration Manager
 * Handles transition from legacy CRT system to new modular architecture
 */
(function () {
  "use strict";

  class LegacyMigrationManager {
    constructor() {
      this.migrationStatus = {
        phase: "preparation", // preparation, migration, cleanup, complete
        legacyElementsFound: [],
        newInstancesCreated: [],
        errors: [],
        startTime: null,
        endTime: null,
      };

      this.legacyToNewMapping = {
        scanlines: {
          newName: "scanlines",
          className: "ScanlinesEffect",
          priority: "high",
        },
        "crt-barrel-distortion": {
          newName: "barrelDistortion",
          className: "BarrelDistortionEffect",
          priority: "low",
        },
        "vhs-tracking-error": {
          newName: "trackingError",
          className: "TrackingErrorEffect",
          priority: "low",
        },
        "crt-vignette": {
          newName: "vignette",
          className: "VignetteEffect",
          priority: "high",
        },
        "vhs-chroma-noise": {
          newName: "chromaBleed",
          className: "ChromaBleedEffect",
          priority: "medium",
        },
        "crt-convergence-error": {
          newName: "rgbSeparation",
          className: "RGBSeparationEffect",
          priority: "medium",
        },
      };
    }

    // Start the migration process
    async startMigration() {
      console.log("[Migration] Starting legacy CRT effect migration...");
      this.migrationStatus.startTime = performance.now();
      this.migrationStatus.phase = "preparation";

      try {
        // Phase 1: Preparation
        await this.prepareForMigration();

        // Phase 2: Migration
        this.migrationStatus.phase = "migration";
        await this.performMigration();

        // Phase 3: Cleanup
        this.migrationStatus.phase = "cleanup";
        await this.cleanupLegacyElements();

        // Phase 4: Complete
        this.migrationStatus.phase = "complete";
        this.migrationStatus.endTime = performance.now();

        console.log("[Migration] Migration completed successfully");
        console.log(
          "[Migration] Time taken:",
          this.migrationStatus.endTime - this.migrationStatus.startTime,
          "ms"
        );

        return this.migrationStatus;
      } catch (error) {
        console.error("[Migration] Migration failed:", error);
        this.migrationStatus.errors.push(error.message);
        this.migrationStatus.phase = "failed";
        return this.migrationStatus;
      }
    }

    // Prepare for migration by scanning for legacy elements
    async prepareForMigration() {
      console.log("[Migration] Preparing for migration...");

      // Wait for required systems
      await this.waitForRequiredSystems();

      // Scan for legacy elements
      this.scanLegacyElements();

      // Validate that new effect classes are available
      this.validateNewEffectClasses();

      console.log(
        "[Migration] Found",
        this.migrationStatus.legacyElementsFound.length,
        "legacy elements"
      );
    }

    // Wait for required systems to be available
    waitForRequiredSystems() {
      return new Promise((resolve) => {
        const checkSystems = () => {
          const required = [
            "CRTEffectRegistry",
            "ScanlinesEffect",
            "BarrelDistortionEffect",
            "TrackingErrorEffect",
          ];

          const allAvailable = required.every((system) => window[system]);

          if (allAvailable) {
            console.log("[Migration] All required systems available");
            resolve();
          } else {
            console.log("[Migration] Waiting for required systems...");
            setTimeout(checkSystems, 100);
          }
        };

        checkSystems();
      });
    }

    // Scan for legacy effect elements
    scanLegacyElements() {
      Object.keys(this.legacyToNewMapping).forEach((legacyClass) => {
        const elements = document.querySelectorAll(`.${legacyClass}`);
        elements.forEach((element, index) => {
          this.migrationStatus.legacyElementsFound.push({
            legacyClass: legacyClass,
            element: element,
            index: index,
            isVisible: getComputedStyle(element).display !== "none",
            hasStyles: element.getAttribute("style") !== null,
          });
        });
      });
    }

    // Validate that new effect classes are available
    validateNewEffectClasses() {
      Object.values(this.legacyToNewMapping).forEach((mapping) => {
        if (!window[mapping.className]) {
          throw new Error(
            `New effect class "${mapping.className}" not available`
          );
        }
      });

      if (!window.CRTEffectRegistry) {
        throw new Error("CRT Effect Registry not available");
      }
    }

    // Perform the actual migration
    async performMigration() {
      console.log("[Migration] Performing migration...");

      // Group legacy elements by their new effect type
      const groupedElements = {};
      this.migrationStatus.legacyElementsFound.forEach((legacyInfo) => {
        const mapping = this.legacyToNewMapping[legacyInfo.legacyClass];
        if (mapping) {
          if (!groupedElements[mapping.newName]) {
            groupedElements[mapping.newName] = [];
          }
          groupedElements[mapping.newName].push(legacyInfo);
        }
      });

      // Create new effect instances
      for (const [newEffectName, legacyElements] of Object.entries(
        groupedElements
      )) {
        try {
          // Determine configuration based on legacy elements
          const config = this.extractConfigFromLegacyElements(legacyElements);

          // Check if instance already exists
          let instance = window.CRTEffectRegistry.getInstance(newEffectName);

          if (!instance) {
            // Create new instance
            instance = window.CRTEffectRegistry.createInstance(
              newEffectName,
              config
            );

            if (instance) {
              this.migrationStatus.newInstancesCreated.push({
                name: newEffectName,
                config: config,
                success: true,
              });

              console.log(
                `[Migration] Created new effect instance: ${newEffectName}`
              );
            } else {
              throw new Error(`Failed to create instance for ${newEffectName}`);
            }
          } else {
            console.log(
              `[Migration] Using existing effect instance: ${newEffectName}`
            );
          }
        } catch (error) {
          console.error(
            `[Migration] Failed to migrate ${newEffectName}:`,
            error
          );
          this.migrationStatus.errors.push(
            `${newEffectName}: ${error.message}`
          );
        }
      }
    }

    // Extract configuration from legacy elements
    extractConfigFromLegacyElements(legacyElements) {
      const config = {
        enabled: legacyElements.some((el) => el.isVisible),
      };

      // Extract specific configurations based on element type
      legacyElements.forEach((legacyInfo) => {
        const element = legacyInfo.element;

        // Extract opacity settings
        if (element.style.opacity) {
          config.intensity = parseFloat(element.style.opacity);
        }

        // Extract animation settings
        if (element.style.animationDuration) {
          config.animationDuration = this.parseAnimationDuration(
            element.style.animationDuration
          );
        }

        // Extract transform settings
        if (element.style.transform) {
          this.extractTransformConfig(element.style.transform, config);
        }
      });

      return config;
    }

    // Parse animation duration to milliseconds
    parseAnimationDuration(durationStr) {
      if (durationStr.includes("ms")) {
        return parseFloat(durationStr);
      } else if (durationStr.includes("s")) {
        return parseFloat(durationStr) * 1000;
      }
      return 1000; // Default fallback
    }

    // Extract transform-based configuration
    extractTransformConfig(transformStr, config) {
      // Extract scale values
      const scaleMatch = transformStr.match(/scale\(([^)]+)\)/);
      if (scaleMatch) {
        config.scale = parseFloat(scaleMatch[1]);
      }

      // Extract rotation values
      const rotateXMatch = transformStr.match(/rotateX\(([^)]+)deg\)/);
      const rotateYMatch = transformStr.match(/rotateY\(([^)]+)deg\)/);
      if (rotateXMatch) config.rotationX = parseFloat(rotateXMatch[1]);
      if (rotateYMatch) config.rotationY = parseFloat(rotateYMatch[1]);

      // Extract perspective
      const perspectiveMatch = transformStr.match(/perspective\(([^)]+)px\)/);
      if (perspectiveMatch) {
        config.perspective = parseFloat(perspectiveMatch[1]);
      }
    }

    // Clean up legacy elements
    async cleanupLegacyElements() {
      console.log("[Migration] Cleaning up legacy elements...");

      // Hide legacy elements instead of removing them (for safety)
      this.migrationStatus.legacyElementsFound.forEach((legacyInfo) => {
        const element = legacyInfo.element;

        // Hide the element
        element.style.display = "none";
        element.style.visibility = "hidden";

        // Add migration marker
        element.classList.add("legacy-migrated");
        element.setAttribute("data-migration-status", "migrated");

        console.log(
          `[Migration] Hidden legacy element: .${legacyInfo.legacyClass}`
        );
      });

      // Update body class to indicate migration completion
      document.body.classList.add("crt-migration-complete");
      document.body.classList.remove("crt-legacy-mode");

      console.log("[Migration] Legacy cleanup completed");
    }

    // Rollback migration if needed
    rollbackMigration() {
      console.log("[Migration] Rolling back migration...");

      try {
        // Restore legacy elements
        this.migrationStatus.legacyElementsFound.forEach((legacyInfo) => {
          const element = legacyInfo.element;
          element.style.display = "";
          element.style.visibility = "";
          element.classList.remove("legacy-migrated");
          element.removeAttribute("data-migration-status");
        });

        // Destroy new effect instances
        this.migrationStatus.newInstancesCreated.forEach((instanceInfo) => {
          if (instanceInfo.success) {
            window.CRTEffectRegistry.destroyInstance(instanceInfo.name);
          }
        });

        // Update body classes
        document.body.classList.remove("crt-migration-complete");
        document.body.classList.add("crt-legacy-mode");

        console.log("[Migration] Rollback completed");
        return true;
      } catch (error) {
        console.error("[Migration] Rollback failed:", error);
        return false;
      }
    }

    // Get migration status
    getStatus() {
      return {
        ...this.migrationStatus,
        duration: this.migrationStatus.endTime
          ? this.migrationStatus.endTime - this.migrationStatus.startTime
          : null,
      };
    }

    // Check if migration is needed
    isMigrationNeeded() {
      const legacyElements = Object.keys(this.legacyToNewMapping)
        .map((className) => document.querySelectorAll(`.${className}`))
        .reduce((total, elements) => total + elements.length, 0);

      return legacyElements > 0;
    }
  }

  // Create global migration manager
  window.CRTLegacyMigrationManager = new LegacyMigrationManager();

  // Auto-start migration when systems are ready
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      if (window.CRTLegacyMigrationManager.isMigrationNeeded()) {
        console.log(
          "[Migration] Legacy elements detected, starting migration..."
        );
        window.CRTLegacyMigrationManager.startMigration();
      } else {
        console.log(
          "[Migration] No legacy elements found, migration not needed"
        );
      }
    }, 1000); // Wait for other systems to initialize
  });

  console.log("[Migration] Legacy Migration Manager initialized");
})();
