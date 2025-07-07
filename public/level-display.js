/**
 * Level-Display.js
 * Übernimmt die Aktualisierung der Level-Anzeige im Header basierend auf dem LevelSystem
 * Verbesserte Version mit robusterer UI-Aktualisierung
 */

// Level-Anzeige aktualisieren, wenn das DOM geladen ist
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Level-Display.js geladen - Initialisiere Level-Anzeigen');
    
    // Funktion zur Aktualisierung des Levels im Header
    function updateLevelDisplay() {
        if (window.levelSystem && typeof window.levelSystem.currentLevel !== 'undefined') {
            console.log('🎮 Aktualisiere Level-Anzeige mit Level:', window.levelSystem.currentLevel);
            
            // Update all level number elements
            const levelElements = document.querySelectorAll('.level-number, #header-level-number');
            levelElements.forEach(element => {
                element.textContent = window.levelSystem.currentLevel;
                console.log(`🎮 Level aktualisiert in Element ${element.id || 'ohne ID'}`);
            });
            
            // Update all XP progress bars
            if (window.levelSystem.initialized) {
                // Debug: Zeige aktuelle XP-Werte direkt aus dem levelSystem
                console.log('🔍 DEBUG XP-Werte:', {
                    currentLevel: window.levelSystem.currentLevel,
                    currentXP: window.levelSystem.currentXP,
                    totalXP: window.levelSystem.getTotalXP(),
                    baseXPRequired: window.levelSystem.levelConfig.baseXPRequired,
                    xpMultiplier: window.levelSystem.levelConfig.xpMultiplier
                });
                
                // Berechne XP-Fortschritt
                const progress = window.levelSystem.getCurrentLevelProgress();
                
                // Debug: Zeige berechneten Fortschritt
                console.log(`📊 XP-Fortschritt: ${progress.current}/${progress.needed} (${progress.percentage}%)`);
                
                // Aktualisiere alle XP-Fortschrittsbalken
                const xpBars = document.querySelectorAll('.xp-progress-fill, #header-xp-bar');
                xpBars.forEach(bar => {
                    bar.style.width = `${progress.percentage}%`;
                    console.log(`📊 XP-Bar aktualisiert: ${progress.percentage}%`);
                });
                
                // Aktualisiere alle XP-Text-Elemente
                const xpTextElements = document.querySelectorAll('.xp-text, #header-xp-text');
                xpTextElements.forEach(element => {
                    // Explizit die Werte als Zahlen formatieren
                    const xpText = `${progress.current.toLocaleString()} XP / ${progress.needed.toLocaleString()} XP`;
                    element.textContent = xpText;
                    console.log(`📊 XP-Text aktualisiert: ${xpText}`);
                });
                
                // Debug: Liste alle gefundenen Elemente auf
                console.log(`🔍 Gefundene XP-Bars: ${xpBars.length}, XP-Text-Elemente: ${xpTextElements.length}`);
            }
        } else {
            console.log('⚠️ Level-System noch nicht verfügbar');
        }
    }
    
    // Sofort versuchen, das Level anzuzeigen
    updateLevelDisplay();
    
    // Einmalige zusätzliche Aktualisierung nach 1 Sekunde (für den Fall, dass das Level-System verzögert geladen wird)
    setTimeout(() => {
        console.log('🔄 Verzögerte Aktualisierung der Level-Anzeige');
        updateLevelDisplay();
        
        // Debug-Ausgabe des LevelSystems, wenn verfügbar
        if (window.levelSystem && window.levelSystem.debugXPStatus) {
            console.log('🔍 Debug-Ausgabe aus verzögerter Aktualisierung:');
            window.levelSystem.debugXPStatus();
        }
    }, 1000);
    
    // Wenn das Level-System noch nicht initialisiert ist, auf Initialisierung warten
    if (!window.levelSystem || !window.levelSystem.initialized) {
        console.log('🔄 Warte auf Level-System Initialisierung...');
        const checkInterval = setInterval(function() {
            if (window.levelSystem && window.levelSystem.initialized) {
                updateLevelDisplay();
                clearInterval(checkInterval);
                console.log('✅ Level-System initialisiert, Level aktualisiert');
            }
        }, 200);
    }
    
    // Registriere einen Event-Listener für XP-Änderungen
    window.addEventListener('xp-changed', function(event) {
        console.log('🔄 XP-Changed Event empfangen - aktualisiere Level-Anzeige', event.detail);
        
        // Direkt aktualisieren
        updateLevelDisplay();
        
        // Und noch einmal nach einer kurzen Verzögerung (falls asynchrone Operationen stattfinden)
        setTimeout(updateLevelDisplay, 100);
        setTimeout(updateLevelDisplay, 500);
    });
    
    // Level-Up-Funktion überschreiben, um UI automatisch zu aktualisieren
    if (window.levelSystem) {
        const originalLevelUp = window.levelSystem.levelUp;
        if (typeof originalLevelUp === 'function') {
            window.levelSystem.levelUp = async function(oldLevel, newLevel) {
                console.log(`🎉 Level-Up erkannt: ${oldLevel} -> ${newLevel}`);
                // Original-Funktion aufrufen
                await originalLevelUp.apply(this, arguments);
                
                // Level im UI aktualisieren
                updateLevelDisplay();
                
                // Event auslösen für andere UI-Elemente
                const levelUpEvent = new CustomEvent('level-up', { 
                    detail: { oldLevel, newLevel }
                });
                window.dispatchEvent(levelUpEvent);
            };
        }
        
        // Auch die awardXP-Funktion überschreiben, um die Anzeige nach jedem XP-Gewinn zu aktualisieren
        const originalAwardXP = window.levelSystem.awardXP;
        if (typeof originalAwardXP === 'function') {
            window.levelSystem.awardXP = async function(amount, reason) {
                console.log(`🎯 XP-Vergabe erkannt: +${amount} (${reason})`);
                const result = await originalAwardXP.apply(this, arguments);
                
                // UI nach jedem XP-Gewinn aktualisieren
                updateLevelDisplay();
                
                // Event auslösen für andere UI-Elemente
                const xpEvent = new CustomEvent('xp-changed', { 
                    detail: { amount, reason }
                });
                window.dispatchEvent(xpEvent);
                
                return result;
            };
        }
        
        // Zusätzlich die awardSpinXP-Funktion überschreiben
        const originalAwardSpinXP = window.levelSystem.awardSpinXP;
        if (typeof originalAwardSpinXP === 'function') {
            window.levelSystem.awardSpinXP = async function(betAmount, winAmount) {
                console.log(`🎰 Spin-XP-Vergabe: Einsatz=${betAmount}, Gewinn=${winAmount}`);
                const result = await originalAwardSpinXP.apply(this, arguments);
                
                // UI nach jedem Spin-XP-Gewinn aktualisieren
                updateLevelDisplay();
                
                return result;
            };
        }
    }
    
    // Überwache DOM-Mutationen, um sicherzustellen, dass die Level-Anzeige auch bei dynamisch hinzugefügten Elementen aktualisiert wird
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Prüfen, ob relevante Level-Elemente hinzugefügt wurden
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1) { // Element-Node
                        if (node.querySelector('#header-level-number, .level-number, #header-xp-bar, .xp-progress-fill')) {
                            console.log('🔍 Neue Level-Elemente erkannt - aktualisiere Anzeige');
                            updateLevelDisplay();
                            break;
                        }
                    }
                }
            }
        });
    });
    
    // Beobachte den gesamten Body für DOM-Änderungen
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Level-Display vollständig initialisiert');
});
