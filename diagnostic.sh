#!/bin/bash
echo "🔍 CRT Portfolio System Diagnostic"
echo "=================================="
echo ""

# Test local server
echo "🌐 Testing Local Development Server..."
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ Local server running at http://localhost:3002"
else
    echo "❌ Local server not running - run: ./local-dev-server.sh"
fi
echo ""

# Check key files
echo "📁 Checking Core System Files..."
key_files=(
    "WIP/v1/index.html"
    "WIP/v1/test.html"
    "WIP/v1/assets/js/CRTSystem.js"
    "WIP/v1/assets/js/CRTConfig.js"
    "WIP/v1/assets/js/crt-physics-enhanced.js"
    "WIP/v1/assets/js/crt-physics-control-panel.js"
)

for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
    fi
done
echo ""

# Check JavaScript file count
js_count=$(find WIP/v1/assets/js -name "*.js" | wc -l)
echo "📊 JavaScript Files: $js_count (expected: 19)"

# Check image assets
img_count=$(find WIP/v1/assets/images -name "*.png" 2>/dev/null | wc -l)
echo "🖼️  Image Assets: $img_count (expected: 31)"

# Check documentation
doc_files=(
    "WIP/v1/PROJECT_HANDOFF.md"
    "WIP/v1/SYSTEM_REPORT.md"
    "WIP/v1/TASK_1.4_COMPLETION_REPORT.md"
)

echo ""
echo "📚 Documentation Status..."
for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
    fi
done

echo ""
echo "🚀 Ready to start development!"
echo "   1. Local server: ./local-dev-server.sh"
echo "   2. Open: http://localhost:3002"
echo "   3. Test physics: http://localhost:3002/test.html"
echo "   4. See plan: FORWARD_MOMENTUM_PLAN.md"
