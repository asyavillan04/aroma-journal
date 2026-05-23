import { openIngredientSettings } from '../components/ingredient-modal.js'
import { getIngredients, addIngredient, deleteIngredient } from '../data/list-ingredients.js';
import { ingredientsLibrary } from '../data/ingredients-library.js';

export function renderIngredients(container) {
  const ingredients = getIngredients();
  const currentLang = document.documentElement.lang || 'en';

  container.innerHTML = `
    <div class="ingredients-page journal-content">
      
      <div class="ing-head page-head">
      <h2>Палитра</h2>

      <button class="add-button ingredient-add-button" id="open-picker-btn">
        Новый ингредиент
      </button>
      </div>

         <p>Здесь будет список ваших ингредиентов</p>

      <ul class="ingredients-list">
        ${ingredients.map(ing => `
          <li class="ingredient-item element">
            <span>${ing.name[currentLang] || ing.name.en}</span>
            <span class="ingredient-type">${ing.type}</span>
            <span class="ingredient-quantity">${ing.quantity} ml</span>
            <button class="ingredient-delete-button delete-button" data-id="${ing.id}" title="Удалить ингредиент"> × </button>
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
