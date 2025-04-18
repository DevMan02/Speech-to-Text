from flask import Flask, render_template, request, jsonify
import requests
import os
import uuid

app = Flask(__name__)

# Usa la variabile d'ambiente se disponibile, altrimenti usa localhost
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000/transcribe/")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'Nessun file audio inviato'}), 400
    
    audio = request.files['audio']
    
    # Genera un nome file univoco per evitare conflitti
    filename = f"{uuid.uuid4()}.wav"
    filepath = os.path.join(os.path.dirname(__file__), filename)
    
    try:
        # Salva il file temporaneamente
        audio.save(filepath)

        # Invia file al backend FastAPI
        with open(filepath, 'rb') as audio_file:
            files = {'file': (filename, audio_file, 'audio/wav')}
            response = requests.post(BACKEND_URL, files=files)
        
        if response.status_code != 200:
            return jsonify({'error': 'Errore dal server di trascrizione'}), 500
        
        return jsonify(response.json())
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Pulisci il file temporaneo se esiste
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == '__main__':
    app.run(debug=True)