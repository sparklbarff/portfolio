# 🚀 Complete Extension Setup Guide
## Post-Installation Configuration Checklist

**WakaTime ✅ DONE** - You've already set up the API key! Now let me guide you through the remaining extension configurations.

---

## 🎯 **IMMEDIATE ACTION ITEMS**

### **✅ Already Configured (No Action Needed):**
- ESLint & Prettier ✅
- Live Server ✅  
- CSS Peek ✅
- HTML CSS Support ✅
- Auto Rename/Close Tag ✅
- Colorize ✅
- Indent Rainbow ✅
- Path IntelliSense ✅
- Code Runner ✅
- Better Comments (with CRT/VHS tags) ✅
- Turbo Console Log ✅
- Peacock (with CRT colors) ✅
- Blockman ✅
- WakaTime ✅

### **🔧 Extensions That May Need Quick Setup:**

---

## **1. 🎨 THEMES - Choose Your CRT Aesthetic**

### **Test Your New Themes:**
1. Press `Ctrl+K Ctrl+T` (or `Cmd+K Cmd+T` on Mac)
2. Try these themes:
   - **Neon City** - Perfect cyberpunk aesthetic for CRT work
   - **Dracula Redefined** - Enhanced dark with better contrast
   - **Deep Dark Space** - Minimalist for focused coding

**Recommendation:** Start with **Neon City** for your CRT/VHS development!

---

## **2. 🎯 PEACOCK - Multi-Instance Color Coding**

### **Test Peacock Setup:**
1. Press `Ctrl+Shift+P` → Type "Peacock: Change to Favorite Color"
2. Select **"CRT Green"** - your workspace should turn green-tinted
3. Open another VS Code window → Select **"VHS Orange"** for testing

**Your Pre-Configured Colors:**
- **CRT Green** (`#00ff41`) - Main development
- **VHS Orange** (`#ff6b35`) - Testing/debugging  
- **Neon Cyan** (`#00ffff`) - Documentation
- **Angular Red** (`#dd0531`) - Emergency fixes

---

## **3. ⚡ FONT SWITCHER - Quick Font Changes**

### **Test Font Switching:**
1. Press `Ctrl+Shift+P` → Type "Font Switcher"  
2. Try these pre-configured options:
   - **"Hack Primary"** - Your main 14pt Hack font
   - **"Hack Large"** - 16pt for better visibility
   - **"JetBrains Fallback"** - Alternative monospace

---

## **4. 🔥 TURBO CONSOLE LOG - Debug Like a Pro**

### **Test Console Logging:**
1. Open `/WIP/v1/assets/js/extension-test.js`
2. Click on any variable (like `selectedColor` on line 28)
3. Press `Ctrl+Alt+L` (or `Cmd+Alt+L`)
4. Should generate: `console.log('🔥 selectedColor ~', selectedColor);`

**Your Custom Settings:**
- Prefix: `🔥` emoji for easy log identification
- Delimiter: `~` for clean separation
- Single quotes (matches your ESLint config)
- No filename/line numbers (cleaner output)

---

## **5. 🎨 BETTER COMMENTS - CRT Documentation System**

### **Test Your Custom Comment Tags:**
Open any JavaScript file and try these:

```javascript
// ! Critical: CRT timing must be exact
// ? Why does this VHS effect only work in Chrome?
// todo Implement phosphor burn-in persistence
// CRT This handles cathode ray tube simulation
// VHS This creates video tape artifacts  
// * Important: NTSC timing accuracy required
// // This code is deprecated, remove after testing
```

**Color Results:**
- `// !` → **Red** (critical issues)
- `// ?` → **Blue** (questions/research needed)  
- `// todo` → **Orange** (action items)
- `// CRT` → **Green/Bold** (CRT-specific code)
- `// VHS` → **Orange/Bold** (VHS-specific code)
- `// *` → **Green** (highlights)
- `// //` → **Gray/Strikethrough** (deprecated)

---

## **6. 🔲 BLOCKMAN - Code Structure Visualization**

### **Test Nested Code Highlighting:**
1. Open any file with nested objects/functions
2. Your existing test file shows this well with the `complexNesting` object
3. Should see **greenish color gradients** showing nesting depth

**Benefits for CRT Development:**
- Visualize your 12 JavaScript system hierarchies
- See effect nesting levels at a glance
- Navigate complex CRT configurations easily

---

## **7. 📐 BRACKET MATCHING - Enhanced Navigation**

### **Test Bracket Features:**

**Subtle Match Brackets:**
- Brackets now have **colored underlines**:
  - `()` → **CRT Green** underline
  - `[]` → **VHS Orange** underline  
  - `{}` → **Neon Cyan** underline

**Bracket Select:**
1. Place cursor inside any `()`, `[]`, or `{}`
2. Press `Ctrl+Shift+A` → Selects content within brackets

**TabOut:**
1. Type `"hello world"` 
2. Place cursor between quotes
3. Press `Tab` → Cursor moves outside quotes

---

## **8. 🌐 LIVE PREVIEW - Dual Server Setup**

You now have **TWO live server options**:

### **Option A: Live Server (Original)**
- Port: 3000
- Root: `/WIP/v1`
- Right-click HTML → "Open with Live Server"

### **Option B: Live Preview (Microsoft)**  
- Port: 3001
- Same root directory
- `Ctrl+Shift+P` → "Live Preview: Show Preview"

**Recommendation:** Use Live Server (3000) for main development, Live Preview (3001) for testing.

---

## **9. 🧠 JAVASCRIPT BOOSTER - Code Intelligence**

### **Test Refactoring Features:**
1. Right-click in any JavaScript file
2. Look for **"JavaScript Booster"** options:
   - Convert to arrow function
   - Replace string with template literal  
   - Split declaration and initialization
   - Remove redundant else
   - And many more!

---

## **10. 📊 WAKATIME DASHBOARD**

### **Check Your Analytics:**
1. Go to [https://wakatime.com/dashboard](https://wakatime.com/dashboard)
2. Should start seeing data within minutes of coding
3. View:
   - **Languages used** (HTML, CSS, JavaScript)
   - **Files worked on** most
   - **Daily coding patterns**
   - **Project time distribution**

---

## 🔧 **ADVANCED CONFIGURATIONS**

### **Global VS Code Settings to Consider:**

```json
{
  // Enhanced for CRT development
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.minimap.enabled": true,
  "editor.minimap.scale": 2,
  "editor.smoothScrolling": true,
  
  // Better file icons (if you want)
  "workbench.iconTheme": "material-icon-theme" // Optional
}
```

### **Keyboard Shortcuts Summary:**

| Function | Shortcut | Extension |
|----------|----------|-----------|
| **Insert Console Log** | `Ctrl+Alt+L` | Turbo Console Log |
| **Run Code** | `Ctrl+Alt+N` | Code Runner |
| **Tab Out** | `Tab` | TabOut |
| **CSS Peek** | `Alt+F12` | CSS Peek |
| **Bracket Select** | `Ctrl+Shift+A` | Bracket Select |
| **Change Theme** | `Ctrl+K Ctrl+T` | Built-in |
| **Peacock Color** | `Ctrl+Shift+P` → "Peacock" | Peacock |
| **Font Switch** | `Ctrl+Shift+P` → "Font" | Font Switcher |

---

## 🎯 **QUICK VERIFICATION CHECKLIST**

### **Test Each Extension (5 minutes):**

1. **✅ Theme Test**: `Ctrl+K Ctrl+T` → Select "Neon City"
2. **✅ Peacock Test**: `Ctrl+Shift+P` → "Peacock" → "CRT Green"  
3. **✅ Comment Test**: Type `// CRT Testing` → Should be green/bold
4. **✅ Console Log Test**: Select variable → `Ctrl+Alt+L`
5. **✅ TabOut Test**: Type `"test"` → Tab out with `Tab` key
6. **✅ Live Server**: Right-click index.html → "Open with Live Server"
7. **✅ WakaTime**: Check [wakatime.com/dashboard](https://wakatime.com/dashboard)

---

## 🚀 **YOU'RE READY TO CODE!**

Your development environment is now **100% configured** for professional CRT/VHS portfolio development:

- **30 Extensions** fully configured
- **Custom CRT/VHS workflow** optimized
- **Dual live servers** for testing
- **Advanced debugging** with console logging
- **Time tracking** for productivity insights
- **Multi-instance support** with color coding
- **Professional themes** for the retro aesthetic

**Your VS Code is now a CRT/VHS development powerhouse!** 🌟⚡

Ready to create some incredible cathode ray tube effects?
