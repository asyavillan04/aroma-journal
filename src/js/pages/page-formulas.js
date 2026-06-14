import { getFormulas, addFormula, deleteFormula } from '../data/list-formulas.js';
import { openVariantModal } from '../components/variant-modal.js';

// Показывает варианты формулы в aside
function renderVariantsInAside(formula) {
  const aside = document.querySelector('.detailed-info');
  if (!aside) return;

  const currentLang = document.documentElement.lang || 'en';
  const displayName = formula.name[currentLang] || formula.name.en;

  aside.innerHTML = `
    <div class="aside-formula-details">
      <h3>${displayName}</h3>
      <div class="aside-formula-variants">
        ${formula.variants.length === 0
          ? '<p>Нет вариантов</p>'
          : formula.variants.map((v, idx) => `
              <div class="aside-variant-item">
                <span>Вариант ${idx + 1} — ${v.status}</span>
                <button class="view-button variant-view-button" data-formula-id="${formula.id}" data-variant-id="${v.variantId}" title="Просмотр инфографики"></button>
              </div>
            `).join('')
        }
      </div>
      <button class="add-button add-variant-button" data-formula-id="${formula.id}">+ Новый вариант</button>
      <div id="variant-infographic"></div>
    </div>
  `;

  // Обработчики для кнопок просмотра
  aside.querySelectorAll('.variant-view-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const fid = btn.dataset.formulaId;
      const vid = btn.dataset.variantId;
      const f = getFormulas().find(f => f.id === fid);
      if (f) {
        const variant = f.variants.find(v => v.variantId === vid);
        if (variant) {
          renderVariantInfographic(variant, f);
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

// Заглушка для инфографики
function renderVariantInfographic(variant, formula) {
  const container = document.getElementById('variant-infographic');
  if (!container) return;

  const currentLang = document.documentElement.lang || 'en';
  const variantNumber = formula.variants.findIndex(v => v.variantId === variant.variantId) + 1;
  const ingredientsList = variant.ingredients.map(ing => {
    const ingredient = getIngredients().find(i => i.id === ing.ingredientId);
    const name = ingredient ? (ingredient.name[currentLang] || ingredient.name.en) : 'Неизвестный';
    return `${name}: ${ing.percent}%`;
  }).join('<br>');

  container.innerHTML = `
    <div class="infographic-placeholder">
      <h4>Вариант ${variantNumber}</h4>
      <p><strong>Статус:</strong> ${variant.status}</p>
      <p><strong>Ингредиенты:</strong><br>${ingredientsList || 'Нет ингредиентов'}</p>
      <p><strong>Заметки:</strong> ${variant.notes || 'Нет заметок'}</p>
      <p><em>Инфографика появится здесь позже</em></p>
    </div>
  `;
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

  // Кнопка "Новая формула" – ввод имени и создание
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

  // Кнопка "Варианты" – показать в aside
  document.querySelectorAll('.formula-view-button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const formula = formulas.find(f => f.id === id);
      if (formula) renderVariantsInAside(formula);
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
        // Очищаем aside, если удаляемая формула была в нём
        const aside = document.querySelector('.detailed-info');
        if (aside) aside.innerHTML = '';
        renderFormulas(container);
      }
    });
  });

  // Сброс aside в видимое состояние
  const aside = document.querySelector('.detailed-info');
  if (aside) {
    aside.style.transform = 'translateX(0)';
    aside.style.opacity = '1';
    aside.style.transition = 'none';
  }
}