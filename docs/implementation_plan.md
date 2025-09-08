# Implementation Plan

[Overview]
Fix the CRT control panel checkbox enable/disable functionality and optimize default physics parameters for better user experience.

The current CRT control panel has 27 working sliders but the enable/disable checkboxes don't actually stop the physics effects from running. This is because each physics engine has two separate "enabled" variables - one updated by the control panel and another that actually controls the engine loops. Additionally, the default jitter values are too high, making subtle effects difficult to observe. This implementation will systematically connect the checkbox states to the actual engine execution while maintaining the existing 27-parameter complexity and ensuring effects are realistic by default but dramatic at maximum slider values.

[Types]
Define engine state synchronization interfaces and enhanced configuration validation.

```typescript
interface PhysicsEngineState {
  configEnabled: boolean;    // Control panel checkbox state
  runtimeEnabled: boolean;   // Actual engine execution state
  synchronized: boolean;     // State sync verification flag
}

interface EngineConfiguration {
  enabled: boolean;
  parameters: Record<string, number | string | boolean>;
  validation: {
    ranges: Record<string, [number, number]>;
    required: string[];
  };
}

enum EngineNames {
  INTERLACING = 'interlacing',
  COLOR_SYSTEM = 'colorSystem', 
  GEOMETRY = 'geometry',
  SHADOW_MASK = 'shadowMask'
}
```

[Files]
Modify four physics engine files and enhance CSS variable integration for immediate visual feedback.

**Existing files to be modified:**
- `WIP/v1/assets/js/crt-interlacing-engine.js` - Fix enabled state disconnect, reduce default jitter from 0.002 to 0.0005
- `WIP/v1/assets/js/crt-color-system.js` - Connect configState.enabled to colorSystemState.enabled  
- `WIP/v1/assets/js/crt-geometry-engine.js` - Synchronize Manager globalSettings with engine options.enabled
- `WIP/v1/assets/js/crt-shadowmask-engine.js` - Synchronize Manager globalSettings with engine options.enabled
- `WIP/v1/assets/css/crt.css` - Add CSS variables for enhanced visual feedback of parameter changes

**Configuration file updates:**
- Update default parameters in each engine to provide realistic baseline values
- Ensure maximum values (slider at 100%) produce dramatically visible effects

[Functions]
Add state synchronization functions and enhance the applyConfiguration methods in all physics engines.

**New functions:**
- `syncEnabledStates()` in each engine (interlacing, color, geometry, shadow mask) - synchronizes control panel checkbox state with actual engine execution
- `validateConfiguration(parameters)` in each engine - validates parameter ranges and types
- `getEffectIntensity()` in each engine - calculates current visual intensity for debugging

**Modified functions:**
- `InterlacingAPI.configure()` in `crt-interlacing-engine.js` - add call to syncEnabledStates() after parameter updates
- `ColorSystemAPI.configure()` in `crt-color-system.js` - add call to syncEnabledStates() after parameter updates  
- `CRTGeometryManager.configure()` in `crt-geometry-engine.js` - enhance to sync individual engine enabled states
- `CRTShadowMaskManager.configure()` in `crt-shadowmask-engine.js` - enhance to sync individual engine enabled states
- `InterlacingAPI.applyConfiguration()` - sync interlacingState.enabled with configState.enabled
- `startUpdateLoop()` in each engine - add enabled state checks before processing frames
- `NTSCColorSystem.startColorProcessing()` - add configState.enabled check to processColors function
- `CRTGeometryManager.updateAll()` - check globalSettings.masterEnabled before updating engines
- `CRTShadowMaskManager.updateAll()` - check globalSettings.masterEnabled before updating engines

**Removed functions:**
- None - all existing functionality will be preserved while fixing the disconnects

[Classes]
Enhance existing Manager classes to properly coordinate enabled states across multiple engine instances.

**Modified classes:**
- `NTSCColorSystem` class in `crt-color-system.js` - enhance processVisibleElements() method to respect enabled state
- `CRTGeometryManager` class in `crt-geometry-engine.js` - modify updateAll() to sync individual engine states with global settings
- `CRTShadowMaskManager` class in `crt-shadowmask-engine.js` - modify updateAll() to sync individual engine states with global settings
- `InterlacingAPI` object in `crt-interlacing-engine.js` - enhance configure() method with proper state synchronization

**New classes:**
- `PhysicsEngineStateManager` - utility class for coordinating state synchronization across all engines (optional, can be implemented as module functions)

[Dependencies]
No new package dependencies required - all fixes use existing JavaScript capabilities.

All modifications work within the current technology stack:
- Vanilla JavaScript (ES6+) for engine logic
- CSS custom properties for immediate visual feedback
- Existing event system for coordination
- Current performance monitoring integration

Version compatibility maintained with:
- Chrome, Firefox, Safari, Edge (existing browser support)
- Node.js 20 development environment
- ESLint configuration standards
- Prettier code formatting requirements

[Testing]
Create systematic testing approach for checkbox functionality and parameter validation.

**Test file requirements:**
- `tests/physics-engine-state-test.html` - Interactive test page for checkbox enable/disable functionality
- Unit tests within each engine file using inline testing functions
- Browser compatibility tests for CSS variable integration
- Performance regression tests to ensure 60fps target maintained

**Existing test modifications:**
- Update `tests/enhanced-comparison-test.html` to include checkbox state verification
- Modify `tests/validation-script.js` to include physics engine state validation
- Enhance existing test files to verify parameter ranges and default values

**Validation strategies:**
- Real-time visual confirmation: effects must visibly stop when checkboxes are disabled
- Performance monitoring: enabled/disabled state changes must not impact frame rate
- Parameter boundary testing: sliders at 0% should show minimal effects, 100% should be dramatically obvious
- Cross-engine coordination: disabling one engine should not affect others
- CSS variable integration: parameter changes must update CSS custom properties immediately

[Implementation Order]
Execute changes in dependency order to minimize conflicts and ensure each fix builds upon previous corrections.

1. **Fix Interlacing Engine Enable/Disable (Priority: Critical)**
   - Modify `InterlacingAPI.applyConfiguration()` to sync `interlacingState.enabled = configState.enabled`
   - Update `startUpdateLoop()` to check enabled state before processing
   - Reduce default `jitterAmount` from 0.002 to 0.0005 for realistic baseline
   - Test checkbox functionality works correctly

2. **Fix Color System Enable/Disable (Priority: Critical)**  
   - Modify `ColorSystemAPI.applyConfiguration()` to sync `colorSystemState.enabled = configState.enabled`
   - Update `startColorProcessing()` to check enabled state before processing elements
   - Test checkbox functionality works correctly

3. **Fix Geometry Engine Enable/Disable (Priority: Critical)**
   - Modify `CRTGeometryManager.configure()` to sync `globalSettings.masterEnabled` with individual engine `options.enabled`
   - Update `CRTGeometryManager.updateAll()` to check enabled state before calling engine updates
   - Test checkbox functionality works correctly

4. **Fix Shadow Mask Engine Enable/Disable (Priority: Critical)**
   - Modify `CRTShadowMaskManager.configure()` to sync `globalSettings.masterEnabled` with individual engine `options.enabled`  
   - Update `CRTShadowMaskManager.updateAll()` to check enabled state before calling engine updates
   - Test checkbox functionality works correctly

5. **Optimize Default Parameters (Priority: High)**
   - Reduce interlacing jitter from 0.002 to 0.0005 for subtle realistic baseline
   - Adjust color bleeding defaults to be less intense but scale dramatically to maximum
   - Calibrate geometry distortion for realistic CRT curvature at default settings
   - Tune shadow mask intensity for authentic but not overwhelming phosphor visibility

6. **Enhance CSS Variable Integration (Priority: Medium)**
   - Add CSS custom properties for all 27 parameters to provide immediate visual feedback
   - Update existing CSS classes to utilize new variables for parameter-driven styling
   - Test parameter changes reflect immediately in visual effects

7. **Create Testing Infrastructure (Priority: Medium)**
   - Create `tests/physics-engine-state-test.html` for systematic checkbox testing
   - Add parameter boundary validation tests
   - Implement performance regression testing to maintain 60fps target

8. **Documentation and Validation (Priority: Low)**
   - Update inline code comments to reflect new state synchronization approach
   - Add console logging for debugging state synchronization issues
   - Validate ESLint compliance and run formatting checks

9. **Final Integration Testing (Priority: Critical)**
   - Test all 27 parameters work with both sliders and checkboxes
   - Verify realistic defaults with dramatic maximums
   - Confirm cross-browser compatibility (Chrome, Firefox, Safari, Edge)
   - Performance validation on both high-end and low-end devices
   - User experience validation: effects should be immediately obvious when toggled
