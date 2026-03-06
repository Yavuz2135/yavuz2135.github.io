// games/neon-velocity/script.js
// Neon Velocity - Mobil uyumlu hale getirildi (butonlar, ekran, engel spawn)

function initNeonVelocity() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scoreEl = document.getElementById('score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreEl = document.getElementById('final-score');
    const restartBtn = document.getElementById('btn-restart');

    let animationFrameId = null;

    // ── Mobil tam ekran canvas (devicePixelRatio ile yüksek çözünürlük) ──
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1; // Mobil yüksek DPI
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(dpr, dpr); // Çözünürlük ölçekle
        player.y = canvas.height / dpr - 150; // DPI düzelt
        player.grounded = true;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let score = 0;
    let gameActive = true;
    let obstacles = [];

    const player = {
        x: 80,
        y: canvas.height / (window.devicePixelRatio || 1) - 150,
        width: 35,
        height: 35,
        dy: 0,
        jumpForce: 15,
        gravity: 0.75,
        grounded: false
    };

    function jump() {
        if (player.grounded && gameActive) {
            player.dy = -player.jumpForce;
            player.grounded = false;
        }
    }

    const keyHandler = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    };
    const touchHandler = (e) => {
        e.preventDefault();
        jump();
    };

    document.addEventListener('keydown', keyHandler);
    document.addEventListener('touchstart', touchHandler, { passive: false });

    function update() {
        if (!gameActive) return;

        player.dy += player.gravity;
        player.y += player.dy;

        const groundY = canvas.height / (window.devicePixelRatio || 1) - 100;
        if (player.y + player.height > groundY) {
            player.y = groundY - player.height;
            player.dy = 0;
            player.grounded = true;
        }

        // Engel spawn iyileştirildi: oran düşürüldü + x sola kaydırıldı (mobil'de önceden görünür)
        if (Math.random() < 0.015) { // 0.02'den 0.015'e düşürüldü (aniden çıkma önlendi)
            obstacles.push({
                x: canvas.width / (window.devicePixelRatio || 1) + 100, // +100px önceden görünür
                width: 40,
                height: 50 + Math.random() * 50,
                speed: 8 + (score / 10)
            });
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.x -= obs.speed;

            const obsTop = groundY - obs.height;
            if (
                player.x < obs.x + obs.width &&
                player.x + player.width > obs.x &&
                player.y + player.height > obsTop
            ) {
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
        ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ff';
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / (window.devicePixelRatio || 1) - 100);
        ctx.lineTo(canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1) - 100);
        ctx.stroke();

        ctx.shadowBlur = 20;
        ctx.shadowColor = '#0ff';
        ctx.fillStyle = '#0ff';

        let drawHeight = player.height;
        let drawY = player.y;
        if (!player.grounded) {
            drawHeight += 5;
            drawY -= 5;
        }
        drawRoundRect(ctx, player.x, drawY, player.width, drawHeight, 5);
        ctx.fill();

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
        ctx.fillStyle = '#fff';
        ctx.fillRect(player.x + 8, drawY + 8, 6, 6);
        ctx.fillRect(player.x + 20, drawY + 8, 6, 6);

        if (player.grounded) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#0ff';
            ctx.fillStyle = '#0ff';
            const legMove = Math.sin(Date.now() / 100) * 3;
            ctx.fillRect(player.x + 5, drawY + drawHeight, 8, 8 + legMove);
            ctx.fillRect(player.x + 22, drawY + drawHeight, 8, 8 - legMove);
        }

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f0f';
        ctx.fillStyle = '#f0f';
        obstacles.forEach(obs => {
            drawRoundRect(ctx, obs.x, canvas.height / (window.devicePixelRatio || 1) - 100 - obs.height, obs.width, obs.height, 5);
            ctx.fill();
        });

        ctx.shadowBlur = 0;
    }

    function gameLoop() {
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    // ── Mobil uyumlu restart (click + touch) ──
    function restart() {
        score = 0;
        gameActive = true;
        obstacles = [];
        player.y = canvas.height / (window.devicePixelRatio || 1) - 150;
        player.dy = 0;
        player.grounded = false;
        scoreEl.textContent = '0';
        gameOverScreen.classList.add('hidden');
        resizeCanvas(); // Yeniden boyutlandır
        gameLoop(); // Döngüyü yeniden başlat
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', restart); // Mobil click desteği
        restartBtn.addEventListener('touchstart', restart, { passive: false }); // Touch desteği
    }

    function cleanup() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        document.removeEventListener('keydown', keyHandler);
        document.removeEventListener('touchstart', touchHandler);
        window.removeEventListener('resize', resizeCanvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return cleanup;
}

window.initNeonVelocity = initNeonVelocity; // Global bağlama (main.js için zorunlu)
