from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from dotenv import load_dotenv

from utils.exceptions import ServiceError
from backend.api.v1.router import api_router
from services import gemini, civic, wiki, router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Election Assistant API",
    description="Backend service for the Assam Election Process Education Assistant",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

from fastapi.middleware.gzip import GZipMiddleware

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip compression for static files and responses
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Global Exception Handler for Service Layer Errors
@app.exception_handler(ServiceError)
async def service_error_handler(request: Request, exc: ServiceError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.message,
                "status_code": exc.status_code,
                "details": exc.details
            }
        }
    )

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"Method: {request.method} Path: {request.url.path} Duration: {duration:.2f}s Status: {response.status_code}")
    return response



# Include versioned router
app.include_router(api_router, prefix="/api/v1")

# Mount static files
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.isdir(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        # Serve icons.svg or other files from root of dist if they exist
        file_path = os.path.join(frontend_dist, catchall)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
