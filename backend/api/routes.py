import asyncio
import logging
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


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
		logger.exception("Search service request failed: %s", exc)
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail=f"Search service error: {exc}",
		) from exc


class PIISanitizeRequest(BaseModel):
	text: str = Field(min_length=1, max_length=10000)


class PIISanitizeResponse(BaseModel):
	raw_text: str
	sanitized_text: str
	has_pii: bool
	entity_count: int
	entities: list[dict[str, Any]]


@router.post("/pii/sanitize", response_model=PIISanitizeResponse)
async def pii_sanitize(payload: PIISanitizeRequest) -> PIISanitizeResponse:
	try:
		from src.pii import analyze_pii

		result = analyze_pii(payload.text)
		return PIISanitizeResponse.model_validate(result)
	except Exception as exc:
		logger.exception("PII sanitization request failed: %s", exc)
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"PII sanitization error: {exc}",
		) from exc

