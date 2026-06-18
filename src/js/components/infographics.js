import { getIngredients } from '../data/list-ingredients.js';
import { updateVariant } from '../data/list-formulas.js';

// Список категорий нот
const NOTE_CATEGORIES = [
  { id: 'citrus', label: 'Цитрусовые', color: '#FFD700' },
  { id: 'floral', label: 'Цветочные', color: '#FF69B4' },
  { id: 'woody', label: 'Древесные', color: '#8B4513' },
  { id: 'mineral', label: 'Минеральные', color: '#A9A9A9' },
  { id: 'musky', label: 'Мускусные', color: '#D2B48C' },
  { id: 'spicy', label: 'Пряные', color: '#FF4500' },
  { id: 'fruity', label: 'Фруктовые', color: '#FFA500' },
  { id: 'green', label: 'Зелёные', color: '#228B22' },
  { id: 'balsamic', label: 'Бальзамические', color: '#8B0000' },
  { id: 'animalic', label: 'Животные', color: '#4B0082' },
  { id: 'aquatic', label: 'Акватические', color: '#00CED1' },
  { id: 'gourmand', label: 'Гурманские', color: '#D2691E' },
  { id: 'amber', label: 'Амбровые', color: '#FFBF00' },
  { id: 'leather', label: 'Кожаные', color: '#3B2F2F' },
  { id: 'smoky', label: 'Дымные', color: '#708090' },
  { id: 'abstract', label: 'Абстрактные', color: '#C0C0C0' }
];

/**
 * Строит SVG-строку для колеса ароматов на основе карты вкладов нот.
 * @param {Object} contributions - объект { categoryId: суммарнаяИнтенсивность }
 * @returns {string} SVG-разметка
 */
function buildWheelSVG(contributions) {
  const total = Object.values(contributions).reduce((sum, val) => sum + val, 0);
  if (total === 0) {
    // Если нет нот – рисуем пустое колесо
    return `
      <svg viewBox="0 0 200 200" width="200" height="200">
        <circle cx="100" cy="100" r="95" fill="none" stroke="#ccc" stroke-width="2"/>
        <circle cx="100" cy="100" r="70" fill="none" stroke="#ccc" stroke-width="1" stroke-dasharray="4 2"/>
        <circle cx="100" cy="100" r="40" fill="none" stroke="#ccc" stroke-width="1" stroke-dasharray="4 2"/>
        <text x="100" y="105" text-anchor="middle" fill="#999" font-size="12">Нет данных</text>
      </svg>
    `;
  }

  const radius = 95;
  const cx = 100, cy = 100;
  let currentAngle = -90; // начинаем сверху
  let paths = '';

  for (const cat of NOTE_CATEGORIES) {
    const value = contributions[cat.id] || 0;
    if (value === 0) continue;
    const sliceAngle = (value / total) * 360;
    const endAngle = currentAngle + sliceAngle;

    const x1 = cx + radius * Math.cos((currentAngle * Math.PI) / 180);
    const y1 = cy + radius * Math.sin((currentAngle * Math.PI) / 180);
    const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
    paths += `<path d="${path}" fill="${cat.color}" stroke="#fff" stroke-width="1"/>`;
    currentAngle = endAngle;
  }

  return `
    <svg viewBox="0 0 200 200" width="200" height="200">
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#fff" stroke-width="2"/>
    </svg>
  `;
}

/**
 * Рассчитывает суммарный вклад нот для варианта на основе его ингредиентов и их процентов.
 * @param {Array} ingredientsWithPercents - массив объектов { ingredientId, percent }
 * @returns {Object} { categoryId: суммарная Интенсивность }
 */
function calculateVariantNoteContributions(ingredientsWithPercents) {
  const allIngredients = getIngredients();
  const contributions = {};
  NOTE_CATEGORIES.forEach(cat => contributions[cat.id] = 0);

  ingredientsWithPercents.forEach(({ ingredientId, percent }) => {
    const ingredient = allIngredients.find(ing => ing.id === ingredientId);
    if (!ingredient || !ingredient.notesProfile) return;

    Object.entries(ingredient.notesProfile).forEach(([catId, intensity]) => {
      if (contributions.hasOwnProperty(catId)) {
        // intensity — число от 0 до 10 (или другое), умножаем на долю в формуле
        contributions[catId] += (intensity * percent) / 100;
      }
    });
  });

  return contributions;
}

// =============================================
// ГЛАВНАЯ ФУНКЦИЯ 
// =============================================
async function renderVariantInfographic(variant, formula) {
  const container = document.getElementById('variant-infographic');
  if (!container) return;

  const currentLang = document.documentElement.lang || 'en';
  const variantNumber = formula.variants.findIndex(v => v.variantId === variant.variantId) + 1;

  // Показываем загрузку
  container.innerHTML = `<div class="infographic-loading">Загрузка расчётов...</div>`;

  try {
    // 1. Отправляем запрос к API
    const requestBody = {
      measure: variant.measure,
      totalAmount: variant.totalAmount,
      ingredients: variant.ingredients.map(ing => ({
        ingredientId: ing.ingredientId,
        amount: ing.amount
      }))
    };

    const response = await fetch('http://localhost:5000/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();

    // 2. Рассчитываем вклад нот
    const noteContributions = calculateVariantNoteContributions(data.ingredients);

    // 3. Формируем HTML
    const ingredientsList = data.ingredients.map(ing => {
      const ingredient = getIngredients().find(i => i.id === ing.ingredientId);
      const name = ingredient ? (ingredient.name[currentLang] || ingredient.name.en) : 'Неизвестный';
      const display = variant.measure === 'percent'
        ? `${ing.percent}%`
        : `${ing.amount} (${ing.percent}%)`;
      return `<li>${name}: ${display}</li>`;
    }).join('');

    const warningHTML = (!data.isPercentTotalOk && data.scaledTo100)
      ? `
        <div id="percent-warning" class="warning-box">
          <p>Сумма: ${data.currentSum}% (отличается от 100%). Пересчитать?</p>
          <button id="recalculate-btn" class="add-button">Пересчитать до 100%</button>
          <button id="keep-as-is-btn" class="add-button">Не пересчитывать</button>
        </div>
      `
      : '';

    // Строим колесо
    const wheelSVG = buildWheelSVG(noteContributions);

    container.innerHTML = `
      <div class="infographic-container">
        <div class="infographic-section wheel-section">
          <h4>Колесо ароматов</h4>
          <div class="wheel-container">
            ${wheelSVG}
            <ul class="wheel-legend">
              ${NOTE_CATEGORIES.filter(cat => noteContributions[cat.id] > 0).map(cat => `
                <li><span class="legend-color" style="background-color:${cat.color}"></span> ${cat.label} (${Math.round(noteContributions[cat.id] * 10) / 10})</li>
              `).join('')}
            </ul>
          </div>
        </div>

        <div class="infographic-section pyramid-section">
          <h4>Пирамида аромата</h4>
          <div class="pyramid-placeholder">Скоро здесь будет пирамида</div>
        </div>

        <div class="infographic-section reveal-section">
          <h4>Раскрытие и состав</h4>
          <div class="reveal-placeholder">Редактирование раскрытия появится здесь</div>
        </div>

        <div class="infographic-section summary-section">
          <h4>Вариант ${variantNumber}</h4>
          <p><strong>Единицы:</strong> ${data.measure}</p>
          ${data.measure !== 'percent' ? `<p><strong>Общий объём:</strong> ${data.totalAmount}</p>` : ''}
          <p><strong>Ингредиенты:</strong></p>
          <ul>${ingredientsList}</ul>
          ${warningHTML}
        </div>
      </div>
    `;

    // Обработчики кнопок (пересчёт до 100%)
    if (!data.isPercentTotalOk && data.scaledTo100) {
      document.getElementById('recalculate-btn')?.addEventListener('click', async () => {
        variant.ingredients = data.scaledTo100.map(ing => ({
          ingredientId: ing.ingredientId,
          amount: ing.amount
        }));
        variant.measure = 'percent';
        variant.totalAmount = 100;

        updateVariant(formula.id, variant.variantId, variant, () => {
          renderVariantInfographic(variant, formula);
        });
      });

      document.getElementById('keep-as-is-btn')?.addEventListener('click', () => {
        const warning = document.getElementById('percent-warning');
        if (warning) warning.style.display = 'none';
      });
    }

  } catch (error) {
    console.error('Ошибка при получении расчётов:', error);
    container.innerHTML = `
      <div class="infographic-error">
        <p>Не удалось загрузить расчёты. Убедитесь, что сервер запущен.</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
  }
}

export { renderVariantInfographic };