/* ========================================================= */
/* CONTROLS.JS                                               */
/* Controles del partido                                     */
/* Botones de dirección + patear + teclado                   */
/* ========================================================= */

class GameControls {

    constructor() {

        /* =====================================================
           ESTADO DE LOS JUGADORES
           ===================================================== */

        this.player1 = {
            left: false,
            right: false,
            jump: false,
            kick: false
        };

        this.player2 = {
            left: false,
            right: false,
            jump: false,
            kick: false
        };


        /* =====================================================
           INICIALIZACIÓN
           ===================================================== */

        this.setupDirectionButtons();
        this.setupKickButtons();
        this.setupKeyboardControls();
    }



    /* =========================================================
       BOTONES DE DIRECCIÓN
       ========================================================= */

    setupDirectionButtons() {

        /* =====================================================
           JUGADOR 1
           ===================================================== */

        const leftButton1 =
            document.getElementById("leftButton1");

        const rightButton1 =
            document.getElementById("rightButton1");

        const upButton1 =
            document.getElementById("upButton1");


        /* IZQUIERDA */

        if (leftButton1) {

            this.bindHoldButton(
                leftButton1,

                () => {

                    this.player1.left = true;

                },

                () => {

                    this.player1.left = false;

                }
            );
        }


        /* DERECHA */

        if (rightButton1) {

            this.bindHoldButton(
                rightButton1,

                () => {

                    this.player1.right = true;

                },

                () => {

                    this.player1.right = false;

                }
            );
        }


        /* ARRIBA / SALTO */

        if (upButton1) {

            this.bindPressButton(
                upButton1,

                () => {

                    this.player1.jump = true;

                }
            );
        }



        /* =====================================================
           JUGADOR 2
           ===================================================== */

        const leftButton2 =
            document.getElementById("leftButton2");

        const rightButton2 =
            document.getElementById("rightButton2");

        const upButton2 =
            document.getElementById("upButton2");


        /* IZQUIERDA */

        if (leftButton2) {

            this.bindHoldButton(
                leftButton2,

                () => {

                    this.player2.left = true;

                },

                () => {

                    this.player2.left = false;

                }
            );
        }


        /* DERECHA */

        if (rightButton2) {

            this.bindHoldButton(
                rightButton2,

                () => {

                    this.player2.right = true;

                },

                () => {

                    this.player2.right = false;

                }
            );
        }


        /* ARRIBA / SALTO */

        if (upButton2) {

            this.bindPressButton(
                upButton2,

                () => {

                    this.player2.jump = true;

                }
            );
        }
    }



    /* =========================================================
       BOTÓN DE MANTENER PRESIONADO
       ========================================================= */

    bindHoldButton(
        button,
        onPress,
        onRelease
    ) {

        let pressed = false;


        const press = (event) => {

            event.preventDefault();
            event.stopPropagation();


            if (pressed) {
                return;
            }


            pressed = true;


            if (button.setPointerCapture) {

                try {

                    button.setPointerCapture(
                        event.pointerId
                    );

                } catch (error) {

                    /*
                     * Algunos navegadores móviles
                     * pueden no permitir capturar
                     * el puntero.
                     */

                }
            }


            onPress();
        };


        const release = (event) => {

            if (event) {

                event.preventDefault();
                event.stopPropagation();

            }


            if (!pressed) {
                return;
            }


            pressed = false;

            onRelease();
        };


        button.addEventListener(
            "pointerdown",
            press,
            {
                passive: false
            }
        );


        button.addEventListener(
            "pointerup",
            release,
            {
                passive: false
            }
        );


        button.addEventListener(
            "pointercancel",
            release,
            {
                passive: false
            }
        );


        button.addEventListener(
            "lostpointercapture",
            release,
            {
                passive: false
            }
        );


        button.addEventListener(
            "contextmenu",
            (event) => {

                event.preventDefault();

            }
        );
    }



    /* =========================================================
       BOTÓN DE PRESIONAR
       ========================================================= */

    bindPressButton(
        button,
        action
    ) {

        let pressed = false;


        const press = (event) => {

            event.preventDefault();
            event.stopPropagation();


            if (pressed) {
                return;
            }


            pressed = true;


            if (button.setPointerCapture) {

                try {

                    button.setPointerCapture(
                        event.pointerId
                    );

                } catch (error) {

                    /*
                     * Algunos navegadores móviles
                     * pueden no permitir capturar
                     * el puntero.
                     */

                }
            }


            action();
        };


        const release = (event) => {

            if (event) {

                event.preventDefault();
                event.stopPropagation();

            }


            pressed = false;
        };


        button.addEventListener(
            "pointerdown",
            press,
            {
                passive: false
            }
        );


        button.addEventListener(
            "pointerup",
            release,
            {
                passive: false
            }
        );


        button.addEventListener(
            "pointercancel",
            release,
            {
                passive: false
            }
        );


        button.addEventListener(
            "lostpointercapture",
            release,
            {
                passive: false
            }
        );


        button.addEventListener(
            "contextmenu",
            (event) => {

                event.preventDefault();

            }
        );
    }



    /* =========================================================
       BOTONES DE PATEAR
       ========================================================= */

    setupKickButtons() {

        const kickButton1 =
            document.getElementById("kickButton1");

        const kickButton2 =
            document.getElementById("kickButton2");


        /* =====================================================
           JUGADOR 1
           ===================================================== */

        if (kickButton1) {

            this.bindPressButton(
                kickButton1,

                () => {

                    this.player1.kick = true;

                }
            );
        }



        /* =====================================================
           JUGADOR 2
           ===================================================== */

        if (kickButton2) {

            this.bindPressButton(
                kickButton2,

                () => {

                    this.player2.kick = true;

                }
            );
        }
    }



    /* =========================================================
       INPUT JUGADOR 1
       ========================================================= */

    getPlayer1Input() {

        const horizontal =
            this.getHorizontalInput(
                this.player1
            );


        const jump =
            this.player1.jump;


        const kick =
            this.player1.kick;


        /*
         * Las acciones de salto y patear son de un solo
         * disparo. Después de entregar el input se limpian.
         */

        this.player1.jump = false;
        this.player1.kick = false;


        return {

            joystick: {

                x: horizontal,

                /*
                 * Player.js utiliza y < -0.65
                 * para detectar el salto.
                 *
                 * Mandamos -1 únicamente durante
                 * el frame del salto.
                 */

                y: jump ? -1 : 0,

                magnitude:
                    Math.abs(horizontal),

                active:
                    horizontal !== 0

            },

            left:
                horizontal < 0,

            right:
                horizontal > 0,

            jump:
                jump,

            kick:
                kick

        };
    }



    /* =========================================================
       INPUT JUGADOR 2
       ========================================================= */

    getPlayer2Input() {

        const horizontal =
            this.getHorizontalInput(
                this.player2
            );


        const jump =
            this.player2.jump;


        const kick =
            this.player2.kick;


        /*
         * Limpiamos las acciones de un solo disparo.
         */

        this.player2.jump = false;
        this.player2.kick = false;


        return {

            joystick: {

                x: horizontal,

                y: jump ? -1 : 0,

                magnitude:
                    Math.abs(horizontal),

                active:
                    horizontal !== 0

            },

            left:
                horizontal < 0,

            right:
                horizontal > 0,

            jump:
                jump,

            kick:
                kick

        };
    }



    /* =========================================================
       MOVIMIENTO HORIZONTAL
       ========================================================= */

    getHorizontalInput(player) {

        let horizontal = 0;


        if (player.left) {

            horizontal -= 1;

        }


        if (player.right) {

            horizontal += 1;

        }


        /*
         * Si por algún motivo se mantienen ambos botones,
         * se neutralizan entre sí.
         */

        return horizontal;
    }



    /* =========================================================
       TECLADO
       ========================================================= */

    setupKeyboardControls() {

        /* =====================================================
           TECLADO - PRESIONAR
           ===================================================== */

        window.addEventListener(
            "keydown",
            (event) => {

                switch (event.code) {


                    /* =========================================
                       JUGADOR 1
                       ========================================= */

                    case "KeyA":

                        event.preventDefault();

                        this.player1.left = true;

                        break;


                    case "KeyD":

                        event.preventDefault();

                        this.player1.right = true;

                        break;


                    case "KeyW":

                        event.preventDefault();

                        if (!event.repeat) {

                            this.player1.jump = true;

                        }

                        break;


                    case "Space":

                        event.preventDefault();

                        if (!event.repeat) {

                            this.player1.kick = true;

                        }

                        break;



                    /* =========================================
                       JUGADOR 2
                       
                       J = IZQUIERDA
                       L = DERECHA
                       I = SALTO
                       H = PATEAR
                       K = SIN FUNCIÓN
                       ========================================= */

                    case "KeyJ":

                        event.preventDefault();

                        this.player2.left = true;

                        break;


                    case "KeyL":

                        event.preventDefault();

                        this.player2.right = true;

                        break;


                    case "KeyI":

                        event.preventDefault();

                        if (!event.repeat) {

                            this.player2.jump = true;

                        }

                        break;


                    case "KeyH":

                        event.preventDefault();

                        if (!event.repeat) {

                            this.player2.kick = true;

                        }

                        break;

                }

            }
        );



        /* =====================================================
           TECLADO - SOLTAR
           ===================================================== */

        window.addEventListener(
            "keyup",
            (event) => {

                switch (event.code) {


                    /* =========================================
                       JUGADOR 1
                       ========================================= */

                    case "KeyA":

                        event.preventDefault();

                        this.player1.left = false;

                        break;


                    case "KeyD":

                        event.preventDefault();

                        this.player1.right = false;

                        break;



                    /* =========================================
                       JUGADOR 2
                       ========================================= */

                    case "KeyJ":

                        event.preventDefault();

                        this.player2.left = false;

                        break;


                    case "KeyL":

                        event.preventDefault();

                        this.player2.right = false;

                        break;

                }

            }
        );



        /* =====================================================
           PERDER INPUT AL CAMBIAR DE VENTANA
           ===================================================== */

        window.addEventListener(
            "blur",
            () => {

                this.resetInputs();

            }
        );
    }



    /* =========================================================
       RESET DE INPUTS
       ========================================================= */

    resetInputs() {

        this.player1.left = false;
        this.player1.right = false;
        this.player1.jump = false;
        this.player1.kick = false;


        this.player2.left = false;
        this.player2.right = false;
        this.player2.jump = false;
        this.player2.kick = false;
    }
}



/* ========================================================= */
/* DISPONIBLE GLOBALMENTE                                    */
/* ========================================================= */

window.GameControls = GameControls