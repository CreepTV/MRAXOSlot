// Wait for Firebase to load
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (window.firebaseAuth) {
                resolve(window.firebaseAuth);
            } else {
                setTimeout(checkFirebase, 50);
            }
        };
        checkFirebase();
    });
}

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const guestBtn = document.getElementById('guest-btn');
const backBtn = document.getElementById('back-btn');
const loadingOverlay = document.getElementById('loading');

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        // Update tab buttons
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        if (tab === 'login') {
            loginForm.classList.add('active');
        } else {
            registerForm.classList.add('active');
        }
        
        // Clear errors
        clearErrors();
    });
});

// Show/Hide Loading
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Error Handling
function showError(formType, message) {
    const errorElement = document.getElementById(`${formType}-error`);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearErrors() {
    document.querySelectorAll('.form-error').forEach(error => {
        error.classList.remove('show');
        error.textContent = '';
    });
}

// Form Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateUsername(username) {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    console.log('🔐 Login form submitted for:', email);
    
    // Validation
    if (!validateEmail(email)) {
        showError('login', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        return;
    }
    
    if (!validatePassword(password)) {
        showError('login', 'Das Passwort muss mindestens 6 Zeichen lang sein.');
        return;
    }
    
    showLoading();
    
    try {
        const firebaseAuth = await waitForFirebase();
        console.log('🔥 Firebase auth ready, calling loginUser...');
        
        const result = await firebaseAuth.loginUser(email, password);
        console.log('📋 Login result:', result);
        
        hideLoading();
        
        // Prüfe explizit auf success === true
        if (result && result.success === true) {
            console.log('✅ Login successful, redirecting...');
            // Migrate local data and redirect
            firebaseAuth.migrateLocalToFirebase(result.user);
            window.location.href = '../index.html';
        } else {
            console.log('❌ Login failed:', result);
            let errorMessage = 'Anmeldung fehlgeschlagen.';
            
            if (result && result.error) {
                if (result.error.includes('user-not-found')) {
                    errorMessage = 'Kein Benutzer mit dieser E-Mail-Adresse gefunden.';
                } else if (result.error.includes('wrong-password')) {
                    errorMessage = 'Falsches Passwort.';
                } else if (result.error.includes('invalid-email')) {
                    errorMessage = 'Ungültige E-Mail-Adresse.';
                } else if (result.error.includes('too-many-requests')) {
                    errorMessage = 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.';
                } else {
                    errorMessage = `Anmeldung fehlgeschlagen: ${result.error}`;
                }
            }
            
            showError('login', errorMessage);
        }
    } catch (error) {
        hideLoading();
        console.error('💥 Unexpected error during login:', error);
        showError('login', 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    }
});

// Register Form Handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    console.log('📝 Registration form submitted for:', email);
    
    // Validation
    if (!validateUsername(username)) {
        showError('register', 'Der Benutzername muss mindestens 3 Zeichen lang sein und darf nur Buchstaben, Zahlen und Unterstriche enthalten.');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('register', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        return;
    }
    
    if (!validatePassword(password)) {
        showError('register', 'Das Passwort muss mindestens 6 Zeichen lang sein.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('register', 'Die Passwörter stimmen nicht überein.');
        return;
    }
    
    showLoading();
    
    try {
        const firebaseAuth = await waitForFirebase();
        console.log('🔥 Firebase auth ready, calling registerUser...');
        
        const result = await firebaseAuth.registerUser(email, password, username);
        console.log('📋 Registration result:', result);
        
        hideLoading();
        
        // Prüfe explizit auf success === true
        if (result && result.success === true) {
            console.log('✅ Registration successful, redirecting...');
            // Registration successful, redirect
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 500);
        } else {
            console.log('❌ Registration failed:', result);
            
            // WICHTIG: Prüfe trotz Fehler, ob der User erstellt wurde
            // Dies kann bei 400 Bad Request Fehlern passieren
            console.log('🔍 Checking if user was created despite error...');
            try {
                // Versuche mit den Credentials anzumelden
                const loginResult = await firebaseAuth.loginUser(email, password);
                console.log('🔄 Login attempt result:', loginResult);
                
                if (loginResult && loginResult.success === true) {
                    console.log('✅ User exists and login successful - registration actually worked!');
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 500);
                    return; // Erfolgreich! Beende die Funktion hier
                }
            } catch (loginError) {
                console.log('ℹ️ Login attempt failed, user probably not created:', loginError);
            }
            
            // Wenn wir hier ankommen, gab es wirklich einen Fehler
            let errorMessage = 'Registrierung fehlgeschlagen.';
            
            if (result && result.error) {
                if (result.error.includes('email-already-in-use')) {
                    errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
                } else if (result.error.includes('weak-password')) {
                    errorMessage = 'Das Passwort ist zu schwach.';
                } else if (result.error.includes('invalid-email')) {
                    errorMessage = 'Ungültige E-Mail-Adresse.';
                } else if (result.error.includes('operation-not-allowed')) {
                    errorMessage = 'E-Mail/Passwort-Authentifizierung ist nicht aktiviert.';
                } else if (result.error.includes('network-request-failed')) {
                    errorMessage = 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.';
                } else {
                    errorMessage = result.message || `Registrierung fehlgeschlagen: ${result.error}`;
                }
            }
            
            showError('register', errorMessage);
        }
    } catch (error) {
        hideLoading();
        console.error('💥 Unexpected error during registration:', error);
        showError('register', 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    }
});

// Guest Button Handler
guestBtn.addEventListener('click', () => {
    // Set guest mode flag
    localStorage.setItem('isGuestMode', 'true');
    window.location.href = '../index.html';
});

// Back Button Handler
backBtn.addEventListener('click', () => {
    window.location.href = '../index.html';
});

// Auto-focus first input
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-email').focus();
});

// Handle Enter key on forms
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const activeForm = document.querySelector('.auth-form.active');
        if (activeForm) {
            const submitBtn = activeForm.querySelector('.auth-btn');
            submitBtn.click();
        }
    }
});
