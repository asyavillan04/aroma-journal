export function renderMaceration(container) {
  container.innerHTML = `
    <div class="maceration-page page">
      <div class="mac-head page-head">
      <h2>Мацерация</h2>
      <button class="add-button ingridient-add-button">Новая мацерация</button>
      </div>
      <p>Отслеживайте созревание своего парфюма</p>
    </div>

    
  `;

  // Сбрасываем aside в видимое состояние (на случай, если он был скрыт)
const aside = document.querySelector('.detailed-info');
if (aside) {
    aside.style.transform = 'translateX(0)';
    aside.style.opacity = '1';
    aside.style.transition = 'none';
}
}