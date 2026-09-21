/* ========================================================= */
/* DIZZINESS.JS                                              */
/* Efecto visual de mareo de los jugadores                   */
/* ========================================================= */

"use strict";


class DizzinessSystem {

    constructor() {

        this.time = 0;

        /*
         * Configuración visual
         */

        this.starCount = 4;

        this.orbitRadius = 38;

        this.verticalOffset = 78;

        this.rotationSpeed = 2.8;

        this.floatSpeed = 2.2;

        this.starSize = 9;
    }


    /* ===================================================== */
    /* ACTUALIZAR                                             */
    /* ===================================================== */

    update(deltaTime) {

        if (!deltaTime) {
            return;
        }

        this.time += deltaTime;

        /*
         * Evitar que el contador crezca infinitamente.
         */

        if (this.time > 1000) {
            this.time = 0;
        }
    }


    /* ===================================================== */
    /* DIBUJAR                                                */
    /* ===================================================== */

    draw(ctx, player) {

        if (!ctx || !player) {
            return;
        }

        /*
         * Solamente mostramos el efecto cuando
         * el jugador está mareado.
         */

        if (!player.isDizzy) {
            return;
        }


        const centerX =
            player.x;

        const centerY =
            player.y -
            this.verticalOffset;


        ctx.save();


        /*
         * Las estrellas giran alrededor de la cabeza.
         */

        for (
            let i = 0;
            i < this.starCount;
            i++
        ) {

            const angle =
                this.time *
                this.rotationSpeed +
                (Math.PI * 2 / this.starCount) * i;


            /*
             * Movimiento vertical suave.
             */

            const floatOffset =
                Math.sin(
                    this.time *
                    this.floatSpeed +
                    i
                ) * 5;


            const x =
                centerX +
                Math.cos(angle) *
                this.orbitRadius;


            const y =
                centerY +
                Math.sin(angle) *
                this.orbitRadius *
                0.42 +
                floatOffset;


            /*
             * Tamaño ligeramente variable.
             */

            const pulse =
                1 +
                Math.sin(
                    this.time * 4 +
                    i
                ) * 0.12;


            const size =
                this.starSize *
                pulse;


            this.drawStar(
                ctx,
                x,
                y,
                size,
                angle
            );
        }


        ctx.restore();
    }


    /* ===================================================== */
    /* ESTRELLA                                               */
    /* ===================================================== */

    drawStar(
        ctx,
        x,
        y,
        size,
        rotation
    ) {

        const spikes = 5;

        const outerRadius =
            size;

        const innerRadius =
            size * 0.45;


        ctx.save();

        ctx.translate(
            x,
            y
        );

        ctx.rotate(
            rotation
        );


        ctx.beginPath();


        for (
            let i = 0;
            i < spikes * 2;
            i++
        ) {

            const radius =
                i % 2 === 0
                    ? outerRadius
                    : innerRadius;


            const angle =
                (
                    Math.PI *
                    i
                ) / spikes -
                Math.PI / 2;


            const pointX =
                Math.cos(angle) *
                radius;


            const pointY =
                Math.sin(angle) *
                radius;


            if (i === 0) {

                ctx.moveTo(
                    pointX,
                    pointY
                );

            } else {

                ctx.lineTo(
                    pointX,
                    pointY
                );
            }
        }


        ctx.closePath();


        /*
         * Brillo suave.
         */

        ctx.shadowColor =
            "rgba(255, 230, 80, 0.75)";

        ctx.shadowBlur =
            8;


        ctx.fillStyle =
            "#ffe45c";


        ctx.fill();


        /*
         * Pequeño centro brillante.
         */

        ctx.shadowBlur =
            0;

        ctx.fillStyle =
            "rgba(255,255,255,0.85)";


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            size * 0.18,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.restore();
    }
}


/* ========================================================= */
/* EXPORTAR                                                 */
/* ========================================================= */

window.DizzinessSystem =
    DizzinessSystem;