FROM python:3.9-slim

WORKDIR /app

# Copia requirements e installa le dipendenze
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia il codice dell'applicazione
COPY . .

# Esponi la porta su cui gira l'applicazione Flask
EXPOSE 5000

# Imposta variabili d'ambiente per Flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5000

# Comando per avviare l'applicazione
CMD ["flask", "run"]