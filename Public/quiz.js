// =====================================================
// LÓGICA DEL QUIZ (requiere data.js)
// =====================================================

const $ = id => document.getElementById(id);

// Registro propio de visitas y eventos (Cloudflare D1) + Google Analytics si está disponible
function visitorId() {
  try {
    let id = localStorage.getItem('quizVid');
    if (!id) {
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now();
      localStorage.setItem('quizVid', id);
    }
    return id;
  } catch (e) { return 'anon'; }
}

function track(name, params) {
  try {
    const p = new URLSearchParams(location.search);
    const body = JSON.stringify({
      type: name,
      visitor: visitorId(),
      utm_source: p.get('utm_source'),
      utm_medium: p.get('utm_medium'),
      utm_campaign: p.get('utm_campaign'),
      utm_content: p.get('utm_content'),
      referrer: document.referrer,
      extra: params || {}
    });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }));
    else fetch('/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
  } catch (e) {}
  try { if (window.gtag) gtag('event', name, params || {}); } catch (e) {}
}

// Cuántas preguntas se juegan por partida (se eligen al azar entre todas las disponibles)
const QUESTIONS_PER_GAME = 10;

let quizQuestions = [];
let quizIndex = 0;
let quizCorrect = 0;
let quizAnswered = false;
let quizMistakes = [];
let quizPoints = 0;
let questionStartedAt = 0;
let playerName = '';
let quizTimeMs = 0;     // tiempo total de respuesta (sin contar la lectura de explicaciones)
let timerHandle = null;
let myRank = null;      // posición del jugador (solo la ve él mismo)
let myBest = null;
let myBestTime = null;      // su mejor puntuación guardada
let myPlayers = null;   // total de jugadores en el ranking
let shareFile = null;   // imagen para compartir ya generada

// Enlace que se comparte: lleva UTM para medir cuánta gente entra desde un compartido
const SHARE_URL = 'https://onu-quiz.pages.dev/?utm_source=compartido&utm_medium=resultado&utm_campaign=lanzamiento';

// Puntuación: 100 puntos por acierto + hasta 50 de bonus por rapidez (se agota en 15 s)
const POINTS_CORRECT = 100;
const SPEED_BONUS_MAX = 50;
const SPEED_WINDOW_MS = 15000;

function formatTime(ms) {
  const total = Math.max(0, Math.round(ms / 100) / 10);
  const m = Math.floor(total / 60);
  const s = (total - m * 60).toFixed(1).padStart(4, '0');
  return `${m}:${s}`;
}

function currentElapsed() {
  return quizTimeMs + (quizAnswered ? 0 : Date.now() - questionStartedAt);
}

function updateTimer() {
  $('quizTimerText').textContent = '⏱ ' + formatTime(currentElapsed());
}

function stopTimer() {
  if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
}

function startTimer() {
  stopTimer();
  updateTimer();
  timerHandle = setInterval(updateTimer, 100);
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goHome() { showScreen('home'); }

function cleanNick(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function startFromHome() {
  const nick = cleanNick($('nickInput').value);
  const error = $('nickError');
  if (nick.length < 3 || nick.length > 16) {
    error.textContent = 'El apodo debe tener entre 3 y 16 caracteres.';
    error.hidden = false;
    return;
  }
  error.hidden = true;
  playerName = nick;
  try { localStorage.setItem('quizNick', nick); } catch (e) {}
  startQuiz();
}

function startQuiz() {
  quizTimeMs = 0;
  myRank = null; myBest = null; myBestTime = null; myPlayers = null; shareFile = null;
  $('shareStatus').textContent = '';
  quizQuestions = shuffle(questions).slice(0, QUESTIONS_PER_GAME);
  quizIndex = 0;
  quizCorrect = 0;
  quizAnswered = false;
  quizMistakes = [];
  quizPoints = 0;
  track('quiz_start');
  renderQuestion();
  showScreen('quiz');
}

function renderQuestion() {
  const q = quizQuestions[quizIndex];
  quizAnswered = false;
  questionStartedAt = Date.now();
  startTimer();
  $('quizProgressText').textContent = `Pregunta ${quizIndex + 1} de ${quizQuestions.length}`;
  $('quizScoreText').textContent = `Puntos: ${quizPoints}`;
  $('quizProgressBar').style.width = `${(quizIndex / quizQuestions.length) * 100}%`;
  // El contexto viene como "País · fecha · documento": el país va grande y el resto debajo
  const [country, ...details] = q.context.split(' · ');
  $('quizCountry').textContent = country;
  $('quizMeta').textContent = details.join(' · ');
  $('quizQuestion').textContent = q.question;
  $('quizChoices').querySelectorAll('button').forEach(button => {
    button.disabled = false;
    button.classList.remove('is-correct', 'is-wrong');
  });
  $('quizFeedback').hidden = true;
  $('quizNext').textContent = quizIndex === quizQuestions.length - 1 ? 'Ver resultado final →' : 'Siguiente pregunta →';
}

function answerQuiz(choice) {
  if (quizAnswered) return;
  quizAnswered = true;
  quizTimeMs += Date.now() - questionStartedAt;
  stopTimer();
  updateTimer();

  const q = quizQuestions[quizIndex];
  const isCorrect = choice === q.answer;
  let gained = 0;
  if (isCorrect) {
    quizCorrect++;
    const elapsed = Date.now() - questionStartedAt;
    const bonus = Math.round(SPEED_BONUS_MAX * Math.max(0, 1 - elapsed / SPEED_WINDOW_MS));
    gained = POINTS_CORRECT + bonus;
    quizPoints += gained;
  } else {
    quizMistakes.push({
      question: q.question,
      correct: q.answer === 'approved' ? 'Aprobada' : 'Vetada',
      context: q.context
    });
  }

  $('quizChoices').querySelectorAll('button').forEach(button => {
    button.disabled = true;
    if (button.dataset.choice === q.answer) button.classList.add('is-correct');
    else if (button.dataset.choice === choice) button.classList.add('is-wrong');
  });

  const feedback = $('quizFeedback');
  feedback.hidden = false;
  feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  $('feedbackTitle').textContent = isCorrect ? `✓ ¡Respuesta correcta! +${gained} puntos` : '✕ No exactamente';
  $('feedbackExplanation').textContent = q.explanation;
  $('feedbackFact').textContent = `Dato extra: ${q.fact}`;
  const source = $('feedbackSource');
  source.href = q.source;
  source.textContent = `Fuente: ${q.sourceLabel} ↗`;
  $('quizScoreText').textContent = `Puntos: ${quizPoints}`;
  $('quizProgressBar').style.width = `${((quizIndex + 1) / quizQuestions.length) * 100}%`;

  $('quizNext').focus({ preventScroll: true });
}

function nextQuestion() {
  quizIndex++;
  if (quizIndex < quizQuestions.length) {
    renderQuestion();
  } else {
    renderQuizResult();
    showScreen('quizResult');
  }
}

function renderQuizResult() {
  track('quiz_complete', { score: quizPoints, correct: quizCorrect });
  submitAndShowRanking();
  const total = quizQuestions.length;
  const percent = Math.round((quizCorrect / total) * 100);
  let title, message, icon;
  if (quizCorrect === total) {
    title = 'Diplomático experto';
    message = '¡Pleno de aciertos! Conoces muy bien el funcionamiento del Consejo y varios momentos clave de su historia.';
    icon = '🏆';
  } else if (percent >= 60) {
    title = 'Observador atento';
    message = 'Buen trabajo. Reconoces la mayoría de las votaciones y sabes distinguir un veto de una abstención.';
    icon = '🥇';
  } else if (percent >= 30) {
    title = 'Analista en formación';
    message = 'Ya tienes una base. Repasa las explicaciones y fíjate especialmente en quién votó en contra y quién se abstuvo.';
    icon = '📘';
  } else {
    title = 'Primer paso en la diplomacia';
    message = 'Este tema tiene muchos detalles. Utiliza el repaso para aprender qué ocurrió en cada votación y vuelve a intentarlo.';
    icon = '🌱';
  }
  $('quizResultIcon').textContent = icon;
  $('quizResultTitle').textContent = title;
  $('quizResultMessage').textContent = message;
  $('quizFinalPoints').textContent = quizPoints;
  $('quizFinalTime').textContent = formatTime(quizTimeMs);
  $('quizFinalScore').textContent = `${quizCorrect}/${total}`;
  $('quizFinalPercent').textContent = `${percent}%`;

  const review = $('quizReview');
  review.innerHTML = '';
  if (quizMistakes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-review';
    empty.textContent = 'No fallaste ninguna pregunta. ¡Excelente trabajo!';
    review.appendChild(empty);
  } else {
    quizMistakes.forEach(item => {
      const row = document.createElement('div');
      row.className = 'review-item';
      const titleNode = document.createElement('strong');
      titleNode.textContent = item.context;
      const detailNode = document.createElement('span');
      detailNode.textContent = `Respuesta correcta: ${item.correct} · ${item.question}`;
      row.append(titleNode, detailNode);
      review.appendChild(row);
    });
  }
}

// =====================================================
// RANKING GLOBAL
// =====================================================
function rankingEls(where) {
  return where === 'home'
    ? { list: $('homeRankingList'), status: $('homeRankingStatus') }
    : { list: $('rankingList'), status: $('rankingStatus') };
}

function renderRankingRows(list, rows, showMine = false) {
  list.innerHTML = '';
  const me = playerName.toLowerCase();
  let inTop = false;
  rows.forEach((row, i) => {
    const isMe = row.name.toLowerCase() === me;
    if (isMe) inTop = true;
    const li = document.createElement('li');
    li.className = 'ranking-row' + (isMe ? ' is-me' : '');
    const pos = document.createElement('span');
    pos.className = 'rank-pos';
    pos.textContent = ['🥇', '🥈', '🥉'][i] || String(i + 1);
    const name = document.createElement('span');
    name.className = 'rank-name';
    name.textContent = row.name;
    const pts = document.createElement('span');
    pts.className = 'rank-score';
    pts.textContent = `${row.score} pts` + (row.time_ms != null ? ` · ${formatTime(row.time_ms)}` : '');
    li.append(pos, name, pts);
    list.appendChild(li);
  });

  // Si el jugador quedó fuera del top, se añade su posición al final (solo la ve él)
  if (showMine && !inTop && myRank && myRank > rows.length) {
    const gap = document.createElement('li');
    gap.className = 'rank-gap';
    gap.textContent = '⋮';
    list.appendChild(gap);

    const li = document.createElement('li');
    li.className = 'ranking-row is-me';
    const pos = document.createElement('span');
    pos.className = 'rank-pos';
    pos.textContent = String(myRank);
    const name = document.createElement('span');
    name.className = 'rank-name';
    name.textContent = `${playerName} (tu posición)`;
    const pts = document.createElement('span');
    pts.className = 'rank-score';
    pts.textContent = `${myBest ?? quizPoints} pts` + (myBestTime != null ? ` · ${formatTime(myBestTime)}` : '');
    li.append(pos, name, pts);
    list.appendChild(li);
  }
}

async function loadRanking(where, force = false) {
  const { list, status } = rankingEls(where);
  if (!Ranking.isEnabled()) {
    list.innerHTML = '';
    status.textContent = 'El ranking global no está disponible en este momento.';
    return;
  }
  status.textContent = 'Cargando ranking…';
  try {
    const rows = await Ranking.getTop(20, force);
    status.textContent = rows.length ? '' : 'Todavía no hay puntuaciones. ¡Sé el primero!';
    renderRankingRows(list, rows, where === 'result');
  } catch (error) {
    console.error(error);
    status.textContent = 'No se pudo cargar el ranking. Inténtalo de nuevo.';
  }
}

async function submitAndShowRanking() {
  const { list, status } = rankingEls('result');
  list.innerHTML = '';
  if (!Ranking.isEnabled()) { loadRanking('result'); return; }
  status.textContent = 'Guardando tu puntuación…';
  try {
    const res = await Ranking.submitScore({
      name: playerName,
      score: quizPoints,
      correct: quizCorrect,
      total: quizQuestions.length,
      timeMs: Math.min(Math.round(quizTimeMs), 3600000)
    });
    if (res && res.rank) { myRank = res.rank; myBest = res.best; myBestTime = res.best_time; myPlayers = res.players; }
  } catch (error) {
    console.error(error);
    status.textContent = 'No se pudo guardar tu puntuación. Mostrando el ranking actual…';
  }
  await loadRanking('result', true);
  buildShareFile();
}

function showHomeRanking() {
  showScreen('rankingScreen');
  loadRanking('home', true);
}

// Recupera el último apodo usado
try {
  const saved = localStorage.getItem('quizNick');
  if (saved && $('nickInput')) $('nickInput').value = saved;
} catch (e) {}

track('visit');

// =====================================================
// COMPARTIR RESULTADO (imagen + enlace con UTM)
// =====================================================
function drawShareCard() {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const font = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

  // Fondo
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b1220'); bg.addColorStop(1, '#16253d');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(231,189,101,.08)';
  g.beginPath(); g.arc(W - 120, H - 160, 380, 0, Math.PI * 2); g.fill();

  g.textAlign = 'center';
  g.fillStyle = '#e7bd65'; g.font = `800 34px ${font}`;
  g.fillText('QUIZ DEL CONSEJO DE SEGURIDAD', W / 2, 120);
  g.fillStyle = '#f3f6fb'; g.font = `850 84px ${font}`;
  g.fillText('¿PASARÍA ESTA', W / 2, 235);
  g.fillStyle = '#e7bd65';
  g.fillText('RESOLUCIÓN?', W / 2, 330);

  // Jugador y título
  g.fillStyle = '#aab8cb'; g.font = `600 36px ${font}`;
  g.fillText('Resultado de', W / 2, 460);
  g.fillStyle = '#f3f6fb'; g.font = `850 76px ${font}`;
  let nick = playerName;
  while (g.measureText(nick).width > W - 160 && nick.length > 3) nick = nick.slice(0, -1);
  g.fillText(nick, W / 2, 550);
  g.fillStyle = '#f2d48e'; g.font = `700 40px ${font}`;
  g.fillText($('quizResultTitle').textContent, W / 2, 620);

  // Cuatro cajas: puntos, aciertos, tiempo, posición
  const total = quizQuestions.length;
  const boxes = [
    ['PUNTOS', String(quizPoints)],
    ['ACIERTOS', `${quizCorrect}/${total}`],
    ['TIEMPO', formatTime(quizTimeMs)],
    ['POSICIÓN', myRank ? `#${myRank}` : '—']
  ];
  const bw = 440, bh = 190, gap = 30, x0 = (W - (bw * 2 + gap)) / 2, y0 = 680;
  boxes.forEach(([label, value], i) => {
    const x = x0 + (i % 2) * (bw + gap);
    const y = y0 + Math.floor(i / 2) * (bh + gap);
    const r = 28;
    g.fillStyle = 'rgba(255,255,255,.06)';
    g.strokeStyle = 'rgba(231,189,101,.45)'; g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + bw, y, x + bw, y + bh, r);
    g.arcTo(x + bw, y + bh, x, y + bh, r);
    g.arcTo(x, y + bh, x, y, r);
    g.arcTo(x, y, x + bw, y, r);
    g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#f3f6fb'; g.font = `850 84px ${font}`;
    g.fillText(value, x + bw / 2, y + 112);
    g.fillStyle = '#aab8cb'; g.font = `700 28px ${font}`;
    g.fillText(label, x + bw / 2, y + 160);
  });

  if (myRank && myPlayers) {
    g.fillStyle = '#aab8cb'; g.font = `600 34px ${font}`;
    g.fillText(`Entre ${myPlayers} jugadores del ranking global`, W / 2, 1150);
  }

  // Pie
  g.fillStyle = '#e7bd65'; g.font = `850 52px ${font}`;
  g.fillText('¿Puedes superarme?', W / 2, 1225);
  g.fillStyle = '#f3f6fb'; g.font = `700 44px ${font}`;
  g.fillText('onu-quiz.pages.dev', W / 2, 1295);
  return c;
}

async function buildShareFile() {
  try {
    const blob = await new Promise(resolve => drawShareCard().toBlob(resolve, 'image/png'));
    if (blob) shareFile = new File([blob], 'mi-resultado-onu.png', { type: 'image/png' });
  } catch (e) { console.error(e); }
  return shareFile;
}

async function shareResult() {
  const status = $('shareStatus');
  track('share_click', { score: quizPoints, correct: quizCorrect });
  status.textContent = 'Preparando imagen…';
  const file = shareFile || await buildShareFile();
  if (!file) { status.textContent = 'No se pudo crear la imagen.'; return; }

  const place = myRank ? ` y quedé en el puesto #${myRank}` : '';
  const text = `Hice ${quizPoints} puntos en ${formatTime(quizTimeMs)}${place} en el quiz del Consejo de Seguridad. ¿Puedes superarme? ${SHARE_URL}`;

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text, title: '¿Pasaría esta resolución?' });
      track('share_ok', { score: quizPoints, correct: quizCorrect });
      status.textContent = '¡Gracias por compartir!';
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') { status.textContent = ''; return; }
    }
  }

  // Alternativa: descargar la imagen y copiar el texto con el enlace
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  let copied = false;
  try { await navigator.clipboard.writeText(text); copied = true; } catch (e) {}
  track('share_ok', { score: quizPoints, correct: quizCorrect });
  status.textContent = copied
    ? 'Imagen descargada y texto con enlace copiado. ¡Pégalo donde quieras compartirlo!'
    : 'Imagen descargada. Comparte este enlace: ' + SHARE_URL;
}
