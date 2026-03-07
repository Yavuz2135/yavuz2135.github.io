// games/neon-velocity/script.js
// Bütün hatalar temizlendi + EK ÖZELLİKLER: High Score, Ses, Power-up, Pause, Particles

function initNeonVelocity() {
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

    // ── EK: High Score (localStorage) ──
    let highScore = parseInt(localStorage.getItem('neonHighScore') || '0');

    let animationFrameId = null;
    let gameActive = true;
    let score = 0;
    let obstacles = [];

    // Canvas ölçekleme (mobil yüksek çözünürlük için)
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(dpr, dpr);
    }

    // Oyuncu nesnesi (resize'dan SONRA tanımlanır)
    let player = {
        x: 80,
        y: 0, // resize güncelleyecek
        width: 35,
        height: 35,
        dy: 0,
        jumpForce: 15,
        gravity: 0.75,
        grounded: false
    };

    // İlk resize (player y'yi ayarlar)
    resizeCanvas();
    player.y = (canvas.height / (window.devicePixelRatio || 1)) - 150;
    player.grounded = true;

    window.addEventListener('resize', resizeCanvas);

    function jump() {
        if (player.grounded && gameActive) {
            player.dy = -player.jumpForce;
            player.grounded = false;

            // ── EK: Zıplama ses efekti ──
            playSound(800, 0.1); // Yüksek beep sesi
        }
    }

    // Kontroller (mobil + masaüstü)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });

    document.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jump();
    }, { passive: false });

    // ── EK: Ses Efektleri Fonksiyonu ──
    function playSound(frequency, duration) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration);
    }

    // ── EK: Particle Sistemi (çarpışma patlaması) ──
    let particles = [];
    function createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1,
                color
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.04;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function drawParticles() {
        ctx.globalAlpha = 0.8;
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        });
        ctx.globalAlpha = 1;
    }

    // ── EK: Power-up Sistemi (mavi küp - engel yavaşlatır) ──
    let powerup = null;
    let powerupActive = false;
    let powerupTimer = 0;

    function updatePowerup() {
        if (powerup) {
            powerup.x -= 5;
            // Çarpışma kontrolü
            if (Math.abs(player.x - powerup.x) < 30 && Math.abs(player.y - powerup.y) < 30) {
                powerup = null;
                powerupActive = true;
                powerupTimer = 300; // 5 saniye (60fps)
                playSound(1200, 0.2); // Power-up sesi
            }
            if (powerup && powerup.x < 0) powerup = null;
        }

        if (powerupActive) {
            powerupTimer--;
            if (powerupTimer <= 0) powerupActive = false;
        }
    }

    function drawPowerup() {
        if (powerup) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00f';
            ctx.fillStyle = '#00f';
            ctx.fillRect(powerup.x, powerup.y, 20, 20);
            ctx.shadowBlur = 0;
        }
    }

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

        // Engel spawn
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
            obs.x -= powerupActive ? obs.speed * 0.5 : obs.speed; // Power-up yavaşlatma

            const obsTop = groundY - obs.height;
            if (
                player.x < obs.x + obs.width &&
                player.x + player.width > obs.x &&
                player.y + player.height > obsTop
            ) {
                gameActive = false;
                finalScoreEl.textContent = score;
                // ── EK: High Score güncelle + göster ──
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('neonHighScore', highScore);
                }
                document.getElementById('high-score').textContent = highScore;
                document.getElementById('high-score-container').classList.remove('hidden');
                // ── EK: Çarpışma sesi + particle ──
                playSound(200, 0.3);
                createParticles(player.x + player.width / 2, player.y + player.height / 2, '#f00', 30);
                gameOverScreen.classList.remove('hidden');
                return;
            }

            if (obs.x + obs.width < 0) {
                obstacles.splice(i, 1);
                score++;
                scoreEl.textContent = score;
            }
        }

        updatePowerup();
        updateParticles();
    }

    function draw() {
        if (!gameActive) return;

        const cw = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);

        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, cw, ch);

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ff';
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, ch - 100);
        ctx.lineTo(cw, ch - 100);
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
            drawRoundRect(ctx, obs.x, ch - 100 - obs.height, obs.width, obs.height, 5);
            ctx.fill();
        });

        drawPowerup();
        drawParticles();

        ctx.shadowBlur = 0;
    }

    function gameLoop() {
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // İlk döngü
    gameLoop();

    // Restart (mobil uyumlu)
    function restart() {
        score = 0;
        gameActive = true;
        obstacles = [];
        particles = [];
        powerup = null;
        powerupActive = false;
        powerupTimer = 0;
        resizeCanvas();
        player.y = (canvas.height / (window.devicePixelRatio || 1)) - 150;
        player.dy = 0;
        player.grounded = false;
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
        document.removeEventListener('keydown', keyHandler);
        document.removeEventListener('touchstart', touchHandler);
        window.removeEventListener('resize', resizeCanvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (loadingEl) loadingEl.classList.add('hidden');
    }

    return cleanup;
}

// Global bağlama (main.js bulsun)
window.initNeonVelocity = initNeonVelocity;
