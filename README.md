# 🤖 LifeAx AI Assistant

Intelligent AI chat application with machine learning, offline mode, and anonymous AI services.

## ✨ Features

- 🧠 **Machine Learning** - Learns your communication style and interests
- 💾 **Offline Mode** - Works without internet using learned patterns
- 🌐 **Anonymous AI** - Free AI services (no API key required)
- 🎯 **Personalized** - Adapts responses based on your preferences
- 💬 **Beautiful UI** - Gradient chat interface
- 🔄 **Multi-Source** - Falls back between Gemini, HuggingFace, DuckDuckGo, and offline

## 🚀 Quick Start
```bash
git clone https://github.com/teksan1/LifeAx.git
cd LifeAx
pip install -r backend/requirements.txt
./run.sh
```

**Optional:** Add Gemini API key to `.env` for best results
- Get free key: https://aistudio.google.com/apikey

## 🧠 Intelligence Features

### Adaptive Learning
- Detects if you prefer formal/casual/technical language
- Remembers topics you discuss frequently
- Personalizes responses over time

### Offline Capabilities
- Works without internet for basic queries
- Learns patterns from online conversations
- Improves the more you use it

### Anonymous AI Services
1. **Gemini API** (if key provided)
2. **HuggingFace** (free, anonymous)
3. **DuckDuckGo AI** (anonymous)
4. **Offline patterns** (learned responses)

## 📁 Project Structure
```
LifeAx/
├── backend/
│   ├── app.py           # FastAPI server
│   ├── ai_engine.py     # Multi-source AI with ML
│   ├── memory.py        # Conversation memory
│   └── data/
│       ├── memory.json       # Chat history
│       ├── user_profile.json # Your preferences
│       └── learned_patterns.json # Offline AI
├── frontend/
│   └── index.html       # Chat UI
├── run.sh               # One-click launcher
└── README.md
```

## 🔧 How It Works

1. **Learns your style** - Tracks formal/casual/technical preferences
2. **Remembers interests** - Notes topics you discuss
3. **Tries multiple AI sources** - Gemini → HuggingFace → DuckDuckGo → Offline
4. **Works offline** - Uses learned patterns when no internet
5. **Gets smarter** - Improves with every conversation

## 🌐 Usage
```bash
# Start the app
./run.sh

# Access at: http://127.0.0.1:8000

# Stop with: Ctrl+C
```

## 📡 API Endpoints

- `GET /` - Chat UI
- `POST /chat` - Send messages
- `GET /health` - Health check

## 🔒 Privacy

- All data stored locally
- Anonymous AI services (no tracking)
- API keys never committed (in `.gitignore`)
- Conversations stay on your device

## 🤝 Contributing

Pull requests welcome!

## 📝 License

MIT License

---

Made with ❤️ by [teksan1](https://github.com/teksan1)
