// CRT Testing file for new extension features
// ! Critical: This file tests all new VS Code extensions

const CRTEffects = {
  // VHS This simulates video tape distortion
  vhsDistortion: function (intensity) {
    // todo Implement dynamic intensity scaling
    const distortionLevel = intensity * 0.8;
    // ? Should we add random noise here?
    return {
      horizontal: distortionLevel,
      vertical: distortionLevel * 0.5,
      // * Important: Keep values between 0-1
      chromaShift: distortionLevel * 0.3
    };
  },

  // CRT This handles cathode ray tube phosphor effects
  phosphorGlow: function (color, brightness) {
    const glowIntensity = brightness;
    const phosphorColors = {
      green: '#00ff41',
      amber: '#ff6b35',
      white: '#ffffff'
    };

    // Testing console log with Turbo Console Log
    const selectedColor = phosphorColors[color] || phosphorColors.green;

    return {
      color: selectedColor,
      intensity: glowIntensity,
      fadeRate: 0.95,
      persistence: 120 // milliseconds
    };
  },

  // Testing bracket selection and nested structures
  complexNesting: {
    level1: {
      level2: {
        level3: {
          level4: {
            // This deep nesting tests Blockman visualization
            crtSettings: {
              scanlines: true,
              phosphorTrails: true,
              beamWidth: 2,
              refreshRate: 60
            }
          }
        }
      }
    }
  }
};

// Testing TabOut functionality
const testTabOut = () => {
  const config = {
    setting1: 'value1',
    setting2: 'value2'
  };

  return config;
};

// // This is a strikethrough comment for testing Better Comments
