// main.js - Vereinfachte Version die definitiv funktioniert

// Global Variables
let currentUser = null;
let isGuestMode = true;
let firebaseAuth = null;

// Balance Management
async function updateBalance() {
    let balance = 1000; // Default
    
    if (currentUser && !isGuestMode && firebaseAuth && firebaseAuth.getUserData) {
        try {
            const userData = await firebaseAuth.getUserData(currentUser.uid);
            if (userData) {
                balance = userData.balance || 1000;
            }
        } catch (error) {
            console.error('Error getting user data:', error);
            balance = parseInt(localStorage.getItem('slot1_balance')) || 1000;
        }
    } else {
        balance = parseInt(localStorage.getItem('slot1_balance')) || 1000;
    }
    
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = balance;
    }
}

// Update User Profile Display
function updateProfileDisplay(user, userData = null) {
    const guestMenu = document.querySelector('.guest-menu');
    const userMenu = document.querySelector('.user-menu');
    const usernameDisplay = document.getElementById('username-display');
    const emailDisplay = document.getElementById('email-display');
    const profileImg = document.getElementById('profile-img');
    
    if (user && !isGuestMode) {
        // Logged in user
        if (guestMenu) guestMenu.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        
        if (userData && usernameDisplay && emailDisplay) {
            usernameDisplay.textContent = userData.username || 'Benutzer';
            emailDisplay.textContent = user.email;
        } else if (usernameDisplay && emailDisplay) {
            usernameDisplay.textContent = user.email.split('@')[0];
            emailDisplay.textContent = user.email;
        }
        
        if (profileImg) profileImg.style.border = '2.5px solid #4caf50'; // Green border for logged in
    } else {
        // Guest mode
        if (guestMenu) guestMenu.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
        if (profileImg) profileImg.style.border = '2.5px solid #9a8c98'; // Default border for guest
    }
}

// Initialize Dropdown Functionality
function initializeDropdown() {
    const profileImg = document.getElementById('profile-img');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    console.log('Initializing dropdown...', { profileImg, profileDropdown });
    
    if (profileImg && profileDropdown) {
        profileImg.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Profil geklickt!'); // Debug
            profileDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
        
        console.log('Dropdown event listeners attached!');
    } else {
        console.error('Profile elements not found:', { profileImg, profileDropdown });
    }
}

// Initialize Auth Event Listeners
function initializeAuthListeners() {
    // Guest Menu Event Listeners
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    console.log('Setting up auth listeners...', { loginBtn, registerBtn });
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log('Login button clicked');
            window.location.href = 'Login/login.html';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            console.log('Register button clicked');
            window.location.href = 'Login/login.html';
        });
    }

    // User Menu Event Listeners
    const logoutBtn = document.getElementById('logout-btn');
    const profileSettings = document.getElementById('profile-settings');
    const statsBtn = document.getElementById('stats-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (firebaseAuth && firebaseAuth.logoutUser) {
                const result = await firebaseAuth.logoutUser();
                if (result.success) {
                    isGuestMode = true;
                    currentUser = null;
                    localStorage.setItem('isGuestMode', 'true');
                    updateProfileDisplay(null);
                    updateBalance();
                }
            }
        });
    }

    if (profileSettings) {
        profileSettings.addEventListener('click', () => {
            alert('Einstellungen werden bald verfügbar sein!');
        });
    }

    if (statsBtn) {
        statsBtn.addEventListener('click', () => {
            alert('Statistiken werden bald verfügbar sein!');
        });
    }
}

// Initialize Firebase Auth State Management
function initializeFirebaseAuth() {
    if (firebaseAuth && firebaseAuth.onAuthChange) {
        firebaseAuth.onAuthChange(async (user) => {
            console.log('Auth state changed:', user);
            currentUser = user;
            
            if (user && !localStorage.getItem('isGuestMode')) {
                isGuestMode = false;
                const userData = firebaseAuth.getUserData ? await firebaseAuth.getUserData(user.uid) : null;
                updateProfileDisplay(user, userData);
            } else {
                isGuestMode = true;
                updateProfileDisplay(null);
            }
            
            updateBalance();
        });
    }
}

// Wait for Firebase to load
function waitForFirebase() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 100; // 5 seconds max
        
        const checkFirebase = () => {
            attempts++;
            if (window.firebaseAuth) {
                firebaseAuth = window.firebaseAuth;
                console.log('Firebase loaded successfully!');
                resolve();
            } else if (attempts < maxAttempts) {
                setTimeout(checkFirebase, 50);
            } else {
                console.warn('Firebase failed to load, using guest mode only');
                resolve();
            }
        };
        checkFirebase();
    });
}

// Slot Card Navigation
function initializeSlotCards() {
    document.querySelectorAll('.slot-card').forEach(card => {
        card.addEventListener('click', () => {
            const cardText = card.textContent.trim();
            if (cardText === 'Slot 1' || card.classList.contains('emoji-bonanza')) {
                window.location.href = 'SlotMachine1/slot1.html';
            } else if (cardText === 'Slot 2') {
                alert('Slot 2 wird bald verfügbar sein!');
            } else if (cardText === 'Slot 3') {
                alert('Slot 3 wird bald verfügbar sein!');
            }
        });
    });
}

// Slideshow for Ad-Card
function initializeSlideshow() {
    const slides = document.querySelectorAll('.ad-card .slide');
    const dots = document.querySelectorAll('.ad-card .dot');
    let currentSlide = 0;

    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }, 5500);
    }
}

// Main Initialization
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing app...');
    
    // Check if coming from guest mode
    isGuestMode = localStorage.getItem('isGuestMode') !== 'false';
    
    // Initialize basic functionality immediately
    initializeDropdown();
    initializeAuthListeners();
    initializeSlotCards();
    initializeSlideshow();
    
    // Wait for Firebase to load
    await waitForFirebase();
    
    // Initialize Firebase-dependent features
    initializeFirebaseAuth();
    
    // Initial balance update
    updateBalance();
    
    // Monitor localStorage changes from other tabs/pages
    window.addEventListener('storage', function(e) {
        if (e.key === 'slot1_balance') {
            updateBalance();
        }
    });
    
    // Monitor focus events to update balance when user returns to page
    window.addEventListener('focus', function() {
        updateBalance();
    });
    
    console.log('App initialization complete!');
});

// Export functions for use in slot games
window.updateUserBalance = async function(newBalance) {
    if (currentUser && !isGuestMode && firebaseAuth && firebaseAuth.updateUserBalance) {
        await firebaseAuth.updateUserBalance(currentUser.uid, newBalance);
    } else {
        localStorage.setItem('slot1_balance', newBalance.toString());
    }
    updateBalance();
};

window.getCurrentBalance = async function() {
    if (currentUser && !isGuestMode && firebaseAuth && firebaseAuth.getUserData) {
        const userData = await firebaseAuth.getUserData(currentUser.uid);
        return userData ? userData.balance : 1000;
    } else {
        return parseInt(localStorage.getItem('slot1_balance')) || 1000;
    }
};
