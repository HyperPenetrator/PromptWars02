import os
import logging
from typing import Optional
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
load_dotenv()

# Optional: only use Secret Manager if the SDK is installed
try:
    from google.cloud import secretmanager
    _has_secret_manager = True
except ImportError:
    _has_secret_manager = False
    logger.debug("google-cloud-secret-manager not installed. Using env vars only.")


class AppConfig:
    """
    Configuration management.
    Prioritizes Google Secret Manager (if available), then environment variables.
    """
    PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT_ID")

    @classmethod
    def get_secret(cls, secret_id: str, default: Optional[str] = None) -> Optional[str]:
        """
        Retrieves a secret from Google Secret Manager or environment variable.
        """
        # Try environment variable first for local dev
        env_val = os.getenv(secret_id)

        if cls.PROJECT_ID and _has_secret_manager:
            try:
                client = secretmanager.SecretManagerServiceClient()
                name = f"projects/{cls.PROJECT_ID}/secrets/{secret_id}/versions/latest"
                response = client.access_secret_version(request={"name": name})
                return response.payload.data.decode("UTF-8")
            except Exception as e:
                logger.debug(f"Secret Manager lookup failed for {secret_id}: {e}")

        return env_val or default

    @classmethod
    def get_env(cls, key: str, default: Optional[str] = None) -> Optional[str]:
        """Simple environment variable getter."""
        return os.getenv(key, default)
