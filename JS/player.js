/* ========================================================= */
/* PLAYER.JS                                                 */
/* Jugadores, movimiento arcade, salto, mareo y             */
/* representación visual                                    */
/* ========================================================= */

class Player {

    constructor(options = {}) {

        this.id = options.id || 1;
        this.name = options.name || "Jugador";

        this.x = options.x ?? 400;
        this.y = options.y ?? 601;

        this.spawnX = this.x;
        this.spawnY = this.y;


        /* ================================================= */
        /* TAMAÑO FÍSICO                                     */
        /* ================================================= */

        this.radius = 45;


        /* ================================================= */
        /* MOVIMIENTO ARCADE                                 */
        /* ================================================= */

        this.vx = 0;
        this.vy = 0;

        this.speed = 330;

        this.acceleration = 2200;

        this.friction = 1900;


        /* ================================================= */
        /* SALTO                                             */
        /* ================================================= */

        this.jumpStrength = 610;
        this.gravity = 1500;

        this.onGround = false;


        /* ================================================= */
        /* EQUIPO                                            */
        /* ================================================= */

        this.primaryColor =
            options.primaryColor || "#75c9e8";

        this.secondaryColor =
            options.secondaryColor || "#ffffff";


        /* ================================================= */
        /* EQUIPO / PERSONAJE                                */
        /* ================================================= */

        this.teamName =
            options.teamName ||
            options.teamId ||
            (
                options.team &&
                (
                    options.team.name ||
                    options.team.id ||
                    options.team.key
                )
            ) ||
            "";


        this.characterKey =
            this.getCharacterKey(
                this.teamName
            );


        /* ================================================= */
        /* DIRECCIÓN                                         */
        /* ================================================= */

        this.facing =
            this.id === 1
                ? 1
                : -1;


        /* ================================================= */
        /* PATADA                                            */
        /* ================================================= */

        this.kickCooldown = 0;


        /* ================================================= */
        /* MAREO                                             */
        /* ================================================= */

        /*
         * isDizzy:
         * Indica si el jugador está actualmente mareado.
         *
         * dizzyTimer:
         * Tiempo restante del estado de mareo.
         *
         * La duración normal será de 5 segundos.
         */

        this.isDizzy = false;
        this.dizzyTimer = 0;
        this.dizzyDuration = 5;


        /* ================================================= */
        /* RESPIRACIÓN                                       */
        /* ================================================= */

        this.breathTime =
            Math.random() *
            Math.PI *
            2;

        this.breathSpeed = 2.2;

        this.breathAmount = 0.025;


        /* ================================================= */
        /* IMÁGENES                                          */
        /* ================================================= */

        this.characterImages = {

            right:
                this.loadImage(
                    `ASSETS/jugadores/${this.characterKey}derecha.png`
                ),

            rightKick:
                this.loadImage(
                    `ASSETS/jugadores/${this.characterKey}derechalop.png`
                ),

            left:
                this.loadImage(
                    `ASSETS/jugadores/${this.characterKey}izquierda.png`
                ),

            leftKick:
                this.loadImage(
                    `ASSETS/jugadores/${this.characterKey}izquierdalop.png`
                ),

            jumpRight:
                this.loadImage(
                    `ASSETS/jugadores/${this.characterKey}saltod.png`
                ),

            jumpLeft:
                this.loadImage(
                    `ASSETS/jugadores/${this.characterKey}saltoi.png`
                ),

            /*
             * ESTADO MAREADO
             *
             * d = derecha
             * i = izquierda
             *
             * Ejemplo:
             * mbapedownd.png
             * mbapedowni.png
             */

            dizzyRight:
                this.loadImage(
                    `ASSETS/jugadores/${this.characterKey}downd.png`
                ),

            dizzyLeft:
                this.loadImage(
                    `ASSETS/jugadores/${this.characterKey}downi.png`
                )
        };


        /* ================================================= */
        /* TAMAÑO VISUAL                                     */
        /* ================================================= */

        this.visualHeight = 120;

/* ================================================= */
/* TAMAÑO VISUAL DEL MAREO                           */
/* ================================================= */

/*
 * Las imágenes de mareo son más grandes visualmente
 * que las normales, por eso tienen su propia escala.
 */
this.dizzyVisualHeight = 100;

/*
 * Desplazamiento vertical del sprite mareado.
 * Un valor positivo baja la imagen.
 */
this.dizzyVisualYOffset = 8;


        /* ================================================= */
        /* HITBOX VISUAL                                     */
        /* ================================================= */

        this.hitboxWidthFactor = 0.68;

        this.hitboxHeightFactor = 0.92;


        /* ================================================= */
        /* CÉSPED                                            */
        /* ================================================= */

        this.grassParticles = [];

        this.grassStepDistance = 0;

        this.grassStepInterval = 22;


        /* ================================================= */
        /* REFERENCIA DEL SUELO                              */
        /* ================================================= */

        this.groundCenterY = null;
    }


    /* ===================================================== */
    /* OBTENER PERSONAJE                                    */
    /* ===================================================== */

    getCharacterKey(teamName) {

        const value =
            String(teamName || "")
                .toLowerCase()
                .trim();


        if (
            value.includes("argentina") ||
            value.includes("arg")
        ) {

            return "messi";
        }


        if (
            value.includes("brasil") ||
            value.includes("brazil") ||
            value.includes("bra")
        ) {

            return "neymar";
        }


        if (
            value.includes("francia") ||
            value.includes("france") ||
            value.includes("fra")
        ) {

            return "mbape";
        }


        if (
            value.includes("españa") ||
            value.includes("espana") ||
            value.includes("spain") ||
            value.includes("esp")
        ) {

            return "pedri";
        }


        return "messi";
    }


    /* ===================================================== */
    /* CARGAR IMAGEN                                        */
    /* ===================================================== */

    loadImage(path) {

        const image =
            new Image();

        /*
         * Forzamos una nueva petición para evitar que
         * el navegador reutilice una carga fallida anterior.
         */

        image.src =
            `${path}?v=2`;

        image.loaded = false;


        image.onload = () => {

            image.loaded = true;
        };


        image.onerror = () => {

            console.error(
                `No se pudo cargar el jugador: ${path}`
            );

            image.loaded = false;
        };


        return image;
    }


    /* ===================================================== */
    /* IMAGEN LISTA                                         */
    /* ===================================================== */

    isImageReady(image) {

        return !!(
            image &&
            image.complete &&
            image.naturalWidth > 0 &&
            image.naturalHeight > 0
        );
    }


    /* ===================================================== */
    /* ACTIVAR MAREO                                       */
    /* ===================================================== */

    triggerDizziness(duration = 5) {

        /*
         * Si ya está mareado, no reiniciamos el efecto
         * constantemente por una misma colisión.
         */

        if (this.isDizzy) {
            return;
        }


        this.isDizzy = true;

        this.dizzyTimer =
            Number.isFinite(duration)
                ? Math.max(0, duration)
                : this.dizzyDuration;


        /*
         * Detenemos inmediatamente el movimiento horizontal.
         *
         * La velocidad vertical NO se toca.
         * De esta manera, si el jugador estaba saltando
         * cuando recibió el golpe, seguirá cayendo
         * normalmente debido a la gravedad.
         */

        this.vx = 0;


        /*
         * No puede iniciar una patada durante el mareo.
         */

        this.kickCooldown = 0;
    }


    /* ===================================================== */
    /* QUITAR MAREO                                        */
    /* ===================================================== */

    clearDizziness() {

        this.isDizzy = false;

        this.dizzyTimer = 0;

        this.vx = 0;
    }


    /* ===================================================== */
    /* ACTUALIZAR ESTADO DE MAREO                          */
    /* ===================================================== */

    updateDizziness(deltaTime) {

        if (!this.isDizzy) {
            return;
        }


        this.dizzyTimer -= deltaTime;


        /*
         * Mientras está mareado no puede conservar
         * velocidad horizontal.
         */

        this.vx = 0;


        if (this.dizzyTimer <= 0) {

            this.clearDizziness();
        }
    }


    /* ===================================================== */
    /* ACTUALIZAR                                           */
    /* ===================================================== */

    update(input = {}, deltaTime, stadium) {

        deltaTime =
            Math.min(
                deltaTime,
                0.033
            );


        /* ================================================= */
        /* MAREO                                             */
        /* ================================================= */

        this.updateDizziness(
            deltaTime
        );


        /* ================================================= */
        /* RESPIRACIÓN                                       */
        /* ================================================= */

        this.breathTime +=
            deltaTime *
            this.breathSpeed;


        const joystick =
            input.joystick || {
                x: 0,
                y: 0
            };


        const inputX =
            Number(joystick.x) || 0;

        const inputY =
            Number(joystick.y) || 0;


        /* ================================================= */
        /* MOVIMIENTO HORIZONTAL                             */
        /* ================================================= */

        /*
         * Si está mareado, ignoramos completamente
         * el joystick horizontal.
         */

        if (!this.isDizzy) {

            if (
                Math.abs(inputX) > 0.05
            ) {

                this.vx +=
                    inputX *
                    this.acceleration *
                    deltaTime;


                this.vx =
                    Math.max(
                        -this.speed,
                        Math.min(
                            this.speed,
                            this.vx
                        )
                    );


                if (
                    inputX > 0.08
                ) {

                    this.facing = 1;
                }


                if (
                    inputX < -0.08
                ) {

                    this.facing = -1;
                }

            } else {

                if (
                    this.vx > 0
                ) {

                    this.vx =
                        Math.max(
                            0,
                            this.vx -
                            this.friction *
                            deltaTime
                        );
                }


                if (
                    this.vx < 0
                ) {

                    this.vx =
                        Math.min(
                            0,
                            this.vx +
                            this.friction *
                            deltaTime
                        );
                }
            }

        } else {

            /*
             * El mareo bloquea completamente
             * el movimiento horizontal.
             */

            this.vx = 0;
        }


        /* ================================================= */
        /* SALTO                                             */
        /* ================================================= */

        /*
         * No puede saltar mientras está mareado.
         */

        if (
            !this.isDizzy &&
            inputY < -0.65 &&
            this.onGround
        ) {

            this.vy =
                -this.jumpStrength;

            this.onGround =
                false;
        }


        /* ================================================= */
        /* GRAVEDAD                                          */
        /* ================================================= */

        this.vy +=
            this.gravity *
            deltaTime;


        /* ================================================= */
        /* MOVIMIENTO                                        */
        /* ================================================= */

        const previousX =
            this.x;


        this.x +=
            this.vx *
            deltaTime;

        this.y +=
            this.vy *
            deltaTime;


        /* ================================================= */
        /* CÉSPED                                            */
        /* ================================================= */

        if (
            this.onGround &&
            Math.abs(this.vx) > 45
        ) {

            this.grassStepDistance +=
                Math.abs(
                    this.x -
                    previousX
                );


            if (
                this.grassStepDistance >=
                this.grassStepInterval
            ) {

                this.createGrassBurst();

                this.grassStepDistance = 0;
            }

        } else {

            this.grassStepDistance = 0;
        }


        this.updateGrassParticles(
            deltaTime
        );


        /* ================================================= */
        /* LÍMITES                                           */
        /* ================================================= */

        this.resolveStadiumLimits(
            stadium
        );


        /* ================================================= */
        /* COOLDOWN DE PATADA                                */
        /* ================================================= */

        if (
            this.kickCooldown > 0
        ) {

            this.kickCooldown -=
                deltaTime;


            if (
                this.kickCooldown < 0
            ) {

                this.kickCooldown = 0;
            }
        }


        /*
         * Durante el mareo la patada siempre queda
         * desactivada.
         */

        if (this.isDizzy) {

            this.kickCooldown = 0;
        }
    }


    /* ===================================================== */
    /* CÉSPED                                               */
    /* ===================================================== */

    createGrassBurst() {

        if (
            this.grassParticles.length >= 10
        ) {

            return;
        }


        for (
            let i = 0;
            i < 2;
            i++
        ) {

            this.grassParticles.push({

                x:
                    this.x -
                    this.facing *
                    this.radius *
                    0.25 +
                    (
                        Math.random() -
                        0.5
                    ) * 12,

                y:
                    this.y +
                    this.radius -
                    2,

                vx:
                    -this.facing *
                    (
                        20 +
                        Math.random() * 25
                    ) +
                    (
                        Math.random() -
                        0.5
                    ) * 18,

                vy:
                    -(
                        25 +
                        Math.random() * 35
                    ),

                life:
                    0.16 +
                    Math.random() * 0.08,

                maxLife:
                    0.24,

                size:
                    1.5 +
                    Math.random() * 1.5
            });
        }
    }


    /* ===================================================== */
    /* ACTUALIZAR CÉSPED                                    */
    /* ===================================================== */

    updateGrassParticles(
        deltaTime
    ) {

        for (
            let i =
                this.grassParticles.length - 1;

            i >= 0;

            i--
        ) {

            const particle =
                this.grassParticles[i];


            particle.life -=
                deltaTime;


            if (
                particle.life <= 0
            ) {

                this.grassParticles.splice(
                    i,
                    1
                );

                continue;
            }


            particle.x +=
                particle.vx *
                deltaTime;

            particle.y +=
                particle.vy *
                deltaTime;


            particle.vy +=
                180 *
                deltaTime;


            particle.vx *=
                Math.pow(
                    0.1,
                    deltaTime
                );
        }
    }


    /* ===================================================== */
    /* LÍMITES DEL ESTADIO                                  */
    /* ===================================================== */

    resolveStadiumLimits(
        stadium
    ) {

        const ground =
            stadium.groundY -
            this.radius;


        this.groundCenterY =
            ground;


        /* ================================================= */
        /* SUELO                                             */
        /* ================================================= */

        if (
            this.y >= ground
        ) {

            this.y = ground;


            if (
                this.vy > 0
            ) {

                this.vy = 0;
            }


            this.onGround = true;

        } else {

            this.onGround = false;
        }


        /* ================================================= */
        /* IZQUIERDA                                         */
        /* ================================================= */

        if (
            this.x -
            this.radius <
            stadium.leftLimit
        ) {

            this.x =
                stadium.leftLimit +
                this.radius;


            if (
                this.vx < 0
            ) {

                this.vx = 0;
            }
        }


        /* ================================================= */
        /* DERECHA                                           */
        /* ================================================= */

        if (
            this.x +
            this.radius >
            stadium.rightLimit
        ) {

            this.x =
                stadium.rightLimit -
                this.radius;


            if (
                this.vx > 0
            ) {

                this.vx = 0;
            }
        }


        /* ================================================= */
        /* ARRIBA                                            */
        /* ================================================= */

        if (
            this.y -
            this.radius <
            stadium.playTop
        ) {

            this.y =
                stadium.playTop +
                this.radius;


            if (
                this.vy < 0
            ) {

                this.vy = 0;
            }
        }
    }


    /* ===================================================== */
    /* RESET                                                */
    /* ===================================================== */

    reset() {

        this.x =
            this.spawnX;

        this.y =
            this.spawnY;

        this.vx = 0;
        this.vy = 0;

        this.onGround = false;

        this.kickCooldown = 0;

        this.grassParticles.length = 0;

        this.grassStepDistance = 0;

        /*
         * El jugador siempre vuelve del reset
         * sin estar mareado.
         */

        this.clearDizziness();
    }


    /* ===================================================== */
    /* IMAGEN ACTUAL                                        */
    /* ===================================================== */

    getCurrentImage() {

        const jumping =
            !this.onGround;

        const kicking =
            this.kickCooldown > 0;


        const normalImage =
            this.facing === 1
                ? this.characterImages.right
                : this.characterImages.left;


        const kickImage =
            this.facing === 1
                ? this.characterImages.rightKick
                : this.characterImages.leftKick;


        const jumpImage =
            this.facing === 1
                ? this.characterImages.jumpRight
                : this.characterImages.jumpLeft;


        const dizzyImage =
            this.facing === 1
                ? this.characterImages.dizzyRight
                : this.characterImages.dizzyLeft;


        /* ================================================= */
        /* PRIORIDAD 1 — MAREO                              */
        /* ================================================= */

        /*
         * El estado mareado tiene prioridad absoluta.
         *
         * Aunque el jugador esté en el aire o tuviera
         * anteriormente una animación de patada,
         * mientras isDizzy sea true se mostrará
         * la imagen mareada.
         */

        if (this.isDizzy) {

            if (
                this.isImageReady(dizzyImage)
            ) {

                return dizzyImage;
            }
        }


        /* ================================================= */
        /* PRIORIDAD 2 — PATADA                             */
        /* ================================================= */

        /*
         * La patada tiene prioridad absoluta
         * cuando no está mareado.
         *
         * Incluso si el jugador está saltando,
         * mientras kickCooldown esté activo
         * se mostrará la animación de patada.
         */

        if (kicking) {

            if (
                this.isImageReady(kickImage)
            ) {

                return kickImage;
            }
        }


        /* ================================================= */
        /* PRIORIDAD 3 — SALTO                              */
        /* ================================================= */

        if (jumping) {

            if (
                this.isImageReady(jumpImage)
            ) {

                return jumpImage;
            }
        }


        /* ================================================= */
        /* PRIORIDAD 4 — IMAGEN NORMAL                      */
        /* ================================================= */

        if (
            this.isImageReady(normalImage)
        ) {

            return normalImage;
        }


        /* ================================================= */
        /* FALLBACKS                                         */
        /* ================================================= */

        if (
            this.isImageReady(kickImage)
        ) {

            return kickImage;
        }


        if (
            this.isImageReady(jumpImage)
        ) {

            return jumpImage;
        }


        if (
            this.isImageReady(dizzyImage)
        ) {

            return dizzyImage;
        }


        return null;
    }


    /* ===================================================== */
    /* DIMENSIONES VISUALES                                 */
    /* ===================================================== */

    getVisualDimensions() {

        const image =
            this.getCurrentImage();


        if (
            !this.isImageReady(image)
        ) {

            return {

                width: 60,

                height:
                    this.visualHeight
            };
        }


        const ratio =
            image.naturalWidth /
            image.naturalHeight;


        return {

            width:
                this.visualHeight *
                ratio,

            height:
                this.visualHeight
        };
    }


    /* ===================================================== */
    /* HITBOX DEL PERSONAJE                                 */
    /* ===================================================== */

    getHitbox() {

        const dimensions =
            this.getVisualDimensions();


        const width =
            dimensions.width *
            this.hitboxWidthFactor;


        const height =
            dimensions.height *
            this.hitboxHeightFactor;


        const bottom =
            this.y +
            this.radius;


        const top =
            bottom -
            height;


        return {

            left:
                this.x -
                width * 0.5,

            right:
                this.x +
                width * 0.5,

            top:
                top,

            bottom:
                bottom,

            width:
                width,

            height:
                height
        };
    }


    /* ===================================================== */
    /* SOMBRA                                               */
    /* ===================================================== */

    drawShadow(ctx) {

        /*
         * La sombra está SIEMPRE sobre el suelo.
         *
         * Solo cambia su tamaño dependiendo de la altura
         * del jugador.
         */

        const groundCenterY =
            Number.isFinite(
                this.groundCenterY
            )
                ? this.groundCenterY
                : 570 - this.radius;


        const groundY =
            groundCenterY +
            this.radius -
            2;


        /* ================================================= */
        /* ALTURA DEL SALTO                                  */
        /* ================================================= */

        const jumpHeight =
            Math.max(
                0,
                groundCenterY -
                this.y
            );


        const jumpFactor =
            Math.min(
                1,
                jumpHeight / 220
            );


        /* ================================================= */
        /* ESCALA                                            */
        /* ================================================= */

        const shadowScale =
            1 -
            jumpFactor *
            0.45;


        /*
         * Sombra REDUCIDA.
         *
         * Con radius 45:
         *
         * ancho ≈ 34 px
         * alto  ≈ 8 px
         */

        const shadowWidth =
            this.radius *
            0.75 *
            shadowScale;


        const shadowHeight =
            this.radius *
            0.18 *
            shadowScale;


        /* ================================================= */
        /* DIBUJAR                                          */
        /* ================================================= */

        ctx.save();


        ctx.globalAlpha =
            0.28;


        ctx.fillStyle =
            "#000000";


        ctx.beginPath();


        ctx.ellipse(

            this.x,

            groundY,

            shadowWidth,

            shadowHeight,

            0,

            0,

            Math.PI * 2
        );


        ctx.fill();


        ctx.restore();
    }


    /* ===================================================== */
    /* DISTANCIA HASTA EL SUELO                              */
    /* ===================================================== */

    getGroundDistance() {

        const groundCenterY =
            Number.isFinite(
                this.groundCenterY
            )
                ? this.groundCenterY
                : 570 - this.radius;


        return Math.max(
            0,
            groundCenterY -
            this.y
        );
    }


    /* ===================================================== */
    /* DIBUJAR                                              */
    /* ===================================================== */

    draw(ctx) {

        /* ================================================= */
        /* CÉSPED                                            */
        /* ================================================= */

        if (
            this.grassParticles.length > 0
        ) {

            ctx.save();


            for (
                const particle of
                this.grassParticles
            ) {

                const alpha =
                    Math.max(
                        0,
                        particle.life /
                        particle.maxLife
                    );


                ctx.globalAlpha =
                    alpha * 0.8;


                ctx.strokeStyle =
                    "#72a83f";


                ctx.lineWidth = 1.5;


                ctx.beginPath();


                ctx.moveTo(
                    particle.x,
                    particle.y
                );


                ctx.lineTo(
                    particle.x +
                    particle.vx *
                    0.035,

                    particle.y +
                    particle.vy *
                    0.035
                );


                ctx.stroke();
            }


            ctx.restore();
        }


        /* ================================================= */
        /* SOMBRA                                            */
        /* ================================================= */

        this.drawShadow(ctx);


        /* ================================================= */
        /* IMAGEN                                            */
        /* ================================================= */

        const image =
            this.getCurrentImage();


        if (
            !this.isImageReady(image)
        ) {

            return;
        }


        /* ================================================= */
        /* DIMENSIONES                                       */
        /* ================================================= */

        const dimensions =
            this.getVisualDimensions();


        let drawWidth =
    dimensions.width;

let drawHeight =
    dimensions.height;

let dizzyDrawYOffset = 0;

/*
 * Ajustes exclusivos para las imágenes mareadas.
 */
if (this.isDizzy) {

    const dizzyImage =
        this.getCurrentImage();

    if (this.isImageReady(dizzyImage)) {

        const dizzyRatio =
            dizzyImage.naturalWidth /
            dizzyImage.naturalHeight;

        drawHeight =
            this.dizzyVisualHeight;

        drawWidth =
            drawHeight * dizzyRatio;

        dizzyDrawYOffset =
            this.dizzyVisualYOffset;
    }
}

const drawX =
    this.x -
    drawWidth * 0.5;

const drawY =
    this.y +
    this.radius -
    drawHeight +
    dizzyDrawYOffset;


        ctx.save();


        ctx.imageSmoothingEnabled =
            true;


        /* ================================================= */
        /* RESPIRACIÓN                                       */
        /* ================================================= */

        /*
         * Mientras está mareado mantenemos también
         * la respiración visual, pero la imagen utilizada
         * será la de mareado.
         */

        const breathing =
            Math.sin(
                this.breathTime
            ) *
            this.breathAmount;


        /*
         * La respiración modifica ligeramente
         * la altura visual.
         *
         * Los pies permanecen exactamente en
         * la misma posición.
         */

        const breathingHeight =
            drawHeight *
            (1 + breathing);


        const breathingDrawY =
    this.y +
    this.radius -
    breathingHeight +
    dizzyDrawYOffset;


        /* ================================================= */
        /* DIBUJAR                                          */
        /* ================================================= */

        ctx.drawImage(

            image,

            drawX,

            breathingDrawY,

            drawWidth,

            breathingHeight
        );


        ctx.restore();
    }

}


window.Player =
    Player;