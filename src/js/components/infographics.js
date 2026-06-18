import { getIngredients } from '../data/list-ingredients.js';
import { updateVariant } from '../data/list-formulas.js';

// Категории нот с цветами (те, что вы обновили)
const NOTE_CATEGORIES = [
  { id: 'citrus', label: 'Цитрусовые', color: '#FFD700' },
  { id: 'floral', label: 'Цветочные', color: '#e996bf' },
  { id: 'woody', label: 'Древесные', color: '#845e43' },
  { id: 'mineral', label: 'Минеральные', color: '#A9A9A9' },
  { id: 'musky', label: 'Мускусные', color: '#D2B48C' },
  { id: 'spicy', label: 'Пряные', color: '#a12b00' },
  { id: 'fruity', label: 'Фруктовые', color: '#f0aa5e' },
  { id: 'green', label: 'Зелёные', color: '#5e8b22' },
  { id: 'balsamic', label: 'Бальзамические', color: '#8B0000' },
  { id: 'animalic', label: 'Животные', color: '#4B0082' },
  { id: 'aquatic', label: 'Акватические', color: '#008d90' },
  { id: 'gourmand', label: 'Гурманские', color: '#d2511e' },
  { id: 'amber', label: 'Амбровые', color: '#FFBF00' },
  { id: 'leather', label: 'Кожаные', color: '#3B2F2F' },
  { id: 'smoky', label: 'Дымные', color: '#515268' },
  { id: 'abstract', label: 'Абстрактные', color: '#d3cce0' }
];

/**
 * Рассчитывает суммарный вклад каждой категории нот в варианте.
 * @param {Array} ingredients - массив ингредиентов варианта с процентами
 * @returns {Array} массив объектов { category, label, color, contribution }
 */
function calculateVariantNoteContributions(ingredients) {
  const allIngredients = getIngredients();
  const contributions = {};

  ingredients.forEach(ing => {
    const ingredient = allIngredients.find(i => i.id === ing.ingredientId);
    if (!ingredient || !ingredient.notesProfile) return;

    const totalIntensity = Object.values(ingredient.notesProfile).reduce((sum, val) => sum + val, 0);
    if (totalIntensity === 0) return;

    Object.entries(ingredient.notesProfile).forEach(([category, intensity]) => {
      if (intensity > 0) {
        const normalizedIntensity = intensity / totalIntensity;
        const contribution = (normalizedIntensity * ing.percent) / 100;
        contributions[category] = (contributions[category] || 0) + contribution;
      }
    });
  });

  return NOTE_CATEGORIES.map(cat => ({
    ...cat,
    contribution: contributions[cat.id] || 0
  }));
}

/**
 * Строит SVG колеса ароматов
 * @param {Array} noteContributions - результат calculateVariantNoteContributions
 * @returns {string} строка SVG
 */
function buildWheelSVG(noteContributions) {
  const RADIUS = 90;
  const INNER_RADIUS = 40;
  const CENTER = 100;
  const total = noteContributions.reduce((sum, cat) => sum + cat.contribution, 0);

  if (total === 0) {
    return `<svg viewBox="0 0 200 200" width="200" height="200">
      <circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="var(--color-text-secondary)" stroke-width="2"/>
      <circle cx="${CENTER}" cy="${CENTER}" r="${INNER_RADIUS}" fill="none" stroke="var(--color-text-secondary)" stroke-width="2"/>
      <text x="${CENTER}" y="${CENTER}" text-anchor="middle" dy=".3em" fill="var(--color-text-secondary)" font-size="12">Нет данных</text>
    </svg>`;
  }

  let currentAngle = -90;
  let sectors = '';

  noteContributions.forEach((cat, index) => {
    if (cat.contribution <= 0) return;

    const sliceAngle = (cat.contribution / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1Outer = CENTER + RADIUS * Math.cos(startRad);
    const y1Outer = CENTER + RADIUS * Math.sin(startRad);
    const x2Outer = CENTER + RADIUS * Math.cos(endRad);
    const y2Outer = CENTER + RADIUS * Math.sin(endRad);

    const x1Inner = CENTER + INNER_RADIUS * Math.cos(startRad);
    const y1Inner = CENTER + INNER_RADIUS * Math.sin(startRad);
    const x2Inner = CENTER + INNER_RADIUS * Math.cos(endRad);
    const y2Inner = CENTER + INNER_RADIUS * Math.sin(endRad);

    const path = [
      `M ${x1Outer} ${y1Outer}`,
      `A ${RADIUS} ${RADIUS} 0 ${sliceAngle > 180 ? 1 : 0} 1 ${x2Outer} ${y2Outer}`,
      `L ${x2Inner} ${y2Inner}`,
      `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${sliceAngle > 180 ? 1 : 0} 0 ${x1Inner} ${y1Inner}`,
      'Z'
    ].join(' ');

    // Анимация: opacity от 0 до 0.85, поворот от -90° до 0° (веер)
    const delay = index * 0.15;
    sectors += `
      <path d="${path}" fill="${cat.color}" opacity="0" stroke="#fff" stroke-width="1"
            style="transform-origin: ${CENTER}px ${CENTER}px; animation: sectorReveal 0.6s ease-out forwards; animation-delay: ${delay}s;">
        <title>${cat.label} — ${cat.contribution.toFixed(1)}%</title>
      </path>`;

    currentAngle = endAngle;
  });

  // Уникальное имя анимации для каждого рендера (чтобы перезапускалась)
  const animName = `sectorReveal${Date.now()}`;
  const cssAnimation = `
    @keyframes ${animName} {
      0% { opacity: 0; transform: rotate(-90deg); }
      100% { opacity: 0.85; transform: rotate(0deg); }
    }
  `;

  // Заменяем стандартное имя на уникальное
  const result = `
    <svg viewBox="0 0 200 200" width="200" height="200">
      <style>${cssAnimation}</style>
      ${sectors.replace(/sectorReveal/g, animName)}
      <circle cx="${CENTER}" cy="${CENTER}" r="${INNER_RADIUS}" fill="var(--color-bg, white)" stroke="var(--color-text-secondary)" stroke-width="1"/>
      <text x="${CENTER}" y="${CENTER}" text-anchor="middle" dy=".3em" fill="var(--color-text-secondary)" font-size="10">Колесо</text>
    </svg>`;

  return result;
}

/**
 * Отображает инфографику варианта в aside.
 * @param {Object} variant - объект варианта
 * @param {Object} formula - объект формулы
 * @param {HTMLElement} textContainer - контейнер для текстовой инфо
 * @param {HTMLElement} canvasContainer - контейнер для колеса
 * @param {boolean} includeControls - показывать ли переключатель раскрытия
 */
export async function renderVariantInfographic(variant, formula, textContainer, canvasContainer, includeControls = false) {
  if (!canvasContainer) return;

  const currentLang = document.documentElement.lang || 'en';
  const variantNumber = formula.variants.findIndex(v => v.variantId === variant.variantId) + 1;

  canvasContainer.innerHTML = `<div class="infographic-loading">Загрузка данных...</div>`;

  try {
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

    if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

    const data = await response.json();

    // Текстовая информация (информация о варианте)
    if (textContainer) {
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

      textContainer.innerHTML = `
        <div class="variant-text-content">
          <h4>Вариант ${variantNumber}</h4>
          <p><strong>Единицы:</strong> ${data.measure}</p>
          ${data.measure !== 'percent' ? `<p><strong>Общий объём:</strong> ${data.totalAmount}</p>` : ''}
          <p><strong>Ингредиенты:</strong></p>
          <ul>${ingredientsList}</ul>
          ${warningHTML}
        </div>
      `;

      if (!data.isPercentTotalOk && data.scaledTo100) {
        document.getElementById('recalculate-btn')?.addEventListener('click', async () => {
          variant.ingredients = data.scaledTo100.map(ing => ({
            ingredientId: ing.ingredientId,
            amount: ing.amount
          }));
          variant.measure = 'percent';
          variant.totalAmount = 100;

          updateVariant(formula.id, variant.variantId, variant, () => {
            renderVariantInfographic(variant, formula, textContainer, canvasContainer, includeControls);
          });
        });

        document.getElementById('keep-as-is-btn')?.addEventListener('click', () => {
          const warning = document.getElementById('percent-warning');
          if (warning) warning.style.display = 'none';
        });
      }
    }

    // Колесо ароматов
    const noteContributions = calculateVariantNoteContributions(data.ingredients);
    const wheelSVG = buildWheelSVG(noteContributions);

    canvasContainer.innerHTML = `
      <div class="infographic-container">
        <div class="infographic-section wheel-section">
          <h4>Колесо ароматов</h4>
          <div class="wheel-wrapper">
            ${wheelSVG}
            <div class="wheel-legend">
              ${noteContributions.filter(c => c.contribution > 0).map(c => `
                <div class="legend-item">
                  <span class="legend-color" style="background-color: ${c.color};"></span>
                  <span>${c.label} — ${c.contribution.toFixed(1)}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        ${includeControls ? `
        <div class="infographic-section reveal-section">
          <h4>Раскрытие</h4>
          <div class="reveal-controls">
            <label><input type="radio" name="reveal-type" value="skin" checked> На коже</label>
            <label><input type="radio" name="reveal-type" value="blotter"> На блоттере</label>
          </div>
          <div class="reveal-editor">
            <p>Редактирование раскрытия появится здесь</p>
          </div>
        </div>
        ` : ''}
      </div>
    `;

  } catch (error) {
    console.error('Ошибка при получении расчётов:', error);
    canvasContainer.innerHTML = `
      <div class="infographic-error">
        <p>Не удалось загрузить расчёты. Убедитесь, что сервер запущен.</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
  }
}