// =====================================================
// RANKING GLOBAL (Firebase Firestore, SDK "compat" por CDN)
// Expone el objeto global `Ranking`. Si Firebase no está configurado
// o no carga, el juego sigue funcionando sin ranking.
// =====================================================
const Ranking = (() => {
  const COLLECTION = 'scores';
  const FETCH_LIMIT = 50;       // documentos que se leen (luego se deduplica por usuario)
  const CACHE_MS = 30 * 1000;   // evita lecturas repetidas si se abre el ranking varias veces
  const TIMEOUT_MS = 10 * 1000;

  let db = null;
  let cache = { at: 0, rows: [] };

  const cfg = window.FIREBASE_CONFIG;
  const configured =
    typeof firebase !== 'undefined' &&
    cfg && cfg.apiKey && !/^PEGA/i.test(cfg.apiKey) &&
    cfg.projectId && !/^TU_/i.test(cfg.projectId);

  if (configured) {
    try {
      firebase.initializeApp(cfg);
      db = firebase.firestore();
    } catch (error) {
      console.error('No se pudo iniciar Firebase:', error);
      db = null;
    }
  }

  const withTimeout = promise =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS))
    ]);

  function isEnabled() { return db !== null; }

  async function submitScore({ name, score, correct, total }) {
    if (!db) throw new Error('ranking-disabled');
    await withTimeout(
      db.collection(COLLECTION).add({
        name,
        score,
        correct,
        total,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
    );
    cache.at = 0; // la próxima consulta debe traer datos frescos
  }

  // Devuelve el mejor resultado de cada usuario, ordenado de mayor a menor puntuación.
  async function getTop(limit = 20, force = false) {
    if (!db) throw new Error('ranking-disabled');
    if (!force && Date.now() - cache.at < CACHE_MS) return cache.rows.slice(0, limit);

    const snapshot = await withTimeout(
      db.collection(COLLECTION).orderBy('score', 'desc').limit(FETCH_LIMIT).get()
    );

    const seen = new Set();
    const rows = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const key = String(data.name || '').toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      rows.push({
        name: String(data.name),
        score: Number(data.score) || 0,
        correct: Number(data.correct) || 0,
        total: Number(data.total) || 0
      });
    });

    cache = { at: Date.now(), rows };
    return rows.slice(0, limit);
  }

  return { isEnabled, submitScore, getTop };
})();
