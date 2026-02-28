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
 
    // Controls
    const keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false, Space: false };
    let touchX = w / 2;
    let mouseX = w / 2;
    let isShooting = false;
    let isMouseDown = false;
    
    const keydownHandler = e => { if(keys.hasOwnProperty(e.key) || e.key === ' ') keys[e.key === ' ' ? 'Space' : e.key] = true; };
    const keyupHandler = e => { 
        if(keys.hasOwnProperty(e.key) || e.key === ' ') keys[e.key === ' ' ? 'Space' : e.key] = false; 
        if(isGameOver && e.code === 'Space') reset();
    };
 
    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);
 
    // Mouse controls
    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
    });
 
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        mouseX = e.clientX;
        isShooting = true;
    });
 
    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
        isShooting = false;
    });
 
    // Touch controls
    function handleTouch(e) {
        e.preventDefault();
        for(let i=0; i<e.touches.length; i++) {
            const touch = e.touches[i];
            if(touch.clientX < w / 2) touchX = touch.clientX;
            else isShooting = true;
        }
    }
 
    canvas.addEventListener('touchstart', handleTouch, {passive: false});
    canvas.addEventListener('touchmove', handleTouch, {passive: false});
    canvas.addEventListener('touchend', () => {
        isShooting = false;
        touchX = w / 2;
    });
 
    class Player {
        constructor() {
            this.x = w / 2; this.y = h - 100; this.size = 20;
            this.vx = 0; this.friction = 0.85; this.cooldown = 0;
            this.powerups = { triple: 0, shield: 0, magnet: 0, slow: 0 };
        }
        update() {
            if (keys.ArrowLeft || keys.a) this.vx -= 1.5;
            if (keys.ArrowRight || keys.d) this.vx += 1.5;
            
            // Mouse kontrolü - sadece mousedown olduğunda
            if (isMouseDown && Math.abs(this.x - mouseX) > 10) {
                this.vx += (mouseX - this.x) * 0.05;
            }
            
            // Touch kontrolü
            if (Math.abs(this.x - touchX) > 10) this.vx += (touchX - this.x) * 0.05;
 
            this.vx *= this.friction; this.x += this.vx;
            if (this.x < this.size) this.x = this.size;
            if (this.x > w - this.size) this.x = w - this.size;
 
            if (this.cooldown > 0) this.cooldown--;
            if ((keys.Space || isShooting) && this.cooldown === 0) { this.shoot(); this.cooldown = 10; }
            for(let p in this.powerups) if(this.powerups[p] > 0) this.powerups[p]--;
        }
        shoot() {
            if(this.powerups.triple > 0) {
                bullets.push(new Bullet(this.x, this.y, -2), new Bullet(this.x, this.y, 0), new Bullet(this.x, this.y, 2));
            } else { bullets.push(new Bullet(this.x, this.y, 0)); }
            createParticles(this.x, this.y, '#0ff', 3);
            if(navigator.vibrate) navigator.vibrate(10);
        }
        draw() {
            ctx.save(); ctx.translate(this.x, this.y);
            if(this.powerups.shield > 0) {
                ctx.beginPath(); ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 255, 255, ${Math.random()})`; ctx.lineWidth = 3; ctx.stroke();
            }
            ctx.shadowBlur = 15; ctx.shadowColor = '#0ff'; ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.moveTo(0, -this.size); ctx.lineTo(this.size, this.size); ctx.lineTo(-this.size, this.size); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#0ff';
            ctx.beginPath(); ctx.moveTo(-10, this.size); ctx.lineTo(10, this.size); ctx.lineTo(0, this.size + Math.random() * 20 + 10); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
    }
 
    class Bullet {
        constructor(x, y, vx) { this.x = x; this.y = y; this.vx = vx; this.vy = -15; this.size = 4; }
        update() { this.x += this.vx; this.y += this.vy; }
        draw() { ctx.fillStyle = '#0ff'; ctx.shadowBlur = 10; ctx.shadowColor = '#0ff'; ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size*3); ctx.shadowBlur = 0; }
    }
 
    class Enemy {
        constructor() {
            this.x = Math.random() * (w - 40) + 20; this.y = -50; this.size = Math.random() * 15 + 15;
            this.type = Math.random() > 0.7 ? 'zigzag' : 'straight';
            this.vx = this.type === 'zigzag' ? (Math.random() > 0.5 ? 2 : -2) : 0;
            this.vy = (Math.random() * 2 + 2) * gameSpeed;
            this.hp = Math.floor(this.size / 10);
        }
        update() {
            let actualVy = this.vy; if(player && player.powerups.slow > 0) actualVy *= 0.5;
            this.y += actualVy;
            if(this.type === 'zigzag') { this.x += this.vx; if(this.x < 0 || this.x > w) this.vx *= -1; }
        }
        draw() { ctx.fillStyle = '#f00'; ctx.shadowBlur = 15; ctx.shadowColor = '#f00'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
    }
 
    class Orb {
        constructor() { this.x = Math.random() * (w - 20) + 10; this.y = -20; this.size = 8; this.vy = 3 * gameSpeed; }
        update() {
            if(player && player.powerups.magnet > 0) {
                const dx = player.x - this.x, dy = player.y - this.y, dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < 300) { this.x += (dx / dist) * 5; this.y += (dy / dist) * 5; } else this.y += this.vy;
            } else { this.y += this.vy; }
        }
        draw() { ctx.fillStyle = '#0f0'; ctx.shadowBlur = 10; ctx.shadowColor = '#0f0'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0; }
    }
 
    class Particle {
        constructor(x, y, color) { this.x = x; this.y = y; this.color = color; this.vx = (Math.random() - 0.5) * 10; this.vy = (Math.random() - 0.5) * 10; this.life = 1; this.decay = Math.random() * 0.05 + 0.02; }
        update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
        draw() { ctx.globalAlpha = this.life; ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, 4, 4); ctx.globalAlpha = 1; }
    }
 
    class PowerUp {
        constructor() {
            this.x = Math.random() * (w - 30) + 15; this.y = -30; this.size = 15; this.vy = 2;
            const types = ['triple', 'shield', 'slow', 'magnet'];
            this.type = types[Math.floor(Math.random() * types.length)];
            this.colors = { triple: '#ff0', shield: '#0ff', slow: '#00f', magnet: '#f0f' };
        }
        update() { this.y += this.vy; }
        draw() { ctx.fillStyle = this.colors[this.type]; ctx.shadowBlur = 20; ctx.shadowColor = this.colors[this.type]; ctx.fillRect(this.x - this.size, this.y - this.size, this.size*2, this.size*2); ctx.fillStyle = '#000'; ctx.font = '12px Arial'; ctx.fillText(this.type[0].toUpperCase(), this.x - 4, this.y + 4); ctx.shadowBlur = 0; }
    }
 
    class Star {
        constructor() { this.x = Math.random() * w; this.y = Math.random() * h; this.size = Math.random() * 2; this.vy = this.size * 0.5; }
        update() { let actualVy = this.vy * gameSpeed; if(player && player.powerups.slow > 0) actualVy *= 0.5; this.y += actualVy; if(this.y > h) { this.y = 0; this.x = Math.random() * w; } }
        draw() { ctx.fillStyle = `rgba(255, 255, 255, ${this.size/2})`; ctx.fillRect(this.x, this.y, this.size, this.size); }
    }
 
    let player, bullets = [], enemies = [], orbs = [], particles = [], powerups = [], stars = Array(100).fill().map(() => new Star()), frames = 0, shakeTimer = 0;
 
    function createParticles(x, y, color, count) { for(let i=0; i<count; i++) particles.push(new Particle(x, y, color)); }
 
    function reset() {
        player = new Player(); bullets = []; enemies = []; orbs = []; particles = []; powerups = [];
        score = 0; lives = 3; combo = 1; gameSpeed = 1; isGameOver = false; frames = 0;
        updateUI(); gameOverScreen.classList.add('hidden');
    }
 
    function updateUI() { scoreEl.innerText = score; comboEl.innerText = combo; livesEl.innerText = '❤️'.repeat(lives); }
 
    function hitPlayer() {
        if(player.powerups.shield > 0) return;
        createParticles(player.x, player.y, '#f00', 30); shakeTimer = 10;
        if(navigator.vibrate) navigator.vibrate(200);
        lives--; combo = 1; updateUI();
        if(lives <= 0) {
            isGameOver = true;
            if(score > highScore) { highScore = score; localStorage.setItem('uzayHighScore', highScore); }
            finalScoreEl.innerText = score; highScoreEl.innerText = highScore; gameOverScreen.classList.remove('hidden');
        }
    }
 
    document.getElementById('btn-restart').onclick = reset;
 
    function loop() {
        if(!isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.fillRect(0, 0, w, h);
            if(shakeTimer > 0) { ctx.save(); ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10); shakeTimer--; }
 
            stars.forEach(s => { s.update(); s.draw(); });
            player.update(); player.draw();
 
            frames++;
            if(frames % Math.max(30, 60 - Math.floor(gameSpeed*10)) === 0) enemies.push(new Enemy());
            if(frames % 40 === 0) orbs.push(new Orb());
            if(frames % 600 === 0) powerups.push(new PowerUp());
 
            gameSpeed += 0.0005;
            if(comboTimer > 0) comboTimer--; else combo = 1; updateUI();
 
            bullets.forEach((b, bi) => { b.update(); b.draw(); if(b.y < 0) bullets.splice(bi, 1); });
            enemies.forEach((e, ei) => {
                e.update(); e.draw(); if(e.y > h) { enemies.splice(ei, 1); combo = 1; }
                bullets.forEach((b, bi) => {
                    if(Math.hypot(b.x - e.x, b.y - e.y) < e.size + b.size) {
                        bullets.splice(bi, 1); e.hp--; createParticles(b.x, b.y, '#f00', 5);
                        if(e.hp <= 0) { enemies.splice(ei, 1); createParticles(e.x, e.y, '#f90', 20); shakeTimer = 3; score += 10 * combo; combo = Math.min(4, combo + 1); comboTimer = 180; if(navigator.vibrate) navigator.vibrate(20); updateUI(); }
                    }
                });
                if(Math.hypot(player.x - e.x, player.y - e.y) < player.size + e.size) { enemies.splice(ei, 1); hitPlayer(); }
            });
            orbs.forEach((o, oi) => {
                o.update(); o.draw(); if(o.y > h) orbs.splice(oi, 1);
                if(Math.hypot(player.x - o.x, player.y - o.y) < player.size + o.size) { orbs.splice(oi, 1); score += 5 * combo; createParticles(o.x, o.y, '#0f0', 10); if(navigator.vibrate) navigator.vibrate(10); updateUI(); }
            });
            powerups.forEach((p, pi) => {
                p.update(); p.draw(); if(p.y > h) powerups.splice(pi, 1);
                if(Math.hypot(player.x - p.x, player.y - p.y) < player.size + p.size) { powerups.splice(pi, 1); player.powerups[p.type] = 60 * (p.type === 'triple' ? 5 : p.type === 'shield' ? 6 : p.type === 'slow' ? 8 : 10); createParticles(p.x, p.y, p.colors[p.type], 20); }
            });
            particles.forEach((p, pi) => { p.update(); p.draw(); if(p.life <= 0) particles.splice(pi, 1); });
 
            if(shakeTimer > 0) ctx.restore();
        }
        animationId = requestAnimationFrame(loop);
    }
 
    // Cleanup when leaving
    window.stopUzayFirtinasi = () => { cancelAnimationFrame(animationId); document.removeEventListener('keydown', keydownHandler); document.removeEventListener('keyup', keyupHandler); };
 
    reset(); loop();
}
