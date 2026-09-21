/* ========================================================= */
/* AUDIO.JS                                                  */
/* Sistema central de sonidos de Fútbol 1 VS 1              */
/* ========================================================= */

"use strict";


class FootballAudioManager {

    constructor() {

        this.basePath =
            "ASSETS/sounds/";


        /* ================================================= */
        /* MÚSICA                                            */
        /* ================================================= */

        this.music =
            this.createAudio(
                "musica.mp3",
                0.25,
                true
            );


        /* ================================================= */
        /* AMBIENTE DEL ESTADIO                              */
        /* ================================================= */

        this.stadium =
            this.createAudio(
                "fondo.mp3",
                0.35,
                true
            );


        /* ================================================= */
        /* ÁRBITRO                                           */
        /* ================================================= */

        this.referee =
            this.createAudio(
                "arbitro.mp3",
                0.55,
                false
            );


        /* ================================================= */
        /* BOTONES                                            */
        /* ================================================= */

        this.button =
            this.createAudio(
                "buttons.mp3",
                1.00,
                false
            );


        /* ================================================= */
        /* SONIDOS DE GOL                                     */
        /* ================================================= */

        this.goalCrowdSounds = [

            this.createAudio(
                "goalGente.mp3",
                0.30,
                false
            ),

            this.createAudio(
                "golGod.mp3",
                0.10,
                false
            )

        ];


        /* ================================================= */
        /* GOLPE A LA PELOTA                                  */
        /* ================================================= */

        this.ballKick =
            this.createAudio(
                "pelotas/golpe.mp3",
                0.75,
                false
            );


        this.ballKickBaseVolume =
            0.75;


        /* ================================================= */
        /* SONIDOS DE PIQUE DE PELOTA                        */
        /* ================================================= */

        this.ballBounceSounds = {

            football:
                this.createAudio(
                    "pelotas/footballyrugby.mp3",
                    0.70,
                    false
                ),


            rugby:
                this.createAudio(
                    "pelotas/footballyrugby.mp3",
                    0.70,
                    false
                ),


            basketball:
                this.createAudio(
                    "pelotas/basquet.mp3",
                    0.70,
                    false
                ),


            tennis:
                this.createAudio(
                    "pelotas/tennis.mp3",
                    0.70,
                    false
                ),


            beach:
                this.createAudio(
                    "pelotas/beach.mp3",
                    0.70,
                    false
                )

        };


        this.ballBounceBaseVolume =
            0.70;


        /* ================================================= */
        /* TRAVESAÑO                                          */
        /* ================================================= */

        /*
         * Sonido principal del impacto contra el
         * travesaño.
         *
         * Este sonido se reproduce SIEMPRE que
         * la pelota golpea el travesaño.
         */

        this.crossbar =
            this.createAudio(
                "travesaño1.mp3",
                1.00,
                false
            );


        /*
         * Grito / sonido exagerado del travesaño.
         *
         * Este se reproduce solamente algunas veces.
         */

        this.crossbarGrito =
            this.createAudio(
                "travesañoGrito.mp3",
                0.95,
                false
            );


        /*
         * Probabilidad del sonido exagerado.
         *
         * 0.25 = 25%
         */

        this.crossbarGritoChance =
            0.25;


        /* ================================================= */
        /* FRASES DE JUGADORES                               */
        /* ================================================= */

        this.playerGoalLines = {

            messi: [

                this.createAudio(
                    "jugadores/messi.mp3",
                    1.00,
                    false
                ),

                this.createAudio(
                    "jugadores/messigol.mp3",
                    1.00,
                    false
                )

            ],


            neymar: [

                this.createAudio(
                    "jugadores/neymar.mp3",
                    1.00,
                    false
                ),

                this.createAudio(
                    "jugadores/neymargol.mp3",
                    1.00,
                    false
                )

            ],


            mbappe: [

                this.createAudio(
                    "jugadores/mbappe.mp3",
                    0.90,
                    false
                ),

                this.createAudio(
                    "jugadores/mbappegol.mp3",
                    0.90,
                    false
                )

            ],


            pedri: [

                this.createAudio(
                    "jugadores/pedri.mp3",
                    0.60,
                    false
                ),

                this.createAudio(
                    "jugadores/pedrigol.mp3",
                    0.60,
                    false
                )

            ]

        };


        /* ================================================= */
        /* AMPLIFICACIÓN DE VOCES                            */
        /* ================================================= */

        this.playerVoiceGain =
            1.00;


        this.playerVoiceAudioContext =
            null;


        this.playerVoiceGainNodes =
            new Map();


        this.setupPlayerVoiceGain();


        /* ================================================= */
        /* ESTADO                                             */
        /* ================================================= */

        this.currentPlayerLine =
            null;


        this.lastGoalCrowdIndex =
            -1;


        this.lastPlayerLineIndex =
            {};


        /* ================================================= */
        /* ESTADO DE AUDIO                                   */
        /* ================================================= */

        this.audioUnlocked =
            false;

    }


    /* ===================================================== */
    /* CREAR AUDIO                                           */
    /* ===================================================== */

    createAudio(
        file,
        volume = 1,
        loop = false
    ) {

        const audio =
            new Audio(
                this.basePath + file
            );


        audio.volume =
            volume;


        audio.loop =
            loop;


        audio.preload =
            "auto";


        return audio;
    }


    /* ===================================================== */
    /* PREPARAR AMPLIFICACIÓN DE VOCES                      */
    /* ===================================================== */

    setupPlayerVoiceGain() {

        try {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;


            if (!AudioContextClass) {

                console.warn(
                    "Web Audio API no está disponible. Las voces usarán volumen normal."
                );

                return;
            }


            this.playerVoiceAudioContext =
                new AudioContextClass();


            Object.values(
                this.playerGoalLines
            ).forEach(lines => {

                lines.forEach(audio => {

                    try {

                        const source =
                            this.playerVoiceAudioContext.createMediaElementSource(
                                audio
                            );


                        const gainNode =
                            this.playerVoiceAudioContext.createGain();


                        gainNode.gain.value =
                            this.playerVoiceGain;


                        source.connect(
                            gainNode
                        );


                        gainNode.connect(
                            this.playerVoiceAudioContext.destination
                        );


                        this.playerVoiceGainNodes.set(
                            audio,
                            gainNode
                        );

                    } catch (error) {

                        console.warn(
                            "No se pudo amplificar una voz del jugador:",
                            error
                        );

                    }

                });

            });

        } catch (error) {

            console.warn(
                "No se pudo inicializar la amplificación de voces:",
                error
            );

        }

    }


    /* ===================================================== */
    /* ACTIVAR AUDIO DE VOCES                                */
    /* ===================================================== */

    resumePlayerVoiceAudio() {

        if (
            !this.playerVoiceAudioContext
        ) {

            return;
        }


        if (
            this.playerVoiceAudioContext.state ===
            "suspended"
        ) {

            this.playerVoiceAudioContext
                .resume()
                .catch(() => {});

        }

    }


    /* ===================================================== */
    /* REPRODUCIR                                            */
    /* ===================================================== */

    play(audio) {

        if (!audio) {
            return;
        }


        try {

            if (this.audioUnlocked) {
                this.resumePlayerVoiceAudio();
            }


            audio.currentTime =
                0;


            const promise =
                audio.play();


            if (
                promise &&
                typeof promise.catch ===
                "function"
            ) {

                promise.catch(() => {});

            }

        } catch (error) {

            console.warn(
                "No se pudo reproducir el sonido:",
                error
            );

        }

    }


    /* ===================================================== */
    /* REPRODUCIR CON VOLUMEN                                */
    /* ===================================================== */

    playAtVolume(
        audio,
        volume,
        restoreVolume
    ) {

        if (!audio) {
            return;
        }


        let finalVolume =
            Number(volume);


        if (
            !Number.isFinite(
                finalVolume
            )
        ) {

            finalVolume =
                restoreVolume ??
                1;

        }


        finalVolume =
            Math.max(
                0,
                Math.min(
                    1,
                    finalVolume
                )
            );


        audio.volume =
            finalVolume;


        this.play(
            audio
        );


        if (
            restoreVolume !==
            undefined
        ) {

            audio.onended =
                () => {

                    audio.volume =
                        restoreVolume;

                };

        }

    }


    /* ===================================================== */
    /* DETENER                                               */
    /* ===================================================== */

    stop(audio) {

        if (!audio) {
            return;
        }


        audio.pause();


        audio.currentTime =
            0;

    }


    /* ===================================================== */
    /* MÚSICA                                                */
    /* ===================================================== */

    playMusic() {

        if (!this.music) {
            return;
        }


        if (!this.music.paused) {
            return;
        }


        const promise =
            this.music.play();


        if (
            promise &&
            typeof promise.catch === "function"
        ) {

            promise.catch(() => {});

        }

    }


    /* ===================================================== */
    /* DESBLOQUEAR AUDIO                                    */
    /* ===================================================== */

    unlock() {

        if (this.audioUnlocked) {

            this.resumePlayerVoiceAudio();
            this.playMusic();

            return;
        }


        this.audioUnlocked =
            true;


        /*
           Esta función debe ejecutarse dentro de una interacción
           real del usuario (pointerdown/click). Así el navegador
           permite iniciar la música y el resto de sonidos.
        */

        this.resumePlayerVoiceAudio();
        this.playMusic();

    }


    stopMusic() {

        this.stop(
            this.music
        );

    }


    /* ===================================================== */
    /* AMBIENTE DEL ESTADIO                                  */
    /* ===================================================== */

    playStadium() {

        if (
            !this.stadium.paused
        ) {

            return;
        }


        this.stadium.play().catch(() => {});

    }


    stopStadium() {

        this.stop(
            this.stadium
        );

    }


    /* ===================================================== */
    /* BOTÓN                                                 */
    /* ===================================================== */

    playButton() {

        this.play(
            this.button
        );

    }


    /* ===================================================== */
    /* ÁRBITRO                                               */
    /* ===================================================== */

    playReferee() {

        this.play(
            this.referee
        );

    }


    /* ===================================================== */
    /* PÚBLICO DEL GOL                                       */
    /* ===================================================== */

    playGoalCrowd() {

        if (
            this.goalCrowdSounds.length === 0
        ) {

            return;
        }


        let index;


        if (
            this.goalCrowdSounds.length === 1
        ) {

            index =
                0;

        } else {

            do {

                index =
                    Math.floor(
                        Math.random() *
                        this.goalCrowdSounds.length
                    );

            } while (
                index ===
                this.lastGoalCrowdIndex
            );

        }


        this.lastGoalCrowdIndex =
            index;


        this.play(
            this.goalCrowdSounds[index]
        );

    }


    /* ===================================================== */
    /* GOLPE / PATADA A LA PELOTA                           */
    /* ===================================================== */

    playBallKick(
        volume = 0.75
    ) {

        this.playAtVolume(
            this.ballKick,
            volume,
            this.ballKickBaseVolume
        );

    }


    /* ===================================================== */
    /* PIQUE DE PELOTA                                      */
    /* ===================================================== */

    playBallBounce(
        ballType,
        volume = 0.70
    ) {

        if (!ballType) {

            ballType =
                "football";

        }


        const normalizedType =
            String(
                ballType
            ).toLowerCase();


        let soundType =
            normalizedType;


        if (
            normalizedType ===
            "beachball"
        ) {

            soundType =
                "beach";

        }


        if (
            normalizedType ===
            "beach_ball"
        ) {

            soundType =
                "beach";

        }


        if (
            normalizedType ===
            "rugbyball"
        ) {

            soundType =
                "rugby";

        }


        let bounceSound =
            this.ballBounceSounds[
                soundType
            ];


        if (!bounceSound) {

            bounceSound =
                this.ballBounceSounds.football;

        }


        if (!bounceSound) {
            return;
        }


        let finalVolume =
            Number(volume);


        if (
            !Number.isFinite(
                finalVolume
            )
        ) {

            finalVolume =
                this.ballBounceBaseVolume;

        }


        finalVolume =
            Math.max(
                0,
                Math.min(
                    1,
                    finalVolume
                )
            );


        this.playAtVolume(
            bounceSound,
            finalVolume,
            this.ballBounceBaseVolume
        );

    }


    /* ===================================================== */
    /* TRAVESAÑO                                             */
    /* ===================================================== */

    playCrossbar() {

        /*
         * Sonido principal:
         * SIEMPRE se reproduce.
         */

        this.play(
            this.crossbar
        );


        /*
         * Sonido exagerado:
         * solamente algunas veces.
         */

        if (
            Math.random() <
            this.crossbarGritoChance
        ) {

            this.play(
                this.crossbarGrito
            );

        }

    }


    /* ===================================================== */
    /* FRASE DEL JUGADOR                                    */
    /* ===================================================== */

    playPlayerGoalLine(
        characterKey
    ) {

        const lines =
            this.playerGoalLines[
                characterKey
            ];


        if (
            !lines ||
            lines.length === 0
        ) {

            console.warn(
                `No existen frases para: ${characterKey}`
            );

            return;
        }


        this.resumePlayerVoiceAudio();


        let index;


        if (
            lines.length === 1
        ) {

            index =
                0;

        } else {

            const lastIndex =
                this.lastPlayerLineIndex[
                    characterKey
                ];


            do {

                index =
                    Math.floor(
                        Math.random() *
                        lines.length
                    );

            } while (
                index ===
                lastIndex
            );

        }


        this.lastPlayerLineIndex[
            characterKey
        ] =
            index;


        if (
            this.currentPlayerLine &&
            !this.currentPlayerLine.paused
        ) {

            this.stop(
                this.currentPlayerLine
            );

        }


        this.currentPlayerLine =
            lines[index];


        this.play(
            this.currentPlayerLine
        );

    }

}


/* ========================================================= */
/* INSTANCIA GLOBAL                                          */
/* ========================================================= */

window.AudioManager =
    new FootballAudioManager();