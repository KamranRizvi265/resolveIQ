# resolveIQ

## Backend

Run the API from the backend directory:

```powershell
uv run uvicorn app:app --reload
```

The API is available at `http://localhost:8000`.

### Frontend API

`GET /api/v1/health` returns backend readiness without loading the search model.

`POST /api/v1/search` accepts:

```json
{
	"query": "Payment gateway handshake timeout",
	"top_k": 5,
	"mode": "knowledge"
}
```

`mode` can be `knowledge` or `diagnostic`. The response contains `answer`, `sources`, and `source_count`. The search service is initialized on the first search request and blocking model work is moved off the async event loop.
