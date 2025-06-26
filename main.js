// main.js
// Hier können später die Slot-Game-Logik und Navigation ergänzt werden

document.querySelectorAll('.slot-card').forEach(card => {
    card.addEventListener('click', () => {
        alert('Slot-Game öffnen: ' + card.textContent);
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
