// app.js
document.addEventListener('DOMContentLoaded', function() {
    const askBtn = document.getElementById('ask-btn');
    const startRecordBtn = document.getElementById('start-record-btn');
    const questionInput = document.getElementById('question');
    const answerText = document.getElementById('answer');
    const conversationLog = document.getElementById('conversation-log');
    const welcomeMessage = document.getElementById('welcome-message');

    welcomeMessage.textContent = 'ようこそ、メンタルヘルスケアアプリです。';

    startRecordBtn.addEventListener('click', async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        let audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const transcript = await convertSpeechToText(audioBlob);
            questionInput.value = transcript;
            askQuestion(transcript);
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000);  // 5秒後に録音を停止
    });

    askBtn.addEventListener('click', () => {
        const question = questionInput.value;
        askQuestion(question);
    });

    async function askQuestion(question) {
        fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `question=${encodeURIComponent(question)}`,
        })
        .then(response => response.json())
        .then(data => {
            answerText.textContent = `回答: ${data.answer}`;
            speakText(data.answer);
            logConversation(question, data.answer);
        });
    }

    async function convertSpeechToText(audioBlob) {
        const apiKey = '4d8abf5284a34fd8b9e9df116a50d729';  // ここにAPIキー1を挿入
        const region = 'japaneast';  // ここにAzureリージョンを挿入
        const url = `https://japaneast.api.cognitive.microsoft.com/`
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
                'Content-Type': 'audio/wav',
            },
            body: audioBlob
        });

        const result = await response.json();
        return result.DisplayText;
    }

    async function speakText(text) {
        const apiKey = 'f007eeae901c47f8a3e483b94ab2da77';  // ここにAPIキー2を挿入
        const region = 'japaneast';  // ここにAzureリージョンを挿入
        const url = `https://japaneast.api.cognitive.microsoft.com/`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
            },
            body: `<speak version='1.0' xml:lang='ja-JP'><voice name='ja-JP-NanamiNeural'>${text}</voice></speak>`
        });

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    }

    function logConversation(question, answer) {
        const logEntry = `質問: ${question}\n回答: ${answer}\n\n`;
        conversationLog.value += logEntry;
    }
});