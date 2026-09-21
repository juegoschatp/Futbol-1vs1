/* ========================================================= */
/* STADIUM CROWD.JS                                          */
/* Público animado del estadio                              */
/* ========================================================= */

"use strict";


class StadiumCrowd {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.worldWidth = 1536;
        this.worldHeight = 714;

        this.time = 0;
        this.enabled = true;

        this.goalReaction = 0;
        this.goalTimer = 0;


        /*
         * Colores del público.
         */
        this.colors = [
            "#d8d8d8",
            "#bfc4cc",
            "#8fa8c4",
            "#6f8fb3",
            "#c7a85b",
            "#d4c27a",
            "#b94b45",
            "#a85d58",
            "#4779a8",
            "#596f8a",
            "#ded6c4"
        ];


        /*
         * =================================================
         * TRIBUNAS
         * =================================================
         *
         * Las zonas izquierda y derecha están recortadas
         * para dejar completamente libres los arcos.
         *
         * IMPORTANTE:
         * No modificamos la cancha ni sus posiciones.
         * Solo evitamos crear espectadores donde no deben.
         */

        this.sectors = [

            /*
             * TRIBUNA IZQUIERDA
             *
             * Antes:
             * 38 - 412
             *
             * Ahora comienza más hacia el centro para
             * dejar libre la zona del arco izquierdo.
             */
            {
                xMin: 125,
                xMax: 412,

                rows: [
                    { y: 294, count: 6 },
                    { y: 314, count: 7 },
                    { y: 334, count: 8 },
                    { y: 354, count: 8 },
                    { y: 374, count: 7 }
                ]
            },


            /*
             * TRIBUNA CENTRAL
             */
            {
                xMin: 505,
                xMax: 975,

                rows: [
                    { y: 294, count: 10 },
                    { y: 314, count: 11 },
                    { y: 334, count: 12 },
                    { y: 354, count: 12 },
                    { y: 374, count: 11 }
                ]
            },


            /*
             * TRIBUNA DERECHA
             *
             * Antes:
             * 1120 - 1498
             *
             * Ahora termina antes de llegar al arco
             * derecho.
             */
            {
                xMin: 1120,
                xMax: 1411,

                rows: [
                    { y: 294, count: 6 },
                    { y: 314, count: 7 },
                    { y: 334, count: 8 },
                    { y: 354, count: 8 },
                    { y: 374, count: 7 }
                ]
            }
        ];


        /*
         * Público.
         */
        this.people = [];


        /*
         * Crear público.
         */
        this.createCrowd();
    }


    /* ===================================================== */
    /* CREAR PÚBLICO                                         */
    /* ===================================================== */

    createCrowd() {

        for (
            let sectorIndex = 0;
            sectorIndex < this.sectors.length;
            sectorIndex++
        ) {

            const sector =
                this.sectors[sectorIndex];


            for (
                let rowIndex = 0;
                rowIndex < sector.rows.length;
                rowIndex++
            ) {

                const row =
                    sector.rows[rowIndex];


                const spacing =
                    (
                        sector.xMax -
                        sector.xMin
                    ) /
                    row.count;


                for (
                    let i = 0;
                    i < row.count;
                    i++
                ) {

                    const person =
                        this.createPerson(
                            sector,
                            row,
                            rowIndex,
                            i,
                            spacing
                        );


                    this.people.push(
                        person
                    );
                }
            }
        }
    }


    /* ===================================================== */
    /* CREAR PERSONA                                         */
    /* ===================================================== */

    createPerson(
        sector,
        row,
        rowIndex,
        index,
        spacing
    ) {

        const baseX =
            sector.xMin +
            spacing * index +
            spacing * 0.5;


        /*
         * Variación horizontal pequeña.
         */
        const randomX =
            (Math.random() - 0.5) *
            spacing *
            0.45;


        /*
         * Variación vertical.
         */
        const randomY =
            (Math.random() - 0.5) *
            3;


        /*
         * Profundidad.
         */
        const depth =
            rowIndex / 4;


        /*
         * Tamaño grande.
         */
        const scale =
            1.35 +
            depth * 0.35 +
            Math.random() * 0.18;


        /*
         * Movimiento.
         */
        const movementSpeed =
            0.65 +
            Math.random() * 0.70;


        const phase =
            Math.random() *
            Math.PI *
            2;


        /*
         * Comportamiento.
         */
        const behaviorRandom =
            Math.random();


        let behavior;


        if (
            behaviorRandom < 0.52
        ) {

            behavior = "quiet";

        } else if (
            behaviorRandom < 0.90
        ) {

            behavior = "sway";

        } else {

            behavior = "active";
        }


        /*
         * Próximo salto espontáneo.
         */
        const nextJump =
            3 +
            Math.random() * 8;


        /*
         * Color.
         */
        const color =
            this.colors[
                Math.floor(
                    Math.random() *
                    this.colors.length
                )
            ];


        return {

            x:
                baseX + randomX,

            baseY:
                row.y + randomY,

            y:
                row.y + randomY,

            scale,

            color,

            behavior,

            phase,

            movementSpeed,

            nextJump,

            jumpTimer: 0,

            jumpHeight: 0,

            /*
             * Reacción al gol.
             */
            goalDelay: 0,
            goalJump: 0,
            goalJumpHeight: 0,

            /*
             * Variaciones visuales.
             */
            widthVariation:
                0.90 +
                Math.random() * 0.16,

            heightVariation:
                0.92 +
                Math.random() * 0.14
        };
    }


    /* ===================================================== */
    /* UPDATE                                                */
    /* ===================================================== */

    update(deltaTime) {

        if (!this.enabled) {
            return;
        }


        const dt =
            Math.min(
                Math.max(
                    deltaTime || 0,
                    0
                ),
                0.033
            );


        this.time += dt;


        /*
         * Reacción al gol.
         */
        if (this.goalReaction > 0) {

            this.goalTimer -= dt;


            if (this.goalTimer <= 0) {

                this.goalReaction = 0;
                this.goalTimer = 0;
            }
        }


        /*
         * Actualizar personas.
         */
        for (
            let i = 0;
            i < this.people.length;
            i++
        ) {

            const person =
                this.people[i];


            this.updateNaturalMovement(
                person,
                dt
            );


            this.updateGoalReaction(
                person,
                dt
            );
        }
    }


    /* ===================================================== */
    /* MOVIMIENTO NORMAL                                     */
    /* ===================================================== */

    updateNaturalMovement(
        person,
        dt
    ) {

        let sway = 0;


        /*
         * Balanceo tranquilo.
         */
        if (
            person.behavior === "sway"
        ) {

            sway =
                Math.sin(
                    this.time *
                    person.movementSpeed +
                    person.phase
                ) *
                0.65;
        }


        /*
         * Público activo.
         */
        if (
            person.behavior === "active"
        ) {

            sway =
                Math.sin(
                    this.time *
                    person.movementSpeed *
                    1.1 +
                    person.phase
                ) *
                0.9;
        }


        /*
         * Respiración.
         */
        let breathing = 0;


        if (
            person.behavior !== "quiet"
        ) {

            breathing =
                Math.sin(
                    this.time * 1.1 +
                    person.phase
                ) *
                0.40;
        }


        /*
         * Saltos espontáneos.
         */
        person.nextJump -= dt;


        if (
            person.nextJump <= 0 &&
            person.behavior !== "quiet" &&
            this.goalReaction <= 0
        ) {

            person.jumpTimer =
                0.30 +
                Math.random() * 0.16;


            person.nextJump =
                4 +
                Math.random() * 9;
        }


        if (
            person.jumpTimer > 0
        ) {

            person.jumpTimer -= dt;


            const progress =
                1 -
                (
                    person.jumpTimer /
                    0.40
                );


            person.jumpHeight =
                Math.sin(
                    Math.min(
                        progress,
                        1
                    ) *
                    Math.PI
                ) *
                2.6;

        } else {

            person.jumpHeight *=
                Math.max(
                    0,
                    1 -
                    dt * 12
                );
        }


        /*
         * Movimiento horizontal pequeño.
         */
        person.x +=
            sway *
            dt *
            0.35;


        /*
         * Evitar que el movimiento termine
         * llevando personas hacia los arcos.
         */
        this.clampPersonX(
            person
        );


        person.y =
            person.baseY +
            breathing -
            person.jumpHeight -
            person.goalJumpHeight;
    }


    /* ===================================================== */
    /* LIMITAR POSICIÓN                                      */
    /* ===================================================== */

    clampPersonX(person) {

        /*
         * Límites generales de seguridad.
         *
         * Evitan que el pequeño movimiento de los
         * espectadores pueda acercarlos demasiado
         * a los arcos.
         */

        if (
            person.x < 125 &&
            person.x > 0
        ) {

            person.x = 125;
        }


        if (
            person.x > 1411 &&
            person.x < this.worldWidth
        ) {

            person.x = 1411;
        }
    }


    /* ===================================================== */
    /* REACCIÓN AL GOL                                       */
    /* ===================================================== */

    updateGoalReaction(
        person,
        dt
    ) {

        if (
            this.goalReaction <= 0
        ) {

            person.goalJumpHeight *=
                Math.max(
                    0,
                    1 -
                    dt * 5
                );

            return;
        }


        /*
         * Espera individual.
         */
        if (
            person.goalDelay > 0
        ) {

            person.goalDelay -= dt;

            return;
        }


        /*
         * Iniciar salto.
         */
        if (
            person.goalJump <= 0 &&
            person.goalJumpHeight < 0.1
        ) {

            person.goalJump =
                0.42 +
                Math.random() * 0.16;
        }


        if (
            person.goalJump > 0
        ) {

            person.goalJump -= dt;


            const duration =
                0.58;


            const progress =
                1 -
                (
                    person.goalJump /
                    duration
                );


            const clampedProgress =
                Math.max(
                    0,
                    Math.min(
                        1,
                        progress
                    )
                );


            person.goalJumpHeight =
                Math.sin(
                    clampedProgress *
                    Math.PI
                ) *
                (
                    5 +
                    Math.random() * 2.5
                );

        } else {

            person.goalJumpHeight *=
                Math.max(
                    0,
                    1 -
                    dt * 6
                );
        }
    }


    /* ===================================================== */
    /* GOL                                                   */
    /* ===================================================== */

    onGoal() {

        this.goalReaction = 1;

        this.goalTimer = 1.55;


        /*
         * Reacción distribuida.
         */
        for (
            let i = 0;
            i < this.people.length;
            i++
        ) {

            const person =
                this.people[i];


            const reaction =
                Math.random();


            /*
             * Mayoría reacciona.
             */
            if (
                reaction < 0.75
            ) {

                person.goalDelay =
                    Math.random() *
                    0.40;

            } else if (
                reaction < 0.90
            ) {

                person.goalDelay =
                    0.45 +
                    Math.random() *
                    0.35;

            } else {

                person.goalDelay =
                    1.2;
            }


            person.goalJump = 0;
            person.goalJumpHeight = 0;
        }
    }


    /* ===================================================== */
    /* DRAW                                                  */
    /* ===================================================== */

    draw() {

        if (
            !this.enabled ||
            !this.ctx
        ) {

            return;
        }


        const ctx =
            this.ctx;


        ctx.save();


        /*
         * Dibujar las cinco filas.
         */
        for (
            let rowIndex = 0;
            rowIndex < 5;
            rowIndex++
        ) {

            this.drawRow(
                ctx,
                rowIndex
            );
        }


        ctx.restore();
    }


    /* ===================================================== */
    /* DIBUJAR FILA                                          */
    /* ===================================================== */

    drawRow(
        ctx,
        rowIndex
    ) {

        for (
            let i = 0;
            i < this.people.length;
            i++
        ) {

            const person =
                this.people[i];


            const row =
                this.getRowIndex(
                    person.baseY
                );


            if (
                row !== rowIndex
            ) {

                continue;
            }


            this.drawPerson(
                ctx,
                person
            );
        }
    }


    /* ===================================================== */
    /* OBTENER FILA                                          */
    /* ===================================================== */

    getRowIndex(y) {

        const rows = [
            294,
            314,
            334,
            354,
            374
        ];


        let closest = 0;

        let distance =
            Infinity;


        for (
            let i = 0;
            i < rows.length;
            i++
        ) {

            const currentDistance =
                Math.abs(
                    y -
                    rows[i]
                );


            if (
                currentDistance <
                distance
            ) {

                distance =
                    currentDistance;

                closest =
                    i;
            }
        }


        return closest;
    }


    /* ===================================================== */
    /* DIBUJAR PERSONA                                       */
    /* ===================================================== */

    drawPerson(
        ctx,
        person
    ) {

        const x =
            person.x;


        const y =
            person.y;


        const scale =
            person.scale;


        const width =
            person.widthVariation;


        const height =
            person.heightVariation;


        /*
         * Cabeza.
         */
        const headRadius =
            2.8 *
            scale *
            width;


        /*
         * Cuerpo.
         */
        const bodyWidth =
            5.2 *
            scale *
            width;


        const bodyHeight =
            6.2 *
            scale *
            height;


        /*
         * CABEZA
         */
        ctx.globalAlpha =
            0.76;


        ctx.beginPath();


        ctx.arc(
            x,
            y -
                bodyHeight -
                headRadius * 0.30,
            headRadius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            person.color;


        ctx.fill();


        /*
         * CUERPO
         */
        ctx.beginPath();


        ctx.roundRect(
            x -
                bodyWidth / 2,
            y -
                bodyHeight,
            bodyWidth,
            bodyHeight,
            bodyWidth * 0.45
        );


        ctx.fillStyle =
            person.color;


        ctx.fill();


        /*
         * BRAZOS
         */
        ctx.globalAlpha =
            0.58;


        ctx.lineWidth =
            Math.max(
                0.9,
                scale * 0.75
            );


        ctx.strokeStyle =
            person.color;


        ctx.beginPath();


        ctx.moveTo(
            x -
                bodyWidth * 0.30,
            y -
                bodyHeight * 0.72
        );


        ctx.lineTo(
            x -
                bodyWidth * 0.78,
            y -
                bodyHeight * 0.28
        );


        ctx.moveTo(
            x +
                bodyWidth * 0.30,
            y -
                bodyHeight * 0.72
        );


        ctx.lineTo(
            x +
                bodyWidth * 0.78,
            y -
                bodyHeight * 0.28
        );


        ctx.stroke();


        ctx.globalAlpha = 1;
    }


    /* ===================================================== */
    /* ACTIVAR / DESACTIVAR                                  */
    /* ===================================================== */

    setEnabled(value) {

        this.enabled =
            Boolean(value);
    }


    /* ===================================================== */
    /* DESTRUIR                                             */
    /* ===================================================== */

    destroy() {

        this.people.length = 0;

        this.canvas = null;
        this.ctx = null;
    }
}


/* ========================================================= */
/* EXPORT                                                    */
/* ========================================================= */

window.StadiumCrowd = StadiumCrowd;