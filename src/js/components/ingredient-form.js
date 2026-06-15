import { addIngredient, updateIngredient, getIngredients, NOTE_CATEGORIES } from '../data/list-ingredients.js';

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

export function renderIngredientForm(aside, ingredientId, onSave, onCancel) {
  const existingIngredient = ingredientId ? getIngredients().find(i => i.id === ingredientId) : null;
  const currentLang = document.documentElement.lang || 'en';

  const name = existingIngredient?.name?.[currentLang] || existingIngredient?.name?.en || '';
  const type = existingIngredient?.type || 'essential-oil';
  const botanicalName = existingIngredient?.botanicalName || '';
  const origin = existingIngredient?.origin || '';
  const quantity = existingIngredient?.quantity ?? 0;
  const shelfLife = existingIngredient?.shelfLife || '';
  const aromaProfileText = existingIngredient?.aromaProfile || '';
  const comments = existingIngredient?.comments || '';
  const notesProfile = existingIngredient?.notesProfile || {};

  // Генерация HTML для слайдеров
  const slidersHtml = NOTE_CATEGORIES.map(cat => {
    const value = notesProfile[cat.id] || 0;
    return `
      <label class="note-slider-item">
        <span class="note-label">${cat.label}</span>
        <input type="range" class="note-slider" data-category="${cat.id}" min="0" max="10" step="1" value="${value}">
        <span class="note-value" data-category="${cat.id}">${value}</span>
      </label>
    `;
  }).join('');

  aside.innerHTML = `
    <div class="aside-form ingredient-form">
      <div class="form-header">
        <button class="back-button">← Назад</button>
        <h3>${existingIngredient ? 'Редактировать ингредиент' : 'Новый ингредиент'}</h3>
      </div>
      <label>Название: <input type="text" id="ingredient-name" value="${escapeHtml(name)}" placeholder="Например: Бергамот"></label>
      <label>Тип:
        <select id="ingredient-type">
          <option value="essential-oil" ${type === 'essential-oil' ? 'selected' : ''}>Эфирное масло</option>
          <option value="absolute" ${type === 'absolute' ? 'selected' : ''}>Абсолют</option>
          <option value="synthetic" ${type === 'synthetic' ? 'selected' : ''}>Синтетическое</option>
          <option value="other" ${type === 'other' ? 'selected' : ''}>Другое</option>
        </select>
      </label>
      <label>Ботаническое название: <input type="text" id="ingredient-botanical" value="${escapeHtml(botanicalName)}"></label>
      <label>Страна происхождения: <input type="text" id="ingredient-origin" value="${escapeHtml(origin)}"></label>
      <label>Количество: <input type="number" id="ingredient-quantity" value="${quantity}" step="0.1"></label>
      <label>Срок годности: <input type="date" id="ingredient-shelf-life" value="${shelfLife}"></label>
      <label>Ароматический профиль (текст): <textarea id="ingredient-aroma-profile">${escapeHtml(aromaProfileText)}</textarea></label>
      <label>Комментарии: <textarea id="ingredient-comments">${escapeHtml(comments)}</textarea></label>
      
      <fieldset class="notes-profile">
        <legend>Арома-профиль (числовой, 0–10)</legend>
        ${slidersHtml}
      </fieldset>
      
      <div class="form-actions">
        <button class="js-form-save">Сохранить</button>
        <button class="js-form-cancel">Отмена</button>
      </div>
    </div>
  `;

  // Обновление отображаемого значения слайдера
  const sliders = aside.querySelectorAll('.note-slider');
  sliders.forEach(slider => {
    const category = slider.dataset.category;
    const valueSpan = aside.querySelector(`.note-value[data-category="${category}"]`);
    slider.addEventListener('input', () => {
      valueSpan.textContent = slider.value;
    });
  });

  const saveBtn = aside.querySelector('.js-form-save');
  const cancelBtn = aside.querySelector('.js-form-cancel');
  const backBtn = aside.querySelector('.back-button');

  const closeForm = () => {
    if (onCancel) onCancel();
    else aside.innerHTML = '';
  };
  cancelBtn.addEventListener('click', closeForm);
  backBtn.addEventListener('click', closeForm);

  saveBtn.addEventListener('click', () => {
    const newName = aside.querySelector('#ingredient-name').value.trim();
    if (!newName) {
      alert('Введите название ингредиента');
      return;
    }
    const nameObj = { en: newName, ru: newName, es: newName };
    const newType = aside.querySelector('#ingredient-type').value;
    const newBotanical = aside.querySelector('#ingredient-botanical').value.trim();
    const newOrigin = aside.querySelector('#ingredient-origin').value.trim();
    const newQuantity = parseFloat(aside.querySelector('#ingredient-quantity').value) || 0;
    const newShelfLife = aside.querySelector('#ingredient-shelf-life').value;
    const newAroma = aside.querySelector('#ingredient-aroma-profile').value.trim();
    const newComments = aside.querySelector('#ingredient-comments').value.trim();

    // Собирает профиль нот
    const updatedNotesProfile = {};
    NOTE_CATEGORIES.forEach(cat => {
      const slider = aside.querySelector(`.note-slider[data-category="${cat.id}"]`);
      updatedNotesProfile[cat.id] = slider ? parseInt(slider.value, 10) : 0;
    });

    const ingredientData = {
      id: existingIngredient?.id,
      name: nameObj,
      type: newType,
      botanicalName: newBotanical,
      origin: newOrigin,
      quantity: newQuantity,
      shelfLife: newShelfLife,
      aromaProfile: newAroma,
      comments: newComments,
      notesProfile: updatedNotesProfile
    };

    let updatedIngredients;
    if (existingIngredient) {
      updatedIngredients = updateIngredient(existingIngredient.id, ingredientData);
    } else {
      updatedIngredients = addIngredient(ingredientData);
    }
    if (onSave) onSave(updatedIngredients);
    else closeForm();
  });
}