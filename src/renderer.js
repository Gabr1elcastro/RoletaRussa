// Armazena os jogadores
let jogadores = [];
let indiceJogadorAtual = 0;
let camara = [];

// Evento para iniciar o jogo
document.getElementById("start").addEventListener("click", () => {
  // Obtém o nome dos jogadores
  const jogador1 = document.getElementById("player1").value.trim();
  const jogador2 = document.getElementById("player2").value.trim();

  // Verifica se os dois jogadores foram inseridos
  if (!jogador1 || !jogador2) {
    alert("Por favor, insira os nomes dos dois jogadores.");
    return;
  }

  // Inicializa a câmera com 6 posições, todas falsas (vazias)
  jogadores = [jogador1, jogador2];
  indiceJogadorAtual = 0;

  // Inicializa a câmara com 6 posições, todas falsas (vazias)
  camara = Array(6).fill(false);

  // Escolhe aleatoriamente uma posição para a bala
  const posicaoBala = Math.floor(Math.random() * 6);
  camara[posicaoBala] = true;

  // Oculta o formulário e mostra o jogo
  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "block";
  document.getElementById("result").textContent = "";
  document.getElementById("play").disabled = false;

  // Oculta a imagem de morte ao iniciar o jogo
  document.getElementById("deathImage").style.display = "none";
});

// Evento para jogar
document.getElementById("play").addEventListener("click", () => {
  const resultado = document.getElementById("result");

  // Verifica se ainda há tentativas na câmara
  if (camara.length === 0) {
    resultado.textContent = "O jogo terminou. Reinicie para jogar novamente";
    return;
  }

  // Remove a primeira posição da câmara (simulando o gatilho)
  if (camara.shift()) {
    resultado.textContent = `${jogadores[indiceJogadorAtual]} morreu!`;
    document.getElementById("play").disabled = true;

    // Mostrar a imagem quando o jogador morre
    document.getElementById("deathImage").style.display = "block";
  } else {
    resultado.textContent = `${jogadores[indiceJogadorAtual]} sobreviveu!`;
    // Passa a vez para o próximo jogador
    indiceJogadorAtual = (indiceJogadorAtual + 1) % jogadores.length;
  }
});

// Evento para reiniciar o jogo
document.getElementById("reset").addEventListener("click", () => {
  // Mostra o formulário e oculta o jogo
  document.getElementById("setup").style.display = "block";
  document.getElementById("game").style.display = "none";
  document.getElementById("player1").value = "";
  document.getElementById("player2").value = "";
  jogadores = [];
  indiceJogadorAtual = 0;
  camara = [];

  // Oculta a imagem de morte ao reiniciar o jogo
  document.getElementById("deathImage").style.display = "none";

  // Habilita o botão "Jogar" novamente
  document.getElementById("play").disabled = false;
});
