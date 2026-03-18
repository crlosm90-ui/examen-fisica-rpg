let bossHP = 500;
let playerHP = 100;
let bancoPreguntas = {};
let faseActual = "TURNO_JUGADOR"; // Puede ser TURNO_JUGADOR o TURNO_ENEMIGO

async function cargarPreguntas() {
    try {
        const respuesta = await fetch('preguntas.json');
        bancoPreguntas = await respuesta.json();
    } catch (e) { console.error("Error al cargar JSON"); }
}
cargarPreguntas();

function prepararAtaque(dificultad) {
    faseActual = "TURNO_JUGADOR";
    mostrarPregunta(dificultad);
}

function turnoEnemigo() {
    faseActual = "TURNO_ENEMIGO";
    setTimeout(() => {
        document.getElementById("battle-log").innerText = "¡El jefe se prepara para atacar! ¡Defiéndete!";
        mostrarPregunta("defensa");
    }, 2000); // Pausa de 2 segundos para que el usuario lea lo que pasó
}

function mostrarPregunta(categoria) {
    const lista = bancoPreguntas[categoria];
    const pregunta = lista[Math.floor(Math.random() * lista.length)];

    document.getElementById("actions-container").classList.add("hidden");
    document.getElementById("question-container").classList.remove("hidden");
    
    document.getElementById("question-text").innerText = pregunta.q;
    const optionsDiv = document.getElementById("options-container");
    optionsDiv.innerHTML = "";

    pregunta.a.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.onclick = () => procesarResultado(index, pregunta);
        optionsDiv.appendChild(btn);
    });
}

function procesarResultado(index, pregunta) {
    const log = document.getElementById("battle-log");
    const esCorrecto = (index === pregunta.c);
    const bossElement = document.getElementById("boss-sprite");

    if (faseActual === "TURNO_JUGADOR") {
        if (esCorrecto) {
            bossHP -= pregunta.dmg;
            // ¡Efecto visual de daño al jefe!
            const bossElement = document.getElementById("boss-sprite");
            // REINICIO DE ANIMACIÓN:
            bossElement.classList.remove("damage-animation"); // Quitamos si ya estaba
            void bossElement.offsetWidth;                     // Truco de "reflow" para que el navegador note el cambio
            bossElement.classList.add("damage-animation");    // La ponemos de nuevo
            
            log.innerText = `¡HIT! El jefe retrocede. -${pregunta.dmg} HP`;
        } else {
            log.innerText = "¡MISS! Tu ataque pasó de largo.";
        }
        actualizarInterfaz();
        if (bossHP > 0) turnoEnemigo(); // Si el jefe vive, ataca
    } 
    else if (faseActual === "TURNO_ENEMIGO") {
        if (esCorrecto) {
            log.innerText = "¡ESQUIVADO! Respondiste bien y evitaste el daño.";
        } else {
            const daño = pregunta.dmgEnemigo || 20;
            playerHP -= daño;
            log.innerText = `¡GOLPEADO! Fallaste la defensa y recibes ${daño} de daño.`;
        }
        actualizarInterfaz();
        if (playerHP > 0) {
            setTimeout(() => {
                log.innerText = "Es tu turno de nuevo. ¡Elige un ataque!";
                document.getElementById("actions-container").classList.remove("hidden");
            }, 2000);
        }
    }

    document.getElementById("question-container").classList.add("hidden");
    checarFinJuego();
}

function actualizarInterfaz() {
    document.getElementById("boss-health-fill").style.width = (Math.max(0, bossHP) / 500 * 100) + "%";
    document.getElementById("player-health-fill").style.width = (Math.max(0, playerHP) / 100 * 100) + "%";
    document.getElementById("boss-hp-text").innerText = Math.max(0, bossHP);
    document.getElementById("player-hp-text").innerText = Math.max(0, playerHP);
}

function checarFinJuego() {
    if (bossHP <= 0) alert("¡VICTORIA! El jefe ha sido derrotado.");
    if (playerHP <= 0) alert("GAME OVER. El jefe te ha vencido.");
}
