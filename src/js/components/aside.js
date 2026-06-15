export function initMobileAside() {
    const aside = document.querySelector('.detailed-info');
    if (!aside) return;

    // Добавляем кнопку закрытия в aside 
    if (!aside.querySelector('.close-aside-btn')) {
        const closeBtn = document.createElement('div');
        closeBtn.className = 'close-aside-btn';
        closeBtn.innerHTML = '←'; // или &larr;
        closeBtn.setAttribute('aria-label', 'Закрыть');
        // Вставляем в начало aside
        aside.insertBefore(closeBtn, aside.firstChild);
        closeBtn.addEventListener('click', () => {
            aside.classList.remove('open');
        });
    }

    // Закрытие при клике вне aside на мобильных
    document.body.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && aside.classList.contains('open')) {
            if (!aside.contains(e.target) && !e.target.closest('.formula-view-button') && !e.target.closest('.edit-button')) {
                aside.classList.remove('open');
            }
        }
    });
}

// Функция открытия aside
export function openMobileAside() {
    const aside = document.querySelector('.detailed-info');
    if (window.innerWidth <= 768 && aside) {
        aside.classList.add('open');
    }
}
