// -------------------------------------------------------------------------
// 1. REFERENCIAS A ELEMENTOS Y VARIABLES GLOBALES
// -------------------------------------------------------------------------
const subtitleBox = document.getElementById("captions"); 
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const langSelect = document.getElementById("langSelect");
const quickButtons = document.querySelectorAll(".quickBtn"); 
const manualText = document.getElementById("manualText");
const speakManualBtn = document.getElementById("speakManualBtn");
const summarizeBtn = document.getElementById("summarizeBtn");
const summaryOutput = document.getElementById("summaryOutput");

let recognition;
let isListening = false;
let availableVoices = [];
let fullTranscript = []; 

// -------------------------------------------------------------------------
// 2. FUNCIONES DE VOZ (TTS)
// -------------------------------------------------------------------------

function populateVoiceList() {
    availableVoices = window.speechSynthesis.getVoices();
}

// Forzar la carga de voces (CRUCIAL para móviles)
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoiceList;
} else {
    setTimeout(populateVoiceList, 500); 
}


function speakPhrase(phrase) {
    if (phrase.length === 0) return;

    if (isListening) {
        recognition.stop();
        stopListeningState();
    }
    
    window.speechSynthesis.cancel(); 

    subtitleBox.innerText = phrase;
    const speech = new SpeechSynthesisUtterance(phrase);
    speech.lang = langSelect.value; 

    const selectedVoice = availableVoices.find(voice => voice.lang === speech.lang);
    if (selectedVoice) {
        speech.voice = selectedVoice;
    }

    // MODIFICACIÓN CRÍTICA PARA FORZAR TTS EN MÓVILES (Activación de motor)
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.getVoices();
    }

    window.speechSynthesis.speak(speech);
}

// -------------------------------------------------------------------------
// 3. CONFIGURACIÓN DEL RECONOCIMIENTO DE VOZ (MICRÓFONO)
// -------------------------------------------------------------------------

if (!("webkitSpeechRecognition" in window)) {
    alert("Tu navegador no soporta subtítulos en vivo (Web Speech API).");
    startBtn.disabled = true;
} else {
    recognition = new webkitSpeechRecognition();
    recognition.lang = langSelect.value; 
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = event => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        subtitleBox.innerText = finalTranscript + interimTranscript;

        if (finalTranscript.length > 0) {
            fullTranscript.push(finalTranscript.trim());
        }
    };

    recognition.onerror = (e) => {
        console.error("Error de reconocimiento:", e.error);
        subtitleBox.innerText = "Error: Asegúrate de PERMITIR el uso del micrófono y usar HTTPS.";
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
    summarizeBtn.disabled = (fullTranscript.length === 0);
}

function toggleSubtitles() {
    if (!isListening) {
        window.speechSynthesis.cancel();
        recognition.start();
        isListening = true;
        startBtn.innerText = "Escuchando...";
        startBtn.disabled = true; 
        stopBtn.disabled = false;
        summarizeBtn.disabled = true;
    } else {
        recognition.stop();
        stopListeningState();
    }
}

// -------------------------------------------------------------------------
// 4. FUNCIONES DE ESTUDIO
// -------------------------------------------------------------------------

function generateSummary() {
    if (fullTranscript.length === 0) {
        summaryOutput.innerHTML = '<p style="color:red;">No hay texto guardado.</p>';
        return;
    }

    const wholeText = fullTranscript.join(' ');
    const words = wholeText.split(/\s+/);
    let summaryText = '';

    if (words.length > 50) { 
        const start = words.slice(0, 25).join(' ');
        const end = words.slice(-25).join(' ');
        summaryText = `<h3>⭐ Resumen Generado (Simulado)</h3>
                       <p><strong>Total de Palabras:</strong> ${words.length}</p>
                       <p><strong>Inicio de la Clase:</strong> ${start}...</p>
                       <p><strong>Conclusiones:</strong> ...${end}</p>`;
    } else {
        summaryText = `<h3>⭐ Transcripción Completa</h3>
                       <p><strong>Texto Guardado:</strong> ${wholeText}</p>`;
    }

    summaryOutput.innerHTML = summaryText;
    fullTranscript = []; 
    summarizeBtn.disabled = true;
}

// -------------------------------------------------------------------------
// 5. VINCULACIÓN DE EVENTOS
// -------------------------------------------------------------------------

startBtn.addEventListener("click", toggleSubtitles);
stopBtn.addEventListener("click", toggleSubtitles);

langSelect.addEventListener("change", () => {
    recognition.lang = langSelect.value;
    if (isListening) {
        recognition.stop();
        recognition.start();
    }
    populateVoiceList(); 
});

summarizeBtn.addEventListener("click", generateSummary);

speakManualBtn.addEventListener("click", () => {
    const phrase = manualText.value.trim(); 
    speakPhrase(phrase);
    manualText.value = ''; 
});

quickButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        speakPhrase(btn.innerText);
    });
});