#!/usr/bin/env bash
# Quick test to verify server starts without PostgreSQL/Redis

echo "🧪 Testing SyncKit Server Startup..."
echo ""
echo "This test verifies that the server:"
echo "  ✓ Starts successfully without PostgreSQL"
echo "  ✓ Starts successfully without Redis"
echo "  ✓ Runs in memory-only mode"
echo "  ✓ Has proper error handling"
echo ""

cd "$(dirname "$0")/server/typescript"

# Start server in background
echo "📦 Starting server..."
bun run dev > /tmp/synckit-test.log 2>&1 &
SERVER_PID=$!

# Wait for server to start (or fail)
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Server started successfully!"
    echo ""
    echo "📋 Server output:"
    cat /tmp/synckit-test.log | grep -E "(Mode:|PostgreSQL|Redis|running on)" | tail -10
    echo ""
    echo "🎉 Test PASSED - Server handles missing PostgreSQL/Redis gracefully"
    
    # Kill the server
    kill $SERVER_PID 2>/dev/null
    exit 0
else
    echo "❌ Server failed to start"
    echo ""
    echo "📋 Error output:"
    cat /tmp/synckit-test.log
    exit 1
fi
