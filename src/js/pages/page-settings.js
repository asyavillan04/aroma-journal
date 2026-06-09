export function renderSettings(container) {
  container.innerHTML = `
    <div class="settings-page">
      <h2>Настройки</h2>
      <p>Здесь будут настройки языка и темы.</p>
    </div>
  `;
    // Сброс aside 
const aside = document.querySelector('.detailed-info');
if (aside) {
    aside.style.transform = 'translateX(0)';
    aside.style.opacity = '1';
    aside.style.transition = 'none';
}
}