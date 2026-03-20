<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Uzay Fırtanası</title>
<style>
    html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: #000;
        font-family: Arial, sans-serif;
        color: #0ff;
    }
    #gameCanvas {
        display: block;
        background: radial-gradient(circle at center, #001, #000 80%);
    }
    #ui {
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 20px;
        z-index: 10;
    }
    #game-over-screen {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.85);
        color: #0ff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 32px;
        display: none;
        z-index: 20;
    }
    button {
        margin-top: 20px;
        font-size: 24px;
        padding: 10px 20px;
        cursor: pointer;
        background: #0ff;
        color: #000;
        border: none;
        border-radius: 8px;
    }
</style>
</head>
<body>
<canvas id="gameCanvas"></canvas>
<div id="ui">Skor: <span id="score">0</span></div>
<div id="game-over-screen">
    Game Over!<br>Skor: <span id="final-score">0</span>
    <button id="btn-restart">Tekrar Başlat</button>
</div>

<script>
(function(){
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const scoreEl = document.getElementById('score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreEl = document.getElementById('final-score');
    const restartBtn = document.getElementById('btn-restart');

    let cw, ch;
    let animationId;
    let gameActive = true;
    let score = 0;
    let enemies = [];
    let bullets = [];
    let stars = [];

    function resizeCanvas(){
        cw = window.innerWidth;
        ch = window.innerHeight;
        canvas.width = cw;
        canvas.height = ch;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Oyuncu
    const player = {
        x: cw/2 - 25,
        y: ch - 100,
        width: 50,
        height: 50,
        speed: 7
    };

    // Kontroller
    const keys = {};
    document.addEventListener('keydown', e=>keys[e.code]=true);
    document.addEventListener('keyup', e=>keys[e.code]=false);
    document.addEventListener('touchstart', shoot, {passive:false});

    function shoot(){
        bullets.push({
            x: player.x + player.width/2 - 5,
            y: player.y,
            width: 10,
            height: 20,
            speed: 12
        });
    }

    // Yıldız arka plan
    for(let i=0;i<100;i++){
        stars.push({
            x: Math.random()*cw,
            y: Math.random()*ch,
            size: Math.random()*2+1,
            speed: Math.random()*2+1
        });
    }

    function update(){
        if(!gameActive) return;

        // Oyuncu hareketi
        if(keys['ArrowLeft'] && player.x>0) player.x -= player.speed;
        if(keys['ArrowRight'] && player.x+player.width<cw) player.x += player.speed;
        if(keys['Space']) shoot();

        // Yıldızlar
        stars.forEach(s=>{
            s.y += s.speed;
            if(s.y>ch){
                s.y=0;
                s.x=Math.random()*cw;
            }
        });

        // Mermiler
        bullets.forEach((b,i)=>{
            b.y -= b.speed;
            if(b.y<0) bullets.splice(i,1);
        });

        // Düşman üretimi
        if(Math.random()<0.02 + score/1000){
            enemies.push({
                x: Math.random()*(cw-40),
                y: -60,
                width: 40,
                height: 40,
                speed: 3 + score/100
            });
        }

        // Düşman hareketi ve çarpışma
        enemies.forEach((e,ei)=>{
            e.y += e.speed;

            // Player ile çarpışma
            if(e.x < player.x+player.width && e.x+e.width > player.x &&
               e.y < player.y+player.height && e.y+e.height > player.y){
                gameOver();
            }

            // Mermi ile çarpışma
            bullets.forEach((b,bi)=>{
                if(b.x < e.x+e.width && b.x+b.width > e.x &&
                   b.y < e.y+e.height && b.y+b.height > e.y){
                    enemies.splice(ei,1);
                    bullets.splice(bi,1);
                    score++;
                    scoreEl.textContent = score;
                }
            });

            if(e.y>ch) enemies.splice(ei,1);
        });
    }

    function drawRoundRect(ctx,x,y,w,h,r){
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

    function draw(){
        ctx.fillStyle="#000";
        ctx.fillRect(0,0,cw,ch);

        // Yıldızlar
        ctx.fillStyle="#fff";
        stars.forEach(s=>{
            ctx.beginPath();
            ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
            ctx.fill();
        });

        // Player
        ctx.fillStyle="#0ff";
        drawRoundRect(ctx,player.x,player.y,player.width,player.height,8);
        ctx.fill();

        // Mermiler
        ctx.fillStyle="#f0f";
        bullets.forEach(b=>{
            drawRoundRect(ctx,b.x,b.y,b.width,b.height,3);
            ctx.fill();
        });

        // Düşmanlar
        ctx.fillStyle="#f00";
        enemies.forEach(e=>{
            drawRoundRect(ctx,e.x,e.y,e.width,e.height,5);
            ctx.fill();
        });
    }

    function gameLoop(){
        update();
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }

    function gameOver(){
        gameActive=false;
        finalScoreEl.textContent=score;
        gameOverScreen.style.display="flex";
    }

    function restart(){
        gameActive=true;
        score=0;
        scoreEl.textContent=0;
        enemies=[];
        bullets=[];
        player.x = cw/2 - 25;
        player.y = ch-100;
        gameOverScreen.style.display="none";
        gameLoop();
    }

    restartBtn.addEventListener('click',restart);

    // Başlat
    gameLoop();
})();
</script>
</body>
</html>
