// games/uzay-firtinasi/script.js - DONMA VE HAREKET SORUNU ÇÖZÜLDÜ
function initUzayFirtinasi() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreEl = document.getElementById('final-score');
    const restartBtn = document.getElementById('btn-restart');
    const loadingEl = document.getElementById('game-loading');
    const btnMenuExit = document.getElementById('btn-menu-exit'); // ana menü butonu

    let animationFrameId = null;
    let gameActive = true;
    let score = 0;
    let lives = 3;

    // Canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Yıldızlar
    const stars = Array.from({length:40}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random()*1.2 + 0.4,
        speed: Math.random()*0.6 + 0.2
    }));

    // Oyuncu
    const player = {
        x: canvas.width / 2 - 32,
        y: canvas.height - 120,
        width: 64,
        height: 80,
        speed: 8,
        lastShot: 0,
        fireRate: 180
    };

    let bullets = [];
    let enemies = [];
    let powerups = [];

    // Kontroller
    let moveTouchId = null;
    let moveDelta = 0;
    let fireActive = false;

    function handleTouchStart(e) {
        e.preventDefault();
        if (!gameActive) return;
        for (let t of e.changedTouches) {
            const tx = t.clientX;
            if (tx < window.innerWidth * 0.5) {
                moveTouchId = t.identifier;
                moveDelta = 0;
            } else {
                fireActive = true;
            }
        }
    }

    function handleTouchMove(e) {
        e.preventDefault();
        if (!gameActive || moveTouchId === null) return;
        for (let t of e.touches) {
            if (t.identifier === moveTouchId) {
                moveDelta = (t.clientX - window.innerWidth / 4) / (window.innerWidth / 4);
                moveDelta = Math.max(-1, Math.min(1, moveDelta));
            }
        }
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        if (!gameActive) return;
        for (let t of e.changedTouches) {
            if (t.identifier === moveTouchId) {
                moveTouchId = null;
                moveDelta = 0;
            } else {
                fireActive = false;
            }
        }
    }

    canvas.addEventListener('touchstart', handleTouchStart, {passive:false});
    canvas.addEventListener('touchmove', handleTouchMove, {passive:false});
    canvas.addEventListener('touchend', handleTouchEnd, {passive:false});
    canvas.addEventListener('touchcancel', handleTouchEnd, {passive:false});

    let keys = {};
    document.addEventListener('keydown', e => { keys[e.code] = true; });
    document.addEventListener('keyup', e => { keys[e.code] = false; });

    function shoot() {
        if (!gameActive) return;
        const now = Date.now();
        if (now - player.lastShot < player.fireRate) return;
        player.lastShot = now;
        bullets.push({x: player.x + player.width/2 - 5, y: player.y - 10, w:10, h:20, speed:16});
    }

    function update() {
        if (!gameActive) return;

        let dir = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) dir -= 1;
        if (keys['ArrowRight'] || keys['KeyD']) dir += 1;
        if (moveTouchId !== null) dir += moveDelta;

        player.x += dir * player.speed;
        player.x = Math.max(20, Math.min(canvas.width - player.width - 20, player.x));

        if (keys['Space'] || fireActive) shoot();

        stars.forEach(s => {
            s.y += s.speed;
            if (s.y > canvas.height) s.y = -20;
        });

        bullets = bullets.filter(b => { b.y -= b.speed; return b.y > -30; });

        if (Math.random() < 0.014 + score * 0.0003) {
            enemies.push({
                x: Math.random() * (canvas.width - 60) + 30,
                y: -60,
                w: 48,
                h: 48,
                speed: 3.2 + score * 0.006,
                color: '#ff4444'
            });
        }

        if (Math.random() < 0.0025) powerups.push({x: Math.random()*(canvas.width-40)+20, y:-40, size:20, speed:2.2});

        enemies = enemies.filter((e,i) => {
            e.y += e.speed;

            if (player.x < e.x + e.w && player.x + player.width > e.x &&
                player.y < e.y + e.h && player.y + player.height > e.y) {
                lives--; updateLivesUI();
                if (lives <= 0) endGame();
                return false;
            }

            for (let j=bullets.length-1; j>=0; j--) {
                const b = bullets[j];
                if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                    bullets.splice(j,1);
                    score += 10;
                    scoreEl.textContent = score;
                    return false;
                }
            }
            return e.y < canvas.height + 80;
        });

        powerups = powerups.filter(p => {
            p.y += p.speed;
            if (player.x < p.x + p.size && player.x + player.width > p.x &&
                player.y < p.y + p.size && player.y + player.height > p.y) {
                lives = Math.min(3, lives + 1); updateLivesUI();
                return false;
            }
            return p.y < canvas.height + 80;
        });
    }

    function endGame() {
        gameActive = false;
        cancelAnimationFrame(animationFrameId);
        finalScoreEl.textContent = score;
        gameOverScreen.classList.remove('hidden');
        // Butonları aktif tut
        if (restartBtn) restartBtn.disabled = false;
        if (btnMenuExit) btnMenuExit.disabled = false;
    }

    function updateLivesUI() {
        livesEl.innerHTML = '❤️'.repeat(lives);
    }

    function draw() {
        if (!gameActive) return;

        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#88aaff';
        stars.forEach(s => ctx.fillRect(s.x % canvas.width, s.y % canvas.height, s.size, s.size));

        ctx.fillStyle = '#00ccff';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width/2, player.y);
        ctx.lineTo(player.x + 12, player.y + player.height);
        ctx.lineTo(player.x + player.width - 12, player.y + player.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ff88ff';
        bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

        enemies.forEach(e => {
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.arc(e.x + e.w/2, e.y + e.h/2, e.w/2, 0, Math.PI*2);
            ctx.fill();
        });

        ctx.fillStyle = '#33ff99';
        powerups.forEach(p => ctx.fillRect(p.x, p.y, p.size, p.size));
    }

    function gameLoop() {
        if (!gameActive) return;
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    updateLivesUI();
    gameLoop();

    function restart() {
        score = 0; lives = 3;
        bullets = []; enemies = []; powerups = [];
        resetPlayer();
        scoreEl.textContent = '0';
        updateLivesUI();
        gameOverScreen.classList.add('hidden');
        if (loadingEl) loadingEl.classList.add('hidden');
        gameActive = true;
        gameLoop(); // loop'u yeniden başlat
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', restart);
        restartBtn.addEventListener('touchstart', restart, {passive:false});
    }

    // ANA MENÜ BUTONU (önemli!)
    if (btnMenuExit) {
        btnMenuExit.addEventListener('click', () => {
            gameActive = false;
            cancelAnimationFrame(animationFrameId);
            gameOverScreen.classList.add('hidden');
            // main.js'deki returnToMenu() fonksiyonunu çağır
            if (window.returnToMenu && typeof window.returnToMenu === 'function') {
                window.returnToMenu();
            }
        });
        btnMenuExit.addEventListener('touchstart', (e) => {
            e.preventDefault();
            gameActive = false;
            cancelAnimationFrame(animationFrameId);
            gameOverScreen.classList.add('hidden');
            if (window.returnToMenu) window.returnToMenu();
        }, {passive:false});
    }

    function cleanup() {
        gameActive = false;
        cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
        window.removeEventListener('resize', resizeCanvas);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        if (loadingEl) loadingEl.classList.add('hidden');
    }

    return cleanup;
}

window.initUzayFirtinasi = initUzayFirtinasi;
