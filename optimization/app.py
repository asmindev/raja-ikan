from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path
from utils.logger import logger


# Setup logger from utils


from service.routes import router
from service.utils import startup_event, shutdown_event


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Route Optimization API...")
    startup_event()
    logger.info("API ready to accept requests")
    yield
    # Shutdown
    logger.info("Shutting down API...")
    shutdown_event()
    logger.info("API shutdown complete")


app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)


@app.get("/")
def read_root():
    return {"message": "Route Optimization API", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting server on http://0.0.0.0:5000")
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
