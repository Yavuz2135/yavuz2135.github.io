function initNeonVelocity() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    
    // Canvas boyutlarını güncelle
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
        jumpForce: 20,
        gravity: 0.6,
        grounded: false
    };

    function jump() {
        if (player.grounded && gameActive) {
            player.dy = -player.jumpForce;
            player.grounded = false;
        }
    }

    // Kontrolleri başlat
    window.onkeydown = (e) => { if(e.code === 'Space') jump(); };
    window.ontouchstart = (e) => { e.preventDefault(); jump(); };

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

    function draw() {
        if (!gameActive) return;

        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0ff';
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 100);
        ctx.lineTo(canvas.width, canvas.height - 100);
        ctx.stroke();

        ctx.shadowBlur = 20;
        ctx.shadowColor = '#0ff';
        ctx.fillStyle = '#0ff';
        
        let drawHeight = player.height;
        let drawY = player.y;
        if (!player.grounded) {
            drawHeight = player.height + 5;
            drawY = player.y - 5;
        }

        drawRoundRect(ctx, player.x, drawY, player.width, drawHeight, 5);
        ctx.fill();

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
        ctx.fillStyle = '#fff';
        ctx.fillRect(player.x + 8, drawY + 8, 6, 6);
        ctx.fillRect(player.x + 20, drawY + 8, 6, 6);

        if (player.grounded) {
            ctx.fillStyle = '#0ff';
            let legMove = Math.sin(Date.now() / 100) * 3;
            ctx.fillRect(player.x + 5, drawY + drawHeight, 8, 8 + legMove);
            ctx.fillRect(player.x + 22, drawY + drawHeight, 8, 8 - legMove);
        }
        
        ctx.fillStyle = '#f0f';
        ctx.shadowColor = '#f0f';
        ctx.shadowBlur = 15;
        obstacles.forEach(obs => {
            drawRoundRect(ctx, obs.x, canvas.height - 100 - obs.height, obs.width, obs.height, 5);
            ctx.fill();
        });

        ctx.shadowBlur = 0;
        
        update();
        requestAnimationFrame(draw);
    }

    draw();
}
