# Firebase Authentication Setup Guide

## Das 400 Bad Request Problem beheben

Der 400 Fehler bei der Registrierung tritt auf, weil die **E-Mail/Passwort-Authentifizierung** in der Firebase Console nicht aktiviert ist.

## Schritt-für-Schritt Lösung:

### 1. Firebase Console öffnen
- Gehe zu [https://console.firebase.google.com/](https://console.firebase.google.com/)
- Melde dich mit deinem Google-Account an
- Wähle dein Projekt "clubrey-73a17" aus

### 2. Authentication aktivieren
- Klicke in der linken Sidebar auf **"Authentication"**
- Falls noch nicht aktiviert, klicke auf **"Get started"**

### 3. Sign-in Methoden konfigurieren
- Gehe zum Tab **"Sign-in method"**
- Suche **"Email/Password"** in der Liste
- Klicke darauf und dann auf **"Enable"**
- **Wichtig:** Aktiviere beide Optionen:
  - ✅ **Email/Password** (für normale Registrierung)
  - ✅ **Email link (passwordless sign-in)** (optional, aber empfohlen)
- Klicke **"Save"**

### 4. Weitere empfohlene Einstellungen

#### Authorized Domains hinzufügen:
- Gehe zu **"Settings"** → **"Authorized domains"**
- Füge deine Domain hinzu (z.B. `localhost`, `127.0.0.1:5000`)

#### Password Policy (optional):
- Gehe zu **"Settings"** → **"Password policy"**
- Stelle die gewünschte Mindestlänge ein (Standard: 6 Zeichen)

### 5. Firestore Database aktivieren

#### Database erstellen:
- Klicke in der linken Sidebar auf **"Firestore Database"**
- Klicke **"Create database"**
- Wähle **"Start in test mode"** (für Entwicklung)
- Wähle eine Region (z.B. `eur3 (Europe)`)

#### Security Rules konfigurieren:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users können nur ihre eigenen Daten lesen/schreiben
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Öffentliche Daten (z.B. Leaderboards)
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 6. Testing der Konfiguration

Nach der Aktivierung solltest du:

1. **Die Login-Seite neu laden**
2. **Developer Console öffnen** (F12)
3. **Eine Test-Registrierung versuchen**

### Erwartete Console-Ausgaben:
```
✅ Firebase initialized successfully
🚀 Attempting to register user: test@example.com
📧 Available sign-in methods for email: []
✅ User created successfully: test@example.com
✅ User profile created successfully
```

### Falls weiterhin Fehler auftreten:

#### Häufige Probleme:
- **API Key falsch**: Überprüfe die Firebase-Konfiguration
- **Domain nicht autorisiert**: Füge `localhost` zu authorized domains hinzu
- **Firestore Rules zu restriktiv**: Verwende Test-Mode Rules

#### Debug-Schritte:
1. Console-Logs überprüfen
2. Network-Tab in Dev Tools checken
3. Firebase Console → Authentication → Users überprüfen

## 7. Produktions-Einstellungen

Für den Live-Betrieb:

### Security Rules verschärfen:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && validateUserData(resource.data);
    }
  }
}

function validateUserData(data) {
  return data.keys().hasAll(['email', 'username', 'balance'])
    && data.balance >= 0
    && data.username is string
    && data.email is string;
}
```

### Rate Limiting aktivieren:
- Gehe zu **Authentication** → **Settings** → **User management**
- Aktiviere **"Prevent phone number enumeration"**
- Aktiviere **"Block functions triggering"** für zu viele Versuche

## Troubleshooting

### Fehler: "auth/operation-not-allowed"
→ E-Mail/Passwort-Authentifizierung ist nicht aktiviert

### Fehler: "auth/invalid-api-key"
→ API Key in der Firebase-Konfiguration ist falsch

### Fehler: "auth/unauthorized-domain"
→ Domain ist nicht in den authorized domains

### Fehler: Network 400
→ Überprüfe, ob alle Firebase Services aktiviert sind

## Backup-Plan: Firebase Emulator

Falls weiterhin Probleme auftreten, kannst du den Firebase Emulator für lokale Entwicklung verwenden:

```bash
npm install -g firebase-tools
firebase login
firebase init emulators
firebase emulators:start
```

Dann in `firebase.js` die Emulator-URLs verwenden:
```javascript
if (location.hostname === 'localhost') {
  auth.useEmulator('http://localhost:9099');
  db.useEmulator('localhost', 8080);
}
```
