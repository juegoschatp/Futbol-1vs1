/* ========================================================= */
/* BASKETBALL.JS                                             */
/* Pelota de básquet - física arcade                         */
/* ========================================================= */

Ball.registerType("basketball", {

    /* =====================================================
       FÍSICA
       ===================================================== */

    radius: 19,

    /*
     * Gravedad moderada para permitir rebotes altos.
     */
    gravity: 1000,

    /*
     * REBOTE MUY ALTO.
     *
     * Este es el valor principal que hace que
     * la pelota pueda seguir saltando muchas veces.
     */
    bounce: 0.96,

    friction: 0.99,

    rollingFriction: 0.985,

    /*
     * Más velocidad que antes.
     */
    maxSpeed: 820,

    groundY: 590,

    maxAngularVelocity: 22,

    kickSpin: 0.05,

    bounceSpin: 0.88,

    kickPowerMultiplier: 1,

    kickVerticalPower: 470,

    spawnY: 150,


    /* =====================================================
       REBOTE ESPECIAL
       ===================================================== */

    onGroundBounce: function() {

        /*
         * El básquet prácticamente conserva toda
         * su velocidad horizontal.
         */
        this.vx *= 0.99;


        /*
         * Conserva muchísimo giro.
         */
        this.angularVelocity *= 1.05;


        /*
         * Pequeña variación arcade.
         */
        this.vx +=
            (
                Math.random() - 0.5
            ) *
            10;
    },


    /* =====================================================
       PAREDES
       ===================================================== */

    onWallBounce: function() {

        /*
         * El básquet no pierde demasiada energía
         * al tocar las paredes.
         */
        this.vx *= 1.04;
    },


    /* =====================================================
       DIBUJO
       ===================================================== */

    draw: function(ctx) {

        /*
         * Suelo visual de la sombra.
         *
         * Esto solamente afecta al dibujo.
         * No modifica la física.
         */
        const shadowGroundY = 540;


        /*
         * Referencia para calcular la altura
         * de la pelota respecto al suelo.
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
         * La sombra se hace más pequeña cuanto
         * más arriba está la pelota.
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
                0.30 -
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
           CUERPO
           ================================================= */

        ctx.save();


        ctx.translate(
            this.x,
            this.y
        );


        ctx.rotate(
            this.rotation
        );


        ctx.beginPath();


        ctx.arc(
            0,
            0,
            this.radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#d87924";


        ctx.fill();


        ctx.lineWidth =
            2.4;


        ctx.strokeStyle =
            "#54250d";


        ctx.stroke();



        /* =================================================
           LÍNEAS CARACTERÍSTICAS
           ================================================= */

        ctx.strokeStyle =
            "#21140d";


        ctx.lineWidth =
            2;


        /*
         * Curva izquierda.
         */
        ctx.beginPath();


        ctx.arc(

            0,
            0,

            this.radius * 0.78,

            -Math.PI * 0.5,

            Math.PI * 0.5

        );


        ctx.stroke();



        /*
         * Curva derecha.
         */
        ctx.beginPath();


        ctx.arc(

            0,
            0,

            this.radius * 0.78,

            Math.PI * 0.5,

            Math.PI * 1.5

        );


        ctx.stroke();



        /*
         * Línea central.
         */
        ctx.beginPath();


        ctx.moveTo(
            -this.radius * 0.92,
            0
        );


        ctx.lineTo(
            this.radius * 0.92,
            0
        );


        ctx.stroke();



        /*
         * Curva superior.
         */
        ctx.beginPath();


        ctx.arc(

            0,
            0,

            this.radius * 0.96,

            Math.PI * 0.15,

            Math.PI * 0.85

        );


        ctx.stroke();



        /* =================================================
           BRILLO
           ================================================= */

        ctx.beginPath();


        ctx.arc(

            -this.radius * 0.32,

            -this.radius * 0.32,

            this.radius * 0.16,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            "rgba(255,255,255,0.20)";


        ctx.fill();


        ctx.restore();
    }

});