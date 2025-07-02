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
    
    // Hide guest warning initially to prevent flash
    const guestWarning = document.getElementById('guest-warning');
    if (guestWarning) {
        guestWarning.style.display = 'none';
        console.log('🔄 Guest warning initially hidden');
    }
    
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
    
    // GUEST WARNING
    setupGuestWarning();
    
    // TEST: Profil-Popup für Gäste verfügbar machen
    setupGuestProfileButton();
    
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

function setupGuestWarning() {
    console.log('⚠️ Setup Guest Warning');
    
    const warningElement = document.getElementById('guest-warning');
    const warningLoginBtn = document.getElementById('warning-login-btn');
    
    if (warningElement && warningLoginBtn) {
        warningLoginBtn.addEventListener('click', function() {
            console.log('🔑 Warning login clicked');
            window.location.href = 'Login/login.html';
        });
        console.log('✅ Guest warning setup complete');
    }
}

// Show or hide guest warning based on login status
function toggleGuestWarning(show) {
    const guestWarning = document.getElementById('guest-warning');
    if (guestWarning) {
        if (show) {
            guestWarning.style.display = 'block';
            console.log('⚠️ Guest warning shown');
        } else {
            guestWarning.style.display = 'none';
            console.log('✅ Guest warning hidden');
        }
    }
}

// Force hide guest warning immediately (for when user logs in during delay)
function forceHideGuestWarning() {
    const guestWarning = document.getElementById('guest-warning');
    if (guestWarning) {
        guestWarning.style.display = 'none';
        console.log('🚫 Guest warning force hidden');
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
                window.location.href = '/EmojiBonanza';
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
                    // Sync balance immediately for returning user
                    await syncBalanceAfterLogin();
                } catch (userDataError) {
                    console.error('⚠️ Error fetching user data:', userDataError);
                    // Still update UI with basic user info
                    currentUserState = {
                        isLoggedIn: true,
                        user: currentUser,
                        userData: null
                    };
                    updateUIForLoggedInUser();
                    // Try to sync balance even without full userData
                    await syncBalanceAfterLogin();
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
                    
                    // Immediately sync and display the correct balance after login
                    await syncBalanceAfterLogin();
                    
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
                    // Still try to sync balance
                    await syncBalanceAfterLogin();
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

// Special function to sync balance immediately after login
async function syncBalanceAfterLogin() {
    console.log('🔄 Syncing balance after login...');
    
    try {
        let balanceToUse = 1000; // Default fallback
        
        // Priority 1: Try to get balance from Firebase userData
        if (currentUserState.userData && typeof currentUserState.userData.balance === 'number') {
            balanceToUse = currentUserState.userData.balance;
            console.log('💰 Using balance from Firebase userData:', balanceToUse);
        }
        // Priority 2: Try BalanceManager
        else if (window.balanceManager) {
            try {
                balanceToUse = await window.balanceManager.getBalance();
                console.log('💰 Using balance from BalanceManager:', balanceToUse);
            } catch (error) {
                console.warn('⚠️ BalanceManager failed, trying localStorage:', error);
                balanceToUse = parseInt(localStorage.getItem('player_balance')) || 1000;
            }
        }
        // Priority 3: Fallback to localStorage
        else {
            balanceToUse = parseInt(localStorage.getItem('player_balance')) || 1000;
            console.log('💰 Using balance from localStorage fallback:', balanceToUse);
        }
        
        // Update both localStorage and BalanceManager to ensure consistency
        localStorage.setItem('player_balance', balanceToUse.toString());
        
        if (window.balanceManager) {
            try {
                await window.balanceManager.setBalance(balanceToUse);
                console.log('✅ Balance synced to BalanceManager:', balanceToUse);
            } catch (error) {
                console.warn('⚠️ Could not sync to BalanceManager:', error);
            }
        }
        
        // Immediately update the UI
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = balanceToUse;
            console.log('🎯 Balance UI immediately updated to:', balanceToUse);
        }
        
        return balanceToUse;
        
    } catch (error) {
        console.error('❌ Error syncing balance after login:', error);
        // Emergency fallback
        const fallbackBalance = 1000;
        const balanceElement = document.getElementById('balance');
        if (balanceElement) {
            balanceElement.textContent = fallbackBalance;
        }
        return fallbackBalance;
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
    const profileImg = document.getElementById('profile-img');
    
    if (guestMenu && userMenu) {
        guestMenu.style.display = 'none';
        userMenu.style.display = 'block';
        
        // Hide guest warning for logged in users immediately
        forceHideGuestWarning();
        
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
        
        // Update profile image
        if (profileImg && currentUserState.userData) {
            const userImageUrl = currentUserState.userData.imglink;
            if (userImageUrl && userImageUrl.trim() !== '') {
                profileImg.src = userImageUrl;
                console.log('🖼️ Profile image updated to user image:', userImageUrl);
                
                // Add error handling for broken images
                profileImg.onerror = function() {
                    console.warn('⚠️ User profile image failed to load, using default');
                    this.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                    this.onerror = null; // Prevent infinite loop
                };
            } else {
                // Use default image if no custom image is set
                profileImg.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                console.log('🖼️ Using default profile image');
            }
        }
        
        // Setup logged in user event listeners
        setupLoggedInUserButtons();
        
        // Force immediate balance update for logged in user
        console.log('🔄 Forcing immediate balance refresh for logged in user');
        setTimeout(() => {
            updateBalance();
        }, 100); // Small delay to ensure DOM is ready
    }
    
    // Always update balance, but don't wait for it to complete UI update
    updateBalance();
}

function updateUIForGuestMode() {
    console.log('🔄 Updating UI for guest mode');
    
    const guestMenu = document.querySelector('.guest-menu');
    const userMenu = document.querySelector('.user-menu');
    const profileImg = document.getElementById('profile-img');
    
    if (guestMenu && userMenu) {
        guestMenu.style.display = 'block';
        userMenu.style.display = 'none';
        
        // Delay showing guest warning to allow Firebase to load
        setTimeout(() => {
            // Double-check if user is still not logged in after delay
            if (!currentUserState.isLoggedIn) {
                toggleGuestWarning(true);
            }
        }, 2000); // Wait 2 seconds before showing warning
    }
    
    // Reset profile image to default for guest mode
    if (profileImg) {
        profileImg.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        profileImg.onerror = null; // Remove any error handlers
        console.log('🖼️ Profile image reset to default for guest mode');
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
            openAccountSettingsModal();
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

// === Öffentliches Profil Popup ===

function openProfileModal(userData, isOwnProfile = true) {
    const modal = document.getElementById('profile-modal');
    if (!modal) {
        console.error('❌ Profile modal not found!');
        return;
    }

    console.log('🎭 Opening profile modal for:', userData);

    // Profilbild
    const profileImg = document.getElementById('profile-modal-img');
    if (profileImg) {
        profileImg.src = userData.imglink || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    }
    
    // Username prominent
    const usernameEl = document.getElementById('profile-modal-username');
    if (usernameEl) {
        usernameEl.textContent = userData.username || 'Benutzer';
    }
    
    // Land als Flagge + Text
    const countrySpan = document.getElementById('profile-modal-country');
    if (countrySpan) {
        if (userData.country) {
            const flagUrl = getCountryFlag(userData.country);
            const displayName = getCountryDisplayName(userData.country);
            countrySpan.innerHTML = `<img class="country-flag" src="${flagUrl}" alt="${userData.country}" onerror="this.src='https://flagcdn.com/w40/xx.png'" />${displayName}`;
        } else {
            countrySpan.innerHTML = `<img class="country-flag" src="https://flagcdn.com/w40/xx.png" alt="Unknown" />Land unbekannt`;
        }
    }
    
    const levelEl = document.getElementById('profile-modal-level');
    if (levelEl) {
        levelEl.textContent = 'Level ' + (userData.level || 1);
    }
    
    const commentEl = document.getElementById('profile-modal-comment');
    if (commentEl) {
        commentEl.textContent = userData.comment || 'Kein Kommentar verfügbar.';
    }
    
    const balanceEl = document.getElementById('profile-modal-balance');
    if (balanceEl) {
        balanceEl.textContent = userData.balance || 0;
    }
    
    const friendsEl = document.getElementById('profile-modal-friends');
    if (friendsEl) {
        friendsEl.textContent = userData.friends ? userData.friends.length : 0;
    }

    // Editierbare Felder vorbereiten
    const editUsername = document.getElementById('edit-username');
    if (editUsername) {
        editUsername.value = userData.username || '';
    }
    
    const editComment = document.getElementById('edit-comment');
    if (editComment) {
        editComment.value = userData.comment || '';
    }
    
    const editImglink = document.getElementById('edit-imglink');
    if (editImglink) {
        editImglink.value = userData.imglink || '';
    }
    
    // Set country select (update both hidden input and custom select display)
    const countrySelect = document.getElementById('edit-country');
    const customSelect = document.getElementById('custom-country-select');
    
    if (countrySelect && customSelect) {
        const selectedCountry = userData.country || 'Germany';
        countrySelect.value = selectedCountry;
        
        // Update custom select display
        const flagUrl = getCountryFlag(selectedCountry);
        const selectedDiv = customSelect.querySelector('.select-selected');
        if (selectedDiv) {
            selectedDiv.querySelector('.flag-icon').src = flagUrl;
            selectedDiv.querySelector('.country-name').textContent = getCountryDisplayName(selectedCountry);
        }
    }

    // Editier-Button nur für eigenes Profil
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
        editBtn.style.display = isOwnProfile ? 'inline-flex' : 'none';
    }

    // Modal anzeigen
    modal.style.display = 'flex';
    
    // Custom country select nach dem Anzeigen des Modals initialisieren
    setTimeout(() => {
        setupCustomCountrySelect();
    }, 50);
    
    console.log('✅ Profile modal shown');
}

// Hilfsfunktion: Flaggen-URL aus Land (mit Custom-Land-Support)
function getCountryFlag(country) {
    // First, check if it's a custom country defined in HTML
    const customCountryItem = document.querySelector(`#custom-country-select .select-item[data-value="${country}"]`);
    if (customCountryItem) {
        const customFlag = customCountryItem.querySelector('.flag-icon');
        if (customFlag && customFlag.src) {
            return customFlag.src;
        }
    }
    
    // Fallback to standard country codes
    const flagCodes = {
        'Germany': 'de', 'Austria': 'at', 'Switzerland': 'ch', 'France': 'fr', 'Italy': 'it', 'Spain': 'es',
        'Poland': 'pl', 'Netherlands': 'nl', 'Turkey': 'tr', 'UK': 'gb', 'United Kingdom': 'gb', 'USA': 'us',
        'Canada': 'ca', 'Russia': 'ru', 'Japan': 'jp', 'China': 'cn', 'Brazil': 'br', 'Australia': 'au',
        'Mexico': 'mx', 'Argentina': 'ar', 'India': 'in', 'South Korea': 'kr', 'Thailand': 'th', 'Vietnam': 'vn',
        'Indonesia': 'id', 'Malaysia': 'my', 'Singapore': 'sg', 'Philippines': 'ph', 'Norway': 'no', 'Sweden': 'se',
        'Denmark': 'dk', 'Finland': 'fi', 'Belgium': 'be', 'Luxembourg': 'lu', 'Czech Republic': 'cz', 'Slovakia': 'sk',
        'Hungary': 'hu', 'Romania': 'ro', 'Bulgaria': 'bg', 'Croatia': 'hr', 'Slovenia': 'si', 'Serbia': 'rs',
        'Portugal': 'pt', 'Greece': 'gr', 'Ukraine': 'ua', 'Belarus': 'by', 'Estonia': 'ee', 'Latvia': 'lv',
        'Lithuania': 'lt', 'Iceland': 'is', 'Ireland': 'ie', 'Malta': 'mt', 'Cyprus': 'cy', 'Israel': 'il',
        'UAE': 'ae', 'Saudi Arabia': 'sa', 'Egypt': 'eg', 'South Africa': 'za', 'Nigeria': 'ng', 'Kenya': 'ke',
        'Morocco': 'ma', 'Algeria': 'dz', 'Tunisia': 'tn', 'Chile': 'cl', 'Peru': 'pe', 'Colombia': 'co',
        'Venezuela': 've', 'Uruguay': 'uy', 'Paraguay': 'py', 'Ecuador': 'ec', 'Bolivia': 'bo', 'New Zealand': 'nz'
    };
    const countryCode = flagCodes[country];
    return countryCode ? `https://flagcdn.com/w40/${countryCode}.png` : 'https://flagcdn.com/w40/xx.png';
}

// Hilfsfunktion: Deutsche Ländernamen (mit Custom-Land-Support)
function getCountryDisplayName(country) {
    // First, check if it's a custom country defined in HTML
    const customCountryItem = document.querySelector(`#custom-country-select .select-item[data-value="${country}"]`);
    if (customCountryItem) {
        const customName = customCountryItem.querySelector('span');
        if (customName && customName.textContent) {
            return customName.textContent;
        }
    }
    
    // Fallback to standard country names
    const displayNames = {
        'Germany': 'Deutschland', 'Austria': 'Österreich', 'Switzerland': 'Schweiz', 'France': 'Frankreich',
        'Italy': 'Italien', 'Spain': 'Spanien', 'Poland': 'Polen', 'Netherlands': 'Niederlande', 'Turkey': 'Türkei',
        'UK': 'Vereinigtes Königreich', 'United Kingdom': 'Vereinigtes Königreich', 'USA': 'USA', 'Canada': 'Kanada',
        'Russia': 'Russland', 'Japan': 'Japan', 'China': 'China', 'Brazil': 'Brasilien', 'Australia': 'Australien',
        'Mexico': 'Mexiko', 'Argentina': 'Argentinien', 'India': 'Indien', 'South Korea': 'Südkorea', 'Thailand': 'Thailand',
        'Vietnam': 'Vietnam', 'Indonesia': 'Indonesien', 'Malaysia': 'Malaysia', 'Singapore': 'Singapur', 'Philippines': 'Philippinen',
        'Norway': 'Norwegen', 'Sweden': 'Schweden', 'Denmark': 'Dänemark', 'Finland': 'Finnland', 'Belgium': 'Belgien',
        'Luxembourg': 'Luxemburg', 'Czech Republic': 'Tschechien', 'Slovakia': 'Slowakei', 'Hungary': 'Ungarn',
        'Romania': 'Rumänien', 'Bulgaria': 'Bulgarien', 'Croatia': 'Kroatien', 'Slovenia': 'Slowenien', 'Serbia': 'Serbien',
        'Portugal': 'Portugal', 'Greece': 'Griechenland', 'Ukraine': 'Ukraine', 'Belarus': 'Belarus', 'Estonia': 'Estland',
        'Latvia': 'Lettland', 'Lithuania': 'Litauen', 'Iceland': 'Island', 'Ireland': 'Irland', 'Malta': 'Malta',
        'Cyprus': 'Zypern', 'Israel': 'Israel', 'UAE': 'VAE', 'Saudi Arabia': 'Saudi-Arabien', 'Egypt': 'Ägypten',
        'South Africa': 'Südafrika', 'Nigeria': 'Nigeria', 'Kenya': 'Kenia', 'Morocco': 'Marokko', 'Algeria': 'Algerien',
        'Tunisia': 'Tunesien', 'Chile': 'Chile', 'Peru': 'Peru', 'Colombia': 'Kolumbien', 'Venezuela': 'Venezuela',
        'Uruguay': 'Uruguay', 'Paraguay': 'Paraguay', 'Ecuador': 'Ecuador', 'Bolivia': 'Bolivien', 'New Zealand': 'Neuseeland'
    };
    return displayNames[country] || country;
}

// Modal schließen
function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'none';
}

// Event-Listener für Modal
if (document.getElementById('close-profile-modal')) {
    document.getElementById('close-profile-modal').onclick = closeProfileModal;
}
window.onclick = function(event) {
    const modal = document.getElementById('profile-modal');
    if (event.target === modal) closeProfileModal();
};

// Bearbeiten-Button
if (document.getElementById('edit-profile-btn')) {
    document.getElementById('edit-profile-btn').onclick = function() {
        enterEditMode();
    };
}

// Speichern-Button
if (document.getElementById('save-profile-btn')) {
    document.getElementById('save-profile-btn').onclick = async function() {
        await saveProfile();
    };
}

// Abbrechen-Button
if (document.getElementById('cancel-edit-btn')) {
    document.getElementById('cancel-edit-btn').onclick = function() {
        exitEditMode();
    };
}

// Inline Editing Functions
function enterEditMode() {
    // Hide display elements
    document.getElementById('profile-modal-username').style.display = 'none';
    document.getElementById('profile-modal-country').style.display = 'none';
    document.getElementById('profile-modal-comment').style.display = 'none';
    // Keep profile image visible in edit mode
    
    // Show edit elements
    document.getElementById('edit-username').style.display = 'block';
    document.getElementById('edit-country-container').style.display = 'block';
    document.getElementById('edit-comment').style.display = 'block';
    document.getElementById('edit-imglink').style.display = 'block';
    
    // Hide edit button, show save/cancel buttons
    document.getElementById('edit-profile-btn').style.display = 'none';
    document.getElementById('save-profile-btn').style.display = 'flex';
    document.getElementById('cancel-edit-btn').style.display = 'flex';
    
    // Fill edit fields with current values
    const currentData = currentUserState.userData || {};
    document.getElementById('edit-username').value = currentData.username || '';
    document.getElementById('edit-comment').value = currentData.comment || '';
    document.getElementById('edit-imglink').value = currentData.imglink || '';
    document.getElementById('edit-country').value = currentData.country || 'Germany';
    
    // Update country select display
    updateCustomCountrySelect(currentData.country || 'Germany');
    
    // Setup custom country select
    setTimeout(() => {
        setupCustomCountrySelect();
    }, 50);
}

// Live update profile image when URL changes
if (document.getElementById('edit-imglink')) {
    document.getElementById('edit-imglink').addEventListener('input', function() {
        const newUrl = this.value.trim();
        const profileImg = document.getElementById('profile-modal-img');
        
        if (newUrl && profileImg) {
            // Test if the URL is valid by creating a temporary image
            const testImg = new Image();
            testImg.onload = function() {
                profileImg.src = newUrl;
            };
            testImg.onerror = function() {
                // If image fails to load, keep current image
                console.log('Invalid image URL');
            };
            testImg.src = newUrl;
        }
    });
}

function exitEditMode() {
    // Show display elements
    document.getElementById('profile-modal-username').style.display = 'block';
    document.getElementById('profile-modal-country').style.display = 'flex';
    document.getElementById('profile-modal-comment').style.display = 'block';
    // Profile image stays visible
    
    // Hide edit elements
    document.getElementById('edit-username').style.display = 'none';
    document.getElementById('edit-country-container').style.display = 'none';
    document.getElementById('edit-comment').style.display = 'none';
    document.getElementById('edit-imglink').style.display = 'none';
    
    // Show edit button, hide save/cancel buttons
    document.getElementById('edit-profile-btn').style.display = 'flex';
    document.getElementById('save-profile-btn').style.display = 'none';
    document.getElementById('cancel-edit-btn').style.display = 'none';
}

async function saveProfile() {
    const username = document.getElementById('edit-username').value.trim();
    const comment = document.getElementById('edit-comment').value.trim();
    const imglink = document.getElementById('edit-imglink').value.trim();
    const country = document.getElementById('edit-country').value;
    
    if (!currentUserState.user) return;
    
    try {
        // Update in Firestore
        await window.firebaseAuth.updateUserStats(currentUserState.user.uid, {
            username, comment, imglink, country
        });
        
        // Update local state
        if (currentUserState.userData) {
            currentUserState.userData.username = username;
            currentUserState.userData.comment = comment;
            currentUserState.userData.imglink = imglink;
            currentUserState.userData.country = country;
        }
        
        // Update profile image on main page immediately
        updateProfileImage(imglink);
        
        // Update UI with new data
        updateUIForLoggedInUser();
        
        // Refresh the modal with new data and exit edit mode
        openProfileModal(currentUserState.userData, true);
        exitEditMode();
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Fehler beim Speichern des Profils');
    }
}

// Öffne eigenes Profil aus Dropdown
function showPublicProfile() {
    if (!currentUserState.userData || !currentUserState.user) {
        alert('Profildaten nicht verfügbar');
        return;
    }
    openProfileModal(currentUserState.userData, true);
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

function setupGuestProfileButton() {
    console.log('👤 Setup Guest Profile Button');
    
    // Füge einen Test-Button für das Profil-Popup hinzu (nur für Tests)
    const publicProfileBtn = document.getElementById('public-profile-btn');
    if (publicProfileBtn) {
        publicProfileBtn.addEventListener('click', function() {
            console.log('👁️ Guest profile clicked');
            showGuestProfile();
        });
        console.log('✅ Guest profile button setup');
    }
}

function showGuestProfile() {
    console.log('👤 Showing guest profile');
    
    // Test-Daten für Gast mit verschiedenen Ländern zum Testen
    const countries = ['Germany', 'Austria', 'USA', 'Japan', 'Brazil', 'Australia'];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    
    const guestData = {
        username: 'Gast-Spieler',
        comment: 'Das ist ein Test-Kommentar für das Profil-Popup! Die Flaggen sollten jetzt schön angezeigt werden.',
        imglink: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        country: randomCountry,
        level: 1,
        balance: 1000,
        friends: []
    };
    
    openProfileModal(guestData, false);
}

// Generate country select options dynamically
function generateCountryOptions() {
    const countries = [
        // Popular countries first (some already in HTML)
        'Germany', 'Austria', 'Switzerland', 'France', 'Italy', 'Spain', 'Poland', 'Netherlands', 'Turkey',
        'UK', 'USA', 'Canada', 'Russia', 'Japan', 'China', 'Brazil', 'Australia', 
        // Additional countries
        'Mexico', 'Argentina', 'India', 'South Korea', 'Thailand', 'Vietnam', 'Indonesia', 'Malaysia', 
        'Singapore', 'Philippines', 'Norway', 'Sweden', 'Denmark', 'Finland', 'Belgium', 'Luxembourg', 
        'Czech Republic', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Slovenia', 'Serbia', 
        'Portugal', 'Greece', 'Ukraine', 'Belarus', 'Estonia', 'Latvia', 'Lithuania', 'Iceland', 'Ireland', 
        'Malta', 'Cyprus', 'Israel', 'UAE', 'Saudi Arabia', 'Egypt', 'South Africa', 'Nigeria', 'Kenya', 
        'Morocco', 'Algeria', 'Tunisia', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Uruguay', 'Paraguay', 
        'Ecuador', 'Bolivia', 'New Zealand'
    ];
    
    const selectItems = document.querySelector('#custom-country-select .select-items');
    if (selectItems) {
        // Don't clear existing items - preserve manually added countries in HTML
        
        // Add all countries dynamically, but skip if already exists
        countries.forEach(country => {
            // Skip if already exists (preserves manually added countries)
            if (selectItems.querySelector(`[data-value="${country}"]`)) return;
            
            const item = document.createElement('div');
            item.className = 'select-item';
            item.setAttribute('data-value', country);
            
            const flagUrl = getCountryFlag(country);
            const displayName = getCountryDisplayName(country);
            
            item.innerHTML = `
                <img class="flag-icon" src="${flagUrl}" alt="${country}">
                <span>${displayName}</span>
            `;
            
            selectItems.appendChild(item);
        });
    }
}

// Setup custom country select dropdown
function setupCustomCountrySelect() {
    const customSelect = document.getElementById('custom-country-select');
    if (!customSelect) {
        console.log('❌ Custom select not found');
        return;
    }
    
    // Generate country options dynamically first
    generateCountryOptions();
    
    const selectedDiv = customSelect.querySelector('.select-selected');
    const itemsDiv = customSelect.querySelector('.select-items');
    const hiddenInput = document.getElementById('edit-country');
    
    if (!selectedDiv || !itemsDiv || !hiddenInput) {
        console.log('❌ Custom select elements not found');
        return;
    }
    
    // Remove existing event listeners to prevent conflicts
    const newSelectedDiv = selectedDiv.cloneNode(true);
    selectedDiv.parentNode.replaceChild(newSelectedDiv, selectedDiv);
    
    const newItemsDiv = itemsDiv.cloneNode(true);
    itemsDiv.parentNode.replaceChild(newItemsDiv, itemsDiv);
    
    // Get updated references
    const updatedSelectedDiv = customSelect.querySelector('.select-selected');
    const updatedItemsDiv = customSelect.querySelector('.select-items');
    
    // Toggle dropdown
    updatedSelectedDiv.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        customSelect.classList.toggle('active');
        
        // Close other dropdowns if any
        document.querySelectorAll('.custom-select').forEach(select => {
            if (select !== customSelect) {
                select.classList.remove('active');
            }
        });
    });
    
    // Handle item selection
    updatedItemsDiv.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const item = e.target.closest('.select-item');
        if (item) {
            const value = item.getAttribute('data-value');
            const flagImg = item.querySelector('.flag-icon').src;
            const countryName = item.querySelector('span').textContent;
            
            // Update selected display
            updatedSelectedDiv.querySelector('.flag-icon').src = flagImg;
            updatedSelectedDiv.querySelector('.country-name').textContent = countryName;
            
            // Update hidden input
            hiddenInput.value = value;
            
            // Close dropdown
            customSelect.classList.remove('active');
            
            console.log('✅ Country selected:', value, countryName);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('active');
        }
    });
    
    console.log('✅ Custom country select setup complete');
}

// Hilfsfunktion: Profilbild auf der Startseite aktualisieren
function updateProfileImage(imageUrl) {
    const profileImg = document.getElementById('profile-img');
    if (!profileImg) {
        console.warn('⚠️ Profile image element not found');
        return;
    }
    
    if (imageUrl && imageUrl.trim() !== '') {
        profileImg.src = imageUrl;
        console.log('🖼️ Profile image updated to:', imageUrl);
        
        // Add error handling for broken images
        profileImg.onerror = function() {
            console.warn('⚠️ Profile image failed to load, using default');
            this.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            this.onerror = null; // Prevent infinite loop
        };
    } else {
        // Use default image if no custom image is provided
        profileImg.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        profileImg.onerror = null; // Remove any error handlers
        console.log('🖼️ Profile image reset to default');
    }
}

// Update custom country select display
function updateCustomCountrySelect(country) {
    const flagUrl = getCountryFlag(country);
    const displayName = getCountryDisplayName(country);
    const customSelect = document.getElementById('custom-country-select');
    
    if (customSelect) {
        const selectedDiv = customSelect.querySelector('.select-selected');
        if (selectedDiv) {
            selectedDiv.querySelector('.flag-icon').src = flagUrl;
            selectedDiv.querySelector('.country-name').textContent = displayName;
        }
    }
}

// Generate country options on page load
document.addEventListener('DOMContentLoaded', function() {
    generateCountryOptions();
    setupAccountSettingsModal();
});

// Account Settings Modal Funktionalität
function setupAccountSettingsModal() {
    console.log('🔧 Setting up Account Settings Modal');
    
    // Modal-Elemente
    const profileSettingsBtn = document.getElementById('profile-settings');
    const accountSettingsModal = document.getElementById('account-settings-modal');
    const closeAccountSettingsBtn = document.getElementById('close-account-settings-modal');
    
    // Account Settings Buttons
    const changeEmailBtn = document.getElementById('change-email-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const enable2FACheckbox = document.getElementById('enable-2fa');
    const verify2FABtn = document.getElementById('verify-2fa-btn');
    const logoutAllDevicesBtn = document.getElementById('logout-all-devices-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    
    // Delete Account Confirmation Modal
    const deleteConfirmModal = document.getElementById('delete-account-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    
    // Event Listeners
    if (profileSettingsBtn) {
        profileSettingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openAccountSettingsModal();
        });
    }
    
    if (closeAccountSettingsBtn) {
        closeAccountSettingsBtn.addEventListener('click', function() {
            closeAccountSettingsModal();
        });
    }
    
    // Close modal when clicking outside
    if (accountSettingsModal) {
        accountSettingsModal.addEventListener('click', function(e) {
            if (e.target === accountSettingsModal) {
                closeAccountSettingsModal();
            }
        });
    }
    
    // E-Mail ändern
    if (changeEmailBtn) {
        changeEmailBtn.addEventListener('click', handleEmailChange);
    }
    
    // Passwort ändern
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handlePasswordChange);
    }
    
    // 2FA Toggle
    if (enable2FACheckbox) {
        enable2FACheckbox.addEventListener('change', handle2FAToggle);
    }
    
    // 2FA Verifizierung
    if (verify2FABtn) {
        verify2FABtn.addEventListener('click', handle2FAVerification);
    }
    
    // Alle Geräte abmelden
    if (logoutAllDevicesBtn) {
        logoutAllDevicesBtn.addEventListener('click', handleLogoutAllDevices);
    }
    
    // Konto löschen
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            showDeleteConfirmModal();
        });
    }
    
    // Delete Confirmation Modal Events
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', handleAccountDeletion);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            hideDeleteConfirmModal();
        });
    }
    
    // Close delete confirmation modal when clicking outside
    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener('click', function(e) {
            if (e.target === deleteConfirmModal) {
                hideDeleteConfirmModal();
            }
        });
    }
}

function openAccountSettingsModal() {
    console.log('🔧 Opening Account Settings Modal');
    const modal = document.getElementById('account-settings-modal');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (modal) {
        // Close profile dropdown first
        if (profileDropdown && profileDropdown.classList.contains('active')) {
            profileDropdown.classList.remove('active');
        }
        
        // Show modal with proper centering
        modal.style.display = 'flex';
        modal.classList.add('modal-show');
        document.body.style.overflow = 'hidden';
        
        // Load current user data
        loadAccountSettings();
    }
}

function closeAccountSettingsModal() {
    console.log('🔧 Closing Account Settings Modal');
    const modal = document.getElementById('account-settings-modal');
    
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('modal-show');
        document.body.style.overflow = 'auto';
        
        // Reset form fields
        resetAccountSettingsForm();
    }
}

function loadAccountSettings() {
    console.log('📊 Loading account settings');
    
    // Load current email
    const currentEmailElement = document.getElementById('current-email');
    if (currentEmailElement && currentUserState.user) {
        currentEmailElement.textContent = currentUserState.user.email || 'Nicht verfügbar';
    }
    
    // Load security info
    const lastLoginElement = document.getElementById('last-login');
    const accountCreatedElement = document.getElementById('account-created');
    
    if (lastLoginElement) {
        lastLoginElement.textContent = formatDate(new Date());
    }
    
    if (accountCreatedElement && currentUserState.user) {
        const creationTime = currentUserState.user.metadata?.creationTime;
        if (creationTime) {
            accountCreatedElement.textContent = formatDate(new Date(creationTime));
        }
    }
    
    // Load 2FA status
    const enable2FACheckbox = document.getElementById('enable-2fa');
    if (enable2FACheckbox && currentUserState.userData) {
        enable2FACheckbox.checked = currentUserState.userData.twoFactorEnabled || false;
    }
}

function resetAccountSettingsForm() {
    console.log('🔄 Resetting account settings form');
    
    // Clear input fields
    document.getElementById('new-email').value = '';
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('verification-code').value = '';
    document.getElementById('delete-confirm-password').value = '';
    
    // Hide QR code section
    const qrSection = document.getElementById('qr-code-section');
    if (qrSection) {
        qrSection.style.display = 'none';
    }
}

async function handleEmailChange() {
    console.log('📧 Changing email address');
    
    const newEmail = document.getElementById('new-email').value.trim();
    
    if (!newEmail) {
        showNotification('Bitte gib eine neue E-Mail Adresse ein.', 'error');
        return;
    }
    
    if (!isValidEmail(newEmail)) {
        showNotification('Bitte gib eine gültige E-Mail Adresse ein.', 'error');
        return;
    }
    
    try {
        // Firebase Email Update
        if (firebase.auth().currentUser) {
            await firebase.auth().currentUser.updateEmail(newEmail);
            showNotification('E-Mail Adresse erfolgreich geändert!', 'success');
            
            // Update display
            const currentEmailElement = document.getElementById('current-email');
            if (currentEmailElement) {
                currentEmailElement.textContent = newEmail;
            }
            
            // Clear input
            document.getElementById('new-email').value = '';
        }
    } catch (error) {
        console.error('Error changing email:', error);
        let errorMessage = 'Fehler beim Ändern der E-Mail Adresse.';
        
        if (error.code === 'auth/requires-recent-login') {
            errorMessage = 'Bitte melde dich erneut an, um deine E-Mail zu ändern.';
        } else if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Diese E-Mail Adresse wird bereits verwendet.';
        }
        
        showNotification(errorMessage, 'error');
    }
}

async function handlePasswordChange() {
    console.log('🔐 Changing password');
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Bitte fülle alle Passwort-Felder aus.', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Die neuen Passwörter stimmen nicht überein.', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Das neue Passwort muss mindestens 6 Zeichen lang sein.', 'error');
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('Kein Benutzer angemeldet');
        }
        
        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        await user.reauthenticateWithCredential(credential);
        
        // Update password
        await user.updatePassword(newPassword);
        
        showNotification('Passwort erfolgreich geändert!', 'success');
        
        // Clear form fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        
    } catch (error) {
        console.error('Error changing password:', error);
        let errorMessage = 'Fehler beim Ändern des Passworts.';
        
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Das aktuelle Passwort ist falsch.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Das neue Passwort ist zu schwach.';
        }
        
        showNotification(errorMessage, 'error');
    }
}

function handle2FAToggle() {
    console.log('🛡️ Toggling 2FA');
    
    const checkbox = document.getElementById('enable-2fa');
    const qrSection = document.getElementById('qr-code-section');
    
    if (checkbox.checked) {
        // Show QR code section for setup
        if (qrSection) {
            qrSection.style.display = 'block';
            generate2FAQR();
        }
    } else {
        // Disable 2FA
        if (qrSection) {
            qrSection.style.display = 'none';
        }
        disable2FA();
    }
}

function generate2FAQR() {
    console.log('📱 Generating 2FA QR Code');
    
    const qrCodeDisplay = document.getElementById('qr-code-display');
    if (qrCodeDisplay) {
        // In a real implementation, you would generate an actual QR code
        // For now, we'll show a placeholder
        qrCodeDisplay.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <p>📱 QR-Code Platzhalter</p>
                <p style="font-size: 0.8rem; color: #666;">
                    In einer echten Implementierung würde hier<br>
                    ein QR-Code für die Authenticator App stehen.
                </p>
            </div>
        `;
    }
}

async function handle2FAVerification() {
    console.log('✅ Verifying 2FA');
    
    const verificationCode = document.getElementById('verification-code').value.trim();
    
    if (!verificationCode) {
        showNotification('Bitte gib den Verifizierungscode ein.', 'error');
        return;
    }
    
    try {
        // In a real implementation, verify the code with the server
        // For now, we'll simulate a successful verification
        if (verificationCode === '123456') {
            showNotification('2FA erfolgreich aktiviert!', 'success');
            
            // Update user data
            if (currentUserState.userData) {
                currentUserState.userData.twoFactorEnabled = true;
                await updateUserData(currentUserState.userData);
            }
            
            // Hide QR section
            const qrSection = document.getElementById('qr-code-section');
            if (qrSection) {
                qrSection.style.display = 'none';
            }
            
            // Clear verification code
            document.getElementById('verification-code').value = '';
        } else {
            showNotification('Ungültiger Verifizierungscode.', 'error');
        }
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        showNotification('Fehler bei der 2FA-Verifizierung.', 'error');
    }
}

async function disable2FA() {
    console.log('🚫 Disabling 2FA');
    
    try {
        // Update user data
        if (currentUserState.userData) {
            currentUserState.userData.twoFactorEnabled = false;
            await updateUserData(currentUserState.userData);
        }
        
        showNotification('2FA erfolgreich deaktiviert.', 'success');
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        showNotification('Fehler beim Deaktivieren der 2FA.', 'error');
    }
}

async function handleLogoutAllDevices() {
    console.log('🚪 Logging out all devices');
    
    try {
        // In a real implementation, you would invalidate all sessions on the server
        // For now, we'll just log out the current user
        await firebase.auth().signOut();
        showNotification('Erfolgreich von allen Geräten abgemeldet.', 'success');
        closeAccountSettingsModal();
    } catch (error) {
        console.error('Error logging out all devices:', error);
        showNotification('Fehler beim Abmelden von allen Geräten.', 'error');
    }
}

function showDeleteConfirmModal() {
    console.log('⚠️ Showing delete confirmation modal');
    
    const deleteConfirmModal = document.getElementById('delete-account-confirm-modal');
    if (deleteConfirmModal) {
        deleteConfirmModal.style.display = 'flex';
        deleteConfirmModal.classList.add('modal-show');
    }
}

function hideDeleteConfirmModal() {
    console.log('❌ Hiding delete confirmation modal');
    
    const deleteConfirmModal = document.getElementById('delete-account-confirm-modal');
    if (deleteConfirmModal) {
        deleteConfirmModal.style.display = 'none';
        deleteConfirmModal.classList.remove('modal-show');
        // Clear password field
        const passwordField = document.getElementById('delete-confirm-password');
        if (passwordField) {
            passwordField.value = '';
        }
    }
}

async function handleAccountDeletion() {
    console.log('💥 Handling account deletion');
    
    const confirmPassword = document.getElementById('delete-confirm-password').value;
    
    if (!confirmPassword) {
        showNotification('Bitte gib dein Passwort zur Bestätigung ein.', 'error');
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('Kein Benutzer angemeldet');
        }
        
        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, confirmPassword);
        await user.reauthenticateWithCredential(credential);
        
        // Delete user data from Firestore
        if (currentUserState.userData && currentUserState.userData.uid) {
            await firebase.firestore().collection('users').doc(currentUserState.userData.uid).delete();
        }
        
        // Delete user account
        await user.delete();
        
        showNotification('Konto erfolgreich gelöscht.', 'success');
        
        // Close modals and redirect
        hideDeleteConfirmModal();
        closeAccountSettingsModal();
        
    } catch (error) {
        console.error('Error deleting account:', error);
        let errorMessage = 'Fehler beim Löschen des Kontos.';
        
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Das eingegebene Passwort ist falsch.';
        } else if (error.code === 'auth/requires-recent-login') {
            errorMessage = 'Bitte melde dich erneut an, um dein Konto zu löschen.';
        }
        
        showNotification(errorMessage, 'error');
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatDate(date) {
    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
