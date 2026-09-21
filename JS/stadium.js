/* ========================================================= */
/* STADIUM.JS                                                */
/* Sistema visual y límites del estadio                      */
/* ========================================================= */

class Stadium {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.image = new Image();
        this.loaded = false;

        this.image.src = "ASSETS/cancha.png";

        this.image.onload = () => {
            this.loaded = true;
        };

        this.image.onerror = () => {
            console.error(
                "No se pudo cargar ASSETS/cancha.png"
            );
        };


        /*
         * Dimensiones reales de cancha.png.
         */
        this.worldWidth = 1536;
        this.worldHeight = 714;


        /*
         * Altura del suelo.
         *
         * Los jugadores se apoyarán sobre esta línea.
         * Se encuentra un poco por encima del borde inferior
         * de la imagen para que no parezcan pegados al borde.
         */
        this.groundY = 540


        /*
         * Límites laterales del campo.
         */
        this.leftLimit = 20;
        this.rightLimit = 1516;


        /*
         * Límite superior de la zona jugable.
         */
        this.playTop = 0;
    }


    draw() {

        if (!this.loaded) {

            this.ctx.fillStyle = "#0b1824";

            this.ctx.fillRect(
                0,
                0,
                this.worldWidth,
                this.worldHeight
            );

            return;
        }


        this.ctx.drawImage(
            this.image,
            0,
            0,
            this.worldWidth,
            this.worldHeight
        );
    }

}


window.Stadium = Stadium;