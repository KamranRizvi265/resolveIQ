import os
from typing import Any

from langchain_openai import ChatOpenAI

from .config import (
    get_llm_model_name,
    get_snowflake_cortex_base_url,
    get_snowflake_pat,
)
from .vectorstore import FaissVectorStore

KNOWLEDGE_PROMPT = """You are an ITIL-aligned L2 support assistant for a finance enterprise.
Answer ONLY from the provided context. If the context is insufficient, say so and recommend escalation.

Query: {query}

Context (cite sources as [Source N]):
{context}

Provide a structured response:
1. **Summary** — one sentence on the likely issue
2. **Recommended Actions** — numbered steps from the documentation
3. **Sources Used** — list source numbers referenced
4. **Confidence** — High / Medium / Low based on context quality

Do not invent error codes, systems, or procedures not present in the context."""

DIAGNOSTIC_PROMPT = """You are an ITIL incident diagnostic assistant for finance operations support.
Analyze the query against historical tickets and runbooks in the context below.

Query: {query}

Context (cite sources as [Source N]):
{context}

Provide a structured diagnostic:
1. **Probable Root Cause** — ranked hypothesis with evidence from context
2. **Similar Patterns** — recurring themes or error signatures found
3. **Suggested Resolution** — steps grounded in the retrieved records
4. **Escalation** — when to involve L2/L3 or Problem Management
5. **Confidence** — High / Medium / Low

Use only information present in the context. Flag gaps explicitly."""


class RAGSearch:
    def __init__(
        self,
        persist_dir: str = "faiss_store",
        embedding_model: str = "all-MiniLM-L6-v2",
        llm_model: str | None = None,
        data_dir: str | None = None,
    ):
        self.vectorstore = FaissVectorStore(persist_dir, embedding_model)
        faiss_path = os.path.join(persist_dir, "faiss.index")
        meta_path = os.path.join(persist_dir, "metadata.pkl")
        if not (os.path.exists(faiss_path) and os.path.exists(meta_path)):
            from .data_loader import load_documents

            resolved_data_dir = data_dir or os.path.join(
                os.path.dirname(os.path.abspath(persist_dir)), "data"
            )
            docs = load_documents(resolved_data_dir)
            self.vectorstore.build_from_documents(docs)
        else:
            self.vectorstore.load()

        snowflake_pat = get_snowflake_pat()
        cortex_base_url = get_snowflake_cortex_base_url()
        model = llm_model or get_llm_model_name()
        if not snowflake_pat:
            raise RuntimeError("SNOWFLAKE_PAT is not configured")
        if not cortex_base_url:
            raise RuntimeError(
                "Configure SNOWFLAKE_ACCOUNT_IDENTIFIER or "
                "SNOWFLAKE_CORTEX_BASE_URL"
            )
        self.llm = ChatOpenAI(
            api_key=snowflake_pat,
            base_url=cortex_base_url,
            model=model,
        )
        print(f"[INFO] Snowflake Cortex LLM initialized: {model}")

    @staticmethod
    def _distance_to_relevance(distance: float) -> float:
        return max(0.0, min(100.0, 100.0 - float(distance) * 10))

    def _retrieve_sources(self, query: str, top_k: int) -> list[dict[str, Any]]:
        results = self.vectorstore.query(query, top_k=top_k)
        sources: list[dict[str, Any]] = []
        for i, result in enumerate(results, start=1):
            meta = result.get("metadata") or {}
            text = meta.get("text", "").strip()
            if not text:
                continue
            distance = float(result.get("distance", 0.0))
            sources.append(
                {
                    "id": i,
                    "text": text,
                    "distance": distance,
                    "relevance_pct": round(self._distance_to_relevance(distance), 1),
                }
            )
        return sources

    def _build_context(self, sources: list[dict[str, Any]]) -> str:
        blocks = []
        for source in sources:
            blocks.append(f"[Source {source['id']}]\n{source['text']}")
        return "\n\n---\n\n".join(blocks)

    def _generate_answer(self, query: str, context: str, mode: str) -> str:
        template = DIAGNOSTIC_PROMPT if mode == "diagnostic" else KNOWLEDGE_PROMPT
        prompt = template.format(query=query, context=context)
        response = self.llm.invoke([prompt])
        return response.content if hasattr(response, "content") else str(response)

    def search_with_sources(
        self,
        query: str,
        top_k: int = 5,
        mode: str = "knowledge",
    ) -> dict[str, Any]:
        sources = self._retrieve_sources(query, top_k)
        if not sources:
            return {
                "query": query,
                "mode": mode,
                "answer": (
                    "No relevant documents found in the knowledge base. "
                    "Try rephrasing your query or escalate to L2 support."
                ),
                "sources": [],
                "source_count": 0,
            }

        context = self._build_context(sources)
        answer = self._generate_answer(query, context, mode)
        return {
            "query": query,
            "mode": mode,
            "answer": answer,
            "sources": sources,
            "source_count": len(sources),
        }

    def search_and_summarize(self, query: str, top_k: int = 5) -> str:
        return self.search_with_sources(query, top_k=top_k)["answer"]

