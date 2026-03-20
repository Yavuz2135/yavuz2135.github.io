// games/uzay-firtinasi/script.js - SÜPER VERSİYON (Mobil + Tüm hatalar düzeltildi)
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
    let difficulty = 1; // her 100 skor'da artar

    // Canvas (mobil için mükemmel)
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

    // Yıldızlar (nebula efekti)
    const starsSlow = Array.from({length:90}, () => ({x:Math.random()*2500, y:Math.random()*2500, size:Math.random()*2+0.5, speed:0.4+Math.random()}));
    const starsFast = Array.from({length:50}, () => ({x:Math.random()*2500, y:Math.random()*2500, size:Math.random()*3+1, speed:1.8+Math.random()}));

    // Oyuncu
    const player = { x:0, y:0, width:72, height:92, speed:8.5, lastShot:0, fireRate:145 };
    function resetPlayer() {
        const cw = canvas.width / (window.devicePixelRatio || 1);
        player.x = (cw - player.width) / 2;
        player.y = (canvas.height / (window.devicePixelRatio || 1)) - player.height - 90;
    }
    resetPlayer();

    let bullets = [];
    let enemies = [];
    let particles = [];
    let powerups = [];

    // ── MOBİL KONTROL (en temiz hali) ──
    let moveTouchId = null;
    let moveDelta = 0;
    let fireActive = false;

    function handleTouchStart(e) {
        e.preventDefault();
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

    function handleTouchMove(e) {
        e.preventDefault();
        if (moveTouchId === null) return;
        for (let t of e.touches) {
            if (t.identifier === moveTouchId) {
                const rect = canvas.getBoundingClientRect();
                const tx = t.clientX - rect.left;
                moveDelta = (tx - rect.width * 0.24) / (rect.width * 0.24);
                moveDelta = Math.max(-1.1, Math.min(1.1, moveDelta));
            }
        }
    }

    function handleTouchEnd(e) {
        e.preventDefault();
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

    // Klavye (test için)
    let keys = {};
    document.addEventListener('keydown', e => { keys[e.code] = true; });
    document.addEventListener('keyup', e => { keys[e.code] = false; });

    function shoot() {
        const now = Date.now();
        if (now - player.lastShot < player.fireRate) return;
        player.lastShot = now;
        bullets.push({x: player.x + player.width/2 - 7, y: player.y - 20, w:12, h:32, speed:19});
    }

    function update() {
        if (!gameActive) return;

        // Hareket
        let dir = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) dir -= 1;
        if (keys['ArrowRight'] || keys['KeyD']) dir += 1;
        if (moveTouchId !== null) dir += moveDelta;

        player.x += dir * player.speed;
        const cw = canvas.width / (window.devicePixelRatio || 1);
        player.x = Math.max(30, Math.min(cw - player.width - 30, player.x));

        // Ateş
        if (keys['Space'] || fireActive) shoot();

        // Yıldızlar
        starsSlow.forEach(s => { s.y += s.speed; if(s.y > 2500) s.y = -50; });
        starsFast.forEach(s => { s.y += s.speed; if(s.y > 2500) s.y = -50; });

        bullets = bullets.filter(b => { b.y -= b.speed; return b.y > -50; });

        // Zorluk artışı
        if (score % 80 === 0 && score > 0) difficulty = Math.min(3, difficulty + 0.15);

        // Düşman
        if (Math.random() < 0.018 + score * 0.0004) {
            const fast = Math.random() < 0.25;
            enemies.push({
                x: Math.random() * (cw - 80) + 40,
                y: -70,
                w: 54,
                h: 54,
                speed: (fast ? 5.8 : 3.6) + score*0.008 + difficulty,
                type: fast ? 'fast' : 'normal',
                color: fast ? '#c026d3' : '#ff3366'
            });
        }

        // Power-up
        if (Math.random() < 0.004) powerups.push({x: Math.random()*(cw-40)+20, y:-40, size:24, speed:2.6});

        // Çarpışmalar
        enemies = enemies.filter((e,i) => {
            e.y += e.speed;

            // Gemi çarpışma
            if (player.x < e.x + e.w && player.x + player.width > e.x &&
                player.y < e.y + e.h && player.y + player.height > e.y) {
                lives--;
                updateLivesUI();
                createExplosion(e.x + e.w/2, e.y + e.h/2, '#ff0000');
                if (lives <= 0) endGame();
                return false;
            }

            // Mermi çarpışma
            for (let j=bullets.length-1; j>=0; j--) {
                const b = bullets[j];
                if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                    bullets.splice(j,1);
                    createExplosion(e.x + e.w/2, e.y + e.h/2);
                    score += e.type === 'fast' ? 18 : 12;
                    combo++;
                    lastComboTime = Date.now();
                    scoreEl.textContent = score;
                    return false;
                }
            }
            return e.y < (canvas.height / (window.devicePixelRatio || 1)) + 120;
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

        if (Date.now() - lastComboTime > 1600) combo = 0;
    }

    function endGame() {
        gameActive = false;
        finalScoreEl.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }

    function updateLivesUI() {
        livesEl.innerHTML = '❤️'.repeat(lives) + (combo > 2 ? ` <span style="color:#ff0">×${combo}</span>` : '');
    }

    function createExplosion(x, y, color = '#ff3366') {
        for (let i = 0; i < 22; i++) {
            particles.push({
                x, y,
                vx: Math.random()*14-7,
                vy: Math.random()*14-7,
                life: 32,
                color,
                size: Math.random()*4 + 3
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

        // Arka plan (nebula)
        const grad = ctx.createLinearGradient(0,0,0,ch);
        grad.addColorStop(0, '#000814');
        grad.addColorStop(1, '#001122');
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,cw,ch);

        // Yıldızlar
        ctx.shadowBlur = 8; ctx.shadowColor = '#a5f0ff';
        starsSlow.forEach(s => ctx.fillRect(s.x % cw, s.y % ch, s.size, s.size));
        ctx.shadowBlur = 14; ctx.shadowColor = '#ffffff';
        starsFast.forEach(s => ctx.fillRect(s.x % cw, s.y % ch, s.size*1.5, s.size*1.5));

        // Gemi (çok daha havalı)
        ctx.shadowBlur = 38; ctx.shadowColor = '#00ffff'; ctx.fillStyle = '#00eeff';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width/2, player.y);
        ctx.lineTo(player.x, player.y + player.height - 12);
        ctx.lineTo(player.x + 14, player.y + player.height);
        ctx.lineTo(player.x + player.width - 14, player.y + player.height);
        ctx.lineTo(player.x + player.width, player.y + player.height - 12);
        ctx.closePath(); ctx.fill();

        // Kanatlar + motor alevi
        ctx.shadowBlur = 28; ctx.fillStyle = '#00aaff';
        ctx.beginPath(); ctx.moveTo(player.x+10, player.y+38);
        ctx.lineTo(player.x-18, player.y+player.height+15);
        ctx.lineTo(player.x+22, player.y+player.height-10); ctx.fill();
        ctx.beginPath(); ctx.moveTo(player.x+player.width-10, player.y+38);
        ctx.lineTo(player.x+player.width+18, player.y+player.height+15);
        ctx.lineTo(player.x+player.width-22, player.y+player.height-10); ctx.fill();

        const flame = Math.sin(Date.now()/35)*7 + 14;
        ctx.shadowBlur = 45; ctx.shadowColor = '#ff8800'; ctx.fillStyle = '#ffdd00';
        ctx.fillRect(player.x + player.width/2 - 9, player.y + player.height - 8, 18, flame);

        // Mermiler (trail efekti)
        ctx.shadowBlur = 20; ctx.shadowColor = '#ff00ff'; ctx.fillStyle = '#ff00ff';
        bullets.forEach(b => drawRoundRect(b.x, b.y, b.w, b.h, 5));

        // Düşmanlar
        enemies.forEach(e => {
            ctx.shadowBlur = 24; ctx.shadowColor = e.color; ctx.fillStyle = e.color;
            ctx.beginPath(); ctx.arc(e.x+e.w/2, e.y+e.h/2, e.w/2, 0, Math.PI*2); ctx.fill();
        });

        // Power-up
        ctx.shadowBlur = 18; ctx.shadowColor = '#22ff88'; ctx.fillStyle = '#22ff88';
        powerups.forEach(p => {
            ctx.save(); ctx.translate(p.x+p.size/2, p.y+p.size/2);
            ctx.rotate(Math.sin(Date.now()/180)*0.4);
            ctx.fillText('❤️', -p.size/2, p.size/2); ctx.restore();
        });

        // Patlama efekti
        particles = particles.filter(p => {
            p.x += p.vx; p.y += p.vy; p.life--;
            ctx.globalAlpha = p.life / 32;
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
        document.removeEventListener('keydown', ()=>{});
        document.removeEventListener('keyup', ()=>{});
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
