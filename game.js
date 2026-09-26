const questionEl = document.getElementById('question');
const choiceContainers = Array.from(document.querySelectorAll('.choice-container'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loaderText');
const loaderSubtext = document.getElementById('loaderSubtext');
const loaderProgressBar = document.getElementById('loaderProgressBar');
const loaderSteps = Array.from(document.querySelectorAll('.loader-step'));
const errorScreen = document.getElementById('errorScreen');
const errorMessage = document.getElementById('errorMessage');
const game = document.getElementById('game');
const topicBadge = document.getElementById('topicBadge');

const { TOTAL_QUESTIONS, CORRECT_BONUS, QUESTION_DELAY_MS } = QUIZ_SETTINGS;

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let correctCount = 0;
let questionCounter = 0;
let availableQuestions = [];
let questions = [];
let selectedTopic = null;
let answerLog = [];

function showError(message) {
  loader.classList.add('hidden');
  errorMessage.textContent = message;
  errorScreen.classList.remove('hidden');
}

function setLoaderProgress(step) {
  const pct = (step / 3) * 100;
  loaderProgressBar.style.width = `${pct}%`;
  loaderSteps.forEach((el) => {
    const s = parseInt(el.dataset.step, 10);
    el.classList.toggle('active', s === step);
    el.classList.toggle('done', s < step);
  });
}

function animateQuestionIn() {
  questionEl.style.animation = 'none';
  choiceContainers.forEach((c) => {
    c.style.animation = 'none';
  });
  requestAnimationFrame(() => {
    questionEl.style.animation = '';
    choiceContainers.forEach((c) => {
      c.style.animation = '';
    });
  });
}

async function loadQuestions() {
  const stored = sessionStorage.getItem('selectedTopic');
  if (!stored) {
    window.location.assign('./');
    return;
  }

  selectedTopic = JSON.parse(stored);
  topicBadge.textContent = `${selectedTopic.icon} ${selectedTopic.name}`;
  loaderSubtext.textContent = `${selectedTopic.name} · ${TOTAL_QUESTIONS} questions`;

  const cached = getCachedQuestions(selectedTopic);
  if (cached?.length >= TOTAL_QUESTIONS) {
    setLoaderProgress(3);
    loaderText.textContent = 'Ready!';
    questions = cached;
    await new Promise((r) => setTimeout(r, 300));
    startGame();
    return;
  }

  setLoaderProgress(1);
  loaderText.textContent = 'Generating questions...';

  try {
    questions = await loadQuizQuestions(selectedTopic, TOTAL_QUESTIONS, (step) => {
      setLoaderProgress(step);
      if (step === 2) loaderText.textContent = 'Almost there...';
    });
    cacheQuestions(selectedTopic, questions);
    loaderText.textContent = 'Ready!';
    await new Promise((r) => setTimeout(r, 200));
    startGame();
  } catch (err) {
    showError(
      err.message.includes('API key')
        ? err.message
        : 'Failed to load quiz. Check your API key in config.js and try again.'
    );
  }
}

function startGame() {
  questionCounter = 0;
  score = 0;
  correctCount = 0;
  answerLog = [];
  availableQuestions = [...questions];
  scoreText.textContent = '0';
  loader.classList.add('hidden');
  game.classList.remove('hidden');
  getNewQuestion();
}

function getNewQuestion() {
  if (availableQuestions.length === 0 || questionCounter >= TOTAL_QUESTIONS) {
    saveResults();
    clearQuestionCache();
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    setTimeout(() => window.location.assign('./end.html'), 280);
    return;
  }

  questionCounter++;
  progressText.textContent = `Question ${questionCounter} of ${TOTAL_QUESTIONS}`;
  progressBarFull.style.width = `${(questionCounter / TOTAL_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  availableQuestions.splice(questionIndex, 1);

  questionEl.textContent = currentQuestion.question;

  choiceContainers.forEach((container) => {
    container.classList.remove('correct', 'incorrect', 'disabled');
    const number = container.dataset.number;
    container.querySelector('.choice-text').textContent =
      currentQuestion['choice' + number];
  });

  animateQuestionIn();
  acceptingAnswers = true;
}

function saveResults() {
  const maxScore = TOTAL_QUESTIONS * CORRECT_BONUS;
  const percentage = Math.round((correctCount / TOTAL_QUESTIONS) * 100);

  localStorage.setItem(
    'quizResults',
    JSON.stringify({
      score,
      maxScore,
      correct: correctCount,
      wrong: TOTAL_QUESTIONS - correctCount,
      total: TOTAL_QUESTIONS,
      percentage,
      topic: selectedTopic.name,
      topicIcon: selectedTopic.icon,
      answerLog,
    })
  );
  localStorage.setItem('mostRecentScore', score);
}

function handleAnswer(selectedAnswer) {
  if (!acceptingAnswers) return;

  acceptingAnswers = false;
  const isCorrect = selectedAnswer === currentQuestion.answer;
  const container = choiceContainers[selectedAnswer - 1];

  if (isCorrect) {
    correctCount++;
    incrementScore(CORRECT_BONUS);
    container.classList.add('correct');
  } else {
    container.classList.add('incorrect');
    choiceContainers[currentQuestion.answer - 1].classList.add('correct');
  }

  choiceContainers.forEach((c) => c.classList.add('disabled'));

  answerLog.push({
    question: currentQuestion.question,
    selected: currentQuestion['choice' + selectedAnswer],
    correct: currentQuestion['choice' + currentQuestion.answer],
    isCorrect,
  });

  setTimeout(getNewQuestion, QUESTION_DELAY_MS);
}

choiceContainers.forEach((container) => {
  container.addEventListener('click', () => {
    handleAnswer(parseInt(container.dataset.number, 10));
  });
});

document.addEventListener('keydown', (e) => {
  if (!acceptingAnswers) return;
  const keyMap = { '1': 1, '2': 2, '3': 3, '4': 4, a: 1, b: 2, c: 3, d: 4 };
  const num = keyMap[e.key.toLowerCase()];
  if (num) handleAnswer(num);
});

function incrementScore(num) {
  score += num;
  scoreText.textContent = score;
  scoreText.classList.remove('score-pop');
  void scoreText.offsetWidth;
  scoreText.classList.add('score-pop');
}

loadQuestions();
