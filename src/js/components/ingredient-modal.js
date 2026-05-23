import { getIngredients, addIngredient } from '../data/list-ingredients.js';

export function openIngredientSettings(ingredientData, onSave) {
  const template = document.getElementById('ingredient-modal-template');
  const clone = template.content.cloneNode(true);

  const overlay = clone.querySelector('.modal-overlay');

  const nameInput = clone.querySelector('.js-ingredient-name');
  const typeInput = clone.querySelector('.js-ingredient-type');
  const originInput = clone.querySelector('.js-ingredient-origin');
  const quantityInput = clone.querySelector('.js-ingredient-quantity');
  const shelfLifeInput = clone.querySelector('.js-ingredient-shelfLife');
  const aromaInput = clone.querySelector('.js-ingredient-aroma');
  const commentsInput = clone.querySelector('.js-ingredient-comments');
  const cancelBtn = clone.querySelector('.js-modal-cancel');
  const saveBtn = clone.querySelector('.js-modal-save');

  if (ingredientData) {
    const currentLang = document.documentElement.lang || 'en';
    const displayName = ingredientData.name?.[currentLang] || ingredientData.name?.en || '';
    if (nameInput) {
      nameInput.value = displayName;
      if (ingredientData.id && ingredientData.name) {
        nameInput.readOnly = true;
      }
    }
    if (typeInput) typeInput.value = ingredientData.type || '';
    if (originInput) originInput.value = ingredientData.origin || '';
    if (quantityInput) quantityInput.value = ingredientData.quantity || '';
    if (shelfLifeInput) shelfLifeInput.value = ingredientData.shelfLife || '';
    if (aromaInput) aromaInput.value = ingredientData.aromaProfile || '';
    if (commentsInput) commentsInput.value = ingredientData.comments || '';
  }

  document.body.appendChild(clone);

  if (overlay) {
    overlay.classList.add('active');
  }
  
  const previousActiveElement = document.activeElement;
  if (nameInput && !nameInput.readOnly) {
    nameInput.focus();
  } else if (quantityInput) {
    quantityInput.focus();
  }

const closeModal = () => {
    document.removeEventListener('keydown', escapeHandler);
    if (overlay) {
        overlay.remove(); 
    }
    if (previousActiveElement) previousActiveElement.focus();
};

  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', escapeHandler);

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  } else {
    console.error('Не найдена кнопка .js-modal-cancel');
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const formData = {
        id: ingredientData?.id,
        name: {
          en: nameInput?.value || '',
          ru: nameInput?.value || '',
          es: nameInput?.value || ''
        },
        type: typeInput?.value || '',
        origin: originInput?.value || '',
        quantity: quantityInput ? Number(quantityInput.value) || 0 : 0,
        shelfLife: shelfLifeInput?.value || '',
        aromaProfile: aromaInput?.value || '',
        comments: commentsInput?.value || ''
      };

      if (onSave) {
        onSave(formData);
      }
      closeModal();
    });
  } else {
    console.error('Не найдена кнопка .js-modal-save');
  }
}