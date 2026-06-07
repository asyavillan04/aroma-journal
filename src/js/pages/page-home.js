export function renderHome(container) {

  const introKey = 'aj-intro-shown';
  const introShown = sessionStorage.getItem(introKey);

  container.innerHTML = `
    <div class="home-page page">
      <h2 class="typing-title">Добро пожаловать в <span> Aroma Journal </span> </h2>
      <div class="typing-line"></div>

      <p class="subtitle-hidden">Ваш личный органайзер парфюмерии. </p>

      <div class="home-content journal-content">
        <section class="element home-element maturated-soon">
          <h3>Созревания: </h3> 
          <div class="element-content">
            Нет ближайших созреваний
          </div>
        </section>

        <section class="element home-element ingredients-run-out">
            <h3>Заканчивается:</h3>
            <div class="element-content">
              Нет ингредиентов, которые заканчиваются
            </div>
        </section>

          <section class="element home-element ingridients-palette">
            <h3>Парфюмерная палитра:</h3> 
            <div class="element-content">
              Пусто
            </div>
        </section>

      </div>
    </div>
  `;
}