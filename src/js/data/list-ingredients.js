const STORAGE_KEY = 'aj_ingredients';

export const NOTE_CATEGORIES = [
  { id: 'citrus', label: 'Цитрусовые' },
  { id: 'floral', label: 'Цветочные' },
  { id: 'woody', label: 'Древесные' },
  { id: 'mineral', label: 'Минеральные' },
  { id: 'musky', label: 'Мускусные' },
  { id: 'spicy', label: 'Пряные' },
  { id: 'fruity', label: 'Фруктовые' },
  { id: 'green', label: 'Зелёные' },
  { id: 'balsamic', label: 'Бальзамические' },
  { id: 'animalic', label: 'Животные' },
  { id: 'aquatic', label: 'Акватические' },
  { id: 'gourmand', label: 'Гурманские' },
  { id: 'amber', label: 'Амбровые' },
  { id: 'leather', label: 'Кожаные' },
  { id: 'smoky', label: 'Дымные' },
  { id: 'abstract', label: 'Абстрактные' }
];

// Базовый объект для профиля (по умолчанию все нули)
const defaultNotesProfile = NOTE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = 0;
  return acc;
}, {});

const defaultIngredients = [
  {
    id: 'bergamot',
    name: { en: 'Bergamot', ru: 'Бергамот', es: 'Bergamota' },
    botanicalName: 'Citrus bergamia',
    type: 'essential-oil',
    origin: 'Италия',
    quantity: 50,
    minStock: 5,               // ← новый порог
    shelfLife: '2025-12-01',
    aromaProfile: 'Цитрусовый, свежий, сладковатый',
    comments: 'Партия от проверенного поставщика',
    notesProfile: { ...defaultNotesProfile, citrus: 8, fruity: 3, green: 2 }
  },
  {
    id: 'rose-absolute',
    name: { en: 'Rose Absolute', ru: 'Абсолют розы', es: 'Absoluto de rosa' },
    botanicalName: 'Rosa damascena',
    type: 'absolute',
    origin: 'Болгария',
    quantity: 5,
    minStock: 1,               // ← новый порог
    shelfLife: '2026-06-15',
    aromaProfile: 'Глубокий, цветочный, медовый',
    comments: '',
    notesProfile: { ...defaultNotesProfile, floral: 9, woody: 2, fruity: 1 }
  },
];

function loadIngredients() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return parsed.map(ing => ({
        ...ing,
        minStock: ing.minStock || 5, // миграция: если нет – 5
        notesProfile: ing.notesProfile || { ...defaultNotesProfile }
      }));
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
    minStock: newIngredient.minStock || 5, // по умолчанию 5
    notesProfile: newIngredient.notesProfile || { ...defaultNotesProfile }
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