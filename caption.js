// -------------------------------------------------------------------------
// 1. REFERENCIAS A ELEMENTOS DEL HTML (Corregidas: captions, quickBtn)
// -------------------------------------------------------------------------
const subtitleBox = document.getElementById("captions"); 
const quickButtons = document.querySelectorAll(".quickBtn"); 
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const langSelect = document.getElementById("langSelect");

let recognition;
let isListening = false;

// -------------------------------------------------------------------------
// 2. CONFIGURACIÓN DEL RECONOCIMIENTO DE VOZ
// -------------------------------------------------------------------------
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
        // Muestra el mensaje de error de micrófono
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

// -------------------------------------------------------------------------
// 3. FUNCIONES AUXILIARES
// -------------------------------------------------------------------------

// Función para restablecer el estado del botón a "Detenido"
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

// -------------------------------------------------------------------------
// 4. VINCULACIÓN DE EVENTOS (LA PARTE ESENCIAL QUE FALTABA)
// -------------------------------------------------------------------------

// Conectar el botón de Inicio/Detener al hacer clic
startBtn.addEventListener("click", toggleSubtitles);

// Conectar el botón de Detener al hacer clic
stopBtn.addEventListener("click", toggleSubtitles);

// Manejar el cambio de idioma
langSelect.addEventListener("change", () => {
    recognition.lang = langSelect.value;
    if (isListening) {
        recognition.stop();
        recognition.start();
    }
});

// 5. BOTONES DE FRASES RÁPIDAS (CORREGIDO CON VOZ)
quickButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // Detener la escucha de subtítulos si está activa
        if (isListening) {
            recognition.stop();
            stopListeningState();
        }

        const phrase = btn.innerText;
        
        // 1. Mostrar la frase en pantalla
        subtitleBox.innerText = phrase;
        
        // 2. Crear el objeto de voz (Text-to-Speech)
        const speech = new SpeechSynthesisUtterance(phrase);
        
        // Establecer idioma para la voz
        speech.lang = langSelect.value; 

        // 3. Hacer que el dispositivo hable
        window.speechSynthesis.speak(speech);
    });
});