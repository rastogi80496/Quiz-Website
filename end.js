const username = document.getElementById('username');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const resultTitle = document.getElementById('resultTitle');
const resultEmoji = document.getElementById('resultEmoji');
const resultTopic = document.getElementById('resultTopic');
const percentageEl = document.getElementById('percentage');
const scoreSummary = document.getElementById('scoreSummary');
const performanceMsg = document.getElementById('performanceMsg');
const scoreRingFill = document.getElementById('scoreRingFill');
const answerReview = document.getElementById('answerReview');
const reviewSection = document.getElementById('reviewSection');
const statCorrect = document.getElementById('statCorrect');
const statWrong = document.getElementById('statWrong');
const statPoints = document.getElementById('statPoints');

const resultsRaw = localStorage.getItem('quizResults');
if (!resultsRaw) {
  window.location.assign('./');
}

document.body.style.opacity = '0';
requestAnimationFrame(() => {
  document.body.style.transition = 'opacity 0.35s ease';
  document.body.style.opacity = '1';
});

const results = JSON.parse(resultsRaw);
const { score, maxScore, correct, wrong, total, percentage, topic, topicIcon, answerLog } = results;

const CIRCUMFERENCE = 326.73;

function getPerformanceMessage(pct) {
  if (pct >= 90) return { emoji: '🏆', title: 'Outstanding!', msg: 'You absolutely crushed it! Expert level knowledge.' };
  if (pct >= 70) return { emoji: '🌟', title: 'Great Job!', msg: 'Solid performance — you really know your stuff.' };
  if (pct >= 50) return { emoji: '👍', title: 'Good Effort!', msg: 'Not bad at all. A little more practice and you\'ll ace it.' };
  return { emoji: '📚', title: 'Keep Learning!', msg: 'Every quiz makes you smarter. Give it another go!' };
}

function renderResults() {
  const perf = getPerformanceMessage(percentage);

  resultEmoji.textContent = perf.emoji;
  resultTitle.textContent = perf.title;
  resultTopic.textContent = `${topicIcon} ${topic}`;
  percentageEl.textContent = `${percentage}%`;
  scoreSummary.textContent = `${correct} of ${total} correct · ${score} / ${maxScore} points`;
  performanceMsg.textContent = perf.msg;

  statCorrect.textContent = correct;
  statWrong.textContent = wrong ?? total - correct;
  statPoints.textContent = score;

  const offset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
  requestAnimationFrame(() => {
    scoreRingFill.style.strokeDashoffset = offset;
  });

  if (answerLog?.length > 0) {
    answerReview.innerHTML = answerLog
      .map(
        (entry, i) => `
        <li style="animation-delay:${i * 0.03}s">
          <p class="review-q">${i + 1}. ${entry.question}</p>
          ${
            entry.isCorrect
              ? `<p class="review-answer correct-ans">✓ ${entry.correct}</p>`
              : `<p class="review-answer wrong-ans">✗ Your answer: ${entry.selected}</p>
                 <p class="review-answer correct-ans">✓ Correct: ${entry.correct}</p>`
          }
        </li>`
      )
      .join('');
  } else {
    reviewSection.classList.add('hidden');
  }
}

renderResults();

username.addEventListener('keyup', () => {
  saveScoreBtn.disabled = !username.value.trim();
});

saveHighScore = (e) => {
  e.preventDefault();

  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  highScores.push({ score, name: username.value.trim(), topic, percentage });
  highScores.sort((a, b) => b.score - a.score);
  highScores.splice(5);

  localStorage.setItem('highScores', JSON.stringify(highScores));
  window.location.assign('./highscores.html');
};
