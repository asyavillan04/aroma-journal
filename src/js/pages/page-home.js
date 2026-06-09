export function renderHome(container) {
  const introShown = sessionStorage.getItem('aj-intro-shown');

  container.innerHTML = `
    <div class="home-page page">
      <h2 class="typing-title"> </h2>
      <div class="typing-line"></div>
      <p class="subtitle-hidden">Ваш личный органайзер парфюмерии.</p>
      <div class="home-content journal-content">
        <section class="element home-element maturated-soon card-item--left">
          <h3>Созревания:</h3>
          <div class="element-content">Нет ближайших созреваний</div>
        </section>
        <section class="element home-element ingredients-run-out card-item--left">
          <h3>Заканчивается:</h3>
          <div class="element-content">Нет ингредиентов, которые заканчиваются</div>
        </section>
        <section class="element home-element ingridients-palette card-item--left">
          <h3>Парфюмерная палитра:</h3>
          <div class="element-content">Пусто</div>
        </section>
      </div>
    </div>
  `;

    // Сброс aside 
const aside = document.querySelector('.detailed-info');
if (aside) {
    aside.style.transform = 'translateX(0)';
    aside.style.opacity = '1';
    aside.style.transition = 'none';
}

  if (introShown) {
    // Сбрасываем 
    const animatedElements = container.querySelectorAll('.home-element, .subtitle-hidden, .typing-line');
    animatedElements.forEach(el => {
      el.style.transform = 'none';
      el.style.opacity = '1';
      el.style.transition = 'none';
    });

    const typingLine = container.querySelector('.typing-line');
    if (typingLine) {
        typingLine.style.width = '100%';
        typingLine.style.opacity = '1';
        typingLine.style.transition = 'none';
    }

    const aside = document.querySelector('.detailed-info');
    if (aside) {
      aside.style.transform = 'translateX(0)';
      aside.style.opacity = '1';
      aside.style.transition = 'none';
    }

    const title = container.querySelector('.typing-title');
    if (title) {
      title.textContent = 'Добро пожаловать в Aroma Journal';
    }
    return;
  }

  // Анимация 
  const typingTitle = container.querySelector('.typing-title');
  const typingLine = container.querySelector('.typing-line');
  const subtitle = container.querySelector('.subtitle-hidden');
  const cards = container.querySelectorAll('.card-item--left');

  const fullText = 'Добро пожаловать в Aroma Journal';
  typingTitle.textContent = '';
  let charIndex = 0;
  const typeInterval = setInterval(() => {
    typingTitle.textContent += fullText[charIndex];
    charIndex++;
    if (charIndex === fullText.length) {
      clearInterval(typeInterval);
      typingLine.classList.add('visible');

      setTimeout(() => {
        subtitle.classList.add('animate');
        cards.forEach((card, i) => {
          card.style.transitionDelay = `${i * 0.15}s`;
          card.classList.add('animate');
        });
        const aside = document.querySelector('.detailed-info');
        if (aside) aside.classList.add('animate-right');
      }, 200);

      setTimeout(() => {
        sessionStorage.setItem('aj-intro-shown', 'true');
      }, 1200);
    }
  }, 40);
}