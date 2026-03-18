// Estado del juego
let bossHP = 500;
let playerHP = 100;
let bancoPreguntas = {}; // Aquí se guardará lo que lea del JSON

// 1. Cargar las preguntas al iniciar el juego
async function cargarPreguntas() {
    try {
        const respuesta = await fetch('preguntas.json');
        bancoPreguntas = await respuesta.json();
        console.log("Preguntas cargadas con éxito");
    } catch (error) {
        console.error("Error cargando el JSON:", error);
        document.getElementById("battle-log").innerText = "Error al cargar las preguntas.";
    }
}

// Llamamos a la función de carga de inmediato
cargarPreguntas();

function prepararAtaque(dificultad) {
    const lista = bancoPreguntas[dificultad];
    if (!lista) return;

    const pregunta = lista[Math.floor(Math.random() * lista.length)];

    document.getElementById("actions-container").classList.add("hidden");
    document.getElementById("question-container").classList.remove("hidden");
    
    document.getElementById("question-text").innerText = pregunta.q;
    const optionsDiv = document.getElementById("options-container");
    optionsDiv.innerHTML = "";

    pregunta.a.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.onclick = () => verificarRespuesta(index, pregunta, dificultad);
        optionsDiv.appendChild(btn);
    });
}

function verificarRespuesta(index, pregunta, dificultad) {
    const log = document.getElementById("battle-log");
    
    if (index === pregunta.c) {
        if (dificultad === "curacion") {
            playerHP = Math.min(100, playerHP + pregunta.heal);
            log.innerText = `¡Correcto! Recuperas ${pregunta.heal} HP.`;
        } else {
            bossHP -= pregunta.dmg;
            log.innerText = `¡Correcto! Infliges ${pregunta.dmg} de daño.`;
        }
    } else {
        // El jefe ataca más fuerte si la pregunta era difícil
        const dañoEnemigo = dificultad === "fuerte" ? 30 : 15;
        playerHP -= dañoEnemigo;
        log.innerText = `¡Error! El jefe te golpea y pierdes ${dañoEnemigo} HP.`;
    }

    actualizarInterfaz();
    document.getElementById("actions-container").classList.remove("hidden");
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
    if (bossHP <= 0) {
        alert("¡Victoria Épica! El examen ha sido superado.");
        location.reload(); // Reinicia el juego
    } else if (playerHP <= 0) {
        alert("Derrota... Necesitas estudiar más para vencer a este jefe.");
        location.reload();
    }
}