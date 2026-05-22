export async function GET() {
  return new Response(JSON.stringify({ status: "stub" }), {
    headers: { "content-type": "application/json" },
  });
}
