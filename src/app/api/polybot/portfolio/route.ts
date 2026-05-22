import { proxyService } from "@/lib/proxyService";

export const dynamic = "force-dynamic";

const URL =
  process.env.POLYBOT_PORTFOLIO_URL ?? "http://127.0.0.1:5001/api/portfolio";
const TIMEOUT = Number(process.env.SERVICE_FETCH_TIMEOUT_MS ?? 5000);

export async function GET() {
  const result = await proxyService(URL, TIMEOUT);
  const status = result.ok ? 200 : 503;
  return new Response(JSON.stringify(result), {
    status,
    headers: { "content-type": "application/json" },
  });
}
