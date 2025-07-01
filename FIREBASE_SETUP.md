# Slot Browsergame - Firebase Setup

## Firebase Konfiguration

### 1. Firebase Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Klicke auf "Projekt hinzufügen"
3. Gib einen Projektnamen ein (z.B. "slot-browsergame")
4. Folge den Setup-Schritten

### 2. Firebase Hosting einrichten

1. Wähle dein Projekt in der Firebase Console
2. Gehe zu "Hosting" im linken Menü
3. Klicke auf "Jetzt starten"
4. Installiere Firebase CLI: `npm install -g firebase-tools`
5. Führe `firebase login` aus
6. Führe `firebase init` im Projektordner aus:
   - Wähle "Hosting"
   - Wähle dein Projekt
   - Public directory: `public`
   - Single-page app: `No`
   - Overwrite files: `No`

### 3. Authentication einrichten

1. Gehe zu "Authentication" in der Firebase Console
2. Klicke auf "Jetzt starten"
3. Gehe zum Tab "Sign-in method"
4. Aktiviere "E-Mail/Passwort"

### 4. Firestore Database einrichten

1. Gehe zu "Firestore Database" in der Firebase Console
2. Klicke auf "Datenbank erstellen"
3. Wähle "Im Testmodus starten" (für Entwicklung)
4. Wähle eine Region (z.B. europe-west3 für Deutschland)

### 5. Firebase Config aktualisieren

1. Gehe zu "Projekteinstellungen" (Zahnrad-Symbol)
2. Scrolle zu "Deine Apps" und klicke auf "Web-App hinzufügen"
3. Gib einen Namen ein und registriere die App
4. Kopiere die Firebase-Konfiguration
5. Ersetze die Konfiguration in `public/firebase.js`:

```javascript
const firebaseConfig = {
    apiKey: "dein-api-key",
    authDomain: "dein-projekt.firebaseapp.com",
    projectId: "dein-projekt-id",
    storageBucket: "dein-projekt.appspot.com",
    messagingSenderId: "123456789",
    appId: "deine-app-id"
};
```

### 6. Deployment

Führe diese Befehle aus, um die App zu deployen:

```bash
firebase deploy
```

## Funktionen

### Authentication
- **Registrierung**: Benutzer können sich mit E-Mail, Passwort und Username registrieren
- **Anmeldung**: Bestehende Benutzer können sich anmelden
- **Gastmodus**: Spieler können ohne Anmeldung spielen (lokale Speicherung)
- **Profil-Dropdown**: Zugriff auf Login/Logout über das Profilbild

### Datenbank
Die App verwendet Firestore mit folgender Struktur:

```
users/{userId}
├── uid: string
├── email: string
├── username: string
├── balance: number
├── createdAt: timestamp
├── gamesPlayed: number
├── totalWinnings: number
├── achievements: array
└── settings: object
    ├── soundEnabled: boolean
    ├── musicEnabled: boolean
    └── notifications: boolean
```

### Balance Management
- **Eingeloggte Benutzer**: Balance wird in Firestore gespeichert
- **Gäste**: Balance wird im localStorage gespeichert
- **Migration**: Beim Anmelden werden lokale Daten gelöscht und Firebase-Daten verwendet

## Sicherheitsregeln

Für die Produktion solltest du die Firestore-Sicherheitsregeln anpassen:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Entwicklung

### Lokaler Server
```bash
firebase serve
```

### Live-Deployment
```bash
firebase deploy
```

### Logs anzeigen
```bash
firebase functions:log
```

## Nächste Schritte

1. Passe die Firebase-Konfiguration an
2. Deploye die App
3. Teste alle Authentication-Funktionen
4. Erweitere die Benutzerprofile nach Bedarf
