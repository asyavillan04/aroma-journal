const STORAGE_KEY = 'aj_formulas';

function loadFormulas() {   
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const formulas = JSON.parse(raw);
            formulas.forEach(formula => {
                formula.variants.forEach(variant => {
                    if (!variant.measure) variant.measure = 'percent';
                    if (variant.totalAmount === undefined) variant.totalAmount = 100;
                    variant.ingredients.forEach(ing => {
                        if (ing.percent !== undefined && ing.amount === undefined) {
                            ing.amount = ing.percent;
                            delete ing.percent;
                        }
                    });
                });
            });
            return formulas;
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
    return loadFormulas();
}

export function addFormula(nameObject) {
    const formulas = loadFormulas();
    const firstVariant = {
        variantId: crypto?.randomUUID?.() ?? Date.now().toString(),
        created: new Date().toISOString(),
        status: 'draft',
        measure: 'percent',
        totalAmount: 100,
        ingredients: [],
        notes: ''
    };

    const newFormula = {
        id: crypto?.randomUUID?.() ?? Date.now().toString(),
        name: nameObject,
        variants: [firstVariant]
    };

    formulas.push(newFormula);
    saveFormulas(formulas);
    return newFormula;
}

export function updateVariant(formulaId, variantId, newData, callback) {
    const formulas = loadFormulas();
    const formula = formulas.find(f => f.id === formulaId);
    
    if (!formula) return null;
    
    // Если передано имя – обновляем название формулы
    if (newData.name !== undefined) {
        formula.name = newData.name;
        delete newData.name; 
    }
    
    const variantIndex = formula.variants.findIndex(v => v.variantId === variantId);
    
    if (variantIndex !== -1) {
        formula.variants[variantIndex] = { ...formula.variants[variantIndex], ...newData };
    } else {
        const newVariant = {
            variantId: crypto?.randomUUID?.() ?? Date.now().toString(),
            created: new Date().toISOString(),
            status: 'draft',
            measure: 'percent',
            totalAmount: 100,
            ...newData
        };
        formula.variants.push(newVariant);
    }
    
    saveFormulas(formulas);
    if (callback) callback(formula);
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