// --- Elementos do Jogo ---
const cellElements = document.querySelectorAll('[data-cell]');
const board = document.getElementById('game-board');
const statusMessage = document.getElementById('status-message');
const restartButton = document.getElementById('restart-button');
const vsPlayerButton = document.getElementById('vs-player');
const vsComputerButton = document.getElementById('vs-computer');
const resetScoreButton = document.getElementById('reset-score-button');

// --- Elementos do Placar ---
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');
const player1NameDisplay = document.getElementById('player1-name');
const player2NameDisplay = document.getElementById('player2-name');

// --- Elementos da Configuração Inicial ---
const playerSetup = document.getElementById('player-setup');
const gameContainer = document.getElementById('game-container');
const startGameButton = document.getElementById('start-game-button');
const player1Input = document.getElementById('player1');
const player2Input = document.getElementById('player2');

// --- Novos Elementos Adicionados ---
const homeButton = document.getElementById('home-button');
const winSound = document.getElementById('win-sound');


const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// --- Variáveis de Estado do Jogo ---
let isOTurn;
let gameActive;
let isVsComputer;
let playerNames = { x: "Jogador 1", o: "Jogador 2" };
let scores = { x: 0, o: 0 };

// --- Lógica Principal ---

loadScores();

// Event Listeners
startGameButton.addEventListener('click', initializeGame);
vsPlayerButton.addEventListener('click', () => startGame(false));
vsComputerButton.addEventListener('click', () => {
    playerNames.o = "Máquina";
    player2NameDisplay.innerText = playerNames.o;
    startGame(true);
});
restartButton.addEventListener('click', () => startGame(isVsComputer));
resetScoreButton.addEventListener('click', resetScores);
homeButton.addEventListener('click', returnToHome); // <-- Listener para o botão de início

// --- Funções ---

function initializeGame() {
    const p1Name = player1Input.value.trim() || "Jogador 1";
    const p2Name = player2Input.value.trim() || "Jogador 2";

    playerNames.x = p1Name;
    playerNames.o = p2Name;

    player1NameDisplay.innerText = playerNames.x;
    player2NameDisplay.innerText = playerNames.o;

    playerSetup.classList.add('hidden');
    gameContainer.classList.remove('hidden');

    startGame(false);
}

function startGame(vsComputer) {
    homeButton.classList.add('hidden'); // Esconde o botão de início ao começar uma partida
    isVsComputer = vsComputer;
    gameActive = true;
    isOTurn = false;
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('winning-cell');
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    setStatusMessage(`É a vez de ${playerNames.x} (X)`);
}

function handleClick(e) {
    if (!gameActive) return;
    const cell = e.target;
    const currentClass = isOTurn ? O_CLASS : X_CLASS;
    
    placeMark(cell, currentClass);

    const winningCombination = checkWin(currentClass);
    if (winningCombination) {
        endGame(false, winningCombination);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        if (isVsComputer && isOTurn && gameActive) {
            setTimeout(computerMove, 500);
        }
    }
}

function computerMove() {
    const availableCells = [...cellElements].filter(cell => !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS));
    if (availableCells.length > 0) {
        const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        placeMark(randomCell, O_CLASS);
        const winningCombination = checkWin(O_CLASS);
        if (winningCombination) {
            endGame(false, winningCombination);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapTurns();
        }
    }
}


function endGame(draw, winningCombination = []) {
    gameActive = false;
    homeButton.classList.remove('hidden'); // Mostra o botão de início ao final do jogo

    if (draw) {
        setStatusMessage('Empate!');
    } else {
        const winnerName = isOTurn ? playerNames.o : playerNames.x;
        const winnerMark = isOTurn ? "O" : "X";
        setStatusMessage(`${winnerName} (${winnerMark}) venceu!`);
        updateScore(winnerMark);

        winningCombination.forEach(index => {
            cellElements[index].classList.add('winning-cell');
        });

        winSound.play();
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }
}

function updateScore(winner) {
    if (winner === 'X') scores.x++; else scores.o++;
    scoreXElement.innerText = scores.x;
    scoreOElement.innerText = scores.o;
    saveScores();
}

function isDraw() {
    return [...cellElements].every(cell => cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS));
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    isOTurn = !isOTurn;
    const nextPlayerName = isOTurn ? playerNames.o : playerNames.x;
    const nextPlayerMark = isOTurn ? "O" : "X";
    setStatusMessage(`É a vez de ${nextPlayerName} (${nextPlayerMark})`);
}

function setStatusMessage(message) {
    statusMessage.innerText = message;
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.find(combination => combination.every(index => cellElements[index].classList.contains(currentClass)));
}

// --- Funções Auxiliares (LocalStorage, Navegação) ---

function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

function loadScores() {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
        scoreXElement.innerText = scores.x;
        scoreOElement.innerText = scores.o;
    }
}

function resetScores() {
    scores = { x: 0, o: 0 };
    scoreXElement.innerText = scores.x;
    scoreOElement.innerText = scores.o;
    saveScores();
    setStatusMessage("Placar zerado! Comece um novo jogo.");
}

// ESTA É A FUNÇÃO QUE FAZ O BOTÃO FUNCIONAR
function returnToHome() {
    gameContainer.classList.add('hidden'); // Esconde a tela do jogo
    playerSetup.classList.remove('hidden'); // Mostra a tela de setup
    homeButton.classList.add('hidden'); // Esconde o próprio botão
}