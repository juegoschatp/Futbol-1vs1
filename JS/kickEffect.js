/* ========================================================= */
/* KICK EFFECT                                               */
/* Efecto de viento al patear la pelota                      */
/* ========================================================= */

class KickEffect {

    constructor() {

        this.effects = [];
    }


    /* ===================================================== */
    /* CREAR EFECTO                                           */
    /* ===================================================== */

    trigger(x, y, direction, power) {

        const normalizedPower =
            Math.max(
                0,
                Math.min(
                    1,
                    power / 650
                )
            );


        const effect = {

            x: x,
            y: y,

            direction: direction >= 0
                ? 1
                : -1,

            life: 0,

            maxLife:
                0.18 +
                normalizedPower * 0.10,

            size:
                28 +
                normalizedPower * 42,

            width:
                12 +
                normalizedPower * 10,

            rotation:
                0,

            speed:
                180 +
                normalizedPower * 180
        };


        this.effects.push(effect);
    }


    /* ===================================================== */
    /* ACTUALIZAR                                             */
    /* ===================================================== */

    update(deltaTime) {

        for (
            let i = this.effects.length - 1;
            i >= 0;
            i--
        ) {

            const effect =
                this.effects[i];


            effect.life +=
                deltaTime;


            effect.x +=
                effect.direction *
                effect.speed *
                deltaTime;


            effect.size +=
                35 *
                deltaTime;


            effect.width +=
                8 *
                deltaTime;


            effect.rotation +=
                effect.direction *
                3 *
                deltaTime;


            if (
                effect.life >=
                effect.maxLife
            ) {

                this.effects.splice(
                    i,
                    1
                );
            }
        }
    }


    /* ===================================================== */
    /* DIBUJAR                                                */
    /* ===================================================== */

    draw(ctx) {

        if (
            !this.effects.length
        ) {

            return;
        }


        for (
            const effect of this.effects
        ) {

            const progress =
                effect.life /
                effect.maxLife;


            const alpha =
                Math.max(
                    0,
                    1 - progress
                );


            ctx.save();


            ctx.translate(
                effect.x,
                effect.y
            );


            ctx.scale(
                effect.direction,
                1
            );


            ctx.rotate(
                effect.rotation
            );


            ctx.globalAlpha =
                alpha * 0.55;


            /* ============================================= */
            /* RÁFAGA PRINCIPAL                               */
            /* ============================================= */

            ctx.beginPath();


            ctx.moveTo(
                0,
                -effect.width
            );


            ctx.quadraticCurveTo(
                effect.size * 0.35,
                -effect.width * 0.55,
                effect.size,
                0
            );


            ctx.quadraticCurveTo(
                effect.size * 0.35,
                effect.width * 0.55,
                0,
                effect.width
            );


            ctx.quadraticCurveTo(
                effect.size * 0.22,
                0,
                0,
                -effect.width
            );


            ctx.closePath();


            const gradient =
                ctx.createLinearGradient(
                    0,
                    0,
                    effect.size,
                    0
                );


            gradient.addColorStop(
                0,
                "rgba(255,255,255,0.75)"
            );


            gradient.addColorStop(
                0.45,
                "rgba(220,235,245,0.35)"
            );


            gradient.addColorStop(
                1,
                "rgba(220,235,245,0)"
            );


            ctx.fillStyle =
                gradient;


            ctx.fill();


            /* ============================================= */
            /* LÍNEA DE VIENTO SUPERIOR                       */
            /* ============================================= */

            ctx.globalAlpha =
                alpha * 0.35;


            ctx.beginPath();


            ctx.moveTo(
                2,
                -effect.width * 0.35
            );


            ctx.quadraticCurveTo(
                effect.size * 0.45,
                -effect.width * 0.9,
                effect.size,
                -effect.width * 0.45
            );


            ctx.strokeStyle =
                "rgba(255,255,255,0.75)";


            ctx.lineWidth =
                2;


            ctx.stroke();


            /* ============================================= */
            /* LÍNEA DE VIENTO INFERIOR                      */
            /* ============================================= */

            ctx.beginPath();


            ctx.moveTo(
                2,
                effect.width * 0.35
            );


            ctx.quadraticCurveTo(
                effect.size * 0.45,
                effect.width * 0.9,
                effect.size,
                effect.width * 0.45
            );


            ctx.stroke();


            ctx.restore();
        }
    }
}


window.KickEffect =
    KickEffect;