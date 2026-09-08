// lib/api.ts — centralized API client
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchJSON(path: string, opts?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    return res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function uploadDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/api/analyze`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`);
  return res.json();
}

export async function pollAnalysis(analysisId: string, maxWait = 120000): Promise<any> {
  // Poll up to 120 seconds — neural OCR pipeline takes 15-60s depending on image size
  const start = Date.now();
  let interval = 2000; // start at 2s
  while (Date.now() - start < maxWait) {
    try {
      const data = await fetchJSON(`/api/analysis/${analysisId}`);
      if (data.status === "complete" || data.status === "error") return data;
      // Backoff: after 30s, poll every 3s instead of 2s
      if (Date.now() - start > 30000) interval = 3000;
    } catch (e) {
      // Network hiccup — keep retrying
    }
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error("Analysis timed out after 2 minutes. Please try a smaller image or check backend.");
}

export async function runDemo(docName: string) {
  const res = await fetch(`${API}/api/demo/run/${docName}`, { method: "POST" });
  if (!res.ok) throw new Error(`Demo failed: ${await res.text()}`);
  return res.json();
}

export async function getDemoDocuments() {
  return fetchJSON("/api/demo/documents");
}

export async function getAnalytics() {
  return fetchJSON("/api/analytics");
}

export async function getRiskQueue() {
  return fetchJSON("/api/risk-queue");
}

export async function submitReview(analysisId: string, decision: string, notes = "") {
  const params = new URLSearchParams({ analysis_id: analysisId, decision, notes });
  const res = await fetch(`${API}/api/review?${params}`, { method: "POST" });
  if (!res.ok) throw new Error(`Review failed: ${await res.text()}`);
  return res.json();
}

export async function getDocuments(page = 1) {
  return fetchJSON(`/api/documents?page=${page}&per_page=20`);
}

export async function getHealth() {
  return fetchJSON("/api/health");
}

export async function compareAnalyses(idA: string, idB: string) {
  const params = new URLSearchParams({ analysis_id_a: idA, analysis_id_b: idB });
  return fetchJSON(`/api/compare?${params}`, { method: "POST" });
}
