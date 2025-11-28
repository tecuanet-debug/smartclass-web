// -------------------------------------------------------------------------
// 1. REFERENCIAS A ELEMENTOS DEL HTML (Se añaden los nuevos elementos)
// -------------------------------------------------------------------------
const subtitleBox = document.getElementById("captions"); 
const quickButtons = document.querySelectorAll(".quickBtn"); 
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const langSelect = document.getElementById("langSelect");

// NUEVAS REFERENCIAS PARA ESCRIBIR
const manualText = document.getElementById("manualText");
const speakManualBtn = document.getElementById("speakManualBtn");

let recognition;
let isListening = false;

// -------------------------------------------------------------------------
// 2. CONFIGURACIÓN DEL RECONOCIMIENTO DE VOZ (SIN CAMBIOS)
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
        subtitleBox.innerText = "Error: Asegúrate de permitir el uso del micrófono.";
        stopListeningState();
    };

    recognition.onend = () => {
        if (isListening) {
             recognition.start();
        } else {
            stopListeningState();
        }
    }
}

// -------------------------------------------------------------------------
// 3. FUNCIONES AUXILIARES (SIN CAMBIOS)
// -------------------------------------------------------------------------
function stopListeningState() {
    isListening = false;
    startBtn.innerText = "Iniciar subtítulos";
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

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
// 4. VINCULACIÓN DE EVENTOS Y NUEVA FUNCIÓN DE ESCRITURA
// -------------------------------------------------------------------------

// Conexiones de subtítulos (Sin cambios)
startBtn.addEventListener("click", toggleSubtitles);
stopBtn.addEventListener("click", toggleSubtitles);

// Manejar el cambio de idioma (Sin cambios)
langSelect.addEventListener("change", () => {
    recognition.lang = langSelect.value;
    if (isListening) {
        recognition.stop();
        recognition.start();
    }
});

// NUEVA FUNCIÓN: LEER TEXTO ESCRITO EN VOZ ALTA
speakManualBtn.addEventListener("click", () => {
    const phrase = manualText.value.trim(); 
    
    if (phrase.length > 0) {
        // 1. Detener la escucha si está activa
        if (isListening) {
            recognition.stop();
            stopListeningState();
        }

        // 2. Mostrar la frase en pantalla
        subtitleBox.innerText = phrase;
        
        // 3. TTS: Hablar la frase
        const speech = new SpeechSynthesisUtterance(phrase);
        speech.lang = langSelect.value; 

        window.speechSynthesis.speak(speech);
        
        // 4. Limpiar el cuadro de texto
        manualText.v…