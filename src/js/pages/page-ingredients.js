import { getIngredients, deleteIngredient } from '../data/list-ingredients.js';

export function renderIngredients(container) {
  const ingredients = getIngredients();
  const currentLang = document.documentElement.lang || 'en';

  container.innerHTML = `
    <div class="ingredients-page">
      <h2>Ingredients</h2>
      <p>List of all your ingredients will be here.</p>

      <button class="add-button ingredient-add-button" id="open-picker-btn">
        Новый ингредиент
      </button>

      <ul class="ingredients-list">
        ${ingredients.map(ing => `
          <li class="ingredient-item">
            <span>${ing.name[currentLang] || ing.name.en}</span>
            <span class="ingredient-type">${ing.type}</span>
            <span class="ingredient-quantity">${ing.quantity} ml</span>
            <button class="ingredient-delete-button" data-id="${ing.id}" title="Удалить ингредиент"> × </button>
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  const pickerBtn = document.getElementById('open-picker-btn');
  if (pickerBtn) {
    pickerBtn.addEventListener('click', () => {
      window.location.hash = '#ingredient-picker';
    });
  }

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
}
