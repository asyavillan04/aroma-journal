import { getIngredients } from '../data/list-ingredients.js';
import { updateVariant } from '../data/list-formulas.js';

// Шаблон SVG для колеса ароматов (заглушка)
const wheelPlaceholder = `
<div class="infographic-section wheel-section">
  <h4>Колесо ароматов</h4>
  <div class="wheel-placeholder">
    <div style="width:150px;height:150px;border-radius:50%;background:conic-gradient(#eee 0% 20%, #ddd 20% 40%, #eee 40% 60%, #ddd 60% 80%, #eee 80% 100%);margin:0 auto;"></div>
    <p>Категории ароматов будут отображаться на колесе</p>
  </div>
</div>
`;

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

    // 2. Формируем список ингредиентов с процентами
    const ingredientsList = data.ingredients.map(ing => {
      const ingredient = getIngredients().find(i => i.id === ing.ingredientId);
      const name = ingredient ? (ingredient.name[currentLang] || ingredient.name.en) : 'Неизвестный';
      const display = variant.measure === 'percent'
        ? `${ing.percent}%`
        : `${ing.amount} (${ing.percent}%)`;
      return `<li>${name}: ${display}</li>`;
    }).join('');

    // 3. Предупреждение, если сумма процентов не равна 100
    const warningHTML = (!data.isPercentTotalOk && data.scaledTo100)
      ? `
        <div id="percent-warning" class="warning-box">
          <p>Сумма: ${data.currentSum}% (отличается от 100%). Пересчитать?</p>
          <button id="recalculate-btn" class="add-button">Пересчитать до 100%</button>
          <button id="keep-as-is-btn" class="add-button">Не пересчитывать</button>
        </div>
      `
      : '';

    // 4. Собираем финальный HTML
    container.innerHTML = `
      <div class="infographic-container">
        <!-- Секция пирамиды (заглушка) -->
        <div class="infographic-section pyramid-section">
          <h4>Пирамида аромата</h4>
          <div class="pyramid-placeholder">
            <p>Верхние ноты, ноты сердца, базовые ноты появятся здесь</p>
          </div>
        </div>

        <!-- Секция колеса ароматов (заглушка) -->
        <div class="infographic-section wheel-section">
          <h4>Колесо ароматов</h4>
          <div class="wheel-placeholder">
            ${wheelPlaceholder}
            <p>Категории ароматов будут отображаться на колесе</p>
          </div>
        </div>

        <!-- Секция раскрытия и сводки -->
        <div class="infographic-section reveal-section">
          <h4>Раскрытие и состав</h4>
          <div class="reveal-controls">
            <label><input type="radio" name="reveal-type" value="skin" checked> На коже</label>
            <label><input type="radio" name="reveal-type" value="blotter"> На блоттере</label>
          </div>
          <div class="reveal-editor">
            <p>Редактирование раскрытия появится здесь</p>
          </div>
        </div>

        <!-- Сводка по ингредиентам -->
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

    // 5. Обработчики кнопок (пересчёт до 100%)
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