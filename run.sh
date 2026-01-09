#!/bin/bash
set -e
echo "🚀 Starting LifeAx..."
cd ~/LifeAx
cleanup(){ echo "🛑 Shutting down..."; kill $PID 2>/dev/null || true; exit 0; }
trap cleanup SIGINT SIGTERM
PYTHONPATH=backend uvicorn backend.app:app --host 127.0.0.1 --port 8000 --log-level error &
PID=$!
echo "⏳ Starting server..."
for i in {1..10}; do
 curl -s http://127.0.0.1:8000/health >/dev/null 2>&1 && break
 sleep 1
 [ $i -eq 10 ] && echo "❌ Failed" && kill $PID 2>/dev/null && exit 1
done
echo "✅ Server ready!"
echo "🌐 Opening browser..."
if command -v termux-open-url &>/dev/null; then
 termux-open-url http://127.0.0.1:8000
elif command -v xdg-open &>/dev/null; then
 xdg-open http://127.0.0.1:8000 2>/dev/null
elif command -v open &>/dev/null; then
 open http://127.0.0.1:8000
else
 echo "📱 Open: http://127.0.0.1:8000"
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ LifeAx Running!"
echo "🌐 GUI: http://127.0.0.1:8000"
echo "📡 API: http://127.0.0.1:8000/docs"
echo "❌ Stop: Ctrl+C"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -f /dev/null & wait
