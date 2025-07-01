// main.js - Komplett reparierte Version

console.log('🚀 Script lädt...');

// User State
let currentUserState = {
    isLoggedIn: false,
    user: null,
    userData: null
};

// DROPDOWN FUNKTIONALITÄT - SOFORT BEIM LADEN
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM geladen');
    
    // Setup Firebase auth listener first
    setupFirebaseAuthListener();
    
    // Setup balance listener
    setupBalanceListener();
    
    // Check auth state (delayed to allow Firebase to load)
    setTimeout(checkAuthState, 500);
    
    // DROPDOWN SETUP - ERSTE PRIORITÄT
    const profileImg = document.getElementById('profile-img');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    console.log('🔍 Suche Elemente:', { profileImg, profileDropdown });
    
    if (profileImg && profileDropdown) {
        console.log('✅ Elemente gefunden - Setup Dropdown');
        
        profileImg.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ PROFIL GEKLICKT!');
            
            // Toggle dropdown
            const isActive = profileDropdown.classList.contains('active');
            if (isActive) {
                profileDropdown.classList.remove('active');
                console.log('❌ Dropdown geschlossen');
            } else {
                profileDropdown.classList.add('active');
                console.log('✅ Dropdown geöffnet');
            }
        });
        
        // Click außerhalb schließt dropdown
        document.addEventListener('click', function(e) {
            if (!profileDropdown.contains(e.target) && !profileImg.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
        
        console.log('🎯 Dropdown Event Listeners aktiv!');
    } else {
        console.error('❌ ELEMENTE NICHT GEFUNDEN!', {
            profileImg: profileImg ? 'FOUND' : 'NOT FOUND',
            profileDropdown: profileDropdown ? 'FOUND' : 'NOT FOUND'
        });
    }
    
    // DROPDOWN BUTTONS
    setupDropdownButtons();
    
    // BALANCE
    updateBalance();
    
    // SLOT CARDS
    setupSlotCards();
    
    // SLIDESHOW
    setupSlideshow();
});

function setupDropdownButtons() {
    console.log('🔘 Setup Dropdown Buttons');
    
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            console.log('🔑 Login geklickt');
            window.location.href = 'Login/login.html';
        });
        console.log('✅ Login Button aktiv');
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            console.log('📝 Register geklickt');  
            window.location.href = 'Login/login.html';
        });
        console.log('✅ Register Button aktiv');
    }
}

// Vereinfachtes Balance Management
async function updateBalance() {
    let balance = 1000;
    
    try {
        if (window.balanceManager) {
            balance = await window.balanceManager.getBalance();
            console.log('💰 Balance loaded via BalanceManager:', balance);
        } else {
            console.warn('⚠️ BalanceManager not ready, using fallback');
            balance = parseInt(localStorage.getItem('player_balance')) || 1000;
        }
    } catch (error) {
        console.error('❌ Error updating balance:', error);
        balance = parseInt(localStorage.getItem('player_balance')) || 1000;
    }
    
    // Update UI
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = balance;
        console.log('🎯 Balance UI updated to:', balance);
    }
    
    return balance;
}

// Setup balance listener
function setupBalanceListener() {
    if (window.balanceManager) {
        window.balanceManager.onBalanceChange((newBalance) => {
            console.log('💰 Balance changed:', newBalance);
            const balanceElement = document.getElementById('balance');
            if (balanceElement) {
                balanceElement.textContent = newBalance;
            }
        });
        console.log('🔔 Balance listener setup complete');
    } else {
        // Retry setup in 1 second if balance manager not ready
        setTimeout(setupBalanceListener, 1000);
    }
}

function setupSlotCards() {
    document.querySelectorAll('.slot-card').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('emoji-bonanza')) {
                window.location.href = 'SlotMachine1/slot1.html';
            } else if (card.textContent.includes('Slot 2')) {
                alert('Slot 2 wird bald verfügbar sein!');
            } else if (card.textContent.includes('Slot 3')) {
                alert('Slot 3 wird bald verfügbar sein!');
            }
        });
    });
}

function setupSlideshow() {
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

// Authentication State Management
async function checkAuthState() {
    console.log('🔍 Checking authentication state...');
    
    // Check for guest mode first
    const isGuestMode = localStorage.getItem('isGuestMode') === 'true';
    if (isGuestMode) {
        console.log('👤 User is in guest mode');
        updateUIForGuestMode();
        return;
    }
    
    // Check if Firebase is available
    if (window.firebaseAuth && window.firebaseAuth.getCurrentUser) {
        try {
            const currentUser = window.firebaseAuth.getCurrentUser();
            if (currentUser) {
                console.log('✅ User is logged in:', currentUser.email);
                console.log('🔄 Fetching user data...');
                
                try {
                    const userData = await window.firebaseAuth.getUserData(currentUser.uid);
                    console.log('📄 User data fetched:', userData);
                    
                    currentUserState = {
                        isLoggedIn: true,
                        user: currentUser,
                        userData: userData
                    };
                    updateUIForLoggedInUser();
                } catch (userDataError) {
                    console.error('⚠️ Error fetching user data:', userDataError);
                    // Still update UI with basic user info
                    currentUserState = {
                        isLoggedIn: true,
                        user: currentUser,
                        userData: null
                    };
                    updateUIForLoggedInUser();
                }
            } else {
                console.log('ℹ️ No user logged in');
                updateUIForGuestMode();
            }
        } catch (error) {
            console.log('⚠️ Error checking auth state:', error);
            updateUIForGuestMode();
        }
    } else {
        console.log('ℹ️ Firebase not available, using guest mode');
        updateUIForGuestMode();
    }
}

function setupFirebaseAuthListener() {
    if (window.firebaseAuth && window.firebaseAuth.onAuthChange) {
        console.log('🔥 Setting up Firebase auth state listener');
        
        window.firebaseAuth.onAuthChange(async (user) => {
            console.log('🔄 Auth state changed:', user ? user.email : 'No user');
            
            if (user) {
                console.log('✅ User is signed in, fetching user data...');
                
                try {
                    // Fetch user data from Firestore
                    const userData = await window.firebaseAuth.getUserData(user.uid);
                    console.log('📄 Fetched user data:', userData);
                    
                    currentUserState = {
                        isLoggedIn: true,
                        user: user,
                        userData: userData
                    };
                    
                    // Clear guest mode
                    localStorage.removeItem('isGuestMode');
                    
                    // Update UI with user data
                    updateUIForLoggedInUser();
                    
                } catch (error) {
                    console.error('❌ Error fetching user data:', error);
                    // Still update UI even if userData fetch fails
                    currentUserState = {
                        isLoggedIn: true,
                        user: user,
                        userData: null
                    };
                    
                    // Try balance sync even with error
                    updateUIForLoggedInUser();
                }
            } else {
                console.log('ℹ️ User is signed out');
                updateUIForGuestMode();
            }
        });
    } else {
        console.log('ℹ️ Firebase auth not available, will retry in 1 second');
        setTimeout(setupFirebaseAuthListener, 1000);
    }
}

function updateUIForLoggedInUser() {
    console.log('🔄 Updating UI for logged in user');
    console.log('👤 User data:', currentUserState.userData);
    console.log('🆔 User info:', currentUserState.user);
    
    const guestMenu = document.querySelector('.guest-menu');
    const userMenu = document.querySelector('.user-menu');
    const usernameDisplay = document.getElementById('username-display');
    const emailDisplay = document.getElementById('email-display');
    
    if (guestMenu && userMenu) {
        guestMenu.style.display = 'none';
        userMenu.style.display = 'block';
        
        // Update username display
        if (usernameDisplay) {
            let displayName = 'Benutzer'; // Default fallback
            
            if (currentUserState.userData && currentUserState.userData.username) {
                displayName = currentUserState.userData.username;
                console.log('✅ Using username from userData:', displayName);
            } else if (currentUserState.user && currentUserState.user.email) {
                // Fallback: use part of email as username
                displayName = currentUserState.user.email.split('@')[0];
                console.log('📧 Using email prefix as username:', displayName);
            }
            
            usernameDisplay.textContent = displayName;
            console.log('👤 Username display set to:', displayName);
        }
        
        // Update email display
        if (emailDisplay && currentUserState.user) {
            emailDisplay.textContent = currentUserState.user.email;
            console.log('📧 Email display set to:', currentUserState.user.email);
        }
        
        // Setup logged in user event listeners
        setupLoggedInUserButtons();
    }
    
    // Update balance from Firebase if available
    updateBalance();
}

function updateUIForGuestMode() {
    console.log('🔄 Updating UI for guest mode');
    
    const guestMenu = document.querySelector('.guest-menu');
    const userMenu = document.querySelector('.user-menu');
    
    if (guestMenu && userMenu) {
        guestMenu.style.display = 'block';
        userMenu.style.display = 'none';
    }
    
    currentUserState = {
        isLoggedIn: false,
        user: null,
        userData: null
    };
    
    // Update balance for guest mode
    updateBalance();
}

function setupLoggedInUserButtons() {
    console.log('🔘 Setup Logged In User Buttons');
    
    const publicProfileBtn = document.getElementById('public-profile-btn');
    const profileSettingsBtn = document.getElementById('profile-settings');
    const statsBtn = document.getElementById('stats-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (publicProfileBtn) {
        publicProfileBtn.addEventListener('click', function() {
            console.log('👁️ Public profile clicked');
            showPublicProfile();
        });
    }
    
    if (profileSettingsBtn) {
        profileSettingsBtn.addEventListener('click', function() {
            console.log('⚙️ Profile settings clicked');
            alert('Profileinstellungen werden bald verfügbar sein!');
        });
    }
    
    if (statsBtn) {
        statsBtn.addEventListener('click', function() {
            console.log('📊 Stats clicked');
            showUserStats();
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            console.log('🚪 Logout clicked');
            await handleLogout();
        });
    }
}

function showUserStats() {
    if (!currentUserState.userData) {
        alert('Keine Statistiken verfügbar');
        return;
    }
    
    const stats = currentUserState.userData;
    const statsMessage = `📊 Deine Statistiken:
    
👤 Benutzername: ${stats.username || 'Unbekannt'}
💰 Guthaben: €${stats.balance || 0}
🎮 Spiele gespielt: ${stats.gamesPlayed || 0}
🏆 Gesamtgewinne: €${stats.totalWinnings || 0}
📅 Mitglied seit: ${stats.createdAt ? new Date(stats.createdAt.toDate()).toLocaleDateString('de-DE') : 'Unbekannt'}`;
    
    alert(statsMessage);
}

async function handleLogout() {
    try {
        if (window.firebaseAuth && window.firebaseAuth.logoutUser) {
            const result = await window.firebaseAuth.logoutUser();
            if (result.success) {
                console.log('✅ Logout successful');
                // Clear local state
                localStorage.removeItem('isGuestMode');
                // Refresh page to reset UI
                window.location.reload();
            } else {
                console.error('❌ Logout failed:', result.error);
                alert('Abmeldung fehlgeschlagen');
            }
        } else {
            // Fallback: just clear local state
            localStorage.removeItem('isGuestMode');
            window.location.reload();
        }
    } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Fehler beim Abmelden');
    }
}

function showPublicProfile() {
    if (!currentUserState.userData || !currentUserState.user) {
        alert('Profildaten nicht verfügbar');
        return;
    }
    
    const userData = currentUserState.userData;
    const user = currentUserState.user;
    
    // Calculate some basic stats
    const winRate = userData.gamesPlayed > 0 ? 
        ((userData.totalWinnings / (userData.gamesPlayed * 10)) * 100).toFixed(1) : 0; // Assuming 10 average bet
    
    const profileMessage = `🌟 Öffentliches Profil
    
👤 ${userData.username || 'Spieler'}
📧 ${user.email}
    
🎮 Spielstatistiken:
🎯 Spiele gespielt: ${userData.gamesPlayed || 0}
🏆 Gesamtgewinne: €${userData.totalWinnings || 0}
📈 Erfolgshäufigkeit: ${winRate}%
💰 Aktuelles Guthaben: €${userData.balance || 0}

📅 Mitglied seit: ${userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString('de-DE') : 'Unbekannt'}

🏅 Erfolge: ${userData.achievements && userData.achievements.length > 0 ? userData.achievements.join(', ') : 'Noch keine Erfolge'}`;
    
    alert(profileMessage);
}

// EXPORT FUNCTIONS for slot games - Vereinfacht
window.updateUserBalance = async function(newBalance) {
    try {
        if (window.balanceManager) {
            await window.balanceManager.setBalance(newBalance);
            console.log('💰 Balance updated via BalanceManager to:', newBalance);
        } else {
            // Fallback
            localStorage.setItem('player_balance', newBalance.toString());
            console.log('💰 Balance updated via localStorage fallback to:', newBalance);
        }
        
        // Update UI
        await updateBalance();
    } catch (error) {
        console.error('❌ Error updating balance:', error);
        // Fallback to localStorage
        localStorage.setItem('player_balance', newBalance.toString());
        await updateBalance();
    }
};

window.getCurrentBalance = async function() {
    try {
        if (window.balanceManager) {
            return await window.balanceManager.getBalance();
        } else {
            // Fallback to localStorage
            return parseInt(localStorage.getItem('player_balance')) || 1000;
        }
    } catch (error) {
        console.error('❌ Error getting balance:', error);
        return parseInt(localStorage.getItem('player_balance')) || 1000;
    }
};

// Manual UI refresh function for debugging
window.refreshUserUI = function() {
    console.log('🔄 Manual UI refresh requested');
    if (currentUserState.isLoggedIn) {
        updateUIForLoggedInUser();
    } else {
        updateUIForGuestMode();
    }
};

// Debug function to check current state
window.debugUserState = function() {
    console.log('🐛 Current user state:', currentUserState);
    console.log('🔍 Firebase user:', window.firebaseAuth ? window.firebaseAuth.getCurrentUser() : 'Firebase not available');
    return currentUserState;
};

console.log('🎯 Script geladen - Dropdown sollte funktionieren!');
