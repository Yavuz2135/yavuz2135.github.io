function initNeonVelocity() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let score = 0;
    let gameActive = true;
    let obstacles = [];
    
    const player = {
        x: 80,
        y: canvas.height - 150,
        width: 35,
        height: 35,
        dy: 0,
        jumpForce: 20, // YÜKSEK ZIPLAMA AYARI
        gravity: 0.6,  // SÜZÜLME AYARI
        grounded: false
    };

    function jump() {
        if (player.grounded && gameActive) {
            player.dy = -player.jumpForce;
            player.grounded = false;
        }
    }

    window.onkeydown = (e) => { if(e.code === 'Space') jump(); };
    window.ontouchstart = () => { jump(); };

    function update() {
        if (!gameActive) return;
        player.dy += player.gravity;
        player.y += player.dy;

        if (player.y + player.height > canvas.height - 100) {
            player.y = canvas.height - 100 - player.height;
            player.dy = 0;
            player.grounded = true;
        }

        if (Math.random() < 0.02) {
            obstacles.push({ x: canvas.width, width: 40, height: 50 + Math.random() * 50, speed: 8 + (score / 10) });
        }

        obstacles.forEach((obs, i) => {
            obs.x -= obs.speed;
            if (player.x < obs.x + obs.width && player.x + player.width > obs.x && player.y + player.height > canvas.height - 100 - obs.height) {
                gameActive = false;
                document.getElementById('game-over-screen').classList.remove('hidden');
                document.getElementById('final-score').innerText = score;
            }
            if (obs.x + obs.width < 0) { obstacles.splice(i, 1); score++; scoreEl.innerText = score; }
        });
    }

    // --- oyun1.js dosyasındaki Draw fonksiyonunu bu kodla değiştirin ---

function draw() {
    // 1. Arka Planı Temizle
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Neon Zemin Çizimi
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#0ff';
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 100);
    ctx.lineTo(canvas.width, canvas.height - 100);
    ctx.stroke();

    // ---------------------------------------------------------
    // 3. YAVUKAN KARAKTER TASARIMI (Burayı ekledik)
    // ---------------------------------------------------------
    
    // Karakterin Ana Rengi (Gövde)
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#0ff'; // Parlama rengi
    ctx.fillStyle = '#0ff'; // İç renk
    
    // Zıplarken şekil değiştirme efekti (Stretch)
    let drawHeight = player.height;
    let drawY = player.y;
    if (!player.grounded) {
        // Havadaysa hafifçe uzar
        drawHeight = player.height + 5;
        drawY = player.y - 5;
    }

    // Karakterin Gövdesini Çiz (Hafif yuvarlak köşeli)
    drawRoundRect(ctx, player.x, drawY, player.width, drawHeight, 5);
    ctx.fill();

    // -- Gözler (Neon Efektli) --
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fillStyle = '#fff';
    
    // Sol Göz
    ctx.fillRect(player.x + 8, drawY + 8, 6, 6);
    // Sağ Göz
    ctx.fillRect(player.x + 20, drawY + 8, 6, 6);

    // -- Bacaklar (Yürüyüş Animasyonu) --
    if (player.grounded && gameActive) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0ff';
        ctx.fillStyle = '#0ff';
        
        // Zamanlama tabanlı basit bacak hareketi
        let legMove = Math.sin(Date.now() / 100) * 3;
        
        // Sol Bacak
        ctx.fillRect(player.x + 5, drawY + drawHeight, 8, 8 + legMove);
        // Sağ Bacak
        ctx.fillRect(player.x + 22, drawY + drawHeight, 8, 8 - legMove);
    }
    
    // ---------------------------------------------------------
    // 4. Engelleri Çiz (Mevcut kodunuz)
    // ---------------------------------------------------------
    ctx.fillStyle = '#f0f';
    ctx.shadowColor = '#f0f';
    ctx.shadowBlur = 15;
    obstacles.forEach(obs => {
        drawRoundRect(ctx, obs.x, canvas.height - 100 - obs.height, obs.width, obs.height, 5);
        ctx.fill();
    });

    ctx.shadowBlur = 0; // Performans için gölgeleri kapa
    
    if (gameActive) requestAnimationFrame(() => { update(); draw(); });
}

// Köşeleri yuvarlatmak için yardımcı fonksiyon (Dosyanın en altına ekleyebilirsiniz)
function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
