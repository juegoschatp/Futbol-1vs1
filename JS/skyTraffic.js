"use strict";

/* ========================================================= */
/* SKY TRAFFIC                                               */
/* Aviones ocasionales sobre el estadio                      */
/* ========================================================= */

class SkyTraffic {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.worldWidth = 1536;
        this.worldHeight = 714;

        this.enabled = true;
        this.time = 0;

        /* ================================================= */
        /* AVIONES                                            */
        /* ================================================= */

        this.airplaneRight = new Image();
        this.airplaneLeft = new Image();

        this.airplaneRightLoaded = false;
        this.airplaneLeftLoaded = false;

        /* Avión mirando hacia la derecha */
        this.airplaneRight.src = "ASSETS/aviond.png";

        this.airplaneRight.onload = () => {
            this.airplaneRightLoaded = true;
        };

        this.airplaneRight.onerror = () => {
            console.error(
                "SkyTraffic: no se pudo cargar ASSETS/aviond.png"
            );
        };


        /* Avión mirando hacia la izquierda */
        this.airplaneLeft.src = "ASSETS/avioni.png";

        this.airplaneLeft.onload = () => {
            this.airplaneLeftLoaded = true;
        };

        this.airplaneLeft.onerror = () => {
            console.error(
                "SkyTraffic: no se pudo cargar ASSETS/avioni.png"
            );
        };


        /* ================================================= */
        /* ESTADO                                             */
        /* ================================================= */

        this.activePlane = null;

        this.nextPlaneTime =
            this.randomDelay();

        this.lastPlaneTime = -999;


        /* ================================================= */
        /* TAMAÑO                                             */
        /* ================================================= */

        this.planeWidth = 190;
        this.planeHeight = 64;
    }


    /* ===================================================== */
    /* TIEMPO ENTRE AVIONES                                  */
    /* ===================================================== */

    randomDelay() {

        /*
         * Aproximadamente cada 20-40 segundos.
         */

        return 20 + Math.random() * 20;
    }


    /* ===================================================== */
    /* UPDATE                                                */
    /* ===================================================== */

    update(deltaTime) {

        if (!this.enabled) return;

        const dt = Math.min(
            Math.max(deltaTime || 0, 0),
            0.033
        );

        this.time += dt;


        /* Si hay un avión activo */

        if (this.activePlane) {

            this.updatePlane(
                this.activePlane,
                dt
            );

            return;
        }


        /* Esperar para el próximo avión */

        this.nextPlaneTime -= dt;


        if (
            this.nextPlaneTime <= 0 &&
            this.time - this.lastPlaneTime > 8
        ) {

            this.spawnPlane();
        }
    }


    /* ===================================================== */
    /* CREAR AVIÓN                                           */
    /* ===================================================== */

    spawnPlane() {

        /*
         * 50% → derecha
         * 50% → izquierda
         */

        const leftToRight =
            Math.random() < 0.5;


        const image =
            leftToRight
                ? this.airplaneRight
                : this.airplaneLeft;


        const imageReady =
            leftToRight
                ? this.airplaneRightLoaded
                : this.airplaneLeftLoaded;


        if (!imageReady) {

            this.nextPlaneTime = 3;

            return;
        }


        /* ================================================= */
        /* ALTURA                                             */
        /* ================================================= */

        const baseY =
            80 +
            Math.random() * 105;


        /* ================================================= */
        /* VELOCIDAD                                         */
        /* ================================================= */

        const speed =
            80 +
            Math.random() * 50;


        /* ================================================= */
        /* TAMAÑO                                             */
        /* ================================================= */

        const scale =
            0.90 +
            Math.random() * 0.18;


        const width =
            this.planeWidth * scale;

        const height =
            this.planeHeight * scale;


        /* ================================================= */
        /* POSICIONES                                        */
        /* ================================================= */

        const startX =
            leftToRight
                ? -width - 40
                : this.worldWidth + width + 40;


        const endX =
            leftToRight
                ? this.worldWidth + width + 40
                : -width - 40;


        /* ================================================= */
        /* MOVIMIENTO VERTICAL                               */
        /* ================================================= */

        const waveOffset =
            Math.random() *
            Math.PI *
            2;


        const waveAmplitude =
            10 +
            Math.random() * 12;


        const waveSpeed =
            0.45 +
            Math.random() * 0.30;


        /* ================================================= */
        /* CREAR                                             */
        /* ================================================= */

        this.activePlane = {

            x: startX,

            y: baseY,

            baseY: baseY,

            width: width,

            height: height,

            speed: speed,

            direction:
                leftToRight
                    ? 1
                    : -1,

            endX: endX,

            image: image,


            /* Movimiento ondulado */

            waveOffset:
                waveOffset,

            waveAmplitude:
                waveAmplitude,

            waveSpeed:
                waveSpeed,


            /* Movimiento secundario */

            driftOffset:
                Math.random() *
                Math.PI *
                2,

            driftSpeed:
                0.8 +
                Math.random() * 0.35,


            /* Pequeña inclinación visual */

            rotation: 0
        };


        this.lastPlaneTime =
            this.time;
    }


    /* ===================================================== */
    /* MOVIMIENTO                                            */
    /* ===================================================== */

    updatePlane(
        plane,
        deltaTime
    ) {

        /* ================================================= */
        /* MOVIMIENTO HORIZONTAL                             */
        /* ================================================= */

        plane.x +=
            plane.speed *
            plane.direction *
            deltaTime;


        /* ================================================= */
        /* MOVIMIENTO VERTICAL PRINCIPAL                     */
        /* ================================================= */

        const wave =
            Math.sin(
                this.time *
                plane.waveSpeed +
                plane.waveOffset
            );


        /* ================================================= */
        /* MOVIMIENTO VERTICAL SECUNDARIO                    */
        /* ================================================= */

        const smallDrift =
            Math.sin(
                this.time *
                plane.driftSpeed +
                plane.driftOffset
            );


        plane.y =
            plane.baseY +
            wave * plane.waveAmplitude +
            smallDrift * 2.5;


        /* ================================================= */
        /* PEQUEÑA INCLINACIÓN                               */
        /* ================================================= */

        /*
         * El avión se inclina apenas cuando sube
         * o baja. Es muy sutil para que no parezca
         * que está girando.
         */

        const verticalSpeed =
            Math.cos(
                this.time *
                plane.waveSpeed +
                plane.waveOffset
            );


        plane.rotation =
            verticalSpeed *
            0.025;


        /* ================================================= */
        /* SALIÓ DE PANTALLA                                 */
        /* ================================================= */

        const finished =
            plane.direction === 1
                ? plane.x > plane.endX
                : plane.x < plane.endX;


        if (finished) {

            this.activePlane = null;

            this.nextPlaneTime =
                this.randomDelay();
        }
    }


    /* ===================================================== */
    /* DRAW                                                  */
    /* ===================================================== */

    draw() {

        if (
            !this.enabled ||
            !this.activePlane
        ) {
            return;
        }


        const ctx =
            this.ctx;

        const plane =
            this.activePlane;


        if (
            !plane.image ||
            !plane.image.complete ||
            plane.image.naturalWidth === 0
        ) {
            return;
        }


        ctx.save();


        /* Posición */

        ctx.translate(
            plane.x,
            plane.y
        );


        /*
         * Las imágenes ya están orientadas
         * correctamente.
         *
         * aviond.png → derecha
         * avioni.png → izquierda
         */


        /* Pequeña inclinación */

        ctx.rotate(
            plane.rotation
        );


        /* Transparencia */

        ctx.globalAlpha =
            0.94;


        /* Dibujar */

        ctx.drawImage(

            plane.image,

            -plane.width / 2,

            -plane.height / 2,

            plane.width,

            plane.height
        );


        ctx.globalAlpha =
            1;


        ctx.restore();
    }


    /* ===================================================== */
    /* ACTIVAR / DESACTIVAR                                  */
    /* ===================================================== */

    setEnabled(value) {

        this.enabled =
            Boolean(value);


        if (!this.enabled) {

            this.activePlane = null;
        }
    }


    /* ===================================================== */
    /* APARECER AHORA                                        */
    /* ===================================================== */

    spawnNow() {

        if (!this.activePlane) {

            this.spawnPlane();
        }
    }


    /* ===================================================== */
    /* DESTRUIR                                              */
    /* ===================================================== */

    destroy() {

        this.activePlane = null;

        this.airplaneRight = null;
        this.airplaneLeft = null;

        this.canvas = null;
        this.ctx = null;
    }
}


/* ========================================================= */
/* GLOBAL                                                    */
/* ========================================================= */

window.SkyTraffic = SkyTraffic;