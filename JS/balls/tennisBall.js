/* ========================================================= */
/* TENNISBALL.JS                                             */
/* Configuración y apariencia de la pelota de tenis          */
/* ========================================================= */

Ball.registerType("tennis", {

    /* =====================================================
       FÍSICA
       ===================================================== */

    /*
     * Más pequeña que las demás.
     */
    radius: 11,


    /*
     * Cae más rápido.
     */
    gravity: 1450,


    /*
     * Rebota bastante, pero no como el básquet.
     */
    bounce: 0.78,

    friction: 0.99,

    rollingFriction: 0.985,


    /*
     * Muchísima velocidad.
     */
    maxSpeed: 1200,


    groundY: 590,

    maxAngularVelocity: 28,

    kickSpin: 0.055,

    bounceSpin: 0.85,


    /*
     * Las patadas son considerablemente más fuertes.
     */
    kickPowerMultiplier: 1.65,


    /*
     * También sale bastante hacia arriba.
     */
    kickVerticalPower: 500,

    spawnY: 150,


    /* =====================================================
       REBOTE ESPECIAL
       ===================================================== */

    onGroundBounce: function() {

        /*
         * La pelota de tenis conserva bastante
         * velocidad horizontal después de tocar el suelo.
         */
        this.vx *= 0.99;


        /*
         * Mantiene bastante giro.
         */
        this.angularVelocity *= 1.08;


        /*
         * Pequeña desviación natural.
         */
        this.vx +=
            (
                Math.random() - 0.5
            ) *
            5;
    },


    /* =====================================================
       REBOTE CONTRA PAREDES
       ===================================================== */

    onWallBounce: function() {

        /*
         * El tenis conserva más velocidad al golpear
         * las paredes que la pelota normal.
         */
        this.vx *= 1.08;
    },


    /* =====================================================
       DIBUJO
       ===================================================== */

    draw: function(ctx) {

        /*
         * Suelo visual de la sombra.
         */
        const shadowGroundY = 540;


        /*
         * Referencia para calcular la altura.
         */
        const groundReference =
            shadowGroundY -
            this.radius;


        const height =
            Math.max(
                0,
                groundReference -
                this.y
            );


        /*
         * La sombra se hace más pequeña
         * cuando la pelota está arriba.
         */
        const shadowScale =
            Math.max(
                0.30,
                1 -
                height / 700
            );


        /* =================================================
           SOMBRA
           ================================================= */

        ctx.save();


        ctx.globalAlpha =
            Math.max(
                0.10,
                0.27 -
                height / 1800
            );


        ctx.fillStyle =
            "#000000";


        ctx.beginPath();


        ctx.ellipse(

            this.x,

            shadowGroundY,

            this.radius *
            0.95 *
            shadowScale,

            this.radius *
            0.30 *
            shadowScale,

            0,

            0,

            Math.PI * 2

        );


        ctx.fill();


        ctx.restore();



        /* =================================================
           PELOTA
           ================================================= */

        ctx.save();


        ctx.translate(
            this.x,
            this.y
        );


        ctx.rotate(
            this.rotation
        );


        /* =================================================
           CUERPO
           ================================================= */

        ctx.beginPath();


        ctx.arc(
            0,
            0,
            this.radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#d9ed45";


        ctx.fill();


        /*
         * Borde.
         */
        ctx.lineWidth =
            1.8;


        ctx.strokeStyle =
            "#263014";


        ctx.stroke();



        /* =================================================
           LÍNEAS CURVAS CARACTERÍSTICAS
           ================================================= */

        ctx.strokeStyle =
            "rgba(255,255,255,0.88)";


        ctx.lineWidth =
            1.7;


        /*
         * Primera curva.
         */
        ctx.beginPath();


        ctx.arc(

            -this.radius * 0.15,

            0,

            this.radius * 0.68,

            -Math.PI * 0.65,

            Math.PI * 0.65

        );


        ctx.stroke();



        /*
         * Segunda curva.
         */
        ctx.beginPath();


        ctx.arc(

            this.radius * 0.15,

            0,

            this.radius * 0.68,

            Math.PI * 0.35,

            Math.PI * 1.65

        );


        ctx.stroke();



        /* =================================================
           BRILLO
           ================================================= */

        ctx.beginPath();


        ctx.arc(

            -this.radius * 0.30,

            -this.radius * 0.32,

            this.radius * 0.15,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            "rgba(255,255,255,0.50)";


        ctx.fill();


        ctx.restore();
    }

});