<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neon Velocity</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            overflow: hidden;
            font-family: 'Arial', sans-serif;
            background: #050510;
        }
        #gameCanvas {
            display: block;
        }
        #score {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #0ff;
            font-size: 28px;
            font-weight: bold;
            text-shadow: 0 0 10px #0ff;
            z-index: 10;
        }
        #game-over-screen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(5, 5, 16, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #0ff;
            font-size: 36px;
            text-align: center;
            text-shadow: 0 0 20px #0ff;
            z-index: 20;
        }
        #game-over-screen h1 {
            margin-bottom: 20px;
            font-size: 48px;
        }
        #final-score {
            font-size: 28px;
            margin: 10px 0;
        }
        button {
            background: linear-gradient(45deg, #0ff, #00ccff);
            color: #000;
            border: none;
            padding: 15px 30px;
            font-size: 24px;
            font-weight: bold;
            border-radius: 10px;
            cursor: pointer;
            box-shadow: 0 0 20px #0ff;
            transition: all 0.3s;
        }
        button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 30px #0ff;
        }
        .hidden {
            display: none !important;
        }
        @media (max-width: 600px) {
            #score { font-size: 24px; left: 10px; top: 10px; }
            #game-over-screen { font-size: 28px; }
            #game-over-screen h1 { font-size: 36px; }
            button { font-size: 20px; padding: 12px 24px; }
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <div id="score">0</div>
    <div id="game-over-screen" class="hidden">
        <h1>Game Over!</h1>
        <p>Final Score: <span id="final-score">0</span></p>
        <button id="restartBtn">Restart</button>
    </div>

    <script>
        function initNeonVelocity() {
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');
            const scoreEl = document.getElementById('score');
            const gameOverScreen = document.getElementById('game-over-screen');
            const finalScoreEl = document.getElementById('final-score');
            const restartBtn = document.getElementById('restartBtn');

            // Canvas boyutlarını ayarla
            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

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

            // Kontroller
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space') {
                    e.preventDefault();
                    jump();
                }
            });
            document.addEventListener('touchstart', (e) => {
                e.preventDefault();
                jump();
            });

            function update() {
                if (!gameActive) return;

                // Fizik
                player.dy += player.gravity;
                player.y += player.dy;
                const groundY = canvas.height - 100;
                if (player.y + player.height > groundY) {
                    player.y = groundY - player.height;
                    player.dy = 0;
                    player.grounded = true;
                }

                // Engel spawn
                if (Math.random() < 0.02) {
                    obstacles.push({
                        x: canvas.width,
                        width: 40,
                        height: 50 + Math.random() * 50,
                        speed: 8 + (score / 10)
                    });
                }

                // Engelleri güncelle (reverse loop splice için güvenli)
                for (let i = obstacles.length - 1; i >= 0; i--) {
                    const obs = obstacles[i];
                    obs.x -= obs.speed;

                    // Çarpışma kontrolü
                    const obsTop = canvas.height - 100 - obs.height;
                    if (player.x < obs.x + obs.width &&
                        player.x + player.width > obs.x &&
                        player.y + player.height > obsTop) {
                        gameActive = false;
                        finalScoreEl.innerText = score;
                        gameOverScreen.classList.remove('hidden');
                        return; // Erken çık
                    }

                    // Ekran dışına çıkarsa sil ve score artır
                    if (obs.x + obs.width < 0) {
                        obstacles.splice(i, 1);
                        score++;
                        scoreEl.innerText = score;
                    }
                }
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

                // Arka plan
                ctx.fillStyle = '#050510';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Zemin çizgisi
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#0ff';
                ctx.strokeStyle = '#0ff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(0, canvas.height - 100);
                ctx.lineTo(canvas.width, canvas.height - 100);
                ctx.stroke();

                // Player çiz
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

                // Gözler
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#fff';
                ctx.fillStyle = '#fff';
                ctx.fillRect(player.x + 8, drawY + 8, 6, 6);
                ctx.fillRect(player.x + 20, drawY + 8, 6, 6);

                // Bacaklar (sadece yerdeyken)
                if (player.grounded) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#0ff';
                    ctx.fillStyle = '#0ff';
                    let legMove = Math.sin(Date.now() / 100) * 3;
                    ctx.fillRect(player.x + 5, drawY + drawHeight, 8, 8 + legMove);
                    ctx.fillRect(player.x + 22, drawY + drawHeight, 8, 8 - legMove);
                }

                // Engeller
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#f0f';
                ctx.fillStyle = '#f0f';
                obstacles.forEach(obs => {
                    const obsTop = canvas.height - 100 - obs.height;
                    drawRoundRect(ctx, obs.x, obsTop, obs.width, obs.height, 5);
                    ctx.fill();
                });

                ctx.shadowBlur = 0;
            }

            function gameLoop() {
                update();
                draw();
                requestAnimationFrame(gameLoop);
            }

            // Restart fonksiyonu
            function restart() {
                score = 0;
                gameActive = true;
                obstacles = [];
                player.y = canvas.height - 150;
                player.dy = 0;
                player.grounded = false;
                scoreEl.innerText = '0';
                gameOverScreen.classList.add('hidden');
            }

            // Event listener'lar
            restartBtn.addEventListener('click', restart);

            // Oyunu başlat
            gameLoop();

            // Public API
            return { restart };
        }

        // Sayfa yüklendiğinde başlat
        window.addEventListener('load', () => {
            initNeonVelocity();
        });
    </script>
</body>
</html>
