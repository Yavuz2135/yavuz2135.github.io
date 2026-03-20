// games/uzay-firtinasi/script.js - Temizlenmiş, mobil odaklı, renkler dengeli
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

    let animationFrameId = null;
    let gameActive = true;
    let score = 0;
    let lives = 3;
    let combo = 0;
    let lastComboTime = 0;
    let difficulty = 1;

    // Canvas
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Yıldızlar – daha az ve daha sakin
    const stars = Array.from({length:70}, () => ({
        x: Math.random()*2200,
        y: Math.random()*2200,
        size: Math.random()*1.5 + 0.5,
        speed: Math.random()*1.2 + 0.3
    }));

    // Oyuncu
    const player = { x:0, y:0, width:64, height:80, speed:8.5, lastShot:0, fireRate:150 };
    function resetPlayer() {
        const cw = canvas.width / (window.devicePixelRatio || 1);
        player.x = (cw - player.width) / 2;
        player.y = (canvas.height / (window.devicePixelRatio || 1)) - player.height - 80;
    }
    resetPlayer();

    let bullets = [];
    let enemies = [];
    let particles = [];
    let powerups = [];

    // Kontroller (önceki temiz hali korunuyor)
    let moveTouchId = null;
    let moveDelta = 0;
    let fireActive = false;

    function handleTouchStart(e) { e.preventDefault();
        for (let t of e.changedTouches) {
            const rect = canvas.getBoundingClientRect();
            const tx = t.clientX - rect.left;
            if (tx < rect.width * 0.48) {
                moveTouchId = t.identifier;
                moveDelta = 0;
            } else {
                fireActive = true;
            }
        }
    }

    function handleTouchMove(e) { e.preventDefault();
        if (moveTouchId === null) return;
        for (let t of e.touches) {
            if (t.identifier === moveTouchId) {
                const rect = canvas.getBoundingClientRect();
                const tx = t.clientX - rect.left;
                moveDelta = (tx - rect.width * 0.24) / (rect.width * 0.24);
                moveDelta = Math.max(-1, Math.min(1, moveDelta));
            }
        }
    }

    function handleTouchEnd(e) { e.preventDefault();
        for (let t of e.changedTouches) {
            if (t.identifier === moveTouchId) moveTouchId = null, moveDelta = 0;
            else fireActive = false;
        }
    }

    canvas.addEventListener('touchstart', handleTouchStart, {passive:false});
    canvas.addEventListener('touchmove', handleTouchMove, {passive:false});
    canvas.addEventListener('touchend', handleTouchEnd, {passive:false});
    canvas.addEventListener('touchcancel', handleTouchEnd, {passive:false});

    let keys = {};
    document.addEventListener('keydown', e => keys[e.code] = true);
    document.addEventListener('keyup', e => keys[e.code] = false);

    function shoot() {
        const now = Date.now();
        if (now - player.lastShot < player.fireRate) return;
        player.lastShot = now;
        bullets.push({x: player.x + player.width/2 - 6, y: player.y - 18, w:12, h:28, speed:18});
    }

    function update() {
        if (!gameActive) return;

        let dir = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) dir -= 1;
        if (keys['ArrowRight'] || keys['KeyD']) dir += 1;
        if (moveTouchId !== null) dir += moveDelta;

        player.x += dir * player.speed;
        const cw = canvas.width / (window.devicePixelRatio || 1);
        player.x = Math.max(30, Math.min(cw - player.width - 30, player.x));

        if (keys['Space'] || fireActive) shoot();

        stars.forEach(s => { s.y += s.speed; if(s.y > 2200) s.y = -50; });

        bullets = bullets.filter(b => { b.y -= b.speed; return b.y > -50; });

        if (Math.random() < 0.016 + score * 0.00035) {
            const fast = Math.random() < 0.22;
            enemies.push({
                x: Math.random() * (cw - 80) + 40,
                y: -70,
                w: 52,
                h: 52,
                speed: (fast ? 5.5 : 3.4) + score*0.007 + difficulty,
                type: fast ? 'fast' : 'normal',
                color: fast ? '#bb44ff' : '#ff4444'
            });
        }

        if (Math.random() < 0.003) powerups.push({x: Math.random()*(cw-40)+20, y:-40, size:22, speed:2.5});

        enemies = enemies.filter((e,i) => {
            e.y += e.speed;

            if (player.x < e.x + e.w && player.x + player.width > e.x &&
                player.y < e.y + e.h && player.y + player.height > e.y) {
                lives--; updateLivesUI(); createExplosion(e.x + e.w/2, e.y + e.h/2, '#ff0000');
                if (lives <= 0) endGame();
                return false;
            }

            for (let j=bullets.length-1; j>=0; j--) {
                const b = bullets[j];
                if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                    bullets.splice(j,1);
                    createExplosion(e.x + e.w/2, e.y + e.h/2);
                    score += e.type === 'fast' ? 15 : 10;
                    combo++; lastComboTime = Date.now();
                    scoreEl.textContent = score;
                    return false;
                }
            }
            return e.y < (canvas.height / (window.devicePixelRatio || 1)) + 100;
        });

        powerups = powerups.filter(p => {
            p.y += p.speed;
            if (player.x < p.x + p.size && player.x + player.width > p.x &&
                player.y < p.y + p.size && player.y + player.height > p.y) {
                lives = Math.min(3, lives + 1); updateLivesUI();
                createExplosion(p.x, p.y, '#33ff99');
                return false;
            }
            return p.y < (canvas.height / (window.devicePixelRatio || 1)) + 100;
        });

        if (Date.now() - lastComboTime > 2000) combo = 0;
    }

    function endGame() {
        gameActive = false;
        finalScoreEl.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }

    function updateLivesUI() {
        livesEl.innerHTML = '❤️'.repeat(lives) + (combo > 1 ? ` ×${combo}` : '');
    }

    function createExplosion(x, y, color = '#ff3366') {
        for (let i = 0; i < 14; i++) {  // parçacık sayısı azaltıldı
            particles.push({
                x, y,
                vx: Math.random()*10 - 5,
                vy: Math.random()*10 - 5,
                life: 24,
                color,
                size: Math.random()*3 + 2
            });
        }
    }

    function drawRoundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
        ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r);
        ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h);
        ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.lineTo(x,y+r);
        ctx.quadraticCurveTo(x,y,x+r,y);
        ctx.closePath();
    }

    function draw() {
        if (!gameActive) return;
        const cw = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);

        ctx.fillStyle = '#0a0015';
        ctx.fillRect(0,0,cw,ch);

        // Yıldızlar – daha az parlak
        ctx.shadowBlur = 4; ctx.shadowColor = '#88ccff'; ctx.fillStyle = '#88ccff';
        stars.forEach(s => ctx.fillRect(s.x % cw, s.y % ch, s.size, s.size));

        // Gemi – sade ama havalı
        ctx.shadowBlur = 20; ctx.shadowColor = '#00ccff'; ctx.fillStyle = '#00ccff';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width/2, player.y);
        ctx.lineTo(player.x + 10, player.y + player.height);
        ctx.lineTo(player.x + player.width - 10, player.y + player.height);
        ctx.closePath(); ctx.fill();

        // Kanatlar
        ctx.shadowBlur = 15; ctx.fillStyle = '#0099ff';
        ctx.beginPath(); ctx.moveTo(player.x + 12, player.y + 40);
        ctx.lineTo(player.x - 8, player.y + player.height);
        ctx.lineTo(player.x + 20, player.y + player.height - 10); ctx.fill();
        ctx.beginPath(); ctx.moveTo(player.x + player.width - 12, player.y + 40);
        ctx.lineTo(player.x + player.width + 8, player.y + player.height);
        ctx.lineTo(player.x + player.width - 20, player.y + player.height - 10); ctx.fill();

        // Motor alevi
        const flame = Math.sin(Date.now()/50) * 5 + 10;
        ctx.shadowBlur = 30; ctx.shadowColor = '#ff6600'; ctx.fillStyle = '#ffaa00';
        ctx.fillRect(player.x + player.width/2 - 6, player.y + player.height - 4, 12, flame);

        // Mermi – artık net görünüyor + hafif trail
        ctx.shadowBlur = 12; ctx.shadowColor = '#ff88ff'; ctx.fillStyle = '#ff88ff';
        bullets.forEach(b => {
            drawRoundRect(b.x, b.y, b.w, b.h, 5);
            ctx.fill();
            // hafif trail
            ctx.globalAlpha = 0.4;
            ctx.fillRect(b.x + 2, b.y + 6, 8, 20);
            ctx.globalAlpha = 1;
        });

        // Düşmanlar
        enemies.forEach(e => {
            ctx.shadowBlur = 14; ctx.shadowColor = e.color; ctx.fillStyle = e.color;
            ctx.beginPath(); ctx.arc(e.x + e.w/2, e.y + e.h/2, e.w/2, 0, Math.PI*2); ctx.fill();
        });

        // Power-up
        ctx.shadowBlur = 12; ctx.shadowColor = '#44ff99'; ctx.fillStyle = '#44ff99';
        powerups.forEach(p => {
            ctx.save(); ctx.translate(p.x + p.size/2, p.y + p.size/2);
            ctx.rotate(Math.sin(Date.now()/300)*0.25);
            ctx.fillText('❤️', -p.size/2, p.size/2); ctx.restore();
        });

        // Patlama – daha az parçacık
        particles = particles.filter(p => {
            p.x += p.vx; p.y += p.vy; p.life--;
            ctx.globalAlpha = p.life / 24;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
            return p.life > 0;
        });
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }

    function gameLoop() {
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    updateLivesUI();
    gameLoop();

    function restart() {
        score = 0; lives = 3; combo = 0; difficulty = 1;
        bullets = []; enemies = []; particles = []; powerups = [];
        resetPlayer();
        scoreEl.textContent = '0';
        updateLivesUI();
        gameOverScreen.classList.add('hidden');
        if (loadingEl) loadingEl.classList.add('hidden');
        gameActive = true;
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', restart);
        restartBtn.addEventListener('touchstart', restart, {passive:false});
    }

    function cleanup() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        gameActive = false;
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
