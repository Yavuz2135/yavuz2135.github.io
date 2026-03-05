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

    function draw() {
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, canvas.height - 100, canvas.width, 2);
        ctx.fillStyle = '#0ff';
        ctx.shadowBlur = 15; ctx.shadowColor = '#0ff';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = '#f0f';
        ctx.shadowColor = '#f0f';
        obstacles.forEach(obs => ctx.fillRect(obs.x, canvas.height - 100 - obs.height, obs.width, obs.height));
        if (gameActive) requestAnimationFrame(() => { update(); draw(); });
    }
    draw();
}
