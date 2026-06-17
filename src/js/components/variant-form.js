import { getIngredients } from '../data/list-ingredients.js';
import { updateVariant } from '../data/list-formulas.js';

// Настройка обработчиков для ингредиентов
export function setupIngredientHandlers(aside, ingredientsCopy, onIngredientsChange) {
  const currentLang = document.documentElement.lang || 'en';
  const searchInput = aside.querySelector('.js-variant-search');
  const select = aside.querySelector('.js-variant-select');
  const addBtn = aside.querySelector('.js-variant-add-btn');
  const ingredientsList = aside.querySelector('.js-variant-ingredients-list');
  const allIngredients = getIngredients();

  function updateSelect(filter = '') {
    const filtered = allIngredients.filter(ing =>
      Object.values(ing.name).some(n => n.toLowerCase().includes(filter.toLowerCase()))
    );
    select.innerHTML = filtered.map(ing => {
      const name = ing.name[currentLang] || ing.name.en;
      return `<option value="${ing.id}">${name}</option>`;
    }).join('');
  }
  updateSelect();
  searchInput.addEventListener('input', () => updateSelect(searchInput.value));

  addBtn.addEventListener('click', () => {
    const selectedId = select.value;
    if (!selectedId) return;
    if (ingredientsCopy.some(ing => ing.ingredientId === selectedId)) {
      alert('Этот ингредиент уже в списке');
      return;
    }
    ingredientsCopy.push({ ingredientId: selectedId, amount: 0 });
    const ingName = allIngredients.find(i => i.id === selectedId)?.name[currentLang] || selectedId;
    const newItem = document.createElement('li');
    newItem.innerHTML = `
      ${ingName} — <input type="number" class="js-amount" data-id="${selectedId}" value="0" min="0" step="0.1">
      <button class="js-remove-ingredient" data-id="${selectedId}">×</button>
    `;
    ingredientsList.appendChild(newItem);
    if (onIngredientsChange) onIngredientsChange(ingredientsCopy);
  });

  ingredientsList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.js-remove-ingredient');
    if (!removeBtn) return;
    const id = removeBtn.dataset.id;
    const index = ingredientsCopy.findIndex(ing => ing.ingredientId === id);
    if (index !== -1) ingredientsCopy.splice(index, 1);
    removeBtn.closest('li').remove();
    if (onIngredientsChange) onIngredientsChange(ingredientsCopy);
  });

  ingredientsList.addEventListener('change', (e) => {
    const input = e.target.closest('.js-amount');
    if (!input) return;
    const ingId = input.dataset.id;
    const ing = ingredientsCopy.find(i => i.ingredientId === ingId);
    if (ing) ing.amount = parseFloat(input.value) || 0;
    if (onIngredientsChange) onIngredientsChange(ingredientsCopy);
  });

  return function updateAmountLabels(measure) {
    const amountInputs = ingredientsList.querySelectorAll('.js-amount');
    amountInputs.forEach(input => {
      const label = input.closest('li')?.querySelector('.ingredient-amount-label');
      if (label) {
        label.textContent = measure === 'percent' ? '%' : '';
      }
    });
  };
}

export function renderVariantForm(aside, formula, variantId, onSave, options = {}) {
  const currentLang = document.documentElement.lang || 'en';
  const existingVariant = variantId ? formula.variants.find(v => v.variantId === variantId) : null;
  let ingredientsCopy = existingVariant
    ? existingVariant.ingredients.map(ing => ({ ...ing }))
    : [];
  let notesInitial = existingVariant ? existingVariant.notes : '';
  const isNewFormula = options.isNewFormula || false;
  const formulaName = formula.name[currentLang] || formula.name.en;

  // Выбранная мера
  const currentMeasure = existingVariant ? existingVariant.measure : 'percent';
  // Вычисляем общий объём как сумму amount всех ингредиентов (для отображения)
  const computeTotalAmount = () => ingredientsCopy.reduce((sum, ing) => sum + (ing.amount || 0), 0);

  aside.innerHTML = `
    <div class="aside-form variant-form">
      <div class="form-header">
        <button class="back-button">← Назад</button>
        <h3>${existingVariant ? 'Редактировать вариант' : 'Новый вариант'}</h3>
      </div>
      ${isNewFormula
        ? '<label>Название формулы: <input type="text" id="new-formula-name" placeholder="Например: Летний бриз"></label>'
        : `<div class="formula-name"><strong>${formulaName}</strong></div>`
      }

      <div class="variant-measure">
        <label>Единицы измерения:
          <select class="js-variant-measure">
            <option value="percent" ${currentMeasure === 'percent' ? 'selected' : ''}>% (рекомендуется)</option>
            <option value="drops" ${currentMeasure === 'drops' ? 'selected' : ''}>Капли</option>
            <option value="ml" ${currentMeasure === 'ml' ? 'selected' : ''}>мл</option>
            <option value="mg" ${currentMeasure === 'mg' ? 'selected' : ''}>мг (рекомендуется)</option>
          </select>
        </label>
        <div class="variant-total-amount" style="display: ${currentMeasure !== 'percent' ? 'block' : 'none'};">
          <span>Общий объём: <strong class="js-total-amount-value">${computeTotalAmount().toFixed(1)}</strong></span>
        </div>
      </div>

      <div class="variant-add-ingredient">
        <input type="text" class="js-variant-search" placeholder="Поиск ингредиента...">
        <select class="js-variant-select" size="4"></select>
        <button class="js-variant-add-btn">Добавить</button>
      </div>

      <ul class="js-variant-ingredients-list">
        ${ingredientsCopy.map(ing => {
          const ingredient = getIngredients().find(i => i.id === ing.ingredientId);
          const ingName = ingredient ? (ingredient.name[currentLang] || ingredient.name.en) : 'Неизвестный';
          return `
            <li>
              ${ingName} — <input type="number" class="js-amount" data-id="${ing.ingredientId}" value="${ing.amount}" min="0" step="0.1">
              <button class="js-remove-ingredient" data-id="${ing.ingredientId}">×</button>
            </li>
          `;
        }).join('')}
      </ul>

      <div class="percent-summary" style="margin-top: 10px; font-weight: bold;"></div>

      <label>Заметки: <textarea class="js-variant-notes">${notesInitial}</textarea></label>
      <div class="form-actions">
        <button class="js-form-save">Сохранить</button>
        <button class="js-form-cancel">Отмена</button>
      </div>
    </div>
  `;

  // Ссылки на элементы
  const measureSelect = aside.querySelector('.js-variant-measure');
  const totalAmountValueEl = aside.querySelector('.js-total-amount-value');
  const totalAmountContainer = aside.querySelector('.variant-total-amount');
  const summaryDiv = aside.querySelector('.percent-summary');
  const notesTextarea = aside.querySelector('.js-variant-notes');
  const cancelBtn = aside.querySelector('.js-form-cancel');
  const backBtn = aside.querySelector('.back-button');
  const saveBtn = aside.querySelector('.js-form-save');

  const returnToPrevious = options.returnToPrevious || (() => {});

  cancelBtn.addEventListener('click', returnToPrevious);
  backBtn.addEventListener('click', returnToPrevious);

  // Функция обновления сводки и суммы
  const updateSummary = () => {
    const measure = measureSelect.value;
    const total = computeTotalAmount();
    if (totalAmountValueEl) {
      totalAmountValueEl.textContent = total.toFixed(1);
    }

    if (measure === 'percent') {
      const diff = (total - 100).toFixed(1);
      summaryDiv.innerHTML = `Сумма: ${total.toFixed(1)}%`;
      if (Math.abs(total - 100) > 0.01) {
        summaryDiv.innerHTML += ` (отличается от 100% на ${diff > 0 ? '+' + diff : diff})`;
        summaryDiv.style.color = 'var(--color-accent)';
      } else {
        summaryDiv.style.color = 'var(--color-text-primary)';
      }
    } else {
      const percentOfTotal = total > 0 ? ((total / (total || 1)) * 100).toFixed(1) : 0;
      summaryDiv.innerHTML = `Сумма: ${total.toFixed(1)} (общий объём: ${total.toFixed(1)}) — ${percentOfTotal}%`;
      summaryDiv.style.color = 'var(--color-text-primary)';
    }
  };

  // Настройка обработчиков ингредиентов
  setupIngredientHandlers(aside, ingredientsCopy, () => {
    updateSummary();
  });

  // Обработчик смены меры
  measureSelect.addEventListener('change', () => {
    totalAmountContainer.style.display = measureSelect.value !== 'percent' ? 'block' : 'none';
    updateSummary();
  });

  // Сохранение
  saveBtn.addEventListener('click', () => {
    const measure = measureSelect.value;
    const totalAmount = computeTotalAmount(); // вычисляем автоматически

    const updatedIngredients = ingredientsCopy.map(ing => ({
      ingredientId: ing.ingredientId,
      amount: ing.amount || 0
    }));

    const notes = notesTextarea.value;

    if (isNewFormula) {
      const formulaNameInput = aside.querySelector('#new-formula-name');
      const newFormulaName = formulaNameInput?.value.trim();
      if (!newFormulaName) {
        alert('Введите название формулы');
        return;
      }
      if (options.onSaveFormula) {
        options.onSaveFormula(newFormulaName, updatedIngredients, notes, measure, totalAmount);
      } else {
        returnToPrevious();
      }
    } else {
      const variantData = {
        ingredients: updatedIngredients,
        notes: notes,
        status: existingVariant ? existingVariant.status : 'draft',
        measure: measure,
        totalAmount: totalAmount
      };
      const updatedFormula = updateVariant(formula.id, variantId, variantData);
      if (onSave) onSave(updatedFormula);
      else returnToPrevious();
    }
  });

  // Первоначальное обновление сводки
  updateSummary();
}