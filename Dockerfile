FROM node:20-alpine

# Arbeitsverzeichnis
WORKDIR /app

# Nur package-Dateien zuerst kopieren für bessere Caching-Effizienz
COPY package*.json ./

# Production-Dependencies installieren
RUN npm ci --only=production

# Restliche App-Dateien kopieren
COPY . .

# Standard-Port (Koyeb setzt PORT Umgebungsvariable automatisch)
EXPOSE 3000

# Startbefehl
CMD ["node", "server.js"]


