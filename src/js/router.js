import { renderHome } from './pages/page-home.js';
import { renderIngredients } from './pages/page-ingridients.js';
import { renderFormulas } from './pages/page-formulas.js';
import { renderMaceration } from './pages/page-maceration.js';
import { renderSettings } from './pages/page-settings.js';
import { renderIngredientPicker } from './pages/ingredient-picker.js';

const container = document.getElementById('main-content');

const routes = {
  '#home': renderHome,
  '#ingredients': renderIngredients,
  '#formulas': renderFormulas,
  '#maceration': renderMaceration,
  '#settings': renderSettings,

  '#ingredient-picker': renderIngredientPicker,
};

function handleRoute() {
  const hash = window.location.hash || '#home';
  const renderFunction = routes[hash];
  if (renderFunction) {
    renderFunction(container);
  } else {
    container.innerHTML = '<p>Page not found.</p>';
  }
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute(); 
}