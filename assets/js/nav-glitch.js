/*
 * CRT Navigation Glitch System  
 * Simulates CRT magnetic deflection errors affecting navigation elements
 * Physics: Magnetic coil interference creates geometric distortion patterns
 * Implementation: CSS transform manipulation with unified system coordination
 * Performance: Adaptive complexity reduction, shared state management
 */
(function() {
  "use strict";

  /* System ID for registration with CRTSystem */
  const SYSTEM_ID = 'nav-glitch';

  /* Factory pattern for navigation glitch system */
  const NavGlitchFactory = {
    create(elementId) {
      const navContainer = document.getElementById(elementId || 'nav-list');
      if (!navContainer) {
        console.warn('[Nav] Element not found:', elementId || 'nav-list');
        return null;
      }

      const navLinks = navContainer.querySelectorAll('a');
      if (!navLinks.length) {
        console.warn('[Nav] No navigation links found');
        return null;
      }

      /* CRT phosphor colors for navigation */
      const phosphorColors = {
        red: 'rgba(255, 64, 32, 0.8)',
        green: 'rgba(32, 255, 64, 0.8)',
        blue: 'rgba(64, 128, 255, 0.8)'
      };

      /* Local system state */
      const localState = {
        globalMagneticPhase: 0,              /* Magnetic phase for navigation */
        lastFrameTime: 0,                    /* Frame timing state */
        trackingErrors: [],                  /* Active tracking error elements */
        magneticAttractions: {},             /* Per-link magnetic attraction */
        dropoutActive: false,                /* Whether color dropout is active */
        audioAmplitude: 0,                   /* Current audio reactivity */
        cursorPosition: { x: -1000, y: -1000 }, /* Cursor position for magnetic effects */
        animationFrameId: null               /* Current animation frame */
      };

      /* Link state management with enhanced tracking */
      const linkStates = [];
      navLinks.forEach((link, index) => {
        linkStates.push({
          element: link,
          originalText: link.textContent,
          normalizedX: index / (navLinks.length - 1),
          glitchState: {
            active: false,
            intensity: 0,
            lastGlitch: 0
          },
          /* Nav-specific states */
          magneticState: {
            attraction: 0,
            lastAttraction: 0,
            focusIntensity: 0
          },
          audioReactiveState: {
            lastPeak: 0,
            peakIntensity: 0
          },
          vhsState: {
            dropoutActive: false,
            trackingErrorActive: false,
            lastDropout: 0
          }
        });
      });

      /* Apply tracking error effect */
      function applyTrackingError() {
        const sysState = window.CRTSystem.getState();
        if (localState.trackingErrors.length >= 2 || sysState.isLowEndDevice) return;
        
        // Get tracking error amplitude from config
        const trackingErrorAmplitude = CRTConfig.getPhysicsParameter('NAV', 'TRACKING_ERROR_AMPLITUDE') || 4;
        
        // Get wear patterns from unified system
        const wearPatterns = window.CRTSystem.getWearPatterns();
        const trackingWear = wearPatterns.trackingWear || 0;
        
        // Create tracking error line element
        const trackingLine = document.createElement('div');
        trackingLine.className = 'nav-tracking-error';
        
        // Get container dimensions
        const rect = navContainer.getBoundingClientRect();
        const yPosition = Math.random() * rect.height;
        
        // Calculate tracking error intensity
        const intensity = 0.6 + Math.random() * 0.4;
        const errorAmplitude = trackingErrorAmplitude * (1 + trackingWear * 10);
        
        // Apply tracking line styles
        trackingLine.style.cssText = `
          position: absolute;
          left: 0;
          top: ${yPosition}px;
          width: 100%;
          height: ${errorAmplitude}px;
          background: rgba(255, 255, 255, ${intensity * 0.5});
          box-shadow: 
            0 0 ${errorAmplitude}px rgba(255, 255, 255, ${intensity * 0.4}),
            0 0 ${errorAmplitude * 2}px rgba(0, 255, 200, ${intensity * 0.3});
          z-index: 22;
          pointer-events: none;
          transform: translateY(0);
        `;
        
        navContainer.appendChild(trackingLine);
        CRTResource.registerElement(trackingLine);
        
        // Store tracking error state
        localState.trackingErrors.push({
          element: trackingLine,
          startTime: performance.now(),
          intensity: intensity
        });
        
        console.log('[Nav] Tracking error applied');
        
        // Get tracking error duration from config
        const trackingErrorDuration = CRTConfig.getEffectDuration('TRACKING_ERROR') || 500;
        
        // Animate tracking error
        const trackingAnimation = () => {
          const currentTime = performance.now();
          const elapsed = currentTime - localState.trackingErrors[0].startTime;
          
          if (elapsed >= trackingErrorDuration) {
            // Remove expired tracking error
            const error = localState.trackingErrors.shift();
            if (error.element.parentNode) {
              error.element.parentNode.removeChild(error.element);
            }
            return;
          }
          
          // VHS tracking jitter simulation
          const jitterY = (Math.random() - 0.5) * errorAmplitude * 0.5;
          trackingLine.style.transform = `translateY(${jitterY}px)`;
          
          // Continue animation
          const animTimer = requestAnimationFrame(trackingAnimation);
          CRTResource.registerAnimation(animTimer);
        };
        
        const animTimer = requestAnimationFrame(trackingAnimation);
        CRTResource.registerAnimation(animTimer);
      }
      
      /* Apply navigation color effects */
      function applyNavColorEffects(linkState, effectIntensity) {
        // Get RGB separation threshold from config
        const rgbSeparationThreshold = CRTConfig.getThreshold('NAV', 'RGB_SEPARATION') || 0.3;
        
        if (effectIntensity < rgbSeparationThreshold) return;
        
        const hueShift = (Math.random() - 0.5) * effectIntensity * 60;
        const saturation = 1 + effectIntensity * 0.5;
        const brightness = 0.8 + effectIntensity * 0.4;
        
        linkState.element.style.filter = `
          hue-rotate(${hueShift}deg) 
          saturate(${saturation})
          brightness(${brightness})
        `;
        
        const resetTimer = CRTResource.setTimeout(() => {
          linkState.element.style.filter = '';
        }, 150 + Math.random() * 200, { purpose: 'color-effect-reset' });
      }
      
      /* Apply VHS dropout effect to navigation */
      function applyNavDropoutEffect(linkState, intensity) {
        // Get dropout threshold from config
        const dropoutThreshold = CRTConfig.getThreshold('NAV', 'DROPOUT_MIN') || 0.7;
        
        const sysState = window.CRTSystem.getState();
        
        if (linkState.vhsState.dropoutActive || 
            localState.dropoutActive || 
            intensity < dropoutThreshold ||
            sysState.isLowEndDevice) return;
        
        linkState.vhsState.dropoutActive = true;
        localState.dropoutActive = true;
        
        // Store original colors
        const originalColor = window.getComputedStyle(linkState.element).color;
        const originalTextShadow = linkState.element.style.textShadow;
        
        // Calculate dropout color - authentic VHS color loss
        let dropoutColor;
        const dropoutType = Math.random();
        
        if (dropoutType < 0.33) {
          // Red dropout - only green and blue remain
          dropoutColor = 'rgba(0, 200, 255, 0.7)';
        } else if (dropoutType < 0.66) {
          // Green dropout - only red and blue remain
          dropoutColor = 'rgba(255, 0, 255, 0.7)';
        } else {
          // Blue dropout - only red and green remain
          dropoutColor = 'rgba(255, 200, 0, 0.7)';
        }
        
        // Apply dropout effect
        linkState.element.style.color = dropoutColor;
        linkState.element.style.textShadow = 'none';
        
        // Create glitchy static overlay
        const staticOverlay = document.createElement('div');
        staticOverlay.className = 'nav-static-overlay';
        
        const rect = linkState.element.getBoundingClientRect();
        staticOverlay.style.cssText = `
          position: absolute;
          left: ${rect.left}px;
          top: ${rect.top}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMDEwMTAiLz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMTAxMDEwIi8+PC9zdmc+');
          opacity: ${intensity * 0.3};
          mix-blend-mode: screen;
          pointer-events: none;
          z-index: 23;
        `;
        
        document.body.appendChild(staticOverlay);
        CRTResource.registerElement(staticOverlay);
        
        // Get dropout duration from config
        const dropoutDuration = CRTConfig.getEffectDuration('DROPOUT') || 200;
        
        // Restore after dropout duration
        const restoreTimer = CRTResource.setTimeout(() => {
          linkState.element.style.color = originalColor;
          linkState.element.style.textShadow = originalTextShadow;
          linkState.vhsState.dropoutActive = false;
          localState.dropoutActive = false;
          
          if (staticOverlay.parentNode) {
            staticOverlay.parentNode.removeChild(staticOverlay);
          }
        }, dropoutDuration, { purpose: 'dropout-restore' });
      }
      
      /* Add phosphor glow effects to navigation links */
      function addNavPhosphorEffects(linkState, effectIntensity) {
        if (effectIntensity > 0.6) {
          linkState.element.classList.add('phosphor-glow');
          
          const glowTimer = CRTResource.setTimeout(() => {
            linkState.element.classList.remove('phosphor-glow');
          }, 300 + Math.random() * 200, { purpose: 'phosphor-glow' });
        }
      }

      /* Apply color bleeding between navigation links */
      function applyNavColorBleeding(linkState, effectIntensity) {
        // Get RGB separation threshold from config
        const rgbSeparationThreshold = CRTConfig.getThreshold('NAV', 'RGB_SEPARATION') || 0.3;
        
        if (effectIntensity < rgbSeparationThreshold) return;
        
        // Get color bleed range from config
        const colorBleedRange = CRTConfig.getPhysicsParameter('NAV', 'COLOR_BLEED_RANGE') || 2;
        
        const currentIndex = linkStates.indexOf(linkState);
        
        linkStates.forEach((sibling, index) => {
          const distance = Math.abs(index - currentIndex);
          if (distance <= colorBleedRange && distance > 0) {
            const bleedIntensity = effectIntensity * 0.3 * (1 / distance);
            
            if (bleedIntensity > 0.1) {
              const hueShift = (Math.random() - 0.5) * 40;
              sibling.element.style.filter = `
                hue-rotate(${hueShift}deg) 
                saturate(${1.3 + bleedIntensity * 0.7})
                brightness(${1 + bleedIntensity * 0.4})
              `;
              
              const resetTimer = CRTResource.setTimeout(() => {
                sibling.element.style.filter = '';
              }, 150 + Math.random() * 200, { purpose: 'color-bleed-reset' });
            }
          }
        });
      }

      /* Apply interlacing effects to navigation links */
      function applyNavInterlacing(linkState, effectIntensity) {
        // Get interlace flicker chance from config
        const interlaceFlickerChance = CRTConfig.getPhysicsParameter('NAV', 'INTERLACE_FLICKER_CHANCE') || 0.4;
        
        if (Math.random() < interlaceFlickerChance) {
          const linkIndex = linkStates.indexOf(linkState);
          const isEvenField = linkIndex % 2 === 0;
          const flickerOffset = isEvenField ? -0.3 : 0.3;
          
          linkState.element.style.transform += ` translateY(${flickerOffset}px)`;
          linkState.element.style.opacity = isEvenField ? 0.9 : 1.0;
          
          // Get flicker interval from config
          const flickerInterval = CRTConfig.TIMING.INTERVALS.FLICKER || 33;
          
          // Physics: Field flicker at 60fps interlace rate
          const flickerCount = 2 + Math.floor(Math.random() * 3);
          let flickers = 0;
          
          const flickerIntervalId = CRTResource.setInterval(() => {
            linkState.element.style.opacity = linkState.element.style.opacity === '1' ? '0.9' : '1';
            flickers++;
            
            if (flickers >= flickerCount) {
              clearInterval(flickerIntervalId);
              linkState.element.style.opacity = '';
            }
          }, flickerInterval, { purpose: 'interlace-flicker' });
        }
      }

      /* Calculate magnetic distortion for navigation links */
      function calculateMagneticDistortion(linkState, globalIntensity) {
        // Get magnetic field strength from config
        const magneticFieldStrength = CRTConfig.getPhysicsParameter('NAV', 'MAGNETIC_FIELD_STRENGTH') || 0.4;
        
        // Get wear patterns from unified system
        const wearPatterns = window.CRTSystem.getWearPatterns();
        const magneticWear = wearPatterns.magneticWear || 0;
        const thermalStress = wearPatterns.thermalStress || 0;
        
        const localPhase = localState.globalMagneticPhase + (linkState.normalizedX * Math.PI);
        const wearMultiplier = 1 + magneticWear * 120;
        const fieldIntensity = globalIntensity * magneticFieldStrength * wearMultiplier;
        
        // Physics: Multiple magnetic field interactions create complex distortion
        const primaryField = Math.sin(localPhase) * fieldIntensity;
        const secondaryField = Math.cos(localPhase * 1.3 + thermalStress * 12) * fieldIntensity * 0.7;
        const thermalDrift = Math.sin(localPhase * 0.3) * fieldIntensity * thermalStress * 8;
        const chaosField = Math.sin(localPhase * 2.7 + Math.random() * Math.PI) * fieldIntensity * 0.5;
        
        // Implementation: Enhanced displacement calculations
        const xDisplace = (primaryField + secondaryField + thermalDrift + chaosField) * 40;
        const yDisplace = (secondaryField * 0.8 + thermalDrift + chaosField * 0.6) * 24;
        const rotation = (primaryField * 0.3 + thermalDrift + chaosField * 0.4) * 18;
        
        return { xDisplace, yDisplace, rotation };
      }

      /* Calculate cursor magnetic influence on links */
      function calculateCursorInfluence(linkState) {
        const sysState = window.CRTSystem.getState();
        
        // Skip if no cursor position or feature disabled
        if (localState.cursorPosition.x < 0 || sysState.isLowEndDevice) return { x: 0, y: 0 };
        
        // Get cursor influence parameters from config
        const cursorInfluenceRadius = CRTConfig.getPhysicsParameter('NAV', 'CURSOR_INFLUENCE_RADIUS') || 150;
        const cursorStrength = CRTConfig.getPhysicsParameter('NAV', 'CURSOR_STRENGTH') || 0.25;
        
        // Get element position
        const rect = linkState.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate distance to cursor
        const dx = localState.cursorPosition.x - centerX;
        const dy = localState.cursorPosition.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Skip if beyond influence radius
        if (distance > cursorInfluenceRadius) return { x: 0, y: 0 };
        
        // Calculate influence factor (stronger as cursor gets closer)
        const influenceFactor = 1 - (distance / cursorInfluenceRadius);
        const strength = influenceFactor * cursorStrength;
        
        // Track magnetic attraction state
        linkState.magneticState.attraction = strength;
        
        // Return normalized attraction vector
        return {
          x: dx * strength,
          y: dy * strength
        };
      }
      
      /* Calculate audio reactivity influence */
      function calculateAudioReactivity(linkState) {
        const sysState = window.CRTSystem.getState();
        
        // Skip if no audio reactivity or feature disabled
        if (localState.audioAmplitude < 0.05 || sysState.isLowEndDevice) return 0;
        
        // Get audio reactivity parameter from config
        const audioReactivity = CRTConfig.getPhysicsParameter('NAV', 'AUDIO_REACTIVITY') || 0.04;
        
        // Calculate per-link reactivity - varies across menu items
        const linkIndex = linkStates.indexOf(linkState);
        const normalizedPosition = linkIndex / (linkStates.length - 1);
        const phaseOffset = normalizedPosition * Math.PI * 2; // Distribute phase across menu
        
        // Use sine wave to create wave effect across navigation
        const waveEffect = Math.sin(localState.globalMagneticPhase * 3 + phaseOffset);
        
        // Calculate reactivity intensity
        const reactivity = localState.audioAmplitude * audioReactivity * (0.5 + Math.abs(waveEffect) * 0.5);
        
        // Store peak data for aftereffects
        if (reactivity > linkState.audioReactiveState.peakIntensity) {
          linkState.audioReactiveState.peakIntensity = reactivity;
          linkState.audioReactiveState.lastPeak = performance.now();
        } else {
          // Decay peak intensity over time
          const timeSincePeak = performance.now() - linkState.audioReactiveState.lastPeak;
          if (timeSincePeak > 100) {
            linkState.audioReactiveState.peakIntensity *= 0.95;
          }
        }
        
        return reactivity;
      }
      
      /* Update electron beam focus effect for hover states */
      function updateElectronBeamFocus(linkState, isFocused) {
        const sysState = window.CRTSystem.getState();
        if (sysState.isLowEndDevice) return;
        
        // Get electron focus speed from config
        const electronFocusSpeed = CRTConfig.getPhysicsParameter('NAV', 'ELECTRON_FOCUS_SPEED') || 0.15;
        
        // Target focus intensity
        const targetIntensity = isFocused ? 1.0 : 0.0;
        const currentIntensity = linkState.magneticState.focusIntensity;
        
        // Smooth transition to target
        const newIntensity = currentIntensity + (targetIntensity - currentIntensity) * electronFocusSpeed;
        linkState.magneticState.focusIntensity = newIntensity;
        
        // Apply electron beam focusing effect
        if (newIntensity > 0.01) {
          // Calculate focus glow intensity
          const glowIntensity = Math.min(1, newIntensity * 1.2);
          
          // Apply electron beam focusing effect
          linkState.element.style.textShadow = `
            0 0 ${4 * glowIntensity}px rgba(232, 227, 216, ${0.7 * glowIntensity}),
            0 0 ${8 * glowIntensity}px rgba(0, 255, 200, ${0.4 * glowIntensity})
          `;
          
          // Get focus transition time from config
          const focusTransitionTime = CRTConfig.TIMING.DURATIONS.ELECTRON_FOCUS || 300;
          
          linkState.element.style.transition = `filter ${focusTransitionTime}ms ease-out, 
                                               text-shadow ${focusTransitionTime}ms ease-out`;
          
          // Adjust filter brightness
          linkState.element.style.filter = `brightness(${1 + 0.3 * glowIntensity})`;
        } else if (newIntensity < 0.01 && currentIntensity > 0.01) {
          // Reset styles only when transition is complete
          linkState.element.style.textShadow = '';
          linkState.element.style.filter = '';
          linkState.element.style.transition = '';
        }
      }

      /* Apply optimized distortion to navigation links */
      function applyOptimizedDistortion(linkState, baseIntensity) {
        // Get system state and thresholds
        const sysState = window.CRTSystem.getState();
        const thresholds = {
          RGB_SEPARATION: CRTConfig.getThreshold('NAV', 'RGB_SEPARATION') || 0.3,
          CHARACTER_REPLACE: CRTConfig.getThreshold('NAV', 'CHARACTER_REPLACE') || 0.4,
          BRIGHTNESS_MOD: CRTConfig.getThreshold('NAV', 'BRIGHTNESS_MOD') || 0.2,
          CASCADE_TRIGGER: CRTConfig.getThreshold('NAV', 'CASCADE_TRIGGER') || 0.6,
          MAGNETIC_ATTRACTION: CRTConfig.getThreshold('NAV', 'MAGNETIC_ATTRACTION') || 0.1,
          TRACKING_ERROR: CRTConfig.getThreshold('NAV', 'TRACKING_ERROR') || 0.4,
          DROPOUT_MIN: CRTConfig.getThreshold('NAV', 'DROPOUT_MIN') || 0.7
        };
        
        let effectiveIntensity = baseIntensity;
        
        /* System state modulation */
        if (sysState.mode === "stable") {
          effectiveIntensity *= 0.7 - sysState.thermalLevel * 0.3;
        } else {
          effectiveIntensity *= 1.3 + sysState.thermalLevel * 0.7;
        }

        /* Apply intensity factor from system */
        effectiveIntensity *= window.CRTSystem.getIntensityFactor();

        /* Calculate cursor magnetic influence */
        const cursorInfluence = calculateCursorInfluence(linkState);
        
        /* Calculate audio reactivity */
        const audioReactivity = calculateAudioReactivity(linkState);
        
        /* Combine with standard magnetic distortion */
        const distortion = calculateMagneticDistortion(linkState, effectiveIntensity);
        
        /* Apply combined transform */
        const totalX = distortion.xDisplace + cursorInfluence.x * 40 + audioReactivity * 15 * (Math.random() - 0.5);
        const totalY = distortion.yDisplace + cursorInfluence.y * 40 + audioReactivity * 10 * (Math.random() - 0.5);
        const totalRotation = distortion.rotation + audioReactivity * 20 * (Math.random() - 0.5);
        
        linkState.element.style.transform =
          `translate(${totalX}px, ${totalY}px) rotate(${totalRotation}deg)`;
        
        /* Ensure transform isolation */
        linkState.element.style.position = 'relative';
        linkState.element.style.display = 'inline-block';
        linkState.element.style.zIndex = '1';
        
        // RGB separation effects
        if (effectiveIntensity > thresholds.RGB_SEPARATION || audioReactivity > 0.1) {
          // Get convergence parameters from config
          const convergenceBase = CRTConfig.getPhysicsParameter('NAV', 'CONVERGENCE_ERROR_BASE') || 1.5;
          
          const redOffset = convergenceBase * (1.5 + linkState.normalizedX * 0.6);
          const blueOffset = convergenceBase * (1.5 + (1 - linkState.normalizedX) * 0.6);
          
          const shadowLayers = [
            `${redOffset}px 0 ${phosphorColors.red}`,
            `${-blueOffset}px 0 ${phosphorColors.blue}`,
            `0 0 ${effectiveIntensity * 18}px rgba(232, 227, 216, ${effectiveIntensity * 0.6})`,
            `0 0 ${effectiveIntensity * 35}px rgba(0, 255, 200, ${effectiveIntensity * 0.3})`
          ];
          
          linkState.element.style.textShadow = shadowLayers.join(', ');
        }
        
        // Character replacement with wear
        if (effectiveIntensity > thresholds.CHARACTER_REPLACE) {
          const glitchChars = CRTConfig.getGlitchCharacters('DEFAULT');
          const replaceChance = 0.8;
          
          if (Math.random() < replaceChance) {
            const text = linkState.originalText;
            let newText = '';
            
            for (let i = 0; i < text.length; i++) {
              if (Math.random() < (effectiveIntensity * 0.7)) {
                newText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
              } else {
                newText += text[i];
              }
            }
            
            linkState.element.textContent = newText;
            
            const restoreTimer = CRTResource.setTimeout(() => {
              if (linkState.element.textContent === newText) {
                linkState.element.textContent = linkState.originalText;
              }
            }, CRTConfig.getEffectDuration('CHARACTER_RESTORE') || 120 + Math.random() * 60, { purpose: 'character-restore' });
          }
        }
        
        // Brightness modulation
        if (effectiveIntensity > thresholds.BRIGHTNESS_MOD) {
          const brightness = 0.6 + (effectiveIntensity * 0.8);
          const contrast = 1 + (effectiveIntensity * 0.6);
          linkState.element.style.filter = `brightness(${brightness}) contrast(${contrast})`;
        }
        
        // Apply all signal integration effects
        applyNavColorEffects(linkState, effectiveIntensity);
        applyNavColorBleeding(linkState, effectiveIntensity);
        applyNavInterlacing(linkState, effectiveIntensity);
        addNavPhosphorEffects(linkState, effectiveIntensity);
        
        // Apply VHS dropout effects for extreme glitches
        if (effectiveIntensity > thresholds.DROPOUT_MIN && Math.random() < 0.2) {
          applyNavDropoutEffect(linkState, effectiveIntensity);
        }
        
        // Trigger cascade for extreme intensity
        if (effectiveIntensity > thresholds.CASCADE_TRIGGER) {
          window.CRTSystem.triggerCascade(effectiveIntensity, SYSTEM_ID);
        }
      }

      /* Main glitch system loop with unified system integration */
      function runOptimizedGlitchSystem(currentTime) {
        // Get system state
        const sysState = window.CRTSystem.getState();
        
        // Handle motion pause
        if (!sysState.enabled) {
          linkStates.forEach(linkState => {
            linkState.element.style.transform = '';
            linkState.element.style.filter = '';
            linkState.element.style.textShadow = '';
            linkState.element.textContent = linkState.originalText;
            linkState.glitchState.active = false;
          });
          
          localState.animationFrameId = requestAnimationFrame(runOptimizedGlitchSystem);
          CRTResource.registerAnimation(localState.animationFrameId);
          return;
        }
        
        // Frame rate limiting with central system
        const targetFPS = window.CRTSystem.getTargetFPS();
        const frameInterval = 1000 / targetFPS;
        
        if (currentTime - localState.lastFrameTime < frameInterval) {
          localState.animationFrameId = requestAnimationFrame(runOptimizedGlitchSystem);
          CRTResource.registerAnimation(localState.animationFrameId);
          return;
        }
        
        localState.lastFrameTime = currentTime;
        
        // Skip expensive operations on low-end devices
        if (sysState.performanceLevel !== 'low') {
          // Update phase for magnetic effects
          localState.globalMagneticPhase += sysState.isLowEndDevice ? 0.03 : 0.055;
        }
        
        // Apply tracking error with wear
        const wearPatterns = window.CRTSystem.getWearPatterns();
        const trackingWear = wearPatterns.trackingWear || 0;
        const wearInfluence = trackingWear * 30;
        
        // Get tracking error probability from config
        const trackingErrorProbability = CRTConfig.EFFECT_PROBABILITIES.NAV?.TRACKING_ERROR_CHANCE || 0.0008;
        
        if (Math.random() < (trackingErrorProbability + wearInfluence)) {
          applyTrackingError();
        }
        
        // Update electron beam focus effects for all links
        linkStates.forEach(linkState => {
          // Check if link is being hovered
          const isHovered = linkState.element.matches(':hover');
          updateElectronBeamFocus(linkState, isHovered);
        });
        
        // Check if we can run effect through unified system
        if (!window.CRTSystem.requestEffect('NAV', 0.5, SYSTEM_ID)) {
          localState.animationFrameId = requestAnimationFrame(runOptimizedGlitchSystem);
          CRTResource.registerAnimation(localState.animationFrameId);
          return;
        }
        
        // Organic base intensity with system state influence
        const systemWear = Math.min(wearPatterns.magneticWear * 8, 0.6);
        const isStrongGlitch = Math.random() < 0.4;
        
        let baseIntensity = isStrongGlitch ? 
          (0.8 + Math.random() * 0.5) : 
          (Math.random() * 0.5 + systemWear);
        
        // System state modulation
        if (sysState.mode === "stable") {
          baseIntensity *= 0.7 - sysState.thermalLevel * 0.3;
        } else {
          baseIntensity *= 1.3 + sysState.thermalLevel * 0.7;
        }
        
        // Get maximum glitches from config/performance settings
        const maxGlitches = sysState.isLowEndDevice ? 2 : 
                           (CRTConfig.PERFORMANCE_LEVELS[sysState.performanceLevel.toUpperCase()]?.maxSimultaneousGlitches || 4);
        
        let activeGlitches = 0;
        
        // Get glitch probability from config
        const glitchProbability = CRTConfig.EFFECT_PROBABILITIES.NAV?.BASE_GLITCH_CHANCE || 0.18;
        
        linkStates.forEach(linkState => {
          const timeSinceLastGlitch = currentTime - linkState.glitchState.lastGlitch;
          
          // Get minimum time between glitches (increased for smoother visuals)
          const minGlitchInterval = 80;
          
          // Enhanced glitch probability
          const organicGlitchChance = glitchProbability + 
            Math.abs(wearPatterns.thermalStress) * 0.15 +
            wearPatterns.magneticWear * 0.2;
          
          const shouldGlitch = Math.random() < organicGlitchChance && 
                              activeGlitches < maxGlitches &&
                              timeSinceLastGlitch > minGlitchInterval;
          
          if (shouldGlitch) {
            const localIntensity = baseIntensity * (0.6 + Math.random() * 0.8);
            applyOptimizedDistortion(linkState, localIntensity);
            linkState.glitchState.active = true;
            linkState.glitchState.intensity = localIntensity;
            linkState.glitchState.lastGlitch = currentTime;
            activeGlitches++;
          } else if (linkState.glitchState.active) {
            linkState.glitchState.intensity *= 0.75;
            if (linkState.glitchState.intensity < 0.08) {
              linkState.element.style.transform = '';
              linkState.element.style.filter = '';
              linkState.element.style.textShadow = '';
              linkState.element.textContent = linkState.originalText;
              linkState.glitchState.active = false;
            }
          }
        });
        
        // Complete effect after duration
        if (activeGlitches > 0) {
          CRTResource.setTimeout(() => {
            window.CRTSystem.completeEffect('NAV', SYSTEM_ID);
          }, 400, { purpose: 'effect-completion' });
        }
        
        localState.animationFrameId = requestAnimationFrame(runOptimizedGlitchSystem);
        CRTResource.registerAnimation(localState.animationFrameId);
      }
      
      /* Start glitch system with proper integration */
      function start() {
        // Register with unified system
        window.CRTSystem.registerSystem(SYSTEM_ID, {
          type: 'visual',
          element: navContainer,
          active: false
        });
        
        // Get startup delay from unified system
        const startupDelay = window.CRTSystem.getStartupDelay('NAV') || 1500;
        
        // Initialize with staggered startup
        const initTimer = CRTResource.setTimeout(() => {
          localState.animationFrameId = requestAnimationFrame(runOptimizedGlitchSystem);
          CRTResource.registerAnimation(localState.animationFrameId);
        }, startupDelay, { purpose: 'system-startup' });
        
        // Set up audio reactivity
        const audioHandler = (event) => {
          if (event.detail && typeof event.detail.amplitude === 'number') {
            localState.audioAmplitude = localState.audioAmplitude * 0.9 + event.detail.amplitude * 0.1;
          }
        };
        
        window.addEventListener('crtAudioUpdate', audioHandler);
        CRTResource.registerListener(window, 'crtAudioUpdate', audioHandler);
        
        // Set up cursor tracking
        const cursorHandler = (event) => {
          if (event.detail) {
            localState.cursorPosition.x = event.detail.x;
            localState.cursorPosition.y = event.detail.y;
          }
        };
        
        window.addEventListener('cursorUpdate', cursorHandler);
        CRTResource.registerListener(window, 'cursorUpdate', cursorHandler);
        
        // Listen for global cascade events
        const cascadeHandler = (event) => {
          if (event.detail.origin === SYSTEM_ID) return;
          
          const intensity = event.detail.intensity || 0;
          if (intensity > 0.7 && Math.random() < 0.7) {
            // Force tracking error on cascade
            applyTrackingError();
          }
        };
        
        window.addEventListener('crtCascade', cascadeHandler);
        CRTResource.registerListener(window, 'crtCascade', cascadeHandler);
      }

      /* Stop glitch system and clean up */
      function stop() {
        if (localState.animationFrameId) {
          cancelAnimationFrame(localState.animationFrameId);
        }
        
        // Restore all links
        linkStates.forEach(linkState => {
          linkState.element.style.transform = '';
          linkState.element.style.filter = '';
          linkState.element.style.textShadow = '';
          linkState.element.textContent = linkState.originalText;
        });
        
        // Unregister from unified system
        window.CRTSystem.unregisterSystem(SYSTEM_ID);
      }

      // Return public API
      return {
        start,
        stop,
        container: navContainer,
        links: linkStates
      };
    }
  };

  // Check for system availability and initialize
  function initializeNavGlitch() {
    if (!window.CRTSystem || !window.CRTSystem.isInitialized()) {
      console.log('[Nav] Waiting for CRT system initialization...');
      setTimeout(initializeNavGlitch, 100);
      return;
    }
    
    if (!window.CRTConfig) {
      console.warn('[Nav] CRTConfig not available, system may not function properly');
    }
    
    if (!window.CRTResource) {
      console.warn('[Nav] CRTResource not available, system may not clean up properly');
    }
    
    // Create and start navigation glitch system
    const navGlitch = NavGlitchFactory.create('nav-list');
    if (navGlitch) {
      navGlitch.start();
      
      // Store reference for cleanup
      window.NavGlitch = navGlitch;
    }
  }

  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.addEventListener('crtSystemReady', initializeNavGlitch);
      // Fallback initialization
      setTimeout(initializeNavGlitch, 750);
    });
  } else {
    window.addEventListener('crtSystemReady', initializeNavGlitch);
    // Fallback initialization
    setTimeout(initializeNavGlitch, 750);
  }
})();