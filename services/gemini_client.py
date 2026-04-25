"""
Gemini API client using the google-generativeai SDK.
Configured via GOOGLE_API_KEY environment variable.
"""
import os
import logging
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class GeminiClient:
    """
    Production Gemini client using the standard google-generativeai SDK.
    """
    def __init__(self, model_name: str = "models/gemini-2.0-flash"):
        self.model_name = model_name
        self.model = None
        self.fallbacks = [
            "models/gemini-2.0-flash",
            "models/gemini-flash-latest",
            "models/gemini-pro-latest"
        ]
        self.current_fallback_idx = 0

        self._initialize_model(self.model_name)

    def _initialize_model(self, model_name: str):
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                from services.prompts import build_system_instruction
                self.model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=build_system_instruction()
                )
                logger.info(f"Gemini initialized with model: {model_name}")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini with {model_name}: {str(e)}")
        else:
            logger.warning("GOOGLE_API_KEY not found. Gemini will not be initialized.")

    def get_response(self, prompt: str, history: Optional[List[Dict[str, Any]]] = None, context_data: Optional[Dict] = None, retry_count: int = 1) -> str:
        """Send a prompt to Gemini and return the text response with multi-model fallback."""
        if not self.model:
            return "AI Service is currently unavailable. Please check your API configuration."

        import time
        from services.prompts import build_context_prompt

        final_prompt = prompt
        if context_data:
            context_message = build_context_prompt(context_data)
            final_prompt = f"{context_message}\n\nUser Question: {prompt}"

        for attempt in range(retry_count + 1):
            try:
                chat = self.model.start_chat(history=history or [])
                response = chat.send_message(final_prompt)
                return response.text
            except Exception as e:
                error_msg = str(e).lower()
                
                # Handle Quota / Rate Limit or Model Not Found
                is_quota = any(x in error_msg for x in ["429", "resource_exhausted", "quota"])
                is_not_found = "404" in error_msg
                
                if (is_quota or is_not_found):
                    if is_quota and attempt < retry_count:
                        wait_time = (attempt + 1) * 3
                        logger.warning(f"Rate limit hit. Retrying in {wait_time}s...")
                        time.sleep(wait_time)
                        continue
                    
                    # Try next fallback model
                    if self.current_fallback_idx < len(self.fallbacks) - 1:
                        self.current_fallback_idx += 1
                        next_model = self.fallbacks[self.current_fallback_idx]
                        logger.warning(f"Switching to fallback model: {next_model}")
                        self.model_name = next_model
                        self._initialize_model(next_model)
                        return self.get_response(prompt, history, context_data, retry_count=0)
                
                logger.error(f"Gemini API Error (Attempt {attempt+1}): {str(e)}")
                if attempt == retry_count:
                    return f"I'm sorry, I'm experiencing high traffic. Please try again in a few seconds. (Error: {str(e)})"
        
        return "Service temporarily unavailable due to high demand. Please try again shortly."
