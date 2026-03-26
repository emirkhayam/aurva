#!/bin/bash
# Sync frontend files to admin-panel/public-site
# Usage: ./sync-frontend.sh

set -e

echo "🔄 Syncing frontend/ → admin-panel/public-site/"

# Remove old files from public-site
rm -rf admin-panel/public-site/*

# Copy all files from frontend to public-site
cp -r frontend/* admin-panel/public-site/

echo "✅ Sync completed!"
echo ""
echo "📝 Files synced:"
ls -lah admin-panel/public-site/

echo ""
echo "⚠️  Don't forget to commit changes:"
echo "   git add admin-panel/public-site/"
echo "   git commit -m 'chore: sync frontend to public-site'"
