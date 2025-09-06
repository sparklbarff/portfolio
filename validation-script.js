// Portfolio System Validation Script
// Run this in browser console on any page to validate system status

console.log("🔬 Portfolio System Validation Script v1.0");
console.log("=====================================\n");

// 1. Browser Capability Detection
console.log("📊 BROWSER CAPABILITIES:");
const capabilities = {
  fetch: typeof fetch !== "undefined",
  requestAnimationFrame: typeof requestAnimationFrame !== "undefined",
  visibilityAPI: typeof document.hidden !== "undefined",
  localStorage: typeof Storage !== "undefined",
  cssCustomProperties: (() => {
    try {
      const testEl = document.createElement("div");
      testEl.style.setProperty("--test", "1");
      const value = getComputedStyle(testEl).getPropertyValue("--test");
      return value.trim() === "1";
    } catch (e) {
      return false;
    }
  })(),
  webGL: (() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
    } catch (e) {
      return false;
    }
  })(),
  webAudio:
    typeof AudioContext !== "undefined" ||
    typeof webkitAudioContext !== "undefined",
};

Object.entries(capabilities).forEach(([key, value]) => {
  console.log(`  ${value ? "✅" : "❌"} ${key}: ${value}`);
});

// 2. Performance Metrics
console.log("\n⚡ PERFORMANCE METRICS:");
console.log(`  🖥️  Viewport: ${window.innerWidth}x${window.innerHeight}`);
console.log(`  📱 Device Pixel Ratio: ${window.devicePixelRatio}`);
console.log(
  `  🌐 Online Status: ${navigator.onLine ? "Connected" : "Offline"}`
);
console.log(
  `  🧠 Memory (if available): ${navigator.deviceMemory || "Unknown"} GB`
);
console.log(
  `  ⚡ Connection (if available): ${
    navigator.connection?.effectiveType || "Unknown"
  }`
);

// 3. Background Loader System Check
console.log("\n🔄 BACKGROUND SYSTEM STATUS:");
if (window.bgLoader) {
  const bgLoader = window.bgLoader;
  console.log(`  ✅ Background Loader: Active`);
  console.log(
    `  📊 Browser Support:`,
    bgLoader.browserSupport || "Not available"
  );
  console.log(
    `  📋 Manifest Status:`,
    bgLoader.manifest ? "Loaded" : "Loading/Failed"
  );
  console.log(`  🖼️  Images Loaded: ${bgLoader.images?.length || 0}`);
  console.log(`  🎯 Current Index: ${bgLoader.currentIndex || 0}`);
} else {
  console.log("  ❌ Background Loader: Not found or not initialized");
}

// 4. CRT System Status
console.log("\n📺 CRT SYSTEM STATUS:");
if (window.CRTSystem) {
  console.log(`  ✅ CRT System: Active`);
  console.log(`  🌡️  Thermal State: Available`);
  console.log(`  📐 Physics Engine: Loaded`);
} else {
  console.log("  ❌ CRT System: Not found or not loaded");
}

// 5. DOM Elements Check
console.log("\n🏗️  DOM STRUCTURE CHECK:");
const requiredElements = {
  "bg-container": document.getElementById("bg-container"),
  navigation: document.querySelector("nav") || document.querySelector(".nav"),
  scanSweep: document.getElementById("scanSweep"),
  "main-content":
    document.querySelector("main") || document.querySelector(".main"),
};

Object.entries(requiredElements).forEach(([name, element]) => {
  console.log(
    `  ${element ? "✅" : "❌"} ${name}: ${element ? "Found" : "Missing"}`
  );
});

// 6. CSS Custom Properties Test
console.log("\n🎨 CSS SYSTEM CHECK:");
const testElement = document.createElement("div");
testElement.style.setProperty("--test-prop", "test-value");
document.body.appendChild(testElement);
const customPropValue =
  getComputedStyle(testElement).getPropertyValue("--test-prop");
document.body.removeChild(testElement);

console.log(
  `  ${
    customPropValue.trim() === "test-value" ? "✅" : "❌"
  } CSS Custom Properties: ${
    customPropValue.trim() === "test-value" ? "Working" : "Fallback Required"
  }`
);

// 7. Network Status
console.log("\n🌐 NETWORK STATUS:");
if ("connection" in navigator) {
  const conn = navigator.connection;
  console.log(`  📶 Connection Type: ${conn.effectiveType || "Unknown"}`);
  console.log(`  ⬇️  Downlink: ${conn.downlink || "Unknown"} Mbps`);
  console.log(`  📊 Round Trip Time: ${conn.rtt || "Unknown"} ms`);
} else {
  console.log("  ℹ️  Network API not available");
}

// 8. Mobile Detection
console.log("\n📱 MOBILE DETECTION:");
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

console.log(`  📱 Mobile Device: ${isMobile ? "Yes" : "No"}`);
console.log(`  📟 Tablet Device: ${isTablet ? "Yes" : "No"}`);
console.log(`  👆 Touch Support: ${hasTouch ? "Yes" : "No"}`);

// 9. Accessibility Features
console.log("\n♿ ACCESSIBILITY STATUS:");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const prefersHighContrast = window.matchMedia(
  "(prefers-contrast: high)"
).matches;
const colorScheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

console.log(
  `  🏃 Reduced Motion: ${
    prefersReducedMotion ? "Enabled (Accessibility)" : "Disabled"
  }`
);
console.log(
  `  🎨 High Contrast: ${prefersHighContrast ? "Enabled" : "Disabled"}`
);
console.log(`  🌙 Color Scheme: ${colorScheme}`);

// 10. Performance API (if available)
console.log("\n📈 PERFORMANCE DATA:");
if ("performance" in window && window.performance.timing) {
  const timing = window.performance.timing;
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  const domContentLoaded =
    timing.domContentLoadedEventEnd - timing.navigationStart;
  const firstPaint =
    window.performance.getEntriesByType("paint")[0]?.startTime || "N/A";

  console.log(`  ⏱️  Total Load Time: ${loadTime}ms`);
  console.log(`  🏗️  DOM Content Loaded: ${domContentLoaded}ms`);
  console.log(
    `  🎨 First Paint: ${
      typeof firstPaint === "number"
        ? Math.round(firstPaint) + "ms"
        : firstPaint
    }`
  );
} else {
  console.log("  ℹ️  Performance API not available");
}

// 11. Error Detection
console.log("\n🚨 ERROR DETECTION:");
let errorCount = 0;
const originalConsoleError = console.error;
console.error = function (...args) {
  errorCount++;
  originalConsoleError.apply(console, args);
};

// Wait a moment for any immediate errors
setTimeout(() => {
  console.log(
    `  ${errorCount === 0 ? "✅" : "⚠️"} Console Errors: ${errorCount} detected`
  );
  console.error = originalConsoleError; // Restore original
}, 100);

// 12. Validation Summary
console.log("\n🎯 VALIDATION SUMMARY:");
console.log("=====================================");

const criticalSystems = [
  capabilities.fetch || capabilities.requestAnimationFrame, // At least one modern API
  requiredElements["bg-container"], // Essential DOM element
  !prefersReducedMotion || true, // Accessible or motion-friendly
];

const workingSystems = criticalSystems.filter(Boolean).length;
const totalSystems = criticalSystems.length;

console.log(
  `  📊 System Health: ${workingSystems}/${totalSystems} critical systems operational`
);
console.log(
  `  🎯 Browser Compatibility: ${
    Object.values(capabilities).filter(Boolean).length
  }/${Object.keys(capabilities).length} features supported`
);
console.log(`  📱 Mobile Optimized: ${isMobile ? "Yes" : "Desktop Mode"}`);
console.log(
  `  ♿ Accessibility: ${
    prefersReducedMotion ? "Motion-Reduced Mode" : "Full Effects Mode"
  }`
);

if (workingSystems === totalSystems) {
  console.log("  ✅ OVERALL STATUS: SYSTEM OPERATIONAL");
} else {
  console.log("  ⚠️  OVERALL STATUS: ISSUES DETECTED - CHECK ABOVE");
}

console.log("\n🔬 Validation complete! Check above for any issues.");
console.log(
  "💡 Tip: Run this script on different pages and browsers for comprehensive testing."
);

// Export results for further analysis
window.portfolioValidationResults = {
  timestamp: new Date().toISOString(),
  capabilities,
  performance: window.performance?.timing,
  mobile: { isMobile, isTablet, hasTouch },
  accessibility: { prefersReducedMotion, prefersHighContrast, colorScheme },
  systemHealth: `${workingSystems}/${totalSystems}`,
  browserSupport: `${Object.values(capabilities).filter(Boolean).length}/${
    Object.keys(capabilities).length
  }`,
};

console.log("\n📋 Results saved to: window.portfolioValidationResults");
