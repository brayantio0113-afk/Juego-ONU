// POST /api/score  -> guarda la mejor puntuación de cada apodo
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'json' }, 400); }

  const name = String(body.name ?? '').replace(/\s+/g, ' ').trim();
  const { score, correct, total } = body;
  const timeMs = body.time_ms == null ? null : body.time_ms;
  const ints = [score, correct, total].every(Number.isInteger);

  if (
    name.length < 3 || name.length > 16 || !ints ||
    total < 1 || total > 50 ||
    correct < 0 || correct > total ||
    score < 0 || score > correct * 150 ||
    (timeMs !== null && (!Number.isInteger(timeMs) || timeMs < 0 || timeMs > 3600000))
  ) {
    return json({ error: 'invalid' }, 400);
  }

  const BIG = 999999999;
  await env.DB.prepare(
    `INSERT INTO scores (name_key, name, score, correct, total, created_at, time_ms)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
     ON CONFLICT(name_key) DO UPDATE SET
       name = excluded.name, score = excluded.score, correct = excluded.correct,
       total = excluded.total, created_at = excluded.created_at, time_ms = excluded.time_ms
     WHERE excluded.score > scores.score
        OR (excluded.score = scores.score AND COALESCE(excluded.time_ms, ${BIG}) < COALESCE(scores.time_ms, ${BIG}))`
  ).bind(name.toLowerCase(), name, score, correct, total, Date.now(), timeMs).run();

  // Posición según su mejor resultado: más puntos, luego menos tiempo, luego quien llegó antes
  const key = name.toLowerCase();
  const me = await env.DB.prepare('SELECT score, time_ms, created_at FROM scores WHERE name_key = ?1').bind(key).first();
  if (!me) return json({ ok: true });
  const myTime = me.time_ms == null ? BIG : me.time_ms;
  const pos = await env.DB.prepare(
    `SELECT COUNT(*) + 1 AS rank FROM scores
     WHERE score > ?1
        OR (score = ?1 AND COALESCE(time_ms, ${BIG}) < ?2)
        OR (score = ?1 AND COALESCE(time_ms, ${BIG}) = ?2 AND created_at < ?3)`
  ).bind(me.score, myTime, me.created_at).first();
  const all = await env.DB.prepare('SELECT COUNT(*) AS n FROM scores').first();
  return json({ ok: true, rank: pos.rank, best: me.score, best_time: me.time_ms, players: all.n });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
