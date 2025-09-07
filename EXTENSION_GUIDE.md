# VS Code Extensions Configuration Guide
## CRT/VHS Portfolio Development Setup

This guide covers all configured extensions and their optimized settings for your retro portfolio project.

---

## 🎨 **Visual Enhancement Extensions**

### **Colorize** 
- **Purpose**: Visual previews of CSS colors in your code
- **CRT Benefits**: See your P22 phosphor colors (`#00ff41`, `#ff6b35`, etc.) directly in code
- **Key Settings**:
  ```json
  "colorize.enable_search_variables": true
  "colorize.colorized_colors": ["BROWSERS_COLORS", "HEXA", "RGB", "HSL"]
  ```
- **Usage**: Colors automatically highlighted in CSS, HTML, and JS files

### **Indent Rainbow**
- **Purpose**: Colored indentation guides for better code structure
- **CRT Benefits**: Navigate complex JavaScript effect hierarchies visually
- **Key Settings**:
  ```json
  "indentRainbow.colors": [
    "rgba(255,255,64,0.07)",   // Soft yellow
    "rgba(127,255,127,0.07)",  // Soft green  
    "rgba(255,127,255,0.07)",  // Soft magenta
    "rgba(79,236,236,0.07)"    // Soft cyan
  ]
  ```
- **Usage**: Automatic colored guides show nesting levels

---

## 📝 **HTML/CSS Productivity Extensions**

### **HTML CSS Support** + **CSS Class Completion**
- **Purpose**: IntelliSense for CSS classes in HTML
- **CRT Benefits**: Autocomplete for classes like `.crt-retrace`, `.vhs-tracking`
- **Key Settings**:
  ```json
  "html-css-class-completion.enableEmmetSupport": true
  "html-css-class-completion.includeGlobPattern": "**/*.{css,html}"
  ```
- **Usage**: Type class names and get suggestions from your CSS files

### **Auto Rename Tag** + **Auto Close Tag**
- **Purpose**: Automatic HTML tag management
- **CRT Benefits**: Faster editing of complex DOM structure for effects
- **Key Settings**:
  ```json
  "auto-rename-tag.activationOnLanguage": ["html", "xml", "php"]
  "auto-close-tag.activationOnLanguage": ["html", "javascript", ...]
  ```
- **Usage**: 
  - Change `<div>` → `<span>` and closing tag updates automatically
  - Type `<div>` and get `</div>` automatically

---

## 📁 **File Management Extensions**

### **Path IntelliSense**
- **Purpose**: Autocomplete for file paths
- **CRT Benefits**: Quick navigation to your 31 background images and audio files
- **Key Settings**:
  ```json
  "path-intellisense.autoSlashAfterDirectory": true
  "path-intellisense.showHiddenFiles": true
  ```
- **Usage**: Type `assets/` and get folder/file suggestions

---

## 🧪 **Testing & Development Extensions**

### **Code Runner**
- **Purpose**: Quick code execution without leaving VS Code
- **CRT Benefits**: Test individual JavaScript functions instantly
- **Key Settings**:
  ```json
  "code-runner.runInTerminal": true
  "code-runner.saveFileBeforeRun": true
  "code-runner.clearPreviousOutput": true
  ```
- **Usage**: 
  - Select JavaScript code → `Ctrl+Shift+P` → "Code Runner: Run"
  - Or use `Ctrl+Alt+N` shortcut

### **CSS Peek**
- **Purpose**: Jump between HTML and CSS definitions
- **CRT Benefits**: Navigate quickly between HTML elements and their styling
- **Usage**: 
  - `Ctrl+Click` on CSS class → Jump to definition
  - `Alt+F12` → Peek definition in popup

---

## 🎯 **Core Development Extensions** (Already Configured)

### **Live Server**
- **Optimized Settings**:
  ```json
  "liveServer.settings.root": "/WIP/v1"
  "liveServer.settings.port": 3000
  "liveServer.settings.mount": [["/assets", "./WIP/v1/assets"]]
  "liveServer.settings.fullReload": false
  ```
- **Usage**: Right-click HTML file → "Open with Live Server"

### **ESLint** + **Prettier**
- **Optimized for CRT Development**:
  ```json
  "prettier.tabWidth": 2
  "prettier.singleQuote": false
  "prettier.htmlWhitespaceSensitivity": "css"
  ```
- **Usage**: Auto-formats on save, maintains consistent code style

### **GitLens**
- **Enhanced Git Visualization**:
  ```json
  "gitlens.blame.highlight.locations": ["gutter", "line", "overview"]
  "gitlens.changes.locations": ["gutter", "overview"]
  ```
- **Usage**: See git blame, changes, and history inline

### **GitHub Copilot**
- **Optimized for Web Development**:
  ```json
  "github.copilot.enable": {
    "javascript": true,
    "html": true, 
    "css": true
  }
  ```
- **Usage**: AI code suggestions as you type

---

## 🚀 **Quick Reference Commands**

### Essential Shortcuts:
- **Code Runner**: `Ctrl+Alt+N` (Run selected code)
- **CSS Peek**: `Alt+F12` (Peek definition)
- **Path IntelliSense**: `Ctrl+Space` (Trigger suggestions)
- **Auto Rename**: Just edit opening tag, closing tag follows
- **Colorize**: Automatic color previews (no shortcuts needed)

### File Navigation:
- **Quick Open**: `Ctrl+P` → Type filename
- **Go to Symbol**: `Ctrl+Shift+O` → Navigate within file
- **Go to Definition**: `F12` or `Ctrl+Click`

### CRT-Specific Workflows:
1. **CSS Color Testing**: Use Colorize to preview phosphor colors
2. **JavaScript Testing**: Select code → `Ctrl+Alt+N` to run
3. **Asset Linking**: Use Path IntelliSense for `assets/images/bg*.png`
4. **HTML Structure**: Use Auto Rename/Close for DOM manipulation
5. **Class Management**: Use CSS Class Completion for effect classes

---

## 🔧 **Customization Tips**

### Color Themes for CRT Development:
- Dark themes complement the retro aesthetic
- Consider: "One Dark Pro", "Dracula", or "Monokai Pro"

### Additional Useful Settings:
```json
// Better minimap for large files
"editor.minimap.enabled": true,
"editor.minimap.scale": 2,

// Enhanced bracket matching
"editor.bracketPairColorization.enabled": true,

// CRT-friendly font
"editor.fontFamily": "'VT323', 'Courier New', monospace"
```

---

## 📊 **Performance Notes**

All extensions are configured for optimal performance:
- **Colorize**: Only processes relevant file types
- **Indent Rainbow**: 100ms update delay for smooth editing  
- **Path IntelliSense**: Disabled for TypeScript to avoid conflicts
- **Code Runner**: Uses terminal for better resource management

Your development environment is now fully optimized for CRT/VHS portfolio development! 🌟
