const subtitleBox = document.getElementById("subtitles");
const quickButtons = document.querySelectorAll(".quick-btn");
let recognition;
let isListening = false;

// Verifica compatibilidad
if (!("webkitSpeechRecognition" in window)) {
    alert("Tu navegador no soporta subtítulos en vivo.");
} else {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "es-MX";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = event => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
        }
        subtitleBox.innerText = text;
    };

    recognition.onerror = (e) => console.error("Error:", e);
}

// Iniciar o detener subtítulos
function toggleSubtitles() {
    if (!isListening) {
        recognition.start();
        isListening = true;
        document.getElementById("startBtn").innerText = "Detener subtítulos";
    } else {
        recognition.stop();
        isListening = false;
        document.getElementById("startBtn").innerText = "Iniciar subtítulos";
    }
}

// Botones de frases rápidas
quickButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        subtitleBox.innerText = btn.innerText;
    });
});