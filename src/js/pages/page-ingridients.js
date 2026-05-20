import { getIngredients } from '../data/list-ingridients.js'; 

export function renderIngredients(container) {
  const ingredients = getIngredients();
  const currentLang = document.documentElement.lang || 'en';

  container.innerHTML = `
    <div class="ingredients-page">
      <h2>Ingredients</h2>
      <p>List of all your ingredients will be here.</p>

      <button class="add-button ingridient-add-button" id="open-picker-btn">
        Новый ингредиент
      </button>

      <ul class="ingredients-list">
        ${ingredients.map(ing => `
          <li class="ingredient-item">
            <span>${ing.name[currentLang] || ing.name.en}</span>
            <span class="ingredient-type">${ing.type}</span>
            <span class="ingredient-quantity">${ing.quantity} ml</span>
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
}