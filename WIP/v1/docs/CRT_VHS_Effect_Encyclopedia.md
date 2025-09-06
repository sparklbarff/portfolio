# CRT/VHS Effect Encyclopedia

## CRT Screen Effects

### Phosphor Persistence
- **Description**: The afterglow of phosphor after being excited by the electron beam
- **Visual Characteristics**: Subtle trailing effect behind moving objects, ghosting
- **Implementation**: CSS animations with multiple shadow layers, opacity transitions
- **Performance Impact**: Medium (shadow effects can be expensive)
- **Optimization**: Use `will-change: opacity` and limit to moving elements only

### Scanlines
- **Description**: Horizontal lines created by electron beam scanning across the screen
- **Visual Characteristics**: Alternating dark/light horizontal lines, varies with brightness
- **Implementation**: Repeating linear gradients with overlay blend mode
- **Performance Impact**: Low-Medium (depends on gradient complexity)
- **Optimization**: Simplify gradient patterns, use static background where possible

### Barrel Distortion
- **Description**: Geometric distortion of the CRT tube creating curved screen appearance
- **Visual Characteristics**: Outward bulging of the image, stronger at edges
- **Implementation**: CSS transform with perspective/scale + SVG filters for fine control
- **Performance Impact**: High (SVG filters are expensive)
- **Optimization**: Use simpler CSS transforms for most of effect, minimal SVG filtering

### RGB Convergence Errors
- **Description**: Misalignment of the red, green, and blue electron beams
- **Visual Characteristics**: Color fringing, especially at edges of high-contrast areas
- **Implementation**: Text-shadow with RGB offsets, or multiple layers with rgb shifts
- **Performance Impact**: Medium (multiple shadow effects)
- **Optimization**: Apply only to key elements, reduce when scrolling

### Phosphor Dot Patterns
- **Description**: RGB phosphor arrangement on the screen (shadow mask)
- **Visual Characteristics**: Tiny RGB dot patterns, visible on light areas
- **Implementation**: Background pattern with screen/multiply blend mode
- **Performance Impact**: Low (static background)
- **Optimization**: Pre-render as image instead of CSS patterns

### Screen Reflections
- **Description**: Glare and reflections on the glass surface
- **Visual Characteristics**: Subtle highlights, reflection gradient
- **Implementation**: Gradient overlays with screen/soft-light blend modes
- **Performance Impact**: Low
- **Optimization**: Combine with other overlay effects

### Edge Vignetting
- **Description**: Darkening around the edges and corners of the CRT
- **Visual Characteristics**: Darkened corners, gentle falloff from center
- **Implementation**: Radial gradient with multiply blend mode
- **Performance Impact**: Low
- **Optimization**: Combine with other overlay effects

## VHS Artifacts

### Tracking Errors
- **Description**: Horizontal synchronization loss due to tape alignment issues
- **Visual Characteristics**: Horizontal shifting/jumping, rolling bands
- **Implementation**: CSS transform translations + clip-path animations
- **Performance Impact**: Medium-High (clip-path animations)
- **Optimization**: Trigger only occasionally, use translateY for performance

### Head Switching Noise
- **Description**: Horizontal bar caused by switching between video heads
- **Visual Characteristics**: Horizontal distortion bar that moves vertically
- **Implementation**: Animated horizontal slice with distortion filter
- **Performance Impact**: Medium
- **Optimization**: Simplify filters, trigger sparingly

### Chroma Noise
- **Description**: Color bleeding and noise in the color signal
- **Visual Characteristics**: Color fringing, smearing of saturated colors
- **Implementation**: SVG filters with feColorMatrix and feDisplacementMap
- **Performance Impact**: High
- **Optimization**: Pre-render static noise texture, use simpler CSS effects when possible

### Luminance Noise
- **Description**: Brightness fluctuations and noise
- **Visual Characteristics**: Grainy texture, random brightness variation
- **Implementation**: Semi-transparent noise overlay with screen/overlay blend mode
- **Performance Impact**: Medium
- **Optimization**: Use static noise texture, animate opacity instead of regenerating

### Dropouts
- **Description**: Random signal loss due to tape damage
- **Visual Characteristics**: Brief white/black flashes, horizontal streaks
- **Implementation**: Randomly positioned and timed overlay elements
- **Performance Impact**: Low (infrequent)
- **Optimization**: Limit frequency, batch DOM updates

### Tape Stretching
- **Description**: Distortion from physical tape stretching
- **Visual Characteristics**: Wavy horizontal distortion, usually consistent in position
- **Implementation**: CSS wave transform or SVG displacement filter
- **Performance Impact**: High (if using SVG filters)
- **Optimization**: Use CSS transform waves when possible, limit application

### Generation Loss
- **Description**: Quality degradation from multiple copies
- **Visual Characteristics**: Overall softness, increased noise, color shifting
- **Implementation**: Combination of blur, noise, and color adjustment filters
- **Performance Impact**: Medium-High
- **Optimization**: Apply as single composite filter instead of layers

### Macrovision Distortions
- **Description**: Copy protection artifacts
- **Visual Characteristics**: Rolling brightness bands, color shifting
- **Implementation**: Animated brightness/contrast filters in vertical bands
- **Performance Impact**: Medium
- **Optimization**: Trigger rarely, simplify animation

## Performance Optimization Techniques

### Hardware Acceleration
- **Technique**: Force GPU rendering of animations
- **Implementation**: `will-change`, `transform: translateZ(0)`, `backface-visibility: hidden`
- **Best Used For**: Animations, transitions, filters

### Layer Consolidation
- **Technique**: Combine multiple effect layers into fewer DOM elements
- **Implementation**: Merge compatible effects with similar blend modes
- **Best Used For**: Overlay effects, static filters

### Conditional Rendering
- **Technique**: Only show effects when visible in viewport
- **Implementation**: Intersection Observer API, visibility checks
- **Best Used For**: Expensive filters, animations

### Progressive Enhancement
- **Technique**: Scale effect complexity based on device capability
- **Implementation**: Feature detection, performance timing metrics
- **Best Used For**: Complex animations, filters

### Animation Throttling
- **Technique**: Reduce animation frame rate or complexity during interaction
- **Implementation**: requestAnimationFrame with throttling, CSS animation duration scaling
- **Best Used For**: Continuous animations, scrolling effects
