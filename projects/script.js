/* ────────────────────────────────────────────────
   KcalSnap MVP — script.js
   Inputs: text, voice, photo (mocked)
   Calculation: internal nutrition DB (per 100 g)
   Storage: localStorage (key: kcalsnap_history_v1)
──────────────────────────────────────────────── */

const STORAGE_KEY = 'kcalsnap_history_v1';

/* ── Nutrition database (values per 100 g) ── */
const NUTRITION_DB = {
  rice:     { name: 'Рис',          aliases: ['рис', 'rice'],                    kcal: 130, protein: 2.7, fat: 0.3, carbs: 28.2 },
  chicken:  { name: 'Курица',       aliases: ['кур', 'chicken', 'филе', 'индей'],kcal: 165, protein: 31,  fat: 3.6, carbs: 0    },
  banana:   { name: 'Банан',        aliases: ['банан', 'banana'],                kcal: 89,  protein: 1.1, fat: 0.3, carbs: 22.8 },
  egg:      { name: 'Яйцо',         aliases: ['яйц', 'egg'],                     kcal: 155, protein: 13,  fat: 11,  carbs: 1.1, unitWeight: 60 },
  bread:    { name: 'Хлеб',         aliases: ['хлеб', 'bread', 'тост', 'toast'], kcal: 265, protein: 9,   fat: 3.2, carbs: 48.8 },
  pasta:    { name: 'Паста',        aliases: ['паст', 'pasta', 'макарон'],       kcal: 131, protein: 5,   fat: 1.1, carbs: 25.1 },
  salad:    { name: 'Салат',        aliases: ['салат', 'salad', 'овощ'],         kcal: 20,  protein: 1.8, fat: 0.2, carbs: 3.3  },
  apple:    { name: 'Яблоко',       aliases: ['яблок', 'apple'],                 kcal: 52,  protein: 0.3, fat: 0.2, carbs: 13.8 },
  yogurt:   { name: 'Йогурт',       aliases: ['йогурт', 'yogurt', 'кефир'],      kcal: 59,  protein: 10,  fat: 0.4, carbs: 3.6  },
  oatmeal:  { name: 'Овсянка',      aliases: ['овсян', 'oatmeal', 'каш', 'хлопь'],kcal: 68, protein: 2.4, fat: 1.4, carbs: 12.0 },
  beef:     { name: 'Говядина',     aliases: ['говяд', 'beef', 'стейк'],          kcal: 250, protein: 26,  fat: 15,  carbs: 0    },
  fish:     { name: 'Рыба',         aliases: ['рыб', 'лосос', 'тунец', 'форел', 'семг'], kcal: 150, protein: 22, fat: 7, carbs: 0 },
  cottage:  { name: 'Творог',       aliases: ['творог'],                          kcal: 103, protein: 18,  fat: 3,   carbs: 3.3  },
  potato:   { name: 'Картофель',    aliases: ['картоф', 'карто'],                 kcal: 77,  protein: 2,   fat: 0.1, carbs: 17.5 },
  avocado:  { name: 'Авокадо',      aliases: ['авокад'],                          kcal: 160, protein: 2,   fat: 15,  carbs: 6.0  },
  nuts:     { name: 'Орехи',        aliases: ['орех', 'миндал', 'кешью', 'арахис'], kcal: 600, protein: 20, fat: 50, carbs: 15  },
  shrimp:   { name: 'Креветки',     aliases: ['креветк', 'shrimp'],               kcal: 99,  protein: 20,  fat: 1.4, carbs: 0    },
  tomato:   { name: 'Помидор',      aliases: ['помид', 'томат', 'tomato'],        kcal: 18,  protein: 0.9, fat: 0.2, carbs: 3.9  },
  cucumber: { name: 'Огурец',       aliases: ['огурц', 'cucumber'],               kcal: 16,  protein: 0.7, fat: 0.1, carbs: 3.6  },
};

/* ── Mocked photo recognition dishes ── */
const MOCK_DISHES = [
  {
    label: '🍚 Рис с курицей',
    ingredients: [{ key: 'rice', grams: 150 }, { key: 'chicken', grams: 120 }]
  },
  {
    label: '🍝 Паста',
    ingredients: [{ key: 'pasta', grams: 200 }]
  },
  {
    label: '🥗 Салат',
    ingredients: [{ key: 'salad', grams: 120 }, { key: 'tomato', grams: 80 }, { key: 'cucumber', grams: 60 }]
  },
  {
    label: '🍳 Яичница с тостами',
    ingredients: [{ key: 'egg', grams: 120 }, { key: 'bread', grams: 50 }]
  },
  {
    label: '🌾 Овсянка с бананом',
    ingredients: [{ key: 'oatmeal', grams: 80 }, { key: 'banana', grams: 100 }]
  },
];

/* ─────────────────────────────────
   DOM references
───────────────────────────────── */
const tabBtns       = document.querySelectorAll('.tab-btn');
const tabPanels     = document.querySelectorAll('.tab-panel');

const textSubmitBtn = document.getElementById('text-submit');
const mealInput     = document.getElementById('meal-input');

const micBtn        = document.getElementById('mic-btn');
const voiceStatus   = document.getElementById('voice-status');
const voiceText     = document.getElementById('voice-text');
const voiceSubmit   = document.getElementById('voice-submit');
const voiceClear    = document.getElementById('voice-clear');

const photoInput    = document.getElementById('photo-input');
const photoDrop     = document.getElementById('photo-drop');
const photoPreview  = document.getElementById('photo-preview-wrap');
const previewImg    = document.getElementById('preview-img');
const mockDishes    = document.getElementById('mock-dishes');

const clearHistoryBtn = document.getElementById('clear-history');

const resultEmpty   = document.getElementById('result-empty');
const resultBox     = document.getElementById('result-box');
const resultBadge   = document.getElementById('result-type-badge');
const lastQuestion  = document.getElementById('last-question');
const ingredientList= document.getElementById('ingredient-list');
const macroTotals   = document.getElementById('macro-totals');

const historyList   = document.getElementById('history-list');

const calorieForm   = document.getElementById('calorie-form');
const calorieResult = document.getElementById('calorie-result');
const calorieNote   = document.getElementById('calorie-note');

/* ─────────────────────────────────
   Tab switching
───────────────────────────────── */
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
  });
});

/* ─────────────────────────────────
   Nutrition calculation helpers
───────────────────────────────── */
function calcNutrition(key, grams) {
  const db = NUTRITION_DB[key];
  const ratio = grams / 100;
  return {
    name: db.name,
    grams,
    kcal:    Math.round(db.kcal    * ratio),
    protein: Math.round(db.protein * ratio * 10) / 10,
    fat:     Math.round(db.fat     * ratio * 10) / 10,
    carbs:   Math.round(db.carbs   * ratio * 10) / 10,
  };
}

function sumNutrition(ingredients) {
  return ingredients.reduce((acc, ing) => ({
    kcal:    acc.kcal    + ing.kcal,
    protein: Math.round((acc.protein + ing.protein) * 10) / 10,
    fat:     Math.round((acc.fat     + ing.fat)     * 10) / 10,
    carbs:   Math.round((acc.carbs   + ing.carbs)   * 10) / 10,
  }), { kcal: 0, protein: 0, fat: 0, carbs: 0 });
}

/* ─────────────────────────────────
   Text ingredient parser
   Handles: "rice 100g", "chicken 150 г", "eggs 2"
───────────────────────────────── */
function parseIngredients(text) {
  const normalized = text.toLowerCase().trim();
  const parts = normalized.split(/[,;]+/);
  const result = [];
  const unrecognized = [];

  for (const part of parts) {
    const t = part.trim();
    if (!t) continue;

    let matched = false;

    for (const [key, data] of Object.entries(NUTRITION_DB)) {
      if (data.aliases.some(a => t.includes(a))) {
        const numMatch = t.match(/(\d+(?:[.,]\d+)?)/);
        let grams = 100;

        if (numMatch) {
          const num = parseFloat(numMatch[1].replace(',', '.'));
          const hasUnit = /г\b|гр\b|g\b|gram/.test(t);

          if (hasUnit) {
            grams = num;
          } else if (data.unitWeight) {
            grams = num * data.unitWeight;
          } else {
            grams = num > 10 ? num : 100;
          }
        }

        result.push(calcNutrition(key, grams));
        matched = true;
        break;
      }
    }

    if (!matched && t.length > 1) {
      unrecognized.push(t);
    }
  }

  return { ingredients: result, unrecognized };
}

/* ─────────────────────────────────
   Render result
───────────────────────────────── */
const INPUT_LABELS = { text: '📝 Текст', voice: '🎙 Голос', photo: '📷 Фото' };

function renderResult(question, ingredients, inputType) {
  resultEmpty.classList.add('hidden');
  resultBox.classList.remove('hidden');
  resultBadge.textContent = INPUT_LABELS[inputType] || 'local MVP';

  lastQuestion.textContent = question;

  ingredientList.innerHTML = '';
  if (ingredients.length === 0) {
    ingredientList.innerHTML = '<div class="ingredient-row"><span class="ing-name">Продукты не распознаны</span></div>';
  } else {
    ingredients.forEach(ing => {
      const row = document.createElement('div');
      row.className = 'ingredient-row';
      row.innerHTML = `
        <span class="ing-name">${ing.name} ${ing.grams} г</span>
        <span class="ing-meta">${ing.kcal} ккал · Б ${ing.protein} · Ж ${ing.fat} · У ${ing.carbs}</span>
      `;
      ingredientList.appendChild(row);
    });
  }

  const totals = sumNutrition(ingredients);
  macroTotals.innerHTML = `
    <div class="macro-item kcal">
      <div class="macro-value">${totals.kcal}</div>
      <div class="macro-label">ккал</div>
    </div>
    <div class="macro-item">
      <div class="macro-value">${totals.protein}</div>
      <div class="macro-label">белки, г</div>
    </div>
    <div class="macro-item">
      <div class="macro-value">${totals.fat}</div>
      <div class="macro-label">жиры, г</div>
    </div>
    <div class="macro-item">
      <div class="macro-value">${totals.carbs}</div>
      <div class="macro-label">углеводы, г</div>
    </div>
  `;
}

/* ─────────────────────────────────
   localStorage history
───────────────────────────────── */
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function addToHistory(inputType, originalInput, ingredients) {
  const totals = sumNutrition(ingredients);
  const entry = {
    inputType,
    originalInput,
    parsedIngredients: ingredients,
    calories: totals.kcal,
    protein:  totals.protein,
    fat:      totals.fat,
    carbs:    totals.carbs,
    timestamp: new Date().toISOString(),
  };
  const history = loadHistory();
  history.unshift(entry);
  saveHistory(history.slice(0, 20));
  renderHistory();
}

function renderHistory() {
  const history = loadHistory();
  historyList.innerHTML = '';
  if (!history.length) {
    historyList.innerHTML = '<div class="history-item"><span class="history-title">История пуста. После первого запроса здесь появятся результаты.</span></div>';
    return;
  }
  history.forEach(item => {
    const card = document.createElement('article');
    card.className = 'history-item';
    card.innerHTML = `
      <div class="history-meta">
        <span class="history-date">${new Date(item.timestamp).toLocaleString('ru-RU')}</span>
        <span class="history-badge">${INPUT_LABELS[item.inputType] || item.inputType}</span>
      </div>
      <div class="history-title">${escapeHtml(item.originalInput)}</div>
      <div class="history-macros">
        ${item.calories} ккал · Б ${item.protein} г · Ж ${item.fat} г · У ${item.carbs} г
      </div>
    `;
    historyList.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ─────────────────────────────────
   Text input flow
───────────────────────────────── */
function handleTextSubmit() {
  const raw = mealInput.value.trim();
  if (!raw) return;
  const { ingredients, unrecognized } = parseIngredients(raw);
  const label = unrecognized.length && ingredients.length === 0
    ? raw
    : raw;
  renderResult(raw, ingredients, 'text');
  addToHistory('text', raw, ingredients);
}

textSubmitBtn.addEventListener('click', handleTextSubmit);
mealInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); }
});

/* ─────────────────────────────────
   Voice input flow (Web Speech API)
───────────────────────────────── */
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;

if (!SpeechRec) {
  micBtn.disabled = true;
  micBtn.title = 'Браузер не поддерживает распознавание речи';
  voiceStatus.textContent = '⚠️ Ваш браузер не поддерживает Web Speech API. Используйте Chrome или Edge.';
  voiceStatus.style.color = '#c0392b';
} else {
  recognition = new SpeechRec();
  recognition.lang = 'ru-RU';
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    isRecording = true;
    micBtn.classList.add('recording');
    voiceStatus.textContent = '🔴 Идёт запись… говорите';
  };

  recognition.onresult = (e) => {
    const transcript = Array.from(e.results)
      .map(r => r[0].transcript)
      .join('');
    voiceText.value = transcript;
  };

  recognition.onerror = (e) => {
    voiceStatus.textContent = `Ошибка: ${e.error}. Попробуйте ещё раз.`;
    stopRecording();
  };

  recognition.onend = () => {
    stopRecording();
    if (voiceText.value.trim()) {
      voiceStatus.textContent = '✅ Готово — проверьте текст и нажмите «Рассчитать»';
    } else {
      voiceStatus.textContent = 'Речь не распознана. Попробуйте ещё раз.';
    }
  };
}

function stopRecording() {
  isRecording = false;
  micBtn.classList.remove('recording');
}

micBtn.addEventListener('click', () => {
  if (!recognition) return;
  if (isRecording) {
    recognition.stop();
  } else {
    voiceText.value = '';
    voiceStatus.textContent = 'Подготовка…';
    recognition.start();
  }
});

voiceSubmit.addEventListener('click', () => {
  const raw = voiceText.value.trim();
  if (!raw) { voiceStatus.textContent = 'Сначала запишите речь.'; return; }
  const { ingredients } = parseIngredients(raw);
  renderResult(raw, ingredients, 'voice');
  addToHistory('voice', raw, ingredients);
});

voiceClear.addEventListener('click', () => {
  voiceText.value = '';
  voiceStatus.textContent = 'Нажмите, чтобы начать';
});

/* ─────────────────────────────────
   Photo input flow (mocked)
───────────────────────────────── */
photoInput.addEventListener('change', handlePhotoUpload);

function handlePhotoUpload() {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    photoPreview.classList.remove('hidden');
    renderMockDishes();
  };
  reader.readAsDataURL(file);
}

function renderMockDishes() {
  mockDishes.innerHTML = '';
  MOCK_DISHES.forEach(dish => {
    const btn = document.createElement('button');
    btn.className = 'dish-btn';
    btn.textContent = dish.label;
    btn.addEventListener('click', () => selectMockDish(dish));
    mockDishes.appendChild(btn);
  });
}

function selectMockDish(dish) {
  const ingredients = dish.ingredients.map(i => calcNutrition(i.key, i.grams));
  const label = dish.label.replace(/^[^\s]+\s/, '');
  renderResult(label + ' (фото)', ingredients, 'photo');
  addToHistory('photo', label, ingredients);

  document.querySelectorAll('.dish-btn').forEach(b => {
    b.style.borderColor = '';
    b.style.background = '';
  });
  event.currentTarget.style.borderColor = 'var(--accent)';
  event.currentTarget.style.background = '#f4fff5';
}

/* ─────────────────────────────────
   Clear history
───────────────────────────────── */
clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  resultBox.classList.add('hidden');
  resultEmpty.classList.remove('hidden');
  historyList.innerHTML = '<div class="history-item"><span class="history-title">История очищена.</span></div>';
});

/* ─────────────────────────────────
   Daily calorie calculator
───────────────────────────────── */
calorieForm.addEventListener('submit', e => {
  e.preventDefault();
  const gender   = document.getElementById('gender').value;
  const goal     = document.getElementById('goal').value;
  const age      = Number(document.getElementById('age').value);
  const weight   = Number(document.getElementById('weight').value);
  const height   = Number(document.getElementById('height').value);
  const activity = Number(document.getElementById('activity').value);

  const base = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  let total = base * activity;
  if (goal === 'lose') total -= 350;
  if (goal === 'gain') total += 250;

  const goalText = goal === 'lose' ? 'для похудения' : goal === 'gain' ? 'для набора массы' : 'для поддержания';
  calorieResult.textContent = `${Math.round(total)} ккал/день`;
  calorieNote.textContent = `Примерная суточная норма ${goalText}. Формула Миффлина–Сан Жеора.`;
});

/* ─────────────────────────────────
   Init
───────────────────────────────── */
renderHistory();

const latest = loadHistory()[0];
if (latest) {
  renderResult(latest.originalInput, latest.parsedIngredients || [], latest.inputType || 'text');
}
