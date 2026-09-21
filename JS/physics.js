/* ========================================================= */
/* PHYSICS.JS                                                */
/* Colisiones entre jugadores y pelota                       */
/* ========================================================= */

class Physics {


    /* ===================================================== */
    /* CONFIGURACIÓN DEL MAREO                               */
    /* ===================================================== */

    /*
     * Velocidad REAL de la pelota necesaria para
     * producir mareo.
     *
     * IMPORTANTE:
     *
     * Ya NO utilizamos la velocidad relativa
     * entre jugador y pelota.
     *
     * El movimiento del jugador no influye.
     *
     * Actualmente está en 0 para poder probar
     * fácilmente la zona de la cabeza.
     *
     * Cuando comprobemos que funciona correctamente
     * podemos subir este valor, por ejemplo a 900.
     */

    static DIZZINESS_BALL_SPEED_THRESHOLD = 740;


    /* ===================================================== */
    /* DISTANCIA ENTRE DOS PUNTOS                            */
    /* ===================================================== */

    static distance(x1, y1, x2, y2) {

        const dx =
            x2 - x1;

        const dy =
            y2 - y1;

        return Math.sqrt(
            dx * dx +
            dy * dy
        );
    }


    /* ===================================================== */
    /* DISTANCIA AL CUADRADO                                 */
    /* ===================================================== */

    static distanceSquared(
        x1,
        y1,
        x2,
        y2
    ) {

        const dx =
            x2 - x1;

        const dy =
            y2 - y1;

        return (
            dx * dx +
            dy * dy
        );
    }


    /* ===================================================== */
    /* NORMALIZAR VECTOR                                     */
    /* ===================================================== */

    static normalize(x, y) {

        const length =
            Math.sqrt(
                x * x +
                y * y
            );


        if (
            length <= 0.0001
        ) {

            return {
                x: 1,
                y: 0
            };
        }


        return {

            x:
                x / length,

            y:
                y / length
        };
    }


    /* ===================================================== */
    /* COLISIÓN ENTRE JUGADORES                              */
    /* ===================================================== */

    static resolvePlayers(
        player1,
        player2
    ) {

        /* ================================================= */
        /* HITBOX DEL JUGADOR 1                              */
        /* ================================================= */

        const hitbox1 =
            typeof player1.getHitbox ===
            "function"

                ? player1.getHitbox()

                : {

                    left:
                        player1.x -
                        player1.radius,

                    right:
                        player1.x +
                        player1.radius,

                    top:
                        player1.y -
                        player1.radius,

                    bottom:
                        player1.y +
                        player1.radius
                };


        /* ================================================= */
        /* HITBOX DEL JUGADOR 2                              */
        /* ================================================= */

        const hitbox2 =
            typeof player2.getHitbox ===
            "function"

                ? player2.getHitbox()

                : {

                    left:
                        player2.x -
                        player2.radius,

                    right:
                        player2.x +
                        player2.radius,

                    top:
                        player2.y -
                        player2.radius,

                    bottom:
                        player2.y +
                        player2.radius
                };


        /* ================================================= */
        /* COMPROBAR SUPERPOSICIÓN VERTICAL                  */
        /* ================================================= */

        const verticalOverlap =
            hitbox1.bottom >
            hitbox2.top &&

            hitbox1.top <
            hitbox2.bottom;


        if (!verticalOverlap) {

            return;
        }


        /* ================================================= */
        /* COMPROBAR SUPERPOSICIÓN HORIZONTAL                */
        /* ================================================= */

        const horizontalOverlap =
            hitbox1.right >
            hitbox2.left &&

            hitbox1.left <
            hitbox2.right;


        if (!horizontalOverlap) {

            return;
        }


        /* ================================================= */
        /* DIRECCIÓN DEL EMPUJE                              */
        /* ================================================= */

        let direction;


        if (
            player2.x >=
            player1.x
        ) {

            direction = 1;

        } else {

            direction = -1;
        }


        /* ================================================= */
        /* PROFUNDIDAD DE SUPERPOSICIÓN                       */
        /* ================================================= */

        const overlapFromLeft =
            hitbox1.right -
            hitbox2.left;


        const overlapFromRight =
            hitbox2.right -
            hitbox1.left;


        const overlap =
            Math.min(
                overlapFromLeft,
                overlapFromRight
            );


        if (
            overlap <= 0
        ) {

            return;
        }


        /* ================================================= */
        /* SEPARACIÓN                                        */
        /* ================================================= */

        /*
         * No modificamos Y.
         */

        const separation =
            overlap * 0.5 + 0.5;


        player1.x -=
            direction *
            separation;


        player2.x +=
            direction *
            separation;


        /* ================================================= */
        /* VELOCIDAD RELATIVA                                */
        /* ================================================= */

        const relativeVelocityX =
            player2.vx -
            player1.vx;


        /*
         * Si ya se están separando horizontalmente,
         * no aplicamos otro impulso.
         */

        if (
            relativeVelocityX *
            direction >
            0
        ) {

            return;
        }


        /* ================================================= */
        /* IMPULSO                                           */
        /* ================================================= */

        const restitution =
            0.25;


        const impulse =
            -(
                1 +
                restitution
            ) *
            relativeVelocityX /
            2;


        const impulseX =
            impulse *
            direction;


        player1.vx -=
            impulseX;


        player2.vx +=
            impulseX;
    }


    /* ===================================================== */
    /* COLISIÓN JUGADOR CONTRA PELOTA                        */
    /* ===================================================== */

    static resolvePlayerBall(
        player,
        ball
    ) {

        /*
         * =================================================
         * HITBOX REAL DEL JUGADOR
         * =================================================
         */

        const hitbox =
            typeof player.getHitbox ===
            "function"

                ? player.getHitbox()

                : {

                    left:
                        player.x -
                        player.radius,

                    right:
                        player.x +
                        player.radius,

                    top:
                        player.y -
                        player.radius,

                    bottom:
                        player.y +
                        player.radius
                };


        const ballRadius =
            Math.max(
                1,
                ball.radius || 18
            );


        /* ================================================= */
        /* PUNTO MÁS CERCANO                                 */
        /* ================================================= */

        const closestX =
            Math.max(
                hitbox.left,

                Math.min(
                    ball.x,
                    hitbox.right
                )
            );


        const closestY =
            Math.max(
                hitbox.top,

                Math.min(
                    ball.y,
                    hitbox.bottom
                )
            );


        const dx =
            ball.x -
            closestX;

        const dy =
            ball.y -
            closestY;


        const distanceSquared =
            dx * dx +
            dy * dy;


        /*
         * Si la pelota está fuera de la hitbox,
         * no hay colisión.
         */

        if (
            distanceSquared >
            ballRadius *
            ballRadius
        ) {

            return false;
        }


        /* ================================================= */
        /* DISTANCIA                                        */
        /* ================================================= */

        let distance =
            Math.sqrt(
                distanceSquared
            );


        let normalX;
        let normalY;


        /* ================================================= */
        /* PELOTA DENTRO DE LA HITBOX                       */
        /* ================================================= */

        if (
            distance <= 0.0001
        ) {

            /*
             * La pelota está dentro del cuerpo.
             *
             * Elegimos la cara más cercana para expulsarla.
             */

            const distanceLeft =
                ball.x -
                hitbox.left;

            const distanceRight =
                hitbox.right -
                ball.x;

            const distanceTop =
                ball.y -
                hitbox.top;

            const distanceBottom =
                hitbox.bottom -
                ball.y;


            const minimumEscape =
                Math.min(
                    distanceLeft,
                    distanceRight,
                    distanceTop,
                    distanceBottom
                );


            if (
                minimumEscape ===
                distanceLeft
            ) {

                normalX = -1;
                normalY = 0;

                distance =
                    distanceLeft;

            } else if (
                minimumEscape ===
                distanceRight
            ) {

                normalX = 1;
                normalY = 0;

                distance =
                    distanceRight;

            } else if (
                minimumEscape ===
                distanceTop
            ) {

                normalX = 0;
                normalY = -1;

                distance =
                    distanceTop;

            } else {

                normalX = 0;
                normalY = 1;

                distance =
                    distanceBottom;
            }

        } else {

            /*
             * Normal desde la superficie del jugador
             * hacia la pelota.
             */

            normalX =
                dx /
                distance;

            normalY =
                dy /
                distance;
        }


        /* ================================================= */
        /* SEPARACIÓN                                       */
        /* ================================================= */

        const overlap =
            ballRadius -
            distance;


        if (
            overlap > 0
        ) {

            const correction =
                overlap + 1;


            ball.x +=
                normalX *
                correction;

            ball.y +=
                normalY *
                correction;
        }


        /* ================================================= */
        /* VELOCIDAD                                        */
        /* ================================================= */

        const playerVelocityX =
            player.vx || 0;

        const playerVelocityY =
            player.vy || 0;


        const ballVelocityX =
            ball.vx || 0;

        const ballVelocityY =
            ball.vy || 0;


        const relativeVelocityX =
            ballVelocityX -
            playerVelocityX;


        const relativeVelocityY =
            ballVelocityY -
            playerVelocityY;


        const velocityAlongNormal =
            relativeVelocityX *
            normalX +

            relativeVelocityY *
            normalY;


        /* ================================================= */
        /* DETECCIÓN DE MAREO                                */
        /* ================================================= */

        /*
         * IMPORTANTE:
         *
         * Esta comprobación ocurre ANTES de comprobar
         * si la pelota ya se está alejando.
         *
         * Por lo tanto, el movimiento del jugador NO
         * puede impedir que se detecte el golpe.
         *
         * El mareo depende únicamente de:
         *
         * 1. Contacto pelota-jugador.
         * 2. Posición de la pelota respecto a la imagen.
         * 3. Velocidad REAL de la pelota.
         */


        /* ================================================= */
        /* VELOCIDAD REAL DEL BALÓN                          */
        /* ================================================= */

        const ballSpeed =
            Math.sqrt(
                ballVelocityX *
                ballVelocityX +

                ballVelocityY *
                ballVelocityY
            );


        /* ================================================= */
        /* IMAGEN ACTUAL DEL JUGADOR                         */
        /* ================================================= */

        /*
         * Aquí está el cambio importante.
         *
         * Obtenemos EXACTAMENTE la imagen que el jugador
         * está mostrando en este momento.
         *
         * Puede ser:
         *
         * - derecha
         * - izquierda
         * - derecha lop
         * - izquierda lop
         * - salto derecha
         * - salto izquierda
         *
         * No usamos una posición de cabeza fija.
         */

        let visualDimensions = null;


        if (
            typeof player.getVisualDimensions ===
            "function"
        ) {

            visualDimensions =
                player.getVisualDimensions();
        }


        /*
         * Si por alguna razón no podemos obtener
         * las dimensiones visuales, utilizamos una
         * referencia basada en el radio físico.
         */

        const visualWidth =
            visualDimensions &&
            Number.isFinite(
                visualDimensions.width
            )

                ? visualDimensions.width

                : player.radius * 2;


        const visualHeight =
            visualDimensions &&
            Number.isFinite(
                visualDimensions.height
            )

                ? visualDimensions.height

                : player.radius * 2;


        /* ================================================= */
        /* POSICIÓN REAL DE LA IMAGEN                        */
        /* ================================================= */

        /*
         * player.y + player.radius es exactamente
         * el punto inferior utilizado por player.draw()
         * para colocar los pies del jugador.
         *
         * Por eso usamos ese mismo punto.
         */

        const visualBottom =
            player.y +
            player.radius;


        const visualTop =
            visualBottom -
            visualHeight;


        const visualLeft =
            player.x -
            visualWidth * 0.5;


        const visualRight =
            player.x +
            visualWidth * 0.5;


        /* ================================================= */
        /* MITAD DE LA IMAGEN                                */
        /* ================================================= */

        const visualMiddle =
            visualTop +
            visualHeight * 0.30;


        /*
         * La mitad superior de la imagen es
         * completamente noqueable.
         *
         * No importa qué personaje sea.
         * No importa qué sprite esté utilizando.
         */

        const ballTouchesUpperImageHalf =

            ball.x +
            ballRadius >=
            visualLeft &&

            ball.x -
            ballRadius <=
            visualRight &&

            ball.y +
            ballRadius >=
            visualTop &&

            ball.y -
            ballRadius <=
            visualMiddle;


        /* ================================================= */
        /* ACTIVAR MAREO                                    */
        /* ================================================= */

        if (
            ballTouchesUpperImageHalf &&

            ballSpeed >=
            Physics.DIZZINESS_BALL_SPEED_THRESHOLD &&

            player &&

            !player.isDizzy &&

            typeof player.triggerDizziness ===
            "function"
        ) {

            player.triggerDizziness(
                5
            );
        }


        /* ================================================= */
        /* SI LA PELOTA YA ESTÁ SALIENDO                    */
        /* ================================================= */

        /*
         * Esta parte solamente controla el rebote.
         *
         * La detección de mareo ya ocurrió arriba.
         */

        if (
            velocityAlongNormal >= 0
        ) {

            return true;
        }


        /* ================================================= */
        /* REBOTE                                            */
        /* ================================================= */

        const restitution =
            0.72;


        let newVelocityX =
            ballVelocityX -
            (
                1 +
                restitution
            ) *
            velocityAlongNormal *
            normalX;


        let newVelocityY =
            ballVelocityY -
            (
                1 +
                restitution
            ) *
            velocityAlongNormal *
            normalY;


        /* ================================================= */
        /* INFLUENCIA DEL JUGADOR                            */
        /* ================================================= */

        const playerInfluence =
            0.22;


        newVelocityX +=
            playerVelocityX *
            playerInfluence;

        newVelocityY +=
            playerVelocityY *
            playerInfluence;


        /* ================================================= */
        /* VELOCIDAD MÍNIMA                                 */
        /* ================================================= */

        const minimumBounceSpeed =
            80;


        const newSpeed =
            Math.sqrt(
                newVelocityX *
                newVelocityX +

                newVelocityY *
                newVelocityY
            );


        if (
            newSpeed <
            minimumBounceSpeed
        ) {

            newVelocityX +=
                normalX *
                minimumBounceSpeed;

            newVelocityY +=
                normalY *
                minimumBounceSpeed;
        }


        /* ================================================= */
        /* APLICAR                                           */
        /* ================================================= */

        ball.vx =
            newVelocityX;

        ball.vy =
            newVelocityY;


        ball.isOnGround =
            false;


        ball.lastBlockedBy =
            player;


        return true;
    }


    /* ===================================================== */
    /* COLISIÓN CON MAPA BLANCO                              */
    /* ===================================================== */

    static resolveCollisionMap(
        ball,
        collisionMap
    ) {

        if (
            !collisionMap ||
            !collisionMap.ready
        ) {

            return false;
        }


        return collisionMap.resolveBall(
            ball
        );
    }

}


window.Physics =
    Physics;