
// games/neon-velocity/script.js

function initNeonVelocity() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scoreEl = document.getElementById('score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreEl = document.getElementById('final-score');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let score = 0;
    let gameActive = true;
    let obstacles = [];
    let animationFrameId;

    const player = {
        x: 80,
        y: canvas.height - 150,
        width: 35,
        height: 35,
        dy: 0,
        jumpForce: 20,
        gravity: 0.6,
        grounded: false
    };

    function jump() {
        if (player.grounded && gameActive) {
            player.dy = -player.jumpForce;
            player.grounded = false;
        }
    }

    const keyHandler = e => { if (e.code === 'Space') { e.preventDefault(); jump(); } };
    const touchHandler = e => { e.preventDefault(); jump(); };

    document.addEventListener('keydown', keyHandler);
    document.addEventListener('touchstart', touchHandler, { passive: false });

    function update() {
        if (!gameActive) return;
        player.dy += player.gravity;
        player.y += player.dy;
        const groundY = canvas.height - 100;
        if (player.y + player.height > groundY) {
            player.y = groundY - player.height;
            player.dy = 0;
            player.grounded = true;
        }
        if (Math.random() < 0.02) {
            obstacles.push({ x: canvas.width, width: 40, height: 50 + Math.random() * 50, speed: 8 + (score / 10) });
        }
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.x -= obs.speed;
            const obsTop = groundY - obs.height;
            if (player.x < obs.x + obs.width && player.x + player.width > obs.x && player.y + player.height > obsTop) {
                gameActive = false;
                finalScoreEl.textContent = score;
                gameOverScreen.classList.remove('hidden');
                return;
            }
            if (obs.x + obs.width < 0) {
                obstacles.splice(i, 1);
                score++;
                scoreEl.textContent = score;
            }
        }
    }

    function drawRoundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function draw() {
        if (!gameActive) return;
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.shadowBlur = 15; ctx.shadowColor = '#0ff'; ctx.strokeStyle = '#0ff'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, canvas.height - 100); ctx.lineTo(canvas.width, canvas.height - 100); ctx.stroke();
        ctx.shadowBlur = 20; ctx.shadowColor = '#0ff'; ctx.fillStyle = '#0ff';
        let drawH = player.height, drawY = player.y;
        if (!player.grounded) { drawH += 5; drawY -= 5; }
        drawRoundRect(ctx, player.x, drawY, player.width, drawH, 5); ctx.fill();
        ctx.shadowBlur = 10; ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff';
        ctx.fillRect(player.x + 8, drawY + 8, 6, 6); ctx.fillRect(player.x + 20, drawY + 8, 6, 6);
        if (player.grounded) {
            ctx.shadowBlur = 15; ctx.shadowColor = '#0ff'; ctx.fillStyle = '#0ff';
            const leg = Math.sin(Date.now() / 100) * 3;
            ctx.fillRect(player.x + 5, drawY + drawH, 8, 8 + leg);
            ctx.fillRect(player.x + 22, drawY + drawH, 8, 8 - leg);
        }
        ctx.shadowBlur = 15; ctx.shadowColor = '#f0f'; ctx.fillStyle = '#f0f';
        obstacles.forEach(obs => {
            drawRoundRect(ctx, obs.x, canvas.height - 100 - obs.height, obs.width, obs.height, 5);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }

    function gameLoop() {
        update(); draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    gameLoop();

    function restart() {
        score = 0; gameActive = true; obstacles = [];
        player.y = canvas.height - 150; player.dy = 0; player.grounded = false;
        scoreEl.textContent = '0';
        gameOverScreen.classList.add('hidden');
    }
    document.getElementById('btn-restart').onclick = restart;

    function cleanup() {
        cancelAnimationFrame(animationFrameId);
        document.removeEventListener('keydown', keyHandler);
        document.removeEventListener('touchstart', touchHandler);
        window.removeEventListener('resize', resizeCanvas);
    }

    return cleanup;
}
