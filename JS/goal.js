/* ========================================================= */
/* GOAL.JS                                                    */
/* Detección de goles según la cancha real                   */
/* ========================================================= */

class Goal {

    constructor(options = {}) {

        /*
         * =====================================================
         * LADO DEL ARCO
         * =====================================================
         *
         * "left"  = arco izquierdo
         * "right" = arco derecho
         */

        this.side =
            options.side || "left";


        /*
         * =====================================================
         * ZONA VERTICAL DEL ARCO
         * =====================================================
         *
         * Según las mediciones realizadas:
         *
         * Suelo de la cancha ≈ Y 552
         *
         * El inicio del arco se estima aproximadamente
         * en Y 430.
         */

        this.top =
            options.top ?? 350;

        this.bottom =
            options.bottom ?? 565;


        /*
         * =====================================================
         * PAREDES REALES
         * =====================================================
         *
         * Medimos:
         *
         * Arco izquierdo ≈ X 42
         * Arco derecho  ≈ X 1494
         *
         * Queremos detectar el gol unos 5 píxeles antes.
         */

        this.leftWall =
            options.leftWall ?? 42;

        this.rightWall =
            options.rightWall ?? 1494;


        /*
         * =====================================================
         * DISTANCIA DE DETECCIÓN
         * =====================================================
         *
         * 5 = detectar el gol 5 píxeles antes de la pared.
         */

        this.edgeDistance =
            options.edgeDistance ?? 5;


        /*
         * =====================================================
         * EQUIPO QUE DEFIENDE
         * =====================================================
         */

        this.teamThatDefends =
            options.teamThatDefends ?? 2;
    }


    /*
     * =========================================================
     * DETECTAR GOL
     * =========================================================
     */

    containsBall(ball) {

        /*
         * Primero comprobamos la altura.
         *
         * Esto es MUY importante:
         *
         * Si la pelota pasa por encima del travesaño,
         * aunque llegue a la pared, NO es gol.
         */

        if (
            ball.y < this.top ||
            ball.y > this.bottom
        ) {

            return false;
        }


        /*
         * =====================================================
         * ARCO IZQUIERDO
         * =====================================================
         *
         * Pared real:
         *
         * X = 42
         *
         * Detección:
         *
         * 42 + 5 = 47
         */

        if (
            this.side === "left"
        ) {

            const goalX =
                this.leftWall +
                this.edgeDistance;


            return (
                ball.x <= goalX
            );
        }


        /*
         * =====================================================
         * ARCO DERECHO
         * =====================================================
         *
         * Pared real:
         *
         * X = 1494
         *
         * Detección:
         *
         * 1494 - 5 = 1489
         */

        if (
            this.side === "right"
        ) {

            const goalX =
                this.rightWall -
                this.edgeDistance;


            return (
                ball.x >= goalX
            );
        }


        /*
         * Lado desconocido.
         */

        return false;
    }


    /*
     * =========================================================
     * DEBUG
     * =========================================================
     *
     * Si alguna vez necesitamos comprobar visualmente
     * la zona de gol, esta función dibuja las dos líneas
     * de detección.
     *
     * No se utiliza durante el juego normal.
     */

    drawDebug(ctx) {

        ctx.save();


        /*
         * Color de la zona de detección.
         */

        ctx.strokeStyle =
            "rgba(255, 0, 0, 0.85)";

        ctx.fillStyle =
            "rgba(255, 0, 0, 0.12)";

        ctx.lineWidth = 2;


        /*
         * =====================================================
         * ARCO IZQUIERDO
         * =====================================================
         */

        if (
            this.side === "left"
        ) {

            const goalX =
                this.leftWall +
                this.edgeDistance;


            const width =
                this.edgeDistance;


            ctx.fillRect(
                this.leftWall,
                this.top,
                width,
                this.bottom - this.top
            );


            ctx.strokeRect(
                this.leftWall,
                this.top,
                width,
                this.bottom - this.top
            );
        }


        /*
         * =====================================================
         * ARCO DERECHO
         * =====================================================
         */

        if (
            this.side === "right"
        ) {

            const goalX =
                this.rightWall -
                this.edgeDistance;


            const width =
                this.edgeDistance;


            ctx.fillRect(
                goalX,
                this.top,
                width,
                this.bottom - this.top
            );


            ctx.strokeRect(
                goalX,
                this.top,
                width,
                this.bottom - this.top
            );
        }


        ctx.restore();
    }

}


/* ========================================================= */
/* EXPORTAR                                                   */
/* ========================================================= */

window.Goal = Goal;