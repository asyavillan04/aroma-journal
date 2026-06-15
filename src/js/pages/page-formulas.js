import { getFormulas, addFormula, deleteFormula, updateVariant } from '../data/list-formulas.js';
import { renderVariantInfographic } from '../components/infographics.js';
import { getIngredients } from '../data/list-ingredients.js';

// Вспомогательная функция для работы с ингредиентами
function setupIngredientHandlers(aside, ingredientsCopy, onIngredientsChange) {
  const currentLang = document.documentElement.lang || 'en';
  const searchInput = aside.querySelector('.js-variant-search');
  const select = aside.querySelector('.js-variant-select');
  const addBtn = aside.querySelector('.js-variant-add-btn');
  const ingredientsList = aside.querySelector('.js-variant-ingredients-list');
  const allIngredients = getIngredients();

  function updateSelect(filter = '') {
    const filtered = allIngredients.filter(ing =>
      Object.values(ing.name).some(n => n.toLowerCase().includes(filter.toLowerCase()))
    );
    select.innerHTML = filtered.map(ing => {
      const name = ing.name[currentLang] || ing.name.en;
      return `<option value="${ing.id}">${name}</option>`;
    }).join('');
  }
  updateSelect();
  searchInput.addEventListener('input', () => updateSelect(searchInput.value));

  addBtn.addEventListener('click', () => {
    const selectedId = select.value;
    if (!selectedId) return;
    if (ingredientsCopy.some(ing => ing.ingredientId === selectedId)) {
      alert('Этот ингредиент уже в списке');
      return;
    }
    ingredientsCopy.push({ ingredientId: selectedId, percent: 0 });
    const ingName = allIngredients.find(i => i.id === selectedId)?.name[currentLang] || selectedId;
    const newItem = document.createElement('li');
    newItem.innerHTML = `
      ${ingName} — <input type="number" class="js-percent" data-id="${selectedId}" value="0" min="0" max="100" step="0.1">%
      <button class="js-remove-ingredient" data-id="${selectedId}">×</button>
    `;
    ingredientsList.appendChild(newItem);
    if (onIngredientsChange) onIngredientsChange(ingredientsCopy);
  });

  ingredientsList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.js-remove-ingredient');
    if (!removeBtn) return;
    const id = removeBtn.dataset.id;
    const index = ingredientsCopy.findIndex(ing => ing.ingredientId === id);
    if (index !== -1) ingredientsCopy.splice(index, 1);
    removeBtn.closest('li').remove();
    if (onIngredientsChange) onIngredientsChange(ingredientsCopy);
  });

  ingredientsList.addEventListener('change', (e) => {
    const input = e.target.closest('.js-percent');
    if (!input) return;
    const ingId = input.dataset.id;
    const ing = ingredientsCopy.find(i => i.ingredientId === ingId);
    if (ing) ing.percent = parseFloat(input.value) || 0;
    if (onIngredientsChange) onIngredientsChange(ingredientsCopy);
  });
}

// Создание формулы с первым вариантом
function renderFormulaFormInAside(onSave) {
  const aside = document.querySelector('.detailed-info');
  if (!aside) return;

  let ingredientsCopy = [];
  let notesInitial = '';

  aside.innerHTML = `
    <div class="aside-form variant-form new-formula-form">
      <div class="form-header">
        <button class="back-button">← Назад</button>
        <h3>Новая формула</h3>
      </div>
      <label>Название формулы: <input type="text" id="new-formula-name" placeholder="Например: Летний бриз"></label>

      <div class="variant-add-ingredient">
        <input type="text" class="js-variant-search" placeholder="Поиск ингредиента...">
        <select class="js-variant-select" size="4"></select>
        <button class="js-variant-add-btn">Добавить</button>
      </div>

      <ul class="js-variant-ingredients-list"></ul>

      <label>Заметки: <textarea class="js-variant-notes">${notesInitial}</textarea></label>

      <div class="form-actions">
        <button class="js-form-save">Сохранить формулу</button>
        <button class="js-form-cancel">Отмена</button>
      </div>
    </div>
  `;

  setupIngredientHandlers(aside, ingredientsCopy);

  const notesTextarea = aside.querySelector('.js-variant-notes');

  const cancelBtn = aside.querySelector('.js-form-cancel');
  const backBtn = aside.querySelector('.back-button');
  const returnToPrevious = () => {
    const container = document.querySelector('.journal-content')?.closest('.formulas-page')?.parentElement;
    if (container) renderFormulas(container);
    else aside.innerHTML = '';
  };
  cancelBtn.addEventListener('click', returnToPrevious);
  backBtn.addEventListener('click', returnToPrevious);

  const saveBtn = aside.querySelector('.js-form-save');
  saveBtn.addEventListener('click', () => {
    const formulaName = aside.querySelector('#new-formula-name').value.trim();
    if (!formulaName) {
      alert('Введите название формулы');
      return;
    }
    const nameObj = { en: formulaName, ru: formulaName, es: formulaName };
    const newFormula = addFormula(nameObj);
    const notes = notesTextarea.value;
    const variantData = {
      ingredients: ingredientsCopy,
      notes: notes,
      status: 'draft'
    };
    const updatedFormula = updateVariant(newFormula.id, null, variantData);
    if (onSave) onSave(updatedFormula);
    else returnToPrevious();
  });
}

// Показывает варианты формулы в aside (первый уровень)
function renderVariantsInAside(formula) {
  const aside = document.querySelector('.detailed-info');
  if (!aside) {
    console.warn('Элемент .detailed-info не найден');
    return;
  }

  const currentLang = document.documentElement.lang || 'en';
  const displayName = formula.name[currentLang] || formula.name.en;

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
                  <div class="variant-actions">
                    <button class="edit-button" data-formula-id="${formula.id}" data-variant-id="${v.variantId}" title="Редактировать вариант"></button>
                    <button class="view-button variant-view-button" data-formula-id="${formula.id}" data-variant-id="${v.variantId}" title="Просмотр инфографики"></button>
                  </div>
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

  // Обработчики для кнопок редактирования варианта
  aside.querySelectorAll('.edit-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const fid = btn.dataset.formulaId;
      const vid = btn.dataset.variantId;
      const f = getFormulas().find(f => f.id === fid);
      if (f) {
        renderVariantFormInAside(f, vid, (updatedFormula) => {
          renderVariantsInAside(updatedFormula);
        });
      }
    });
  });

  // Обработчик для добавления нового варианта
  const addVariantBtn = aside.querySelector('.add-variant-button');
  if (addVariantBtn) {
    addVariantBtn.addEventListener('click', () => {
      const fid = addVariantBtn.dataset.formulaId;
      const f = getFormulas().find(f => f.id === fid);
      if (f) {
        renderVariantFormInAside(f, null, (updatedFormula) => {
          renderVariantsInAside(updatedFormula);
        });
      }
    });
  }
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
      <div class="element-content variant-content">
        <div class="variant-text"></div>
        <div id="variant-infographic"></div>
      </div>
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

  // Кнопка Новая формула
  const openBuilderBtn = document.getElementById('open-builder-btn');
  if (openBuilderBtn) {
    openBuilderBtn.addEventListener('click', () => {
      renderFormulaFormInAside((newFormula) => {
        renderVariantsInAside(newFormula);
      });
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

// Рендерит форму добавления/редактирования варианта в aside
function renderVariantFormInAside(formula, variantId, onSave) {
  const aside = document.querySelector('.detailed-info');
  if (!aside) return;

  const currentLang = document.documentElement.lang || 'en';
  const existingVariant = variantId
    ? formula.variants.find(v => v.variantId === variantId)
    : null;

  let ingredientsCopy = existingVariant
    ? existingVariant.ingredients.map(ing => ({ ...ing }))
    : [];
  let notesInitial = existingVariant ? existingVariant.notes : '';

  aside.innerHTML = `
    <div class="aside-form variant-form">
      <div class="form-header">
        <button class="back-to-variants-button">← Назад</button>
        <h3>${existingVariant ? 'Редактировать вариант' : 'Новый вариант'}</h3>
      </div>
      <div class="formula-name"><strong>${formula.name[currentLang] || formula.name.en}</strong></div>

      <div class="variant-add-ingredient">
        <input type="text" class="js-variant-search" placeholder="Поиск ингредиента...">
        <select class="js-variant-select" size="4"></select>
        <button class="js-variant-add-btn">Добавить</button>
      </div>

      <ul class="js-variant-ingredients-list">
        ${ingredientsCopy.map(ing => {
          const ingredient = getIngredients().find(i => i.id === ing.ingredientId);
          const ingName = ingredient ? (ingredient.name[currentLang] || ingredient.name.en) : 'Неизвестный';
          return `
            <li>
              ${ingName} — <input type="number" class="js-percent" data-id="${ing.ingredientId}" value="${ing.percent}" min="0" max="100" step="0.1">%
              <button class="js-remove-ingredient" data-id="${ing.ingredientId}">×</button>
            </li>
          `;
        }).join('')}
      </ul>

      <label>Заметки: <textarea class="js-variant-notes">${notesInitial}</textarea></label>

      <div class="form-actions">
        <button class="js-form-save">Сохранить</button>
        <button class="js-form-cancel">Отмена</button>
      </div>
    </div>
  `;

  const searchInput = aside.querySelector('.js-variant-search');
  const select = aside.querySelector('.js-variant-select');
  const addBtn = aside.querySelector('.js-variant-add-btn');
  const ingredientsList = aside.querySelector('.js-variant-ingredients-list');
  const notesTextarea = aside.querySelector('.js-variant-notes');
  const allIngredients = getIngredients();

  function updateSelect(filter = '') {
    const filtered = allIngredients.filter(ing =>
      Object.values(ing.name).some(n => n.toLowerCase().includes(filter.toLowerCase()))
    );
    select.innerHTML = filtered.map(ing => {
      const name = ing.name[currentLang] || ing.name.en;
      return `<option value="${ing.id}">${name}</option>`;
    }).join('');
  }
  updateSelect();
  searchInput.addEventListener('input', () => updateSelect(searchInput.value));

  addBtn.addEventListener('click', () => {
    const selectedId = select.value;
    if (!selectedId) return;
    if (ingredientsCopy.some(ing => ing.ingredientId === selectedId)) {
      alert('Этот ингредиент уже в списке');
      return;
    }
    ingredientsCopy.push({ ingredientId: selectedId, percent: 0 });
    const ingName = allIngredients.find(i => i.id === selectedId)?.name[currentLang] || selectedId;
    const newItem = document.createElement('li');
    newItem.innerHTML = `
      ${ingName} — <input type="number" class="js-percent" data-id="${selectedId}" value="0" min="0" max="100" step="0.1">%
      <button class="js-remove-ingredient" data-id="${selectedId}">×</button>
    `;
    ingredientsList.appendChild(newItem);
  });

  ingredientsList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.js-remove-ingredient');
    if (!removeBtn) return;
    const id = removeBtn.dataset.id;
    const index = ingredientsCopy.findIndex(ing => ing.ingredientId === id);
    if (index !== -1) ingredientsCopy.splice(index, 1);
    removeBtn.closest('li').remove();
  });

  ingredientsList.addEventListener('change', (e) => {
    const input = e.target.closest('.js-percent');
    if (!input) return;
    const ingId = input.dataset.id;
    const ing = ingredientsCopy.find(i => i.ingredientId === ingId);
    if (ing) ing.percent = parseFloat(input.value) || 0;
  });

  const cancelBtn = aside.querySelector('.js-form-cancel');
  const backBtn = aside.querySelector('.back-to-variants-button');
  const returnToList = () => {
    renderVariantsInAside(formula);
  };
  cancelBtn.addEventListener('click', returnToList);
  backBtn.addEventListener('click', returnToList);

  const saveBtn = aside.querySelector('.js-form-save');
  saveBtn.addEventListener('click', () => {
    const percentInputs = ingredientsList.querySelectorAll('.js-percent');
    percentInputs.forEach(input => {
      const ingId = input.dataset.id;
      const ing = ingredientsCopy.find(i => i.ingredientId === ingId);
      if (ing) ing.percent = parseFloat(input.value) || 0;
    });
    const notes = notesTextarea.value;

    const variantData = {
      ingredients: ingredientsCopy,
      notes: notes,
      status: existingVariant ? existingVariant.status : 'draft'
    };

    const updatedFormula = updateVariant(formula.id, variantId, variantData);
    if (onSave) onSave(updatedFormula);
    else returnToList();
  });
}