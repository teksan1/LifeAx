# 🤖 LifeAx AI Assistant

Beautiful AI chat application powered by Google Gemini API.

## ✨ Features
- 💬 Beautiful gradient chat UI
- 🧠 Powered by Google Gemini AI
- 💾 Conversation memory (last 10 messages)
- 🎨 Responsive design (mobile & desktop)
- ⚡ One-command installation & launch
- 🔄 Auto-reconnects to available API endpoints

## 🚀 Quick Start
```bash
git clone https://github.com/teksan1/LifeAx.git
cd LifeAx
cp .env.example .env
nano .env  # Add your Gemini API key
pip install -r backend/requirements.txt
./run.sh
```

**Get your free Gemini API key:** https://aistudio.google.com/apikey

The app will automatically start the server and open in your browser at http://127.0.0.1:8000

## 📁 Project Structure
```
LifeAx/
├── backend/
│   ├── app.py           # FastAPI server
│   ├── ai_engine.py     # Gemini AI integration
│   ├── memory.py        # Conversation memory
│   ├── requirements.txt # Dependencies
│   └── data/            # Memory storage
├── frontend/
│   └── index.html       # Chat UI
├── .env                 # Your API key (gitignored)
├── .env.example         # Template
├── run.sh               # One-click launcher
└── README.md
```

## 🔧 Manual Setup
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start server
cd ~/LifeAx
PYTHONPATH=backend uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

## 📡 API Endpoints

- `GET /` - Chat UI
- `POST /chat` - Send messages
- `GET /health` - Health check

## ⚠️ Security

- Never commit `.env` file
- Always use `.env.example` as template
- API keys are automatically protected by `.gitignore`

## 🤝 Contributing

Pull requests welcome!

## 📝 License

MIT License

---

Made with ❤️ by [teksan1](https://github.com/teksan1)
