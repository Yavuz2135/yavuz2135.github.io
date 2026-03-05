/**
 * YavuKan Games - Neon Velocity
 * Profesyonel Minimalist Runner Modeli
 */
function initNeonVelocity() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    
    // Ekran boyutlarını ayarla
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Oyun Değişkenleri
    let score = 0;
    let gameActive = true;
    let obstacles = [];
    let animationId;

    // Oyuncu Objesi
    const player = {
        x: 80,
        y: canvas.height - 150,
        width: 35,
        height: 35,
        dy: 0,
        jumpForce: 16,
        gravity: 0.9,
        grounded: false
    };

    // Engel Oluşturma Fonksiyonu
    function spawnObstacle() {
        if (Math.random() < 0.02) {
            obstacles.push({
                x: canvas.width,
                width: 30 + Math.random() * 40,
                height: 40 + Math.random() * 80,
                speed: 8 + (score / 15) // Skor arttıkça hızlanır
            });
        }
    }

    // Zıplama Kontrolü
    function jump() {
        if (player.grounded && gameActive) {
            player.dy = -player.jumpForce;
            player.grounded = false;
        }
    }

    // Hareket ve Fizik Hesaplamaları
    function update() {
        if (!gameActive) return;

        player.dy += player.gravity;
        player.y += player.dy;

        // Zemin Kontrolü (Neon Çizgisi)
        if (player.y + player.height > canvas.height - 100) {
            player.y = canvas.height - 100 - player.height;
            player.dy = 0;
            player.grounded = true;
        }

        // Engel Hareketleri ve Çarpışma
        obstacles.forEach((obs, index) => {
            obs.x -= obs.speed;

            // Profesyonel Çarpışma Algoritması
            if (player.x < obs.x + obs.width &&
                player.x + player.width > obs.x &&
                player.y + player.height > canvas.height - 100 - obs.height) {
                gameOver();
            }

            // Skoru Güncelle ve Ekrandan Çıkan Engeli Sil
            if (obs.x + obs.width < 0) {
                obstacles.splice(index, 1);
                score++;
                scoreEl.innerText = score;
            }
        });

        spawnObstacle();
    }

    // Görsel Çizim Fonksiyonu
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Neon Zemin Çizimi
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f2ff';
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 100);
        ctx.lineTo(canvas.width, canvas.height - 100);
        ctx.stroke();

        // 2. Oyuncu (Neon Kare)
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f2ff';
        ctx.fillStyle = '#00f2ff';
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // 3. Engeller (Neon Pembe)
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0055';
        ctx.fillStyle = '#ff0055';
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x, canvas.height - 100 - obs.height, obs.width, obs.height);
        });

        ctx.shadowBlur = 0; // Performans için diğer çizimlerde gölgeyi kapat
    }

    function gameLoop() {
        if (!gameActive) return;
        update();
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }

    function gameOver() {
        gameActive = false;
        cancelAnimationFrame(animationId);
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('final-score').innerText = score;
        
        // En yüksek skoru kaydet (LocalStorage)
        let high = localStorage.getItem('neonHighScore') || 0;
        if(score > high) {
            localStorage.setItem('neonHighScore', score);
            high = score;
        }
        document.getElementById('high-score').innerText = high;
    }

    // --- Kontrol Entegrasyonu ---
    
    // 1. Klavye: Boşluk veya Yukarı Ok
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') jump();
    });

    // 2. Mobil/Dokunmatik: Tüm ekrana tıklama
    window.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Sayfa kaymasını engelle
        jump();
    }, { passive: false });

    // 3. Mevcut Butonların (Varsa) Entegrasyonu
    const upBtn = document.getElementById('up');
    if(upBtn) upBtn.onclick = jump;

    // Oyunu Başlat
    gameLoop();
}
