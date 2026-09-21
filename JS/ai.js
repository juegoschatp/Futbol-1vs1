"use strict";

/* ========================================================= */
/* AI.JS                                                     */
/* IA TÁCTICA AVANZADA                                      */
/* Percepción + predicción + ataque + defensa               */
/* ========================================================= */

class FootballAI {

    constructor(options = {}) {

        /* =====================================================
           REFERENCIAS
           ===================================================== */

        this.player = options.player || null;
        this.ball = options.ball || null;
        this.stadium = options.stadium || null;


        /* =====================================================
           ESTADO GENERAL
           ===================================================== */

        this.enabled = true;

        this.currentState = "DEFEND";

        this.currentAction = "POSITION";

        this.targetX = 1120;


        /* =====================================================
           LÍMITES DE CANCHA
           ===================================================== */

        this.minX = 800;

        this.maxX = 1480;

        /*
         * Este ya NO es un límite táctico.
         *
         * La IA puede cruzarlo si la jugada lo necesita.
         */


        /* =====================================================
           ZONAS TÁCTICAS
           ===================================================== */

        this.defensiveX = 1160;

        this.deepDefensiveX = 1320;

        this.attackX = 980;

        this.aggressiveX = 880;


        /* =====================================================
           PERCEPCIÓN
           ===================================================== */

        this.reactionDistance = 1100;

        this.closeBallDistance = 170;

        this.attackDistance = 500;

        this.interceptDistance = 650;


        /* =====================================================
           PREDICCIÓN
           ===================================================== */

        this.predictionTime = 0.35;

        this.longPredictionTime = 0.65;

        this.predictedBallX = 768;

        this.predictedBallY = 150;

        this.predictedGroundX = 768;

        this.predictedGroundTime = 0;


        /* =====================================================
           VELOCIDAD DE PELOTA
           ===================================================== */

        this.lastBallX = null;

        this.lastBallY = null;

        this.ballVelocityX = 0;

        this.ballVelocityY = 0;


        /* =====================================================
           ESTADO DE PELOTA
           ===================================================== */

        this.ballState = "UNKNOWN";

        this.ballIsRising = false;

        this.ballIsFalling = false;

        this.ballIsFast = false;

        this.ballIsDangerous = false;

        this.ballIsComingToGoal = false;


        /* =====================================================
           DECISIÓN
           ===================================================== */

        this.decisionTimer = 0;

        this.actionTimer = 0;

        this.reactionTimer = 0;

        this.nextDecisionDelay = 0.08;


        /* =====================================================
           MEMORIA
           ===================================================== */

        this.lastState = null;

        this.lastAction = null;

        this.lastTargetX = 1120;

        this.lastDecisionX = null;

        this.lastDecisionTime = 0;

        this.sameDecisionCount = 0;


        /* =====================================================
           VARIACIÓN DE COMPORTAMIENTO
           ===================================================== */

        this.strategy = "balanced";

        this.strategyTimer = 0;

        this.randomOffset = 0;

        this.targetNoise = 0;


        /* =====================================================
           ERROR HUMANO
           ===================================================== */

        this.errorAmount = 16;

        this.errorTimer = 0;

        this.errorOffset = 0;

        this.missChance = 0.05;


        /* =====================================================
           COOLDOWNS
           ===================================================== */

        this.jumpCooldown = 0;

        this.kickCooldown = 0;


        /* =====================================================
           INPUT
           ===================================================== */

        this.input = {

            joystick: {

                x: 0,

                y: 0,

                magnitude: 0,

                active: false
            },

            left: false,

            right: false,

            jump: false,

            kick: false
        };
    }



    /* =========================================================
       REFERENCIAS
       ========================================================= */

    setPlayer(player) {

        this.player = player;
    }


    setBall(ball) {

        this.ball = ball;

        this.lastBallX = null;

        this.lastBallY = null;

        this.ballVelocityX = 0;

        this.ballVelocityY = 0;
    }


    setStadium(stadium) {

        this.stadium = stadium;
    }



    /* =========================================================
       ACTIVAR / DESACTIVAR
       ========================================================= */

    enable() {

        this.enabled = true;
    }


    disable() {

        this.enabled = false;

        this.resetInput();
    }



    /* =========================================================
       RESET INPUT
       ========================================================= */

    resetInput() {

        this.input.joystick.x = 0;

        this.input.joystick.y = 0;

        this.input.joystick.magnitude = 0;

        this.input.joystick.active = false;

        this.input.left = false;

        this.input.right = false;

        this.input.jump = false;

        this.input.kick = false;
    }



    /* =========================================================
       UPDATE PRINCIPAL
       ========================================================= */

    update(deltaTime) {

        this.resetInput();


        if (!this.enabled) {

            return;
        }


        if (
            !this.player ||
            !this.ball
        ) {

            return;
        }


        deltaTime =
            Math.min(
                Number(deltaTime) || 0,
                0.033
            );


        /* =====================================================
           COOLDOWNS
           ===================================================== */

        this.jumpCooldown =
            Math.max(
                0,
                this.jumpCooldown - deltaTime
            );


        this.kickCooldown =
            Math.max(
                0,
                this.kickCooldown - deltaTime
            );


        this.decisionTimer =
            Math.max(
                0,
                this.decisionTimer - deltaTime
            );


        this.actionTimer =
            Math.max(
                0,
                this.actionTimer - deltaTime
            );


        this.reactionTimer =
            Math.max(
                0,
                this.reactionTimer - deltaTime
            );


        this.strategyTimer =
            Math.max(
                0,
                this.strategyTimer - deltaTime
            );


        this.errorTimer =
            Math.max(
                0,
                this.errorTimer - deltaTime
            );


        /* =====================================================
           VELOCIDAD
           ===================================================== */

        this.updateBallVelocity(deltaTime);


        /* =====================================================
           PERCEPCIÓN
           ===================================================== */

        this.analyzeBall();


        /* =====================================================
           PREDICCIÓN
           ===================================================== */

        this.predictBall();


        /* =====================================================
           ERROR HUMANO
           ===================================================== */

        this.updateHumanError();


        /* =====================================================
           PERSONALIDAD
           ===================================================== */

        this.updateStrategy();


        /* =====================================================
           DECISIÓN
           ===================================================== */

        if (
            this.decisionTimer <= 0 &&
            this.reactionTimer <= 0
        ) {

            this.makeTacticalDecision();

            this.decisionTimer =
                this.nextDecisionDelay;
        }


        /* =====================================================
           EJECUTAR MOVIMIENTO
           ===================================================== */

        this.executeMovement();


        /* =====================================================
           SALTO
           ===================================================== */

        this.handleJump();


        /* =====================================================
           PATADA
           ===================================================== */

        this.handleKick();


        /* =====================================================
           LÍMITES
           ===================================================== */

        this.enforceFieldLimits();
    }



    /* =========================================================
       VELOCIDAD DE PELOTA
       ========================================================= */

    updateBallVelocity(deltaTime) {

        if (
            this.lastBallX === null ||
            this.lastBallY === null
        ) {

            this.lastBallX = this.ball.x;

            this.lastBallY = this.ball.y;

            return;
        }


        if (
            deltaTime <= 0
        ) {

            return;
        }


        const velocityX =
            (
                this.ball.x -
                this.lastBallX
            ) / deltaTime;


        const velocityY =
            (
                this.ball.y -
                this.lastBallY
            ) / deltaTime;


        this.ballVelocityX =
            Math.max(
                -1800,
                Math.min(
                    1800,
                    velocityX
                )
            );


        this.ballVelocityY =
            Math.max(
                -1800,
                Math.min(
                    1800,
                    velocityY
                )
            );


        this.lastBallX =
            this.ball.x;


        this.lastBallY =
            this.ball.y;
    }



    /* =========================================================
       ANALIZAR PELOTA
       ========================================================= */

    analyzeBall() {

        const vx =
            this.ballVelocityX;


        const vy =
            this.ballVelocityY;


        const speed =
            Math.sqrt(
                vx * vx +
                vy * vy
            );


        this.ballIsRising =
            vy < -80;


        this.ballIsFalling =
            vy > 80;


        this.ballIsFast =
            speed > 420;


        /*
         * Determinar estado de pelota.
         */

        if (
            this.ballIsRising
        ) {

            this.ballState =
                "RISING";
        }

        else if (
            this.ballIsFalling
        ) {

            this.ballState =
                "FALLING";
        }

        else if (
            speed < 70
        ) {

            this.ballState =
                "SLOW";
        }

        else {

            this.ballState =
                "GROUND";
        }


        /*
         * La pelota viene hacia el arco derecho.
         *
         * El arco de la IA está aproximadamente
         * en la parte derecha.
         */

        this.ballIsComingToGoal =
            vx > 120 &&
            this.ball.x > 700;


        /*
         * Determinar peligro.
         */

        this.ballIsDangerous =
            (
                this.ball.x > 1120 &&
                this.ballIsComingToGoal
            ) ||
            (
                this.predictedGroundX > 1240 &&
                this.ballIsComingToGoal
            );
    }



    /* =========================================================
       PREDICCIÓN DE TRAYECTORIA
       ========================================================= */

    predictBall() {

        const shortTime =
            this.predictionTime;


        const longTime =
            this.longPredictionTime;


        this.predictedBallX =
            this.ball.x +
            this.ballVelocityX *
            shortTime;


        this.predictedBallY =
            this.ball.y +
            this.ballVelocityY *
            shortTime;


        /*
         * Predicción larga para pelotas rápidas.
         */

        if (
            this.ballIsFast
        ) {

            this.predictedBallX =
                this.ball.x +
                this.ballVelocityX *
                longTime;
        }


        /*
         * Buscar punto de caída.
         */

        const groundY =
            this.stadium
                ? this.stadium.groundY -
                  this.ball.radius
                : 525;


        let predictedGroundX =
            this.ball.x;


        let predictedGroundTime = 0;


        if (
            this.ballVelocityY > -50
        ) {

            const gravity =
                1500;


            const verticalDistance =
                groundY -
                this.ball.y;


            if (
                verticalDistance > -100
            ) {

                const discriminant =
                    this.ballVelocityY *
                    this.ballVelocityY +
                    2 *
                    gravity *
                    verticalDistance;


                if (
                    discriminant >= 0
                ) {

                    const timeToGround =
                        (
                            -this.ballVelocityY +
                            Math.sqrt(
                                discriminant
                            )
                        ) / gravity;


                    if (
                        timeToGround >= 0 &&
                        timeToGround < 3
                    ) {

                        predictedGroundTime =
                            timeToGround;


                        predictedGroundX =
                            this.ball.x +
                            this.ballVelocityX *
                            timeToGround;
                    }
                }
            }
        }


        /*
         * Si está cerca del suelo usamos
         * una predicción más corta.
         */

        if (
            this.ball.y >
            groundY - 150
        ) {

            predictedGroundTime =
                0.15;


            predictedGroundX =
                this.ball.x +
                this.ballVelocityX *
                0.15;
        }


        /*
         * Rebote contra límites.
         *
         * Esto permite comprender mejor pelotas
         * que vienen de una pared.
         */

        const leftWall = 42;

        const rightWall = 1494;


        while (
            predictedGroundX < leftWall ||
            predictedGroundX > rightWall
        ) {

            if (
                predictedGroundX >
                rightWall
            ) {

                predictedGroundX =
                    rightWall -
                    (
                        predictedGroundX -
                        rightWall
                    );
            }

            else if (
                predictedGroundX <
                leftWall
            ) {

                predictedGroundX =
                    leftWall +
                    (
                        leftWall -
                        predictedGroundX
                    );
            }
        }


        this.predictedGroundX =
            predictedGroundX;


        this.predictedGroundTime =
            predictedGroundTime;
    }



    /* =========================================================
       PERSONALIDAD
       ========================================================= */

    updateStrategy() {

        if (
            this.strategyTimer > 0
        ) {

            return;
        }


        this.strategyTimer =
            1.2 +
            Math.random() * 2.5;


        const random =
            Math.random();


        if (
            random < 0.30
        ) {

            this.strategy =
                "aggressive";
        }

        else if (
            random < 0.55
        ) {

            this.strategy =
                "defensive";
        }

        else if (
            random < 0.80
        ) {

            this.strategy =
                "balanced";
        }

        else {

            this.strategy =
                "reactive";
        }
    }



    /* =========================================================
       ERROR HUMANO
       ========================================================= */

    updateHumanError() {

        if (
            this.errorTimer > 0
        ) {

            return;
        }


        this.errorTimer =
            0.20 +
            Math.random() * 0.50;


        this.errorOffset =
            (
                Math.random() * 2 -
                1
            ) *
            this.errorAmount;


        /*
         * Ocasionalmente aumentamos el error.
         */

        if (
            Math.random() <
            this.missChance
        ) {

            this.errorOffset *= 2.5;
        }
    }



    /* =========================================================
       DECISIÓN TÁCTICA
       ========================================================= */

    makeTacticalDecision() {

        const playerX =
            this.player.x;


        const playerY =
            this.player.y;


        const ballX =
            this.ball.x;


        const ballY =
            this.ball.y;


        const dx =
            ballX -
            playerX;


        const dy =
            ballY -
            playerY;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        /* =====================================================
           1. PELIGRO INMEDIATO
           ===================================================== */

        if (
            this.ballIsDangerous
        ) {

            this.setDecision(
                "DEFEND",
                "CLEAR",
                this.getDefensiveInterceptX()
            );

            return;
        }


        /* =====================================================
           2. PELOTA MUY CERCA
           ===================================================== */

        if (
            distance <
            this.closeBallDistance
        ) {

            this.chooseCloseBallAction(
                distance,
                dx,
                dy
            );

            return;
        }


        /* =====================================================
           3. PELOTA VINIENDO HACIA NOSOTROS
           ===================================================== */

        if (
            this.ballIsComingToGoal &&
            this.ballVelocityX > 100
        ) {

            const interceptX =
                this.getPredictedInterceptX();


            /*
             * Si podemos llegar a tiempo,
             * interceptamos.
             */

            if (
                this.canReach(
                    interceptX
                )
            ) {

                this.setDecision(
                    "INTERCEPT",
                    "MOVE",
                    interceptX
                );

                return;
            }


            /*
             * Si no podemos llegar,
             * defendemos el arco.
             */

            this.setDecision(
                "DEFEND",
                "POSITION",
                this.getDefensivePosition()
            );

            return;
        }


        /* =====================================================
           4. PELOTA EN AIRE
           ===================================================== */

        if (
            this.ballIsRising ||
            this.ballIsFalling
        ) {

            this.handleAirborneDecision(
                distance
            );

            return;
        }


        /* =====================================================
           5. PELOTA EN NUESTRA ZONA
           ===================================================== */

        if (
            ballX > 950
        ) {

            this.handleDefensiveGroundBall(
                distance
            );

            return;
        }


        /* =====================================================
           6. PELOTA EN CAMPO RIVAL
           ===================================================== */

        this.handleAttackingSituation(
            distance
        );
    }



    /* =========================================================
       PELOTA CERCA
       ========================================================= */

    chooseCloseBallAction(
        distance,
        dx,
        dy
    ) {

        const random =
            Math.random();


        /*
         * Si está en posición de patear,
         * no siempre pateamos inmediatamente.
         */

        if (
            distance < 125
        ) {

            if (
                random < 0.65
            ) {

                this.setDecision(
                    "ATTACK",
                    "KICK",
                    this.player.x
                );

                return;
            }


            /*
             * A veces nos reposicionamos.
             */

            this.setDecision(
                "ATTACK",
                "MOVE",
                this.ball.x + this.errorOffset
            );

            return;
        }


        /*
         * Pelota cercana pero todavía no controlable.
         */

        this.setDecision(
            "ATTACK",
            "MOVE",
            this.ball.x
        );
    }



    /* =========================================================
       DECISIÓN PELOTA AÉREA
       ========================================================= */

    handleAirborneDecision(
        distance
    ) {

        const predictedX =
            this.predictedGroundX;


        const playerX =
            this.player.x;


        const distanceToLanding =
            Math.abs(
                predictedX -
                playerX
            );


        /*
         * Pelota cayendo sobre nosotros.
         */

        if (
            this.ballIsFalling &&
            distanceToLanding < 100
        ) {

            this.setDecision(
                "INTERCEPT",
                "JUMP",
                predictedX
            );

            return;
        }


        /*
         * Pelota aérea peligrosa.
         */

        if (
            this.ballIsDangerous
        ) {

            this.setDecision(
                "DEFEND",
                "INTERCEPT",
                predictedX
            );

            return;
        }


        /*
         * Si podemos llegar a la caída,
         * vamos allí.
         */

        if (
            distanceToLanding <
            300
        ) {

            this.setDecision(
                "INTERCEPT",
                "MOVE",
                predictedX
            );

            return;
        }


        /*
         * Si la pelota se aleja,
         * mantenemos posición.
         */

        this.setDecision(
            "DEFEND",
            "POSITION",
            this.getDefensivePosition()
        );
    }



    /* =========================================================
       PELOTA TERRESTRE DEFENSIVA
       ========================================================= */

    handleDefensiveGroundBall(
        distance
    ) {

        const random =
            Math.random();


        /*
         * Si está cerca, atacamos la pelota.
         */

        if (
            distance <
            this.attackDistance
        ) {

            this.setDecision(
                "ATTACK",
                "MOVE",
                this.ball.x
            );

            return;
        }


        /*
         * A veces interceptamos.
         */

        if (
            random < 0.45
        ) {

            this.setDecision(
                "INTERCEPT",
                "MOVE",
                this.predictedGroundX
            );

            return;
        }


        /*
         * Otras veces esperamos.
         */

        this.setDecision(
            "DEFEND",
            "POSITION",
            this.getDefensivePosition()
        );
    }



    /* =========================================================
       SITUACIÓN DE ATAQUE
       ========================================================= */

    handleAttackingSituation(
        distance
    ) {

        /*
         * No perseguimos la pelota hasta el otro
         * extremo del campo automáticamente.
         */

        if (
            this.strategy ===
            "defensive"
        ) {

            this.setDecision(
                "DEFEND",
                "POSITION",
                this.defensiveX
            );

            return;
        }


        /*
         * Estrategia agresiva:
         * adelantarse.
         */

        if (
            this.strategy ===
            "aggressive"
        ) {

            this.setDecision(
                "ATTACK",
                "MOVE",
                Math.max(
                    this.attackX,
                    this.predictedGroundX
                )
            );

            return;
        }


        /*
         * Estrategia reactiva:
         * esperar el rebote o error rival.
         */

        if (
            this.strategy ===
            "reactive"
        ) {

            this.setDecision(
                "DEFEND",
                "POSITION",
                1050
            );

            return;
        }


        /*
         * Balanceado.
         */

        this.setDecision(
            "DEFEND",
            "POSITION",
            this.getDefensivePosition()
        );
    }



    /* =========================================================
       ESTABLECER DECISIÓN
       ========================================================= */

    setDecision(
        state,
        action,
        targetX
    ) {

        /*
         * Evitar repetir exactamente la misma decisión
         * demasiadas veces.
         */

        if (
            this.lastState === state &&
            this.lastAction === action &&
            this.lastDecisionX !== null &&
            Math.abs(
                targetX -
                this.lastDecisionX
            ) < 25
        ) {

            this.sameDecisionCount++;

        }

        else {

            this.sameDecisionCount = 0;
        }


        /*
         * Si repetimos demasiado,
         * forzamos una pequeña variación.
         */

        if (
            this.sameDecisionCount > 5
        ) {

            targetX +=
                (
                    Math.random() *
                    2 -
                    1
                ) *
                100;

            this.sameDecisionCount = 0;
        }


        this.currentState =
            state;


        this.currentAction =
            action;


        this.targetX =
            targetX;


        this.lastState =
            state;


        this.lastAction =
            action;


        this.lastDecisionX =
            targetX;
    }



    /* =========================================================
       POSICIÓN DEFENSIVA
       ========================================================= */

    getDefensivePosition() {

        /*
         * Si la pelota está muy cerca del arco,
         * nos hundimos.
         */

        if (
            this.ball.x > 1300
        ) {

            return (
                this.deepDefensiveX +
                this.errorOffset
            );
        }


        /*
         * Si la pelota está en el centro,
         * avanzamos ligeramente.
         */

        if (
            this.ball.x > 900
        ) {

            return (
                1160 +
                this.errorOffset
            );
        }


        /*
         * Pelota lejos:
         * no perseguir.
         */

        return (
            this.defensiveX +
            this.errorOffset
        );
    }



    /* =========================================================
       PUNTO DE INTERCEPCIÓN
       ========================================================= */

    getPredictedInterceptX() {

        let x =
            this.predictedGroundX;


        /*
         * Si viene muy rápido,
         * anticipamos un poco más.
         */

        if (
            this.ballVelocityX >
            700
        ) {

            x += 35;
        }


        return x;
    }



    /* =========================================================
       INTERCEPCIÓN DEFENSIVA
       ========================================================= */

    getDefensiveInterceptX() {

        let x =
            this.predictedGroundX;


        /*
         * No nos alejamos demasiado
         * del arco cuando estamos defendiendo.
         */

        x =
            Math.max(
                1050,
                x
            );


        x =
            Math.min(
                1400,
                x
            );


        return x;
    }



    /* =========================================================
       ¿PODEMOS LLEGAR?
       ========================================================= */

    canReach(targetX) {

        if (
            !this.player
        ) {

            return false;
        }


        const distance =
            Math.abs(
                targetX -
                this.player.x
            );


        /*
         * Estimación aproximada basada
         * en velocidad máxima del jugador.
         */

        const estimatedTime =
            distance /
            Math.max(
                1,
                this.player.speed
            );


        /*
         * Si llegamos antes de que la pelota
         * toque el suelo, podemos interceptar.
         */

        if (
            this.predictedGroundTime <= 0
        ) {

            return distance < 250;
        }


        return (
            estimatedTime <
            this.predictedGroundTime + 0.15
        );
    }



    /* =========================================================
       EJECUTAR MOVIMIENTO
       ========================================================= */

    executeMovement() {

        if (
            !this.player
        ) {

            return;
        }


        let target =
            this.targetX;


        /*
         * Acciones específicas.
         */

        if (
            this.currentAction ===
            "MOVE"
        ) {

            target =
                this.targetX;
        }


        if (
            this.currentAction ===
            "POSITION"
        ) {

            target =
                this.targetX;
        }


        if (
            this.currentAction ===
            "CLEAR"
        ) {

            target =
                this.targetX;
        }


        if (
            this.currentAction ===
            "JUMP"
        ) {

            target =
                this.targetX;
        }


        /*
         * Pequeña variación humana.
         */

        target +=
            this.errorOffset;


        /*
         * Límites tácticos reales.
         */

        target =
            Math.max(
                this.minX - 80,
                Math.min(
                    this.maxX,
                    target
                )
            );


        const difference =
            target -
            this.player.x;


        /*
         * Zona muerta.
         */

        if (
            Math.abs(
                difference
            ) < 24
        ) {

            this.stopHorizontal();

            return;
        }


        if (
            difference > 0
        ) {

            this.setRight();

            return;
        }


        this.setLeft();
    }



    /* =========================================================
       SALTO
       ========================================================= */
       
       handleJump() {

        if (
            this.jumpCooldown > 0
        ) {

            return;
        }


        if (
            !this.player.onGround
        ) {

            return;
        }


        const distanceToBall =
            Math.abs(
                this.ball.x -
                this.player.x
            );


        const heightDifference =
            this.player.y -
            this.ball.y;


        /*
         * Salto táctico explícito.
         */

        if (
            this.currentAction ===
            "JUMP"
        ) {

            if (
                distanceToBall <
                180
            ) {

                this.jump();

                return;
            }
        }


        /*
         * Pelota cayendo sobre nosotros.
         */

        if (
            this.ballIsFalling &&
            distanceToBall < 100 &&
            heightDifference > 70
        ) {

            this.jump();

            return;
        }


        /*
         * Pelota subiendo muy cerca.
         */

        if (
            this.ballIsRising &&
            distanceToBall < 130 &&
            heightDifference > 100
        ) {

            this.jump();

            return;
        }


        /*
         * Pelota rápida y trayectoria peligrosa.
         */

        if (
            this.ballIsDangerous &&
            distanceToBall < 140
        ) {

            this.jump();

            return;
        }


        /*
         * Intercepción anticipada.
         */

        const landingDistance =
            Math.abs(
                this.predictedGroundX -
                this.player.x
            );


        if (
            landingDistance < 70 &&
            this.predictedGroundTime > 0 &&
            this.predictedGroundTime < 0.8 &&
            this.ball.y <
            this.player.y - 70
        ) {

            this.jump();
        }
    }



    /* =========================================================
       SALTAR
       ========================================================= */

    jump() {

        this.input.jump = true;

        this.input.joystick.y = -1;

        this.jumpCooldown =
            0.48;
    }



    /* =========================================================
       PATADA
       ========================================================= */

    handleKick() {

        if (
            this.kickCooldown > 0
        ) {

            return;
        }


        if (
            !this.player ||
            !this.ball
        ) {

            return;
        }


        const dx =
            this.ball.x -
            this.player.x;


        const dy =
            this.ball.y -
            this.player.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const kickDistance =
            this.player.radius +
            this.ball.radius +
            38;


        if (
            distance >
            kickDistance
        ) {

            return;
        }


        /*
         * La pelota debe estar delante.
         */

        const facing =
            this.player.facing;


        const ballInFront =
            (
                facing === -1 &&
                dx < 40
            ) ||
            (
                facing === 1 &&
                dx > -40
            );


        if (
            !ballInFront
        ) {

            return;
        }


        /*
         * Si estamos en situación defensiva,
         * despejamos incluso si no es una jugada
         * ofensiva perfecta.
         */

        const defensiveKick =
            this.currentState ===
            "DEFEND";


        /*
         * En ataque esperamos un poquito más
         * para intentar posicionarnos.
         */

        if (
            this.currentState ===
            "ATTACK" &&
            Math.random() < 0.15
        ) {

            return;
        }


        /*
         * Despeje o ataque.
         */

        if (
            defensiveKick ||
            this.currentState ===
            "INTERCEPT" ||
            this.currentAction ===
            "KICK" ||
            this.currentState ===
            "ATTACK"
        ) {

            /*
             * Error humano ocasional.
             */

            if (
                Math.random() <
                this.missChance
            ) {

                this.kickCooldown =
                    0.20;

                return;
            }


            this.input.kick = true;

            this.kickCooldown =
                0.38;


            this.actionTimer =
                0.25;
        }
    }



    /* =========================================================
       LÍMITES REALES DE CANCHA
       ========================================================= */

    enforceFieldLimits() {

        if (
            !this.player
        ) {

            return;
        }


        /*
         * Estos límites son físicos,
         * no tácticos.
         */

        const leftLimit =
            this.minX - 80;


        const rightLimit =
            this.maxX;


        if (
            this.player.x <
            leftLimit
        ) {

            this.setRight();

            return;
        }


        if (
            this.player.x >
            rightLimit
        ) {

            this.setLeft();

            return;
        }
    }



    /* =========================================================
       DETENER MOVIMIENTO
       ========================================================= */

    stopHorizontal() {

        this.input.joystick.x = 0;

        this.input.joystick.magnitude = 0;

        this.input.joystick.active = false;

        this.input.left = false;

        this.input.right = false;
    }



    /* =========================================================
       DERECHA
       ========================================================= */

    setRight() {

        this.input.joystick.x = 1;

        this.input.joystick.magnitude = 1;

        this.input.joystick.active = true;

        this.input.left = false;

        this.input.right = true;
    }



    /* =========================================================
       IZQUIERDA
       ========================================================= */

    setLeft() {

        this.input.joystick.x = -1;

        this.input.joystick.magnitude = 1;

        this.input.joystick.active = true;

        this.input.left = true;

        this.input.right = false;
    }



    /* =========================================================
       OBTENER INPUT
       ========================================================= */

    getInput() {

        return {

            joystick: {

                x:
                    this.input.joystick.x,

                y:
                    this.input.joystick.y,

                magnitude:
                    this.input.joystick.magnitude,

                active:
                    this.input.joystick.active
            },

            left:
                this.input.left,

            right:
                this.input.right,

            jump:
                this.input.jump,

            kick:
                this.input.kick
        };
    }
}


/* ========================================================= */
/* DISPONIBLE GLOBALMENTE                                    */
/* ========================================================= */

window.FootballAI = FootballAI;