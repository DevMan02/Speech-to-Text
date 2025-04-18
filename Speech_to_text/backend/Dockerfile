FROM python:3.9-slim

WORKDIR /app

# Installa ffmpeg e altre dipendenze necessarie
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements e installa le dipendenze
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Crea directory per i file audio
RUN mkdir -p audio_files

# Copia il codice dell'applicazione
COPY main.py .

# Esponi la porta su cui gira l'applicazione FastAPI
EXPOSE 8000

# Comando per avviare l'applicazione
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]