document.addEventListener("DOMContentLoaded", () => {
    // Show YavuKan splash screen
    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        splash.style.opacity = '0';
        
        setTimeout(() => {
            splash.classList.add("hidden");
            document.getElementById("main-menu").classList.remove("hidden");
            
            // Sequential fade in for game cards
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
    }, 2000); // 2 second splash

    // Future placeholders
    document.getElementById("btn-oyun1").addEventListener("click", () => alert("Yakında!"));
    document.getElementById("btn-oyun2").addEventListener("click", () => alert("Yakında!"));
    
    // Load Game 3
    document.getElementById("btn-oyun3").addEventListener("click", () => {
        document.getElementById("main-menu").classList.add("hidden");
        document.getElementById("game-container").classList.remove("hidden");
        if(typeof initUzayFirtinasi === 'function') initUzayFirtinasi();
    });

    document.getElementById("btn-menu").addEventListener("click", () => {
        document.getElementById("game-container").classList.add("hidden");
        document.getElementById("game-over-screen").classList.add("hidden");
        document.getElementById("main-menu").classList.remove("hidden");
        if(typeof stopUzayFirtinasi === 'function') stopUzayFirtinasi();
    });
});
