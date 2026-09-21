/* ========================================================= */
/* MATCHSETUP.JS                                             */
/* Selección arcade de equipos, jugadores, tiempo y modo     */
/* ========================================================= */

"use strict";


/* ========================================================= */
/* EQUIPOS                                                   */
/* ========================================================= */

const TEAMS = [

    {
        id: "argentina",
        name: "ARGENTINA",
        shortName: "ARG",

        playerName: "MESSI",
        characterKey: "messi",

        primaryColor: "#75c9e8",
        secondaryColor: "#ffffff"
    },

    {
        id: "france",
        name: "FRANCIA",
        shortName: "FRA",

        playerName: "MBAPPÉ",
        characterKey: "mbape",

        primaryColor: "#173f8a",
        secondaryColor: "#e8c547"
    },

    {
        id: "spain",
        name: "ESPAÑA",
        shortName: "ESP",

        playerName: "PEDRI",
        characterKey: "pedri",

        primaryColor: "#d62828",
        secondaryColor: "#f6c945"
    },

    {
        id: "brazil",
        name: "BRASIL",
        shortName: "BRA",

        playerName: "NEYMAR",
        characterKey: "neymar",

        primaryColor: "#f6d32d",
        secondaryColor: "#16803c"
    }

];


/* ========================================================= */
/* MODOS DE JUEGO                                            */
/* ========================================================= */

const MATCH_MODES = {

    PLAYER_VS_PLAYER: "player-vs-player",

    PLAYER_VS_AI: "player-vs-ai"

};


/* ========================================================= */
/* ESTADO                                                    */
/* ========================================================= */

const MatchSetupState = {

    player1TeamIndex: 0,

    player2TeamIndex: 1,

    duration: 120,

    mode: MATCH_MODES.PLAYER_VS_PLAYER

};


/* ========================================================= */
/* ELEMENTOS                                                 */
/* ========================================================= */

let backToMenuButton;

let player1PreviousButton;
let player1NextButton;

let player2PreviousButton;
let player2NextButton;

let player1TeamName;
let player2TeamName;

let player1TeamColor;
let player2TeamColor;

let player1TeamIndexElement;
let player2TeamIndexElement;

let player1PlayerName;
let player2PlayerName;

let player1PlayerImage;
let player2PlayerImage;

let player1Panel;
let player2Panel;

let durationButtons;

let gameModeButtons;

let matchSummary;

let continueToGameButton;


/* ========================================================= */
/* INICIALIZACIÓN                                            */
/* ========================================================= */

function initializeMatchSetup() {

    backToMenuButton =
        document.getElementById(
            "backToMenuButton"
        );


    player1PreviousButton =
        document.getElementById(
            "player1Previous"
        );


    player1NextButton =
        document.getElementById(
            "player1Next"
        );


    player2PreviousButton =
        document.getElementById(
            "player2Previous"
        );


    player2NextButton =
        document.getElementById(
            "player2Next"
        );


    player1TeamName =
        document.getElementById(
            "player1TeamName"
        );


    player2TeamName =
        document.getElementById(
            "player2TeamName"
        );


    player1TeamColor =
        document.getElementById(
            "player1TeamColor"
        );


    player2TeamColor =
        document.getElementById(
            "player2TeamColor"
        );


    player1TeamIndexElement =
        document.getElementById(
            "player1TeamIndex"
        );


    player2TeamIndexElement =
        document.getElementById(
            "player2TeamIndex"
        );


    player1PlayerName =
        document.getElementById(
            "player1PlayerName"
        );


    player2PlayerName =
        document.getElementById(
            "player2PlayerName"
        );


    player1PlayerImage =
        document.getElementById(
            "player1PlayerImage"
        );


    player2PlayerImage =
        document.getElementById(
            "player2PlayerImage"
        );


    player1Panel =
        document.getElementById(
            "player1Panel"
        );


    player2Panel =
        document.getElementById(
            "player2Panel"
        );


    durationButtons =
        document.querySelectorAll(
            ".duration-button"
        );


    gameModeButtons =
        document.querySelectorAll(
            ".game-mode-button"
        );


    matchSummary =
        document.getElementById(
            "matchSummary"
        );


    continueToGameButton =
        document.getElementById(
            "continueToGameButton"
        );


    bindMatchSetupEvents();

    updateMatchSetupInterface();

}


/* ========================================================= */
/* AUDIO                                                    */
/* ========================================================= */

function playSetupButtonSound() {

    if (
        window.AudioManager &&
        typeof AudioManager.playButton ===
        "function"
    ) {

        AudioManager.playButton();

    }

}


/* ========================================================= */
/* CAMBIO DE PERSONAJE                                       */
/* ========================================================= */

function animatePlayerChange(
    imageElement,
    team,
    direction
) {

    if (!imageElement || !team) {
        return;
    }

    const parent =
        imageElement.parentElement;

    const side =
        imageElement.dataset.side === "left"
            ? "derecha"
            : "izquierda";

    const newImageSrc =
        `ASSETS/jugadores/${team.characterKey}${side}.png`;

    /*
     * Preparamos la nueva imagen antes de cambiar
     * la que se está mostrando.
     *
     * Esto evita que el personaje desaparezca si
     * la nueva imagen tarda unos milisegundos en cargar.
     */

    const preloadImage = new Image();

    preloadImage.onload = () => {

        /*
         * Limpiar cualquier animación anterior.
         */

        imageElement.classList.remove(
            "player-image-changing"
        );

        if (parent) {

            parent.classList.remove(
                "player-changing-left",
                "player-changing-right",
                "player-entering"
            );

        }

        /*
         * Reiniciar la animación.
         */

        void imageElement.offsetWidth;

        if (parent) {

            parent.classList.add(
                direction > 0
                    ? "player-changing-left"
                    : "player-changing-right"
            );

        }

        imageElement.classList.add(
            "player-image-changing"
        );

        /*
         * Cambiar la imagen únicamente cuando
         * sabemos que ya está cargada.
         */

        imageElement.src =
            newImageSrc;

        imageElement.alt =
            team.playerName;

        /*
         * Entrada del nuevo personaje.
         */

        window.setTimeout(() => {

            if (parent) {

                parent.classList.remove(
                    "player-changing-left",
                    "player-changing-right"
                );

                parent.classList.add(
                    "player-entering"
                );

            }

        }, 140);

        /*
         * IMPORTANTE:
         * quitar la clase que podría dejar al
         * personaje invisible al terminar.
         */

        window.setTimeout(() => {

            imageElement.classList.remove(
                "player-image-changing"
            );

            if (parent) {

                parent.classList.remove(
                    "player-entering"
                );

            }

            /*
             * Asegurar que el personaje quede
             * completamente visible.
             */

            imageElement.style.opacity = "1";
            imageElement.style.visibility = "visible";

        }, 520);

    };

    preloadImage.onerror = () => {

        /*
         * Si por alguna razón falla la precarga,
         * igualmente dejamos el sistema limpio.
         */

        imageElement.src =
            newImageSrc;

        imageElement.alt =
            team.playerName;

        imageElement.classList.remove(
            "player-image-changing"
        );

        if (parent) {

            parent.classList.remove(
                "player-changing-left",
                "player-changing-right",
                "player-entering"
            );

        }

        imageElement.style.opacity = "1";
        imageElement.style.visibility = "visible";
    };

    preloadImage.src =
        newImageSrc;

}


/* ========================================================= */
/* EVENTOS                                                   */
/* ========================================================= */

function bindMatchSetupEvents() {


    /* ===================================================== */
    /* JUGADOR 1 - ANTERIOR                                  */
    /* ===================================================== */

    if (player1PreviousButton) {

        player1PreviousButton.addEventListener(
            "click",
            () => {

                playSetupButtonSound();


                MatchSetupState.player1TeamIndex--;


                if (
                    MatchSetupState.player1TeamIndex < 0
                ) {

                    MatchSetupState.player1TeamIndex =
                        TEAMS.length - 1;

                }


                updateMatchSetupInterface(
                    "player1",
                    -1
                );

            }
        );

    }


    /* ===================================================== */
    /* JUGADOR 1 - SIGUIENTE                                 */
    /* ===================================================== */

    if (player1NextButton) {

        player1NextButton.addEventListener(
            "click",
            () => {

                playSetupButtonSound();


                MatchSetupState.player1TeamIndex++;


                if (
                    MatchSetupState.player1TeamIndex >=
                    TEAMS.length
                ) {

                    MatchSetupState.player1TeamIndex = 0;

                }


                updateMatchSetupInterface(
                    "player1",
                    1
                );

            }
        );

    }


    /* ===================================================== */
    /* JUGADOR 2 - ANTERIOR                                  */
    /* ===================================================== */

    if (player2PreviousButton) {

        player2PreviousButton.addEventListener(
            "click",
            () => {

                playSetupButtonSound();


                MatchSetupState.player2TeamIndex--;


                if (
                    MatchSetupState.player2TeamIndex < 0
                ) {

                    MatchSetupState.player2TeamIndex =
                        TEAMS.length - 1;

                }


                updateMatchSetupInterface(
                    "player2",
                    -1
                );

            }
        );

    }


    /* ===================================================== */
    /* JUGADOR 2 - SIGUIENTE                                 */
    /* ===================================================== */

    if (player2NextButton) {

        player2NextButton.addEventListener(
            "click",
            () => {

                playSetupButtonSound();


                MatchSetupState.player2TeamIndex++;


                if (
                    MatchSetupState.player2TeamIndex >=
                    TEAMS.length
                ) {

                    MatchSetupState.player2TeamIndex = 0;

                }


                updateMatchSetupInterface(
                    "player2",
                    1
                );

            }
        );

    }


    /* ===================================================== */
    /* DURACIÓN                                               */
    /* ===================================================== */

    durationButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    playSetupButtonSound();


                    const selectedDuration =
                        Number(
                            button.dataset.duration
                        );


                    if (!selectedDuration) {
                        return;
                    }


                    MatchSetupState.duration =
                        selectedDuration;


                    updateMatchSetupInterface();

                }
            );

        }
    );


    /* ===================================================== */
    /* MODO DE JUEGO                                          */
    /* ===================================================== */

    gameModeButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    playSetupButtonSound();


                    const selectedMode =
                        button.dataset.mode;


                    if (
                        selectedMode !==
                        MATCH_MODES.PLAYER_VS_PLAYER &&
                        selectedMode !==
                        MATCH_MODES.PLAYER_VS_AI
                    ) {

                        return;

                    }


                    MatchSetupState.mode =
                        selectedMode;


                    if (
                        window.GameMode &&
                        typeof GameMode.setMode ===
                        "function"
                    ) {

                        GameMode.setMode(
                            selectedMode
                        );

                    }


                    updateMatchSetupInterface();

                }
            );

        }
    );


    /* ===================================================== */
    /* CONTINUAR                                               */
    /* ===================================================== */

    if (continueToGameButton) {

        continueToGameButton.addEventListener(
            "click",
            () => {

                playSetupButtonSound();

                handleContinueToGame();

            }
        );

    }


    /* ===================================================== */
    /* VOLVER AL MENÚ                                         */
    /* ===================================================== */

    if (backToMenuButton) {

        backToMenuButton.addEventListener(
            "click",
            () => {

                playSetupButtonSound();


                if (
                    typeof window.returnToMainMenu ===
                    "function"
                ) {

                    window.returnToMainMenu();

                } else {

                    console.error(
                        "No se encontró window.returnToMainMenu()."
                    );

                }

            }
        );

    }

}


/* ========================================================= */
/* ACTUALIZAR INTERFAZ                                       */
/* ========================================================= */

function updateMatchSetupInterface(
    changedPlayer = null,
    direction = 1
) {

    const team1 =
        TEAMS[
            MatchSetupState.player1TeamIndex
        ];


    const team2 =
        TEAMS[
            MatchSetupState.player2TeamIndex
        ];


    /* ===================================================== */
    /* EQUIPO 1                                               */
    /* ===================================================== */

    if (player1TeamName) {

        player1TeamName.textContent =
            team1.name;

    }


    if (player1PlayerName) {

        player1PlayerName.textContent =
            team1.playerName;

    }


    if (player1TeamColor) {

        player1TeamColor.style.background =
            `linear-gradient(
                135deg,
                ${team1.primaryColor},
                ${team1.secondaryColor}
            )`;

        player1TeamColor.style.borderColor =
            team1.secondaryColor;

    }


    if (player1Panel) {

        player1Panel.style.setProperty(
            "--team-primary",
            team1.primaryColor
        );

        player1Panel.style.setProperty(
            "--team-secondary",
            team1.secondaryColor
        );

        player1Panel.dataset.team =
            team1.id;

    }


    if (player1TeamIndexElement) {

        player1TeamIndexElement.textContent =
            `${String(
                MatchSetupState.player1TeamIndex + 1
            ).padStart(2, "0")} / ${String(
                TEAMS.length
            ).padStart(2, "0")}`;

    }


    if (
        player1PlayerImage &&
        (
            !changedPlayer ||
            changedPlayer === "player1"
        )
    ) {

        if (changedPlayer === "player1") {

            animatePlayerChange(
                player1PlayerImage,
                team1,
                direction
            );

        } else {

            player1PlayerImage.src =
                `ASSETS/jugadores/${team1.characterKey}derecha.png`;

            player1PlayerImage.alt =
                team1.playerName;

        }

    }


    /* ===================================================== */
    /* EQUIPO 2                                               */
    /* ===================================================== */

    if (player2TeamName) {

        player2TeamName.textContent =
            team2.name;

    }


    if (player2PlayerName) {

        player2PlayerName.textContent =
            team2.playerName;

    }


    if (player2TeamColor) {

        player2TeamColor.style.background =
            `linear-gradient(
                135deg,
                ${team2.primaryColor},
                ${team2.secondaryColor}
            )`;

        player2TeamColor.style.borderColor =
            team2.secondaryColor;

    }


    if (player2Panel) {

        player2Panel.style.setProperty(
            "--team-primary",
            team2.primaryColor
        );

        player2Panel.style.setProperty(
            "--team-secondary",
            team2.secondaryColor
        );

        player2Panel.dataset.team =
            team2.id;

    }


    if (player2TeamIndexElement) {

        player2TeamIndexElement.textContent =
            `${String(
                MatchSetupState.player2TeamIndex + 1
            ).padStart(2, "0")} / ${String(
                TEAMS.length
            ).padStart(2, "0")}`;

    }


    if (
        player2PlayerImage &&
        (
            !changedPlayer ||
            changedPlayer === "player2"
        )
    ) {

        if (changedPlayer === "player2") {

            animatePlayerChange(
                player2PlayerImage,
                team2,
                direction
            );

        } else {

            player2PlayerImage.src =
                `ASSETS/jugadores/${team2.characterKey}izquierda.png`;

            player2PlayerImage.alt =
                team2.playerName;

        }

    }


    /* ===================================================== */
    /* DURACIÓN                                               */
    /* ===================================================== */

    durationButtons.forEach(
        (button) => {

            const buttonDuration =
                Number(
                    button.dataset.duration
                );


            if (
                buttonDuration ===
                MatchSetupState.duration
            ) {

                button.classList.add(
                    "selected"
                );

            } else {

                button.classList.remove(
                    "selected"
                );

            }

        }
    );


    /* ===================================================== */
    /* MODO                                                   */
    /* ===================================================== */

    gameModeButtons.forEach(
        (button) => {

            const buttonMode =
                button.dataset.mode;


            if (
                buttonMode ===
                MatchSetupState.mode
            ) {

                button.classList.add(
                    "selected"
                );

            } else {

                button.classList.remove(
                    "selected"
                );

            }

        }
    );


    /* ===================================================== */
    /* RESUMEN                                                */
    /* ===================================================== */

    if (matchSummary) {

        const minutes =
            Math.floor(
                MatchSetupState.duration / 60
            );


        matchSummary.textContent =
            `${team1.shortName}  VS  ${team2.shortName}  ·  ${minutes}:00`;

    }

}


/* ========================================================= */
/* CONTINUAR AL PARTIDO                                      */
/* ========================================================= */

function handleContinueToGame() {

    const team1 =
        TEAMS[
            MatchSetupState.player1TeamIndex
        ];


    const team2 =
        TEAMS[
            MatchSetupState.player2TeamIndex
        ];


    /* ===================================================== */
    /* GUARDAR CONFIGURACIÓN                                 */
    /* ===================================================== */

    window.selectedMatch = {

        team1: team1,

        team2: team2,

        duration:
            MatchSetupState.duration,

        mode:
            MatchSetupState.mode

    };


    /* ===================================================== */
    /* ASEGURAR MODO GLOBAL                                  */
    /* ===================================================== */

    if (
        window.GameMode &&
        typeof GameMode.setMode ===
        "function"
    ) {

        GameMode.setMode(
            MatchSetupState.mode
        );

    }


    console.log(
        "Configuración del partido:",
        window.selectedMatch
    );


    /* ===================================================== */
    /* AUDIO                                                 */
    /* ===================================================== */

    if (window.AudioManager) {

        AudioManager.stopMusic();

        AudioManager.playStadium();

        AudioManager.playReferee();

    }


    /* ===================================================== */
    /* CAMBIAR PANTALLA                                      */
    /* ===================================================== */

    if (
        typeof MenuState !==
        "undefined"
    ) {

        MenuState.currentScreen =
            "game";

    }


    const matchSetupScreen =
        document.getElementById(
            "matchSetupScreen"
        );


    const gameScreen =
        document.getElementById(
            "gameScreen"
        );


    if (matchSetupScreen) {

        matchSetupScreen.classList.remove(
            "active"
        );


        matchSetupScreen.classList.add(
            "hidden"
        );


        matchSetupScreen.style.display =
            "none";

    }


    if (gameScreen) {

        gameScreen.classList.remove(
            "hidden"
        );


        gameScreen.classList.add(
            "active"
        );


        gameScreen.style.display =
            "flex";

    } else {

        console.error(
            "No se encontró el elemento #gameScreen en index.html"
        );


        return;

    }


    /* ===================================================== */
    /* INICIAR PARTIDO                                      */
    /* ===================================================== */

    if (
        typeof window.startFootballGame ===
        "function"
    ) {

        window.startFootballGame(
            window.selectedMatch
        );

    } else {

        console.error(
            "No se encontró startFootballGame. Revisá que game.js esté incluido en index.html."
        );

    }

}


/* ========================================================= */
/* INICIALIZACIÓN                                            */
/* ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeMatchSetup
    );

} else {

    initializeMatchSetup();

}