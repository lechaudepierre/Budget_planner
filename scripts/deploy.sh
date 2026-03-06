#!/bin/bash
# Deploy script — rebuild the app and restart the preview server via PM2.
# Run this after making code changes to push them to the running app.
#
# Usage: ./scripts/deploy.sh

set -e

cd /Users/pierrelechaude/Code/Budget_planner

export PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@22/bin:$PATH"

echo "Building..."
npm run build

echo "Restarting preview server..."
pm2 restart budget-planner

echo "Done. App is live at http://localhost:4173"
