"""
Enterprise External Clients for StadiumFlow AI / Election Assistant.
Handles Civic Information and Wikipedia integrations with robust error handling.
"""

import logging
import requests
from typing import Dict, Any, Optional
from utils.config import AppConfig

logger = logging.getLogger(__name__)

class CivicClient:
    """
    Google Civic Information API client for voter and election data.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or AppConfig.get_secret("CIVIC_INFO_API_KEY")
        self.base_url = "https://www.googleapis.com/civicinfo/v2/voterinfo"

    from functools import lru_cache

    @lru_cache(maxsize=128)
    def get_voter_info(self, address: str) -> Dict[str, Any]:
        if not self.api_key:
            logger.warning("Civic API key not configured. Returning empty state.")
            return {}
        
        # Normalize address to improve Assam-specific lookups
        normalized_address = address
        if "assam" not in address.lower():
            normalized_address += ", Assam, India"
        elif "india" not in address.lower():
            normalized_address += ", India"

        params = {
            "address": normalized_address, 
            "key": self.api_key,
            # ECI/Assam Election 2026 specific ID could be added here if known
            # "electionId": "..." 
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            data = response.json()
            
            if response.status_code == 400:
                # Often occurs when address is valid but no election is found
                return {
                    "error": "No election data found for this location in the Civic API.",
                    "normalized_address": normalized_address,
                    "is_partial": True
                }
            
            response.raise_for_status()
            data["normalized_address"] = normalized_address
            return data
        except Exception as e:
            logger.error(f"Civic API Error: {str(e)}")
            return {"error": f"Civic Service Error: {str(e)}", "normalized_address": normalized_address}

class WikiClient:
    """
    Wikipedia API client for educational summaries.
    """
    from functools import lru_cache

    @staticmethod
    @lru_cache(maxsize=128)
    def get_summary(query: str) -> str:
        formatted_query = query.replace(' ', '_')
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{formatted_query}"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                return response.json().get("extract", "")
            return ""
        except Exception as e:
            logger.debug(f"Wiki lookup failed for {query}: {e}")
            return ""
