/* ========================================================= */
/* COLLISION MAP                                             */
/* Travesaños blancos de collision.png                       */
/* ========================================================= */

class CollisionMap {

    constructor(options = {}) {

        this.width =
            options.width || 1536;

        this.height =
            options.height || 714;


        /* ================================================= */
        /* IMAGEN DE COLISIÓN                                */
        /* ================================================= */

        this.image =
            new Image();

        this.image.src =
            "ASSETS/collision.png";


        this.canvas =
            document.createElement("canvas");

        this.canvas.width =
            this.width;

        this.canvas.height =
            this.height;


        this.ctx =
            this.canvas.getContext("2d", {
                willReadFrequently: true
            });


        this.data = null;

        this.ready = false;


        this.image.onload = () => {

            /*
             * Dibujar collision.png exactamente con
             * el tamaño del mundo.
             */

            this.ctx.clearRect(
                0,
                0,
                this.width,
                this.height
            );


            this.ctx.drawImage(
                this.image,
                0,
                0,
                this.width,
                this.height
            );


            /*
             * Obtener los píxeles.
             */

            const imageData =
                this.ctx.getImageData(
                    0,
                    0,
                    this.width,
                    this.height
                );


            this.data =
                imageData.data;


            this.ready = true;


            console.log(
                "CollisionMap: collision.png cargado correctamente."
            );
        };


        this.image.onerror = () => {

            console.error(
                "CollisionMap: no se pudo cargar ASSETS/collision.png"
            );

            this.ready = false;
        };


        /* ================================================= */
        /* CONFIGURACIÓN DEL REBOTE                           */
        /* ================================================= */

        /*
         * Fuerza vertical del rebote.
         *
         * Queremos que el balón salga disparado.
         */

        this.upwardBounce =
            650;


        /*
         * Fuerza horizontal hacia el centro
         * del campo.
         */

        this.inwardBounce =
            420;


        /*
         * Velocidad máxima.
         */

        this.maxBounceSpeed =
            1050;


        /*
         * Pequeña protección contra múltiples
         * detecciones consecutivas.
         */

        this.cooldown =
            0.08;
    }



    /* ===================================================== */
    /* UPDATE                                                */
    /* ===================================================== */

    update(deltaTime) {

        if (!deltaTime) {
            return;
        }


        /*
         * El cooldown pertenece a la pelota.
         */

        return;
    }



    /* ===================================================== */
    /* COMPROBAR PIXEL BLANCO                                */
    /* ===================================================== */

    isWhite(x, y) {

        if (!this.ready || !this.data) {
            return false;
        }


        const px =
            Math.floor(x);

        const py =
            Math.floor(y);


        /*
         * Fuera de la imagen = libre.
         */

        if (
            px < 0 ||
            py < 0 ||
            px >= this.width ||
            py >= this.height
        ) {

            return false;
        }


        const index =
            (
                py *
                this.width +
                px
            ) * 4;


        const r =
            this.data[index];

        const g =
            this.data[index + 1];

        const b =
            this.data[index + 2];

        const a =
            this.data[index + 3];


        /*
         * Solo consideramos blanco.
         *
         * Negro = completamente libre.
         */

        return (
            a > 180 &&
            r > 220 &&
            g > 220 &&
            b > 220
        );
    }



    /* ===================================================== */
    /* BUSCAR CONTACTO CON EL BLANCO                         */
    /* ===================================================== */

    ballTouchesWhite(ball) {

        if (!ball) {
            return false;
        }


        const radius =
            Math.max(
                1,
                ball.radius || 18
            );


        /*
         * Puntos alrededor de la circunferencia.
         *
         * No hacemos ninguna geometría de paredes.
         * Simplemente preguntamos:
         *
         * "¿La pelota está tocando BLANCO?"
         */

        const samples = 32;


        for (
            let i = 0;
            i < samples;
            i++
        ) {

            const angle =
                (
                    Math.PI * 2 *
                    i
                ) /
                samples;


            const x =
                ball.x +
                Math.cos(angle) *
                radius;


            const y =
                ball.y +
                Math.sin(angle) *
                radius;


            if (
                this.isWhite(
                    x,
                    y
                )
            ) {

                return true;
            }
        }


        /*
         * También comprobamos el centro.
         *
         * Esto ayuda si el balón se mete ligeramente
         * dentro del píxel blanco entre dos frames.
         */

        if (
            this.isWhite(
                ball.x,
                ball.y
            )
        ) {

            return true;
        }


        return false;
    }



    /* ===================================================== */
    /* RESOLVER PELOTA                                       */
    /* ===================================================== */

    resolveBall(ball) {

        if (
            !this.ready ||
            !ball
        ) {

            return false;
        }


        /* ================================================= */
        /* COOLDOWN                                          */
        /* ================================================= */

        if (
            typeof ball.collisionMapCooldown !==
            "number"
        ) {

            ball.collisionMapCooldown =
                0;
        }


        if (
            ball.collisionMapCooldown > 0
        ) {

            ball.collisionMapCooldown -=
                0.016;

            return false;
        }


        /* ================================================= */
        /* ¿TOCÓ BLANCO?                                     */
        /* ================================================= */

        if (
            !this.ballTouchesWhite(ball)
        ) {

            return false;
        }


        /* ================================================= */
        /* DETERMINAR TRAVESAÑO                              */
        /* ================================================= */

        /*
         * Los dos únicos objetos blancos están
         * en los extremos del campo.
         *
         * Según X sabemos cuál tocó.
         */

        const touchingLeft =
            ball.x <
            this.width * 0.5;


        const touchingRight =
            !touchingLeft;


        /* ================================================= */
        /* REBOTE IZQUIERDO                                  */
        /* ================================================= */

        if (touchingLeft) {

            /*
             * El balón debe salir:
             *
             * ↑ arriba
             * → hacia el centro
             */

            ball.vx =
                this.inwardBounce;

            ball.vy =
                -this.upwardBounce;
        }


        /* ================================================= */
        /* REBOTE DERECHO                                    */
        /* ================================================= */

        if (touchingRight) {

            /*
             * El balón debe salir:
             *
             * ↑ arriba
             * ← hacia el centro
             */

            ball.vx =
                -this.inwardBounce;

            ball.vy =
                -this.upwardBounce;
        }


        /* ================================================= */
        /* LIMITAR VELOCIDAD                                 */
        /* ================================================= */

        const speed =
            Math.sqrt(
                ball.vx * ball.vx +
                ball.vy * ball.vy
            );


        if (
            speed >
            this.maxBounceSpeed
        ) {

            const factor =
                this.maxBounceSpeed /
                speed;


            ball.vx *=
                factor;

            ball.vy *=
                factor;
        }


        /* ================================================= */
        /* ESTADO                                             */
        /* ================================================= */

        ball.isOnGround =
            false;

        ball.hasLanded =
            true;

        ball.lastCollisionType =
            "collisionMap";


        /* ================================================= */
        /* SONIDO DEL TRAVESAÑO                              */
        /* ================================================= */

        /*
         * La colisión ya fue confirmada.
         *
         * El sonido principal suena siempre.
         *
         * El sonido "travesañoGrito" se reproduce
         * aleatoriamente desde AudioManager.
         */

        if (
            window.AudioManager &&
            typeof AudioManager.playCrossbar ===
            "function"
        ) {

            AudioManager.playCrossbar();

        }


        /* ================================================= */
        /* COOLDOWN                                          */
        /* ================================================= */

        ball.collisionMapCooldown =
            this.cooldown;


        /*
         * =================================================
         * IMPORTANTE
         * =================================================
         *
         * NO movemos la pelota a X=100.
         * NO la sacamos a una posición artificial.
         * NO creamos paredes.
         *
         * Solo modificamos su velocidad.
         *
         * La pelota seguirá su trayectoria hacia arriba
         * y hacia el centro.
         */


        return true;
    }



    /* ===================================================== */
    /* DEBUG                                                 */
    /* ===================================================== */

    drawDebug(ctx) {

        /*
         * Intencionalmente vacío.
         *
         * No queremos dibujar ninguna pared invisible
         * en el juego.
         */

        return;
    }
}


/* ========================================================= */
/* EXPORTAR                                                  */
/* ========================================================= */

window.CollisionMap =
    CollisionMap;