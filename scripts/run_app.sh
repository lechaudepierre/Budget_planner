#!/bin/bash
# Startup script — called by PM2 on every start/restart.
# Builds the app from source, then serves it.

cd /Users/pierrelechaude/Code/Budget_planner

export PATH="/opt/homebrew/bin:/opt/homebrew/opt/node@22/bin:$PATH"

npm run build && exec npm run preview -- --host
