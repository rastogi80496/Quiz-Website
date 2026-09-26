const FALLBACK_CATEGORIES = {
  'general-interview': 9,
  'software-engineering': 18,
  'product-management': 9,
  'data-analytics': 18,
  marketing: 9,
  sales: 9,
  design: 9,
  finance: 9,
};

const QUESTION_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      question: { type: 'STRING' },
      options: { type: 'ARRAY', items: { type: 'STRING' } },
      correctIndex: { type: 'INTEGER' },
    },
    required: ['question', 'options', 'correctIndex'],
  },
};

function decodeHtml(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function formatGeminiQuestion(q) {
  const options = q.options || [];
  const correctIndex = q.correctIndex ?? 0;
  const shuffled = [...options];
  const correctAnswer = shuffled[correctIndex];
  shuffled.sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffled.indexOf(correctAnswer);

  const formatted = {
    question: decodeHtml(q.question),
    answer: newCorrectIndex + 1,
  };

  shuffled.forEach((opt, i) => {
    formatted[`choice${i + 1}`] = decodeHtml(opt);
  });

  return formatted;
}

function buildBatchPrompt(topic, count, batchNum) {
  const focus =
    batchNum === 1
      ? 'core concepts and frequently asked questions'
      : 'realistic scenarios, judgement, and follow-up topics';
  return `Create exactly ${count} high-quality multiple-choice interview-practice questions for a ${topic.name} candidate.
Focus: ${focus}.
Each question must test a useful interview concept or the strongest response to a realistic interview situation.
Provide exactly 4 concise, distinct answer options and one unambiguously best answer (correctIndex 0-3).
Audience: entry-level to mid-level candidates. Difficulty: easy to medium. Avoid trivia, trick questions, duplicates, and questions requiring personal experience.`;
}

async function callGemini(prompt) {
  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Please add your Gemini API key in config.js');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        responseSchema: QUESTION_SCHEMA,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error (${response.status})`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No questions returned from Gemini');

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Invalid quiz format from Gemini');
  return parsed;
}

async function fetchQuestionsFromGemini(topic, totalQuestions, onProgress) {
  const half = Math.ceil(totalQuestions / 2);

  onProgress?.(1);
  const batch1Promise = callGemini(buildBatchPrompt(topic, half, 1));

  onProgress?.(2);
  const batch2Promise = callGemini(buildBatchPrompt(topic, totalQuestions - half, 2));

  const [batch1, batch2] = await Promise.all([batch1Promise, batch2Promise]);
  onProgress?.(3);

  const combined = [...batch1, ...batch2];
  if (combined.length < totalQuestions) {
    throw new Error(`Expected ${totalQuestions} questions, got ${combined.length}`);
  }

  return combined.slice(0, totalQuestions).map(formatGeminiQuestion);
}

async function fetchQuestionsFallback(topic, totalQuestions) {
  const categoryId = FALLBACK_CATEGORIES[topic.id] || 9;
  const response = await fetch(
    `https://opentdb.com/api.php?amount=${totalQuestions}&category=${categoryId}&difficulty=medium&type=multiple`
  );
  const data = await response.json();

  if (data.response_code !== 0) {
    throw new Error('Could not load fallback questions');
  }

  return data.results.map((loadedQuestion) => {
    const formattedQuestion = { question: decodeHtml(loadedQuestion.question) };
    const answerChoices = loadedQuestion.incorrect_answers.map(decodeHtml);
    formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
    answerChoices.splice(
      formattedQuestion.answer - 1,
      0,
      decodeHtml(loadedQuestion.correct_answer)
    );
    answerChoices.forEach((choice, index) => {
      formattedQuestion[`choice${index + 1}`] = choice;
    });
    return formattedQuestion;
  });
}

async function loadQuizQuestions(topic, totalQuestions, onProgress) {
  try {
    return await fetchQuestionsFromGemini(topic, totalQuestions, onProgress);
  } catch (geminiErr) {
    console.warn('Gemini failed, using fallback:', geminiErr.message);
    onProgress?.(3);
    return fetchQuestionsFallback(topic, totalQuestions);
  }
}

function cacheQuestions(topic, questions) {
  sessionStorage.setItem(
    'cachedQuiz',
    JSON.stringify({ topicId: topic.id, questions, ts: Date.now() })
  );
}

function getCachedQuestions(topic) {
  const raw = sessionStorage.getItem('cachedQuiz');
  if (!raw) return null;
  try {
    const cached = JSON.parse(raw);
    if (cached.topicId !== topic.id) return null;
    if (Date.now() - cached.ts > 10 * 60 * 1000) return null;
    return cached.questions;
  } catch {
    return null;
  }
}

function clearQuestionCache() {
  sessionStorage.removeItem('cachedQuiz');
}
