import os
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr

class User(BaseModel):
    id: str = Field(..., alias="_id")
    email: EmailStr
    username: str
    is_creator: bool = False
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str

class Content(BaseModel):
    id: str = Field(..., alias="_id")
    title: str
    type: str  # video, audio, live
    url: str
    thumbnail_url: str
    creator_id: str
    duration: Optional[str] = None
    views: int = 0
    created_at: datetime = Field(default_factory=datetime.now)

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []
