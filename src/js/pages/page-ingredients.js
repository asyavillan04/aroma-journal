import { getIngredients, addIngredient, deleteIngredient } from '../data/list-ingredients.js';
import { ingredientsLibrary } from '../data/ingredients-library.js';
import { renderIngredientForm } from '../components/ingredient-form.js';

// Показывает список ингредиентов
function renderIngredientsList(container, aside) {
  const ingredients = getIngredients();
  const currentLang = document.documentElement.lang || 'en';

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
                  <button class="ingredient-edit-button edit-button" data-id="${ing.id}" title="Редактировать ингредиент"></button>
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
        <button class="add-button ingredient-add-button" id="open-picker-btn">Новый ингредиент</button>
      </div>
      <div class="journal-content">
        ${contentHtml}
      </div>
    </div>
  `;

  // Кнопка "Новый ингредиент"
  const addBtn = document.getElementById('open-picker-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      renderIngredientFormInAside(null, () => {
        renderIngredientsList(container, aside);
      });
    });
  }

  // Редактирование ингредиента
  document.querySelectorAll('.ingredient-edit-button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      renderIngredientFormInAside(id, () => {
        renderIngredientsList(container, aside);
      });
    });
  });

  // Удаление ингредиента
  document.querySelectorAll('.ingredient-delete-button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const ingredient = getIngredients().find(i => i.id === id);
      if (!ingredient) return;
      const name = ingredient.name[currentLang] || ingredient.name.en;
      if (confirm(`Удалить ингредиент "${name}"?`)) {
        deleteIngredient(id);
        renderIngredientsList(container, aside);
      }
    });
  });
}

// Функция для открытия формы ингредиента в aside
function renderIngredientFormInAside(ingredientId, onSave) {
  const aside = document.querySelector('.detailed-info');
  if (!aside) return;

  renderIngredientForm(aside, ingredientId, (updatedIngredients) => {
    if (onSave) onSave(updatedIngredients);
    else {
      const container = document.querySelector('.ingredients-page');
      if (container) renderIngredientsList(container, aside);
    }
  }, () => {
    // Отмена – возвращаем список
    const container = document.querySelector('.ingredients-page');
    if (container) renderIngredientsList(container, aside);
    else aside.innerHTML = '';
  });
}

export function renderIngredients(container) {
  const aside = document.querySelector('.detailed-info');
  if (aside) {
    aside.style.transform = 'translateX(0)';
    aside.style.opacity = '1';
    aside.style.transition = 'none';
  }
  renderIngredientsList(container, aside);
}