# Google AI Studio Integration Setup

## Overview
This guide will help you integrate Google AI Studio (Gemini) into your VS Code development environment alongside your existing AI tools (GitHub Copilot, OpenAI Codex, Cline).

## Prerequisites
✅ VS Code with existing AI extensions
✅ GitHub Copilot, OpenAI Codex, and Cline already configured  
✅ Google account with AI Studio access
✅ Azure portfolio deployment complete

## Step 1: Install Google AI Extensions

### Primary Extensions:
1. **Gemini Code Assist** (`google.geminicodeassist`)
   - Official Google AI-powered coding assistant
   - 1.5M+ installs
   - Code completion, generation, and chat features

2. **Gemini CLI Companion** (`google.gemini-cli-vscode-ide-companion`)  
   - Direct IDE workspace integration
   - 102K+ installs
   - CLI integration with diff editing

### Installation:
```bash
# Install via VS Code Extensions marketplace or:
code --install-extension google.geminicodeassist
code --install-extension google.gemini-cli-vscode-ide-companion
```

## Step 2: Get Google AI Studio API Key

1. **Visit Google AI Studio**: https://aistudio.google.com/
2. **Sign in** with your Google account
3. **Create API Key**:
   - Click "Get API Key" 
   - Create new project or use existing
   - Generate API key for Gemini models
4. **Copy the API key** (starts with `AIza...`)

## Step 3: Configure Extensions

### Gemini Code Assist Configuration:
1. Open VS Code Settings (`Ctrl/Cmd + ,`)
2. Search for "Gemini Code Assist"
3. Add your API key:
   ```json
   {
     "geminiCodeAssist.apiKey": "YOUR_API_KEY_HERE",
     "geminiCodeAssist.model": "gemini-1.5-pro",
     "geminiCodeAssist.enableAutoComplete": true,
     "geminiCodeAssist.enableChat": true
   }
   ```

### Environment Variables (Recommended):
Create `.env` file in your workspace:
```env
GOOGLE_AI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-pro
```

## Step 4: Test Integration

### Test Gemini Code Assist:
1. **Open a JavaScript file** (e.g., one of your CRT physics engines)
2. **Type a comment**: `// Create a function to simulate NTSC timing`
3. **Press Tab** - Gemini should suggest code
4. **Use chat**: `Ctrl/Cmd + Shift + P` → "Gemini: Open Chat"

### Test CLI Companion:
1. **Open terminal in VS Code**
2. **Run**: `gemini --help` (if CLI is installed)
3. **Try workspace queries** through the extension

## Step 5: Multi-AI Workflow Integration

### AI Tool Coordination:
Your development environment now includes:
- **GitHub Copilot**: Primary autocomplete and suggestions
- **OpenAI Codex**: Advanced code generation via API
- **Cline**: Autonomous coding agent (Claude-powered)
- **Gemini**: Google's multimodal AI assistance

### Recommended Usage:
1. **Copilot**: Day-to-day autocomplete and quick suggestions
2. **Gemini**: Complex problem-solving and multimodal tasks
3. **Cline**: Autonomous file editing and project-wide changes  
4. **Codex**: Custom integrations and API-based workflows

### Keyboard Shortcuts:
```json
{
  "key": "ctrl+shift+g",
  "command": "geminiCodeAssist.openChat",
  "when": "editorFocus"
},
{
  "key": "ctrl+shift+m",
  "command": "geminiCodeAssist.explain",
  "when": "editorTextFocus"
}
```

## Step 6: Configure for CRT Portfolio

### Project-Specific Settings:
Add to `.vscode/settings.json`:
```json
{
  "geminiCodeAssist.contextFiles": [
    "WIP/v1/assets/js/**/*.js",
    "docs/**/*.md",
    "README.md"
  ],
  "geminiCodeAssist.projectDescription": "CRT/VHS effects portfolio with NTSC timing simulation and physics engines",
  "geminiCodeAssist.enableContextAwareness": true
}
```

### CRT Physics Context:
Tell Gemini about your project:
```
This portfolio contains 12 JavaScript physics engines simulating:
- NTSC timing (15.734kHz horizontal, 59.94Hz vertical)
- P22 phosphor persistence and decay
- CRT geometry distortion and curvature  
- RGB shadowmask patterns
- Interlacing and color bleeding effects
- Performance monitoring and adaptive scaling
```

## Step 7: Advanced Features

### Multimodal Capabilities:
Gemini can analyze:
- **Screenshots** of your CRT effects
- **Code diagrams** and flowcharts
- **Performance graphs** from Azure Application Insights
- **UI mockups** for control panels

### Integration with Azure:
```javascript
// Example: Use Gemini to optimize Azure deployment
const geminiOptimization = await gemini.analyze({
  deployment: 'Azure Static Web Apps',
  metrics: azureMetrics,
  codebase: crtPhysicsEngines
});
```

## Troubleshooting

### Common Issues:
1. **API Key not working**: Verify key is active in AI Studio
2. **Rate limiting**: Gemini has usage quotas - monitor in AI Studio
3. **Extension conflicts**: Disable conflicting AI extensions if needed
4. **Context limits**: Large files may hit token limits

### Support Resources:
- Google AI Studio: https://aistudio.google.com/
- Gemini API Docs: https://ai.google.dev/
- VS Code Extension Issues: Search GitHub repos

## Next Steps

### Optimization:
1. **Fine-tune models** with your CRT codebase
2. **Create custom prompts** for physics calculations
3. **Set up automated testing** with AI-generated test cases
4. **Monitor usage costs** across all AI services

### Integration Testing:
Test all AI tools with your CRT portfolio:
```bash
# Test suite for multi-AI integration
npm run test:ai-integration
```

---

**Status**: Ready for Google AI Studio integration! 🚀
**Portfolio**: Live at https://ambitious-rock-078a1031e.2.azurestaticapps.net
**AI Stack**: Copilot + Codex + Cline + Gemini = Complete AI development environment
