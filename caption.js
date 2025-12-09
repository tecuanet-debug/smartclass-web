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
const showGlossaryBtn = document.getElementById("showGlossaryBtn");
const glossaryOutput = document.getElementById("glossaryOutput");

let recognition;
let isListening = false;
let availableVoices = [];
let fullTranscript = []; 
let uniqueTerms = new Set(); 
let isGlossaryVisible = false;

// -------------------------------------------------------------------------
// 2. FUNCIONES DE VOZ (TTS)
// -------------------------------------------------------------------------

function populateVoiceList() {
    availableVoices = window.speechSynthesis.getVoices();
}

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
            const finalPhrase = finalTranscript.trim();
            fullTranscript.push(finalPhrase);
            extractKeywords(finalPhrase); 
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
    // Corrección de la etiqueta del botón para evitar el error de sintaxis en el editor
    showGlossaryBtn.innerText = "Ver Glosario (" + uniqueTerms.size + " términos)";
    showGlossaryBtn.disabled = (uniqueTerms.size === 0);
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
        showGlossaryBtn.disabled = true;
    } else {
        recognition.stop();
        stopListeningState();
    }
}

// -------------------------------------------------------------------------
// 4. FUNCIONES DE ESTUDIO (RESUMEN Y GLOSARIO)
// -------------------------------------------------------------------------

// --- 4.1. FUNCIÓN PRINCIPAL DE GLOSARIO ---
function extractKeywords(phrase) {
    const cleanPhrase = phrase.toLowerCase().replace(/[.,:;!?¿¡]/g, '');
    const words = cleanPhrase.split(/\s+/);
    
    const ignoreList = new Set(["el", "la", "los", "las", "un", "una", "unos", "unas", 
                                "de", "del", "a", "y", "o", "es", "son", "pero", "que", 
                                "en", "por", "para", "con", "se", "como", "al", "mi", "su"]);

    words.forEach(word => {
        if (word.length > 4 && !ignoreList.has(word) && isNaN(word)) {
            uniqueTerms.add(word);
        }
    });

    // Corrección de la etiqueta del botón para evitar el error de sintaxis en el editor
    showGlossaryBtn.innerText = "Ver Glosario (" + uniqueTerms.size + " términos)";
}

function toggleGlossaryView() {
    if (isGlossaryVisible) {
        glossaryOutput.innerHTML = '';
        showGlossaryBtn.innerText = "Ver Glosario (" + uniqueTerms.size + " términos)";
        isGlossaryVisible = false;
    } else {
        if (uniqueTerms.size === 0) {
            glossaryOutput.innerHTML = '<p style="color:red;">Aún no se han detectado términos clave.</p>';
            return;
        }

        let outputHtml = '<h3>🔍 Glosario de Clase</h3><ul>';
        
        const sortedTerms = Array.from(uniqueTerms).sort();

        sortedTerms.forEach(term => {
            outputHtml += '<li><strong>' + term.charAt(0).toUpperCase() + term.slice(1) + '</strong></li>';
        });
        
        outputHtml += '</ul><p>Estos son los términos únicos detectados en la clase.</p>';
        
        glossaryOutput.innerHTML = outputHtml;
        showGlossaryBtn.innerText = "Ocultar Glosario";
        isGlossaryVisible = true;
    }
}

// --- 4.2. FUNCIÓN DE RESUMEN ---
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
    uniqueTerms = new Set();
    summarizeBtn.disabled = true;
    showGlossaryBtn.disabled = true;
    showGlossaryBtn.innerText = "Ver Glosario (0 términos)";
    glossaryOutput.innerHTML = '';
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
showGlossaryBtn.addEventListener("click", toggleGlossaryView); 

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