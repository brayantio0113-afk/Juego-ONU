// POST /api/event -> registra visitas y eventos de la campaña (sin IP ni datos personales)
const ALLOWED = ['visit', 'quiz_start', 'quiz_complete', 'share_click', 'share_ok'];

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return new Response(null, { status: 400 }); }
  if (!ALLOWED.includes(b.type)) return new Response(null, { status: 400 });

  const s = (v, n = 100) => (v == null || v === '' ? null : String(v).slice(0, n));
  const i = v => (Number.isInteger(v) && v >= 0 && v <= 100000 ? v : null);
  const extra = b.extra && typeof b.extra === 'object' ? b.extra : {};

  await env.DB.prepare(
    `INSERT INTO events (ts, type, visitor, utm_source, utm_medium, utm_campaign, utm_content, referrer, country, score, correct)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
  ).bind(
    Date.now(), b.type, s(b.visitor, 64),
    s(b.utm_source), s(b.utm_medium), s(b.utm_campaign), s(b.utm_content),
    s(b.referrer, 200), request.cf?.country || null,
    i(extra.score), i(extra.correct)
  ).run();

  return new Response(null, { status: 204 });
}
