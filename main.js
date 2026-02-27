window.onload = function() {

  function loadOyun(oyun) {
    // game-container temizle
    const container = document.querySelector('.game-container');
    container.innerHTML = `
      <div class="mobile-controls">
        <button id="up">↑</button>
        <div>
          <button id="left">←</button>
          <button id="down">↓</button>
          <button id="right">→</button>
        </div>
      </div>
    `;

    // İlgili oyunu başlat
    if(oyun === 'oyun1') {
      oyun1();
    } else if(oyun === 'oyun2') {
      oyun2();
    }
  }

  // Butonlara tıklandığında oyunu yükle
  document.getElementById('btn-oyun1').addEventListener('click', () => loadOyun('oyun1'));
  document.getElementById('btn-oyun2').addEventListener('click', () => loadOyun('oyun2'));

  // Sayfa açıldığında varsayılan olarak oyun1
  loadOyun('oyun1');
}
