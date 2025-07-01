// main.js
// Hier können später die Slot-Game-Logik und Navigation ergänzt werden

// Balance Management - Global für alle Seiten
function updateBalance() {
    const balance = parseInt(localStorage.getItem('slot1_balance')) || 1000;
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = balance;
    }
}

// Balance beim Laden der Seite aktualisieren
document.addEventListener('DOMContentLoaded', function() {
    updateBalance();
    
    // Überwache LocalStorage Änderungen von anderen Tabs/Seiten
    window.addEventListener('storage', function(e) {
        if (e.key === 'slot1_balance') {
            updateBalance();
        }
    });
    
    // Überwache Focus-Events um Balance zu aktualisieren wenn User zurück zur Seite kommt
    window.addEventListener('focus', function() {
        updateBalance();
    });
});

document.querySelectorAll('.slot-card').forEach(card => {
    card.addEventListener('click', () => {
        const cardText = card.textContent.trim();
        if (cardText === 'Slot 1') {
            window.location.href = 'slot1.html';
        } else if (cardText === 'Slot 2') {
            // Hier kann später slot2.html verlinkt werden
            alert('Slot 2 wird bald verfügbar sein!');
        } else if (cardText === 'Slot 3') {
            // Hier kann später slot3.html verlinkt werden
            alert('Slot 3 wird bald verfügbar sein!');
        }
    });
});

// Slideshow für die Ad-Card
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
