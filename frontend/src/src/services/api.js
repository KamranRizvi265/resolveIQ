import { DEMO_RESPONSES, generateGenericResolution } from "../data/sampleData";
import { analyzePII } from "../utils/piiHasher";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) return { online: false, searchService: "unavailable" };
    const data = await response.json();
    return {
      online: true,
      searchService: data.search_service || "ready",
      status: data.status,
    };
  } catch {
    return { online: false, searchService: "offline" };
  }
}

export async function performSearch({ query, top_k = 5, mode = "diagnostic", incidentId = null, forceSandbox = false }) {
  const startTime = performance.now();

  // If forced sandbox or known demo incident without backend
  if (forceSandbox) {
    await new Promise((r) => setTimeout(r, 650));
    const duration = Math.round(performance.now() - startTime);
    if (incidentId && DEMO_RESPONSES[incidentId] && DEMO_RESPONSES[incidentId][mode]) {
      return {
        ...DEMO_RESPONSES[incidentId][mode],
        latencyMs: duration,
        isSandbox: true,
      };
    }
    return {
      ...generateGenericResolution(query, mode, top_k),
      latencyMs: duration,
      isSandbox: true,
    };
  }

  // Attempt live call to backend, retrying transient startup failures.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: Number(top_k), mode }),
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          latencyMs: Math.round(performance.now() - startTime),
          isSandbox: false,
        };
      }

      if (response.status !== 503) break;
    } catch (err) {
      console.warn("[ResolveIQ] Search attempt failed:", err);
    } finally {
      clearTimeout(timeoutId);
    }

    await wait(1500);
  }

  // Fallback to enterprise simulation
  await new Promise((r) => setTimeout(r, 700));
  const duration = Math.round(performance.now() - startTime);

  if (incidentId && DEMO_RESPONSES[incidentId] && DEMO_RESPONSES[incidentId][mode]) {
    return {
      ...DEMO_RESPONSES[incidentId][mode],
      latencyMs: duration,
      isSandbox: true,
    };
  }

  return {
    ...generateGenericResolution(query, mode, top_k),
    latencyMs: duration,
    isSandbox: true,
  };
}

export async function fetchPIISanitize(text) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${API_BASE_URL}/pii/sanitize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.debug("[ResolveIQ] Live PII endpoint unavailable, using browser HMAC-SHA256 engine:", err);
  }

  // Fallback to local cryptographic engine
  return analyzePII(text);
}


