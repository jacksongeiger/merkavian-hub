// Shared helper for proxying a JSON GET to a localhost service on the ARM box,
// with a hard timeout. Caller never gets a thrown exception — failure is encoded
// in the returned object so the API route can always respond cleanly.

export type ProxyResult =
  | { ok: true; data: unknown; fetchedAt: string }
  | { ok: false; reason: "timeout" | "unreachable" | "non-2xx" | "non-json"; status?: number; fetchedAt: string };

export async function proxyService(url: string, timeoutMs: number): Promise<ProxyResult> {
  const fetchedAt = new Date().toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    if (!res.ok) return { ok: false, reason: "non-2xx", status: res.status, fetchedAt };
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) return { ok: false, reason: "non-json", fetchedAt };
    const data = await res.json();
    return { ok: true, data, fetchedAt };
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return { ok: false, reason: isAbort ? "timeout" : "unreachable", fetchedAt };
  } finally {
    clearTimeout(timer);
  }
}
