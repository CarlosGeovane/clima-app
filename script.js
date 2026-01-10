const historyList = document.getElementById("historyList");
const botaoBuscar = document.getElementById("buscarBtn");
const botaoGeo = document.getElementById("geoBtn");
const inputCidade = document.getElementById("cidadeInput");
const resultadoDiv = document.getElementById("resultado");
const unitCheckbox = document.getElementById("unit-checkbox");
const themeToggle = document.getElementById("theme-toggle");

const apiKey = "96f4fed28977e057f1da7296ada1b56c";
let history = JSON.parse(localStorage.getItem("history")) || [];
let currentTempCelsius = null;

// TEMA
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  themeToggle.innerHTML = isLight
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem("theme", isLight ? "light" : "dark");
});

// Carregar tema salvo
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-mode");
  themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

// EVENTOS DE BUSCA
botaoBuscar.addEventListener("click", () =>
  buscarClima(inputCidade.value.trim())
);
botaoGeo.addEventListener("click", pegarLocalizacao);
unitCheckbox.addEventListener("change", atualizarDisplayTemperatura);

function pegarLocalizacao() {
  if (navigator.geolocation) {
    resultadoDiv.innerHTML = "<p>Localizando...</p>";
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
      currentTempCelsius = data.main.temp;
      renderizarClima(data);
      salvarHistorico(data.name);
    })
    .catch(() => (resultadoDiv.innerHTML = "<p>Erro na conexão.</p>"));
}

function renderizarClima(data) {
  const { description, icon, main } = data.weather[0];
  const unitLabel = unitCheckbox.checked ? "°F" : "°C";
  const displayTemp = Math.round(
    unitCheckbox.checked
      ? (currentTempCelsius * 9) / 5 + 32
      : currentTempCelsius
  );

  let faIcon = "fa-sun";
  if (icon.includes("n")) faIcon = "fa-moon";
  else if (main === "Clouds") faIcon = "fa-cloud";
  else if (main === "Rain") faIcon = "fa-cloud-showers-heavy";

  resultadoDiv.innerHTML = `
    <div class="clima-info">
      <h2>${data.name}</h2>
      <i class="fa-solid ${faIcon} clima-icon-fa"></i>
      <p class="temp-text">${displayTemp}${unitLabel}</p>
      <p class="desc-text">${description}</p>
    </div>
  `;
}

function atualizarDisplayTemperatura() {
  if (currentTempCelsius !== null) {
    const unitLabel = unitCheckbox.checked ? "°F" : "°C";
    const displayTemp = Math.round(
      unitCheckbox.checked
        ? (currentTempCelsius * 9) / 5 + 32
        : currentTempCelsius
    );
    document.querySelector(
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
