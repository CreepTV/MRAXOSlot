/**
 * Level-Display.js
 * Übernimmt die Aktualisierung der Level-Anzeige im Header basierend auf dem LevelSystem
 */

// Level-Anzeige aktualisieren, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    // Funktion zur Aktualisierung des Levels im Header
    function updateLevelDisplay() {
        if (window.levelSystem && typeof window.levelSystem.currentLevel !== 'undefined') {
            // Update the level number
            const levelElement = document.getElementById('header-level-number');
            if (levelElement) {
                levelElement.textContent = window.levelSystem.currentLevel;
                console.log('🎮 Level angezeigt:', window.levelSystem.currentLevel);
            }
            
            // Update XP progress bar if it exists
            const headerXpBar = document.getElementById('header-xp-bar');
            if (headerXpBar && window.levelSystem.initialized) {
                const progress = window.levelSystem.getCurrentLevelProgress();
                headerXpBar.style.width = `${progress.percentage}%`;
            }
            
            // Update XP text if it exists
            const headerXpText = document.getElementById('header-xp-text');
            if (headerXpText && window.levelSystem.initialized) {
                const progress = window.levelSystem.getCurrentLevelProgress();
                headerXpText.textContent = `${progress.current} XP / ${progress.needed} XP`;
            }
        }
    }
    
    // Sofort versuchen, das Level anzuzeigen
    updateLevelDisplay();
    
    // Wenn das Level-System noch nicht initialisiert ist, auf Initialisierung warten
    if (window.levelSystem && !window.levelSystem.initialized) {
        const checkInterval = setInterval(function() {
            if (window.levelSystem && window.levelSystem.initialized) {
                updateLevelDisplay();
                clearInterval(checkInterval);
                console.log('🎮 Level-System initialisiert, Level aktualisiert');
            }
        }, 200);
    }
    
    // Level-Up-Funktion überschreiben, um UI automatisch zu aktualisieren
    if (window.levelSystem) {
        const originalLevelUp = window.levelSystem.levelUp;
        if (typeof originalLevelUp === 'function') {
            window.levelSystem.levelUp = async function(oldLevel, newLevel) {
                // Original-Funktion aufrufen
                await originalLevelUp.apply(this, arguments);
                
                // Level im UI aktualisieren
                updateLevelDisplay();
            };
        }
        
        // Auch die awardXP-Funktion überschreiben, um die Anzeige nach jedem XP-Gewinn zu aktualisieren
        const originalAwardXP = window.levelSystem.awardXP;
        if (typeof originalAwardXP === 'function') {
            window.levelSystem.awardXP = async function(amount, reason) {
                const result = await originalAwardXP.apply(this, arguments);
                
                // UI nach jedem XP-Gewinn aktualisieren
                updateLevelDisplay();
                
                return result;
            };
        }
    }
});
