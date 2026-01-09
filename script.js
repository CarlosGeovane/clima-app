const historyList = document.getElementById("historyList");
const botaoBuscar = document.getElementById("buscarBtn");
const inputCidade = document.getElementById("cidadeInput");
const resultadoDiv = document.getElementById("resultado");

// Carrega o histórico do LocalStorage
let history = JSON.parse(localStorage.getItem("history")) || [];

botaoBuscar.addEventListener("click", buscarClima);

function buscarClima() {
  const cidade = inputCidade.value.trim();
  if (!cidade) return;

  // --- INÍCIO DO LOADING ---
  // Limpa o resultado anterior e mostra o spinner de carregamento
  resultadoDiv.innerHTML = `
    <div id="loader">
      <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 50px; color: #1e90ff; margin-bottom: 10px;"></i>
      <p>Buscando clima...</p>
    </div>
  `;

  const apiKey = "96f4fed28977e057f1da7296ada1b56c";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      // Remove o loader limpando a div antes de mostrar o resultado
      resultadoDiv.innerHTML = "";

      if (data.cod === "404") {
        resultadoDiv.innerHTML = "<p>Cidade não encontrada. Verifique o nome.</p>";
        return;
      }

      const { temp } = data.main;
      const { description, icon, main } = data.weather[0];

      // Lógica de ícones (Font Awesome)
      let faIcon = "fa-sun";
      if (icon.includes("n")) faIcon = "fa-moon";
      else if (main === "Clouds") faIcon = "fa-cloud";
      else if (main === "Rain") faIcon = "fa-cloud-showers-heavy";
      else if (main === "Drizzle") faIcon = "fa-cloud-rain";
      else if (main === "Thunderstorm") faIcon = "fa-bolt";
      else if (main === "Snow") faIcon = "fa-snowflake";

      // Renderiza o resultado final
      resultadoDiv.innerHTML = `
        <div class="clima-info">
          <h2>${data.name}</h2>
          <i class="fa-solid ${faIcon} clima-icon-fa"></i>
          <p class="temp-text">${Math.round(temp)}°C</p>
          <p class="desc-text">${description}</p>
        </div>
      `;

      salvarHistorico(data.name);
    })
    .catch(() => {
      resultadoDiv.innerHTML = "<p>Erro na conexão com o servidor.</p>";
    });
}

function salvarHistorico(cidade) {
  if (!history.includes(cidade)) {
    history.unshift(cidade);
    if (history.length > 5) history.pop();
    localStorage.setItem("history", JSON.stringify(history));
    renderHistorico();
  }
}

function renderHistorico() {
  historyList.innerHTML = "";
  history.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    li.onclick = () => {
      inputCidade.value = c;
      buscarClima();
    };
    historyList.appendChild(li);
  });
}

// Atalho: Buscar ao apertar Enter
inputCidade.addEventListener("keypress", (e) => {
  if (e.key === "Enter") buscarClima();
});

// Inicializa o histórico na tela
renderHistorico();