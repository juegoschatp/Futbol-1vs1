/* ========================================================= */
/* FOOTBALL.JS                                               */
/* Configuración y apariencia de la pelota de fútbol         */
/* ========================================================= */

Ball.registerType("football", {

    /* =====================================================
       FÍSICA
       ===================================================== */

    radius: 18,

    gravity: 1100,

    bounce: 0.58,

    friction: 0.985,

    rollingFriction: 0.975,

    maxSpeed: 700,

    groundY: 590,

    maxAngularVelocity: 18,

    kickSpin: 0.045,

    bounceSpin: 0.72,

    kickPowerMultiplier: 1,

    /*
     * Mayor elevación al golpear la pelota.
     *
     * Antes: 430
     * Ahora: 560
     *
     * Esto genera una trayectoria más aérea,
     * permitiendo que los jugadores puedan saltar
     * para interceptar pases y tiros.
     */
    kickVerticalPower: 560,

    spawnY: 150,


    /* =====================================================
       DIBUJO
       ===================================================== */

    draw: function(ctx) {

        /* =================================================
           CONFIGURACIÓN VISUAL DEL SUELO
           ================================================= */

        /*
         * Esta coordenada es SOLAMENTE para la sombra.
         *
         * No modifica la física de la pelota.
         * La pelota sigue utilizando su propio groundY.
         */
        const shadowGroundY = 540;


        /*
         * Calculamos qué tan lejos está la pelota
         * del suelo visual.
         *
         * Cuando la pelota está cerca del suelo,
         * height será pequeña.
         *
         * Cuando está arriba,
         * height será mayor.
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


        /* =================================================
           TAMAÑO DE LA SOMBRA
           ================================================= */

        /*
         * Cuanto más alta está la pelota,
         * más pequeña es la sombra.
         *
         * Nunca baja de 35% de su tamaño original.
         */
        const shadowScale =
            Math.max(
                0.35,
                1 -
                height / 700
            );


        /* =================================================
           SOMBRA
           ================================================= */

        ctx.save();


        /*
         * También reducimos ligeramente la intensidad
         * cuando la pelota está más arriba.
         */
        ctx.globalAlpha =
            Math.max(
                0.12,
                0.3 -
                height / 1800
            );


        ctx.fillStyle =
            "#000000";


        ctx.beginPath();


        /*
         * IMPORTANTE:
         *
         * X:
         * Sigue exactamente a la pelota.
         *
         * Y:
         * SIEMPRE queda en el suelo.
         *
         * Por eso la pelota puede subir y bajar
         * sin que la sombra la siga verticalmente.
         */
        ctx.ellipse(

            this.x,

            shadowGroundY,

            this.radius *
            0.95 *
            shadowScale,

            this.radius *
            0.3 *
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
            "#f4f5f7";


        ctx.fill();


        /*
         * Borde.
         */

        ctx.lineWidth =
            2.5;


        ctx.strokeStyle =
            "#171a1e";


        ctx.stroke();



        /* =================================================
           PANEL CENTRAL
           ================================================= */

        this.drawPanel(
            ctx,
            0,
            0,
            this.radius * 0.34,
            5
        );



        /* =================================================
           PANELES EXTERIORES
           ================================================= */

        const panelDistance =
            this.radius * 0.64;


        const panelSize =
            this.radius * 0.22;


        const panelAngles = [

            0,

            Math.PI * 0.4,

            Math.PI * 0.8,

            Math.PI * 1.2,

            Math.PI * 1.6

        ];


        for (
            let i = 0;
            i < panelAngles.length;
            i++
        ) {

            const angle =
                panelAngles[i];


            const px =
                Math.cos(angle) *
                panelDistance;


            const py =
                Math.sin(angle) *
                panelDistance;


            this.drawPanel(
                ctx,
                px,
                py,
                panelSize,
                5
            );
        }



        /* =================================================
           LÍNEAS DE LOS PANELES
           ================================================= */

        ctx.strokeStyle =
            "rgba(25, 29, 34, 0.8)";


        ctx.lineWidth =
            1.4;


        for (
            let i = 0;
            i < panelAngles.length;
            i++
        ) {

            const angle =
                panelAngles[i];


            ctx.beginPath();


            ctx.moveTo(

                Math.cos(angle) *
                this.radius *
                0.18,

                Math.sin(angle) *
                this.radius *
                0.18

            );


            ctx.lineTo(

                Math.cos(angle) *
                this.radius *
                0.92,

                Math.sin(angle) *
                this.radius *
                0.92

            );


            ctx.stroke();
        }



        /* =================================================
           BRILLO
           ================================================= */

        ctx.beginPath();


        ctx.arc(

            -this.radius * 0.3,

            -this.radius * 0.32,

            this.radius * 0.17,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            "rgba(255,255,255,0.55)";


        ctx.fill();


        ctx.restore();
    }

});