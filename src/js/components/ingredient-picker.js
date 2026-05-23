import { getIngredients, addIngredient } from '../data/list-ingredients.js';
import { ingredientsLibrary } from '../data/ingredients-library.js'

export function renderIngredientPicker(container) {
  container.innerHTML = `
    <div class="ingredient-picker">
      <h2>Find & Add Ingredient</h2>
      <div class="search-box">
        <input type="search" id="ingredient-search" placeholder="Поиск..." autocomplete="off">
      </div>
      <div id="create-new-item" class="create-new-item" style="display: none;">
        <span>Create "<span id="new-ingredient-name"></span>"</span>
        <button id="create-new-btn" class="btn-add">+</button>
      </div>
      <ul id="search-results" class="search-results"></ul>
    </div>
  `;
  initPicker();
}

function initPicker() {
  const searchInput = document.getElementById('ingredient-search');
  const resultsList = document.getElementById('search-results');
  const createNewItem = document.getElementById('create-new-item');
  const newIngredientNameSpan = document.getElementById('new-ingredient-name');
  const createNewBtn = document.getElementById('create-new-btn');

  const allIngredients = ingredientsLibrary;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (query === '') {
      resultsList.innerHTML = '';
      createNewItem.style.display = 'none';
      return;
    }

    const filtered = allIngredients.filter(ing =>
      Object.values(ing.name).some(n => n.toLowerCase().includes(query))
    );

    renderResults(filtered, query, resultsList);

    const exactMatch = allIngredients.some(ing =>
      Object.values(ing.name).some(n => n.toLowerCase() === query)
    );
    createNewItem.style.display = exactMatch ? 'none' : 'flex';
    newIngredientNameSpan.textContent = query;
  });

  createNewBtn.addEventListener('click', () => {
    const newName = newIngredientNameSpan.textContent.trim();
    if (newName) {
      sessionStorage.setItem('pendingIngredientAction', JSON.stringify({
        action: 'create-new',
        name: newName
      }));
      window.history.back();
    }
  });
}

function renderResults(items, query, container) {
  if (items.length === 0) {
    container.innerHTML = '<li class="no-results">No ingredients found</li>';
    return;
  }
  const lang = document.documentElement.lang || 'en';
  container.innerHTML = items.map(ing =>
    `<li class="search-result-item">
      <span>${ing.name[lang] || ing.name.en}</span>
      <button class="btn-add" data-id="${ing.id}">+</button>
    </li>`
  ).join('');


  container.querySelectorAll('.btn-add[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      sessionStorage.setItem('pendingIngredientAction', JSON.stringify({
        action: 'add-existing',
        ingredientId: id
      }));
      window.history.back();
    });
  });
}