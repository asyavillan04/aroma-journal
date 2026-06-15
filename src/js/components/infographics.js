import { getIngredients } from '../data/list-ingredients.js'; 

export function renderVariantInfographic(variant, formula) {
  const textContainer = document.querySelector('.variant-text');
  const canvasContainer = document.getElementById('variant-infographic');
  if (!textContainer || !canvasContainer) return;

  const currentLang = document.documentElement.lang || 'en';
  const variantNumber = formula.variants.findIndex(v => v.variantId === variant.variantId) + 1;
  const ingredientsList = variant.ingredients.map(ing => {
    const ingredient = getIngredients().find(i => i.id === ing.ingredientId);
    const name = ingredient ? (ingredient.name[currentLang] || ingredient.name.en) : 'Неизвестный';
    return `${name}: ${ing.percent}%`;
  }).join('<br>');

  textContainer.innerHTML = `
    <h4>Вариант ${variantNumber}</h4>
    <p><strong>Статус:</strong> ${variant.status}</p>
    <p><strong>Ингредиенты:</strong><br>${ingredientsList || 'Нет ингредиентов'}</p>
    <p><strong>Заметки:</strong> ${variant.notes || 'Нет заметок'}</p>
  `;

  const demoWheelData = [
    { label: 'Цитрусовые', value: 28 },
    { label: 'Цветочные', value: 22 },
    { label: 'Древесные', value: 18 },
    { label: 'Шипровые', value: 12 },
    { label: 'Фужерные', value: 10 },
    { label: 'Восточные', value: 10 }
  ];

  drawPerfumeWheel('variant-infographic', demoWheelData);
}


function drawPerfumeWheel(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = '100%';
    canvas.style.maxWidth = '300px';
    canvas.style.height = 'auto';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    let startAngle = -Math.PI / 2;

    const colors = [
        '#F4A261', '#E76F51', '#6B8E23', '#9B59B6',
        '#3498DB', '#E67E22', '#2ECC71', '#F1C40F',
        '#E84393', '#5D6D7E'
    ];

    // Cектора
    data.forEach((item, index) => {
        const angle = (item.value / total) * Math.PI * 2;
        const endAngle = startAngle + angle;
        ctx.beginPath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();

        // Граница
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();

        // Подпись
        const midAngle = startAngle + angle / 2;
        const textRadius = radius * 0.65;
        const x = centerX + Math.cos(midAngle) * textRadius;
        const y = centerY + Math.sin(midAngle) * textRadius;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Segoe UI", sans-serif';
        ctx.fillText(item.label, x - 15, y - 5);

        startAngle = endAngle;
    });


    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
}