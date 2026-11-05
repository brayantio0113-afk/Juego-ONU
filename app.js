// =====================================================
// LÓGICA DEL QUIZ (requiere data.js)
// =====================================================

const $ = id => document.getElementById(id);

let quizQuestions = [];
let quizIndex = 0;
let quizCorrect = 0;
let quizAnswered = false;
let quizMistakes = [];

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

function startQuiz() {
  quizQuestions = shuffle(questions);
  quizIndex = 0;
  quizCorrect = 0;
  quizAnswered = false;
  quizMistakes = [];
  renderQuestion();
  showScreen('quiz');
}

function renderQuestion() {
  const q = quizQuestions[quizIndex];
  quizAnswered = false;
  $('quizProgressText').textContent = `Pregunta ${quizIndex + 1} de ${quizQuestions.length}`;
  $('quizScoreText').textContent = `Aciertos: ${quizCorrect}`;
  $('quizProgressBar').style.width = `${(quizIndex / quizQuestions.length) * 100}%`;
  $('quizContext').textContent = q.context;
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
  if (isCorrect) {
    quizCorrect++;
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
  $('feedbackTitle').textContent = isCorrect ? '✓ ¡Respuesta correcta!' : '✕ No exactamente';
  $('feedbackExplanation').textContent = q.explanation;
  $('feedbackFact').textContent = `Dato extra: ${q.fact}`;
  const source = $('feedbackSource');
  source.href = q.source;
  source.textContent = `Fuente: ${q.sourceLabel} ↗`;
  $('quizScoreText').textContent = `Aciertos: ${quizCorrect}`;
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
  const total = quizQuestions.length;
  const percent = Math.round((quizCorrect / total) * 100);
  let title, message, icon;
  if (quizCorrect === total) {
    title = 'Diplomático experto';
    message = '¡Pleno de aciertos! Conoces muy bien el funcionamiento del Consejo y varios momentos clave de su historia.';
    icon = '🏆';
  } else if (quizCorrect >= 5) {
    title = 'Observador atento';
    message = 'Buen trabajo. Reconoces la mayoría de las votaciones y sabes distinguir un veto de una abstención.';
    icon = '🥇';
  } else if (quizCorrect >= 3) {
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
