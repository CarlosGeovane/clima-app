const historyList = document.getElementById("historyList");
const botaoBuscar = document.getElementById("buscarBtn");
const botaoGeo = document.getElementById("geoBtn");
const inputCidade = document.getElementById("cidadeInput");
const resultadoDiv = document.getElementById("resultado");

const apiKey = "96f4fed28977e057f1da7296ada1b56c";
let history = JSON.parse(localStorage.getItem("history")) || [];

botaoBuscar.addEventListener("click", () =>
  buscarClima(inputCidade.value.trim())
);
botaoGeo.addEventListener("click", pegarLocalizacao);

function pegarLocalizacao() {
  if (navigator.geolocation) {
    resultadoDiv.innerHTML = "<p>Solicitando acesso...</p>";
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        buscarClimaPorCoordenadas(pos.coords.latitude, pos.coords.longitude),
      () => (resultadoDiv.innerHTML = "<p>Acesso negado.</p>")
    );
  } else {
    resultadoDiv.innerHTML = "<p>Sem suporte a localização.</p>";
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
  // Injeta o loader apenas quando clica
  resultadoDiv.innerHTML = `
    <div id="loader">
      <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 50px; color: #1e90ff; margin-bottom: 10px;"></i>
      <p>Buscando clima...</p>
    </div>
  `;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      resultadoDiv.innerHTML = "";
      if (data.cod === "404") {
        resultadoDiv.innerHTML = "<p>Cidade não encontrada.</p>";
        return;
      }

      const { temp } = data.main;
      const { description, icon, main } = data.weather[0];
      let faIcon = "fa-sun";
      if (icon.includes("n")) faIcon = "fa-moon";
      else if (main === "Clouds") faIcon = "fa-cloud";
      else if (main === "Rain") faIcon = "fa-cloud-showers-heavy";
      else if (main === "Thunderstorm") faIcon = "fa-bolt";

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
    .catch(() => (resultadoDiv.innerHTML = "<p>Erro na conexão.</p>"));
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
