document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-screen");
    const mainMenu = document.getElementById("main-menu");
    const gameContainer = document.getElementById("game-container");

    // Splash ekranını 2 saniye sonra kaldır
    setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.classList.add("hidden");
            mainMenu.classList.remove("hidden");
        }, 500);
    }, 2000);

    // Neon Velocity Başlatıcı
    document.getElementById("btn-neon").onclick = () => {
        mainMenu.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        if (typeof initNeonVelocity === 'function') initNeonVelocity();
    };

    // DONMA SORUNUNU ÇÖZEN KRİTİK ÇIKIŞ: Sayfayı yenilemek en temizidir
    const backToMenu = () => window.location.reload();

    document.getElementById("btn-global-exit").onclick = backToMenu;
    document.getElementById("btn-menu-exit").onclick = backToMenu;

    // Tekrar Oyna
    document.getElementById("btn-restart").onclick = () => {
        document.getElementById("game-over-screen").classList.add("hidden");
        initNeonVelocity(); 
    };
});
