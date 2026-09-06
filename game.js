const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 40; // 9x9 Grid layout

// Map Legend: 0=Empty, 1=Wall, 2=Dirt, 3=Diamond(Red), 4=Boulder, 5=Player, 6=Snake
let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 5, 2, 3, 4, 2, 3, 3, 1],
    [1, 2, 1, 1, 2, 1, 1, 2, 1],
    [1, 3, 2, 4, 6, 3, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 4, 1],
    [1, 2, 2, 3, 2, 2, 2, 2, 1],
    [1, 1, 2, 1, 4, 1, 2, 1, 1],
    [1, 3, 2, 2, 2, 2, 3, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let player = { x: 1, y: 1 };
let score = 2150;
let totalDiamonds = 14;
let maxDiamonds = 30;
let gameOver = false;

// Extract player & snake from static template setup
for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
        if (map[r][c] === 5) {
            player.x = c;
            player.y = r;
            map[r][c] = 0;
        }
    }
}

// Handle Movement & Interaction
function movePlayer(dx, dy) {
    if (gameOver) return;

    let newX = player.x + dx;
    let newY = player.y + dy;
    let targetTile = map[newY][newX];

    if (targetTile === 1) return; // Wall blocking

    // Snake Hazard Collision
    if (targetTile === 6) {
        gameOver = true;
        return;
    }

    // Pushing Boulders horizontally
    if (targetTile === 4 && dy === 0) {
        let beyondX = newX + dx;
        let beyondY = newY + dy;
        if (map[beyondY][beyondX] === 0) {
            map[beyondY][beyondX] = 4;
            map[newY][newX] = 0;
            player.x = newX;
            player.y = newY;
        }
        return;
    }

    if (targetTile === 4 && dy !== 0) return; // Can't walk up/down into boulder

    if (targetTile === 3) {
        score += 150;
        totalDiamonds++;
    }

    player.x = newX;
    player.y = newY;
    map[newY][newX] = 0;
}

// Action Whip Mechanic (destroys adjacent dirt or snakes)
function triggerWhip() {
    if (gameOver) return;
    // Check tiles around the player
    let neighbors = [
        {r: player.y - 1, c: player.x},
        {r: player.y + 1, c: player.x},
        {r: player.y, c: player.x - 1},
        {r: player.y, c: player.x + 1}
    ];
    neighbors.forEach(n => {
        if (n.r >= 0 && n.r < map.length && n.c >= 0 && n.c < map[0].length) {
            if (map[n.r][n.c] === 2 || map[n.r][n.c] === 6) {
                map[n.r][n.c] = 0; // Clears obstacle/snake with whip
                score += 50;
            }
        }
    });
}

// Physics Loop for Falling Elements
function updatePhysics() {
    if (gameOver) return;

    for (let r = map.length - 2; r >= 0; r--) {
        for (let c = 0; c < map[r].length; c++) {
            let tile = map[r][c];
            if (tile === 4 || tile === 3) {
                let below = map[r + 1][c];
                if (below === 0) {
                    if (player.x === c && player.y === r + 1) gameOver = true;
                    map[r + 1][c] = tile;
                    map[r][c] = 0;
                } else if (below === 4 || below === 1 || below === 3) {
                    if (c > 0 && map[r][c - 1] === 0 && map[r + 1][c - 1] === 0) {
                        if (player.x === c - 1 && player.y === r + 1) gameOver = true;
                        map[r + 1][c - 1] = tile;
                        map[r][c] = 0;
                    } else if (c < map[r].length - 1 && map[r][c + 1] === 0 && map[r + 1][c + 1] === 0) {
                        if (player.x === c + 1 && player.y === r + 1) gameOver = true;
                        map[r + 1][c + 1] = tile;
                        map[r][c] = 0;
                    }
                }
            }
        }
    }
}

// Pixel Art Rendering Engine
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Header UI Display matching Nokia HUD
    ctx.fillStyle = "#1a1612";
    ctx.fillRect(0, 0, canvas.width, 60);
    ctx.fillStyle = "#e0c068";
    ctx.font = "bold 14px 'Courier New'";
    ctx.fillText(`SCORE: ${score}`, 15, 35);
    ctx.fillText(`DIAMONDS: ${totalDiamonds}/${maxDiamonds}`, 180, 35);
    ctx.strokeStyle = "#5a4939";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(canvas.width, 60);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, 60); // Shift game grid down past HUD

    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            let tile = map[r][c];
            let x = c * tileSize;
            let y = r * tileSize;

            if (tile === 1) { // Ancient Temple Stone Wall
                ctx.fillStyle = "#3b342b";
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = "#27221b";
                ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
                ctx.fillStyle = "#52483c";
                ctx.fillRect(x + 8, y + 8, 6, 6);
                ctx.fillRect(x + 24, y + 24, 6, 6);
            } else if (tile === 2) { // Textured Underground Dirt
                ctx.fillStyle = "#6b3d1f";
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = "#4a2812";
                ctx.fillRect(x + 4, y + 4, 8, 8);
                ctx.fillRect(x + 22, y + 18, 10, 10);
                ctx.fillRect(x + 8, y + 28, 6, 6);
            } else if (tile === 3) { // Sparkling Ruby Diamond
                ctx.fillStyle = "#e63946";
                ctx.beginPath();
                ctx.moveTo(x + tileSize/2, y + 6);
                ctx.lineTo(x + tileSize - 8, y + tileSize/2);
                ctx.lineTo(x + tileSize/2, y + tileSize - 6);
                ctx.lineTo(x + 8, y + tileSize/2);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#ffffff"; // Sparkle core
                ctx.fillRect(x + 18, y + 16, 4, 4);
            } else if (tile === 4) { // Heavy Round Boulder
                ctx.fillStyle = "#8d99ae";
                ctx.beginPath();
                ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/2.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#6c757d"; // Shadow ring
                ctx.beginPath();
                ctx.arc(x + tileSize/2 + 2, y + tileSize/2 + 2, tileSize/3.2, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 6) { // Jungle Snake Hazard
                ctx.fillStyle = "#2b9348";
                ctx.fillRect(x + 8, y + 14, 24, 12);
                ctx.fillStyle = "#55a630";
                ctx.fillRect(x + 22, y + 8, 10, 10);
                ctx.fillStyle = "#ffb703"; // Eyes
                ctx.fillRect(x + 26, y + 10, 2, 2);
            }
        }
    }

    // Draw Explorer Character (Explorer Hat & Outfit)
    let px = player.x * tileSize;
    let py = player.y * tileSize;
    
    // Body / Outfit
    ctx.fillStyle = "#c68b59";
    ctx.fillRect(px + 10, py + 16, 20, 18);
    ctx.fillStyle = "#d4a373"; // Face
    ctx.fillRect(px + 12, py + 12, 16, 10);
    ctx.fillStyle = "#7f4f24"; // Explorer Fedora Hat
    ctx.fillRect(px + 8, py + 6, 24, 6);
    ctx.fillRect(px + 12, py + 2, 16, 4);

    ctx.restore();

    // Game Over Overlay
    if (gameOver) {
        ctx.fillStyle = "rgba(11, 11, 14, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#e63946";
        ctx.font = "bold 24px 'Courier New'";
        ctx.fillText("CRUSHED!", 110, 200);
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px 'Courier New'";
        ctx.fillText("Refresh page to try again", 85, 235);
    }
}

// Game Clock Loop
function gameLoop() {
    updatePhysics();
    draw();
}
setInterval(gameLoop, 300);

// Key Event Listeners
window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") movePlayer(0, -1);
    if (e.key === "ArrowDown") movePlayer(0, 1);
    if (e.key === "ArrowLeft") movePlayer(-1, 0);
    if (e.key === "ArrowRight") movePlayer(1, 0);
    if (e.key === " " || e.key === "x") triggerWhip();
});

// Mobile Button Listeners
document.getElementById("btn-up").addEventListener("click", () => movePlayer(0, -1));
document.getElementById("btn-down").addEventListener("click", () => movePlayer(0, 1));
document.getElementById("btn-left").addEventListener("click", () => movePlayer(-1, 0));
document.getElementById("btn-right").addEventListener("click", () => movePlayer(1, 0));
document.getElementById("btn-action").addEventListener("click", triggerWhip);
