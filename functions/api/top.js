// GET /api/top?limit=20 -> ranking global
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit')) || 20, 1), 50);
  const { results } = await env.DB.prepare(
    'SELECT name, score, correct, total FROM scores ORDER BY score DESC, created_at ASC LIMIT ?1'
  ).bind(limit).all();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
