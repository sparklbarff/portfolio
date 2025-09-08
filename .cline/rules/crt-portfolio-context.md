You are working on a sophisticated CRT/VHS effects portfolio project with the following characteristics:

**Project Context:**
- Portfolio showcasing CRT monitor simulation effects
- 12 core JavaScript files implementing realistic CRT physics
- NTSC timing simulation (15.734kHz horizontal, 59.94Hz refresh)
- P22 phosphor persistence modeling
- Thermal convergence drift simulation
- Adaptive performance scaling (1000→50 particles based on device)
- 31 background images with 7-second rotation cycles

## Development Environment
- Node.js 24.7.0 with npm 11.5.1
- Local development server on port 3001
- VS Code with extensions for development

**Code Quality Standards:**
- ESLint configuration enforced
- Prettier formatting required
- Single quotes for strings
- Trailing spaces not allowed
- Curly braces required for if statements
- No unused variables (prefix with _ if intentionally unused)

**Performance Requirements:**
- Target 60fps on modern devices
- Graceful degradation to 30fps on slower hardware
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile optimization with touch-friendly controls
- Battery-aware performance scaling

**Technical Architecture:**
- Event-driven system coordination
- Modular JavaScript components
- CSS3 animations with GPU acceleration
- WebGL fallbacks for complex effects
- Responsive design with safe area support

**File Structure Priorities:**
- Keep only essential files (currently 18 core files)
- WIP/v1/ contains active development
- Root directory is production deployment
- No deployment without explicit user permission

**Physics Accuracy Goals:**
- Authentic CRT monitor behavior simulation
- Realistic phosphor decay curves
- Proper electron gun convergence modeling
- Temperature-based drift effects
- Magnetic field interference simulation

When making changes:
1. Always preserve existing functionality
2. Maintain performance optimization
3. Follow established code quality standards
4. Test effects at multiple quality levels
5. Document complex physics calculations
6. Never auto-deploy to production root
