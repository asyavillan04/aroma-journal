import { addIngredient, updateIngredient, getIngredients } from '../data/list-ingredients.js';

// вспомогательная функция для экранирования HTML
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
  const aromaProfile = existingIngredient?.aromaProfile || '';
  const comments = existingIngredient?.comments || '';

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
      <label>Ароматический профиль: <textarea id="ingredient-aroma-profile">${escapeHtml(aromaProfile)}</textarea></label>
      <label>Комментарии: <textarea id="ingredient-comments">${escapeHtml(comments)}</textarea></label>
      <div class="form-actions">
        <button class="js-form-save">Сохранить</button>
        <button class="js-form-cancel">Отмена</button>
      </div>
    </div>
  `;

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

    const ingredientData = {
      id: existingIngredient?.id,
      name: nameObj,
      type: newType,
      botanicalName: newBotanical,
      origin: newOrigin,
      quantity: newQuantity,
      shelfLife: newShelfLife,
      aromaProfile: newAroma,
      comments: newComments
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