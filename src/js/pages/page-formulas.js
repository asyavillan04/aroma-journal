import { getFormulas, addFormula, deleteFormula } from '../data/list-formulas.js';
import { openVariantModal } from '../components/variant-modal.js';

export function renderFormulas(container) {
  const formulas = getFormulas();
  const currentLang = document.documentElement.lang || 'en';

  container.innerHTML = `
    <div class="formulas-page page">
      <div class="formulas-head page-head">
        <h2>Формулы</h2>
        <button class="add-button formula-add-button" id="open-builder-btn">Новая формула</button>
      </div>

      <div class="journal-content">
        ${formulas.length === 0
          ? '<p>Ваши формулы ароматов появятся здесь.</p>'
          : `
            <ul class="formulas-list">
              ${formulas.map(formula => {
                const displayName = formula.name[currentLang] || formula.name.en;
                const variantCount = formula.variants.length;
                return `
                  <li class="formula-item element">
                    <span class="formula-name">${displayName} (вариантов: ${variantCount})</span>
                    <div class="formula-actions">
                      <button class="formula-edit-button" data-id="${formula.id}" title="Редактировать">✎</button>
                      <button class="formula-delete-button" data-id="${formula.id}" title="Удалить формулу">×</button>
                    </div>
                    <ul class="formula-variants">
                      ${formula.variants.map((v, idx) => `
                        <li class="variant-item">
                          Вариант ${idx + 1} (${v.ingredients.length} компонентов) — ${v.status}
                          <button class="variant-edit-button" data-formula-id="${formula.id}" data-variant-id="${v.variantId}">✎</button>
                        </li>
                      `).join('')}
                    </ul>
                  </li>
                `;
              }).join('')}
            </ul>
          `
        }
      </div>
    </div>
  `;

const openBuilderBtn = document.getElementById('open-builder-btn');
if (openBuilderBtn) {
  openBuilderBtn.addEventListener('click', () => {
    const newName = { en: 'New Formula', ru: 'Новая формула', es: 'Nueva fórmula' };
    const newFormula = addFormula(newName);

    const firstVariantId = newFormula.variants[0].variantId;
    openVariantModal(newFormula, firstVariantId, () => {
      renderFormulas(container);
    });
  });
}

  document.querySelectorAll('.formula-delete-button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const formula = formulas.find(f => f.id === id);
      if (!formula) return;
      const name = formula.name[currentLang] || formula.name.en;
      if (confirm(`Удалить формулу "${name}" и все её варианты?`)) {
        deleteFormula(id);
        renderFormulas(container);
      }
    });
  });


  document.querySelectorAll('.formula-edit-button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const formulaId = btn.dataset.id;
      const formula = formulas.find(f => f.id === formulaId);
      if (!formula) return;

      const firstVariant = formula.variants[0];
      if (firstVariant) {
        openVariantModal(formula, firstVariant.variantId, (updatedFormula) => {

          renderFormulas(container);
        });
      }
    });
  });

  document.querySelectorAll('.variant-edit-button[data-variant-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const formulaId = btn.dataset.formulaId;
      const variantId = btn.dataset.variantId;
      const formula = formulas.find(f => f.id === formulaId);
      if (!formula) return;
      openVariantModal(formula, variantId, (updatedFormula) => {
        renderFormulas(container);
      });
    });
  });
}