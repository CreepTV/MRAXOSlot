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
    
    const firebaseAuth = await waitForFirebase();
    const result = await firebaseAuth.loginUser(email, password);
    
    hideLoading();
    
    if (result.success) {
        // Migrate local data and redirect
        firebaseAuth.migrateLocalToFirebase(result.user);
        window.location.href = '../index.html';
    } else {
        let errorMessage = 'Anmeldung fehlgeschlagen.';
        
        if (result.error.includes('user-not-found')) {
            errorMessage = 'Kein Benutzer mit dieser E-Mail-Adresse gefunden.';
        } else if (result.error.includes('wrong-password')) {
            errorMessage = 'Falsches Passwort.';
        } else if (result.error.includes('invalid-email')) {
            errorMessage = 'Ungültige E-Mail-Adresse.';
        } else if (result.error.includes('too-many-requests')) {
            errorMessage = 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.';
        }
        
        showError('login', errorMessage);
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
    
    const firebaseAuth = await waitForFirebase();
    const result = await firebaseAuth.registerUser(email, password, username);
    
    hideLoading();
    
    if (result.success) {
        // Registration successful, redirect
        window.location.href = '../index.html';
    } else {
        let errorMessage = 'Registrierung fehlgeschlagen.';
        
        if (result.error.includes('email-already-in-use')) {
            errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
        } else if (result.error.includes('weak-password')) {
            errorMessage = 'Das Passwort ist zu schwach.';
        } else if (result.error.includes('invalid-email')) {
            errorMessage = 'Ungültige E-Mail-Adresse.';
        }
        
        showError('register', errorMessage);
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
