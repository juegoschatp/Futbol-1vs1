/* ========================================================= */
/* GAME MODE.JS                                              */
/* Gestiona el modo de juego actual                          */
/* ========================================================= */

"use strict";


const GameMode = {

    // =========================================================
    // MODOS DISPONIBLES
    // =========================================================

    PLAYER_VS_PLAYER: "player-vs-player",
    PLAYER_VS_AI: "player-vs-ai",


    // =========================================================
    // MODO ACTUAL
    // =========================================================

    current: "player-vs-player",


    // =========================================================
    // CAMBIAR MODO
    // =========================================================

    setMode(mode) {

        if (
            mode !== this.PLAYER_VS_PLAYER &&
            mode !== this.PLAYER_VS_AI
        ) {
            console.warn("Modo de juego no válido:", mode);
            return;
        }

        this.current = mode;
    },


    // =========================================================
    // CONSULTAR MODO
    // =========================================================

    isPlayerVsPlayer() {

        return this.current === this.PLAYER_VS_PLAYER;
    },


    isPlayerVsAI() {

        return this.current === this.PLAYER_VS_AI;
    },


    // =========================================================
    // OBTENER MODO ACTUAL
    // =========================================================

    getMode() {

        return this.current;
    }

};

window.GameMode = GameMode;