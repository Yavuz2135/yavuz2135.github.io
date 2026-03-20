// games/uzay-firtinasi/script.js
function initUzayFirtinasi() {
    const canvas = document.getElementById('gameCanvas');
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

    // Canvas ölçekleme
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    // Yıldızlar (parallax)
    const stars1 = []; // yavaş
    const stars2 = []; // hızlı
    for (let i = 0; i < 80; i++) stars1.push({x: Math.random()*2000, y: Math.random()*2000, size: Math.random()*1.8+0.6, speed: Math.random()*0.8+0.3});
    for (let i = 0; i < 60; i++) stars2.push({x: Math.random()*2000, y: Math.random()*2000, size: Math.random()*2.5+1, speed: Math.random()*2+1.2});

    // Oyuncu
    const player = {
        x: 120,
        y: 0,
        width: 68,
        height: 85,
        speed: 9,
        lastShot: 0,
        fireRate: 160
    };

    let bullets = [];
    let enemies = [];
    let particles = [];
    let powerups = [];

    resizeCanvas();
    player.y = (canvas.height / (window.devicePixelRatio || 1)) - player.height - 70;

    window.addEventListener('resize', resizeCanvas);

    // ── MOBİL + KLAVYE KONTROLLER ──
    let keys = {};
    let touchMoveX = 0;          // -1 (sol) → +1 (sağ)
    let touchFire = false;

    // Klavye
    document.addEventListener('keydown', e => { keys[e.code] = true; if(e.code==='Space') e.preventDefault(); });
    document.addEventListener('keyup', e => keys[e.code] = false);

    // Dokunmatik (sol: hareket, sağ: ateş)
    function handleTouch(e) {
        e.preventDefault();
        touchMoveX = 0;
        touchFire = false;

        for (let touch of e.touches) {
            const tx = touch.clientX;
            const half = window.innerWidth / 2;

            if (tx < half) {
                // Sol taraf → hareket
                touchMoveX = (tx - half/2) / (half/2); // -1 ... +1 arası normalize
                touchMoveX = Math.max(-1, Math.min(1, touchMoveX));
            } else {
                // Sağ taraf → ateş
                touchFire = true;
            }
        }
    }

    canvas.addEventListener('touchstart', handleTouch, {passive:false});
    canvas.addEventListener('touchmove', handleTouch, {passive:false});
    canvas.addEventListener('touchend', () => { touchMoveX = 0; touchFire = false; }, {passive:false});
    canvas.addEventListener('touchcancel', () => { touchMoveX = 0; touchFire = false; }, {passive:false});

    function shoot() {
        const now = Date.now();
        if (now - player.lastShot < player.fireRate) return;
        player.lastShot = now;
        bullets.push({x: player.x + player.width/2 - 7, y: player.y - 15, w:14, h:28, speed:18});
    }

    function update() {
        if (!gameActive) return;

        // Hareket (klavye + dokunmatik)
        let moveDir = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) moveDir -= 1;
        if (keys['ArrowRight'] || keys['KeyD']) moveDir += 1;
        if (touchMoveX !== 0) moveDir = touchMoveX;

        player.x += moveDir * player.speed;

        const cw = canvas.width / (window.devicePixelRatio || 1);
        player.x = Math.max(30, Math.min(cw - player.width - 30, player.x));

        // Ateş (klavye + dokunmatik)
        if (keys['Space'] || touchFire) shoot();

        // Yıldızlar
        stars1.forEach(s => { s.y += s.speed; if(s.y > 2000) s.y = -50; });
        stars2.forEach(s => { s.y += s.speed; if(s.y > 2000) s.y = -50; });

        bullets = bullets.filter(b => { b.y -= b.speed; return b.y > -50; });

        // Düşman üretimi
        if (Math.random() < 0.022 + score * 0.0007) {
            const type = Math.random() < 0.3 ? 'fast' : 'normal';
            enemies.push({
                x: Math.random() * (cw - 70) + 35,
                y: -70,
                w: 52,
                h: 52,
                speed: type === 'fast' ? 5.5 + score*0.012 : 3.4 + score*0.009,
                type, color: type === 'fast' ? '#c026d3' : '#ff3333'
            });
        }

        // Power-up nadir
        if (Math.random() < 0.0035) {
            powerups.push({x: Math.random() * (cw - 40) + 20, y: -40, size: 22, speed: 2.8});
        }

        // Düşman + çarpışma
        enemies = enemies.filter((e, i) => {
            e.y += e.speed;

            if (player.x < e.x + e.w && player.x + player.width > e.x &&
                player.y < e.y + e.h && player.y + player.height > e.y) {
                lives--;
                updateLivesUI();
                createExplosion(e.x + e.w/2, e.y + e.h/2);
                if (lives <= 0) {
                    gameActive = false;
                    finalScoreEl.textContent = score;
                    gameOverScreen.classList.remove('hidden');
                }
                return false;
            }

            for (let j = bullets.length - 1; j >= 0; j--) {
                const b = bullets[j];
                if (b.x < e.x + e.w && b.x + b.w > e.x &&
                    b.y < e.y + e.h && b.y + b.h > e.y) {
                    bullets.splice(j,1);
                    createExplosion(e.x + e.w/2, e.y + e.h/2);
                    score += (e.type === 'fast' ? 15 : 10);
                    combo++;
                    lastComboTime = Date.now();
                    scoreEl.textContent = score;
                    return false;
                }
            }
            return e.y < (canvas.height / (window.devicePixelRatio || 1)) + 100;
        });

        // Power-up toplama
        powerups = powerups.filter(p => {
            p.y += p.speed;
            if (player.x < p.x + p.size && player.x + player.width > p.x &&
                player.y < p.y + p.size && player.y + player.height > p.y) {
                lives = Math.min(3, lives + 1);
                updateLivesUI();
                createExplosion(p.x, p.y, '#22ff88');
                return false;
            }
            return p.y < (canvas.height / (window.devicePixelRatio || 1)) + 100;
        });

        if (Date.now() - lastComboTime > 1800) combo = 0;
    }

    function updateLivesUI() {
        livesEl.classList.remove('hidden');
        livesEl.innerHTML = '❤️'.repeat(lives) + ' ' + (combo > 1 ? `Combo ×${combo}` : '');
    }

    function createExplosion(x, y, color = '#ff3366') {
        for (let i = 0; i < 18; i++) {
            particles.push({
                x, y,
                vx: Math.random()*12 - 6,
                vy: Math.random()*12 - 6,
                life: 28,
                color
            });
        }
    }

    function drawRoundRect(ctx, x, y, w, h, r) { /* senin eski drawRoundRect fonksiyonun aynı */ 
        ctx.beginPath();
        ctx.moveTo(x+r,y);
        ctx.lineTo(x+w-r,y);
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

        ctx.fillStyle = '#000814';
        ctx.fillRect(0, 0, cw, ch);

        // Yıldızlar
        ctx.shadowBlur = 6; ctx.shadowColor = '#a5f0ff'; ctx.fillStyle = '#a5f0ff';
        stars1.forEach(s => ctx.fillRect(s.x % cw, s.y % ch, s.size, s.size));
        ctx.shadowBlur = 12; ctx.shadowColor = '#ffffff'; ctx.fillStyle = '#ffffff';
        stars2.forEach(s => ctx.fillRect(s.x % cw, s.y % ch, s.size*1.4, s.size*1.4));

        // Gemi (havalı versiyon)
        ctx.shadowBlur = 35; ctx.shadowColor = '#00ffff'; ctx.fillStyle = '#00ddff';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width/2, player.y);
        ctx.lineTo(player.x, player.y + player.height - 10);
        ctx.lineTo(player.x + 12, player.y + player.height);
        ctx.lineTo(player.x + player.width - 12, player.y + player.height);
        ctx.lineTo(player.x + player.width, player.y + player.height - 10);
        ctx.closePath(); ctx.fill();

        ctx.shadowBlur = 25; ctx.fillStyle = '#00aaff';
        ctx.beginPath(); ctx.moveTo(player.x + 8, player.y + 35);
        ctx.lineTo(player.x - 12, player.y + player.height + 8);
        ctx.lineTo(player.x + 18, player.y + player.height - 12); ctx.fill();
        ctx.beginPath(); ctx.moveTo(player.x + player.width - 8, player.y + 35);
        ctx.lineTo(player.x + player.width + 12, player.y + player.height + 8);
        ctx.lineTo(player.x + player.width - 18, player.y + player.height - 12); ctx.fill();

        const flame = Math.sin(Date.now()/40) * 6 + 12;
        ctx.shadowBlur = 40; ctx.shadowColor = '#ff6600'; ctx.fillStyle = '#ffaa00';
        ctx.fillRect(player.x + player.width/2 - 8, player.y + player.height - 6, 16, flame);

        // Mermiler, düşmanlar, power-up, parçacıklar (önceki kodla aynı)
        ctx.shadowBlur = 18; ctx.shadowColor = '#ff00ff'; ctx.fillStyle = '#ff00ff';
        bullets.forEach(b => drawRoundRect(ctx, b.x, b.y, b.w, b.h, 6));

        enemies.forEach(e => {
            ctx.shadowBlur = 22; ctx.shadowColor = e.color; ctx.fillStyle = e.color;
            ctx.beginPath(); ctx.arc(e.x + e.w/2, e.y + e.h/2, e.w/2, 0, Math.PI*2); ctx.fill();
        });

        ctx.shadowBlur = 15; ctx.shadowColor = '#22ff88'; ctx.fillStyle = '#22ff88';
        powerups.forEach(p => {
            ctx.save(); ctx.translate(p.x + p.size/2, p.y + p.size/2);
            ctx.rotate(Math.sin(Date.now()/200) * 0.3);
            ctx.fillText('❤️', -p.size/2, p.size/2); ctx.restore();
        });

        particles = particles.filter(p => {
            p.x += p.vx; p.y += p.vy; p.life--;
            ctx.globalAlpha = p.life / 28;
            ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 5, 5);
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
        score = 0; lives = 3; combo = 0;
        bullets = []; enemies = []; particles = []; powerups = [];
        player.x = 120;
        player.y = (canvas.height / (window.devicePixelRatio || 1)) - player.height - 70;
        scoreEl.textContent = '0';
        updateLivesUI();
        gameOverScreen.classList.add('hidden');
        if (loadingEl) loadingEl.classList.add('hidden');
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', restart);
        restartBtn.addEventListener('touchstart', restart, {passive:false});
    }

    function cleanup() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        document.removeEventListener('keydown', ()=>{});
        document.removeEventListener('keyup', ()=>{});
        canvas.removeEventListener('touchstart', handleTouch);
        canvas.removeEventListener('touchmove', handleTouch);
        canvas.removeEventListener('touchend', ()=>{});
        canvas.removeEventListener('touchcancel', ()=>{});
        window.removeEventListener('resize', resizeCanvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (loadingEl) loadingEl.classList.add('hidden');
    }

    return cleanup;
}

window.initUzayFirtinasi = initUzayFirtinasi;
