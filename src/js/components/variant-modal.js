import { getIngredients } from '../data/list-ingredients.js';
import { updateVariant } from '../data/list-formulas.js';

export function openVariantModal(formula, variantId, onSave) {
  const currentLang = document.documentElement.lang || 'en';

  // Определяем, с каким вариантом работаем

  const existingVariant = variantId
    ? formula.variants.find(v => v.variantId === variantId)
    : null;

  const ingredientsCopy = existingVariant
    ? existingVariant.ingredients.map(ing => ({ ...ing }))
    : [];

  const notesInitial = existingVariant ? existingVariant.notes : '';

  const template = document.getElementById('ingredient-modal-template');
  const clone = template.content.cloneNode(true);
  const overlay = clone.querySelector('.modal-overlay');
  const content = overlay.querySelector('.journal-content.modal-content');

 
  content.innerHTML = `
    <h3>Редактирование варианта</h3>
    <div class="formula-name"><strong>${formula.name[currentLang] || formula.name.en}</strong></div>

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

    <div class="modal-actions">
      <button class="js-modal-save">Сохранить</button>
      <button class="js-modal-cancel">Отмена</button>
    </div>
  `;

  document.body.appendChild(clone);
  overlay.classList.add('active');

  // --- поиск ингредиентов ---
  const searchInput = content.querySelector('.js-variant-search');
  const select = content.querySelector('.js-variant-select');
  const addBtn = content.querySelector('.js-variant-add-btn');
  const ingredientsList = content.querySelector('.js-variant-ingredients-list');
  const notesTextarea = content.querySelector('.js-variant-notes');
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

  // Добавить ингредиент в локальный массив и DOM

  addBtn.addEventListener('click', () => {
    const selectedId = select.value;
    if (!selectedId) return;
    if (ingredientsCopy.some(ing => ing.ingredientId === selectedId)) {
      alert('Этот ингредиент уже в списке');
      return;
    }
    ingredientsCopy.push({ ingredientId: selectedId, percent: 0 });
    const newItem = document.createElement('li');
    const ingName = allIngredients.find(i => i.id === selectedId)?.name[currentLang] || selectedId;
    newItem.innerHTML = `
      ${ingName} — <input type="number" class="js-percent" data-id="${selectedId}" value="0" min="0" max="100" step="0.1">%
      <button class="js-remove-ingredient" data-id="${selectedId}">×</button>
    `;
    ingredientsList.appendChild(newItem);
  });

  // Удаление ингредиента
  ingredientsList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.js-remove-ingredient');
    if (!removeBtn) return;
    const id = removeBtn.dataset.id;
    const index = ingredientsCopy.findIndex(ing => ing.ingredientId === id);
    if (index !== -1) ingredientsCopy.splice(index, 1);
    removeBtn.closest('li').remove();
  });

  // --- Закрытие и сохранение ---
const closeModal = () => {
    overlay.classList.remove('active');
    document.removeEventListener('keydown', escapeHandler);
    if (overlay) overlay.remove();  
};

  const escapeHandler = (e) => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', escapeHandler);

  // Отмена
  const cancelBtn = content.querySelector('.js-modal-cancel');
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Сохранение
  const saveBtn = content.querySelector('.js-modal-save');
  saveBtn.addEventListener('click', () => {
    const percentInputs = ingredientsList.querySelectorAll('.js-percent');
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
    closeModal();
  });
}