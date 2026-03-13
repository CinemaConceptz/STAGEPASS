import os
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import uvicorn
from gemini_service import GeminiService

load_dotenv()

app = FastAPI(title="STAGEPASS API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.getenv("DB_NAME", "stagepass")]

# Services
gemini_service = GeminiService()

# Models
class LoginRequest(BaseModel):
    email: str
    password: str

# Routes
@app.get("/")
async def root():
    return {"message": "Welcome to STAGEPASS API", "status": "online"}

@app.get("/api/download/stagepass-production")
async def download_production_zip():
    """Serve the production-ready STAGEPASS source code zip."""
    # Try final zip first, fall back to production zip
    for zip_name in ["stagepass_final.zip", "stagepass_production.zip"]:
        zip_path = f"/app/{zip_name}"
        if os.path.exists(zip_path):
            return FileResponse(
                zip_path,
                media_type="application/zip",
                filename="stagepass_final.zip"
            )
    raise HTTPException(status_code=404, detail="File not found")

@app.post("/api/auth/login")
async def login(data: LoginRequest):
    # Mock login for MVP
    if data.email == "demo@stagepass.com" and data.password == "demo123":
        return {
            "token": "mock_token_123",
            "user": {
                "id": "user_123",
                "username": "DemoCreator",
                "email": data.email,
                "is_creator": True,
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/chat")
async def chat(request: dict = Body(...)):
    message = request.get("message")
    history = request.get("history", [])
    
    if not message:
        raise HTTPException(status_code=400, detail="Message required")
        
    response = await gemini_service.chat(message, history)
    return {"response": response}

@app.get("/api/feed")
async def get_feed():
    # Mock Content Feed
    return [
        {
            "id": "1",
            "title": "Neon Nights: Live Set from Tokyo",
            "creator": "DJ Cyberpunk",
            "type": "live",
            "thumbnail": "https://images.unsplash.com/photo-1671432403854-cbe798eb44fb?auto=format&fit=crop&w=800&q=80",
            "views": 1204,
            "status": "live"
        },
        {
            "id": "2",
            "title": "The Future of Synthwave",
            "creator": "AudioTech",
            "type": "video",
            "thumbnail": "https://images.unsplash.com/photo-1659083726032-32d67d08ba64?auto=format&fit=crop&w=800&q=80",
            "views": 8500,
            "status": "vod"
        },
        {
            "id": "3",
            "title": "Underground Bass Radio",
            "creator": "BassHead",
            "type": "audio",
            "thumbnail": "https://images.pexels.com/photos/7586652/pexels-photo-7586652.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "views": 3200,
            "status": "vod"
        }
    ]

@app.post("/api/upload")
async def upload_content(data: dict = Body(...)):
    # Mock upload
    return {
        "status": "success",
        "message": "Content metadata received. Upload simulated.",
        "content_id": "new_content_456"
    }

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)
