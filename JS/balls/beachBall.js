/* ========================================================= */
/* BEACHBALL.JS                                              */
/* Pelota de playa / voley - trayectoria arcade              */
/* ========================================================= */

Ball.registerType("beach", {

    /* =====================================================
       FÍSICA
       ===================================================== */

    /*
     * Grande y liviana visualmente.
     */
    radius: 23,


    /*
     * Gravedad moderadamente baja.
     *
     * No queremos gravedad demasiado pequeña porque
     * eso hace que el movimiento parezca flotante.
     */
    gravity: 650,


    /*
     * Rebote moderado.
     */
    bounce: 0.38,

    friction: 0.97,

    rollingFriction: 0.94,


    /*
     * Velocidad máxima suficiente para recorrer
     * bastante cancha sin convertirse en una pelota rápida.
     */
    maxSpeed: 800,


    groundY: 590,


    /*
     * Giro tranquilo.
     */
    maxAngularVelocity: 12,

    kickSpin: 0.025,

    bounceSpin: 0.38,


    /* =====================================================
       PATADA
       ===================================================== */

    /*
     * Horizontalmente es más lenta que el fútbol.
     */
    kickPowerMultiplier: 0.78,


    /*
     * Impulso vertical alto.
     *
     * Produce una trayectoria bombeada.
     */
    kickVerticalPower: 720,


    spawnY: 150,


    /* =====================================================
       REBOTE
       ===================================================== */

    onGroundBounce: function() {

        /*
         * Conserva parte de su desplazamiento horizontal.
         */
        this.vx *= 0.92;


        /*
         * Pequeña desviación arcade.
         */
        this.vx +=
            (
                Math.random() - 0.5
            ) *
            10;


        /*
         * Pierde bastante giro al tocar el suelo.
         */
        this.angularVelocity *=
            0.70;
    },


    /* =====================================================
       PAREDES
       ===================================================== */

    onWallBounce: function() {

        /*
         * Pierde algo de velocidad,
         * pero continúa jugando.
         */
        this.vx *= 0.88;


        /*
         * Pequeña alteración vertical.
         */
        this.vy +=
            (
                Math.random() - 0.5
            ) *
            40;
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
                0.25,
                1 -
                height / 800
            );


        /* =================================================
           SOMBRA
           ================================================= */

        ctx.save();


        ctx.globalAlpha =
            Math.max(
                0.08,
                0.27 -
                height / 1700
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
            "#f5f5f5";


        ctx.fill();


        ctx.lineWidth =
            2.2;


        ctx.strokeStyle =
            "#24282d";


        ctx.stroke();



        /* =================================================
           SECCIÓN AZUL
           ================================================= */

        ctx.beginPath();


        ctx.moveTo(
            -this.radius,
            0
        );


        ctx.bezierCurveTo(

            -this.radius * 0.35,
            -this.radius * 0.82,

            this.radius * 0.35,
            -this.radius * 0.82,

            this.radius,
            0

        );


        ctx.bezierCurveTo(

            this.radius * 0.35,
            this.radius * 0.82,

            -this.radius * 0.35,
            this.radius * 0.82,

            -this.radius,
            0

        );


        ctx.closePath();


        ctx.fillStyle =
            "#42a5e8";


        ctx.fill();



        /* =================================================
           SECCIÓN AMARILLA
           ================================================= */

        ctx.beginPath();


        ctx.moveTo(
            -this.radius,
            0
        );


        ctx.bezierCurveTo(

            -this.radius * 0.78,
            -this.radius * 0.35,

            -this.radius * 0.78,
            this.radius * 0.35,

            -this.radius,
            0

        );


        ctx.bezierCurveTo(

            -this.radius * 0.40,
            this.radius * 0.15,

            -this.radius * 0.40,
            -this.radius * 0.15,

            -this.radius,
            0

        );


        ctx.closePath();


        ctx.fillStyle =
            "#f4d83f";


        ctx.fill();



        /* =================================================
           SECCIÓN ROJA
           ================================================= */

        ctx.beginPath();


        ctx.moveTo(
            this.radius,
            0
        );


        ctx.bezierCurveTo(

            this.radius * 0.78,
            -this.radius * 0.35,

            this.radius * 0.78,
            this.radius * 0.35,

            this.radius,
            0

        );


        ctx.bezierCurveTo(

            this.radius * 0.40,
            this.radius * 0.15,

            this.radius * 0.40,
            -this.radius * 0.15,

            this.radius,
            0

        );


        ctx.closePath();


        ctx.fillStyle =
            "#ef5350";


        ctx.fill();



        /* =================================================
           LÍNEAS DE SEPARACIÓN
           ================================================= */

        ctx.strokeStyle =
            "rgba(30,34,38,0.75)";


        ctx.lineWidth =
            1.2;


        ctx.beginPath();


        ctx.moveTo(
            0,
            -this.radius
        );


        ctx.bezierCurveTo(

            -this.radius * 0.42,
            -this.radius * 0.38,

            -this.radius * 0.42,
            this.radius * 0.38,

            0,
            this.radius

        );


        ctx.stroke();



        ctx.beginPath();


        ctx.moveTo(
            0,
            -this.radius
        );


        ctx.bezierCurveTo(

            this.radius * 0.42,
            -this.radius * 0.38,

            this.radius * 0.42,
            this.radius * 0.38,

            0,
            this.radius

        );


        ctx.stroke();



        /* =================================================
           BRILLO
           ================================================= */

        ctx.beginPath();


        ctx.arc(

            -this.radius * 0.32,

            -this.radius * 0.35,

            this.radius * 0.18,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            "rgba(255,255,255,0.55)";


        ctx.fill();


        ctx.restore();
    }

});