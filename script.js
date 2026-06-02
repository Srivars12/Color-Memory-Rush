// ── Grab Elements ──
const grid     = document.getElementById('grid');
const statusEl = document.getElementById('status');
const roundEl  = document.getElementById('round-val');
const scoreEl  = document.getElementById('score-val');
const bestEl   = document.getElementById('best-val');
const startBtn = document.getElementById('start-btn');
const overlay  = document.getElementById('msg-overlay');
const msgTitle = document.getElementById('msg-title');
const msgBody  = document.getElementById('msg-body');
const msgBtn   = document.getElementById('msg-btn');

// ── Game State ──
const GRID_SIZE = 16;
let tiles       = [];
let sequence    = [];
let playerIdx   = 0;
let round       = 1;
let score       = 0;
let best        = 0;
let accepting   = false;
let gameRunning = false;

// ── Step 1: Build the 4x4 Grid ──
function buildGrid() {
  grid.innerHTML = '';
  tiles = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.addEventListener('click', () => handleClick(i));
    grid.appendChild(tile);
    tiles.push(tile);
  }
}

// ── Helpers ──
function setStatus(text) {
  statusEl.textContent = text;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearTiles() {
  tiles.forEach(t => {
    t.className = 'tile';
  });
}

// ── Step 2: Flash one tile ──
async function flashTile(idx, cssClass, duration) {
  tiles[idx].classList.add(cssClass);
  await delay(duration);
  tiles[idx].classList.remove(cssClass);
  await delay(80);
}

// Speed increases each round (min 300ms)
function getFlashSpeed() {
  return Math.max(300, 700 - (round - 1) * 40);
}

// ── Step 3: Show the full sequence ──
async function showSequence() {
  accepting = false;
  setStatus('👀 Watch carefully...');
  await delay(700);

  for (let i = 0; i < sequence.length; i++) {
    await flashTile(sequence[i], 'highlight', getFlashSpeed());
  }

  setStatus('🖱️ Your turn! Click the tiles in order.');
  playerIdx = 0;
  accepting = true;
}

// Add one random tile index to the sequence
function addToSequence() {
  sequence.push(Math.floor(Math.random() * GRID_SIZE));
}

// ── Step 4: Start a round ──
async function startRound() {
  clearTiles();
  roundEl.textContent = round;
  addToSequence();
  await showSequence();
}

// ── Step 5: Handle player click ──
async function handleClick(idx) {
  if (!accepting || !gameRunning) return;
  accepting = false;

  if (sequence[playerIdx] === idx) {
    // ✅ Correct
    await flashTile(idx, 'correct', 200);
    playerIdx++;
    accepting = true;

    if (playerIdx === sequence.length) {
      // Completed this round
      accepting = false;
      score += round * 10;
      scoreEl.textContent = score;

      if (score > best) {
        best = score;
        bestEl.textContent = best;
      }

      setStatus('✅ Correct! Get ready for the next round...');
      await delay(1000);
      round++;
      await startRound();
    }

  } else {
    // ❌ Wrong
    await flashTile(idx, 'wrong', 500);
    endGame();
  }
}

// ── Step 6: End the game ──
function endGame() {
  accepting   = false;
  gameRunning = false;

  if (score > best) {
    best = score;
    bestEl.textContent = best;
  }

  msgTitle.textContent = 'Game Over! 😢';
  msgBody.textContent  = `You reached Round ${round} and scored ${score} points.`;
  overlay.classList.add('show');
  startBtn.textContent = 'Start Game';
}

// ── Step 7: Start / Restart ──
async function startGame() {
  overlay.classList.remove('show');
  sequence    = [];
  round       = 1;
  score       = 0;
  gameRunning = true;

  scoreEl.textContent = 0;
  roundEl.textContent = 1;
  startBtn.textContent = 'Restart';

  buildGrid();
  await startRound();
}

// ── Event Listeners ──
startBtn.addEventListener('click', startGame);
msgBtn.addEventListener('click', startGame);

// ── Init ──
buildGrid();
setStatus('Press Start to play');