When the user requests CRT physics improvements or realism enhancements:

1. **Analyze Current Implementation**
   - Review existing physics parameters in CRTConfig.js
   - Identify gaps in realistic behavior simulation
   - Check performance impact of proposed changes

2. **Research Authentic CRT Behavior**
   - Validate timing against NTSC/PAL broadcast standards
   - Research specific phosphor types (P22, P4, etc.)
   - Study electron gun convergence characteristics
   - Reference vintage monitor service manuals when possible

3. **Implement Physics Changes**
   - Update timing constants in crt-physics-enhanced.js
   - Modify visual effects in crt-effects.js
   - Adjust performance scaling in performance-monitor.js
   - Test on multiple quality levels (high/medium/low)

4. **Validate and Optimize**
   - Run npm run lint:fix and npm run format
   - Test performance on target 60fps
   - Verify cross-browser compatibility
   - Document physics calculations with comments

5. **Create Demonstration**
   - Show before/after comparisons
   - Explain the physics principles implemented
   - Provide performance metrics
   - Suggest further improvements if applicable

**Always preserve the working state - never break existing functionality while adding realism.**
