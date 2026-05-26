export function renderHome(container) {
  container.innerHTML = `
    <div class="home-page page">
      <h2>Добро пожаловать в <span> Aroma Journal </span> </h2>
      <p>Ваш личный органайзер парфюмерии. </p>

      <div class="home-content journal-content">
        <div class="element maturated-soon">
          <span>Созревания: </span> Нет ближайших созреваний
        </div>

        <div class="element home-element ingridients-run-out">
            <span>Заканчивается:</span>Нет ингридиентов, которые заканчиваются
        </div>

          <div class="element home-element ingridients-palette">
            <span>Парфюмерная палитра:</span> Пусто
        </div>

      </div>
    </div>
  `;
}