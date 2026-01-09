const historyList = document.getElementById("historyList");
let history = JSON.parse(localStorage.getItem("history")) || [];

const apiKey = "96f4fed28977e057f1da7296ada1b56c";

const botaoBuscar = document.getElementById("buscarBtn");
const inputCidade = document.getElementById("cidadeInput");
const resultadoDiv = document.getElementById("resultado");

botaoBuscar.addEventListener("click", buscarClima);

function buscarClima() {
  const cidade = inputCidade.value;

  if (cidade === "") {
    resultadoDiv.innerHTML = "<p>Digite o nome de uma cidade.</p>";
    return;
  }

  salvarHistorico(cidade);

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.cod === 401) {
        resultadoDiv.innerHTML = "<p>Erro de autenticação com a API.</p>";
        return;
      }

      if (data.cod === "404") {
        resultadoDiv.innerHTML = "<p>Cidade não encontrada.</p>";
        return;
      }

      const temperatura = data.main.temp;
      const descricao = data.weather[0].description;
      const nomeCidade = data.name;

      resultadoDiv.innerHTML = `
                <h2>${nomeCidade}</h2>
                <p>Temperatura: ${temperatura} °C</p>
                <p>Clima: ${descricao}</p>
            `;
    })
    .catch(() => {
      resultadoDiv.innerHTML = "<p>Erro ao buscar clima.</p>";
    });
}

function salvarHistorico(cidade) {
  if (history.includes(cidade)) return;

  history.unshift(cidade);

  if (history.length > 5) {
    history.pop();
  }

  localStorage.setItem("history", JSON.stringify(history));
  renderHistorico();
}

function renderHistorico() {
  historyList.innerHTML = "";

  history.forEach((cidade) => {
    const li = document.createElement("li");
    li.textContent = cidade;

    li.addEventListener("click", () => {
      inputCidade.value = cidade;
      buscarClima();
    });

    historyList.appendChild(li);
  });
}

// Carrega histórico ao iniciar
renderHistorico();
