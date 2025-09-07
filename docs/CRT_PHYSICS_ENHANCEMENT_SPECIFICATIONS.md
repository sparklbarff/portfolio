# 🎮 CRT Physics Enhancement Specifications
*Implementation Guide for 100% Photorealistic CRT Simulation*

## 🎯 OVERVIEW

This document provides detailed technical specifications for implementing broadcast-accurate CRT physics to achieve indistinguishable-from-reality authenticity while maintaining 60fps performance.

## 📺 INTERLACING ENGINE SPECIFICATION

### **Technical Requirements**
```javascript
// NTSC Interlacing Standard
Field Rate: 59.94 Hz (field duration: 16.683ms)
Lines per Field: 262.5 lines
Total Lines per Frame: 525 lines
Visible Lines: 486 lines (243 per field)
Horizontal Frequency: 15.734 kHz
```

### **Implementation Architecture**
```javascript
class NTSCInterlaceEngine {
  constructor() {
    this.fieldRate = 59.94; // Hz
    this.lineTime = 63.555; // microseconds per line
    this.fieldDuration = 16.683; // ms per field
    this.currentField = 'odd'; // 'odd' | 'even'
    this.fieldStartTime = 0;
    this.currentLine = 0;
    this.motionBuffer = new MotionDetector();
  }

  // Core interlacing logic
  updateInterlacing(timestamp) {
    const fieldProgress = (timestamp - this.fieldStartTime) / this.fieldDuration;
    
    if (fieldProgress >= 1.0) {
      this.switchField();
      this.fieldStartTime = timestamp;
    }
    
    this.currentLine = Math.floor(fieldProgress * 243);
    this.applyInterlacingEffects();
  }

  switchField() {
    this.currentField = this.currentField === 'odd' ? 'even' : 'odd';
    this.detectMotionArtifacts();
  }

  detectMotionArtifacts() {
    // Detect motion between fields for authentic artifacts
    const motionAreas = this.motionBuffer.detectMotion();
    motionAreas.forEach(area => {
      this.applyMotionArtifact(area, this.currentField);
    });
  }

  applyMotionArtifact(area, field) {
    // Create authentic interlacing combing effect
    const combingStrength = area.velocity * 0.3;
    const element = document.elementFromPoint(area.x, area.y);
    
    if (element) {
      const filter = field === 'odd' ? 
        `url(#interlace-odd-${combingStrength})` : 
        `url(#interlace-even-${combingStrength})`;
      element.style.filter = filter;
      
      // Remove after field duration
      setTimeout(() => {
        element.style.filter = '';
      }, this.fieldDuration);
    }
  }
}
```

### **SVG Filter Definitions**
```html
<!-- Add to assets/html/svg-filters.html -->
<defs>
  <!-- Interlacing filters for motion artifacts -->
  <filter id="interlace-odd-low">
    <feOffset in="SourceGraphic" dx="0" dy="0.5"/>
    <feComposite in="SourceGraphic" in2="OffsetResult" operator="screen"/>
  </filter>
  
  <filter id="interlace-even-low">
    <feOffset in="SourceGraphic" dx="0" dy="-0.5"/>
    <feComposite in="SourceGraphic" in2="OffsetResult" operator="screen"/>
  </filter>
  
  <!-- Higher motion artifacts -->
  <filter id="interlace-odd-high">
    <feOffset in="SourceGraphic" dx="0" dy="1"/>
    <feBlend in="SourceGraphic" in2="OffsetResult" mode="multiply"/>
  </filter>
  
  <filter id="interlace-even-high">
    <feOffset in="SourceGraphic" dx="0" dy="-1"/>
    <feBlend in="SourceGraphic" in2="OffsetResult" mode="multiply"/>
  </filter>
</defs>
```

### **CSS Implementation**
```css
/* Interlacing effects in assets/css/crt.css */
.interlace-field-odd {
  transform: translateY(0.5px);
  opacity: 0.98;
}

.interlace-field-even {
  transform: translateY(-0.5px);
  opacity: 0.98;
}

.interlace-motion-artifact {
  filter: blur(0.3px);
  animation: interlaceCombing 33.367ms infinite alternate;
}

@keyframes interlaceCombing {
  0% { transform: translateY(0px); }
  100% { transform: translateY(1px); }
}
```

## 🌈 NTSC COLOR SYSTEM ENHANCEMENT

### **Color Bleeding Implementation**
```javascript
class NTSCColorSystem {
  constructor() {
    this.colorSubcarrier = 3579545.45; // Hz
    this.chromaBandwidth = 1.3; // MHz
    this.lumaBandwidth = 4.2; // MHz
    this.bleedingRadius = 2.5; // pixels
  }

  applyColorBleeding(element) {
    const rect = element.getBoundingClientRect();
    const canvas = this.createColorBleedCanvas(rect);
    const ctx = canvas.getContext('2d');
    
    // Sample element colors
    const colors = this.sampleElementColors(element);
    
    // Apply chroma bleeding algorithm
    colors.forEach((color, index) => {
      this.applyChromaBleeding(ctx, color, index);
    });
    
    // Apply result as CSS filter
    const dataUrl = canvas.toDataURL();
    element.style.background = `url(${dataUrl})`;
    element.style.backgroundBlendMode = 'multiply';
  }

  applyChromaBleeding(ctx, color, x) {
    // Simulate NTSC chroma subsampling
    const chromaDelay = 0.5; // pixels (NTSC artifact)
    
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = `rgba(${color.r}, 0, 0, 1)`;
    ctx.fillRect(x - chromaDelay, 0, this.bleedingRadius, ctx.canvas.height);
    
    ctx.fillStyle = `rgba(0, 0, ${color.b}, 1)`;
    ctx.fillRect(x + chromaDelay, 0, this.bleedingRadius, ctx.canvas.height);
  }

  // Y/I/Q color space conversion for authentic NTSC artifacts
  convertRGBtoYIQ(r, g, b) {
    const Y = 0.299 * r + 0.587 * g + 0.114 * b;
    const I = 0.596 * r - 0.274 * g - 0.322 * b;
    const Q = 0.211 * r - 0.523 * g + 0.312 * b;
    return { Y, I, Q };
  }

  convertYIQtoRGB(Y, I, Q) {
    const r = Y + 0.956 * I + 0.621 * Q;
    const g = Y - 0.272 * I - 0.647 * Q;
    const b = Y - 1.106 * I + 1.703 * Q;
    return { 
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b))
    };
  }
}
```

### **Color Bleeding CSS Filters**
```css
/* NTSC Color bleeding effects */
.ntsc-color-bleed-low {
  filter: blur(0.3px) contrast(1.1);
  position: relative;
}

.ntsc-color-bleed-low::before {
  content: '';
  position: absolute;
  top: 0;
  left: -1px;
  width: calc(100% + 2px);
  height: 100%;
  background: inherit;
  filter: hue-rotate(180deg) blur(0.5px);
  opacity: 0.15;
  mix-blend-mode: color-dodge;
}

.ntsc-color-bleed-high {
  filter: blur(0.5px) contrast(1.15);
  position: relative;
}

.ntsc-color-bleed-high::before {
  content: '';
  position: absolute;
  top: 0;
  left: -1.5px;
  width: calc(100% + 3px);
  height: 100%;
  background: inherit;
  filter: hue-rotate(180deg) blur(0.8px);
  opacity: 0.25;
  mix-blend-mode: color-dodge;
}
```

## 📐 GEOMETRY DISTORTION ENGINE

### **Pincushion Distortion Implementation**
```javascript
class CRTGeometryEngine {
  constructor() {
    this.screenCurvature = 1800; // mm radius
    this.pincushionAmount = 0.02; // ±2% at edges
    this.cornerDistortion = 0.015; // 1.5% corner pull
    this.aspectRatioError = 0.98; // Slight horizontal compression
  }

  applyPincushionDistortion() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // Calculate distortion matrix
    const distortionMatrix = this.calculateDistortionMatrix(viewport);
    
    // Apply to main content areas
    const elements = document.querySelectorAll('body > *');
    elements.forEach(element => {
      this.applyDistortionToElement(element, distortionMatrix);
    });
  }

  calculateDistortionMatrix(viewport) {
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    
    return (x, y) => {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedDistance = distance / maxRadius;
      
      // Pincushion formula: r' = r * (1 + k * r²)
      const k = this.pincushionAmount;
      const distortion = 1 + k * normalizedDistance * normalizedDistance;
      
      return {
        x: centerX + dx * distortion,
        y: centerY + dy * distortion * this.aspectRatioError
      };
    };
  }

  applyDistortionToElement(element, distortionMatrix) {
    const rect = element.getBoundingClientRect();
    
    // Sample key points for distortion
    const corners = [
      { x: rect.left, y: rect.top },
      { x: rect.right, y: rect.top },
      { x: rect.right, y: rect.bottom },
      { x: rect.left, y: rect.bottom }
    ];
    
    const distortedCorners = corners.map(corner => 
      distortionMatrix(corner.x, corner.y)
    );
    
    // Create CSS transform matrix
    const matrix = this.calculateTransformMatrix(corners, distortedCorners);
    element.style.transform = `matrix(${matrix.join(',')})`;
  }
}
```

### **CSS Geometry Distortion**
```css
/* CRT screen curvature simulation */
.crt-geometry-distortion {
  transform-origin: center center;
  transform-style: preserve-3d;
}

.crt-pincushion-low {
  transform: perspective(2000px) rotateX(0.5deg) rotateY(0.3deg);
  border-radius: 0 0 2px 2px;
}

.crt-pincushion-medium {
  transform: perspective(1800px) rotateX(0.8deg) rotateY(0.5deg);
  border-radius: 0 0 3px 3px;
}

.crt-pincushion-high {
  transform: perspective(1600px) rotateX(1.2deg) rotateY(0.8deg);
  border-radius: 0 0 4px 4px;
}

/* Edge focus degradation */
.crt-edge-focus {
  position: relative;
}

.crt-edge-focus::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, 
    transparent 60%, 
    rgba(0,0,0,0.1) 80%, 
    rgba(0,0,0,0.15) 95%);
  pointer-events: none;
}
```

## 🔵 SHADOW MASK SIMULATION

### **RGB Phosphor Dot Pattern Implementation**
```javascript
class ShadowMaskEngine {
  constructor() {
    this.dotPitch = 0.25; // mm
    this.pixelsPerMM = 3.78; // Typical display conversion
    this.dotSpacing = this.dotPitch * this.pixelsPerMM; // ~0.95 pixels
    this.maskType = 'shadow_mask'; // 'shadow_mask' | 'aperture_grille'
  }

  createShadowMaskPattern() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    if (this.maskType === 'shadow_mask') {
      this.drawShadowMaskDots(ctx);
    } else {
      this.drawApertureGrille(ctx);
    }
    
    return canvas.toDataURL();
  }

  drawShadowMaskDots(ctx) {
    const spacing = this.dotSpacing;
    const dotSize = spacing * 0.7;
    
    for (let y = 0; y < ctx.canvas.height; y += spacing * 2) {
      for (let x = 0; x < ctx.canvas.width; x += spacing * 3) {
        // RGB triad pattern
        this.drawPhosphorDot(ctx, x, y, 'red', dotSize);
        this.drawPhosphorDot(ctx, x + spacing, y, 'green', dotSize);
        this.drawPhosphorDot(ctx, x + spacing * 2, y, 'blue', dotSize);
        
        // Offset every other row
        if ((Math.floor(y / spacing) % 2) === 1) {
          this.drawPhosphorDot(ctx, x + spacing * 1.5, y, 'red', dotSize);
          this.drawPhosphorDot(ctx, x + spacing * 2.5, y, 'green', dotSize);
          this.drawPhosphorDot(ctx, x + spacing * 3.5, y, 'blue', dotSize);
        }
      }
    }
  }

  drawPhosphorDot(ctx, x, y, color, size) {
    const alpha = 0.15; // Subtle visibility
    const colors = {
      red: `rgba(255, 0, 0, ${alpha})`,
      green: `rgba(0, 255, 0, ${alpha})`,
      blue: `rgba(0, 0, 255, ${alpha})`
    };
    
    ctx.fillStyle = colors[color];
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  applyMoirePattern(frequency) {
    // Create moiré interference pattern
    const moireCanvas = document.createElement('canvas');
    moireCanvas.width = window.innerWidth;
    moireCanvas.height = window.innerHeight;
    const ctx = moireCanvas.getContext('2d');
    
    // Generate interference pattern
    const imageData = ctx.createImageData(moireCanvas.width, moireCanvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % moireCanvas.width;
      const y = Math.floor((i / 4) / moireCanvas.width);
      
      const moire1 = Math.sin(x * frequency) * Math.sin(y * frequency);
      const moire2 = Math.sin(x * frequency * 1.1) * Math.sin(y * frequency * 1.1);
      const interference = (moire1 + moire2) * 0.1;
      
      const brightness = Math.floor(127 + interference * 127);
      data[i] = brightness;     // R
      data[i + 1] = brightness; // G
      data[i + 2] = brightness; // B
      data[i + 3] = 30;         // A (subtle)
    }
    
    ctx.putImageData(imageData, 0, 0);
    return moireCanvas.toDataURL();
  }
}
```

### **Shadow Mask CSS Implementation**
```css
/* Shadow mask overlay */
.shadow-mask-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: var(--shadow-mask-pattern);
  background-repeat: repeat;
  pointer-events: none;
  mix-blend-mode: multiply;
  opacity: 0.15;
  z-index: 9999;
}

.aperture-grille-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 0.9px,
    rgba(0,0,0,0.1) 0.9px,
    rgba(0,0,0,0.1) 1px
  );
  pointer-events: none;
  mix-blend-mode: multiply;
  opacity: 0.2;
  z-index: 9999;
}

/* Moiré pattern overlay */
.moire-pattern-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: var(--moire-pattern);
  background-repeat: repeat;
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: 0.05;
  z-index: 9998;
  animation: moireShimmer 4s ease-in-out infinite alternate;
}

@keyframes moireShimmer {
  0% { transform: translateX(0px) translateY(0px); }
  100% { transform: translateX(0.5px) translateY(0.3px); }
}
```

## ⚡ POWER SUPPLY EFFECTS

### **AC Ripple Implementation**
```javascript
class PowerSupplySimulator {
  constructor() {
    this.acFrequency = 60; // Hz (US power grid)
    this.rippleAmount = 0.02; // 2% voltage ripple
    this.regulationError = 0.005; // 0.5% load regulation
    this.highVoltageNominal = 25000; // Volts (CRT anode)
  }

  simulateACRipple(timestamp) {
    // 120Hz ripple (double AC frequency)
    const rippleFreq = this.acFrequency * 2;
    const ripplePhase = (timestamp / 1000) * rippleFreq * Math.PI * 2;
    const rippleValue = Math.sin(ripplePhase) * this.rippleAmount;
    
    // Apply ripple to geometry and brightness
    this.applyRippleToGeometry(rippleValue);
    this.applyRippleToBrightness(rippleValue);
  }

  applyRippleToGeometry(ripple) {
    // High voltage ripple affects deflection circuits
    const horizontalRipple = ripple * 0.3; // Horizontal more sensitive
    const verticalRipple = ripple * 0.2;   // Vertical less sensitive
    
    document.documentElement.style.setProperty(
      '--power-ripple-h', horizontalRipple.toString()
    );
    document.documentElement.style.setProperty(
      '--power-ripple-v', verticalRipple.toString()
    );
  }

  applyRippleToBrightness(ripple) {
    // Slight brightness modulation from HV ripple
    const brightnessRipple = 1 + (ripple * 0.01); // ±1% brightness
    
    document.documentElement.style.setProperty(
      '--power-brightness-ripple', brightnessRipple.toString()
    );
  }

  simulateLoadRegulation(brightness) {
    // Bright scenes increase load, reducing HV slightly
    const loadFactor = brightness * this.regulationError;
    const hvReduction = 1 - loadFactor;
    
    // Affects geometry (size reduction) and convergence
    document.documentElement.style.setProperty(
      '--load-regulation-factor', hvReduction.toString()
    );
  }
}
```

### **Power Supply CSS Effects**
```css
/* Power supply ripple effects */
.power-supply-ripple {
  animation: 
    powerRippleH 16.67ms infinite linear,
    powerRippleV 16.67ms infinite linear;
}

@keyframes powerRippleH {
  0% { transform: scaleX(calc(1 + var(--power-ripple-h, 0) * 0.001)); }
  50% { transform: scaleX(calc(1 - var(--power-ripple-h, 0) * 0.001)); }
  100% { transform: scaleX(calc(1 + var(--power-ripple-h, 0) * 0.001)); }
}

@keyframes powerRippleV {
  0% { transform: scaleY(calc(1 + var(--power-ripple-v, 0) * 0.0008)); }
  50% { transform: scaleY(calc(1 - var(--power-ripple-v, 0) * 0.0008)); }
  100% { transform: scaleY(calc(1 + var(--power-ripple-v, 0) * 0.0008)); }
}

/* Load regulation effects */
.load-regulation {
  transform: scale(var(--load-regulation-factor, 1));
  filter: brightness(var(--power-brightness-ripple, 1));
}
```

## 🚀 INTEGRATION ROADMAP

### **Phase 1: Core Implementation (Week 1)**
1. Implement interlacing engine with field switching
2. Add motion detection for interlacing artifacts
3. Create basic NTSC color bleeding
4. Apply pincushion distortion to main content

### **Phase 2: Advanced Features (Week 2)**
1. Implement shadow mask dot patterns
2. Add moiré pattern generation
3. Create power supply ripple simulation
4. Enhance convergence error dynamics

### **Phase 3: Integration & Optimization (Week 3)**
1. Integrate with existing CRTSystem
2. Optimize performance for mobile devices
3. Create quality preset system
4. Add user calibration controls

---

**Next Steps**: Begin implementation with the interlacing engine as it provides the highest visual impact improvement while maintaining compatibility with the existing architecture.
