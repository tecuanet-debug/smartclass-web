// Obtener referencias a los elementos del HTML
// ¡IMPORTANTE! Se corrigen los nombres de ID/Clases para que coincidan con index.html
const subtitleBox = document.getElementById("captions"); 
const quickButtons = document.querySelectorAll(".quickBtn"); 
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const langSelect = document.getElementById("langSelect");

let recognition;
let isListening = false;

// Verifica compatibilidad
if (!("webkitSpeechRecognition" in window)) {
    alert("Tu navegador no soporta subtítulos en vivo (Web Speech API).");
    startBtn.disabled = true;
    startBtn.innerText = "No compatible";
} else {
    recognition = new webkitSpeechRecognition();
    recognition.lang = langSelect.value;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = event => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
        }
        subtitleBox.innerText = text;
    };

    recognition.onerror = (e) => {
        console.error("Error de reconocimiento:", e);
        subtitleBox.innerText = "Error: Asegúrate de permitir el uso del micrófono.";
        stopListeningState();
    };

    recognition.onend = () => {
        if (isListening) {
             // Reiniciar si está en modo continuo
             recognition.start();
        } else {
            stopListeningState();
        }
    }
}

// Función auxiliar para restablecer el estado del botón a "Detenido"
function stopListeningState() {
    isListening = false;
    startBtn.innerText = "Iniciar subtítulos";
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

// Iniciar o detener subtítulos
function toggleSubtitles() {
    if (!isListening) {
        recognition.start();
        isListening = true;
        startBtn.innerText = "Escuchando...";
        startBtn.disabled = true; 
        stopBtn.disabled = false;
    } else {
        recognition.stop();
        stopListeningState();
    }
}

// ------------------------------------------------
// VINCULACIÓN DE EVENTOS (LA PARTE ESENCIAL QUE FALTABA)
// ------------------------------------------------

// 1. Conectar el botón de Inicio/Detener al hacer clic
startBtn.addEventListener("click", toggleSubtitles);

// 2. Conectar el botón de Detener al hacer clic
stopBtn.addEventListener("click", toggleSubtitles);

// 3. Manejar el cambio de idioma
langSelect.addEventListener("change", () => {
    recognition.lang = langSelect.value;
    if (isListening) {
        recognition.stop();
        recognition.start();
    }
});

// 4. Botones de frases rápidas
quickButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (isListening) {
            recognition.stop();
            stopListeningState();
        }
        subtitleBox.innerText = btn.innerText;
    });
});