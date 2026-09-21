/* ========================================================= */
/* BALL.JS                                                   */
/* Motor base de todas las pelotas                           */
/* Física, gravedad, rebotes, giro, patadas y registro       */
/* ========================================================= */

class Ball {

    constructor(options = {}) {

        /* =====================================================
           TIPO DE PELOTA
           ===================================================== */

        this.type =
            options.type ??
            "football";


        /*
         * Buscamos la configuración del tipo.
         *
         * Si todavía no existe una configuración específica,
         * utilizamos la configuración base del fútbol.
         */

        const typeConfig =
            Ball.getTypeConfig(this.type);


        /* =====================================================
           POSICIÓN
           ===================================================== */

        this.x =
            options.x ??
            768;


        this.spawnX =
            this.x;


        /*
         * La pelota comienza arriba.
         */

        this.spawnY =
            options.spawnY ??
            typeConfig.spawnY ??
            150;


        this.y =
            this.spawnY;


        /* =====================================================
           VELOCIDAD
           ===================================================== */

        this.vx = 0;

        this.vy = 0;


        /* =====================================================
           CONFIGURACIÓN FÍSICA
           ===================================================== */

        this.radius =
            options.radius ??
            typeConfig.radius ??
            18;


        this.gravity =
            options.gravity ??
            typeConfig.gravity ??
            1100;


        this.bounce =
            options.bounce ??
            typeConfig.bounce ??
            0.58;


        this.friction =
            options.friction ??
            typeConfig.friction ??
            0.985;


        this.rollingFriction =
            options.rollingFriction ??
            typeConfig.rollingFriction ??
            0.975;


        this.maxSpeed =
            options.maxSpeed ??
            typeConfig.maxSpeed ??
            700;


        this.groundY =
            options.groundY ??
            typeConfig.groundY ??
            540;


        /* =====================================================
           GIRO
           ===================================================== */

        this.rotation =
            options.rotation ??
            0;


        this.angularVelocity =
            options.angularVelocity ??
            0;


        this.maxAngularVelocity =
            options.maxAngularVelocity ??
            typeConfig.maxAngularVelocity ??
            18;


        this.kickSpin =
            options.kickSpin ??
            typeConfig.kickSpin ??
            0.045;


        this.bounceSpin =
            options.bounceSpin ??
            typeConfig.bounceSpin ??
            0.72;


        /* =====================================================
           PATADAS
           ===================================================== */

        this.kickPowerMultiplier =
            options.kickPowerMultiplier ??
            typeConfig.kickPowerMultiplier ??
            1;


        this.kickVerticalPower =
            options.kickVerticalPower ??
            typeConfig.kickVerticalPower ??
            430;


        /* =====================================================
           ESTADO
           ===================================================== */

        this.lastKickPlayer =
            null;


        this.isOnGround =
            false;


        /*
         * Sirve para detectar el primer contacto
         * con el suelo después de aparecer en el aire.
         */

        this.hasLanded =
            false;


        /*
         * Estado utilizado para la caída inicial.
         */

        this.spawnDrop =
            true;


        /* =====================================================
           CONFIGURACIÓN PERSONALIZADA
           ===================================================== */

        this.config =
            typeConfig;


        /*
         * Si el tipo de pelota tiene una función de
         * inicialización, la ejecutamos.
         */

        if (
            typeof this.config.init ===
            "function"
        ) {

            this.config.init.call(this);
        }
    }


    /* ===================================================== */
    /* ACTUALIZAR PELOTA                                     */
    /* ===================================================== */

    update(deltaTime, stadium) {

        /*
         * Evitamos valores extremos de deltaTime.
         */

        deltaTime =
            Math.min(
                deltaTime,
                0.033
            );


        /* =================================================
           GRAVEDAD
           ================================================= */

        this.vy +=
            this.gravity *
            deltaTime;


        /* =================================================
           MOVIMIENTO
           ================================================= */

        this.x +=
            this.vx *
            deltaTime;


        this.y +=
            this.vy *
            deltaTime;


        /* =================================================
           GIRO SEGÚN VELOCIDAD
           ================================================= */

        const targetAngularVelocity =
            this.vx /
            Math.max(
                this.radius,
                1
            );


        this.angularVelocity +=
            (
                targetAngularVelocity -
                this.angularVelocity
            ) *
            Math.min(
                10 *
                deltaTime,
                1
            );


        /*
         * Limitar giro.
         */

        this.angularVelocity =
            Math.max(
                -this.maxAngularVelocity,

                Math.min(
                    this.maxAngularVelocity,
                    this.angularVelocity
                )
            );


        /*
         * Aplicar giro.
         */

        this.rotation +=
            this.angularVelocity *
            deltaTime;


        /* =================================================
           SUELO
           ================================================= */

        const floor =
            stadium.groundY -
            this.radius;


        if (
            this.y >= floor
        ) {

            this.y =
                floor;


            /* =============================================
               REBOTE
               ============================================= */

            if (
                Math.abs(this.vy) >
                85
            ) {

                /*
                 * Guardamos la velocidad vertical
                 * ANTES de invertirla.
                 *
                 * Esta es la fuerza real del impacto
                 * contra el suelo.
                 */

                const impactSpeed =
                    Math.abs(this.vy);


                /*
                 * Calculamos la intensidad del sonido.
                 *
                 * 85  = impacto mínimo
                 * 1100 = impacto muy fuerte
                 *
                 * El volumen queda limitado entre 0.12 y 1.
                 */

                const normalizedImpact =
                    Math.min(
                        Math.max(
                            (
                                impactSpeed -
                                85
                            ) /
                            (
                                1100 -
                                85
                            ),
                            0
                        ),
                        1
                    );


                const bounceVolume =
                    0.12 +
                    (
                        normalizedImpact *
                        0.88
                    );


                /*
                 * Reproducir sonido del pique.
                 *
                 * AudioManager se encarga de elegir
                 * el sonido correspondiente al tipo
                 * de pelota.
                 */

                if (
                    window.AudioManager &&
                    typeof AudioManager.playBallBounce ===
                    "function"
                ) {

                    AudioManager.playBallBounce(
                        this.type,
                        bounceVolume
                    );
                }


                /*
                 * Rebote normal.
                 */

                this.vy *=
                    -this.bounce;


                /*
                 * Modificación del giro.
                 */

                this.angularVelocity =
                    (
                        this.angularVelocity *
                        0.72
                    ) +
                    (
                        this.vx /
                        Math.max(
                            this.radius,
                            1
                        ) *
                        0.28
                    );


                /*
                 * Limitar giro.
                 */

                this.angularVelocity =
                    Math.max(
                        -this.maxAngularVelocity,

                        Math.min(
                            this.maxAngularVelocity,
                            this.angularVelocity
                        )
                    );


                this.isOnGround =
                    false;


                this.hasLanded =
                    true;


                /* =========================================
                   COMPORTAMIENTO ESPECIAL
                   ========================================= */

                if (
                    typeof this.config.onGroundBounce ===
                    "function"
                ) {

                    this.config.onGroundBounce.call(
                        this
                    );
                }

            } else {

                /*
                 * La pelota ya no tiene suficiente energía
                 * vertical para seguir rebotando.
                 */

                this.vy =
                    0;


                this.isOnGround =
                    true;


                this.hasLanded =
                    true;
            }


            /* =============================================
               RODAMIENTO
               ============================================= */

            if (
                this.isOnGround
            ) {

                this.vx *=
                    this.rollingFriction;


                /*
                 * El giro pierde energía.
                 */

                this.angularVelocity *=
                    0.96;


                /*
                 * Evitar movimiento microscópico.
                 */

                if (
                    Math.abs(this.vx) <
                    4
                ) {

                    this.vx =
                        0;
                }


                if (
                    Math.abs(
                        this.angularVelocity
                    ) <
                    0.05
                ) {

                    this.angularVelocity =
                        0;
                }
            }

        } else {

            this.isOnGround =
                false;
        }


        /* =================================================
           TECHO / LÍMITE SUPERIOR
           ================================================= */

        if (
            this.y -
            this.radius <
            stadium.playTop
        ) {

            this.y =
                stadium.playTop +
                this.radius;


            if (
                this.vy <
                0
            ) {

                this.vy *=
                    -0.35;


                this.angularVelocity *=
                    0.82;


                /*
                 * Comportamiento especial de techo.
                 */

                if (
                    typeof this.config.onCeilingBounce ===
                    "function"
                ) {

                    this.config.onCeilingBounce.call(
                        this
                    );
                }
            }
        }


        /* =================================================
           PARED IZQUIERDA
           ================================================= */

        if (
            this.x -
            this.radius <
            stadium.leftLimit
        ) {

            this.x =
                stadium.leftLimit +
                this.radius;


            this.vx =
                Math.abs(
                    this.vx
                ) *
                0.72;


            this.angularVelocity *=
                -this.bounceSpin;


            /*
             * Comportamiento especial de pared.
             */

            if (
                typeof this.config.onWallBounce ===
                "function"
            ) {

                this.config.onWallBounce.call(
                    this,
                    "left"
                );
            }
        }


        /* =================================================
           PARED DERECHA
           ================================================= */

        if (
            this.x +
            this.radius >
            stadium.rightLimit
        ) {

            this.x =
                stadium.rightLimit -
                this.radius;


            this.vx =
                -Math.abs(
                    this.vx
                ) *
                0.72;


            this.angularVelocity *=
                -this.bounceSpin;


            /*
             * Comportamiento especial de pared.
             */

            if (
                typeof this.config.onWallBounce ===
                "function"
            ) {

                this.config.onWallBounce.call(
                    this,
                    "right"
                );
            }
        }


        /* =================================================
           LIMITAR VELOCIDAD TOTAL
           ================================================= */

        const speed =
            Math.sqrt(
                this.vx *
                this.vx +

                this.vy *
                this.vy
            );


        if (
            speed >
            this.maxSpeed
        ) {

            const factor =
                this.maxSpeed /
                speed;


            this.vx *=
                factor;


            this.vy *=
                factor;
        }


        /* =================================================
           LIMITAR GIRO
           ================================================= */

        this.angularVelocity =
            Math.max(
                -this.maxAngularVelocity,

                Math.min(
                    this.maxAngularVelocity,
                    this.angularVelocity
                )
            );
    }


    /* ===================================================== */
/* PATADA                                                 */
/* ===================================================== */

kick(
    directionX,
    directionY,
    power,
    player
) {

    /*
     * Normalizar dirección.
     */

    const length =
        Math.sqrt(
            directionX *
            directionX +

            directionY *
            directionY
        );


    if (
        length === 0
    ) {

        return;
    }


    const normalizedX =
        directionX /
        length;


    const normalizedY =
        directionY /
        length;


    /* =================================================
       FUERZA DE LA PELOTA
       ================================================= */

    const finalPower =
        power *
        this.kickPowerMultiplier;


    /* =================================================
       SONIDO DEL GOLPE
       ================================================= */

    /*
     * El volumen depende ligeramente de la fuerza
     * final de la patada.
     */

    const kickSoundVolume =
        Math.max(
            0.60,

            Math.min(
                1.00,

                0.60 +
                (
                    finalPower /
                    1000
                ) *
                0.40
            )
        );


    if (
        window.AudioManager &&
        typeof AudioManager.playBallKick ===
        "function"
    ) {

        AudioManager.playBallKick(
            kickSoundVolume
        );

    }


    /* =================================================
       IMPULSO HORIZONTAL
       ================================================= */

    this.vx =
        normalizedX *
        finalPower;


    /* =================================================
       IMPULSO VERTICAL
       ================================================= */

    this.vy =
        -this.kickVerticalPower;


    /* =================================================
       ESTADO
       ================================================= */

    this.isOnGround =
        false;


    this.hasLanded =
        false;


    this.spawnDrop =
        false;


    this.lastKickPlayer =
        player;


    /* =================================================
       GIRO DE LA PATADA
       ================================================= */

    const kickSpinAmount =
        normalizedX *
        finalPower *
        this.kickSpin;


    this.angularVelocity =
        (
            this.angularVelocity *
            0.35
        ) +
        kickSpinAmount;


    /*
     * Limitar giro.
     */

    this.angularVelocity =
        Math.max(
            -this.maxAngularVelocity,

            Math.min(
                this.maxAngularVelocity,
                this.angularVelocity
            )
        );


    /* =================================================
       COMPORTAMIENTO ESPECIAL DE PATADA
       ================================================= */

    if (
        typeof this.config.onKick ===
        "function"
    ) {

        this.config.onKick.call(
            this,
            normalizedX,
            normalizedY,
            finalPower,
            player
        );

    }

}


    /* ===================================================== */
    /* REINICIAR                                               */
    /* ===================================================== */

    reset() {

        this.x =
            this.spawnX;


        this.y =
            this.spawnY;


        this.vx =
            0;


        this.vy =
            0;


        this.rotation =
            0;


        this.angularVelocity =
            0;


        this.isOnGround =
            false;


        this.hasLanded =
            false;


        this.spawnDrop =
            true;


        this.lastKickPlayer =
            null;
    }


    /* ===================================================== */
    /* DIBUJAR                                                 */
    /* ===================================================== */

    draw(ctx) {

        /*
         * Si la pelota tiene su propio sistema de dibujo,
         * utilizamos ese sistema.
         */

        if (
    typeof this.config.draw ===
    "function"
) {

    this.config.draw.call(
        this,
        ctx
    );

    return;
}


        /*
         * Dibujo clásico.
         */

        this.drawFootball(
    ctx
);
    }


  /* ===================================================== */
/* DIBUJAR FÚTBOL                                         */
/* ===================================================== */

drawFootball(ctx) {

    /*
     * Altura real de la pelota respecto al suelo.
     */

    const ground =
        this.groundY -
        this.radius;


    const height =
        Math.max(
            0,
            ground -
            this.y
        );


    /*
     * La sombra se hace más pequeña
     * cuando la pelota está en el aire.
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

    ctx.globalAlpha =
        Math.max(
            0.12,
            0.3 -
            height / 1800
        );

    ctx.fillStyle =
        "#000000";

    ctx.beginPath();

    ctx.ellipse(

    this.x,

    ground,

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
            this.radius *
            0.34,
            5
        );


        /* =================================================
           PANELES EXTERIORES
           ================================================= */

        const panelDistance =
            this.radius *
            0.64;


        const panelSize =
            this.radius *
            0.22;


        const panelAngles = [

            0,

            Math.PI *
            0.4,

            Math.PI *
            0.8,

            Math.PI *
            1.2,

            Math.PI *
            1.6

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

            -this.radius *
            0.3,

            -this.radius *
            0.32,

            this.radius *
            0.17,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            "rgba(255,255,255,0.55)";


        ctx.fill();


        ctx.restore();
    }


    /* ===================================================== */
    /* DIBUJAR PANEL                                           */
    /* ===================================================== */

    drawPanel(
        ctx,
        x,
        y,
        size,
        sides = 5
    ) {

        ctx.save();


        ctx.translate(
            x,
            y
        );


        /*
         * Pequeño giro propio del panel.
         */

        ctx.rotate(
            Math.PI /
            5
        );


        ctx.beginPath();


        for (
            let i = 0;
            i < sides;
            i++
        ) {

            const angle =
                (
                    Math.PI *
                    2 *
                    i
                ) /
                sides;


            const px =
                Math.cos(angle) *
                size;


            const py =
                Math.sin(angle) *
                size;


            if (
                i === 0
            ) {

                ctx.moveTo(
                    px,
                    py
                );

            } else {

                ctx.lineTo(
                    px,
                    py
                );
            }
        }


        ctx.closePath();


        ctx.fillStyle =
            "#24292f";


        ctx.fill();


        ctx.restore();
    }


    /* ===================================================== */
    /* REGISTRO DE TIPOS                                      */
    /* ===================================================== */

    static registerType(
        name,
        config = {}
    ) {

        if (
            !name ||
            typeof name !==
            "string"
        ) {

            return;
        }


        Ball.types[name] = {
            ...Ball.defaultTypeConfig,
            ...config
        };
    }


    /* ===================================================== */
    /* OBTENER CONFIGURACIÓN                                  */
    /* ===================================================== */

    static getTypeConfig(
        name
    ) {

        return (
            Ball.types[name] ??
            Ball.defaultTypeConfig
        );
    }


    /* ===================================================== */
    /* OBTENER TIPOS DISPONIBLES                              */
    /* ===================================================== */

    static getAvailableTypes() {

        return Object.keys(
            Ball.types
        );
    }


    /* ===================================================== */
    /* OBTENER PELOTA ALEATORIA                               */
    /* ===================================================== */

    static getRandomType(
        currentType = null
    ) {

        const types =
            Ball.getAvailableTypes();


        if (
            types.length === 0
        ) {

            return "football";
        }


        /*
         * Si solamente existe un tipo,
         * devolvemos ese.
         */

        if (
            types.length === 1
        ) {

            return types[0];
        }


        /*
         * Filtrar la pelota actual para evitar
         * que aparezca la misma consecutivamente.
         */

        const availableTypes =
            types.filter(
                type =>
                    type !==
                    currentType
            );


        const pool =
            availableTypes.length > 0
                ? availableTypes
                : types;


        const randomIndex =
            Math.floor(
                Math.random() *
                pool.length
            );


        return pool[randomIndex];
    }
}


/* ========================================================= */
/* CONFIGURACIÓN BASE                                        */
/* ========================================================= */

Ball.defaultTypeConfig = {

    radius: 18,

    gravity: 1100,

    bounce: 0.58,

    friction: 0.985,

    rollingFriction: 0.975,

    maxSpeed: 700,

    groundY: 540,

    maxAngularVelocity: 18,

    kickSpin: 0.045,

    bounceSpin: 0.72,

    kickPowerMultiplier: 1,

    kickVerticalPower: 430,

    spawnY: 150
};


/*
 * Registro de tipos.
 *
 * El fútbol queda disponible desde el principio.
 */

Ball.types = {

    football:
        Ball.defaultTypeConfig
};


/* ========================================================= */
/* DEBUG - COORDENADAS DE LA PELOTA                          */
/* ========================================================= */

Ball.prototype.drawDebugPosition = function(ctx) {

    ctx.save();


    /*
     * Punto exacto del centro de la pelota.
     */

    ctx.fillStyle =
        "#ff0000";


    ctx.beginPath();


    ctx.arc(
        this.x,
        this.y,
        5,
        0,
        Math.PI * 2
    );


    ctx.fill();


    /*
     * Coordenadas.
     */

    ctx.fillStyle =
        "#ffffff";


    ctx.font =
        "bold 18px Arial";


    ctx.textAlign =
        "center";


    ctx.fillText(
        `X: ${Math.round(this.x)}  Y: ${Math.round(this.y)}`,
        this.x,
        this.y - this.radius - 15
    );


    ctx.restore();
};


/* ========================================================= */
/* EXPORTAR                                                  */
/* ========================================================= */

window.Ball = Ball;