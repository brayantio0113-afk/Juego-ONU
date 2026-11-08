// =====================================================
// RANKING GLOBAL (Cloudflare Pages Functions + D1)
// Mantiene la misma interfaz: isEnabled, submitScore, getTop
// =====================================================
const Ranking = (() => {
  const TIMEOUT_MS = 10 * 1000;
  const CACHE_MS = 15 * 1000;
  let cache = { at: 0, rows: [] };

  async function request(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      if (!res.ok) throw new Error('http-' + res.status);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function isEnabled() { return true; }

  async function submitScore({ name, score, correct, total }) {
    await request('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score, correct, total })
    });
    cache.at = 0;
  }

  async function getTop(limit = 20, force = false) {
    if (!force && Date.now() - cache.at < CACHE_MS) return cache.rows.slice(0, limit);
    const rows = await request('/api/top?limit=' + limit);
    cache = { at: Date.now(), rows };
    return rows.slice(0, limit);
  }

  return { isEnabled, submitScore, getTop };
})();
