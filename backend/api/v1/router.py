from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
import time

from utils.exceptions import ServiceError
from services import gemini, civic, wiki, router

logger = logging.getLogger(__name__)

api_router = APIRouter()

# --- Models ---

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message sender (user/model)")
    parts: List[str] = Field(..., description="Content parts of the message")

class ChatRequest(BaseModel):
    prompt: str = Field(..., description="User question or prompt")
    history: Optional[List[ChatMessage]] = Field(default=None, description="Chat history for context")
    address: Optional[str] = Field(default=None, description="Optional user address for contextual API lookups")

class AddressRequest(BaseModel):
    address: str = Field(..., description="Physical address to look up civic information for")

class WikiRequest(BaseModel):
    query: str = Field(..., description="Topic to look up on Wikipedia")

# --- Endpoints ---

@api_router.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint to verify system status."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "services": {
            "gemini": "configured" if gemini.model else "missing_key",
            "civic": "configured" if civic.api_key else "missing_key"
        }
    }

@api_router.post("/chat", tags=["AI"])
async def chat_endpoint(request: ChatRequest):
    """
    Primary chat endpoint for the AI assistant.
    Uses LogicRouter to determine intent and optionally injects context data.
    """
    gemini_history = []
    if request.history:
        gemini_history = [{"role": msg.role, "parts": msg.parts} for msg in request.history]
    
    # 1. Determine User Intent
    intent = router.route_intent(request.prompt, history=gemini_history)
    logger.info(f"User Intent Routed: {intent}")

    context_data = None
    
    # 2. Logic Router: Decide whether to fetch Civic data
    if intent == "[TIMELINE]" and request.address:
        logger.info(f"Intent is TIMELINE. Fetching civic data for: {request.address}")
        try:
            civic_data = civic.get_voter_info(request.address)
            context_data = civic_data
        except ServiceError as e:
            logger.warning(f"Civic API lookup failed: {e.message}")

    # 3. Call Gemini with optional context
    response_text = gemini.get_response(request.prompt, history=gemini_history, context_data=context_data)
    return {
        "response": response_text,
        "intent": intent,
        "context_applied": context_data is not None
    }

@api_router.post("/civic-info", tags=["Data"])
async def civic_info_endpoint(request: AddressRequest):
    """
    Look up polling stations and ballot info using the Google Civic Information API.
    """
    data = civic.get_voter_info(request.address)
    return data

@api_router.post("/wiki-summary", tags=["Data"])
async def wiki_summary_endpoint(request: WikiRequest):
    """
    Fetch a non-partisan summary for an election-related topic.
    """
    summary = wiki.get_summary(request.query)
    if not summary:
        return {"summary": "No summary found for this topic.", "found": False}
    return {"summary": summary, "found": True}
