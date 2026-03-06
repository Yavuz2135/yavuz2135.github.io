// games/neon-velocity/script.js
// Neon Velocity - Sıralama hatası düzeltildi (resizeCanvas player'dan sonra)

function initNeonVelocity() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scoreEl = document.getElementById('score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreEl = document.getElementById('final-score');
    const restartBtn = document.getElementById('btn-restart');

    let animationFrameId = null;

    // ── Canvas boyut yönetimi (player tanımlandıktan SONRA çağrılır) ──
    let player = null; // Player önce tanımlanır, sonra resize günceller
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(dpr, dpr);
        // Player varsa pozisyonunu güncelle (güvenli)
        if (player) {
            player.y = (canvas.height / dpr) - 150;
            player.grounded = true;
        }
    }

    // ── Oyun durumu ──
    let score = 0;
    let gameActive = true;
    let obstacles = [];

    // ── Oyuncu nesnesi (resizeCanvas'tan SONRA tanımlandı) ──
    player = {
        x: 80,
        y: 0, // Geçici - resizeCanvas güncelleyecek
        width: 35,
        height: 35,
        dy: 0,
        jumpForce: 15,
        gravity: 0.75,
        grounded: false
    };

    // Şimdi resizeCanvas çağrılabilir (player tanımlı)
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

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

        const groundY = (canvas.height / (window.devicePixelRatio || 1)) - 100;
        if (player.y + player.height > groundY) {
            player.y = groundY - player.height;
            player.dy = 0;
            player.grounded = true;
        }

        if (Math.random() < 0.015) {
            obstacles.push({
                x: (canvas.width / (window.devicePixelRatio || 1)) + 100,
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
        ctx.lineTo(x + r,
