const STORAGE_KEY = 'kcalsnap_history_v1';

const mealForm = document.getElementById('meal-form');
const mealInput = document.getElementById('meal-input');
const resultEmpty = document.getElementById('result-empty');
const resultBox = document.getElementById('result-box');
const lastQuestion = document.getElementById('last-question');
const aiAnswer = document.getElementById('ai-answer');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const calorieForm = document.getElementById('calorie-form');
const calorieResult = document.getElementById('calorie-result');
const calorieNote = document.getElementById('calorie-note');

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function normalizeText(text) {
  return text.trim().toLowerCase();
}

function estimateMeal(text) {
  const t = normalizeText(text);
  let kcal = 180;
  let protein = 8;
  let fat = 6;
  let carbs = 18;
  let confidence = 'средняя';
  const found = [];

  const rules = [
    { keys: ['кур', 'филе', 'индей'], add: [160, 28, 4, 0], name: 'нежирный белок' },
    { keys: ['рис', 'греч', 'паста', 'макарон', 'карто'], add: [180, 5, 2, 35], name: 'гарнир' },
    { keys: ['салат', 'овощ', 'огур', 'помид'], add: [45, 2, 1, 8], name: 'овощи' },
    { keys: ['бургер', 'шаурм', 'пицц'], add: [420, 18, 20, 38], name: 'фастфуд' },
    { keys: ['суп', 'шурп', 'лагман'], add: [250, 12, 10, 24], name: 'сложное блюдо' },
    { keys: ['сыр', 'соус', 'майонез', 'масл'], add: [120, 3, 11, 2], name: 'калорийная добавка' },
    { keys: ['яблок', 'банан', 'фрукт'], add: [95, 1, 0, 24], name: 'фрукты' },
    { keys: ['яйц'], add: [80, 6, 5, 1], name: 'яйца' },
    { keys: ['говяд', 'свинин', 'стейк', 'котлет', 'фарш'], add: [280, 26, 18, 0], name: 'красное мясо' },
    { keys: ['рыб', 'лосос', 'тунец', 'семг', 'форел', 'треск'], add: [150, 22, 7, 0], name: 'рыба' },
    { keys: ['творог', 'йогурт', 'кефир', 'молок'], add: [110, 12, 4, 8], name: 'молочные продукты' },
    { keys: ['хлеб', 'тост', 'лаваш', 'батон'], add: [140, 4, 2, 28], name: 'хлеб' },
    { keys: ['орех', 'миндал', 'фундук', 'кешью', 'арахис'], add: [200, 7, 17, 6], name: 'орехи' },
    { keys: ['шоколад', 'конфет', 'торт', 'пирог', 'печень'], add: [350, 4, 16, 48], name: 'сладкое' },
    { keys: ['овсян', 'каш', 'хлопь'], add: [160, 6, 3, 28], name: 'каша' },
    { keys: ['блин', 'оладь', 'вафл'], add: [220, 5, 8, 32], name: 'блины/оладьи' },
    { keys: ['авокад'], add: [160, 2, 15, 6], name: 'авокадо' },
    { keys: ['креветк', 'морепрод', 'кальмар', 'краб'], add: [100, 20, 2, 0], name: 'морепродукты' },
    { keys: ['тофу', 'соевый', 'бобов', 'чечевиц', 'нут'], add: [130, 12, 5, 12], name: 'растительный белок' }
  ];

  rules.forEach(rule => {
    if (rule.keys.some(k => t.includes(k))) {
      kcal += rule.add[0];
      protein += rule.add[1];
      fat += rule.add[2];
      carbs += rule.add[3];
      found.push(rule.name);
    }
  });

  if (t.length > 45 || t.includes('суп') || t.includes('соус')) confidence = 'ниже средней';
  if (found.length >= 3 && !t.includes('суп')) confidence = 'выше средней';

  return {
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    confidence,
    summary: found.length ? found.join(', ') : 'общий сценарий без детального состава'
  };
}

function renderAnswer(question, answer) {
  resultEmpty.classList.add('hidden');
  resultBox.classList.remove('hidden');
  lastQuestion.textContent = question;
  aiAnswer.innerHTML = `
    <strong>≈ ${answer.kcal} ккал</strong><br>
    Белки: ${answer.protein} г · Жиры: ${answer.fat} г · Углеводы: ${answer.carbs} г
    <p>Уверенность оценки: <strong>${answer.confidence}</strong>.</p>
    <p>Что повлияло на расчёт: ${answer.summary}.</p>
    <p>Это демо-ответ MVP. В реальном продукте на этом месте был бы AI-анализ блюда по фото.</p>
  `;
}

function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = '';
  if (!history.length) {
    historyList.innerHTML = '<div class="history-item">История пока пуста. После первого запроса здесь появятся сохранённые результаты.</div>';
    return;
  }

  history.forEach(item => {
    const card = document.createElement('article');
    card.className = 'history-item';
    card.innerHTML = `
      <div class="history-date">${new Date(item.createdAt).toLocaleString('ru-RU')}</div>
      <strong>${item.question}</strong>
      <div>≈ ${item.answer.kcal} ккал · Б ${item.answer.protein} г · Ж ${item.answer.fat} г · У ${item.answer.carbs} г</div>
      <div class="muted">Уверенность: ${item.answer.confidence}</div>
    `;
    historyList.appendChild(card);
  });

  const latest = history[0];
  renderAnswer(latest.question, latest.answer);
}

mealForm.addEventListener('submit', event => {
  event.preventDefault();
  const question = mealInput.value.trim();
  if (!question) return;

  const answer = estimateMeal(question);
  const history = loadHistory();
  history.unshift({ question, answer, createdAt: new Date().toISOString() });
  saveHistory(history.slice(0, 10));
  renderHistory();
  mealForm.reset();
});

clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  resultBox.classList.add('hidden');
  resultEmpty.classList.remove('hidden');
  historyList.innerHTML = '<div class="history-item">История очищена.</div>';
});

function calculateDailyCalories({ gender, age, weight, height, activity, goal }) {
  const base = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  let total = base * Number(activity);
  if (goal === 'lose') total -= 350;
  if (goal === 'gain') total += 250;
  return Math.round(total);
}

calorieForm.addEventListener('submit', event => {
  event.preventDefault();
  const payload = {
    gender: document.getElementById('gender').value,
    goal: document.getElementById('goal').value,
    age: Number(document.getElementById('age').value),
    weight: Number(document.getElementById('weight').value),
    height: Number(document.getElementById('height').value),
    activity: Number(document.getElementById('activity').value)
  };

  const calories = calculateDailyCalories(payload);
  const goalText = payload.goal === 'lose' ? 'для похудения' : payload.goal === 'gain' ? 'для набора массы' : 'для поддержания';
  calorieResult.textContent = `${calories} ккал/день`;
  calorieNote.textContent = `Примерная суточная норма ${goalText}. Это добавленная интерактивная функция для ДЗ.`;
});

renderHistory();
