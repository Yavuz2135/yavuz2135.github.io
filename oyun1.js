function oyun1() {
  // Canvas oluştur
  const canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  canvas.width = 280;
  canvas.height = 280;
  canvas.style.background = '#222';
  canvas.style.display = 'block';
  canvas.style.margin = 'auto';
  
  const container = document.querySelector('.game-container');
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  let x = 50, y = 50, size = 30;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x, y, size, size);
  }

  // Klavye ile kontrol
  document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight') x += 10;
    if(e.key === 'ArrowLeft') x -= 10;
    if(e.key === 'ArrowUp') y -= 10;
    if(e.key === 'ArrowDown') y += 10;
    draw();
  });

  // Mobil kontroller
  document.getElementById('up').addEventListener('click', () => { y -= 10; draw(); });
  document.getElementById('down').addEventListener('click', () => { y += 10; draw(); });
  document.getElementById('left').addEventListener('click', () => { x -= 10; draw(); });
  document.getElementById('right').addEventListener('click', () => { x += 10; draw(); });

  draw();
}
