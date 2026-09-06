const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 40; // 9x9 grid on a 360x360 canvas

// Map Legend: 0 = Empty, 1 = Wall, 2 = Dirt, 3 = Diamond, 4 = Boulder, 5 = Player
let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 5, 2, 2, 4, 2, 2, 3, 1],
    [1, 2, 1, 1, 2, 1, 1, 2, 1],
    [1, 3, 2, 4, 2, 3, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 4, 1],
    [1, 2, 2, 3, 2, 2, 2, 2, 1],
    [1, 1, 2, 1, 4, 1, 2, 1, 1],
    [1, 3, 2, 2, 2, 2, 3, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let player = { x: 1, y: 1 };
let score = 0;
let gameOver = false;

// Initialize player position from map and clear tile
for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
        if (map[r][c] === 5) {
            player.x = c;
            player.y = r;
            map[r][c] = 0;
        }
    }
}

// Handle Movement Inputs
function movePlayer(dx, dy) {
    if (gameOver) return;

    let newX = player.x + dx;
    let newY = player.y + dy;

    let targetTile = map[newY][newX];

    if (targetTile === 1) {
        return; // Hit wall, stop
    } 
    
    // Pushing boulders left or right
    if ((targetTile === 4 || targetTile === 3) && dy === 0) {
        let beyondX = newX + dx;
        let beyondY = newY + dy;
        if (map[beyondY][beyondX] === 0) {
            map[beyondY][beyondX] = targetTile;
            map[newY][newX] = 0;
            player.x = newX;
            player.y = newY;
        }
        return;
    }

    if (targetTile === 4 && dy !== 0) {
        return; // Can't walk vertically into a boulder
    }

    if (targetTile === 3) {
        score += 100; // Collected diamond
    }

    // Move player forward
    player.x = newX;
    player.y = newY;
    map[newY][newX] = 0; // Clear path/dirt/diamond
}

// Game Physics Tick (Falling Boulders & Diamonds)
function updatePhysics() {
    if (gameOver) return;

    // Iterate bottom-to-top so objects fall properly without double-shifting
    for (let r = map.length - 2; r >= 0; r--) {
        for (let c = 0; c < map[r].length; c++) {
            let tile = map[r][c];
            if (tile === 4 || tile === 3) { // Boulder or Diamond
                let below = map[r + 1][c];
                
                // Fall straight down into empty space
                if (below === 0) {
                    // Check if player is right below it
                    if (player.x === c && player.y === r + 1) {
                        gameOver = true; // Crush!
                    }
                    map[r + 1][c] = tile;
                    map[r][c] = 0;
                } 
                // Slide off rounded objects (boulders/diamonds/walls) if space diagonal is clear
                else if (below === 4 || below === 1 || below === 3) {
                    // Try sliding left
                    if (c > 0 && map[r][c - 1] === 0 && map[r + 1][c - 1] === 0) {
                        if (player.x === c - 1 && player.y === r + 1) gameOver = true;
                        map[r + 1][c - 1] = tile;
                        map[r][c] = 0;
                    }
                    // Try sliding right
                    else if (c < map[r].length - 1 && map[r][c + 1] === 0 && map[r + 1][c + 1] === 0) {
                        if (player.x === c + 1 && player.y === r + 1) gameOver = true;
                        map[r + 1][c + 1] = tile;
                        map[r][c] = 0;
                    }
                }
            }
        }
    }
}

// Render Graphics to Canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            let tile = map[r][c];
            let x = c * tileSize;
            let y = r * tileSize;

            if (tile === 1) { // Wall
                ctx.fillStyle = "#555";
                ctx.fillRect(x, y, tileSize, tileSize);
            } else if (tile === 2) { // Dirt
                ctx.fillStyle = "#8B4513";
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
            } else if (tile === 3) { // Diamond
                ctx.fillStyle = "#00ffff";
                ctx.beginPath();
                ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/3, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 4) { // Boulder
                ctx.fillStyle = "#a9a9a9";
                ctx.beginPath();
                ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Draw Player
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(player.x * tileSize + 6, player.y * tileSize + 6, tileSize - 12, tileSize - 12);

    // Draw Score / Game Over Text
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, 10, 25);

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff4444";
        ctx.font = "28px Arial";
        ctx.fillText("CRUSHED! Game Over", 35, 180);
        ctx.font = "14px Arial";
        ctx.fillText("Refresh page to restart", 110, 210);
    }
}

// Main Game Loop (Runs physics and rendering every 250ms for classic grid pacing)
function gameLoop() {
    updatePhysics();
    draw();
}
setInterval(gameLoop, 250);

// Keyboard Events
window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") movePlayer(0, -1);
    if (e.key === "ArrowDown") movePlayer(0, 1);
    if (e.key === "ArrowLeft") movePlayer(-1, 0);
    if (e.key === "ArrowRight") movePlayer(1, 0);
});

// Touch UI Events for Mobile Buttons
document.getElementById("btn-up").addEventListener("click", () => movePlayer(0, -1));
document.getElementById("btn-down").addEventListener("click", () => movePlayer(0, 1));
document.getElementById("btn-left").addEventListener("click", () => movePlayer(-1, 0));
document.getElementById("btn-right").addEventListener("click", () => movePlayer(1, 0));
