// --- Duck Pizza Catcher Game ---

// Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const pizzaSound = document.getElementById('pizzaSound');
const cactusSound = document.getElementById('cactusSound');
const bgm = document.getElementById('bgm');

// Game Constants
const DUCK_WIDTH = 64;
const DUCK_HEIGHT = 64;
const DUCK_Y = canvas.height - DUCK_HEIGHT - 10;
const DUCK_SPEED = 6;
const ITEM_WIDTH = 48;
const ITEM_HEIGHT = 48;
const PIZZA_SPAWN_TIME = 900;
const CACTUS_SPAWN_TIME = 1300;
const ITEM_FALL_SPEED = 3.5;

// State
let duckX = (canvas.width - DUCK_WIDTH) / 2;
let leftPressed = false;
let rightPressed = false;
let pizzas = [];
let cactuses = [];
let score = 0;
let gameOver = false;
let pizzaTimer = 0;
let cactusTimer = 0;
let lastFrameTime = 0;

// Duck Sprite (simple pixel art in base64 PNG)
const duckImg = new Image();
duckImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAABu5l6QAAABWUlEQVRIS8WUQQrCMBBD3+n+f9iA4gB7nCTkEwZpOqV9VfIhYwZq4rtYuTSF8C8g6nK9n6kKcQWk6gQzXu5vJxj7f1myF2QV0o6pSs5cQnW42QWYyC7Q9Q2XQ2Y1wQ9Q0bI6QqY4w2Dk5oaziG4fNhgJ7x4wJf9LhAqjCwMOLOU8QSRj6XG0Kk6c4w5lS6hxwN0q8QGjnB8qQK3k6G8B1uQbnDqH7m0G7Qk3A2H8A5i1A3nV9tIN4wAu5dV4PaC24Yv8AFfT3QwT4I0yAAAAAElFTkSuQmCC";

// Pizza Sprite (simple pizza emoji 🍕 for fun)
const pizzaImg = new Image();
pizzaImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><text y='38' font-size='38'>🍕</text></svg>";

// Cactus Sprite (simple cactus emoji 🌵)
const cactusImg = new Image();
cactusImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><text y='38' font-size='38'>🌵</text></svg>";

// --- Input ---
document.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft') leftPressed = true;
    if (e.code === 'ArrowRight') rightPressed = true;
});
document.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft') leftPressed = false;
    if (e.code === 'ArrowRight') rightPressed = false;
});

// Touch controls
canvas.addEventListener('touchstart', function (e) {
    if (e.touches[0].clientX < canvas.width / 2 + canvas.getBoundingClientRect().left) leftPressed = true;
    else rightPressed = true;
});
canvas.addEventListener('touchend', function () {
    leftPressed = false;
    rightPressed = false;
});

// --- Game Loop ---
function gameLoop(ts) {
    if (gameOver) return;
    let delta = ts - lastFrameTime;
    lastFrameTime = ts;

    update(delta);
    draw();

    requestAnimationFrame(gameLoop);
}

// --- Update ---
function update(delta) {
    // Duck movement
    if (leftPressed) duckX -= DUCK_SPEED;
    if (rightPressed) duckX += DUCK_SPEED;
    duckX = Math.max(0, Math.min(canvas.width - DUCK_WIDTH, duckX));

    // Spawn falling pizzas
    pizzaTimer += delta;
    if (pizzaTimer > PIZZA_SPAWN_TIME) {
        pizzas.push({
            x: Math.random() * (canvas.width - ITEM_WIDTH),
            y: -ITEM_HEIGHT
        });
        pizzaTimer = 0;
    }

    // Spawn falling cactuses
    cactusTimer += delta;
    if (cactusTimer > CACTUS_SPAWN_TIME) {
        cactuses.push({
            x: Math.random() * (canvas.width - ITEM_WIDTH),
            y: -ITEM_HEIGHT
        });
        cactusTimer = 0;
    }

    // Move pizzas
    pizzas.forEach(p => p.y += ITEM_FALL_SPEED);

    // Move cactuses
    cactuses.forEach(c => c.y += ITEM_FALL_SPEED + 1);

    // Check collisions with pizzas
    for (let i = pizzas.length - 1; i >= 0; i--) {
        if (collides(duckX, DUCK_Y, DUCK_WIDTH, DUCK_HEIGHT, pizzas[i].x, pizzas[i].y, ITEM_WIDTH, ITEM_HEIGHT)) {
            score++;
            pizzaSound.currentTime = 0; pizzaSound.play();
            pizzas.splice(i, 1);
        } else if (pizzas[i].y > canvas.height) {
            pizzas.splice(i, 1);
        }
    }

    // Check collisions with cactuses
    for (let i = cactuses.length - 1; i >= 0; i--) {
        if (collides(duckX, DUCK_Y, DUCK_WIDTH, DUCK_HEIGHT, cactuses[i].x, cactuses[i].y, ITEM_WIDTH, ITEM_HEIGHT)) {
            cactusSound.currentTime = 0; cactusSound.play();
            endGame();
            return;
        } else if (cactuses[i].y > canvas.height) {
            cactuses.splice(i, 1);
        }
    }

    // Update score
    scoreDisplay.textContent = `Score: ${score}`;
}

function collides(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// --- Draw ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw duck
    ctx.drawImage(duckImg, duckX, DUCK_Y, DUCK_WIDTH, DUCK_HEIGHT);

    // Draw pizzas
    pizzas.forEach(p => ctx.drawImage(pizzaImg, p.x, p.y, ITEM_WIDTH, ITEM_HEIGHT));

    // Draw cactuses
    cactuses.forEach(c => ctx.drawImage(cactusImg, c.x, c.y, ITEM_WIDTH, ITEM_HEIGHT));
}

// --- Game Over ---
function endGame() {
    gameOver = true;
    bgm.pause();
    finalScore.textContent = `Your Score: ${score}`;
    gameOverScreen.style.display = 'block';
}

// --- Restart ---
restartBtn.addEventListener('click', () => {
    // Reset state
    duckX = (canvas.width - DUCK_WIDTH) / 2;
    pizzas = [];
    cactuses = [];
    score = 0;
    pizzaTimer = 0;
    cactusTimer = 0;
    gameOver = false;
    gameOverScreen.style.display = 'none';
    scoreDisplay.textContent = 'Score: 0';
    bgm.currentTime = 0;
    bgm.play();
    requestAnimationFrame(gameLoop);
});

// --- Start ---
window.onload = () => {
    scoreDisplay.textContent = 'Score: 0';
    bgm.volume = 0.7;
    bgm.play();
    requestAnimationFrame(gameLoop);
};