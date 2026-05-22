export function renderHome(container) {
  container.innerHTML = `
    <div class="home-page page">
      <h2>Welcome to Aroma Journal</h2>
      <p>Your personal perfume organiser.</p>

      <div class="journal-content">
        <div class="element maturated-soon">
          <span>Созревания: </span> Нет ближайших созреваний
        </div>

        <div class="element ingridients-run-out">
            <span>Заканчивается:</span>Нет ингридиентов, которые заканчиваются
        </div>

          <div class="element ingridients-palette">
            <span>Парфюмерная палитра:</span> Пусто
        </div>

      </div>
    </div>
  `;
}