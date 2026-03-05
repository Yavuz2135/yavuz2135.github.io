document.addEventListener("DOMContentLoaded", () => {
    // 1. Splash Screen ve YavuKan Logo Animasyonu
    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        splash.style.opacity = '0';
        
        setTimeout(() => {
            splash.classList.add("hidden");
            const mainMenu = document.getElementById("main-menu");
            mainMenu.classList.remove("hidden");
            
            // Kartların sırayla belirmesi (Sequential fade-in)
            const cards = document.querySelectorAll('.game-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.5s ease ' + (index * 0.2) + 's';
                
                setTimeout(() => {
                    card.style.opacity = card.classList.contains('locked') ? '0.6' : '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            });
        }, 500);
    }, 2000);

    // 2. Merkezi Oyun Başlatıcı (Game Manager)
    function openGameContainer() {
        document.getElementById("main-menu").classList.add("hidden");
        document.getElementById("game-container").classList.remove("hidden");
    }

    // YENİ OYUN: Neon Velocity Başlatıcı
    document.getElementById("btn-neon").addEventListener("click", () => {
        openGameContainer();
        if (typeof initNeonVelocity === 'function') {
            initNeonVelocity();
        } else {
            console.error("Hata: neon-velocity.js yüklenemedi.");
        }
    });

    // MEVCUT OYUN: Uzay Fırtınası Başlatıcı
    document.getElementById("btn-oyun3").addEventListener("click", () => {
        openGameContainer();
        if (typeof initUzayFirtinasi === 'function') {
            initUzayFirtinasi();
        } else {
            console.error("Hata: oyun3.js yüklenemedi.");
        }
    });

    // GELECEK OYUN: Placeholder
    document.getElementById("btn-oyun2").addEventListener("click", () => {
        if(document.getElementById("btn-oyun2").classList.contains('locked')) {
            alert("Bu proje geliştirme aşamasındadır.");
        }
    });

    // 3. Menü ve Arayüz Kontrolleri
    document.getElementById("btn-menu").addEventListener("click", () => {
        // Tüm aktif döngüleri durdurmak için sayfayı yenilemek en stabil yoldur
        // Veya özel stop fonksiyonlarınızı çağırabilirsiniz
        location.reload(); 
    });

    // Restart Butonu Kontrolü
    document.getElementById("btn-restart").addEventListener("click", () => {
        document.getElementById("game-over-screen").classList.add("hidden");
        // Hangi oyun aktifse onu yeniden başlat (Skoru sıfırlayarak)
        const currentTitle = document.querySelector('.game-card.active h2').innerText;
        if(currentTitle === "Neon Velocity") initNeonVelocity();
        else initUzayFirtinasi();
    });
});
