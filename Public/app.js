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

// Puntuación: 100 puntos por acierto + hasta 50 de bonus por rapidez (se agota en 15 s)
const POINTS_CORRECT = 100;
const SPEED_BONUS_MAX = 50;
const SPEED_WINDOW_MS = 15000;

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

function renderRankingRows(list, rows) {
  list.innerHTML = '';
  const me = playerName.toLowerCase();
  rows.forEach((row, i) => {
    const li = document.createElement('li');
    li.className = 'ranking-row' + (row.name.toLowerCase() === me ? ' is-me' : '');
    const pos = document.createElement('span');
    pos.className = 'rank-pos';
    pos.textContent = ['🥇', '🥈', '🥉'][i] || String(i + 1);
    const name = document.createElement('span');
    name.className = 'rank-name';
    name.textContent = row.name;
    const pts = document.createElement('span');
    pts.className = 'rank-score';
    pts.textContent = `${row.score} pts`;
    li.append(pos, name, pts);
    list.appendChild(li);
  });
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
    renderRankingRows(list, rows);
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
    await Ranking.submitScore({
      name: playerName,
      score: quizPoints,
      correct: quizCorrect,
      total: quizQuestions.length
    });
  } catch (error) {
    console.error(error);
    status.textContent = 'No se pudo guardar tu puntuación. Mostrando el ranking actual…';
  }
  loadRanking('result', true);
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
