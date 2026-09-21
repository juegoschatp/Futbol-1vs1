/* ========================================================= */
/* RUGBYBALL.JS                                              */
/* Configuración y apariencia de la pelota de rugby          */
/* ========================================================= */

Ball.registerType("rugby", {

    /* =====================================================
       FÍSICA
       ===================================================== */

    /*
     * Más pequeña que el básquet y más grande que el tenis.
     */
    radius: 17,


    /*
     * Gravedad similar al fútbol.
     */
    gravity: 1120,


    /*
     * Rebote medio.
     */
    bounce: 0.64,

    friction: 0.98,

    rollingFriction: 0.97,


    /*
     * Buena velocidad, pero no tan exagerada como el tenis.
     */
    maxSpeed: 820,


    groundY: 590,

    maxAngularVelocity: 30,

    kickSpin: 0.065,


    /*
     * El giro influye bastante en los rebotes.
     */
    bounceSpin: 0.92,

    kickPowerMultiplier: 1.05,

    kickVerticalPower: 440,

    spawnY: 150,


    /* =====================================================
       REBOTE ESPECIAL
       ===================================================== */

    onGroundBounce: function() {

        /*
         * El rugby puede cambiar fuertemente de dirección
         * cuando toca el suelo.
         *
         * La variación se produce únicamente en el momento
         * del impacto, no constantemente.
         */

        const horizontalSpeed =
            Math.abs(this.vx);


        /*
         * Cuanto más rápido llegue, mayor puede ser
         * la desviación.
         */

        const variation =
            Math.min(
                horizontalSpeed * 0.28,
                180
            );


        /*
         * Dirección aleatoria controlada.
         */

        const randomDirection =
            Math.random() < 0.5
                ? -1
                : 1;


        this.vx +=
            randomDirection *
            (
                Math.random() *
                variation
            );


        /*
         * El giro también puede provocar
         * una desviación adicional.
         */

        this.vx +=
            this.angularVelocity *
            4.5;


        /*
         * Pequeña inclinación vertical adicional.
         *
         * Esto hace que algunos rebotes salgan
         * ligeramente hacia un lado.
         */

        this.vy +=
            (
                Math.random() - 0.5
            ) *
            70;


        /*
         * Mantener el rebote dentro de un rango razonable.
         */

        const maxHorizontal =
            this.maxSpeed * 0.85;


        this.vx =
            Math.max(
                -maxHorizontal,

                Math.min(
                    maxHorizontal,
                    this.vx
                )
            );
    },


    /* =====================================================
       PARED
       ===================================================== */

    onWallBounce: function(side) {

        /*
         * Las paredes también pueden generar
         * un pequeño cambio de trayectoria.
         */

        const variation =
            35 +
            Math.random() *
            70;


        if (
            side === "left"
        ) {

            this.vy +=
                variation;

        } else {

            this.vy -=
                variation;
        }


        /*
         * Cambio fuerte de giro.
         */

        this.angularVelocity *=
            -0.9;
    },


    /* =====================================================
       TECHO
       ===================================================== */

    onCeilingBounce: function() {

        /*
         * Al golpear arriba también puede salir
         * con una pequeña desviación.
         */

        this.vx +=
            (
                Math.random() - 0.5
            ) *
            60;
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
         * cuanto más arriba está la pelota.
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
                0.11,
                0.28 -
                height / 1800
            );


        ctx.fillStyle =
            "#000000";


        ctx.beginPath();


        ctx.ellipse(

            this.x,

            shadowGroundY,

            this.radius *
            1.05 *
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
           CUERPO OVALADO
           ================================================= */

        ctx.beginPath();


        ctx.ellipse(

            0,
            0,

            this.radius *
            1.38,

            this.radius *
            0.78,

            0,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            "#8b542f";


        ctx.fill();


        /*
         * Borde exterior.
         */

        ctx.lineWidth =
            2.4;


        ctx.strokeStyle =
            "#3a2114";


        ctx.stroke();



        /* =================================================
           PANEL CENTRAL
           ================================================= */

        ctx.beginPath();


        ctx.moveTo(
            -this.radius * 0.72,
            -this.radius * 0.12
        );


        ctx.lineTo(
            this.radius * 0.72,
            -this.radius * 0.12
        );


        ctx.lineTo(
            this.radius * 0.55,
            this.radius * 0.12
        );


        ctx.lineTo(
            -this.radius * 0.55,
            this.radius * 0.12
        );


        ctx.closePath();


        ctx.fillStyle =
            "#f0e6d2";


        ctx.fill();


        ctx.strokeStyle =
            "#4b3020";


        ctx.lineWidth =
            1;


        ctx.stroke();



        /* =================================================
           CORDONES
           ================================================= */

        ctx.strokeStyle =
            "#4b3020";


        ctx.lineWidth =
            1.4;


        for (
            let i = -2;
            i <= 2;
            i++
        ) {

            const x =
                i *
                this.radius *
                0.18;


            ctx.beginPath();


            ctx.moveTo(
                x,
                -this.radius * 0.16
            );


            ctx.lineTo(
                x,
                this.radius * 0.16
            );


            ctx.stroke();
        }



        /* =================================================
           COSTURAS
           ================================================= */

        ctx.strokeStyle =
            "rgba(245,225,195,0.75)";


        ctx.lineWidth =
            1.2;


        ctx.beginPath();


        ctx.ellipse(

            0,
            0,

            this.radius *
            1.10,

            this.radius *
            0.60,

            0,

            Math.PI * 0.10,

            Math.PI * 0.90

        );


        ctx.stroke();


        ctx.beginPath();


        ctx.ellipse(

            0,
            0,

            this.radius *
            1.10,

            this.radius *
            0.60,

            0,

            Math.PI * 1.10,

            Math.PI * 1.90

        );


        ctx.stroke();



        /* =================================================
           BRILLO
           ================================================= */

        ctx.beginPath();


        ctx.ellipse(

            -this.radius * 0.55,

            -this.radius * 0.28,

            this.radius * 0.25,

            this.radius * 0.12,

            -0.25,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            "rgba(255,255,255,0.25)";


        ctx.fill();


        ctx.restore();
    }

});