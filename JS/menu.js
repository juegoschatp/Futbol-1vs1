/* ========================================================= */
/* MENU.JS                                                   */
/* Menú principal y navegación del juego                    */
/* ========================================================= */

const MenuState = {
    currentScreen: "main",
    transitioning: false
};


/* ========================================================= */
/* INICIALIZACIÓN                                            */
/* ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupButtons();

});


/* ========================================================= */
/* VIDEO DE FONDO                                             */
/* ========================================================= */

function setupBackgroundVideo() {

    const video = document.getElementById("backgroundVideo");

    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    video.play().catch(() => {
        console.log("El navegador bloqueó la reproducción automática del video.");
    });
}


/* ========================================================= */
/* MÚSICA DEL MENÚ                                           */
/* ========================================================= */

function setupMenuMusic() {

    /*
       La música se activa desde la primera interacción real
       en IntroScreen. No intentamos reproducirla al cargar
       la página porque el navegador puede bloquear el autoplay.
    */

    if (!window.AudioManager) return;

}


/* ========================================================= */
/* BOTONES DEL MENÚ                                           */
/* ========================================================= */

function setupButtons() {

    const playButton = document.getElementById("playButton");
    const tutorialButton = document.getElementById("tutorialButton");
    const settingsButton = document.getElementById("settingsButton");


    /* ---------------- PLAY ---------------- */

    if (playButton) {

        playButton.addEventListener("pointerdown", () => {

            if (window.AudioManager) {
                AudioManager.unlock();
                AudioManager.playButton();
            }

        }, { passive: true });

        playButton.addEventListener("click", () => {

            handlePlayButton();

        });
    }


    /* ---------------- TUTORIAL ---------------- */

    if (tutorialButton) {

        tutorialButton.addEventListener("pointerdown", () => {

            if (window.AudioManager) {
                AudioManager.unlock();
                AudioManager.playButton();
            }

        }, { passive: true });

        tutorialButton.addEventListener("click", () => {

            handleTutorialButton();

        });
    }


    /* ---------------- SETTINGS ---------------- */

    if (settingsButton) {

        settingsButton.addEventListener("pointerdown", () => {

            if (window.AudioManager) {
                AudioManager.unlock();
                AudioManager.playButton();
            }

        }, { passive: true });

        settingsButton.addEventListener("click", () => {

            handleSettingsButton();

        });
    }
}


/* ========================================================= */
/* PLAY                                                       */
/* ========================================================= */

function handlePlayButton() {

    if (MenuState.transitioning) return;

    MenuState.transitioning = true;

    openMatchSetup();

    setTimeout(() => {
        MenuState.transitioning = false;
    }, 300);
}


/* ========================================================= */
/* TUTORIAL                                                   */
/* ========================================================= */

function handleTutorialButton() {

    console.log("Tutorial próximamente.");

    // El tutorial todavía no está implementado.
}


/* ========================================================= */
/* SETTINGS                                                   */
/* ========================================================= */

function handleSettingsButton() {

    console.log("Configuración próximamente.");

    // La pantalla de configuración todavía no está implementada.
}


/* ========================================================= */
/* ABRIR CONFIGURACIÓN DE PARTIDO                             */
/* ========================================================= */

function openMatchSetup() {

    MenuState.currentScreen = "matchSetup";


    const mainMenu = document.getElementById("mainMenu");
    const matchSetupScreen = document.getElementById("matchSetupScreen");
    const gameScreen = document.getElementById("gameScreen");


    if (mainMenu) {

        mainMenu.classList.remove("active");
        mainMenu.classList.add("hidden");
        mainMenu.style.display = "none";
    }


    if (gameScreen) {

        gameScreen.classList.remove("active");
        gameScreen.classList.add("hidden");
        gameScreen.style.display = "none";
    }


    if (matchSetupScreen) {

        matchSetupScreen.classList.remove("hidden");
        matchSetupScreen.classList.add("active");
        matchSetupScreen.style.display = "flex";
    }


    if (window.AudioManager) {
        AudioManager.playMusic();
    }
}


/* ========================================================= */
/* VOLVER AL MENÚ PRINCIPAL                                   */
/* ========================================================= */

function returnToMainMenu() {

    MenuState.currentScreen = "main";
    MenuState.transitioning = false;


    const mainMenu = document.getElementById("mainMenu");
    const matchSetupScreen = document.getElementById("matchSetupScreen");
    const gameScreen = document.getElementById("gameScreen");


    if (matchSetupScreen) {

        matchSetupScreen.classList.remove("active");
        matchSetupScreen.classList.add("hidden");
        matchSetupScreen.style.display = "none";
    }


    if (gameScreen) {

        gameScreen.classList.remove("active");
        gameScreen.classList.add("hidden");
        gameScreen.style.display = "none";
    }


    if (mainMenu) {

        mainMenu.classList.remove("hidden");
        mainMenu.classList.add("active");
        mainMenu.style.display = "flex";
    }


    if (window.AudioManager) {
        AudioManager.playMusic();
    }
}


/* ========================================================= */
/* MOSTRAR MENÚ PRINCIPAL                                     */
/* ========================================================= */

function showMainMenu() {

    returnToMainMenu();
}


/* ========================================================= */
/* ACCESO GLOBAL                                              */
/* ========================================================= */

window.returnToMainMenu = returnToMainMenu;
window.showMainMenu = showMainMenu;
window.openMatchSetup = openMatchSetup;