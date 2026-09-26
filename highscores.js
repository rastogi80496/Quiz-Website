const highScoresList = document.getElementById('highScoresList');
const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

const MEDALS = ['🥇', '🥈', '🥉'];

if (highScores.length === 0) {
  highScoresList.innerHTML =
    '<li class="high-score empty">No scores yet — play a quiz to get on the board!</li>';
} else {
  highScoresList.innerHTML = highScores
    .map(
      (entry, i) =>
        `<li class="high-score">
          <span class="hs-rank">${MEDALS[i] || i + 1}</span>
          <span class="hs-name">${entry.name}</span>
          <span class="hs-score">${entry.score} pts</span>
          <span class="hs-meta">
            ${entry.topic ? `<span class="hs-topic">${entry.topic}</span>` : ''}
            ${entry.percentage != null ? `<span class="hs-pct">${entry.percentage}%</span>` : ''}
          </span>
        </li>`
    )
    .join('');
}
