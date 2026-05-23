
const STORAGE_KEY = 'aj_ingredients';

const defaultIngredients = [
  {
    id: 'bergamot',
    name: { en: 'Bergamot', ru: 'Бергамот', es: 'Bergamota' },
    botanicalName: 'Citrus bergamia',
    type: 'essential-oil',
    origin: 'Италия',
    quantity: 0,
    shelfLife: '2025-12-01',
    aromaProfile: 'Цитрусовый, свежий, сладковатый',
    comments: 'Партия от проверенного поставщика',
  },
  {
    id: 'rose-absolute',
    name: { en: 'Rose Absolute', ru: 'Абсолют розы', es: 'Absoluto de rosa' },
    botanicalName: 'Rosa damascena',
    type: 'absolute',
    origin: 'Болгария',
    quantity: 0,
    shelfLife: '2026-06-15',
    aromaProfile: 'Глубокий, цветочный, медовый',
    comments: ''
  },
];

function loadIngredients() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      console.error('Ошибка парсинга данных ингредиентов');
    }
  }

  return [...defaultIngredients];
}

function saveIngredients(ingredients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
}

export function getIngredients() {
  return loadIngredients();
}

export function addIngredient(newIngredient) {
  const ingredients = loadIngredients();
  const ingredientWithId = {
    ...newIngredient,
    id: crypto?.randomUUID?.() ?? Date.now().toString(),
  };
  ingredients.push(ingredientWithId);
  saveIngredients(ingredients);
  return ingredients;
}

export function updateIngredient(id, updatedData) {
  const ingredients = loadIngredients();
  const index = ingredients.findIndex(item => item.id === id);
  if (index !== -1) {
    ingredients[index] = { ...ingredients[index], ...updatedData };
    saveIngredients(ingredients);
    return ingredients;
  }
  return null;
}

export function deleteIngredient(id) {
  let ingredients = loadIngredients();
  ingredients = ingredients.filter(item => item.id !== id);
  saveIngredients(ingredients);
  return ingredients;
}