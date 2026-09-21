/* ========================================================= */
/* STADIUM FX.JS                                             */
/* Efectos visuales ambientales del estadio                  */
/* ========================================================= */

"use strict";


class StadiumFX {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        /*
         * Dimensiones del mundo.
         */
        this.worldWidth = 1536;
        this.worldHeight = 714;


        /*
         * Estado general.
         */
        this.time = 0;
        this.enabled = true;


        /*
         * Calidad automática.
         *
         * Se mantiene optimizado para móviles,
         * pero ahora con mayor presencia visual.
         */
        this.quality = this.detectQuality();


        /*
         * Cantidad máxima de partículas.
         */
        this.maxParticles = this.quality === "low"
            ? 40
            : this.quality === "medium"
                ? 60
                : 80;


        /*
         * Pool fijo de partículas.
         *
         * No se crean ni destruyen constantemente.
         */
        this.particles = [];

        for (let i = 0; i < this.maxParticles; i++) {

            this.particles.push(
                this.createParticle(true)
            );
        }


        /*
         * Próximo destello.
         */
        this.nextSparkle =
            1.2 + Math.random() * 2.5;


        /*
         * Estado de visibilidad.
         */
        this.visible = true;

        this.handleVisibility = () => {

            this.visible = !document.hidden;

        };

        document.addEventListener(
            "visibilitychange",
            this.handleVisibility,
            { passive: true }
        );
    }


    /* ===================================================== */
    /* CALIDAD                                               */
    /* ===================================================== */

    detectQuality() {

        const width =
            window.innerWidth || 1280;

        const height =
            window.innerHeight || 720;


        const area =
            width * height;


        /*
         * Teléfonos pequeños.
         */
        if (area < 500000) {
            return "low";
        }


        /*
         * Teléfonos grandes / tablets.
         */
        if (area < 1100000) {
            return "medium";
        }


        /*
         * Pantallas grandes.
         */
        return "high";
    }


    /* ===================================================== */
    /* CREAR PARTICULA                                       */
    /* ===================================================== */

    createParticle(randomStart = false) {

        const particle = {

            active: true,

            x: 0,
            y: 0,

            vx: 0,
            vy: 0,

            size: 1,
            alpha: 0,

            life: 0,
            maxLife: 1,

            phase: Math.random() * Math.PI * 2,

            drift: 0
        };


        this.resetParticle(
            particle,
            randomStart
        );


        return particle;
    }


    /* ===================================================== */
    /* REINICIAR PARTICULA                                   */
    /* ===================================================== */

    resetParticle(
        particle,
        randomStart = false
    ) {

        /*
         * Distribución por el estadio.
         */
        particle.x =
            Math.random() * this.worldWidth;


        particle.y =
            randomStart
                ? Math.random() * this.worldHeight
                : 220 + Math.random() * 330;


        /*
         * Movimiento suave.
         */
        particle.vx =
            (Math.random() - 0.5) * 10;


        particle.vy =
            -(4 + Math.random() * 10);


        /*
         * Partículas un poco más grandes
         * y visibles que la versión anterior.
         */
        particle.size =
            1.2 + Math.random() * 2.4;


        particle.alpha =
            0.20 + Math.random() * 0.30;


        particle.maxLife =
            5 + Math.random() * 7;


        particle.life =
            randomStart
                ? Math.random() * particle.maxLife
                : 0;


        particle.phase =
            Math.random() * Math.PI * 2;


        particle.drift =
            5 + Math.random() * 12;


        particle.active = true;
    }


    /* ===================================================== */
    /* UPDATE                                                */
    /* ===================================================== */

    update(deltaTime) {

        if (
            !this.enabled ||
            !this.visible
        ) {
            return;
        }


        /*
         * Evita saltos grandes de tiempo.
         */
        const dt =
            Math.min(
                Math.max(
                    deltaTime || 0,
                    0
                ),
                0.033
            );


        this.time += dt;


        /* ------------------------------------------------- */
        /* ACTUALIZAR PARTICULAS                             */
        /* ------------------------------------------------- */

        for (
            let i = 0;
            i < this.particles.length;
            i++
        ) {

            const particle =
                this.particles[i];


            if (!particle.active) {
                continue;
            }


            particle.life += dt;


            /*
             * Movimiento horizontal.
             */
            particle.x +=
                particle.vx * dt;


            /*
             * Oscilación ambiental.
             */
            particle.x +=
                Math.sin(
                    this.time * 0.7 +
                    particle.phase
                ) *
                particle.drift *
                dt;


            /*
             * Movimiento vertical.
             */
            particle.y +=
                particle.vy * dt;


            /*
             * Reutilizar cuando termina.
             */
            if (
                particle.life >=
                    particle.maxLife ||
                particle.y < 175
            ) {

                this.resetParticle(
                    particle,
                    false
                );

                continue;
            }


            /*
             * Mantener dentro del estadio.
             */
            if (particle.x < -10) {

                particle.x =
                    this.worldWidth + 10;
            }


            if (
                particle.x >
                this.worldWidth + 10
            ) {

                particle.x = -10;
            }
        }


        /* ------------------------------------------------- */
        /* DESTELLO                                           */
        /* ------------------------------------------------- */

        this.nextSparkle -= dt;


        if (this.nextSparkle <= 0) {

            this.nextSparkle =
                1.2 + Math.random() * 3.0;
        }
    }


    /* ===================================================== */
    /* DRAW                                                  */
    /* ===================================================== */

    draw() {

        if (
            !this.enabled ||
            !this.visible
        ) {
            return;
        }


        const ctx = this.ctx;


        ctx.save();


        /*
         * Ambiente.
         */
        this.drawAtmosphere(ctx);


        /*
         * Luz superior.
         */
        this.drawStadiumGlow(ctx);


        /*
         * Partículas.
         */
        this.drawParticles(ctx);


        /*
         * Destellos.
         */
        this.drawSparkles(ctx);


        ctx.restore();
    }


    /* ===================================================== */
    /* ATMOSFERA                                             */
    /* ===================================================== */

    drawAtmosphere(ctx) {

        /*
         * Pulso lento.
         */
        const pulse =
            0.5 +
            Math.sin(
                this.time * 0.45
            ) * 0.5;


        /*
         * Ahora es ligeramente más visible
         * que en la versión anterior.
         */
        const alpha =
            0.035 +
            pulse * 0.025;


        ctx.fillStyle =
            `rgba(255,255,255,${alpha})`;


        ctx.fillRect(
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );
    }


    /* ===================================================== */
    /* ILUMINACIÓN                                           */
    /* ===================================================== */

    drawStadiumGlow(ctx) {

        const pulse =
            Math.sin(
                this.time * 0.8
            ) * 0.5 + 0.5;


        /*
         * Luz suave desde la parte superior.
         */
        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                300
            );


        gradient.addColorStop(
            0,
            `rgba(
                255,
                255,
                255,
                ${0.045 + pulse * 0.025}
            )`
        );


        gradient.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            this.worldWidth,
            300
        );
    }


    /* ===================================================== */
    /* PARTICULAS                                            */
    /* ===================================================== */

    drawParticles(ctx) {

        for (
            let i = 0;
            i < this.particles.length;
            i++
        ) {

            const particle =
                this.particles[i];


            if (!particle.active) {
                continue;
            }


            /*
             * Progreso de vida.
             */
            const lifeProgress =
                particle.life /
                particle.maxLife;


            /*
             * Fade.
             */
            let fade = 1;


            if (
                lifeProgress < 0.15
            ) {

                fade =
                    lifeProgress /
                    0.15;

            } else if (
                lifeProgress > 0.78
            ) {

                fade =
                    (1 - lifeProgress) /
                    0.22;
            }


            const alpha =
                particle.alpha *
                Math.max(
                    0,
                    Math.min(
                        1,
                        fade
                    )
                );


            if (alpha <= 0) {
                continue;
            }


            ctx.globalAlpha =
                alpha;


            ctx.beginPath();


            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#ffffff";


            ctx.fill();
        }


        ctx.globalAlpha = 1;
    }


    /* ===================================================== */
    /* DESTELLOS                                            */
    /* ===================================================== */

    drawSparkles(ctx) {

        /*
         * El destello aparece solamente durante
         * una pequeña ventana de tiempo.
         */
        const cycle =
            this.nextSparkle;


        if (cycle > 0.22) {
            return;
        }


        const intensity =
            1 -
            cycle / 0.22;


        /*
         * Posición variable.
         */
        const x =
            180 +
            Math.sin(
                this.time * 1.7
            ) * 550 +
            550;


        const y =
            235 +
            Math.sin(
                this.time * 2.1
            ) * 35;


        /*
         * Destello más grande.
         */
        const radius =
            4 +
            intensity * 7;


        ctx.globalAlpha =
            intensity * 0.50;


        /*
         * Halo exterior.
         */
        const gradient =
            ctx.createRadialGradient(
                x,
                y,
                0,
                x,
                y,
                radius * 3
            );


        gradient.addColorStop(
            0,
            "rgba(255,255,255,0.9)"
        );


        gradient.addColorStop(
            0.35,
            "rgba(255,255,255,0.35)"
        );


        gradient.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );


        ctx.fillStyle =
            gradient;


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            radius * 3,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /*
         * Núcleo del destello.
         */
        ctx.globalAlpha =
            intensity * 0.65;


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#ffffff";


        ctx.fill();


        ctx.globalAlpha = 1;
    }


    /* ===================================================== */
    /* DESTRUIR                                             */
    /* ===================================================== */

    destroy() {

        document.removeEventListener(
            "visibilitychange",
            this.handleVisibility
        );


        this.particles.length = 0;


        this.canvas = null;
        this.ctx = null;
    }
}


/* ========================================================= */
/* EXPORT                                                    */
/* ========================================================= */

window.StadiumFX = StadiumFX;