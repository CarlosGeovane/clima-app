const historyList = document.getElementById("historyList");
const botaoBuscar = document.getElementById("buscarBtn");
const botaoGeo = document.getElementById("geoBtn");
const inputCidade = document.getElementById("cidadeInput");
const resultadoDiv = document.getElementById("resultado");
const unitCheckbox = document.getElementById("unit-checkbox");

const apiKey = "96f4fed28977e057f1da7296ada1b56c";
let history = JSON.parse(localStorage.getItem("history")) || [];
let currentTempCelsius = null; // Guarda a temperatura atual

// Eventos
botaoBuscar.addEventListener("click", () =>
  buscarClima(inputCidade.value.trim())
);
botaoGeo.addEventListener("click", pegarLocalizacao);
unitCheckbox.addEventListener("change", atualizarDisplayTemperatura);

function pegarLocalizacao() {
  if (navigator.geolocation) {
    resultadoDiv.innerHTML = "<p>Solicitando acesso...</p>";
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        buscarClimaPorCoordenadas(pos.coords.latitude, pos.coords.longitude),
      () => (resultadoDiv.innerHTML = "<p>Acesso negado.</p>")
    );
  }
}

function buscarClimaPorCoordenadas(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
  executarFetch(url);
}

function buscarClima(cidade) {
  if (!cidade) return;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
  executarFetch(url);
}

function executarFetch(url) {
  resultadoDiv.innerHTML = `<div id="loader"><i class="fa-solid fa-circle-notch fa-spin" style="font-size: 50px; color: #1e90ff;"></i></div>`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.cod === "404") {
        resultadoDiv.innerHTML = "<p>Cidade não encontrada.</p>";
        return;
      }
      // Salva os dados globais
      currentTempCelsius = data.main.temp;
      renderizarClima(data);
      salvarHistorico(data.name);
    })
    .catch(() => (resultadoDiv.innerHTML = "<p>Erro na conexão.</p>"));
}

function renderizarClima(data) {
  const { description, icon, main } = data.weather[0];
  const displayTemp = converterTemp(currentTempCelsius);
  const unitLabel = unitCheckbox.checked ? "°F" : "°C";

  let faIcon = "fa-sun";
  if (icon.includes("n")) faIcon = "fa-moon";
  else if (main === "Clouds") faIcon = "fa-cloud";
  else if (main === "Rain") faIcon = "fa-cloud-showers-heavy";

  resultadoDiv.innerHTML = `
    <div class="clima-info">
      <h2>${data.name}</h2>
      <i class="fa-solid ${faIcon} clima-icon-fa"></i>
      <p class="temp-text">${Math.round(displayTemp)}${unitLabel}</p>
      <p class="desc-text">${description}</p>
    </div>
  `;

  // Atualiza as cores do toggle
  document
    .getElementById("unit-c")
    .classList.toggle("active", !unitCheckbox.checked);
  document
    .getElementById("unit-f")
    .classList.toggle("active", unitCheckbox.checked);
}

function converterTemp(celsius) {
  if (unitCheckbox.checked) {
    return (celsius * 9) / 5 + 32; // Celsius para Fahrenheit
  }
  return celsius;
}

function atualizarDisplayTemperatura() {
  if (currentTempCelsius !== null) {
    // Se já tem uma busca feita, apenas re-renderiza com a nova unidade
    const nomeCidade = resultadoDiv.querySelector("h2").innerText;
    // Buscamos novamente para atualizar o DOM sem novo fetch
    const desc = resultadoDiv.querySelector(".desc-text").innerText;
    const unitLabel = unitCheckbox.checked ? "°F" : "°C";
    const displayTemp = Math.round(converterTemp(currentTempCelsius));

    resultadoDiv.querySelector(
      ".temp-text"
    ).innerText = `${displayTemp}${unitLabel}`;
    document
      .getElementById("unit-c")
      .classList.toggle("active", !unitCheckbox.checked);
    document
      .getElementById("unit-f")
      .classList.toggle("active", unitCheckbox.checked);
  }
}

// Histórico e Enter (mantidos iguais)
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
  history.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = c;
    li.onclick = () => {
      inputCidade.value = c;
      buscarClima(c);
    };
    historyList.appendChild(li);
  });
}

inputCidade.addEventListener("keypress", (e) => {
  if (e.key === "Enter") buscarClima(inputCidade.value.trim());
});
renderHistorico();
