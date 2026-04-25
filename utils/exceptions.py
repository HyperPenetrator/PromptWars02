from typing import Optional, Dict

class ServiceError(Exception):
    """Base exception for service layer errors."""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Dict] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details

class ConfigurationError(ServiceError):
    """Raised when an API key or setting is missing."""
    def __init__(self, service_name: str):
        super().__init__(f"{service_name} API key not configured", status_code=503)

class ExternalAPIError(ServiceError):
    """Raised when an external service returns an error."""
    pass
