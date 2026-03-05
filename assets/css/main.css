// main.js - Ana sayfa mantığı, splash, menü ve oyun geçişi

document.addEventListener("DOMContentLoaded", () => {
    // ── Element referansları ──
    const splash       = document.getElementById("splash-screen");
    const mainMenu     = document.getElementById("main-menu");
    const gameContainer = document.getElementById("game-container");
    const gameGrid     = document.getElementById("game-grid");
    const btnGlobalExit = document.getElementById("btn-global-exit");
    const btnMenuExit  = document.getElementById("btn-menu-exit");
    const btnRestart   = document.getElementById("btn-restart");

    // ── Oyun listesi (yeni oyun eklemek için buraya ekle) ──
    const games = [
        {
            id: "neon-velocity",
            title: "Neon Velocity",
            script: "games/neon-velocity/script.js",
            initFn: "initNeonVelocity"
        },
        {
            id: "uzay-firtinasi",
            title: "Uzay Fırtınası",
            script: "games/uzay-firtinasi/script.js",
            initFn: "initUzayFirtinasi"
        }
        // Yeni oyun örneği:
        // { id: "yeni-oyun", title: "Yeni Macera", script: "games/yeni-oyun/script.js", initFn: "initYeniOyun" }
    ];

    // ── Splash ekranı otomatik kapanış ──
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = "0";
            setTimeout(() => {
                splash.classList.add("hidden");
                mainMenu.classList.remove("hidden");
            }, 800);
        }, 2200);
    }

    // ── Oyun kartlarını dinamik oluştur ──
    games.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card active"; // şimdilik hepsi aktif, locked mantığı eklenebilir
        card.id = `btn-${game.id}`;
        card.innerHTML = `
            <div class="card-content">
                <h2>${game.title}</h2>
                <span class="play-btn">Oyna</span>
            </div>
        `;

        card.addEventListener("click", () => loadAndStartGame(game));
        gameGrid.appendChild(card);
    });

    // ── Menüye dönüş fonksiyonu (bellek temizliği + reload yerine daha temiz) ──
    function returnToMenu() {
        // Aktif oyunun cleanup fonksiyonu varsa çağır
        if (window.currentGameCleanup) {
            window.currentGameCleanup();
            window.currentGameCleanup = null;
        }

        gameContainer.classList.add("hidden");
        mainMenu.classList.remove("hidden");

        // UI'yi sıfırla
        document.getElementById("score").textContent = "0";
        document.getElementById("game-over-screen").classList.add("hidden");
        document.getElementById("lives")?.classList.add("hidden");
        document.getElementById("combo")?.classList.add("hidden");
        document.getElementById("high-score-container")?.classList.add("hidden");
    }

    btnGlobalExit?.addEventListener("click", returnToMenu);
    btnMenuExit?.addEventListener("click", returnToMenu);

    // ── Oyun yükleme ve başlatma ──
    function loadAndStartGame(game) {
        mainMenu.classList.add("hidden");
        gameContainer.classList.remove("hidden");

        // Önceki oyunun cleanup'ı varsa temizle
        if (window.currentGameCleanup) window.currentGameCleanup();

        // Script dinamik yükle (cache önlemek için timestamp eklenebilir)
        const script = document.createElement("script");
        script.src = `${game.script}?v=${Date.now()}`;
        script.onload = () => {
            const initFn = window[game.initFn];
            if (typeof initFn === "function") {
                window.currentGameCleanup = initFn();  // cleanup fonksiyonu dönerse sakla
            } else {
                console.error(`Hata: ${game.initFn} fonksiyonu bulunamadı!`);
            }
        };
        script.onerror = () => console.error(`Script yüklenemedi: ${game.script}`);
        document.body.appendChild(script);
    }

    // Yeniden başlatma (aktif oyuna bağlı olarak init tekrar çağrılır)
    btnRestart?.addEventListener("click", () => {
        document.getElementById("game-over-screen").classList.add("hidden");
        if (window.currentGameCleanup && typeof window.currentGameCleanup === "function") {
            // Bazı oyunlar restart metodu dönebilir, yoksa tekrar init
            window.currentGameCleanup(); // cleanup + yeniden başlatma mantığı oyun içinde olmalı
        }
    });
});
