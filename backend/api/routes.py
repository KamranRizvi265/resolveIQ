import asyncio
from typing import Literal

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
	query: str = Field(min_length=1, max_length=2000)
	top_k: int = Field(default=5, ge=1, le=10)
	mode: Literal["knowledge", "diagnostic"] = "knowledge"


class SearchSource(BaseModel):
	id: int
	text: str
	distance: float
	relevance_pct: float


class SearchResponse(BaseModel):
	query: str
	mode: str
	answer: str
	sources: list[SearchSource]
	source_count: int


class HealthResponse(BaseModel):
	status: Literal["ok"]
	search_service: Literal["ready", "not_initialized"]


router = APIRouter(prefix="/api/v1", tags=["resolveIQ"])


async def _get_search_service(request: Request):
	service = getattr(request.app.state, "search_service", None)
	if service is not None:
		return service

	async with request.app.state.search_service_lock:
		service = getattr(request.app.state, "search_service", None)
		if service is None:
			from src.search import RAGSearch

			service = await asyncio.to_thread(
				RAGSearch,
				persist_dir=request.app.state.persist_dir,
			)
			request.app.state.search_service = service
	return service


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
	service_status = (
		"ready" if getattr(request.app.state, "search_service", None) else "not_initialized"
	)
	return HealthResponse(status="ok", search_service=service_status)


@router.post("/search", response_model=SearchResponse)
async def search(payload: SearchRequest, request: Request) -> SearchResponse:
	try:
		service = await _get_search_service(request)
		result = await asyncio.to_thread(
			service.search_with_sources,
			payload.query,
			payload.top_k,
			payload.mode,
		)
		return SearchResponse.model_validate(result)
	except Exception as exc:
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail="Search service is unavailable. Check the backend configuration and try again.",
		) from exc
