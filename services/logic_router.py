import logging
from typing import List, Dict, Any
from services.gemini_client import GeminiClient
from services.prompts import LOGIC_ROUTER

logger = logging.getLogger(__name__)

class LogicRouter:
    """
    Intelligent intent routing using Gemini.
    """
    def __init__(self, gemini_client: GeminiClient):
        self.client = gemini_client
        self.router_prompt = LOGIC_ROUTER

    def route_intent(self, user_input: str, history: List[Dict] = None) -> str:
        """
        Routes user input to [EDUCATIONAL], [TIMELINE], [ACTIONABLE], or [OUT_OF_BOUNDS].
        """
        if not self.client.model:
            return "[EDUCATIONAL]"

        history_context = ""
        if history:
            history_context = "Conversation History:\n" + "\n".join([f"{m['role']}: {m['parts']}" for m in history]) + "\n\n"

        routing_query = (
            f"{self.router_prompt}\n\n"
            f"{history_context}"
            f"User Input: {user_input}\n\n"
            "Respond ONLY with the category tag: [EDUCATIONAL], [TIMELINE], [ACTIONABLE], or [OUT_OF_BOUNDS]."
        )
        
        try:
            category = self.client.get_response(routing_query).strip()
            
            for tag in ["[EDUCATIONAL]", "[TIMELINE]", "[ACTIONABLE]", "[OUT_OF_BOUNDS]"]:
                if tag in category:
                    return tag
            return "[EDUCATIONAL]"
        except Exception as e:
            logger.error(f"Routing Error: {str(e)}")
            return "[EDUCATIONAL]"
