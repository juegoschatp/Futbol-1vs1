/* ========================================================= */
/* INTRO.JS                                                  */
/* Pantalla inicial y activación del audio                  */
/* ========================================================= */

"use strict";


const IntroScreen = {

    element: null,

    opened: false,

    audioStarted: false,


    /* ===================================================== */
    /* INICIALIZACIÓN                                        */
    /* ===================================================== */

    init() {

        this.element =
            document.getElementById("introScreen");


        if (!this.element) {

            console.warn(
                "IntroScreen: no se encontró #introScreen."
            );

            return;
        }


        this.createParticles();

        this.bindEvents();

    },


    /* ===================================================== */
    /* PARTÍCULAS                                            */
    /* ===================================================== */

    createParticles() {

        const container =
            document.getElementById("introParticles");


        if (!container) return;


        /*
           Cantidad moderada para mantener
           buen rendimiento en móviles.
        */

        const particleCount = 22;


        for (
            let i = 0;
            i < particleCount;
            i++
        ) {

            const particle =
                document.createElement("span");


            particle.className =
                "intro-particle";


            const size =
                (
                    Math.random() * 3.2 + 1
                ).toFixed(2) + "px";


            const x =
                (
                    Math.random() * 100
                ).toFixed(2) + "%";


            const y =
                (
                    Math.random() * 100
                ).toFixed(2) + "%";


            const opacity =
                (
                    Math.random() * 0.35 + 0.18
                ).toFixed(2);


            const duration =
                (
                    Math.random() * 5 + 4
                ).toFixed(2) + "s";


            const delay =
                (
                    Math.random() * -5
                ).toFixed(2) + "s";


            const moveX =
                (
                    Math.random() * 50 - 25
                ).toFixed(1) + "px";


            const moveY =
                (
                    Math.random() * 50 - 25
                ).toFixed(1) + "px";


            const glow =
                (
                    Math.random() * 8 + 2
                ).toFixed(1) + "px";


            particle.style.setProperty(
                "--size",
                size
            );


            particle.style.setProperty(
                "--x",
                x
            );


            particle.style.setProperty(
                "--y",
                y
            );


            particle.style.setProperty(
                "--opacity",
                opacity
            );


            particle.style.setProperty(
                "--duration",
                duration
            );


            particle.style.setProperty(
                "--delay",
                delay
            );


            particle.style.setProperty(
                "--move-x",
                moveX
            );


            particle.style.setProperty(
                "--move-y",
                moveY
            );


            particle.style.setProperty(
                "--glow",
                glow
            );


            container.appendChild(
                particle
            );
        }

    },


    /* ===================================================== */
    /* EVENTOS                                               */
    /* ===================================================== */

    bindEvents() {

        this.element.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();

                this.open();

            },
            {
                passive: false,
                once: true
            }
        );


        /*
           Teclado para PC.
        */

        window.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.code === "Enter" ||
                    event.code === "Space"
                ) {

                    this.open();

                }

            }
        );


        /*
           Si cambia la orientación mientras
           la intro está abierta, comprobamos
           nuevamente el estado.
        */

        window.addEventListener(
            "orientationchange",
            () => {

                if (
                    window.matchMedia(
                        "(orientation: portrait)"
                    ).matches
                ) {

                    /*
                       No hacemos nada.
                       La pantalla de orientación
                       queda por encima.
                    */

                    return;
                }

            }
        );

    },


    /* ===================================================== */
    /* ABRIR EXPERIENCIA                                     */
    /* ===================================================== */

    open() {

        if (this.opened) return;


        /*
           Si estamos en vertical,
           no permitimos abrir la intro.
        */

        if (
            window.matchMedia(
                "(orientation: portrait)"
            ).matches
        ) {

            return;
        }


        this.opened = true;


        /*
           PRIMERO:
           activar el audio durante la interacción
           real del usuario.
        */

        this.startAudio();


        /*
           SEGUNDO:
           comenzar la apertura.
        */

        this.element.classList.add(
            "intro-opening"
        );


        /*
           La animación CSS dura 0.95s.
           La quitamos apenas termina.
        */

        setTimeout(() => {

            this.element.classList.add(
                "intro-finished"
            );

        }, 980);

    },


    /* ===================================================== */
    /* AUDIO                                                 */
    /* ===================================================== */

    startAudio() {

        if (this.audioStarted) return;


        this.audioStarted = true;


        if (
            window.AudioManager &&
            typeof AudioManager.unlock === "function"
        ) {

            AudioManager.unlock();

            return;
        }


        if (
            window.AudioManager &&
            typeof AudioManager.playMusic === "function"
        ) {

            AudioManager.playMusic();

        }

    }

};


/* ========================================================= */
/* INICIAR                                                    */
/* ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        IntroScreen.init();

    }
);