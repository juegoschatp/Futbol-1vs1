/* ========================================================= */
/* JOYSTICK.JS                                               */
/* Joysticks táctiles para los jugadores                     */
/* ========================================================= */

"use strict";

class VirtualJoystick {

    constructor(element, options = {}) {

        this.element = element;

        if (!this.element) {
            console.warn(
                "VirtualJoystick: no se encontró el elemento."
            );
            return;
        }

        /* ================================================= */
        /* CONFIGURACIÓN                                     */
        /* ================================================= */

        this.maxDistance =
            options.maxDistance || 50;

        this.deadZone =
            options.deadZone ?? 0.08;

        /*
         * Pequeño ajuste del centro lógico.
         *
         * El joystick izquierdo detectará ligeramente
         * hacia la izquierda.
         *
         * El joystick derecho detectará ligeramente
         * hacia la derecha.
         *
         * Esto NO mueve visualmente el joystick.
         */
        this.centerOffsetX =
            options.centerOffsetX ??
            this.getAutomaticCenterOffset();

        this.x = 0;
        this.y = 0;

        this.active = false;

        this.pointerId = null;

        this.centerX = 0;
        this.centerY = 0;

        this.knob =
            this.element.querySelector(
                ".joystick-knob"
            );

        /* ================================================= */
        /* EVENTOS                                           */
        /* ================================================= */

        this.bindEvents();

        /* ================================================= */
        /* POSICIÓN INICIAL                                  */
        /* ================================================= */

        this.updateCenter();

        requestAnimationFrame(() => {

            this.updateCenter();
            this.reset();

        });
    }


    /* ===================================================== */
    /* AJUSTE AUTOMÁTICO DEL CENTRO                          */
    /* ===================================================== */

    getAutomaticCenterOffset() {

        /*
         * Intentamos determinar si este joystick pertenece
         * al lado izquierdo o derecho observando su posición
         * real en pantalla.
         *
         * Esto es importante porque después de girar el
         * teléfono no debemos depender de IDs o posiciones
         * antiguas.
         */

        const rect =
            this.element.getBoundingClientRect();

        const screenCenter =
            window.innerWidth * 0.5;

        const elementCenter =
            rect.left +
            rect.width * 0.5;

        /*
         * Unos pocos píxeles son suficientes.
         *
         * No queremos alterar demasiado la sensibilidad.
         */
        const offset =
            Math.max(
                4,
                Math.min(
                    10,
                    rect.width * 0.045
                )
            );

        /*
         * Joystick izquierdo.
         */
        if (
            elementCenter <
            screenCenter
        ) {

            return -offset;
        }

        /*
         * Joystick derecho.
         */
        return offset;
    }


    /* ===================================================== */
    /* EVENTOS                                                */
    /* ===================================================== */

    bindEvents() {

        this.element.addEventListener(
            "pointerdown",
            (event) => {

                event.preventDefault();

                if (this.active) {
                    return;
                }

                this.active = true;
                this.pointerId = event.pointerId;

                try {

                    this.element.setPointerCapture(
                        event.pointerId
                    );

                } catch (error) {
                    /*
                     * Algunos navegadores móviles pueden
                     * no soportarlo.
                     */
                }

                /*
                 * Recalculamos posición y ajuste JUSTO
                 * cuando comienza el toque.
                 */
                this.updateCenter();

                this.centerOffsetX =
                    this.getAutomaticCenterOffset();

                this.updateFromPointer(
                    event.clientX,
                    event.clientY
                );

            },
            {
                passive: false
            }
        );


        this.element.addEventListener(
            "pointermove",
            (event) => {

                event.preventDefault();

                if (!this.active) {
                    return;
                }

                if (
                    this.pointerId !== null &&
                    event.pointerId !== this.pointerId
                ) {
                    return;
                }

                /*
                 * IMPORTANTE:
                 *
                 * NO recalculamos el centro aquí.
                 *
                 * El centro queda fijo durante todo
                 * el movimiento del dedo.
                 */
                this.updateFromPointer(
                    event.clientX,
                    event.clientY
                );

            },
            {
                passive: false
            }
        );


        this.element.addEventListener(
            "pointerup",
            (event) => {

                if (
                    this.pointerId !== null &&
                    event.pointerId !== this.pointerId
                ) {
                    return;
                }

                this.releasePointer();

            }
        );


        this.element.addEventListener(
            "pointercancel",
            (event) => {

                if (
                    this.pointerId !== null &&
                    event.pointerId !== this.pointerId
                ) {
                    return;
                }

                this.releasePointer();

            }
        );


        this.element.addEventListener(
            "lostpointercapture",
            () => {

                if (this.active) {
                    this.releasePointer();
                }

            }
        );


        /* ================================================= */
        /* RESIZE                                            */
        /* ================================================= */

        window.addEventListener(
            "resize",
            () => {

                /*
                 * Si el usuario no está tocando el joystick,
                 * podemos recalcular libremente.
                 */
                if (!this.active) {

                    this.updateCenter();

                    this.centerOffsetX =
                        this.getAutomaticCenterOffset();

                    this.reset();

                }

            }
        );


        /* ================================================= */
        /* ORIENTACIÓN                                       */
        /* ================================================= */

        window.addEventListener(
            "orientationchange",
            () => {

                /*
                 * No tocamos el centro mientras el dedo
                 * está presionado.
                 */
                if (this.active) {
                    return;
                }

                this.updateCenter();

                this.centerOffsetX =
                    this.getAutomaticCenterOffset();

                requestAnimationFrame(() => {

                    this.updateCenter();

                    this.centerOffsetX =
                        this.getAutomaticCenterOffset();

                    requestAnimationFrame(() => {

                        this.updateCenter();

                        this.centerOffsetX =
                            this.getAutomaticCenterOffset();

                        this.reset();

                    });

                });

            }
        );
    }


    /* ===================================================== */
    /* ACTUALIZAR CENTRO                                     */
    /* ===================================================== */

    updateCenter() {

        if (!this.element) {
            return;
        }

        const rect =
            this.element.getBoundingClientRect();

        /*
         * Centro físico del elemento.
         */
        this.centerX =
            rect.left +
            rect.width * 0.5;

        this.centerY =
            rect.top +
            rect.height * 0.5;

        /*
         * Centro lógico para la detección.
         *
         * El desplazamiento NO mueve la imagen.
         */
        this.centerX +=
            this.centerOffsetX;
    }


    /* ===================================================== */
    /* PROCESAR PUNTERO                                      */
    /* ===================================================== */

    updateFromPointer(clientX, clientY) {

        /*
         * Calculamos la distancia desde el centro lógico.
         */
        let dx =
            clientX -
            this.centerX;

        let dy =
            clientY -
            this.centerY;


        /* ================================================= */
        /* DISTANCIA                                         */
        /* ================================================= */

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        /*
         * Limitamos la distancia máxima.
         */
        if (
            distance >
            this.maxDistance
        ) {

            const factor =
                this.maxDistance /
                distance;

            dx *= factor;
            dy *= factor;

        }


        /* ================================================= */
        /* NORMALIZACIÓN                                    */
        /* ================================================= */

        let normalizedX =
            dx /
            this.maxDistance;

        let normalizedY =
            dy /
            this.maxDistance;


        normalizedX =
            Math.max(
                -1,
                Math.min(
                    1,
                    normalizedX
                )
            );

        normalizedY =
            Math.max(
                -1,
                Math.min(
                    1,
                    normalizedY
                )
            );


        /* ================================================= */
        /* DEAD ZONE                                         */
        /* ================================================= */

        const magnitude =
            Math.sqrt(
                normalizedX * normalizedX +
                normalizedY * normalizedY
            );


        if (
            magnitude <
            this.deadZone
        ) {

            normalizedX = 0;
            normalizedY = 0;

        } else {

            const adjustedMagnitude =
                Math.min(
                    1,
                    (
                        magnitude -
                        this.deadZone
                    ) /
                    (1 - this.deadZone)
                );

            const angle =
                Math.atan2(
                    normalizedY,
                    normalizedX
                );

            normalizedX =
                Math.cos(angle) *
                adjustedMagnitude;

            normalizedY =
                Math.sin(angle) *
                adjustedMagnitude;
        }


        /* ================================================= */
        /* GUARDAR INPUT                                     */
        /* ================================================= */

        this.x =
            normalizedX;

        this.y =
            normalizedY;


        /*
         * La perilla visual continúa siguiendo exactamente
         * al dedo.
         */
        this.updateKnob(
            dx,
            dy
        );
    }


    /* ===================================================== */
    /* MOVER PERILLA                                         */
    /* ===================================================== */

    updateKnob(dx, dy) {

        if (!this.knob) {
            return;
        }

        this.knob.style.transform =
            `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
    }


    /* ===================================================== */
    /* SOLTAR                                               */
    /* ===================================================== */

    releasePointer() {

        this.active = false;

        this.pointerId = null;

        this.reset();
    }


    /* ===================================================== */
    /* REINICIAR                                             */
    /* ===================================================== */

    reset() {

        this.x = 0;
        this.y = 0;

        if (this.knob) {

            this.knob.style.transform =
                "translate(-50%, -50%)";
        }
    }


    /* ===================================================== */
    /* OBTENER INPUT                                         */
    /* ===================================================== */

    getInput() {

        return {
            x: this.x,
            y: this.y
        };
    }
}


/* ========================================================= */
/* EXPORTAR                                                  */
/* ========================================================= */

window.VirtualJoystick =
    VirtualJoystick;