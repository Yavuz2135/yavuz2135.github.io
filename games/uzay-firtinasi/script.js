// games/uzay-firtinasi/script.js
function initUzayFirtinasi() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Canvas context alınamadı");
        return null;
    }

    const scoreEl = document.getElementById('score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreEl = document.getElementById('final-score');
    const restartBtn = document.getElementById('btn-restart');
    const loadingEl = document.getElementById('game-loading');

    let animationFrameId = null;
    let gameActive = true;
    let score = 0;

    // Canvas ölçekleme (senin kodundan birebir)
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    // Yıldız arka planı
    const stars = [];
    for (let i = 0; i < 120; i++) {
        stars.push({
            x: Math.random() * 2000,
            y: Math.random() * 2000,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 1.2 + 0.4
        });
    }

    // Oyuncu gemisi
    const player = {
        x: 120,
        y: 0,
        width: 50,
        height: 70,
        speed: 7,
        lastShot: 0,
        fireRate: 180  // ms
    };

    // Mermiler & düşmanlar
    let bullets = [];
    let enemies = [];

    resizeCanvas();
    player.y = (canvas.height / (window.devicePixelRatio || 1)) - player.height - 60;
    window.addEventListener('resize', resizeCanvas);

    // Kontroller
    let keys = {};
    let touchActive = false;

    function keyDown(e) {
        keys[e.code] = true;
        if (e.code === 'Space') e.preventDefault();
    }
    function keyUp(e) {
        keys[e.code] = false;
    }
    function touchStart(e) {
        e.preventDefault();
        touchActive = true;
    }
    function touchEnd(e) {
        e.preventDefault();
        touchActive = false;
    }

    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    document.addEventListener('touchstart', touchStart, { passive: false });
    document.addEventListener('touchend', touchEnd, { passive: false });

    function shoot() {
        const now = Date.now();
        if (now - player.lastShot < player.fireRate) return;
        player.lastShot = now;

        bullets.push({
            x: player.x + player.width / 2 - 6,
            y: player.y - 10,
            width: 12,
            height: 24,
            speed: 16
        });
    }

    function update() {
        if (!gameActive) return;

        // Oyuncu hareketi (sol-sağ)
        if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
        if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;

        // Ekran sınırları
        const cw = canvas.width / (window.devicePixelRatio || 1);
        player.x = Math.max(20, Math.min(cw - player.width - 20, player.x));

        // Otomatik + dokunmatik ateş
        if (keys['Space'] || touchActive) shoot();

        // Yıldızlar hareketi
        stars.forEach(s => {
            s.y += s.speed;
            if (s.y > (canvas.height / (window.devicePixelRatio || 1)) + 50) {
                s.y = -50;
                s.x = Math.random() * 2000;
            }
        });

        // Mermiler
        bullets = bullets.filter(b => {
            b.y -= b.speed;
            return b.y > -30;
        });

        // Düşman üretimi
        if (Math.random() < 0.018 + score * 0.0006) {
            const cw = canvas.width / (window.devicePixelRatio || 1);
            enemies.push({
                x: Math.random() * (cw - 60) + 30,
                y: -60,
                width: 50,
                height: 50,
                speed: 3.2 + score * 0.009
            });
        }

        // Düşman hareket & çarpışma
        enemies = enemies.filter((e, i) => {
            e.y += e.speed;

            // Oyuncu ile çarpışma
            if (
                player.x < e.x + e.width &&
                player.x + player.width > e.x &&
                player.y < e.y + e.height &&
                player.y + player.height > e.y
            ) {
                gameActive = false;
                finalScoreEl.textContent = score;
                gameOverScreen.classList.remove('hidden');
                return false;
            }

            // Mermi ile çarpışma
            for (let j = bullets.length - 1; j >= 0; j--) {
                const b = bullets[j];
                if (
                    b.x < e.x + e.width &&
                    b.x + b.width > e.x &&
                    b.y < e.y + e.height &&
                    b.y + b.height > e.y
                ) {
                    enemies.splice(i, 1);
                    bullets.splice(j, 1);
                    score++;
                    scoreEl.textContent = score;
                    return false;
                }
            }

            return e.y < (canvas.height / (window.devicePixelRatio || 1)) + 100;
        });
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

        const cw = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);

        ctx.fillStyle = '#000814';
        ctx.fillRect(0, 0, cw, ch);

        // Yıldızlar
        ctx.fillStyle = '#a5d8ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#a5d8ff';
        stars.forEach(s => {
            ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 800 + s.x) * 0.3;
            ctx.beginPath();
            ctx.arc(s.x % cw, s.y % ch, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Oyuncu gemisi (üçgen + glow)
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.closePath();
        ctx.fill();

        // Mermi izi efekti
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00ff';
        ctx.fillStyle = '#ff00ff';
        bullets.forEach(b => {
            drawRoundRect(ctx, b.x, b.y, b.width, b.height, 4);
            ctx.fill();
        });

        // Düşmanlar
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#ff4444';
        ctx.fillStyle = '#ff4444';
        enemies.forEach(e => {
            ctx.beginPath();
            ctx.arc(e.x + e.width / 2, e.y + e.height / 2, e.width / 2, 0, Math.PI * 2);
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

    function restart() {
        score = 0;
        gameActive = true;
        bullets = [];
        enemies = [];
        player.x = 120;
        player.y = (canvas.height / (window.devicePixelRatio || 1)) - player.height - 60;
        scoreEl.textContent = '0';
        gameOverScreen.classList.add('hidden');
        if (loadingEl) loadingEl.classList.add('hidden');
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', restart);
        restartBtn.addEventListener('touchstart', restart, { passive: false });
    }

    function cleanup() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        document.removeEventListener('keydown', keyDown);
        document.removeEventListener('keyup', keyUp);
        document.removeEventListener('touchstart', touchStart);
        document.removeEventListener('touchend', touchEnd);
        window.removeEventListener('resize', resizeCanvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (loadingEl) loadingEl.classList.add('hidden');
    }

    return cleanup;
}

// Global bağlama (main.js bunu çağırıyor)
window.initUzayFirtinasi = initUzayFirtinasi;
