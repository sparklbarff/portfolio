# CRT Portfolio - Simple Development Guide

## Quick Start (No More API Key Hell!)

### 1. Test the CRT Effects Locally
```bash
# Start the dev server (already configured!)
./local-dev-server.sh
```

Then open: <http://localhost:3002>

### 2. What You've Got Working
- **WIP/v1/** - Complete CRT/VHS simulation system
- **Azure infrastructure** - Ready for deployment 
- **Local dev server** - No Docker needed!

### 3. Key Files You Care About
- `WIP/v1/index.html` - Main CRT portfolio
- `WIP/v1/test.html` - Physics engine testing
- `WIP/v1/assets/js/CRTSystem.js` - Core system
- `infra/` - Azure deployment files

### 4. Deploy to Azure (When Ready)
```bash
# Deploy (requires Azure CLI login)
azd up
```

## No More Extension/API Key Setup Needed

✅ VS Code workspace configured  
✅ Development server ready  
✅ Azure infrastructure ready  
✅ Git organized and clean  

## Focus Areas

1. **CRT Effects** - Tweak the visual simulation
2. **Content** - Update portfolio content  
3. **Deploy** - Push to Azure when satisfied

**That's it! No more setup hell.**
