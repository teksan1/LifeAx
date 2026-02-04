#!/bin/bash
# -------------------------------
# LifeAx Preview Launcher
# -------------------------------

# Exit on error
set -e

echo "🚀 Starting LifeAx Preview..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Step 2: Start backend
echo "🖥️ Starting backend..."
cd server
pnpm run dev &       # Run in background
BACKEND_PID=$!
cd ..

# Step 3: Start frontend
echo "🌐 Starting frontend..."
cd client
pnpm run dev         # This will keep running in foreground
cd ..

# Step 4: Cleanup on exit
trap "echo '🛑 Stopping backend...'; kill $BACKEND_PID" EXIT
