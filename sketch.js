// Variables de posición y movimiento
let pelotaX, pelotaY;
let velocidadPelotaX = 10, velocidadPelotaY = 5;
let tamañoPelota = 20;

// Variables para la raqueta del jugador
let jugadorY;
const anchoRaqueta = 10, altoRaqueta = 100;
const margenJugador = 20;

// Variables para la raqueta de la computadora
let computadoraY;
const margenComputadora = 770;

// Dimensiones de las barras superior e inferior
const alturaBarras = 10;

// Puntuación
let puntajeJugador = 0, puntajeComputadora = 0;

// Variables para las imágenes
let fondoImagen;
let jugadorImagen;
let computadoraImagen;
let pelotaImagen;
let anguloPelota = 0; // Para controlar el giro de la pelota

// Variables para los sonidos
let pongSound;
let goalSound;

// Variable para el sintetizador de voz
let synth;

// Variable de control para el comentarista
let comentarGol = false;

function preload() {
    fondoImagen = loadImage('fondo2.png');
    jugadorImagen = loadImage('barra1.png');
    computadoraImagen = loadImage('barra2.png');
    pelotaImagen = loadImage('bola.png');
    
    // Cargar los sonidos
    pongSound = loadSound('pong.mp3');
    goalSound = loadSound('goal.mp3');
}

function setup() {
    createCanvas(800, 400);
    pelotaX = width / 2;
    pelotaY = height / 2;
    jugadorY = height / 2 - altoRaqueta / 2;
    computadoraY = height / 2 - altoRaqueta / 2;
    
    // Inicializamos el sintetizador de voz
    synth = window.speechSynthesis;
}

function draw() {
    // Dibujar fondo
    background(fondoImagen);

    // Dibujar barras superior e inferior
    fill(color("#5B7FD2"));
    rect(0, 0, width, alturaBarras);
    rect(0, height - alturaBarras, width, alturaBarras);

    // Dibujar raquetas y pelota
    dibujarRaquetas();
    dibujarPelota();

    // Movimiento de la pelota y control de colisiones
    moverPelota();
    verificarColisiones();

    // Movimiento automático de la computadora
    moverRaquetaComputadora();

    // Mostrar el puntaje
    mostrarPuntaje();
}

// Dibuja las raquetas del jugador y la computadora con imágenes
function dibujarRaquetas() {
    // Dibuja la raqueta del jugador con imagen
    image(jugadorImagen, margenJugador, constrain(jugadorY, alturaBarras, height - alturaBarras - altoRaqueta), anchoRaqueta, altoRaqueta);

    // Dibuja la raqueta de la computadora con imagen
    image(computadoraImagen, margenComputadora, constrain(computadoraY, alturaBarras, height - alturaBarras - altoRaqueta), anchoRaqueta, altoRaqueta);
}

// Dibuja la pelota con imagen y rotación
function dibujarPelota() {
    push(); // Guardamos el estado de transformación
    translate(pelotaX, pelotaY); // Movemos el origen a la posición de la pelota
    rotate(anguloPelota); // Rotamos la pelota según el ángulo
    imageMode(CENTER); // Centramos la imagen en la pelota
    image(pelotaImagen, 0, 0, tamañoPelota, tamañoPelota); // Dibujamos la pelota
    pop(); // Restauramos el estado de transformación
}

// Controla el movimiento de la pelota
function moverPelota() {
    pelotaX += velocidadPelotaX;
    pelotaY += velocidadPelotaY;

    // Ajustamos el ángulo de la pelota según su velocidad para el efecto de giro
    anguloPelota += abs(velocidadPelotaX + velocidadPelotaY) * 0.05; // La pelota gira más rápido si se mueve más rápido

    // Rebote en las barras superior e inferior
    if (pelotaY <= alturaBarras + tamañoPelota / 2 || pelotaY >= height - alturaBarras - tamañoPelota / 2) {
        velocidadPelotaY *= -1;
    }

    if (pelotaX <= 0) {
        puntajeComputadora++;
        goalSound.play(); // Sonido de gol cuando la pelota pasa por la izquierda
        reiniciarPelota();
        comentarGol = true; // Activamos el comentarista
    } else if (pelotaX >= width) {
        puntajeJugador++;
        goalSound.play(); // Sonido de gol cuando la pelota pasa por la derecha
        reiniciarPelota();
        comentarGol = true; // Activamos el comentarista
    }
}

// Verifica las colisiones con las raquetas y ajusta la trayectoria
function verificarColisiones() {
    if (pelotaX - tamañoPelota / 2 <= margenJugador + anchoRaqueta && 
        pelotaY >= jugadorY && pelotaY <= jugadorY + altoRaqueta) {

        velocidadPelotaX *= -1;
        pongSound.play(); // Sonido cuando la pelota golpea la raqueta del jugador

        let impactoY = pelotaY - (jugadorY + altoRaqueta / 2);
        velocidadPelotaY = impactoY * 0.1;
        
        // Solo comentar si no ha sido comentado aún
        if (comentarGol) {
            comentarMarcador(); // Comentar marcador cuando se hace un golpe
            comentarGol = false; // Desactivar el comentarista
        }
    }

    if (pelotaX + tamañoPelota / 2 >= margenComputadora && 
        pelotaY >= computadoraY && pelotaY <= computadoraY + altoRaqueta) {

        velocidadPelotaX *= -1;
        pongSound.play(); // Sonido cuando la pelota golpea la raqueta de la computadora

        let impactoY = pelotaY - (computadoraY + altoRaqueta / 2);
        velocidadPelotaY = impactoY * 0.1;
        
        // Solo comentar si no ha sido comentado aún
        if (comentarGol) {
            comentarMarcador(); // Comentar marcador cuando se hace un golpe
            comentarGol = false; // Desactivar el comentarista
        }
    }
}

// Movimiento de la raqueta de la computadora con mayor dificultad y sin temblores
function moverRaquetaComputadora() {
    // Calcular la posición central de la raqueta de la computadora en función de la pelota
    let margenRaqueta = pelotaY - altoRaqueta / 2;

    // Movimiento gradual hacia la posición de la pelota para que la computadora no haga movimientos bruscos
    computadoraY += (margenRaqueta - computadoraY) * 0.05;  // Suavizamos el movimiento con un factor de 0.05

    // Asegurarnos de que la raqueta no se salga de los límites de la pantalla
    computadoraY = constrain(computadoraY, alturaBarras, height - alturaBarras - altoRaqueta);
}

// Control de la raqueta del jugador con las teclas
function keyPressed() {
    if (key === 'ArrowUp') {
        jugadorY = max(alturaBarras, jugadorY - 30);
    } else if (key === 'ArrowDown') {
        jugadorY = min(height - altoRaqueta - alturaBarras, jugadorY + 30);
    }
}

// Muestra el puntaje
function mostrarPuntaje() {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(puntajeJugador, width / 4, 30);
    text(puntajeComputadora, (width / 4) * 3, 30);
}

// Reinicia la pelota en el centro
function reiniciarPelota() {
    pelotaX = width / 2;
    pelotaY = height / 2;
    velocidadPelotaX *= random() > 0.5 ? 1 : -1;
    velocidadPelotaY = random(-3, 3);
}

// Función para que el comentarista diga el marcador usando SpeechSynthesisUtterance
function comentarMarcador() {
    let comentario = `Jugador ${puntajeJugador} y Computadora ${puntajeComputadora}`;
    let mensaje = new SpeechSynthesisUtterance(comentario);  // Creamos el mensaje a hablar
    speechSynthesis.speak(mensaje);  // Lo reproducimos
}
