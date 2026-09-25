import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent


async def warm_search_service(app: FastAPI) -> None:
    try:
        from src.search import RAGSearch

        service = await asyncio.to_thread(
            RAGSearch,
            persist_dir=app.state.persist_dir,
        )
        app.state.search_service = service
        logger.info("Search service initialized successfully")
    except Exception:
        logger.exception("Search service initialization failed")
        app.state.search_service_error = True


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.persist_dir = str(BASE_DIR / "faiss_store")
    app.state.search_service = None
    app.state.search_service_lock = asyncio.Lock()
    app.state.search_service_error = False

    warmup_task = asyncio.create_task(warm_search_service(app))

    try:
        yield
    finally:
        if not warmup_task.done():
            warmup_task.cancel()
            await asyncio.gather(warmup_task, return_exceptions=True)


app = FastAPI(
    title="resolveIQ API",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://resolve-iq-eta.vercel.app",
        "https://resolve-iq-ten.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(router)
