import { getFormulas, addFormula, deleteFormula } from '../data/list-formulas.js';
import { openVariantModal } from '../components/variant-modal.js';
import { renderVariantInfographic } from '../components/infographics.js';
import { getIngredients } from '../data/list-ingredients.js';

// Показывает варианты формулы в aside (первый уровень)
function renderVariantsInAside(formula) {
  const aside = document.querySelector('.detailed-info');
  if (!aside) return;

  const currentLang = document.documentElement.lang || 'en';
  const displayName = formula.name[currentLang] || formula.name.en;

  // Очищаем aside и создаём контейнер для переключения режимов
  aside.innerHTML = `
    <div class="aside-content">
      <div class="variants-list">
        <div class="aside-formula-details element">
          <h3>${displayName}</h3>
          <div class="aside-formula-variants">
            ${formula.variants.length === 0
              ? '<p>Нет вариантов</p>'
              : formula.variants.map((v, idx) => `
                  <div class="aside-variant-item element-content">
                    <span>Вариант ${idx + 1} — ${v.status}</span>
                    <button class="view-button variant-view-button" data-formula-id="${formula.id}" data-variant-id="${v.variantId}" title="Просмотр инфографики"></button>
                  </div>
                `).join('')
            }
          </div>
          <button class="add-button add-variant-button" data-formula-id="${formula.id}">+ Новый вариант</button>
        </div>
      </div>
      <div class="variant-details" style="display: none;">
        <!-- сюда будет рендериться детальная информация о варианте -->
      </div>
    </div>
  `;

  // Обработчики для кнопок просмотра варианта
  aside.querySelectorAll('.variant-view-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const fid = btn.dataset.formulaId;
      const vid = btn.dataset.variantId;
      const f = getFormulas().find(f => f.id === fid);
      if (f) {
        const variant = f.variants.find(v => v.variantId === vid);
        if (variant) {
          showVariantDetails(f, variant, aside);
        }
      }
    });
  });

  // Обработчик для добавления нового варианта
  aside.querySelector('.add-variant-button')?.addEventListener('click', () => {
    const fid = aside.querySelector('.add-variant-button').dataset.formulaId;
    const f = getFormulas().find(f => f.id === fid);
    if (f) {
      openVariantModal(f, null, () => {
        renderVariantsInAside(f);
      });
    }
  });
}

// Показывает детали конкретного варианта внутри aside (второй уровень)
function showVariantDetails(formula, variant, aside) {
  const variantsListDiv = aside.querySelector('.variants-list');
  const variantDetailsDiv = aside.querySelector('.variant-details');
  
  if (!variantsListDiv || !variantDetailsDiv) return;
  
  variantsListDiv.style.display = 'none';
  variantDetailsDiv.style.display = 'block';
  
  const currentLang = document.documentElement.lang || 'en';
  const formulaName = formula.name[currentLang] || formula.name.en;
  const variantNumber = formula.variants.findIndex(v => v.variantId === variant.variantId) + 1;
  
  variantDetailsDiv.innerHTML = `
    <div class="variant-details-container element">
      <div class="variant-details-head">
      <button class="back-to-variants-button"><</button>
      <h3>${formulaName} — Вариант ${variantNumber}</h3>
      </div>
      <div class="variant-text"></div>
      <div id="variant-infographic"></div>
    </div>
  `;
  
  const textContainer = variantDetailsDiv.querySelector('.variant-text');
  const canvasContainer = variantDetailsDiv.querySelector('#variant-infographic');
  
  renderVariantInfographic(variant, formula, textContainer, canvasContainer, true); 
  
  const backBtn = variantDetailsDiv.querySelector('.back-to-variants-button');
  backBtn.addEventListener('click', () => {
    variantsListDiv.style.display = 'block';
    variantDetailsDiv.style.display = 'none';
    variantDetailsDiv.innerHTML = '';
  });
}

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
                const imageHtml = formula.image
                  ? `<img class="formula-image" src="${formula.image}" alt="${displayName}">`
                  : `<div class="formula-image-placeholder"></div>`;

                return `
                  <li class="element">
                    <div class="element-content formula-item">
                      ${imageHtml}
                      <div class="formula-text">
                        <span class="formula-name">${displayName}</span>
                        <span class="formula-variant-count">${variantCount} вариантов</span>
                      </div>
                      <div class="formula-actions">
                        <button class="formula-view-button view-button" data-id="${formula.id}" title="Варианты"></button>
                        <button class="formula-delete-button delete-button" data-id="${formula.id}" title="Удалить формулу"></button>
                      </div>
                    </div>
                  </li>
                `;
              }).join('')}
            </ul>
          `
        }
      </div>
    </div>
  `;

  // Кнопка "Новая формула"
  const openBuilderBtn = document.getElementById('open-builder-btn');
  if (openBuilderBtn) {
    openBuilderBtn.addEventListener('click', () => {
      const name = prompt('Введите название новой формулы:');
      if (name && name.trim()) {
        const nameObj = { en: name.trim(), ru: name.trim(), es: name.trim() };
        const newFormula = addFormula(nameObj);
        openVariantModal(newFormula, newFormula.variants[0].variantId, () => {
          renderFormulas(container);
        });
      }
    });
  }

  // Показать варианты в aside 
  document.querySelectorAll('.formula-view-button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const formula = formulas.find(f => f.id === id);
      if (formula) {
        renderVariantsInAside(formula);
      }
    });
  });

  // Удаление формулы
  document.querySelectorAll('.formula-delete-button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const formula = formulas.find(f => f.id === id);
      if (!formula) return;
      const name = formula.name[currentLang] || formula.name.en;
      if (confirm(`Удалить формулу "${name}" и все её варианты?`)) {
        deleteFormula(id);
        const aside = document.querySelector('.detailed-info');
        if (aside) aside.innerHTML = '';
        renderFormulas(container);
      }
    });
  });

  // Сброс aside (если он был скрыт)
  const aside = document.querySelector('.detailed-info');
  if (aside) {
    aside.style.transform = 'translateX(0)';
    aside.style.opacity = '1';
    aside.style.transition = 'none';
  }
}