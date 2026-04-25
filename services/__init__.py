from .gemini_client import GeminiClient
from .logic_router import LogicRouter
from .external_clients import CivicClient, WikiClient

# Singleton instances for enterprise-wide use
gemini = GeminiClient()
civic = CivicClient()
wiki = WikiClient()
router = LogicRouter(gemini)

__all__ = ["gemini", "civic", "wiki", "router", "GeminiClient", "LogicRouter", "CivicClient", "WikiClient"]
