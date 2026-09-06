const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 40;
const visibleWidth = 9;  // Number of tiles visible horizontally on screen
const visibleHeight = 9; // Number of tiles visible vertically on screen

// A much larger 20x20 underground world map
let map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,5,2,3,4,2,2,2,1,2,3,2,2,4,2,2,3,2,2,1],
    [1,2,1,1,2,1,1,2,1,2,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,4,6,3,2,2,2,2,4,2,3,2,4,6,2,3,2,1],
    [1,2,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1,1,2,1],
    [1,2,2,3,2,2,2,4,2,3,2,2,4,2,2,3,2,2,2,1],
    [1,1,2,1,4,1,1,2,1,1,1,2,1,1,4,1,1,1,2,1],
    [1,3,2,2,2,2,3,2,2,4,2,2,3,2,2,2,3,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,3,4,2,2,3,2,4,2,2,3,4,2,2,3,4,2,2,1],
    [1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1],
    [1,3,2,2,4,2,2,3,2,2,4,2,2,3,2,2,4,2,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let player = { x: 1, y: 1 };
let score = 2150;
let totalDiamonds = 14;
let maxDiamonds = 60;
let gameOver = false;

// Extract player position
for (let r = 0; r < map.length; r++) {
    for (let c = 0; c < map[r].length; c++) {
        if (map[r][c] === 5) {
            player.x = c;
            player.y = r;
            map[r][c] = 0;
        }
    }
}

function movePlayer(dx, dy) {
    if (gameOver) return;

    let newX = player.x + dx;
    let newY = player.y + dy;

    // Check boundaries of the large world
    if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length) return;

    let targetTile = map[newY][newX];

    if (targetTile === 1) return; // Wall
    if (targetTile === 6) { gameOver = true; return; } // Snake

    // Pushing boulders
    if (targetTile === 4 && dy === 0) {
        let beyondX = newX + dx;
        let beyondY = newY + dy;
        if (beyondY >= 0 && beyondY < map.length && beyondX >= 0 && beyondX < map[0].length) {
            if (map[beyondY][beyondX] === 0) {
                map[beyondY][beyondX] = 4;
                map[newY][newX] = 0;
                player.x = newX;
                player.y = newY;
            }
        }
        return;
    }

    if (targetTile === 4 && dy !== 0) return;

    if (targetTile === 3) {
        score += 150;
        totalDiamonds++;
    }

    player.x = newX;
    player.y = newY;
    map[newY][newX] = 0;
}

function triggerWhip() {
    if (gameOver) return;
    let neighbors = [
        {r: player.y - 1, c: player.x},
        {r: player.y + 1, c: player.x},
        {r: player.y, c: player.x - 1},
        {r: player.y, c: player.x + 1}
    ];
    neighbors.forEach(n => {
        if (n.r >= 0 && n.r < map.length && n.c >= 0 && n.c < map[0].length) {
            if (map[n.r][n.c] === 2 || map[n.r][n.c] === 6) {
                map[n.r][n.c] = 0;
                score += 50;
            }
        }
    });
}

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

// Camera Viewport Rendering Engine
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0c0b0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // UI Header
    ctx.fillStyle = "#161310";
    ctx.fillRect(0, 0, canvas.width, 50);
    ctx.fillStyle = "#f4d35e";
    ctx.font = "bold 13px 'Courier New'";
    ctx.fillText(`SCORE: ${score}`, 15, 30);
    ctx.fillText(`DIAMONDS: ${totalDiamonds}/${maxDiamonds}`, 165, 30);
    ctx.strokeStyle = "#4a3b2c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(canvas.width, 50);
    ctx.stroke();

    // Calculate camera offset to center view on the player
    let cameraX = Math.max(0, Math.min(player.x - Math.floor(visibleWidth / 2), map[0].length - visibleWidth));
    let cameraY = Math.max(0, Math.min(player.y - Math.floor(visibleHeight / 2), map.length - visibleHeight));

    ctx.save();
    ctx.translate(0, 50);

    // Render only the visible section of the large world map
    for (let r = cameraY; r < cameraY + visibleHeight && r < map.length; r++) {
        for (let c = cameraX; c < cameraX + visibleWidth && c < map[r].length; c++) {
            let tile = map[r][c];
            let x = (c - cameraX) * tileSize;
            let y = (r - cameraY) * tileSize;

            if (tile === 1) { // Wall
                ctx.fillStyle = "#2d261e";
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = "#3d3328";
                ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
            } else if (tile === 2) { // Dirt
                ctx.fillStyle = "#5c3a21";
                ctx.fillRect(x, y, tileSize, tileSize);
                ctx.fillStyle = "#3b2413";
                ctx.fillRect(x + 4, y + 4, 6, 6);
            } else if (tile === 3) { // Diamond
                ctx.fillStyle = "#00b4d8";
                ctx.beginPath();
                ctx.moveTo(x + tileSize/2, y + 4);
                ctx.lineTo(x + tileSize - 6, y + tileSize/2);
                ctx.lineTo(x + tileSize/2, y + tileSize - 4);
                ctx.lineTo(x + 6, y + tileSize/2);
                ctx.closePath();
                ctx.fill();
            } else if (tile === 4) { // Boulder
                ctx.fillStyle = "#6c757d";
                ctx.beginPath();
                ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/2.2, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 6) { // Snake
                ctx.fillStyle = "#2a9d8f";
                ctx.fillRect(x + 6, y + 14, 28, 10);
            }
        }
    }

    // Draw Player relative to camera position
    let px = (player.x - cameraX) * tileSize;
    let py = (player.y - cameraY) * tileSize;
    
    ctx.fillStyle = "#b07d62";
    ctx.fillRect(px + 10, py + 18, 20, 16);
    ctx.fillStyle = "#f4a261";
    ctx.fillRect(px + 12, py + 10, 16, 10);
    ctx.fillStyle = "#dda15e";
    ctx.fillRect(px + 8, py + 4, 24, 6);

    ctx.restore();

    if (gameOver) {
        ctx.fillStyle = "rgba(12, 11, 10, 0.9)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#e76f51";
        ctx.font = "bold 24px 'Courier New'";
        ctx.fillText("CRUSHED!", 110, 200);
    }
}

function gameLoop() {
    updatePhysics();
    draw();
}
setInterval(gameLoop, 300);

window.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") movePlayer(0, -1);
    if (e.key === "ArrowDown") movePlayer(0, 1);
    if (e.key === "ArrowLeft") movePlayer(-1, 0);
    if (e.key === "ArrowRight") movePlayer(1, 0);
    if (e.key === " " || e.key === "x") triggerWhip();
});

document.getElementById("btn-up").addEventListener("click", () => movePlayer(0, -1));
document.getElementById("btn-down").addEventListener("click", () => movePlayer(0, 1));
document.getElementById("btn-left").addEventListener("click", () => movePlayer(-1, 0));
document.getElementById("btn-right").addEventListener("click", () => movePlayer(1, 0));
document.getElementById("btn-action").addEventListener("click", triggerWhip);
