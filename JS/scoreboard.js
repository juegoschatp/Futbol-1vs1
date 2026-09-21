/* ========================================================= */
/* SCOREBOARD.JS                                             */
/* Marcador, equipos y cronómetro del partido                */
/* ========================================================= */

class Scoreboard {

    constructor() {

        /* ================================================= */
        /* ELEMENTOS DEL MARCADOR                             */
        /* ================================================= */

        this.team1ScoreElement =
            document.getElementById("team1Score");

        this.team2ScoreElement =
            document.getElementById("team2Score");

        this.team1NameElement =
            document.getElementById("team1Name");

        this.team2NameElement =
            document.getElementById("team2Name");

        this.timeElement =
            document.getElementById("matchTime");


        /* ================================================= */
        /* ELEMENTOS DE PANTALLA FINAL                        */
        /* ================================================= */

        this.finalTeam1Name =
            document.getElementById("finalTeam1Name");

        this.finalTeam2Name =
            document.getElementById("finalTeam2Name");

        this.finalScore =
            document.getElementById("finalScore");


        /* ================================================= */
        /* RESULTADO                                          */
        /* ================================================= */

        this.team1Score = 0;
        this.team2Score = 0;


        /* ================================================= */
        /* CRONÓMETRO                                         */
        /* ================================================= */

        this.remainingTime = 120;

        this.timerWarning = false;


        /*
         * Preparar el elemento visual.
         */
        this.setupTimerElement();
    }


    /* ===================================================== */
    /* PREPARAR CRONÓMETRO                                   */
    /* ================================================= */

    setupTimerElement() {

        if (!this.timeElement) {

            console.warn(
                "No se encontró #matchTime en index.html."
            );

            return;
        }


        /*
         * Clase base utilizada por HUD.CSS.
         */
        this.timeElement.classList.add(
            "match-time"
        );


        /*
         * Limpiar cualquier estado anterior.
         */
        this.timeElement.classList.remove(
            "urgent",
            "timer-warning",
            "timer-danger"
        );
    }


    /* ===================================================== */
    /* CONFIGURAR EQUIPOS                                    */
    /* ================================================= */

    setTeams(team1, team2) {

        this.team1 = team1;
        this.team2 = team2;


        /* ================================================= */
        /* NOMBRE EQUIPO 1                                   */
        /* ================================================= */

        if (this.team1NameElement) {

            this.team1NameElement.textContent =
                this.shortName(team1.name);
        }


        /* ================================================= */
        /* NOMBRE EQUIPO 2                                   */
        /* ================================================= */

        if (this.team2NameElement) {

            this.team2NameElement.textContent =
                this.shortName(team2.name);
        }


        /* ================================================= */
        /* PANTALLA FINAL                                     */
        /* ================================================= */

        if (this.finalTeam1Name) {

            this.finalTeam1Name.textContent =
                this.shortName(team1.name);
        }


        if (this.finalTeam2Name) {

            this.finalTeam2Name.textContent =
                this.shortName(team2.name);
        }
    }


    /* ===================================================== */
    /* CONFIGURAR DURACIÓN                                   */
    /* ===================================================== */

    setDuration(seconds) {

        const duration =
            Number(seconds);


        /*
         * Validar duración.
         *
         * 60  = 1 minuto
         * 120 = 2 minutos
         * 180 = 3 minutos
         */

        if (
            !Number.isFinite(duration) ||
            duration <= 0
        ) {

            this.remainingTime = 120;

        } else {

            this.remainingTime = duration;
        }


        /*
         * Reiniciar estado visual.
         */

        this.timerWarning = false;


        if (this.timeElement) {

            this.timeElement.classList.remove(
                "urgent",
                "timer-warning",
                "timer-danger"
            );
        }


        /*
         * Mostrar inmediatamente
         * la duración seleccionada.
         */

        this.updateTime();
    }


    /* ===================================================== */
    /* NOMBRE CORTO                                          */
    /* ===================================================== */

    shortName(name) {

        if (!name) {
            return "---";
        }


        return name
            .substring(0, 3)
            .toUpperCase();
    }


    /* ===================================================== */
    /* AGREGAR GOL                                           */
    /* ===================================================== */

    addGoal(teamNumber) {

        if (teamNumber === 1) {

            this.team1Score++;
        }


        if (teamNumber === 2) {

            this.team2Score++;
        }


        this.updateScore();
    }


    /* ===================================================== */
    /* ACTUALIZAR MARCADOR                                   */
    /* ===================================================== */

    updateScore() {

        if (this.team1ScoreElement) {

            this.team1ScoreElement.textContent =
                this.team1Score;
        }


        if (this.team2ScoreElement) {

            this.team2ScoreElement.textContent =
                this.team2Score;
        }
    }


    /* ===================================================== */
    /* ACTUALIZAR TEXTO DEL TIEMPO                           */
    /* ===================================================== */

    updateTime() {

        if (!this.timeElement) {
            return;
        }


        /*
         * Nunca permitir números negativos.
         */

        const seconds =
            Math.max(
                0,
                Math.ceil(this.remainingTime)
            );


        const minutes =
            Math.floor(
                seconds / 60
            );


        const remainingSeconds =
            seconds % 60;


        /* ================================================= */
        /* MOSTRAR TIEMPO                                     */
        /* ================================================= */

        this.timeElement.textContent =
            `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;


        /* ================================================= */
        /* ESTADO NORMAL                                      */
        /* ================================================= */

        if (seconds > 10) {

            this.timerWarning = false;

            this.timeElement.classList.remove(
                "urgent"
            );

            this.timeElement.classList.remove(
                "timer-warning"
            );

            this.timeElement.classList.remove(
                "timer-danger"
            );

            return;
        }


        /* ================================================= */
        /* ÚLTIMOS 10 SEGUNDOS                                */
        /* ================================================= */

        if (
            seconds <= 10 &&
            seconds > 0
        ) {

            this.timerWarning = true;

            this.timeElement.classList.add(
                "urgent"
            );

            this.timeElement.classList.add(
                "timer-warning"
            );

            this.timeElement.classList.remove(
                "timer-danger"
            );

            return;
        }


        /* ================================================= */
        /* 00:00                                              */
        /* ================================================= */

        if (seconds === 0) {

            this.timerWarning = true;

            this.timeElement.classList.remove(
                "urgent"
            );

            this.timeElement.classList.add(
                "timer-danger"
            );
        }
    }


    /* ===================================================== */
    /* ACTUALIZAR CRONÓMETRO                                 */
    /* ===================================================== */

    update(deltaTime) {

        /*
         * Ignorar valores inválidos.
         */

        if (
            !Number.isFinite(deltaTime) ||
            deltaTime <= 0
        ) {

            return (
                this.remainingTime <= 0
            );
        }


        /*
         * Restar el tiempo real transcurrido.
         */

        this.remainingTime -=
            deltaTime;


        /*
         * Nunca permitir números negativos.
         */

        if (
            this.remainingTime < 0
        ) {

            this.remainingTime = 0;
        }


        /*
         * Actualizar visualmente
         * el cronómetro.
         */

        this.updateTime();


        /*
         * Informar a game.js
         * cuando llegue a cero.
         */

        return (
            this.remainingTime <= 0
        );
    }


    /* ===================================================== */
    /* MOSTRAR RESULTADO FINAL                               */
    /* ===================================================== */

    showFinalScore() {

        if (!this.finalScore) {
            return;
        }


        this.finalScore.textContent =
            `${this.team1Score} - ${this.team2Score}`;
    }

}


/* ========================================================= */
/* EXPORTAR                                                  */
/* ========================================================= */

window.Scoreboard =
    Scoreboard;