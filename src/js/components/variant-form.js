import { getIngredients } from '../data/list-ingredients.js';
import { updateVariant } from '../data/list-formulas.js';

// Настройка обработчиков для ингредиентов (общая логика)
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
    ingredientsCopy.push({ ingredientId: selectedId, percent: 0 });
    const ingName = allIngredients.find(i => i.id === selectedId)?.name[currentLang] || selectedId;
    const newItem = document.createElement('li');
    newItem.innerHTML = `
      ${ingName} — <input type="number" class="js-percent" data-id="${selectedId}" value="0" min="0" max="100" step="0.1">%
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
    const input = e.target.closest('.js-percent');
    if (!input) return;
    const ingId = input.dataset.id;
    const ing = ingredientsCopy.find(i => i.ingredientId === ingId);
    if (ing) ing.percent = parseFloat(input.value) || 0;
    if (onIngredientsChange) onIngredientsChange(ingredientsCopy);
  });
}

// Основная функция рендера формы варианта
export function renderVariantForm(aside, formula, variantId, onSave, options = {}) {
  const currentLang = document.documentElement.lang || 'en';
  const existingVariant = variantId ? formula.variants.find(v => v.variantId === variantId) : null;
  let ingredientsCopy = existingVariant ? existingVariant.ingredients.map(ing => ({ ...ing })) : [];
  let notesInitial = existingVariant ? existingVariant.notes : '';
  const isNewFormula = options.isNewFormula || false;
  const formulaName = formula.name[currentLang] || formula.name.en;

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
              ${ingName} — <input type="number" class="js-percent" data-id="${ing.ingredientId}" value="${ing.percent}" min="0" max="100" step="0.1">%
              <button class="js-remove-ingredient" data-id="${ing.ingredientId}">×</button>
            </li>
          `;
        }).join('')}
      </ul>
      <label>Заметки: <textarea class="js-variant-notes">${notesInitial}</textarea></label>
      <div class="form-actions">
        <button class="js-form-save">Сохранить</button>
        <button class="js-form-cancel">Отмена</button>
      </div>
    </div>
  `;

  setupIngredientHandlers(aside, ingredientsCopy);

  const notesTextarea = aside.querySelector('.js-variant-notes');
  const cancelBtn = aside.querySelector('.js-form-cancel');
  const backBtn = aside.querySelector('.back-button');
  const saveBtn = aside.querySelector('.js-form-save');

  const returnToPrevious = options.returnToPrevious || (() => {});
  cancelBtn.addEventListener('click', returnToPrevious);
  backBtn.addEventListener('click', returnToPrevious);

  saveBtn.addEventListener('click', () => {
    if (isNewFormula) {
      const formulaNameInput = aside.querySelector('#new-formula-name');
      const newFormulaName = formulaNameInput?.value.trim();
      if (!newFormulaName) {
        alert('Введите название формулы');
        return;
      }
      if (options.onSaveFormula) {
        options.onSaveFormula(newFormulaName, ingredientsCopy, notesTextarea.value);
      } else {
        returnToPrevious();
      }
    } else {
      // Обновление существующего варианта
      const percentInputs = aside.querySelectorAll('.js-percent');
      percentInputs.forEach(input => {
        const ingId = input.dataset.id;
        const ing = ingredientsCopy.find(i => i.ingredientId === ingId);
        if (ing) ing.percent = parseFloat(input.value) || 0;
      });
      const notes = notesTextarea.value;
      const variantData = {
        ingredients: ingredientsCopy,
        notes: notes,
        status: existingVariant ? existingVariant.status : 'draft'
      };
      const updatedFormula = updateVariant(formula.id, variantId, variantData);
      if (onSave) onSave(updatedFormula);
      else returnToPrevious();
    }
  });
}