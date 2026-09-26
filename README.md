# Quizzify Interview Practice

An AI-powered interview-practice app that generates the **top 10 multiple-choice questions** for a selected career track using the Google Gemini API. Select a role, practise, and review your results at the end.

## Features

- **8 interview tracks** — General, software engineering, product, data, marketing, sales, design, and finance
- **AI-generated questions** — Powered by Gemini with an interview-specific prompt
- **10 questions per session** — A focused practice round with progress bar and live score
- **Smooth UX** — Loading states, answer feedback, animated transitions
- **Detailed results** — Score breakdown, percentage ring, and answer review
- **High scores** — Save your best scores locally

## Setup

1. **Get a Gemini API key** (free) at [Google AI Studio](https://aistudio.google.com/apikey)

2. **Add your API key** in `config.js`:
   ```js
   const CONFIG = {
     GEMINI_API_KEY: 'your-api-key-here',
     GEMINI_MODEL: 'gemini-2.0-flash',
   };
   ```

3. **Open the app** — Serve the folder with any static server, or open `index.html` in a browser:
   ```bash
   npx serve .
   ```

> If Gemini is unavailable, the app automatically falls back to the Open Trivia Database.

## How to Play

1. Open the home page and **select an interview track**
2. Click **Start Practice** — questions are generated for your chosen role
3. Answer all **10 questions** — correct answers earn 10 points each
4. View your **results** — score, percentage, and full answer review
5. Optionally **save your score** to the leaderboard

## Technologies

- HTML, CSS, JavaScript
- [Google Gemini API](https://ai.google.dev/) — AI question generation
- [Open Trivia Database](https://opentdb.com/) — Fallback questions

## Project Structure

```
index.html      → Interview-track selection
game.html       → Quiz gameplay
end.html        → Results & review
highscores.html → Leaderboard
config.js       → Your Gemini API key (not committed)
topics.js       → Topic definitions & quiz settings
```

---

Enjoy testing your knowledge on the latest topics!
