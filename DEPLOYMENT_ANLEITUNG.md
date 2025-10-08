# 🚀 Deployment Anleitung für SimpleChatConnect auf Railway

## ✅ Vorbereitung (bereits erledigt!)
- ✅ Git Repository initialisiert
- ✅ .gitignore erstellt
- ✅ Erster Commit gemacht

---

## 📋 SCHRITT-FÜR-SCHRITT ANLEITUNG

### **SCHRITT 1: GitHub Account & Repository erstellen**

1. Gehe zu [github.com](https://github.com)
2. Melde dich an (oder erstelle einen Account - kostenlos)
3. Klicke oben rechts auf **"+"** → **"New repository"**
4. Gib deinem Repository einen Namen (z.B. `simplechatconnect`)
5. Setze es auf **"Public"** (oder Private, ist egal)
6. **WICHTIG:** KEINE README, .gitignore oder Lizenz hinzufügen (haben wir schon!)
7. Klicke auf **"Create repository"**

### **SCHRITT 2: Code zu GitHub pushen**

GitHub zeigt dir jetzt Befehle. Kopiere die Zeile die beginnt mit:
```
git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO.git
```

Dann führe in deinem Terminal/PowerShell aus:

```powershell
# Ersetze mit deiner GitHub URL:
git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO.git

# Branch umbenennen zu main (Railway bevorzugt main)
git branch -M main

# Code hochladen
git push -u origin main
```

**Bei Passwort-Abfrage:** Du brauchst ein **Personal Access Token** (nicht dein Passwort!)
- Gehe zu GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Klicke "Generate new token (classic)"
- Wähle "repo" (kompletter Zugriff)
- Kopiere das Token und nutze es als Passwort

---

### **SCHRITT 3: Bei Railway anmelden**

1. Gehe zu [railway.app](https://railway.app)
2. Klicke oben rechts auf **"Login"**
3. Wähle **"Login with GitHub"** (am einfachsten!)
4. Autorisiere Railway

---

### **SCHRITT 4: Projekt auf Railway deployen**

1. Klicke auf **"New Project"**
2. Wähle **"Deploy from GitHub repo"**
3. Falls es dein erstes Mal ist: Klicke auf **"Configure GitHub App"**
   - Wähle dein Repository aus der Liste
   - Klicke "Install & Authorize"
4. Zurück bei Railway: Wähle dein Repository **"simplechatconnect"**
5. Railway erkennt automatisch, dass es eine Node.js App ist
6. Klicke auf **"Deploy"**

⏱️ **Deployment dauert 2-3 Minuten**

Du siehst Live-Logs. Wenn alles geklappt hat, siehst du:
```
✨ SimpleChatConnect running on http://...
🚀 Ready to connect users!
```

---

### **SCHRITT 5: Domain öffnen (Erste URL)**

1. In deinem Railway Dashboard, klicke auf dein Projekt
2. Klicke auf **"Settings"** (oder das Zahnrad-Symbol)
3. Scrolle zu **"Domains"**
4. Klicke auf **"Generate Domain"**
5. Railway erstellt eine URL wie: `simplechatconnect.up.railway.app`
6. Klicke auf die URL → **Deine App läuft!** 🎉

---

### **SCHRITT 6: Eigene Domain verbinden (Hosttech)**

#### 6.1 Domain in Railway hinzufügen

1. In Railway → Settings → Domains
2. Klicke auf **"Custom Domain"**
3. Gib deine Domain ein (z.B. `chat.deine-domain.ch`)
4. Railway zeigt dir die DNS-Einstellungen:
   ```
   CNAME  chat  →  simplechatconnect.up.railway.app
   ```

#### 6.2 DNS bei Hosttech konfigurieren

1. Gehe zu [my.hosttech.eu](https://my.hosttech.eu)
2. Logge dich ein
3. Navigiere zu **"Domains"** → Deine Domain auswählen
4. Klicke auf **"DNS-Einstellungen"** oder **"DNS-Verwaltung"**
5. Füge einen neuen Eintrag hinzu:

   **Für Subdomain (z.B. chat.deine-domain.ch):**
   ```
   Typ:    CNAME
   Name:   chat
   Ziel:   simplechatconnect.up.railway.app
   TTL:    3600 (oder Standard)
   ```

   **Für Hauptdomain (z.B. deine-domain.ch):**
   ```
   Typ:    A
   Name:   @ (oder leer lassen)
   Ziel:   [IP von Railway - wird in Railway angezeigt]
   TTL:    3600
   ```

6. Klicke auf **"Speichern"**

#### 6.3 Warten & Testen

- ⏱️ **DNS-Propagation dauert 5-60 Minuten**
- Teste mit: `nslookup chat.deine-domain.ch`
- Wenn es funktioniert, kannst du die Domain im Browser öffnen
- **SSL/HTTPS wird automatisch von Railway eingerichtet!** 🔒

---

## ✅ FERTIG!

Deine App läuft jetzt auf deiner eigenen Domain mit:
- ✅ Node.js Server (immer online)
- ✅ Socket.IO (WebSockets)
- ✅ Automatisches SSL/HTTPS
- ✅ Kostenlos (Railway Free Tier: 500h/Monat)

---

## 🔧 Updates deployen

Wenn du später Änderungen machst:

```powershell
git add .
git commit -m "Beschreibung der Änderung"
git push
```

Railway deployed automatisch! ⚡

---

## ⚠️ Wichtige Hinweise

1. **Railway Free Tier:**
   - 500 Stunden pro Monat (ca. 20 Tage Dauerbetrieb)
   - Danach wird die App gestoppt
   - Kreditkarte hinzufügen für mehr (erster $5 gratis)

2. **Bei Problemen:**
   - Schaue in die Railway Logs
   - Überprüfe, ob der Port korrekt ist (Railway setzt automatisch PORT env var)

3. **Hosttech E-Mails:**
   - Bleiben unberührt!
   - Nur deine neue Subdomain zeigt auf Railway

---

## 📞 Support

Bei Fragen:
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- GitHub Issues: Erstelle ein Issue in deinem Repo
