import { DEMO_RESPONSES, generateGenericResolution } from "../data/sampleData";

const API_BASE_URL = "http://localhost:8000/api/v1";

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

  // Attempt live call to backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, top_k: Number(top_k), mode }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const duration = Math.round(performance.now() - startTime);
      return {
        ...data,
        latencyMs: duration,
        isSandbox: false,
      };
    }
  } catch (err) {
    console.warn("[ResolveIQ] Live API error or timeout, engaging Enterprise Sandbox fallback:", err);
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
