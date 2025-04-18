let mediaRecorder;
let audioChunks = [];
let isRecording = false;

document.addEventListener('DOMContentLoaded', function() {
    // Elementi DOM
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('audioFile');
    const fileInfo = document.getElementById('file-info');
    const uploadBtn = document.getElementById('uploadBtn');
    const startRecordBtn = document.getElementById('startRecordBtn');
    const stopRecordBtn = document.getElementById('stopRecordBtn');
    const recordStatus = document.getElementById('record-status');
    const statusText = recordStatus.querySelector('.status-text');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    
    // Drag & Drop funzionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('dragover');
    }

    function unhighlight() {
        dropArea.classList.remove('dragover');
    }

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            updateFileInfo(files[0]);
        }
    }

    // Input file change handler
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            updateFileInfo(this.files[0]);
        } else {
            resetFileInfo();
        }
    });

    function updateFileInfo(file) {
        // Verifica che sia un file audio
        if (!file.type.startsWith('audio/')) {
            fileInfo.textContent = 'Per favore seleziona un file audio valido';
            fileInfo.style.color = 'var(--danger-color)';
            uploadBtn.disabled = true;
            return;
        }
        
        // Update file info display
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileInfo.textContent = `${file.name} (${fileSizeMB} MB)`;
        fileInfo.style.color = 'var(--gray-600)';
        uploadBtn.disabled = false;
    }

    function resetFileInfo() {
        fileInfo.textContent = 'Nessun file selezionato';
        fileInfo.style.color = 'var(--gray-600)';
        uploadBtn.disabled = true;
    }

    // Upload button handler
    uploadBtn.addEventListener('click', function() {
        if (fileInput.files.length === 0) return;
        
        showLoading();
        uploadFile(fileInput.files[0]);
    });

    // Start recording button handler
    startRecordBtn.addEventListener('click', function() {
        startRecording();
    });

    // Stop recording button handler
    stopRecordBtn.addEventListener('click', function() {
        stopRecording();
    });

    function uploadFile(audioFile) {
        const formData = new FormData();
        formData.append('audio', audioFile);

        fetch('/upload_audio', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nel server');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            displayTranscription(data.transcription);
        })
        .catch(error => {
            hideLoading();
            displayError('Si è verificato un errore: ' + error.message);
        });
    }

    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            isRecording = true;

            // UI updates
            startRecordBtn.disabled = true;
            stopRecordBtn.disabled = false;
            recordStatus.classList.add('recording');
            statusText.textContent = 'Registrazione in corso...';
            result.textContent = 'In attesa della registrazione...';

            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", () => {
                // Reset UI recording status
                recordStatus.classList.remove('recording');
                statusText.textContent = 'Registrazione completata';
                
                // Process the recorded audio
                processRecordedAudio();
                
                // Stop all audio tracks
                stream.getTracks().forEach(track => track.stop());
                isRecording = false;
            });

            mediaRecorder.start();
        })
        .catch(error => {
            displayError('Impossibile accedere al microfono: ' + error.message);
            resetRecordingUI();
        });
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            stopRecordBtn.disabled = true;
            startRecordBtn.disabled = false;
            showLoading();
        }
    }

    function processRecordedAudio() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        uploadFile(audioBlob);
    }

    function resetRecordingUI() {
        startRecordBtn.disabled = false;
        stopRecordBtn.disabled = true;
        recordStatus.classList.remove('recording');
        statusText.textContent = 'Pronto per registrare';
    }

    function showLoading() {
        loading.classList.remove('hidden');
        result.style.opacity = '0.3';
    }

    function hideLoading() {
        loading.classList.add('hidden');
        result.style.opacity = '1';
    }

    function displayTranscription(text) {
        result.textContent = text || 'Nessun testo trascritto.';
    }

    function displayError(message) {
        result.textContent = message;
        result.style.color = 'var(--danger-color)';
        
        // Reset after a while
        setTimeout(() => {
            result.style.color = '';
            result.textContent = 'La trascrizione apparirà qui...';
        }, 5000);
    }
});