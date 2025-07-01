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
        
        // Hide guest warning for logged in users
        toggleGuestWarning(false);
        
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
        
        // Show guest warning for non-logged in users
        toggleGuestWarning(true);
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
            countrySpan.innerHTML = `<img class="country-flag" src="${flagUrl}" alt="${userData.country}" onerror="this.src='https://flagcdn.com/w40/xx.png'" />${userData.country}`;
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
        editBtn.style.display = isOwnProfile ? 'inline-block' : 'none';
    }
    
    const editSection = document.getElementById('profile-modal-edit');
    if (editSection) {
        editSection.style.display = 'none';
    }

    // Modal anzeigen
    modal.style.display = 'flex';
    
    // Custom country select nach dem Anzeigen des Modals initialisieren
    setTimeout(() => {
        setupCustomCountrySelect();
    }, 50);
    
    console.log('✅ Profile modal shown');
}

// Hilfsfunktion: Flaggen-URL aus Land
function getCountryFlag(country) {
    const flagCodes = {
        'Germany': 'de',
        'Austria': 'at',
        'Switzerland': 'ch',
        'France': 'fr',
        'Italy': 'it',
        'Spain': 'es',
        'Poland': 'pl',
        'Netherlands': 'nl',
        'Turkey': 'tr',
        'UK': 'gb',
        'United Kingdom': 'gb',
        'USA': 'us',
        'Canada': 'ca',
        'Russia': 'ru',
        'Japan': 'jp',
        'China': 'cn',
        'Brazil': 'br',
        'Australia': 'au'
    };
    const countryCode = flagCodes[country];
    return countryCode ? `https://flagcdn.com/w40/${countryCode}.png` : 'https://flagcdn.com/w40/xx.png';
}

// Hilfsfunktion: Deutsche Ländernamen
function getCountryDisplayName(country) {
    const displayNames = {
        'Germany': 'Deutschland',
        'Austria': 'Österreich',
        'Switzerland': 'Schweiz',
        'France': 'Frankreich',
        'Italy': 'Italien',
        'Spain': 'Spanien',
        'Poland': 'Polen',
        'Netherlands': 'Niederlande',
        'Turkey': 'Türkei',
        'UK': 'Vereinigtes Königreich',
        'United Kingdom': 'Vereinigtes Königreich',
        'USA': 'USA',
        'Canada': 'Kanada',
        'Russia': 'Russland',
        'Japan': 'Japan',
        'China': 'China',
        'Brazil': 'Brasilien',
        'Australia': 'Australien'
    };
    return displayNames[country] || country;
}

// Update flag in select visually (for Chrome/Edge)
function updateCountryFlagInSelect() {
    const select = document.getElementById('edit-country');
    if (!select) return;
    
    // Entferne alte Flaggen-Anzeige wenn vorhanden
    const existingFlag = select.parentNode.querySelector('.select-flag-preview');
    if (existingFlag) {
        existingFlag.remove();
    }
    
    if (select.value) {
        const flagUrl = getCountryFlag(select.value);
        const flagImg = document.createElement('img');
        flagImg.src = flagUrl;
        flagImg.className = 'select-flag-preview';
        flagImg.alt = select.value;
        flagImg.onerror = function() { this.src = 'https://flagcdn.com/w40/xx.png'; };
        
        // Füge die Flagge vor dem Select ein
        select.parentNode.insertBefore(flagImg, select);
    }
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
        document.getElementById('profile-modal-edit').style.display = 'block';
        updateCountryFlagInSelect();
    };
}

// Live-Flagge beim Wechseln des Landes
if (document.getElementById('edit-country')) {
    document.getElementById('edit-country').addEventListener('change', updateCountryFlagInSelect);
}

// Speichern-Button
if (document.getElementById('save-profile-btn')) {
    document.getElementById('save-profile-btn').onclick = async function() {
        const username = document.getElementById('edit-username').value.trim();
        const comment = document.getElementById('edit-comment').value.trim();
        const imglink = document.getElementById('edit-imglink').value.trim();
        const country = document.getElementById('edit-country').value;
        if (!currentUserState.user) return;
        
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
        
        openProfileModal(currentUserState.userData, true);
        document.getElementById('profile-modal-edit').style.display = 'none';
    };
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
    
    // TEST: Füge temporären Test-Button hinzu
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test Profil-Popup';
    testBtn.style.position = 'fixed';
    testBtn.style.top = '100px';
    testBtn.style.left = '10px';
    testBtn.style.zIndex = '1000';
    testBtn.style.background = '#d4af37';
    testBtn.style.color = '#1a1a1a';
    testBtn.style.border = 'none';
    testBtn.style.padding = '10px 15px';
    testBtn.style.borderRadius = '8px';
    testBtn.style.cursor = 'pointer';
    testBtn.style.fontWeight = 'bold';
    
    testBtn.addEventListener('click', function() {
        console.log('🧪 Test profile button clicked');
        showGuestProfile();
    });
    
    document.body.appendChild(testBtn);
    console.log('✅ Test profile button added');
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

// Setup custom country select dropdown
function setupCustomCountrySelect() {
    const customSelect = document.getElementById('custom-country-select');
    if (!customSelect) {
        console.log('❌ Custom select not found');
        return;
    }
    
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
