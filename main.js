// main.js - Ana sayfa mantığı, splash ekranı, dinamik menü ve oyun yükleme

document.addEventListener("DOMContentLoaded", () => {
    // ── Element referansları ──
    const splash         = document.getElementById("splash-screen");
    const mainMenu       = document.getElementById("main-menu");
    const gameContainer  = document.getElementById("game-container");
    const gameGrid       = document.getElementById("game-grid");
    const btnGlobalExit  = document.getElementById("btn-global-exit");
    const btnMenuExit    = document.getElementById("btn-menu-exit");
    const btnRestart     = document.getElementById("btn-restart");
    const gameLoading    = document.getElementById("game-loading"); // index.html'de ekledik

    // ── Oyun listesi - Yeni oyun eklemek için buraya satır ekle ──
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
        // Örnek yeni oyun:
        // { id: "yeni-oyun", title: "Yeni Oyun", script: "games/yeni-oyun/script.js", initFn: "initYeniOyun" }
    ];

    // ── Splash ekranı otomatik kapanış (2.2 sn sonra fade out) ──
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = "0";
            setTimeout(() => {
                splash.classList.add("hidden");
                mainMenu.classList.remove("hidden");
            }, 800); // fade süresi
        }, 2200);
    }

    // ── Oyun kartlarını dinamik olarak oluştur ──
    games.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card active"; // locked için class değiştirilebilir
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

    // ── Menüye dönüş fonksiyonu (temiz çıkış + UI sıfırlama) ──
    function returnToMenu() {
        // Aktif oyunun cleanup'ını çağır (bellek temizliği)
        if (window.currentGameCleanup && typeof window.currentGameCleanup === "function") {
            window.currentGameCleanup();
            window.currentGameCleanup = null;
        }

        gameContainer.classList.add("hidden");
        mainMenu.classList.remove("hidden");

        // UI'yi tamamen sıfırla
        document.getElementById("score").textContent = "0";
        document.getElementById("game-over-screen").classList.add("hidden");
        document.getElementById("lives")?.classList.add("hidden");
        document.getElementById("combo")?.classList.add("hidden");
        document.getElementById("high-score-container")?.classList.add("hidden");
        if (gameLoading) gameLoading.classList.add("hidden");
    }

    btnGlobalExit?.addEventListener("click", returnToMenu);
    btnMenuExit?.addEventListener("click", returnToMenu);

    // ── Oyun yükleme ve başlatma ──
    function loadAndStartGame(game) {
        mainMenu.classList.add("hidden");
        gameContainer.classList.remove("hidden");

        // Loading göster (yavaş bağlantılarda faydalı)
        if (gameLoading) gameLoading.classList.remove("hidden");

        // Önceki oyunu temizle
        if (window.currentGameCleanup) window.currentGameCleanup();

        const script = document.createElement("script");
        script.src = `${game.script}?v=${Date.now()}`; // Cache'i kır
        script.onload = () => {
            const initFn = window[game.initFn];
            if (typeof initFn === "function") {
                window.currentGameCleanup = initFn(); // cleanup fonksiyonu sakla
                if (gameLoading) gameLoading.classList.add("hidden"); // Loading gizle
            } else {
                console.error(`Hata: ${game.initFn} fonksiyonu bulunamadı!`);
                alert(`Oyun başlatılamadı: ${game.title} yüklenirken hata oluştu. Konsolu kontrol edin.`);
                returnToMenu(); // Hata olursa menüye dön
            }
        };
        script.onerror = () => {
            console.error(`Script yüklenemedi: ${game.script}`);
            alert(`Oyun dosyası yüklenemedi: ${game.title}. İnternet bağlantınızı kontrol edin.`);
            if (gameLoading) gameLoading.classList.add("hidden");
            returnToMenu();
        };
        document.body.appendChild(script);
    }

    // ── Yeniden başlatma (oyunun kendi restart'ını tetikle) ──
    btnRestart?.addEventListener("click", () => {
        const gameOverScreen = document.getElementById("game-over-screen");
        if (gameOverScreen) gameOverScreen.classList.add("hidden");

        // Eğer oyun cleanup döndürüyorsa, içinde restart çağrılabilir
        // Ama güvenli olmak için mevcut oyunun restart'ını manuel tetikle (opsiyonel genişletme)
        if (window.currentGameCleanup && typeof window.currentGameCleanup.restart === "function") {
            window.currentGameCleanup.restart();
        } else {
            // Genel sıfırlama (gerekirse)
            document.getElementById("score").textContent = "0";
        }
    });
});
