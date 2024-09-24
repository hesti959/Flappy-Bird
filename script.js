var scoreDisplay = document.getElementById("score");
var playScreen = document.getElementById("play-screen");
var playButton = document.getElementById("play-button");
var gameOverDisplay = document.getElementById("game-over");
var finalScoreDisplay = document.getElementById("final-score");
var gameCanvas = document.getElementById("gameCanvas");
var context = gameCanvas.getContext("2d");

let sound_point = new Audio('point.mp3');
let sound_die = new Audio('die.mp3');
let background_music = new Audio('music.mp3'); // Load the background music

background_music.loop = true; // Set the music to loop

gameCanvas.width = 400;
gameCanvas.height = 600;

var bird = {
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    gravity: 0.2, // Lower gravity value
    lift: -4,
    velocity: 0,
    lives: 3 // Initialize lives
};

var pipes = [];
var coins = []; // Array to hold coins
var pipeWidth = 64;
var pipeHeight = 512;
var pipeGap = 150;
var initialVelocityX = -2;
var velocityX = initialVelocityX;
var pipeInterval = 1500;
var score = 0;
var totalCoins = 0; // Initialize total coins to 0
var gameOverFlag = false;
var gameStarted = false; // Track if the game has started

var birdImg = new Image();
birdImg.src = "brg.png";

var topPipeImg = new Image();
topPipeImg.src = "toppipe.png";

var bottomPipeImg = new Image();
bottomPipeImg.src = "bottompipe.png";

var coinImg = new Image();
coinImg.src = "coin.png"; // Add your coin image path here

document.addEventListener("keydown", function(event) {
    if (event.code === "ArrowUp" && gameStarted) {
        jump();
    } else if (event.code === "Enter" && gameOverFlag) {
        restartGame();
    }
});

playButton.addEventListener("click", startGame);

document.addEventListener("DOMContentLoaded", function() {
    playScreen.classList.add("show");
    scoreDisplay.innerText = "Coins: " + totalCoins; // Display total coins on start
});

function startGame() {
    gameStarted = true;
    playScreen.classList.remove("show");
    background_music.play();
    update();
}

function jump() {
    if (!gameOverFlag) {
        bird.velocity = bird.lift;
    }
}

function update() {
    if (gameOverFlag) return;

    context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Update bird's velocity and position
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Cap the bird's velocity
    const maxVelocity = 5;
    if (bird.velocity > maxVelocity) {
        bird.velocity = maxVelocity;
    }

    // Collision with the ground
    if (bird.y + bird.height >= gameCanvas.height) {
        bird.y = gameCanvas.height - bird.height;
        bird.velocity = 0;
        sound_die.play();
        gameOver();
    }

    // Collision with the top of the screen
    if (bird.y <= 0) {
        bird.y = 0;
        bird.velocity = 0;
        sound_die.play();
        gameOver();
    }

    // Draw the bird
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Create new pipes and coins as needed
    if (pipes.length === 0 || pipes[pipes.length - 1].x < gameCanvas.width - pipeInterval) {
        var pipeY = Math.random() * (gameCanvas.height - pipeGap - 200) + 100;
        pipes.push({ x: gameCanvas.width, y: pipeY, passed: false });

        // Add a coin between the pipes
        var coinY = pipeY + pipeGap / 2;
        coins.push({ x: gameCanvas.width + pipeWidth / 2, y: coinY, collected: false });
    }

    pipes.forEach((pipe, index) => {
        pipe.x += velocityX;
        context.drawImage(topPipeImg, pipe.x, pipe.y - pipeHeight, pipeWidth, pipeHeight);
        context.drawImage(bottomPipeImg, pipe.x, pipe.y + pipeGap, pipeWidth, pipeHeight);

        // Check for collisions with the pipes
        if ((bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) &&
            (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipeGap)) {
            sound_die.play();
            gameOver();
        }
    });

    // Draw and check for collisions with coins
    coins.forEach((coin, index) => {
        coin.x += velocityX;
        context.drawImage(coinImg, coin.x - 15, coin.y - 15, 30, 30); // Adjust coin size and position

        // Check if bird collects the coin
        if (!coin.collected &&
            bird.x + bird.width > coin.x - 15 && bird.x < coin.x + 15 &&
            bird.y + bird.height > coin.y - 15 && bird.y < coin.y + 15) {
            coin.collected = true;
            totalCoins++; // Increase total coins count
            scoreDisplay.innerText = "Coins: " + totalCoins;
            sound_point.play(); // Play point sound for collecting coin

            // Increase the speed of pipes and bird based on score
            if (totalCoins % 10 === 0) {
                velocityX *= 1.1; // Increase pipe speed by 10%
                bird.gravity *= 1.1; // Increase bird gravity by 10%
            }
        }
    });

    // Remove off-screen pipes and coins
    pipes = pipes.filter(pipe => pipe.x > -pipeWidth);
    coins = coins.filter(coin => !coin.collected && coin.x > -30); // Keep uncollected coins on screen

    // Request the next frame update
    if (!gameOverFlag) {
        requestAnimationFrame(update);
    }
}

function gameOver() {
    gameOverFlag = true;
    background_music.pause();
    finalScoreDisplay.innerText = "Your Score: " + totalCoins;
    gameOverDisplay.classList.add("show");
}

function restartGame() {
    gameOverFlag = false;
    gameOverDisplay.classList.remove("show");
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    coins = []; // Reset coins array
    totalCoins = 0; // Reset total coins
    scoreDisplay.innerText = "Coins: " + totalCoins; // Display total coins
    velocityX = initialVelocityX; // Reset pipe speed
    bird.gravity = 0.2; // Reset bird gravity
    background_music.play();
    update();
}
