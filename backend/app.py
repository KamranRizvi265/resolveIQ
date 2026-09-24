import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router


BASE_DIR = Path(__file__).resolve().parent


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.persist_dir = str(BASE_DIR / "faiss_store")
    app.state.search_service = None
    app.state.search_service_lock = asyncio.Lock()
    yield


app = FastAPI(
    title="resolveIQ API",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "https://resolve-iq-eta.vercel.app/"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(router)

