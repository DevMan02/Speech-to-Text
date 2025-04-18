from fastapi import FastAPI, File, UploadFile
import whisper
import shutil
import os

app = FastAPI()

# Assicurarsi che esista la cartella audio_files
os.makedirs("audio_files", exist_ok=True)

# Carica il modello medio di Whisper
model = whisper.load_model("medium")

# Endpoint di base per testare se il server funziona
@app.get("/")
async def root():
    return {"message": "FastAPI funziona correttamente!"}

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    file_location = f"audio_files/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Trascrizione audio con Whisper
    result = model.transcribe(file_location)

    # Elimina il file audio dopo la trascrizione
    os.remove(file_location)

    return {"transcription": result["text"]}
