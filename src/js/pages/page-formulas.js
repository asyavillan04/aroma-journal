//import {getFormula, addFormula, deleteFormula} from '../data/list-formulas';

export function renderFormulas(container) {

//  const ingredients = getIngredients();
  const currentLang = document.documentElement.lang || 'en';

  container.innerHTML = `
    <div class="formulas-page page">

      <div class="formulas-head page-head">
      <h2>Формулы</h2>

      <button class="add-button formula-add-button" id="open-builder-btn">Новая формула</button>

      </div class="journal-content"> 
      <p>Ваши формулы ароматов появятся здесь.</p>
    </div>

        
  `;
}