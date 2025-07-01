// main.js - SOFORT FUNKTIONERENDE VERSION

console.log('🚀 Script lädt...');

// DROPDOWN FUNKTIONALITÄT - SOFORT BEIM LADEN
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM geladen');
    
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

function updateBalance() {
    const balance = parseInt(localStorage.getItem('slot1_balance')) || 1000;
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = balance;
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

// EXPORT FUNCTIONS
window.updateUserBalance = function(newBalance) {
    localStorage.setItem('slot1_balance', newBalance.toString());
    updateBalance();
};

window.getCurrentBalance = function() {
    return parseInt(localStorage.getItem('slot1_balance')) || 1000;
};

console.log('🎯 Script geladen - Dropdown sollte funktionieren!');
