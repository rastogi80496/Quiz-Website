const topicGrid = document.getElementById('topicGrid');
const startBtn = document.getElementById('startBtn');
const prefetchStatus = document.getElementById('prefetchStatus');

let selectedTopic = null;
let prefetchPromise = null;
let questionsReady = false;

TOPICS.forEach((topic) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'topic-card';
  card.dataset.topicId = topic.id;
  card.innerHTML = `
    <span class="topic-icon">${topic.icon}</span>
    <span class="topic-name">${topic.name}</span>
    <span class="topic-desc">${topic.description}</span>
  `;
  card.addEventListener('click', () => selectTopic(topic.id, card));
  topicGrid.appendChild(card);
});

function setPrefetchStatus(text, loading = false) {
  prefetchStatus.innerHTML = loading
    ? `<span class="prefetch-dot"></span>${text}`
    : text;
  prefetchStatus.classList.toggle('loading', loading);
}

function prefetchQuestions(topic) {
  questionsReady = false;
  clearQuestionCache();
  setPrefetchStatus('Preparing questions...', true);

  prefetchPromise = loadQuizQuestions(topic, QUIZ_SETTINGS.TOTAL_QUESTIONS)
    .then((questions) => {
      cacheQuestions(topic, questions);
      questionsReady = true;
      setPrefetchStatus('✓ Questions ready — click Start!');
      return questions;
    })
    .catch(() => {
      setPrefetchStatus('Questions will load when you start');
      prefetchPromise = null;
    });
}

function selectTopic(topicId, cardEl) {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (selectedTopic?.id === topicId) return;

  selectedTopic = topic;
  document.querySelectorAll('.topic-card').forEach((c) => c.classList.remove('selected'));
  cardEl.classList.add('selected');
  startBtn.disabled = false;
  prefetchQuestions(topic);
}

startBtn.addEventListener('click', async () => {
  if (!selectedTopic) return;

  startBtn.disabled = true;
  startBtn.innerHTML = 'Loading...';

  sessionStorage.setItem('selectedTopic', JSON.stringify(selectedTopic));

  if (!questionsReady && prefetchPromise) {
    await prefetchPromise.catch(() => {});
  }

  window.location.assign('./game.html');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && selectedTopic && !startBtn.disabled) {
    startBtn.click();
  }
});
