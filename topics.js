const TOPICS = [
  { id: 'general-interview', name: 'General Interview', icon: '💬', description: 'Common HR and workplace questions' },
  { id: 'software-engineering', name: 'Software Engineering', icon: '💻', description: 'Technical, coding and system design' },
  { id: 'product-management', name: 'Product Management', icon: '🧭', description: 'Product thinking and prioritisation' },
  { id: 'data-analytics', name: 'Data Analytics', icon: '📊', description: 'SQL, metrics and analytical thinking' },
  { id: 'marketing', name: 'Marketing', icon: '📣', description: 'Campaign, brand and growth questions' },
  { id: 'sales', name: 'Sales', icon: '🤝', description: 'Discovery, negotiation and customer value' },
  { id: 'design', name: 'Design', icon: '🎨', description: 'UX, visual design and critique questions' },
  { id: 'finance', name: 'Finance', icon: '📈', description: 'Financial concepts and business cases' },
];

const QUIZ_SETTINGS = {
  TOTAL_QUESTIONS: 10,
  CORRECT_BONUS: 10,
  QUESTION_DELAY_MS: 700,
};
