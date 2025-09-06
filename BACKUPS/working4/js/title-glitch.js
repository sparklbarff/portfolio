/*
 * CRT Title Glitch System
 * Simulates authentic CRT phosphor decay through DOM manipulation and CSS filters
 * Physics: Electron beam deflection by magnetic coils creates spatial distortion
 * Implements magnetic yoke distortion algorithms based on electron beam physics
 * Performance: Adaptive frame limiting with unified system coordination
 */
(function () {
  "use strict";

  /* System ID for registration with CRTSystem */
  const SYSTEM_ID = "title-glitch";

  /* Factory pattern for title glitch system */
  const TitleGlitchFactory = {
    create(elementId) {
      const title = document.getElementById(elementId || "glitch-title");
      if (!title) {
        console.warn("[Title] Element not found:", elementId || "glitch-title");
        return null;
      }

      /* Letter state management */
      const letters = [];
      const originalText = title.textContent;

      /* Local system state */
      const localState = {
        magneticPhase: 0 /* Deflection coil phase accumulator */,
        lastFrameTime: 0 /* Frame timing state */,
        lastGlitchTime: 0 /* Cooldown tracking */,
        activeGlitchCount: 0 /* Currently active glitches */,
        dimensionalDepth: 0 /* Perspective depth 0-1 */,
        fragmentationActive: false /* Letter fragmentation state */,
        phosphorBloomActive: false /* Bloom effect state */,
        animationFrameId: null /* Current animation frame */,
      };

      /* Configure character fragment presets */
      const fragmentPresets = [
        // Top half
        { clip: "rect(0, auto, 50%, 0)" },
        // Bottom half
        { clip: "rect(50%, auto, auto, 0)" },
        // Left half
        { clip: "rect(0, 50%, auto, 0)" },
        // Right half
        { clip: "rect(0, auto, auto, 50%)" },
        // Top-left quarter
        { clip: "rect(0, 50%, 50%, 0)" },
        // Top-right quarter
        { clip: "rect(0, auto, 50%, 50%)" },
        // Bottom-left quarter
        { clip: "rect(50%, 50%, auto, 0)" },
        // Bottom-right quarter
        { clip: "rect(50%, auto, auto, 50%)" },
      ];

      /* Initialize letter DOM structure */
      function initializeLetters() {
        title.innerHTML = "";

        for (let i = 0; i < originalText.length; i++) {
          const char = originalText[i];
          const span = document.createElement("span");
          span.className = "tg-letter";
          span.textContent = char;
          span.style.display = "inline-block";
          span.dataset.index = i;

          letters.push({
            element: span,
            originalChar: char,
            currentChar: char,
            normalizedX: i / (originalText.length - 1),
            glitchState: {
              active: false,
              intensity: 0,
              lastGlitch: 0,
              phosphorTrail: [],
              convergenceError: 0,
              fragments: [] /* Character fragments for decomposition */,
              zPosition: 0 /* Z-axis position for 3D transforms */,
              fragmentsActive: false /* Track if this letter is currently fragmented */,
            },
          });

          title.appendChild(span);
          CRTResource.registerElement(span);
        }

        // Setup phosphor trails container
        const trailsContainer = document.createElement("div");
        trailsContainer.className = "title-phosphor-trails";
        trailsContainer.style.cssText =
          "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:-1;";
        title.appendChild(trailsContainer);
        CRTResource.registerElement(trailsContainer);
      }

      /* Color temperature to RGB conversion */
      function colorTemperatureToRGB(kelvin) {
        let temp = kelvin / 100;
        let r, g, b;

        // Red component
        if (temp <= 66) {
          r = 255;
        } else {
          r = temp - 60;
          r = 329.698727446 * Math.pow(r, -0.1332047592);
          r = Math.max(0, Math.min(255, r));
        }

        // Green component
        if (temp <= 66) {
          g = temp;
          g = 99.4708025861 * Math.log(g) - 161.1195681661;
        } else {
          g = temp - 60;
          g = 288.1221695283 * Math.pow(g, -0.0755148492);
        }
        g = Math.max(0, Math.min(255, g));

        // Blue component
        if (temp >= 66) {
          b = 255;
        } else if (temp <= 19) {
          b = 0;
        } else {
          b = temp - 10;
          b = 138.5177312231 * Math.log(b) - 305.0447927307;
          b = Math.max(0, Math.min(255, b));
        }

        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
      }

      /* Magnetic field distortion calculation */
      function calculateMagneticDistortion(letter, globalIntensity) {
        // Get physics parameters from central config
        const magneticStrength =
          CRTConfig.getPhysicsParameter("TITLE", "MAGNETIC_FIELD_STRENGTH") ||
          0.25;
        const perspectiveMax =
          CRTConfig.getPhysicsParameter("TITLE", "PERSPECTIVE_MAX") || 25;

        // Get wear patterns from central system
        const wearPatterns = window.CRTSystem.getWearPatterns();
        const thermalStress = wearPatterns.thermalStress || 0;
        const magneticWear = wearPatterns.magneticWear || 0;

        const localPhase =
          localState.magneticPhase + letter.normalizedX * Math.PI;
        const wearMultiplier = 1 + magneticWear * 100;
        const fieldIntensity =
          globalIntensity * magneticStrength * wearMultiplier;

        const primaryField = Math.sin(localPhase) * fieldIntensity;
        const secondaryField =
          Math.cos(localPhase * 1.3 + thermalStress * 10) *
          fieldIntensity *
          0.7;
        const thermalDrift =
          Math.sin(localPhase * 0.3) *
          fieldIntensity *
          Math.abs(thermalStress) *
          6;

        const xDisplace = (primaryField + secondaryField + thermalDrift) * 30;
        const yDisplace = (secondaryField * 0.8 + thermalDrift) * 20;
        const rotation = (primaryField * 0.3 + thermalDrift) * 15;

        // Add z-axis movement for dimensional depth
        const zDisplace =
          localState.dimensionalDepth *
          Math.sin(localPhase * 0.5) *
          perspectiveMax *
          globalIntensity;

        return { xDisplace, yDisplace, zDisplace, rotation };
      }

      /* Create phosphor trail for persistence simulation */
      function createPhosphorTrail(letter, intensity) {
        // Get current performance level from central system
        const sysState = window.CRTSystem.getState();
        if (sysState.isLowEndDevice || sysState.performanceLevel === "low")
          return;

        // Enhanced CRT Physics integration for authentic phosphor simulation
        if (window.CRTPhysics) {
          const rect = letter.element.getBoundingClientRect();
          const thermalState = window.CRTPhysics.getThermalState();
          const phosphorStats = window.CRTPhysics.getPhosphorStats();

          // Calculate physics-based phosphor color based on temperature
          let color = { r: 232, g: 227, b: 216 }; // Base P22 phosphor color

          // Apply thermal color shifting (Task 1.4)
          const tempRatio = (thermalState.temperature - 22) / (65 - 22);
          color.r = Math.max(180, color.r - tempRatio * 20); // Red shifts down with heat
          color.g = Math.min(255, color.g + tempRatio * 15); // Green shifts up slightly
          color.b = Math.max(200, color.b - tempRatio * 30); // Blue shifts down with heat

          // Create physics-based phosphor particle with enhanced parameters
          const particle = window.CRTPhysics.createPhosphor(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            color,
            intensity * (1 + thermalState.warmupProgress * 0.2) // Intensity varies with warmup
          );

          if (particle) {
            // Phosphor particle created successfully
            return;
          }
        }

        // Fallback to DOM-based trail
        const trailsContainer = document.querySelector(
          ".title-phosphor-trails"
        );
        if (!trailsContainer) return;

        const rect = letter.element.getBoundingClientRect();
        const parentRect = title.getBoundingClientRect();

        // Get temperature-adjusted color from physics engine
        let trailColor = { r: 232, g: 227, b: 216 };
        if (window.CRTPhysics) {
          trailColor = window.CRTPhysics.getTemperatureColor(
            trailColor,
            "GREEN"
          );
        }

        // Create trail element
        const trail = document.createElement("div");
        trail.className = "phosphor-trail";
        trail.textContent = letter.currentChar;

        // Position trail relative to container
        trail.style.cssText = `
          position: absolute;
          left: ${rect.left - parentRect.left}px;
          top: ${rect.top - parentRect.top}px;
          font-size: ${window.getComputedStyle(letter.element).fontSize};
          font-weight: ${window.getComputedStyle(letter.element).fontWeight};
          color: rgba(${trailColor.r}, ${trailColor.g}, ${trailColor.b}, ${
          0.5 * intensity
        });
          opacity: ${intensity * 0.8};
          text-shadow: 
            0 0 ${3 * intensity}px rgba(${trailColor.r}, ${trailColor.g}, ${
          trailColor.b
        }, ${0.6 * intensity}),
            0 0 ${6 * intensity}px rgba(0, 255, 200, ${0.3 * intensity});
          transform: ${letter.element.style.transform || "none"};
          pointer-events: none;
          z-index: -1;
        `;

        trailsContainer.appendChild(trail);
        CRTResource.registerElement(trail);

        // Use physics engine for decay timing
        let persistence = 10; // Default 10ms
        if (window.CRTPhysics) {
          const thermalState = window.CRTPhysics.getThermalState();
          persistence *= 1 + thermalState.temperature * 0.01;
        }

        // Decay animation
        let opacity = intensity * 0.8;
        const decayRate = opacity / (persistence * 0.5);

        const decayInterval = CRTResource.setInterval(
          () => {
            opacity -= decayRate;
            if (opacity <= 0) {
              if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
              }
            } else {
              trail.style.opacity = opacity.toString();
            }
          },
          16.67,
          { purpose: "phosphor-trail-decay" }
        );
      }

      /* Create character fragments for decomposition effect */
      function createCharacterFragments(letter, intensity) {
        const sysState = window.CRTSystem.getState();
        if (
          sysState.isLowEndDevice ||
          sysState.performanceLevel === "low" ||
          letter.glitchState.fragmentsActive
        )
          return;

        letter;

        // Store original letter position and styling
        const rect = letter.element.getBoundingClientRect();
        const parentRect = title.getBoundingClientRect();
        const styles = window.getComputedStyle(letter.element);

        // Hide original letter temporarily
        const originalVisibility = letter.element.style.visibility;
        letter.element.style.visibility = "hidden";

        // Create 2-4 fragments
        const fragmentCount = Math.floor(2 + Math.random() * 3);
        const fragments = [];

        for (let i = 0; i < fragmentCount; i++) {
          const fragment = document.createElement("div");
          fragment.className = "letter-fragment";
          fragment.textContent = letter.currentChar;

          // Apply a random fragment preset
          const preset =
            fragmentPresets[Math.floor(Math.random() * fragmentPresets.length)];

          // Calculate random displacement
          const xOffset = (Math.random() - 0.5) * 30 * intensity;
          const yOffset = (Math.random() - 0.5) * 30 * intensity;
          const rotationZ = (Math.random() - 0.5) * 40 * intensity;

          // Position fragment
          fragment.style.cssText = `
            position: absolute;
            left: ${rect.left - parentRect.left}px;
            top: ${rect.top - parentRect.top}px;
            font-size: ${styles.fontSize};
            font-weight: ${styles.fontWeight};
            color: ${styles.color};
            text-shadow: ${styles.textShadow};
            transform: translate(${xOffset}px, ${yOffset}px) rotate(${rotationZ}deg);
            clip: ${preset.clip};
            pointer-events: none;
            z-index: 25;
          `;

          title.appendChild(fragment);
          fragments.push(fragment);
          CRTResource.registerElement(fragment);
        }

        // Get fragment duration from config
        const fragmentDuration = CRTConfig.getEffectDuration("FRAGMENT") || 700;

        // Restore original letter after fragments are done
        const fragmentTimer = CRTResource.setTimeout(
          () => {
            fragments.forEach((fragment) => {
              if (fragment.parentNode) {
                fragment.parentNode.removeChild(fragment);
              }
            });
            letter.glitchState.fragmentsActive = false;
            letter.element.style.visibility = originalVisibility;
          },
          fragmentDuration,
          { purpose: "character-fragment" }
        );
      }

      /* Create phosphor bloom effect */
      function createPhosphorBloom(letter, intensity) {
        const sysState = window.CRTSystem.getState();
        if (sysState.isLowEndDevice || sysState.performanceLevel === "low")
          return;

        // Create bloom overlay
        const rect = letter.element.getBoundingClientRect();
        const bloom = document.createElement("div");
        bloom.className = "phosphor-bloom";

        // Apply bloom styles
        bloom.style.cssText = `
          position: absolute;
          left: ${rect.left}px;
          top: ${rect.top}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            rgba(0, 255, 200, ${0.4 * intensity}) 0%,
            rgba(0, 255, 200, ${0.2 * intensity}) 40%,
            rgba(0, 255, 200, 0) 70%
          );
          filter: blur(${4 * intensity}px);
          pointer-events: none;
          z-index: 24;
          opacity: ${intensity * 0.8};
        `;

        document.body.appendChild(bloom);
        CRTResource.registerElement(bloom);

        // Get bloom duration from config
        const bloomDuration = CRTConfig.getEffectDuration("BLOOM") || 350;

        // Animate bloom expansion and fade
        let scale = 1;
        let opacity = intensity * 0.8;

        const bloomInterval = CRTResource.setInterval(
          () => {
            scale += 0.05;
            opacity -= 0.03;

            bloom.style.transform = `scale(${scale})`;
            bloom.style.opacity = opacity.toString();

            if (opacity <= 0) {
              clearInterval(bloomInterval);
              if (bloom.parentNode) {
                bloom.parentNode.removeChild(bloom);
              }
            }
          },
          16,
          { purpose: "phosphor-bloom" }
        );
      }

      /* Apply comprehensive glitch effects to a letter */
      function applyOptimizedGlitch(letter, baseIntensity) {
        // Get thresholds from config
        const thresholds = {
          RGB_SEPARATION:
            CRTConfig.getThreshold("TITLE", "RGB_SEPARATION") || 0.4,
          CHARACTER_REPLACE:
            CRTConfig.getThreshold("TITLE", "CHARACTER_REPLACE") || 0.5,
          BRIGHTNESS_MOD:
            CRTConfig.getThreshold("TITLE", "BRIGHTNESS_MOD") || 0.3,
          PHOSPHOR_TRAIL:
            CRTConfig.getThreshold("TITLE", "PHOSPHOR_TRAIL") || 0.6,
          CASCADE_TRIGGER:
            CRTConfig.getThreshold("TITLE", "CASCADE_TRIGGER") || 0.7,
          Z_MOVEMENT: CRTConfig.getThreshold("TITLE", "Z_MOVEMENT") || 0.6,
          DECOMPOSITION:
            CRTConfig.getThreshold("TITLE", "DECOMPOSITION") || 0.8,
        };

        // Get system state
        const sysState = window.CRTSystem.getState();

        let effectiveIntensity = baseIntensity;

        /* Apply thermal effects from physics engine */
        if (window.CRTPhysics) {
          const thermalState = window.CRTPhysics.getThermalState();
          effectiveIntensity *= 1 + thermalState.warmupProgress * 0.3;

          // Apply thermal styling to the letter
          window.CRTPhysics.applyThermalEffects(letter.element);
        }

        /* System state modulation */
        if (sysState.mode === "stable") {
          effectiveIntensity *= 0.6 - sysState.thermalLevel * 0.3;
        } else {
          effectiveIntensity *= 1.2 + sysState.thermalLevel * 0.6;
        }

        /* Apply intensity factor from system */
        effectiveIntensity *= window.CRTSystem.getIntensityFactor();

        /* Magnetic distortion with dimensional depth */
        const distortion = calculateMagneticDistortion(
          letter,
          effectiveIntensity
        );

        // Apply 3D transform with perspective for dimensional depth
        if (effectiveIntensity > thresholds.Z_MOVEMENT) {
          letter.element.style.transform = `translate3d(${
            distortion.xDisplace
          }px, ${distortion.yDisplace}px, ${distortion.zDisplace}px) 
             rotate3d(${Math.random()}, ${Math.random()}, ${Math.random()}, ${
            distortion.rotation
          }deg)`;

          // Enhanced 3D effect with perspective
          title.style.perspective = "800px";
          title.style.perspectiveOrigin = "50% 50%";
          title.style.transformStyle = "preserve-3d";
        } else {
          letter.element.style.transform = `translate(${distortion.xDisplace}px, ${distortion.yDisplace}px) rotate(${distortion.rotation}deg)`;
        }

        /* Ensure transform isolation */
        letter.element.style.position = "relative";
        letter.element.style.display = "inline-block";
        letter.element.style.zIndex = "1";

        // Enhanced RGB convergence error effects with physics-based convergence
        if (effectiveIntensity > thresholds.RGB_SEPARATION) {
          let convergenceError = { red: {}, green: {}, blue: {} };

          // Use enhanced physics engine convergence calculation (Task 1.4)
          if (window.CRTPhysics) {
            try {
              convergenceError = window.CRTPhysics.getConvergenceError();
              const thermalState = window.CRTPhysics.getThermalState();
              const scanPosition = window.CRTPhysics.getScanPosition();

              // Apply thermal and scan-position based modifications
              const tempMultiplier = 1 + (thermalState.temperature - 22) * 0.01;
              const scanMultiplier = 1 + Math.abs(scanPosition.x - 0.5) * 0.3; // Worse near edges

              // Enhance convergence based on physics state - with safe parsing
              if (convergenceError.red && convergenceError.red.textShadow) {
                const match =
                  convergenceError.red.textShadow.match(/([-\d.]+)px/);
                const baseOffset = match ? parseFloat(match[1]) : 0.5;
                const enhancedOffset =
                  baseOffset *
                  tempMultiplier *
                  scanMultiplier *
                  (1 + letter.normalizedX * 0.5);
                convergenceError.red.textShadow = `${enhancedOffset}px 0 rgba(255, 64, 32, ${
                  effectiveIntensity * 0.7
                })`;
              } else {
                // Create default red convergence
                const baseOffset =
                  0.5 *
                  tempMultiplier *
                  scanMultiplier *
                  (1 + letter.normalizedX * 0.5);
                convergenceError.red = {
                  textShadow: `${baseOffset}px 0 rgba(255, 64, 32, ${
                    effectiveIntensity * 0.7
                  })`,
                };
              }

              if (convergenceError.blue && convergenceError.blue.textShadow) {
                const match =
                  convergenceError.blue.textShadow.match(/([-\d.]+)px/);
                const baseOffset = match ? parseFloat(match[1]) : -0.5;
                const enhancedOffset =
                  baseOffset *
                  tempMultiplier *
                  scanMultiplier *
                  (1 + letter.normalizedX * 0.3);
                convergenceError.blue.textShadow = `${enhancedOffset}px 0 rgba(64, 128, 255, ${
                  effectiveIntensity * 0.7
                })`;
              } else {
                // Create default blue convergence
                const baseOffset =
                  -0.5 *
                  tempMultiplier *
                  scanMultiplier *
                  (1 + letter.normalizedX * 0.3);
                convergenceError.blue = {
                  textShadow: `${baseOffset}px 0 rgba(64, 128, 255, ${
                    effectiveIntensity * 0.7
                  })`,
                };
              }
            } catch (error) {
              console.warn("[Title] Physics convergence error:", error);
              // Fall back to basic convergence
              convergenceError = {
                red: {
                  textShadow: `0.8px 0 rgba(255, 64, 32, ${
                    effectiveIntensity * 0.7
                  })`,
                },
                blue: {
                  textShadow: `-0.8px 0 rgba(64, 128, 255, ${
                    effectiveIntensity * 0.7
                  })`,
                },
              };
            }
          } else {
            // Fallback convergence calculation
            const convergenceBase =
              CRTConfig.getPhysicsParameter(
                "TITLE",
                "CONVERGENCE_ERROR_BASE"
              ) || 0.9;
            const wearPatterns = window.CRTSystem.getWearPatterns();
            const convergenceWear = wearPatterns.convergenceWear || 0;

            const error = convergenceBase * (1.5 + letter.normalizedX * 0.8);
            const redOffset = error * (1 + convergenceWear);
            const blueOffset = error * (1 + convergenceWear * 0.8);

            convergenceError = {
              red: {
                textShadow: `${redOffset * 0.8}px 0 rgba(255, 64, 32, ${
                  effectiveIntensity * 0.7
                })`,
              },
              blue: {
                textShadow: `${-blueOffset * 0.8}px 0 rgba(64, 128, 255, ${
                  effectiveIntensity * 0.7
                })`,
              },
            };
          }

          const shadowLayers = [
            convergenceError.red.textShadow,
            convergenceError.blue.textShadow,
            `0 0 ${effectiveIntensity * 12}px rgba(232, 227, 216, ${
              effectiveIntensity * 0.5
            })`,
            `0 0 ${effectiveIntensity * 24}px rgba(0, 255, 200, ${
              effectiveIntensity * 0.25
            })`,
          ];

          letter.element.style.textShadow = shadowLayers.join(", ");
        }

        // Character replacement with partial corruption
        if (effectiveIntensity > thresholds.CHARACTER_REPLACE) {
          // Get glitch characters from config
          const glitchChars = CRTConfig.getGlitchCharacters("DEFAULT");

          // Reduce replace chance by 25%
          const letterWear = 0; // TODO: Track per-letter wear in unified system
          const replaceChance = 0.45 + letterWear * 2.5;

          if (Math.random() < replaceChance) {
            // Enhanced partial character corruption
            let newChar = letter.originalChar;

            // 70% chance of full replacement, 30% chance of partial corruption
            if (Math.random() < 0.7) {
              newChar =
                glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
              // Partial corruption - replace part of the character
              const parts = letter.originalChar.split("");
              const corruptIndex = Math.floor(Math.random() * parts.length);
              parts[corruptIndex] =
                glitchChars[Math.floor(Math.random() * glitchChars.length)];
              newChar = parts.join("");
            }

            letter.element.textContent = newChar;
            letter.currentChar = newChar;

            // Get character restore delay from config
            const restoreDelay =
              CRTConfig.getEffectDuration("CHARACTER_RESTORE") || 120;

            const restoreTimer = CRTResource.setTimeout(
              () => {
                if (letter.element.textContent === newChar) {
                  letter.element.textContent = letter.originalChar;
                  letter.currentChar = letter.originalChar;
                }
              },
              restoreDelay + Math.random() * 40,
              { purpose: "character-restore" }
            );
          }
        }

        // Brightness modulation with phosphor glow simulation
        if (effectiveIntensity > thresholds.BRIGHTNESS_MOD) {
          const brightness = 0.7 + effectiveIntensity * 0.6;
          const contrast = 1 + effectiveIntensity * 0.4;
          letter.element.style.filter = `brightness(${brightness}) contrast(${contrast})`;
        }

        // Phosphor persistence trail effect with physics integration
        if (effectiveIntensity > thresholds.PHOSPHOR_TRAIL) {
          letter.element.classList.add("phosphor-glow");
          createPhosphorTrail(letter, effectiveIntensity);

          const glowTimer = CRTResource.setTimeout(
            () => {
              letter.element.classList.remove("phosphor-glow");
            },
            200 + Math.random() * 150,
            { purpose: "phosphor-glow" }
          );
        }

        // Apply phosphor bloom effect
        if (effectiveIntensity > 0.8 && Math.random() < 0.3) {
          createPhosphorBloom(letter, effectiveIntensity);
        }

        // Character decomposition for extreme glitches
        if (
          effectiveIntensity > thresholds.DECOMPOSITION &&
          Math.random() < 0.25 &&
          !letter.glitchState.fragmentsActive
        ) {
          createCharacterFragments(letter, effectiveIntensity);
        }

        // Trigger cascade for extreme intensity - with reduced probability
        if (
          effectiveIntensity > thresholds.CASCADE_TRIGGER &&
          Math.random() < 0.5
        ) {
          window.CRTSystem.triggerCascade(effectiveIntensity, SYSTEM_ID);
        }
      }

      /* Main glitch system loop with unified system integration */
      function runOptimizedGlitchSystem(currentTime) {
        // Get system state with fallback
        const sysState = window.CRTSystem
          ? window.CRTSystem.getState()
          : {
              enabled: true,
              performanceLevel: "high",
              isLowEndDevice: false,
            };

        // Handle motion pause
        if (!sysState.enabled) {
          letters.forEach((letter) => {
            letter.element.style.transform = "";
            letter.element.style.filter = "";
            letter.element.style.textShadow = "";
            letter.element.textContent = letter.originalChar;
            letter.glitchState.active = false;
          });

          localState.animationFrameId = requestAnimationFrame(
            runOptimizedGlitchSystem
          );
          if (window.CRTResource) {
            CRTResource.registerAnimation(localState.animationFrameId);
          }
          return;
        }

        // Frame rate limiting with central system or fallback
        const targetFPS = window.CRTSystem
          ? window.CRTSystem.getTargetFPS()
          : 30;
        const frameInterval = 1000 / targetFPS;

        if (currentTime - localState.lastFrameTime < frameInterval) {
          localState.animationFrameId = requestAnimationFrame(
            runOptimizedGlitchSystem
          );
          if (window.CRTResource) {
            CRTResource.registerAnimation(localState.animationFrameId);
          }
          return;
        }

        localState.lastFrameTime = currentTime;

        // Skip expensive operations on low-end devices
        if (sysState.performanceLevel !== "low") {
          // Update phase for magnetic effects
          localState.magneticPhase += sysState.isLowEndDevice ? 0.015 : 0.025;
        }

        // Get glitch cooldown from config with fallback (reduced for testing)
        const glitchCooldown = window.CRTConfig
          ? CRTConfig.getSystemCooldown("TITLE_GLITCH") || 300
          : 300;

        // Check cooldown between glitches
        const timeSinceLastGlitch = currentTime - localState.lastGlitchTime;
        if (timeSinceLastGlitch < glitchCooldown) {
          localState.animationFrameId = requestAnimationFrame(
            runOptimizedGlitchSystem
          );
          if (window.CRTResource) {
            CRTResource.registerAnimation(localState.animationFrameId);
          }
          return;
        }

        // Check if we can run effect through unified system or use fallback
        const canRunEffect = window.CRTSystem
          ? window.CRTSystem.requestEffect("TITLE", 0.5, SYSTEM_ID)
          : true;

        if (localState.activeGlitchCount > 0 || !canRunEffect) {
          localState.animationFrameId = requestAnimationFrame(
            runOptimizedGlitchSystem
          );
          CRTResource.registerAnimation(localState.animationFrameId);
          return;
        }

        // Get wear patterns from unified system
        const wearPatterns = window.CRTSystem.getWearPatterns();

        // Organic base intensity with system state influence
        const systemWear = Math.min(wearPatterns.magneticWear * 4, 0.4);
        const isStrongGlitch = Math.random() < 0.2;

        let baseIntensity = isStrongGlitch
          ? 0.5 + Math.random() * 0.3
          : Math.random() * 0.3 + systemWear;

        // System state modulation with reduced intensity
        if (sysState.mode === "stable") {
          baseIntensity *= 0.7 - sysState.thermalLevel * 0.3;
        } else {
          baseIntensity *= 1.1 + sysState.thermalLevel * 0.5;
        }

        // Apply glitches to letters with reduced probability
        const maxGlitches = sysState.isLowEndDevice ? 1 : 2;
        localState.activeGlitchCount = 0;

        // Get glitch probability from config (increased for testing)
        const glitchProbability = window.CRTConfig
          ? CRTConfig.EFFECT_PROBABILITIES?.TITLE?.BASE_GLITCH_CHANCE || 0.3
          : 0.3;

        // Only apply glitches with reasonable probability
        if (Math.random() < glitchProbability) {
          localState.lastGlitchTime = currentTime;

          letters.forEach((letter) => {
            const timeSinceLastGlitch =
              currentTime - letter.glitchState.lastGlitch;

            // Get minimum time between glitches (reduced for more activity)
            const minGlitchInterval = 200;

            // Increased glitch chance for visibility
            const organicGlitchChance =
              0.3 +
              Math.abs(wearPatterns.thermalStress) * 0.08 +
              wearPatterns.magneticWear * 0.1;

            const shouldGlitch =
              Math.random() < organicGlitchChance &&
              localState.activeGlitchCount < maxGlitches &&
              timeSinceLastGlitch > minGlitchInterval;

            if (shouldGlitch) {
              const localIntensity =
                baseIntensity * (0.6 + Math.random() * 0.5);
              applyOptimizedGlitch(letter, localIntensity);
              letter.glitchState.active = true;
              letter.glitchState.intensity = localIntensity;
              letter.glitchState.lastGlitch = currentTime;
              localState.activeGlitchCount++;
            } else if (letter.glitchState.active) {
              letter.glitchState.intensity *= 0.8; // Faster decay
              if (letter.glitchState.intensity < 0.05) {
                letter.element.style.transform = "";
                letter.element.style.filter = "";
                letter.element.style.textShadow = "";
              }
            }
          });

          // Complete effect after duration
          if (localState.activeGlitchCount > 0) {
            CRTResource.setTimeout(
              () => {
                window.CRTSystem.completeEffect("TITLE", SYSTEM_ID);
                localState.activeGlitchCount = 0;
              },
              300,
              { purpose: "effect-completion" }
            );
          }
        }

        localState.animationFrameId = requestAnimationFrame(
          runOptimizedGlitchSystem
        );
        CRTResource.registerAnimation(localState.animationFrameId);
      }

      /* Start glitch system with proper integration */
      function start() {
        // Ensure CRTSystem is available and initialized
        if (!window.CRTSystem || !window.CRTSystem.isInitialized()) {
          console.warn(
            "[Title] CRTSystem not ready, attempting fallback initialization"
          );
          // Fallback - start without CRTSystem
          localState.animationFrameId = requestAnimationFrame(
            runOptimizedGlitchSystem
          );
          if (window.CRTResource) {
            CRTResource.registerAnimation(localState.animationFrameId);
          }
          return;
        }

        // Register with unified system
        try {
          window.CRTSystem.registerSystem(SYSTEM_ID, {
            type: "visual",
            element: title,
            active: false,
          });

          // Get startup delay from unified system
          const startupDelay = window.CRTSystem.getStartupDelay("TITLE") || 800;

          // Initialize with staggered startup
          const initTimer = CRTResource.setTimeout(
            () => {
              localState.animationFrameId = requestAnimationFrame(
                runOptimizedGlitchSystem
              );
              CRTResource.registerAnimation(localState.animationFrameId);
            },
            startupDelay,
            { purpose: "system-startup" }
          );
        } catch (error) {
          console.error("[Title] Failed to register with CRTSystem:", error);
          // Emergency fallback
          localState.animationFrameId = requestAnimationFrame(
            runOptimizedGlitchSystem
          );
          if (window.CRTResource) {
            CRTResource.registerAnimation(localState.animationFrameId);
          }
        }

        // Listen for global cascade events
        const cascadeHandler = (event) => {
          if (event.detail.origin === SYSTEM_ID) return;

          const intensity = event.detail.intensity || 0;
          if (intensity > 0.6) {
            localState.dimensionalDepth = Math.min(1, intensity * 1.2);

            const dimensionShiftDuration =
              CRTConfig.getEffectDuration("DIMENSION_SHIFT") || 200;

            CRTResource.setTimeout(
              () => {
                localState.dimensionalDepth *= 0.5;
              },
              dimensionShiftDuration,
              { purpose: "dimension-shift" }
            );
          }
        };

        window.addEventListener("crtCascade", cascadeHandler);
        CRTResource.registerListener(window, "crtCascade", cascadeHandler);
      }

      /* Stop glitch system and clean up */
      function stop() {
        if (localState.animationFrameId) {
          cancelAnimationFrame(localState.animationFrameId);
        }

        // Restore all letters
        letters.forEach((letter) => {
          letter.element.style.transform = "";
          letter.element.style.filter = "";
          letter.element.style.textShadow = "";
          letter.element.textContent = letter.originalChar;
        });

        // Unregister from unified system
        window.CRTSystem.unregisterSystem(SYSTEM_ID);
      }

      // Initialize letters
      initializeLetters();

      // Return public API
      return {
        start,
        stop,
        title,
        letters,
      };
    },
  };

  // Check for system availability and initialize
  function initializeTitleGlitch() {
    if (!window.CRTSystem || !window.CRTSystem.isInitialized()) {
      console.log("[Title] Waiting for CRT system initialization...");
      setTimeout(initializeTitleGlitch, 100);
      return;
    }

    if (!window.CRTConfig) {
      console.warn(
        "[Title] CRTConfig not available, system may not function properly"
      );
    }

    if (!window.CRTResource) {
      console.warn(
        "[Title] CRTResource not available, system may not clean up properly"
      );
    }

    // Create and start title glitch system
    const titleGlitch = TitleGlitchFactory.create("glitch-title");
    if (titleGlitch) {
      titleGlitch.start();

      // Store reference for cleanup
      window.TitleGlitch = titleGlitch;
    }
  }

  // Initialize when ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.addEventListener("crtSystemReady", initializeTitleGlitch);
      // Fallback initialization
      setTimeout(initializeTitleGlitch, 500);
    });
  } else {
    window.addEventListener("crtSystemReady", initializeTitleGlitch);
    // Fallback initialization
    setTimeout(initializeTitleGlitch, 500);
  }
})();
