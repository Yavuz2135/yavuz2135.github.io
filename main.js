// main.js - senin kodun + ufak iyileştirmeler

document.addEventListener("DOMContentLoaded", () => {
    // ── Element referansları ──
    const splash = document.getElementById("splash-screen");
    const mainMenu = document.getElementById("main-menu");
    const gameContainer = document.getElementById("game-container");
    const gameGrid = document.getElementById("game-grid");
    const btnGlobalExit = document.getElementById("btn-global-exit");
    const btnMenuExit = document.getElementById("btn-menu-exit");
    const btnRestart = document.getElementById("btn-restart");
    const gameLoading = document.getElementById("game-loading");
    const canvas = document.getElementById("gameCanvas");

    // Canvas boyutunu erken ve oyun geçişlerinde güncelle
    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ── Oyun listesi ── (buraya yeni oyun eklemeye devam et)
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
        // Yeni oyun eklemek için sadece buraya satır ekle
        // { id: "wolf-run", title: "Kurt Koşusu", script: "games/wolf-run/script.js", initFn: "initWolfRun" }
    ];

    // Splash ekranı
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = "0";
            setTimeout(() => {
                splash.classList.add("hidden");
                mainMenu.classList.remove("hidden");
            }, 800);
        }, 2200);
    }

    // Kartlar
    games.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card active";
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

    // Menüye dönüş
    function returnToMenu() {
        if (window.currentGameCleanup && typeof window.currentGameCleanup === "function") {
            window.currentGameCleanup();
            window.currentGameCleanup = null;
        }
        gameContainer.classList.add("hidden");
        mainMenu.classList.remove("hidden");
        document.getElementById("score").textContent = "0";
        document.getElementById("game-over-screen").classList.add("hidden");
        // Diğer UI temizlikleri...
        if (gameLoading) gameLoading.classList.add("hidden");
        resizeCanvas(); // Dönüşte canvas'ı güncelle
    }

    btnGlobalExit?.addEventListener("click", returnToMenu);
    btnMenuExit?.addEventListener("click", returnToMenu);

    // Oyun yükleme
    function loadAndStartGame(game) {
        mainMenu.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        if (gameLoading) gameLoading.classList.remove("hidden");

        // Önceki oyunu temizle
        if (window.currentGameCleanup) {
            window.currentGameCleanup();
        }

        const script = document.createElement("script");
        script.src = `${game.script}?v=${Date.now()}`;
        script.onload = () => {
            const initFn = window[game.initFn];
            if (typeof initFn === "function") {
                window.currentGameCleanup = initFn();
                if (gameLoading) gameLoading.classList.add("hidden");
                // Canvas'ı görünür yap ve boyutlandır (bazen gizli kalıyor)
                setTimeout(resizeCanvas, 100);
            } else {
                console.error(`Başlatma fonksiyonu bulunamadı: ${game.initFn}`);
                alert(`${game.title} başlatılamadı. Lütfen konsolu kontrol edin.`);
                returnToMenu();
            }
        };
        script.onerror = () => {
            console.error(`Script yüklenemedi: ${game.script}`);
            alert(`${game.title} dosyası yüklenemedi.`);
            if (gameLoading) gameLoading.classList.add("hidden");
            returnToMenu();
        };
        document.body.appendChild(script);
    }

    // Restart (oyunun kendi restart'ını desteklemiyorsa genel sıfırlama)
    btnRestart?.addEventListener("click", () => {
        document.getElementById("game-over-screen").classList.add("hidden");
        // Eğer oyun cleanup içinde restart destekliyorsa çağır
        if (window.currentGameCleanup && typeof window.currentGameCleanup.restart === "function") {
            window.currentGameCleanup.restart();
        } else {
            // Genel sıfırlama
            document.getElementById("score").textContent = "0";
        }
    });
});
