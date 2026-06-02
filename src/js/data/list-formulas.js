const STORAGE_KEY = 'aj_formulas';

function loadFormulas() {   
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
        return JSON.parse(raw);
        } catch {
        console.error('Ошибка парсинга формул');
        }
    }
    return [];
 }

function saveFormulas(formulas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formulas));
}

export function getFormulas() { 
    return loadFormulas()
 }

export function addFormula(formulaName) {
  const formulas = loadFormulas();
  const firstVariant = {
    variantId: crypto?.randomUUID?.() ?? Date.now().toString(),
    created: new Date().toISOString(),
    status: 'draft',
    formulas: [],
    notes: ''
  };
  const newFormula = {
    id: crypto?.randomUUID?.() ?? Date.now().toString(),
    name: formulaName,
    variants: [firstVariant]
  };
  formulas.push(newFormula);
  saveFormulas(formulas);
  return newFormula;
}

export function updateVariant(formulaId, variantId, newData) {
  const formulas = loadFormulas();
  const formula = formulas.find(f => f.id === formulaId);
  
  if (!formula) return null;
  
  const variantIndex = formula.variants.findIndex(v => v.variantId === variantId);
  
  if (variantIndex !== -1) {
    formula.variants[variantIndex] = { ...formula.variants[variantIndex], ...newData };
  } else {
    const newVariant = {
      variantId: crypto?.randomUUID?.() ?? Date.now().toString(),
      created: new Date().toISOString(),
      status: 'draft',
      ...newData
    };
    formula.variants.push(newVariant);
  }
  
  saveFormulas(formulas);
  return formula;
}

export function deleteVariant(formulaId, variantId) {
  let formulas = loadFormulas();
  const formula = formulas.find(f => f.id === formulaId);
  if (!formula) return false; 

  formula.variants = formula.variants.filter(v => v.variantId !== variantId);

  if (formula.variants.length === 0) {
    formulas = formulas.filter(f => f.id !== formulaId);
  } else {

    const index = formulas.findIndex(f => f.id === formulaId);
    if (index !== -1) {
      formulas[index] = formula;
    }
  }

  saveFormulas(formulas);
  return true;
}

export function deleteFormula(formulaId) {
  let formulas = loadFormulas();
  const initialLength = formulas.length;

  formulas = formulas.filter(f => f.id !== formulaId);

  if (formulas.length !== initialLength) {
    saveFormulas(formulas);
    return true;
  }
  return false; 
}