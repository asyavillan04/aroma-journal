import { addFormula, updateVariant } from '../data/list-formulas.js';
import { renderVariantForm } from './variant-form.js';
import { openMobileAside, initMobileAside } from '../components/aside.js';

export function renderFormulaFormInAside(onSave) {
  const aside = document.querySelector('.detailed-info');
  if (!aside) return;
  const tempFormula = { name: { en: '', ru: '', es: '' }, variants: [] };
  renderVariantForm(aside, tempFormula, null, null, {
    isNewFormula: true,
    returnToPrevious: () => {
      const container = document.querySelector('.journal-content')?.closest('.formulas-page')?.parentElement;
      if (container) {
        import('./page-formulas.js').then(module => module.renderFormulas(container));
      } else {
        aside.innerHTML = '';
      }
    },
    onSaveFormula: (formulaName, ingredients, notes) => {
      const nameObj = { en: formulaName, ru: formulaName, es: formulaName };
      const newFormula = addFormula(nameObj);
      const variantData = { ingredients, notes, status: 'draft' };
      const updatedFormula = updateVariant(newFormula.id, null, variantData);
      if (onSave) onSave(updatedFormula);
      else aside.innerHTML = '';
    }
  });
  openMobileAside();
}