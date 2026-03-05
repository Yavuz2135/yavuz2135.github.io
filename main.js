// main.js - Ana sayfa mantığı, splash, menü ve oyun yükleme

document.addEventListener("DOMContentLoaded", () => {
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
    ];

    // Splash kapanışı
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = "0";
            setTimeout(() => {
                splash.classList.add("hidden");
                mainMenu.classList.remove("hidden");
            }, 800);
        }, 2200);
    }

    // Oyun kartlarını dinamik oluştur
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

    // Menüye dönüş (temiz çıkış)
    function returnToMenu() {
        if (window.currentGameCleanup) {
            window.currentGameCleanup();
            window.currentGameCleanup = null;
        }
        gameContainer.classList.add("hidden");
        mainMenu.classList.remove("hidden");
        document.getElementById("score").textContent = "0";
        document.getElementById("game-over-screen").classList.add("hidden");
        document.getElementById("lives")?.classList.add("hidden");
        document.getElementById("combo")?.classList.add("hidden");
        document.getElementById("high-score-container")?.classList.add("hidden");
    }

    btnGlobalExit?.addEventListener("click", returnToMenu);
    btnMenuExit?.addEventListener("click", returnToMenu);

    // Oyun yükleme
    function loadAndStartGame(game) {
        mainMenu.classList.add("hidden");
        gameContainer.classList.remove("hidden");

        if (window.currentGameCleanup) window.currentGameCleanup();

        const script = document.createElement("script");
        script.src = `${game.script}?v=${Date.now()}`;
        script.onload = () => {
            const initFn = window[game.initFn];
            if (typeof initFn === "function") {
                window.currentGameCleanup = initFn();
            } else {
                console.error(`init fonksiyonu bulunamadı: ${game.initFn}`);
            }
        };
        script.onerror = () => console.error(`Script yüklenemedi: ${game.script}`);
        document.body.appendChild(script);
    }

    // Yeniden başlatma
    btnRestart?.addEventListener("click", () => {
        document.getElementById("game-over-screen").classList.add("hidden");
        // Oyun kendi restart mantığını kullanıyor
    });
});
