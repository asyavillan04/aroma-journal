import { openIngredientSettings } from '../components/ingredient-modal.js';
import { getIngredients, addIngredient, deleteIngredient } from '../data/list-ingredients.js';
import { ingredientsLibrary } from '../data/ingredients-library.js';

export function renderIngredients(container) {
  const ingredients = getIngredients();
  const currentLang = document.documentElement.lang || 'en';

  // Заглушка или список
  const contentHtml = ingredients.length === 0
    ? '<p class="empty-message">Здесь будет список ваших ингредиентов</p>'
    : `
      <ul class="ingredients-list">
        ${ingredients.map(ing => {
          const displayName = ing.name[currentLang] || ing.name.en;
          const imageHtml = ing.image
            ? `<img class="ingredient-image" src="${ing.image}" alt="${displayName}">`
            : `<div class="ingredient-image-placeholder"></div>`;

          return `
            <li class="element">
              <div class="element-content ingredient-item">
                ${imageHtml}
                <div class="ingredient-text">
                  <span class="ingredient-name">${displayName}</span>
                  <div class="ingredient-meta">
                    <span class="ingredient-type">${ing.type || '—'}</span>
                    <span class="ingredient-quantity">${ing.quantity || 0} мл</span>
                  </div>
                </div>
                <div class="ingredient-actions">
                  <button class="ingredient-delete-button delete-button" data-id="${ing.id}" title="Удалить ингредиент"></button>
                </div>
              </div>
            </li>
          `;
        }).join('')}
      </ul>
    `;

  container.innerHTML = `
    <div class="ingredients-page page">
      <div class="ing-head page-head">
        <h2>Палитра</h2>
        <button class="add-button ingredient-add-button" id="open-picker-btn">
          Новый ингредиент
        </button>
      </div>
      <div class="journal-content">
        ${contentHtml}
      </div>
    </div>
  `;

  // Сброс aside
  const aside = document.querySelector('.detailed-info');
  if (aside) {
    aside.style.transform = 'translateX(0)';
    aside.style.opacity = '1';
    aside.style.transition = 'none';
  }

  // Кнопка "Новый ингредиент"
  const pickerBtn = document.getElementById('open-picker-btn');
  if (pickerBtn) {
    pickerBtn.addEventListener('click', () => {
      window.location.hash = '#ingredient-picker';
    });
  }

  // Удаление ингредиента
  document.querySelectorAll('.ingredient-delete-button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const ingredient = ingredients.find(ing => ing.id === id);
      if (!ingredient) return;

      const name = ingredient.name[currentLang] || ingredient.name.en;
      const confirmed = confirm(`Вы уверены, что хотите удалить "${name}" из своей палитры?`);

      if (confirmed) {
        deleteIngredient(id);
        renderIngredients(container);
      }
    });
  });

  // Обработка отложенных действий из пикера
  const pending = sessionStorage.getItem('pendingIngredientAction');
  if (pending) {
    const actionData = JSON.parse(pending);
    sessionStorage.removeItem('pendingIngredientAction');

    if (actionData.action === 'add-existing') {
      const ingredient = ingredientsLibrary.find(ing => ing.id === actionData.ingredientId);
      if (ingredient) {
        openIngredientSettings(ingredient, (formData) => {
          addIngredient(formData);
          renderIngredients(container);
        });
      }
    } else if (actionData.action === 'create-new') {
      const newIngredient = {
        name: { en: actionData.name, ru: actionData.name, es: actionData.name },
        botanicalName: '',
        type: '',
        origin: '',
        quantity: 0,
        shelfLife: '',
        aromaProfile: '',
        comments: ''
      };
      openIngredientSettings(newIngredient, (formData) => {
        addIngredient(formData);
        renderIngredients(container);
      });
    }
  }
}