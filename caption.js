// -------------------------------------------------------------------------
// 1. REFERENCIAS A ELEMENTOS DEL HTML
// -------------------------------------------------------------------------
const subtitleBox = document.getElementById("captions"); 
const quickButtons = document.querySelectorAll(".quickBtn"); 
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const langSelect = document.getElementById("langSelect");
const manualText = document.getElementById("manualText");
const speakManualBtn = document.getElementById("speakManualBtn");

let recognition;
let isListening = false;
let availableVoices = []; 

// -------------------------------------------------------------------------
// 2. FUNCIONES DE LECTURA DE VOZ (SPEAK)
// -------------------------------------------------------------------------

// Función para obtener las voces disponibles del sistema operativo
function populateVoiceList() {
    availableVoices = window.speechSynthesis.getVoices();
}

// Función central para hablar (usada por los botones y el texto manual)
function speakPhrase(phrase) {
    if (phrase.length === 0) return;

    // Detener la escucha si está activa
    if (isListening) {
        recognition.stop();
        stopListeningState();
    }

    // Mostrar la frase en pantalla
    subtitleBox.innerText = phrase;
    
    // Configurar y hacer que hable
    const speech = new SpeechSynthesisUtterance(phrase);
    speech.lang = langSelect.value; 

    // Opcional: Intenta usar una voz específica del idioma para mayor compatibilidad
    const selectedVoice = availableVoices.find(voice => voice.lang === speech.lang);
    if (selectedVoice) {
        speech.voice = selectedVoice;
    }

    window.speechSynthesis.speak(speech);
}


// -------------------------------------------------------------------------
// 3. CONFIGURACIÓN DEL RECONOCIMIENTO DE VOZ (MICRÓFONO)
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
        console.error("Error de reconocimiento:", e.error);
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

// Funciones de control de estado
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
// 4. VINCULACIÓN DE EVENTOS (El corazón de la interacción)
// -------------------------------------------------------------------------

// Cargar las voces tan pronto como estén disponibles (Necesario para TTS)
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Conexión del botón de Inicio: detiene la voz antes de iniciar el micrófono
startBtn.addEventListener("click", () => {
    window.speechSynthesis.cancel(); // Detiene cualquier voz que esté hablando
    toggleSubtitles();
});

// Conexión del botón de Detener
stopBtn.addEventListener("click", toggleSubtitles);

// Manejar el cambio de idioma
langSelect.addEventListener("change", () => {
    recognition.lang = langSelect.value;
    if (isListening) {
        recognition.stop();
        recognition.start();
    }
});

// Botón de Leer en voz alta
speakManualBtn.addEventListener("click", () => {
    const phrase = manualText.value.trim(); 
    speakPhrase(phrase);
    manualText.value = ''; 
});


// Botones de frases rápidas
quickButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        speakPhrase(btn.innerText);
    });
});