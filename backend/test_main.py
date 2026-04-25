import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

# Add the current directory to sys.path to handle imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
from utils.exceptions import ServiceError
from services import gemini, civic, wiki, router

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

@patch("services.GeminiClient.get_response")
@patch("services.LogicRouter.route_intent")
def test_chat_endpoint_success(mock_route, mock_gemini):
    mock_route.return_value = "[EDUCATIONAL]"
    mock_gemini.return_value = "Mocked response from AI"
    
    response = client.post("/api/v1/chat", json={"prompt": "How do I vote?"})
    
    assert response.status_code == 200
    assert response.json()["response"] == "Mocked response from AI"
    assert response.json()["intent"] == "[EDUCATIONAL]"

@patch("services.GeminiClient.get_response")
def test_chat_endpoint_error(mock_gemini):
    # Simulate a configuration error
    from utils.exceptions import ConfigurationError
    mock_gemini.side_effect = ConfigurationError("Gemini")
    
    response = client.post("/api/v1/chat", json={"prompt": "How do I vote?"})
    
    assert response.status_code == 503
    assert "error" in response.json()
    assert "Gemini API key not configured" in response.json()["error"]["message"]

@patch("services.CivicClient.get_voter_info")
def test_civic_info_success(mock_civic):
    mock_civic.return_value = {"status": "success", "data": "polling station info"}
    
    response = client.post("/api/v1/civic-info", json={"address": "123 Main St, Assam"})
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"

@patch("services.CivicClient.get_voter_info")
def test_civic_info_address_not_found(mock_civic):
    mock_civic.side_effect = ServiceError("Address not found", status_code=400)
    
    response = client.post("/api/v1/civic-info", json={"address": "Invalid Address"})
    
    assert response.status_code == 400
    assert response.json()["error"]["message"] == "Address not found"

def test_wiki_summary_endpoint():
    # Wiki client is static and usually hits real API, but we can test structure
    response = client.post("/api/v1/wiki-summary", json={"query": "Election"})
    assert response.status_code == 200
    assert "summary" in response.json()

def test_invalid_endpoint():
    response = client.get("/api/v1/non-existent")
    assert response.status_code == 404
