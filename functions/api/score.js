// POST /api/score  -> guarda la mejor puntuación de cada apodo
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'json' }, 400); }

  const name = String(body.name ?? '').replace(/\s+/g, ' ').trim();
  const { score, correct, total } = body;
  const ints = [score, correct, total].every(Number.isInteger);

  if (
    name.length < 3 || name.length > 16 || !ints ||
    total < 1 || total > 50 ||
    correct < 0 || correct > total ||
    score < 0 || score > correct * 150
  ) {
    return json({ error: 'invalid' }, 400);
  }

  await env.DB.prepare(
    `INSERT INTO scores (name_key, name, score, correct, total, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(name_key) DO UPDATE SET
       name = excluded.name, score = excluded.score, correct = excluded.correct,
       total = excluded.total, created_at = excluded.created_at
     WHERE excluded.score > scores.score`
  ).bind(name.toLowerCase(), name, score, correct, total, Date.now()).run();

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
