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