**Code Quality and Performance Rules:**

- Always run `npm run lint:fix` and `npm run format` after making changes
- Maintain 60fps performance target on modern devices
- Use single quotes for JavaScript strings
- Require curly braces for all if statements
- Remove trailing whitespace
- Prefix unused variables with underscore (_variableName)
- Preserve existing functionality when refactoring
- Test effects on both high-end and low-end device profiles

**CRT Physics Accuracy:**

- Validate all timing against NTSC broadcast standards
- Implement realistic phosphor decay based on P22 specifications
- Model thermal convergence drift with proper time constants
- Simulate electron gun misalignment effects
- Include magnetic interference from cursor movement
- Maintain authentic interlacing artifacts
- Preserve color bleeding/ghosting characteristics

**File Management:**

- Work only in WIP/v1 directory for active development
- Never modify root directory files without explicit permission
- Keep file count minimal - remove redundant/duplicate files
- Maintain clean separation between development and production
- Document all changes in commit messages

**Development Workflow:**

- Use semantic commit messages (feat:, fix:, docs:, refactor:)
- Run performance analysis after major changes
- Validate cross-browser compatibility
- Test mobile responsiveness and touch controls
- Check battery impact on mobile devices
