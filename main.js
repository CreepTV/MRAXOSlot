// main.js
// Hier können später die Slot-Game-Logik und Navigation ergänzt werden

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
