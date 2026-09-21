/* ========================================================= */
/* GAME.JS                                                   */
/* Coordinador principal del partido                         */
/* ========================================================= */


/* ========================================================= */
/* CLASE PRINCIPAL DEL PARTIDO                                */
/* ========================================================= */

class FootballGame {

    constructor(matchData) {

        this.matchData = matchData;


        /* ================================================= */
        /* MODO DE JUEGO                                      */
        /* ================================================= */

        /*
         * Si matchData ya trae un modo válido, lo aplicamos.
         *
         * Si todavía no existe, se mantiene el modo actual
         * de GameMode, que por defecto es jugador contra jugador.
         */

        if (
            window.GameMode &&
            this.matchData &&
            this.matchData.mode
        ) {

            GameMode.setMode(
                this.matchData.mode
            );
        }


        /* ================================================= */
        /* CANVAS                                             */
        /* ================================================= */

        this.canvas =
            document.getElementById("gameCanvas");

        if (!this.canvas) {

            console.error(
                "No se encontró el canvas #gameCanvas."
            );

            return;
        }


        this.ctx =
            this.canvas.getContext("2d");


        /* ================================================= */
        /* SISTEMAS                                           */
        /* ================================================= */

        let ControlsClass = null;


        if (typeof FootballControls !== "undefined") {

            ControlsClass =
                FootballControls;

        } else if (typeof GameControls !== "undefined") {

            ControlsClass =
                GameControls;
        }


        if (!ControlsClass) {

            console.error(
                "No se encontró la clase FootballControls ni GameControls."
            );

            return;
        }


        this.stadium =
            new Stadium(this.canvas);
            
        this.stadiumFX = 
            new StadiumFX(this.canvas);
            
        this.stadiumCrowd =
            new StadiumCrowd(this.canvas);
            
        this.skyTraffic =
            new SkyTraffic(this.canvas);
            
        /* ================================================= */
/* SISTEMA DE MAREO                                  */
/* ================================================= */

this.dizzinessSystem =
    typeof DizzinessSystem !== "undefined"
        ? new DizzinessSystem()
        : null;
        
        
        
        /* ================================================= */
/* EFECTO DE VIENTO DE PATADA                        */
/* ================================================= */

this.kickEffect =
    typeof KickEffect !== "undefined"
        ? new KickEffect()
        : null;


        /* ================================================= */
        /* MAPA DE COLISIONES                                */
        /* ================================================= */

        this.collisionMap =
            new CollisionMap({
                width: 1536,
                height: 714
            });


        this.controls =
            new ControlsClass();


        this.scoreboard =
            new Scoreboard();


        /* ================================================= */
        /* ENTIDADES                                          */
        /* ================================================= */

        this.player1 = null;
        this.player2 = null;
        this.ball = null;


        /* ================================================= */
        /* INTELIGENCIA ARTIFICIAL                            */
        /* ================================================= */

        this.ai = null;


        /* ================================================= */
        /* ARCOS                                              */
        /* ================================================= */

        this.leftGoal = null;
        this.rightGoal = null;


        /* ================================================= */
        /* ESTADO                                             */
        /* ================================================= */

        this.running = false;
        this.matchFinished = false;

        this.lastTime = 0;


        /* ================================================= */
        /* PELOTA ACTUAL                                      */
        /* ================================================= */

        this.currentBallType =
            "football";


        /* ================================================= */
        /* PAUSA DESPUÉS DE GOL                               */
        /* ================================================= */

        this.goalPause = false;
        this.goalPauseTimer = 0;

        this.goalMessageTimeout = null;


        /* ================================================= */
        /* JUGADOR QUE MARCÓ                                  */
        /* ================================================= */

        this.lastScoringCharacterKey = null;

        this.playerGoalLineTimeout = null;


        /* ================================================= */
        /* CANVAS                                             */
        /* ================================================= */

        this.screenWidth = 0;
        this.screenHeight = 0;


        this.resizeCanvas();

        this.bindWindowEvents();


        /* ================================================= */
        /* CONFIGURAR PARTIDO                                 */
        /* ================================================= */

        this.setupMatch();
    }



    /* ===================================================== */
    /* CONFIGURAR PARTIDO                                    */
    /* ===================================================== */

    setupMatch() {

        const team1 =
            this.matchData.team1;

        const team2 =
            this.matchData.team2;


        /* ================================================= */
        /* MARCADOR                                           */
        /* ================================================= */

        this.scoreboard.setTeams(
            team1,
            team2
        );


        this.scoreboard.setDuration(
            this.matchData.duration
        );


        /* ================================================= */
        /* JUGADOR 1                                          */
        /* ================================================= */

        this.player1 =
            new Player({

                id: 1,

                name: "Jugador 1",

                x: 430,
                y: 601,

                teamName:
                    team1.name,

                primaryColor:
                    team1.primaryColor,

                secondaryColor:
                    team1.secondaryColor
            });


        /* ================================================= */
        /* JUGADOR 2                                          */
        /* ================================================= */

        this.player2 =
            new Player({

                id: 2,

                name: "Jugador 2",

                x: 1106,
                y: 601,

                teamName:
                    team2.name,

                primaryColor:
                    team2.primaryColor,

                secondaryColor:
                    team2.secondaryColor
            });


        /* ================================================= */
        /* PELOTA                                             */
        /* ================================================= */

        this.currentBallType =
            "football";


        this.createBall(
            this.currentBallType
        );


        /* ================================================= */
        /* INTELIGENCIA ARTIFICIAL                            */
        /* ================================================= */

        /*
         * La CPU controla al jugador 2.
         *
         * La IA solamente se crea cuando el modo actual
         * es jugador contra CPU.
         */

        if (
            window.GameMode &&
            GameMode.isPlayerVsAI() &&
            typeof FootballAI !== "undefined"
        ) {

            this.ai =
                new FootballAI({

                    player:
                        this.player2,

                    ball:
                        this.ball,

                    stadium:
                        this.stadium
                });
        }


        /* ================================================= */
        /* ARCO IZQUIERDO                                     */
        /* ================================================= */

        this.leftGoal =
            new Goal({

                side: "left",

                x: 12,

                y: 465,

                width: 105,

                height: 175,

                teamThatDefends: 1
            });


        /* ================================================= */
        /* ARCO DERECHO                                       */
        /* ================================================= */

        this.rightGoal =
            new Goal({

                side: "right",

                x: 1419,

                y: 465,

                width: 105,

                height: 175,

                teamThatDefends: 2
            });
    }



    /* ===================================================== */
    /* CREAR PELOTA                                          */
    /* ===================================================== */

    createBall(type) {

        if (
            typeof Ball.getTypeConfig !==
            "function"
        ) {

            console.warn(
                "El sistema de tipos de pelota no está disponible."
            );

            type =
                "football";
        }


        const availableTypes =
            typeof Ball.getAvailableTypes ===
            "function"
                ? Ball.getAvailableTypes()
                : ["football"];


        if (
            !availableTypes.includes(type)
        ) {

            console.warn(
                `El tipo de pelota "${type}" no está registrado.`
            );

            type =
                "football";
        }


        this.ball =
            new Ball({

                x: 768,

                spawnY: 150,

                type: type
            });


        this.currentBallType =
            type;


        /* ================================================= */
        /* ACTUALIZAR REFERENCIA DE LA IA                    */
        /* ================================================= */

        /*
         * Después de cada gol se crea una pelota nueva.
         * Por eso la IA debe recibir la nueva referencia.
         */

        if (this.ai) {

            this.ai.setBall(
                this.ball
            );
        }
    }



    /* ===================================================== */
    /* CREAR NUEVA PELOTA DESPUÉS DE GOL                     */
    /* ===================================================== */

    createRandomBall() {

        const nextType =
            Ball.getRandomType(
                this.currentBallType
            );


        this.createBall(
            nextType
        );
    }



    /* ===================================================== */
    /* EVENTOS DE VENTANA                                    */
    /* ===================================================== */

    bindWindowEvents() {

        window.addEventListener(
            "resize",
            () => {

                this.resizeCanvas();

            }
        );


        /* ================================================= */
        /* SALIR DEL PARTIDO                                  */
        /* ================================================= */

        const exitButton =
            document.getElementById(
                "exitMatchButton"
            );


        if (exitButton) {

            exitButton.addEventListener(
                "click",
                () => {

                    this.returnToMenu();

                }
            );
        }


        /* ================================================= */
        /* VOLVER A JUGAR                                     */
        /* ================================================= */

        const playAgainButton =
            document.getElementById(
                "playAgainButton"
            );


        if (playAgainButton) {

            playAgainButton.addEventListener(
                "click",
                () => {

                    this.playAgain();

                }
            );
        }


        /* ================================================= */
        /* VOLVER AL MENÚ DESDE FINAL                         */
        /* ================================================= */

        const endBackToMenuButton =
            document.getElementById(
                "endBackToMenuButton"
            );


        if (endBackToMenuButton) {

            endBackToMenuButton.addEventListener(
                "click",
                () => {

                    this.returnToMenu();

                }
            );
        }


        /* ================================================= */
        /* COMPATIBILIDAD                                     */
        /* ================================================= */

        const oldBackToMenuButton =
            document.getElementById(
                "backToMenuButton"
            );


        if (
            oldBackToMenuButton &&
            oldBackToMenuButton !==
            endBackToMenuButton
        ) {

            oldBackToMenuButton.addEventListener(
                "click",
                () => {

                    this.returnToMenu();

                }
            );
        }
    }



    /* ===================================================== */
    /* MOSTRAR PANTALLA DEL PARTIDO                          */
    /* ===================================================== */

    showGameScreen() {

        const gameScreen =
            document.getElementById(
                "gameScreen"
            );

        const matchSetupScreen =
            document.getElementById(
                "matchSetupScreen"
            );

        const menuScreen =
            document.getElementById(
                "menuScreen"
            );

        const endScreen =
            document.getElementById(
                "matchEndScreen"
            );
            
            
    /* ===================================================== */
    /* CONTROLES SEGÚN MODO                                  */
    /* ===================================================== */

    const gameControls =
        document.getElementById("gameControls");

    if (gameControls) {

        const isAI =
            window.GameMode &&
            GameMode.isPlayerVsAI();

        gameControls.classList.toggle(
            "ai-mode",
            isAI
        );
    }


        /* ================================================= */
        /* MENÚ                                               */
        /* ================================================= */

        if (menuScreen) {

            menuScreen.classList.remove(
                "active"
            );

            menuScreen.classList.add(
                "hidden"
            );

            menuScreen.style.display =
                "none";
        }


        /* ================================================= */
        /* CONFIGURACIÓN                                      */
        /* ================================================= */

        if (matchSetupScreen) {

            matchSetupScreen.classList.remove(
                "active"
            );

            matchSetupScreen.classList.add(
                "hidden"
            );

            matchSetupScreen.style.display =
                "none";

            matchSetupScreen.scrollTop = 0;
        }


        /* ================================================= */
        /* PANTALLA FINAL                                     */
        /* ================================================= */

        if (endScreen) {

            endScreen.classList.remove(
                "active"
            );

            endScreen.classList.add(
                "hidden"
            );

            endScreen.style.display =
                "none";

            endScreen.style.visibility =
                "";

            endScreen.style.opacity =
                "";
        }


        /* ================================================= */
        /* PARTIDO                                            */
        /* ================================================= */

        if (gameScreen) {

            gameScreen.classList.remove(
                "hidden"
            );

            gameScreen.classList.add(
                "active"
            );

            gameScreen.style.display =
                "flex";


            requestAnimationFrame(() => {

                this.resizeCanvas();

            });
        }
    }



    /* ===================================================== */
    /* AJUSTAR CANVAS                                        */
    /* ===================================================== */

    resizeCanvas() {

        if (!this.canvas || !this.ctx) {
            return;
        }


        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        this.screenWidth =
            window.innerWidth;

        this.screenHeight =
            window.innerHeight;


        this.canvas.width =
            this.screenWidth * dpr;

        this.canvas.height =
            this.screenHeight * dpr;


        this.canvas.style.width =
            `${this.screenWidth}px`;

        this.canvas.style.height =
            `${this.screenHeight}px`;


        this.ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }



    /* ===================================================== */
    /* INICIAR PARTIDO                                       */
    /* ===================================================== */

    start() {

        if (this.running) {
            return;
        }


        this.showGameScreen();


        this.running = true;

        this.matchFinished = false;


        this.goalPause = false;

        this.goalPauseTimer = 0;


        this.lastTime =
            performance.now();


        requestAnimationFrame(
            (time) => {

                this.loop(time);

            }
        );
    }



    /* ===================================================== */
    /* VOLVER A JUGAR                                        */
    /* ===================================================== */

    playAgain() {

        const previousMatchData =
            this.matchData;


        if (!previousMatchData) {

            console.error(
                "No se encontró la configuración del partido anterior."
            );

            return;
        }


        if (
            this.goalMessageTimeout
        ) {

            clearTimeout(
                this.goalMessageTimeout
            );

            this.goalMessageTimeout =
                null;
        }


        if (
            this.playerGoalLineTimeout
        ) {

            clearTimeout(
                this.playerGoalLineTimeout
            );

            this.playerGoalLineTimeout =
                null;
        }


        /* ================================================= */
        /* AUDIO DE NUEVO PARTIDO                             */
        /* ================================================= */

        if (window.AudioManager) {

            AudioManager.stopMusic();

            AudioManager.playStadium();

            AudioManager.playReferee();
        }


        this.running 
        
        this.matchFinished = true;

        this.goalPause = false;

        this.goalPauseTimer = 0;

        this.lastScoringCharacterKey = null;


        const goalMessage =
            document.getElementById(
                "goalMessage"
            );


        if (goalMessage) {

            goalMessage.classList.remove(
                "visible"
            );

            goalMessage.style.display =
                "none";
        }


        const endScreen =
            document.getElementById(
                "matchEndScreen"
            );


        if (endScreen) {

            endScreen.classList.remove(
                "active"
            );

            endScreen.classList.add(
                "hidden"
            );

            endScreen.style.display =
                "none";

            endScreen.style.visibility =
                "hidden";

            endScreen.style.opacity =
                "0";
        }


        window.currentFootballGame =
            new FootballGame(
                previousMatchData
            );


        window.currentFootballGame.start();
    }
    
    /* ===================================================== */
/* BUCLE PRINCIPAL                                       */
/* ===================================================== */

    loop(currentTime) {

        if (!this.running) {
            return;
        }


        let deltaTime =
            (
                currentTime -
                this.lastTime
            ) / 1000;


        this.lastTime =
            currentTime;


        deltaTime =
            Math.min(
                deltaTime,
                0.033
            );


        this.update(
            deltaTime
        );


        this.render();


        if (this.running) {

            requestAnimationFrame(
                (time) => {

                    this.loop(time);

                }
            );
        }
    }



    /* ===================================================== */
    /* ACTUALIZAR PARTIDO                                    */
    /* ===================================================== */

    update(deltaTime) {
    	
        if (this.stadiumFX) {
            this.stadiumFX.update(deltaTime);
        }

        if (this.stadiumCrowd) {
            this.stadiumCrowd.update(deltaTime);
        }

        if (this.skyTraffic) {
    this.skyTraffic.update(deltaTime);
        }

       if (this.dizzinessSystem) {
    this.dizzinessSystem.update(deltaTime);
        }

       if (this.kickEffect) {
    this.kickEffect.update(deltaTime);
        }
  

        if (this.matchFinished) {
            return;
        }


        /* ================================================= */
        /* PAUSA DESPUÉS DE GOL                               */
        /* ================================================= */

        if (this.goalPause) {

            this.goalPauseTimer -=
                deltaTime;


            if (
                this.goalPauseTimer <= 0
            ) {

                this.goalPause = false;


                /* ========================================= */
                /* CREAR NUEVA PELOTA                        */
                /* ========================================= */

                this.createRandomBall();


                /* ========================================= */
                /* REINICIAR JUGADORES                       */
                /* ========================================= */

                this.resetPlayers();


                /* ========================================= */
                /* GUARDAR EL PERSONAJE QUE MARCÓ            */
                /* ========================================= */

                const scoringCharacterKey =
                    this.lastScoringCharacterKey;


                /* ========================================= */
                /* SILBATO DE REANUDACIÓN                    */
                /* ========================================= */

                if (window.AudioManager) {

                    AudioManager.playReferee();
                }


                /* ========================================= */
                /* FRASE DEL JUGADOR                         */
                /* ========================================= */

                if (scoringCharacterKey) {

                    this.playerGoalLineTimeout =
                        setTimeout(() => {

                            if (
                                this.running &&
                                !this.matchFinished &&
                                window.AudioManager
                            ) {

                                AudioManager.playPlayerGoalLine(
                                    scoringCharacterKey
                                );
                            }


                            this.playerGoalLineTimeout =
                                null;

                        }, 5);
                }


                /* ========================================= */
                /* LIMPIAR PERSONAJE GUARDADO                */
                /* ========================================= */

                this.lastScoringCharacterKey =
                    null;
            }


            return;
        }


        /* ================================================= */
        /* INPUT                                             */
        /* ================================================= */

        const input1 =
            this.controls.getPlayer1Input();


        let input2;


        /* ================================================= */
        /* INPUT DEL JUGADOR 2 / IA                           */
        /* ================================================= */

        if (
            this.ai &&
            window.GameMode &&
            GameMode.isPlayerVsAI()
        ) {

            this.ai.update(
                deltaTime
            );


            input2 =
                this.ai.getInput();

        } else {

            input2 =
                this.controls.getPlayer2Input();
        }


        /* ================================================= */
        /* JUGADORES                                         */
        /* ================================================= */

        this.player1.update(
            input1,
            deltaTime,
            this.stadium
        );


        this.player2.update(
            input2,
            deltaTime,
            this.stadium
        );


        /* ================================================= */
        /* PELOTA                                             */
        /* ================================================= */

        this.ball.update(
            deltaTime,
            this.stadium
        );


        /* ================================================= */
        /* GOL PRIORITARIO                                    */
        /* ================================================= */

        /*
         * IMPORTANTE:
         *
         * El gol se comprueba inmediatamente después de
         * actualizar la pelota.
         *
         * De esta manera un poste o travesaño nunca puede
         * hacer rebotar la pelota antes de que se registre
         * una entrada válida al arco.
         */

        if (this.checkGoals()) {
            return;
        }


        /* ================================================= */
        /* MAPA DE COLISIONES                                */
        /* ================================================= */

        this.collisionMap.update(
            deltaTime
        );


        Physics.resolveCollisionMap(
            this.ball,
            this.collisionMap
        );


        /* ================================================= */
        /* COLISIÓN JUGADORES                                */
        /* ================================================= */

        Physics.resolvePlayers(
            this.player1,
            this.player2
        );


        /* ================================================= */
        /* COLISIÓN JUGADOR 1 / PELOTA                       */
        /* ================================================= */

        Physics.resolvePlayerBall(
            this.player1,
            this.ball
        );


        /* ================================================= */
        /* COLISIÓN JUGADOR 2 / PELOTA                       */
        /* ================================================= */

        Physics.resolvePlayerBall(
            this.player2,
            this.ball
        );


        /* ================================================= */
        /* PATADAS                                           */
        /* ================================================= */

        this.handleKick(
            this.player1,
            input1.kick,
            1
        );


        this.handleKick(
            this.player2,
            input2.kick,
            2
        );


        /* ================================================= */
        /* CRONÓMETRO                                         */
        /* ================================================= */

        const matchEnded =
            this.scoreboard.update(
                deltaTime
            );


        if (matchEnded) {

            this.finishMatch();

            return;
        }
    }



    /* ===================================================== */
    /* PATADAS                                              */
    /* ===================================================== */

    handleKick(
        player,
        kickPressed,
        playerNumber
    ) {

        if (!kickPressed) {
            return;
        }


        if (player.kickCooldown > 0) {
            return;
        }


        const distance =
            Physics.distance(
                player.x,
                player.y,
                this.ball.x,
                this.ball.y
            );


        const kickDistance =
            player.radius +
            this.ball.radius +
            32;


        if (
            distance >
            kickDistance
        ) {

            return;
        }


        const directionX =
            player.facing;


        const directionY =
            0;


        const kickPower =
            650;


        this.ball.kick(
    directionX,
    directionY,
    kickPower,
    player
);


/* ================================================= */
/* EFECTO DE VIENTO                                  */
/* ================================================= */

if (this.kickEffect) {

    this.kickEffect.trigger(
        this.ball.x,
        this.ball.y,
        directionX,
        kickPower
    );
}


player.kickCooldown =
    0.35;

}


/* ===================================================== */
/* COMPROBAR GOLES                                       */
/* ===================================================== */

checkGoals() {

        if (
            this.leftGoal.containsBall(
                this.ball
            )
        ) {

            this.scoreGoal(2);

            return true;
        }


        if (
            this.rightGoal.containsBall(
                this.ball
            )
        ) {

            this.scoreGoal(1);

            return true;
        }


        return false;
    }



    /* ===================================================== */
    /* OBTENER PERSONAJE DEL JUGADOR                         */
    /* ===================================================== */

    getCharacterKey(player) {

        if (!player) {
            return null;
        }


        /* ================================================= */
        /* SI PLAYER YA TIENE CHARACTERKEY                   */
        /* ================================================= */

        if (player.characterKey) {

            const key =
                String(
                    player.characterKey
                ).toLowerCase();


            if (key === "mbape") {
                return "mbappe";
            }


            return key;
        }


        /* ================================================= */
        /* DETERMINARLO SEGÚN EL EQUIPO                      */
        /* ================================================= */

        const teamName =
            String(
                player.teamName || ""
            ).toLowerCase();


        if (
            teamName.includes("argentina")
        ) {

            return "messi";
        }


        if (
            teamName.includes("brasil") ||
            teamName.includes("brazil")
        ) {

            return "neymar";
        }


        if (
            teamName.includes("francia") ||
            teamName.includes("france")
        ) {

            return "mbappe";
        }


        if (
            teamName.includes("españa") ||
            teamName.includes("espana") ||
            teamName.includes("spain")
        ) {

            return "pedri";
        }


        return null;
    }



    /* ===================================================== */
    /* REGISTRAR GOL                                         */
    /* ===================================================== */

    scoreGoal(scoringTeam) {
    	
        if (this.stadiumCrowd) {
            this.stadiumCrowd.onGoal();
        }


        if (this.goalPause) {
            return;
        }


        /* ================================================= */
        /* IDENTIFICAR JUGADOR QUE MARCÓ                     */
        /* ================================================= */

        const scoringPlayer =
            scoringTeam === 1
                ? this.player1
                : this.player2;


        this.lastScoringCharacterKey =
            this.getCharacterKey(
                scoringPlayer
            );


        console.log(
            "Jugador que marcó:",
            this.lastScoringCharacterKey
        );


        /* ================================================= */
        /* ACTUALIZAR MARCADOR                               */
        /* ================================================= */

        this.scoreboard.addGoal(
            scoringTeam
        );


        /* ================================================= */
        /* AUDIO DEL GOL                                     */
        /* ================================================= */

        if (window.AudioManager) {

            /*
             * Público y silbato se reproducen inmediatamente,
             * junto con la aparición visual del GOL.
             */

            AudioManager.playGoalCrowd();

            AudioManager.playReferee();
        }


        /* ================================================= */
        /* MOSTRAR CELEBRACIÓN                               */
        /* ================================================= */

        this.showGoalMessage(
            scoringTeam
        );


        /* ================================================= */
        /* PAUSAR PARTIDO                                    */
        /* ================================================= */

        this.goalPause = true;

        this.goalPauseTimer = 1.5;
    }



    /* ===================================================== */
    /* MENSAJE DE GOL                                        */
    /* ===================================================== */

    showGoalMessage(scoringTeam) {

        const message =
            document.getElementById(
                "goalMessage"
            );


        const text =
            document.getElementById(
                "goalMessageText"
            );


        if (!message || !text) {
            return;
        }


        text.textContent =
            "¡GOL!";


        if (
            this.goalMessageTimeout
        ) {

            clearTimeout(
                this.goalMessageTimeout
            );
        }


        message.classList.remove(
            "hidden"
        );


        message.classList.add(
            "visible"
        );


        message.style.display =
            "flex";


        message.style.visibility =
            "visible";


        message.style.opacity =
            "1";


        this.goalMessageTimeout =
            setTimeout(() => {

                message.classList.remove(
                    "visible"
                );


                message.style.opacity =
                    "";


                message.style.visibility =
                    "";


                message.style.display =
                    "";


                this.goalMessageTimeout =
                    null;

            }, 1200);
    }



    /* ===================================================== */
    /* REINICIAR JUGADORES                                   */
    /* ===================================================== */

    resetPlayers() {

        if (this.player1) {

            this.player1.reset();
        }


        if (this.player2) {

            this.player2.reset();
        }
    }



    /* ===================================================== */
    /* FINALIZAR PARTIDO                                     */
    /* ===================================================== */

    finishMatch() {

        this.running = false;

        this.matchFinished = true;


        /* ================================================= */
        /* CANCELAR FRASE PENDIENTE                          */
        /* ================================================= */

        if (
            this.playerGoalLineTimeout
        ) {

            clearTimeout(
                this.playerGoalLineTimeout
            );

            this.playerGoalLineTimeout =
                null;
        }


        /* ================================================= */
        /* DETENER AMBIENTE DEL ESTADIO                      */
        /* ================================================= */

        if (window.AudioManager) {

            AudioManager.stopStadium();
        }


        /* ================================================= */
        /* OCULTAR MENSAJE DE GOL                            */
        /* ================================================= */

        const goalMessage =
            document.getElementById(
                "goalMessage"
            );


        if (goalMessage) {

            goalMessage.classList.remove(
                "visible"
            );

            goalMessage.style.display =
                "none";
        }


        /* ================================================= */
        /* ACTUALIZAR RESULTADO FINAL                        */
        /* ================================================= */

        this.scoreboard.showFinalScore();


        const gameScreen =
            document.getElementById(
                "gameScreen"
            );


        const endScreen =
            document.getElementById(
                "matchEndScreen"
            );


        if (gameScreen) {

            gameScreen.classList.remove(
                "hidden"
            );

            gameScreen.classList.add(
                "active"
            );

            gameScreen.style.display =
                "flex";
        }


        /* ================================================= */
        /* MOSTRAR PANTALLA FINAL                             */
        /* ================================================= */

        if (endScreen) {

            endScreen.classList.remove(
                "hidden"
            );

            endScreen.classList.add(
                "active"
            );

            endScreen.style.display =
                "flex";

            endScreen.style.visibility =
                "visible";

            endScreen.style.opacity =
                "1";
        }
    }



    /* ===================================================== */
    /* VOLVER AL MENÚ                                        */
    /* ===================================================== */

    returnToMenu() {

        this.running = false;

        this.matchFinished = true;


        /* ================================================= */
        /* DESACTIVAR IA                                     */
        /* ================================================= */

        if (this.ai) {

            this.ai.disable();
        }


        if (
            this.goalMessageTimeout
        ) {

            clearTimeout(
                this.goalMessageTimeout
            );

            this.goalMessageTimeout =
                null;
        }


        if (
            this.playerGoalLineTimeout
        ) {

            clearTimeout(
                this.playerGoalLineTimeout
            );

            this.playerGoalLineTimeout =
                null;
        }


        this.lastScoringCharacterKey =
            null;


        /* ================================================= */
        /* AUDIO                                             */
        /* ================================================= */

        if (window.AudioManager) {

            AudioManager.stopStadium();

            AudioManager.playMusic();
        }


        const gameScreen =
            document.getElementById(
                "gameScreen"
            );


        const matchSetupScreen =
            document.getElementById(
                "matchSetupScreen"
            );


        const endScreen =
            document.getElementById(
                "matchEndScreen"
            );


        const menuScreen =
            document.getElementById(
                "menuScreen"
            );


        /* ================================================= */
        /* OCULTAR PARTIDO                                    */
        /* ================================================= */

        if (gameScreen) {

            gameScreen.classList.remove(
                "active"
            );

            gameScreen.classList.add(
                "hidden"
            );

            gameScreen.style.display =
                "none";
        }


        /* ================================================= */
        /* OCULTAR FINAL                                      */
        /* ================================================= */

        if (endScreen) {

            endScreen.classList.remove(
                "active"
            );

            endScreen.classList.add(
                "hidden"
            );

            endScreen.style.display =
                "none";
        }


        /* ================================================= */
        /* MOSTRAR CONFIGURACIÓN                              */
        /* ================================================= */

        if (matchSetupScreen) {

            matchSetupScreen.classList.remove(
                "hidden"
            );

            matchSetupScreen.classList.add(
                "active"
            );

            matchSetupScreen.style.display =
                "flex";

            matchSetupScreen.scrollTop =
                0;
        }


        /* ================================================= */
        /* OCULTAR MENÚ                                       */
        /* ================================================= */

        if (menuScreen) {

            menuScreen.classList.remove(
                "active"
            );

            menuScreen.classList.add(
                "hidden"
            );

            menuScreen.style.display =
                "none";
        }
    }



    /* ===================================================== */
    /* DIBUJAR PARTIDO                                       */
    /* ===================================================== */

    render() {

        if (
            !this.ctx ||
            !this.stadium
        ) {

            return;
        }


        const ctx =
            this.ctx;


        /* ================================================= */
        /* ESCALA                                             */
        /* ================================================= */

        const scaleX =
            this.screenWidth /
            this.stadium.worldWidth;


        const scaleY =
            this.screenHeight /
            this.stadium.worldHeight;


        const scale =
            Math.max(
                scaleX,
                scaleY
            );


        const drawWidth =
            this.stadium.worldWidth *
            scale;


        const drawHeight =
            this.stadium.worldHeight *
            scale;


        const offsetX =
            (
                this.screenWidth -
                drawWidth
            ) / 2;


        const offsetY =
            (
                this.screenHeight -
                drawHeight
            ) / 2;


        /* ================================================= */
        /* LIMPIAR                                            */
        /* ================================================= */

        ctx.clearRect(
            0,
            0,
            this.screenWidth,
            this.screenHeight
        );


        ctx.save();


        /* ================================================= */
        /* TRANSFORMACIÓN                                    */
        /* ================================================= */

        ctx.translate(
            offsetX,
            offsetY
        );


        ctx.scale(
            scale,
            scale
        );


        /* ================================================= */
        /* ESTADIO                                            */
        /* ================================================= */

        this.stadium.draw();

        if (this.skyTraffic) {
            this.skyTraffic.draw();
        }

        if (this.stadiumFX) {
            this.stadiumFX.draw();
        }

        if (this.stadiumCrowd) {
            this.stadiumCrowd.draw();
        }


        /* ================================================= */
        /* JUGADORES                                          */
        /* ================================================= */

        if (this.player1) {

            this.player1.draw(
                ctx
            );
        }


        if (this.player2) {

            this.player2.draw(
                ctx
            );
        }
        
        /* ================================================= */
/* EFECTO DE MAREO                                   */
/* ================================================= */

if (this.dizzinessSystem) {

    if (this.player1) {
        this.dizzinessSystem.draw(
            ctx,
            this.player1
        );
    }

    if (this.player2) {
        this.dizzinessSystem.draw(
            ctx,
            this.player2
        );
    }
}

/* ================================================= */
/* EFECTO DE VIENTO DE PATADA                        */
/* ================================================= */

if (this.kickEffect) {
    this.kickEffect.draw(ctx);
}


        /* ================================================= */
        /* PELOTA                                             */
        /* ================================================= */

        if (this.ball) {

            this.ball.draw(
                ctx
            );
        }


        ctx.restore();
    }
}


/* ========================================================= */
/* EXPORTAR                                                  */
/* ========================================================= */

window.FootballGame =
    FootballGame;


/* ========================================================= */
/* INICIAR PARTIDO                                           */
/* ========================================================= */

window.startFootballGame =
function(matchData) {

    if (!matchData) {

        console.error(
            "No se recibió la configuración del partido."
        );

        return;
    }


    /*
     * Detener partida anterior.
     */

    if (
        window.currentFootballGame
    ) {

        window.currentFootballGame.running =
            false;
    }


    /*
     * Crear nueva partida.
     */

    window.currentFootballGame =
        new FootballGame(
            matchData
        );


    /*
     * Iniciar.
     */

    window.currentFootballGame.start();
};