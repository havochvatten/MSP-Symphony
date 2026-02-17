#!/bin/bash
# Don't use set -e here - we want to continue even if some steps fail
# since some services might already be stopped

echo ""
echo "========================================="
echo "🛑 Symphony Shutdown Script"
echo "========================================="

# ─── 1. STOP ANGULAR DEV SERVER ───────────────────────────────────────────────
echo ""
echo "⏹️  Stopping Angular dev server..."
# Find and kill the ng serve process
NG_PID=$(pgrep -f "ng serve" 2>/dev/null || true)
if [ -n "$NG_PID" ]; then
    kill "$NG_PID" 2>/dev/null || true
    sleep 2
    # Force kill if still running
    kill -9 "$NG_PID" 2>/dev/null || true
    echo "✓ Angular dev server stopped (PID: $NG_PID)"
else
    echo "ℹ️  Angular dev server was not running"
fi

# ─── 2. STOP WILDFLY ──────────────────────────────────────────────────────────
echo ""
echo "⏹️  Stopping WildFly..."
# Check if WildFly is actually running before trying to shut it down
if /opt/wildfly/bin/jboss-cli.sh --connect --commands=":read-attribute(name=server-state)" >/dev/null 2>&1; then
    /opt/wildfly/bin/jboss-cli.sh --connect --command=:shutdown || true

    # Wait for WildFly process to actually die (max 30 seconds)
    echo -n "   Waiting for WildFly to stop..."
    for ((i=1; i<=30; i++)); do
        if ! /opt/wildfly/bin/jboss-cli.sh --connect --commands=":read-attribute(name=server-state)" >/dev/null 2>&1; then
            echo ""
            echo "✓ WildFly stopped cleanly"
            break
        fi
        echo -n "."
        sleep 1
        if [ $i -eq 30 ]; then
            echo ""
            echo "⚠️  WildFly didn't stop gracefully, force killing..."
            pkill -f "standalone.sh" 2>/dev/null || true
            pkill -f "jboss" 2>/dev/null || true
            sleep 2
            echo "✓ WildFly force stopped"
        fi
    done
else
    echo "ℹ️  WildFly was not running"
fi

# ─── 3. CLEAN WILDFLY DEPLOYMENTS ─────────────────────────────────────────────
echo ""
echo "🧹 Cleaning WildFly deployments..."
rm -f /opt/wildfly/standalone/deployments/*.war* 2>/dev/null || true
echo "✓ Deployment files removed"

# ─── 4. CLEAN WILDFLY CACHE & TEMP (important between branch switches!) ────────
echo ""
echo "🧹 Cleaning WildFly internal cache..."
# These folders cause stale class/config issues when switching branches
rm -rf /opt/wildfly/standalone/tmp/* 2>/dev/null || true
rm -rf /opt/wildfly/standalone/data/content/* 2>/dev/null || true
rm -rf /opt/wildfly/standalone/log/*.log 2>/dev/null || true
echo "✓ WildFly tmp, data/content and logs cleared"

# ─── 5. CLEAN BACKEND BUILD ARTIFACTS ─────────────────────────────────────────
echo ""
echo "🧹 Cleaning backend build artifacts..."
if [ -d "/workspace/symphony-ws/target" ]; then
    rm -rf /workspace/symphony-ws/target
    echo "✓ Backend target folder removed"
else
    echo "ℹ️  No backend target folder found"
fi

# ─── 6. CLEAN FRONTEND CACHE ──────────────────────────────────────────────────
echo ""
echo "🧹 Cleaning frontend cache..."
rm -rf /workspace/frontend/.angular 2>/dev/null || true
rm -rf /workspace/frontend/node_modules/.cache 2>/dev/null || true
echo "✓ Frontend cache cleaned"

# Note: We do NOT remove node_modules itself - that would require a slow
# npm install on every branch switch. Only remove if you suspect
# package.json has changed between branches.

# ─── 7. CLEAN SYSTEM TEMP FILES ───────────────────────────────────────────────
echo ""
echo "🧹 Cleaning temporary files..."
find /tmp -maxdepth 1 -type f -name 'tmp*' -delete 2>/dev/null || true
echo "✓ Temp files cleaned"

# ─── 8. SUMMARY ───────────────────────────────────────────────────────────────
echo ""
echo "========================================="
echo "Shutdown Complete!"
echo "========================================="
echo ""
echo "What was cleaned:"
echo "  - Angular dev server stopped"
echo "  - WildFly stopped and cache cleared"
echo "  - Deployment files removed"
echo "  - Backend build artifacts removed"
echo "  - Frontend Angular cache removed"
echo "  - Temp files removed"
echo ""
echo "Note: node_modules kept intact."
echo "Run npm install in /workspace/frontend"
echo "if you switch to a branch with new packages."
echo ""
echo "Safe to switch branches now with:"
echo "  git checkout <branch-name>"
echo ""
echo "To restart Symphony:"
echo "  1. start-wildfly.sh"
echo "  2. deploy-backend.sh"
echo "  3. start-frontend.sh"
echo "========================================="
