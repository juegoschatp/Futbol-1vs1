"use strict";

/* ========================================================= */
/* LOADING SCREEN                                            */
/* Pantalla de carga inicial del juego                       */
/* ========================================================= */

const LoadingScreen = {

    element: null,
    progressBar: null,
    percentage: null,
    statusText: null,

    initialized: false,

    init() {

        this.element =
            document.getElementById("loadingScreen");

        this.progressBar =
            document.getElementById("loadingProgressBar");

        this.percentage =
            document.getElementById("loadingPercentage");

        this.statusText =
            document.getElementById("loadingStatus");

        if (!this.element) {
            console.warn(
                "LoadingScreen: no se encontró #loadingScreen."
            );

            return;
        }

        this.initialized = true;

        this.startLoading();
    },


    /* ===================================================== */
    /* RECURSOS IMPORTANTES                                  */
    /* ===================================================== */

    getAssets() {

        return [

            // Intro
            "ASSETS/intro.png",

            // Fondo del menú
            "ASSETS/fondo.png",

            // Cancha
            "ASSETS/cancha.png",

            // Mapa de colisiones
            "ASSETS/collision.png",

            // Avión
            "ASSETS/aviond.png",
            "ASSETS/avioni.png",

            // Jugadores
            "ASSETS/jugadores/messiderecha.png",
            "ASSETS/jugadores/messiderechalop.png",
            "ASSETS/jugadores/messiizquierda.png",
            "ASSETS/jugadores/messiizquierdalop.png",
            "ASSETS/jugadores/messisaltod.png",
            "ASSETS/jugadores/messisaltoi.png",
            "ASSETS/jugadores/messidownd.png",
            "ASSETS/jugadores/messidowni.png",

            "ASSETS/jugadores/neymarderecha.png",
            "ASSETS/jugadores/neymarderechalop.png",
            "ASSETS/jugadores/neymarizquierda.png",
            "ASSETS/jugadores/neymarizquierdalop.png",
            "ASSETS/jugadores/neymarsaltod.png",
            "ASSETS/jugadores/neymarsaltoi.png",
            "ASSETS/jugadores/neymardownd.png",
            "ASSETS/jugadores/neymardowni.png",

            "ASSETS/jugadores/mbapederecha.png",
            "ASSETS/jugadores/mbapederechalop.png",
            "ASSETS/jugadores/mbapeizquierda.png",
            "ASSETS/jugadores/mbapeizquierdalop.png",
            "ASSETS/jugadores/mbapesaltod.png",
            "ASSETS/jugadores/mbapesaltoi.png",
            "ASSETS/jugadores/mbapedownd.png",
            "ASSETS/jugadores/mbapedowni.png",

            "ASSETS/jugadores/pedriderecha.png",
            "ASSETS/jugadores/pedriderechalop.png",
            "ASSETS/jugadores/pedriizquierda.png",
            "ASSETS/jugadores/pedriizquierdalop.png",
            "ASSETS/jugadores/pedrisaltod.png",
            "ASSETS/jugadores/pedrisaltoi.png",
            "ASSETS/jugadores/pedridownd.png",
            "ASSETS/jugadores/pedridowni.png"
        ];
    },


    /* ===================================================== */
    /* CARGA                                                  */
    /* ===================================================== */

    async startLoading() {

        this.setProgress(0);

        const assets =
            this.getAssets();

        const total =
            assets.length;

        let loaded =
            0;

        this.setStatus("Preparando el juego...");

        for (const src of assets) {

            await this.loadImage(src);

            loaded++;

            const progress =
                Math.round(
                    (loaded / total) * 100
                );

            this.setProgress(progress);

            this.setStatus(
                progress < 100
                    ? "Cargando recursos..."
                    : "¡Todo listo!"
            );
        }

        await this.wait(250);

        this.finish();
    },


    /* ===================================================== */
    /* CARGAR IMAGEN                                         */
    /* ===================================================== */

    loadImage(src) {

        return new Promise((resolve) => {

            const image =
                new Image();

            image.onload =
                () => resolve();

            image.onerror =
                () => {

                    console.warn(
                        "LoadingScreen: no se pudo cargar:",
                        src
                    );

                    // No bloqueamos todo el juego
                    // si un recurso opcional falla.
                    resolve();
                };

            image.src = src;
        });
    },


    /* ===================================================== */
    /* PROGRESO                                               */
    /* ===================================================== */

    setProgress(value) {

        const progress =
            Math.max(
                0,
                Math.min(100, value)
            );

        if (this.progressBar) {

            this.progressBar.style.width =
                `${progress}%`;
        }

        if (this.percentage) {

            this.percentage.textContent =
                `${progress}%`;
        }
    },


    setStatus(text) {

        if (this.statusText) {

            this.statusText.textContent =
                text;
        }
    },


    /* ===================================================== */
    /* FINALIZAR                                              */
    /* ===================================================== */

    finish() {

        if (!this.element) {
            return;
        }

        this.element.classList.add(
            "loading-finished"
        );

        setTimeout(() => {

            this.element.classList.add(
                "loading-hidden"
            );

        }, 750);
    },


    /* ===================================================== */
    /* UTILIDAD                                               */
    /* ===================================================== */

    wait(milliseconds) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );
    }
};


/* ========================================================= */
/* INICIO                                                     */
/* ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        LoadingScreen.init();

    }
);