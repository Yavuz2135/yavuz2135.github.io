let animationId;

function initUzayFirtinasi() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let w = canvas.width;
    let h = canvas.height;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        w = canvas.width;
        h = canvas.height;
    });

    let score = 0, lives = 3, combo = 1, comboTimer = 0, isGameOver = false, gameSpeed = 1;
    let highScore = localStorage.getItem('uzayHighScore') || 0;

    const scoreEl = document.getElementById('score');
    const comboEl = document.getElementById('combo');
    const livesEl = document.getElementById('lives');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreEl = document.getElementById('final-score');
    const highScoreEl = document.getElementById('high-score');

    // ===== CONTROLS =====
    const keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false, Space: false };

    let touchX = w / 2;
    let isShooting = false;
    let isTouchDevice = false;

    const keydownHandler = e => {
        if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
        if (e.code === 'Space') keys.Space = true;
    };

    const keyupHandler = e => {
        if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
        if (e.code === 'Space') keys.Space = false;
        if (isGameOver && e.code === 'Space') reset();
    };

    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);

    function handleTouch(e) {
        e.preventDefault();
        isTouchDevice = true;

        const rect = canvas.getBoundingClientRect();

        for (let i = 0; i < e.touches.length; i++) {
            const relativeX = e.touches[i].clientX - rect.left;

            if (relativeX < w / 2) {
                touchX = relativeX;
            } else {
                isShooting = true;
            }
        }
    }

    function stopShooting() {
        isShooting = false;
    }

    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', stopShooting);

    // ===== PLAYER =====
    class Player {
        constructor() {
            this.x = w / 2;
            this.y = h - 100;
            this.size = 20;
            this.vx = 0;
            this.friction = 0.85;
            this.cooldown = 0;
            this.powerups = { triple: 0, shield: 0, magnet: 0, slow: 0 };
        }

        update() {

            // PC Movement
            if (!isTouchDevice) {
                if (keys.ArrowLeft || keys.a) this.vx -= 1.5;
                if (keys.ArrowRight || keys.d) this.vx += 1.5;
            }

            // Mobile Movement
            if (isTouchDevice) {
                if (Math.abs(this.x - touchX) > 10) {
                    this.vx += (touchX - this.x) * 0.05;
                }
            }

            this.vx *= this.friction;
            this.x += this.vx;

            if (this.x < this.size) this.x = this.size;
            if (this.x > w - this.size) this.x = w - this.size;

            if (this.cooldown > 0) this.cooldown--;

            if ((keys.Space || isShooting) && this.cooldown === 0) {
                this.shoot();
                this.cooldown = 10;
            }

            for (let p in this.powerups)
                if (this.powerups[p] > 0) this.powerups[p]--;
        }

        shoot() {
            bullets.push(new Bullet(this.x, this.y));
            if (navigator.vibrate) navigator.vibrate(10);
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size, this.size);
            ctx.lineTo(-this.size, this.size);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    class Bullet {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vy = -15;
            this.size = 4;
        }

        update() {
            this.y += this.vy;
        }

        draw() {
            ctx.fillStyle = '#0ff';
            ctx.fillRect(this.x - 2, this.y - 6, 4, 10);
        }
    }

    class Enemy {
        constructor() {
            this.x = Math.random() * (w - 40) + 20;
            this.y = -40;
            this.size = 20;
            this.vy = 3 * gameSpeed;
        }

        update() {
            this.y += this.vy;
        }

        draw() {
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let player, bullets = [], enemies = [], frames = 0;

    function reset() {
        player = new Player();
        bullets = [];
        enemies = [];
        score = 0;
        lives = 3;
        gameSpeed = 1;
        isGameOver = false;
        gameOverScreen.classList.add('hidden');
    }

    function hitPlayer() {
        lives--;
        if (lives <= 0) {
            isGameOver = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('uzayHighScore', highScore);
            }
            finalScoreEl.innerText = score;
            highScoreEl.innerText = highScore;
            gameOverScreen.classList.remove('hidden');
        }
    }

    function loop() {
        ctx.clearRect(0, 0, w, h);

        if (!isGameOver) {

            player.update();
            player.draw();

            frames++;

            if (frames % 60 === 0)
                enemies.push(new Enemy());

            bullets.forEach((b, i) => {
                b.update();
                b.draw();
                if (b.y < 0) bullets.splice(i, 1);
            });

            enemies.forEach((e, ei) => {
                e.update();
                e.draw();

                if (e.y > h) enemies.splice(ei, 1);

                bullets.forEach((b, bi) => {
                    if (Math.hypot(b.x - e.x, b.y - e.y) < e.size) {
                        bullets.splice(bi, 1);
                        enemies.splice(ei, 1);
                        score += 10;
                    }
                });

                if (Math.hypot(player.x - e.x, player.y - e.y) < e.size + player.size) {
                    enemies.splice(ei, 1);
                    hitPlayer();
                }
            });
        }

        animationId = requestAnimationFrame(loop);
    }

    window.stopUzayFirtinasi = () => {
        cancelAnimationFrame(animationId);
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('keyup', keyupHandler);
        canvas.removeEventListener('touchstart', handleTouch);
        canvas.removeEventListener('touchmove', handleTouch);
        canvas.removeEventListener('touchend', stopShooting);
    };

    reset();
    loop();
}
