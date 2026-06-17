import { initRouter } from './router.js';

function bindNavigation() {
  document.querySelectorAll('[data-hash]').forEach(button => {
    button.addEventListener('click', () => {
      window.location.hash = button.dataset.hash;
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    bindNavigation();
  });
} else {
  initRouter();
  bindNavigation();
}

document.getElementById('test-api-btn')?.addEventListener('click', () => {
  console.log('Кнопка нажата!');
  fetch('http://localhost:5000/api/calculate')
    .then(r => {
      console.log('Статус ответа:', r.status);
      return r.json();
    })
    .then(data => console.log('Данные:', data))
    .catch(err => console.error('Ошибка fetch:', err));
});