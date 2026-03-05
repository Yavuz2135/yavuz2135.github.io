document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-screen");
    const mainMenu = document.getElementById("main-menu");
    const gameContainer = document.getElementById("game-container");

    // 1. Splash Ekranı Kontrolü
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.classList.add("hidden");
                if (mainMenu) mainMenu.classList.remove("hidden");
            }, 500);
        }, 2000);
    }

    // 2. Oyun Başlatıcı (Hata Veren Kısım Düzeltildi)
    const neonBtn = document.getElementById("btn-neon");
    if (neonBtn) {
        neonBtn.onclick = () => {
            if (mainMenu) mainMenu.classList.add("hidden");
            if (gameContainer) gameContainer.classList.remove("hidden");
            
            // Build hatasını önlemek için window üzerinden kontrol ediyoruz
            if (typeof window.initNeonVelocity === 'function') {
                window.initNeonVelocity();
            } else {
                console.error("Hata: initNeonVelocity fonksiyonu bulunamadı!");
            }
        };
    }

    // 3. Menüye Dönüş Sistemi (Bellek Temizliği)
    const backToMenu = () => window.location.reload();

    const exitBtn = document.getElementById("btn-global-exit");
    const menuExitBtn = document.getElementById("btn-menu-exit");
    
    if (exitBtn) exitBtn.onclick = backToMenu;
    if (menuExitBtn) menuExitBtn.onclick = backToMenu;

    // 4. Yeniden Başlatma
    const restartBtn = document.getElementById("btn-restart");
    if (restartBtn) {
        restartBtn.onclick = () => {
            const gameOverScreen = document.getElementById("game-over-screen");
            if (gameOverScreen) gameOverScreen.classList.add("hidden");
            if (typeof window.initNeonVelocity === 'function') {
                window.initNeonVelocity();
            }
        };
    }
});
