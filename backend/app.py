from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from ai_engine import ask
import os
app=FastAPI()
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_methods=["*"],allow_headers=["*"])
class Msg(BaseModel):message:str
@app.get("/")
def home():
 hp=os.path.join(os.path.dirname(__file__),'..','frontend','index.html')
 return FileResponse(hp)if os.path.exists(hp)else{"status":"online"}
@app.post("/chat")
def chat(m:Msg):
 if not m.message.strip():raise HTTPException(400,"Empty")
 return{"reply":ask(m.message)}
@app.get("/health")
def health():return{"status":"healthy"}
