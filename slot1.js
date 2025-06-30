document.addEventListener('DOMContentLoaded', function() {
  // Ladebildschirm-Logik
  function initializeLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');
    
    const loadingSteps = [
      { text: 'Initialisiere Spiel...', duration: 400 },
      { text: 'Lade Grafiken...', duration: 700 },
      { text: 'Lade Sounds...', duration: 300 },
      { text: 'Bereite Walzen vor...', duration: 500 },
      { text: 'Starte Spiel...', duration: 300 }
    ];
    
    let currentStep = 0;
    let progress = 0;
    
    function updateLoadingStep() {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        loadingText.textContent = step.text;
        
        const targetProgress = ((currentStep + 1) / loadingSteps.length) * 100;
        
        // Progress Bar animieren
        const progressInterval = setInterval(() => {
          progress += 2;
          if (progress >= targetProgress) {
            progress = targetProgress;
            clearInterval(progressInterval);
            
            setTimeout(() => {
              currentStep++;
              if (currentStep < loadingSteps.length) {
                updateLoadingStep();
              } else {
                // Ladevorgang abgeschlossen
                completeLoading();
              }
            }, step.duration);
          }
          progressBar.style.width = progress + '%';
        }, 30);
      }
    }
    
    function completeLoading() {
      loadingText.textContent = 'Fertig!';
      progressBar.style.width = '100%';
      
      setTimeout(() => {
        // Ladebildschirm ausblenden
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transform = 'scale(0.9)';
        loadingScreen.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          mainContent.style.display = 'block';
          mainContent.classList.add('loaded');
          
          // JETZT ist das Laden abgeschlossen
          loadingComplete = true;
          console.log('🎵 Ladevorgang ABGESCHLOSSEN - loadingComplete = true');
          
          // Starte Pop-in Animationen nach dem Laden
          setTimeout(() => {
            startPopInAnimations();
            
            // Prüfe ob bereits User-Interaktion stattgefunden hat
            if (userInteracted && !musicStarted) {
              console.log('🎵 User-Interaktion bereits erkannt - starte Audio-System JETZT');
              startAudioSystem();
              
              // Remove ALL event listeners nach erfolgreichem Start
              interactionEvents.forEach(eventType => {
                document.removeEventListener(eventType, handleFirstInteraction);
              });
            } else {
              // Versuche Auto-Play NACH dem Ladebildschirm
              attemptAutoPlay();
            }
          }, 200);
        }, 500);
      }, 500);
    }
    
    // Ladevorgang starten
    setTimeout(() => {
      updateLoadingStep();
    }, 800);
  }
  
  // Ladebildschirm initialisieren
  initializeLoadingScreen();
  // Pop-in Animationen starten
  function startPopInAnimations() {
    // Header Elemente
    const header = document.querySelector('header');
    const balance = document.querySelector('.balance');
    const backButton = document.querySelector('.back');
    
    // Slot Machine Elemente
    const slotMachine = document.querySelector('.slot-machine');
    const reels = document.querySelectorAll('.reel');
    const leftEmoji = document.querySelector('.left-emoji');
    const rightEmoji = document.querySelector('.right-emoji');
    const spinButton = document.querySelector('#spin');
    const betControl = document.querySelector('.bet-control');
    
    // Header Pop-in
    if (header) header.classList.add('pop-in-header');
    if (balance) balance.classList.add('pop-in-balance');
    if (backButton) backButton.classList.add('pop-in-back-button');
    
    // Slot Machine Pop-in
    if (slotMachine) slotMachine.classList.add('pop-in-slot-machine');
    
    // Reels Pop-in
    reels.forEach(reel => {
      reel.classList.add('pop-in-reel');
    });
    
    // Side Emojis Pop-in
    if (leftEmoji) leftEmoji.classList.add('pop-in-side-emoji');
    if (rightEmoji) rightEmoji.classList.add('pop-in-side-emoji');
    
    // Spin Button Pop-in
    if (spinButton) spinButton.classList.add('pop-in-spin-button');
    
    // Bet Control Pop-in
    if (betControl) betControl.classList.add('pop-in-bet-control');
  }

  // KOMPLETT ÜBERARBEITETES AUDIO-SYSTEM
  // ==============================================
  
  // Audio-Objekte
  const startSound = new Audio('data/sounds/ElevenSoundEffects/Slot_Maschine_Start.mp3');
  startSound.volume = 0.2;
  
  const musicStems = {
    vocals: new Audio('data/sounds/Electro SwingStems/vocals.m4a'),
    bass: new Audio('data/sounds/Electro SwingStems/bass.m4a'),
    drums: new Audio('data/sounds/Electro SwingStems/drums.m4a'),
    piano: new Audio('data/sounds/Electro SwingStems/piano.m4a'),
    guitar: new Audio('data/sounds/Electro SwingStems/guitar.m4a'),
    other: new Audio('data/sounds/Electro SwingStems/other.m4a')
  };

  // ZENTRALE STEUERUNGSVARIABLEN
  let musicStarted = false;
  let loadingComplete = false;
  let userInteracted = false;
  let autoPlayBlocked = false;
  let spinMusicTimeout = null;
  let isFadingOut = false;
  
  // Stems konfigurieren
  Object.keys(musicStems).forEach(stemName => {
    const stem = musicStems[stemName];
    stem.loop = true;
    stem.volume = 0;
    stem.preload = 'auto';
    
    if (['vocals', 'bass', 'drums', 'piano'].includes(stemName)) {
      stem.targetVolume = 0.15;
    } else {
      stem.targetVolume = 0.12;
    }
  });

  // ZENTRALE AUDIO-START FUNKTION - NUR HIER WIRD MUSIK GESTARTET!
  function startAudioSystem() {
    // Doppel-Check: Nur starten wenn Laden abgeschlossen UND nicht bereits gestartet
    if (!loadingComplete || musicStarted) {
      console.log('🎵 Audio-Start blockiert - loadingComplete:', loadingComplete, 'musicStarted:', musicStarted);
      return;
    }
    
    console.log('🎵 STARTE AUDIO-SYSTEM JETZT!');
    musicStarted = true;
    
    // Start-Sound abspielen
    startSound.currentTime = 0;
    const playPromise = startSound.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('✅ Start-Sound erfolgreich');
        setTimeout(() => startInteractiveMusic(), 800);
      }).catch(error => {
        console.log('❌ Start-Sound blockiert, starte trotzdem Musik:', error);
        startInteractiveMusic();
      });
    } else {
      startInteractiveMusic();
    }
  }

  // Prüfe ob bereits von Startseite navigiert wurde
  function checkForPreviousInteraction() {
    if (document.referrer && document.referrer.includes('index.html')) {
      userInteracted = true;
      console.log('Navigation von Startseite erkannt');
      localStorage.setItem('slotGameAccessed', 'true');
      return true;
    }
    
    if (sessionStorage.getItem('slotGameNavigation') === 'true') {
      userInteracted = true;
      console.log('Slot-Game Navigation aus sessionStorage erkannt');
      sessionStorage.removeItem('slotGameNavigation');
      localStorage.setItem('slotGameAccessed', 'true');
      return true;
    }
    
    if (localStorage.getItem('slotGameAccessed') === 'true') {
      userInteracted = true;
      console.log('Slot-Game wurde bereits früher besucht');
      return true;
    }
    
    return false;
  }

  // NEUE VEREINFACHTE attemptAutoPlay FUNKTION
  function attemptAutoPlay() {
    // Nur versuchen wenn Laden abgeschlossen
    if (!loadingComplete) {
      console.log('🎵 attemptAutoPlay aufgerufen, aber Laden noch nicht abgeschlossen');
      return;
    }
    
    // Prüfe gespeicherte Musik-Präferenz
    const musicPreference = localStorage.getItem('musicPreference');
    if (musicPreference === 'disabled') {
      console.log('🎵 Musik ist vom User deaktiviert - überspringe Auto-Play');
      return;
    }
    
    const hadPreviousInteraction = checkForPreviousInteraction();
    
    if (hadPreviousInteraction || userInteracted) {
      console.log('🎵 User-Interaktion bekannt - starte Audio-System direkt');
      startAudioSystem();
      return;
    }
    
    // Auto-Play Test
    const testAudio = new Audio();
    testAudio.volume = 0;
    testAudio.muted = true;
    
    const playPromise = testAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        autoPlayBlocked = false;
        console.log('🎵 Auto-Play verfügbar - starte Audio');
        testAudio.pause();
        setTimeout(() => startAudioSystem(), 500);
      }).catch(error => {
        autoPlayBlocked = true;
        console.log('🎵 Auto-Play blockiert - zeige Benachrichtigung');
        showAutoPlayNotification();
      });
    } else {
      showAutoPlayNotification();
    }
  }

  // Auto-Play Benachrichtigung (vereinfacht)
  function showAutoPlayNotification() {
    const notification = document.createElement('div');
    notification.id = 'autoplay-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #2e2e4f, #474772);
      color: #f7d203;
      padding: 12px 20px;
      border-radius: 8px;
      border: 2px solid #f7d203;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1001;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    notification.innerHTML = `🎵 Klicken Sie hier, um Musik zu aktivieren`;

    notification.addEventListener('click', () => {
      userInteracted = true;
      if (loadingComplete) {
        startAudioSystem();
      }
      document.body.removeChild(notification);
    });

    document.body.appendChild(notification);

    // Auto-remove nach 10 Sekunden
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 10000);
  }

  // Enhanced User-Interaktion Detection - KOMPLETT NEU
  const interactionEvents = ['click', 'keydown', 'touchstart', 'mousedown', 'pointerdown'];
  
  function handleFirstInteraction(event) {
    // Immer als User-Interaktion markieren
    userInteracted = true;
    autoPlayBlocked = false;
    
    console.log('🎵 USER-INTERAKTION ERKANNT - loadingComplete:', loadingComplete, 'musicStarted:', musicStarted);
    
    // Remove notification sofort
    const notification = document.getElementById('autoplay-notification');
    if (notification && document.body.contains(notification)) {
      try {
        document.body.removeChild(notification);
      } catch(e) {}
    }
    
    // NUR starten wenn Laden abgeschlossen UND noch nicht gestartet
    if (loadingComplete && !musicStarted) {
      console.log('🎵 Alles bereit - STARTE AUDIO-SYSTEM!');
      startAudioSystem();
      
      // Remove ALL event listeners nach erfolgreichem Start
      interactionEvents.forEach(eventType => {
        document.removeEventListener(eventType, handleFirstInteraction);
      });
    } else if (!loadingComplete) {
      console.log('🎵 Interaktion gespeichert - warte auf Ende des Ladens');
    } else {
      console.log('🎵 Musik läuft bereits');
    }
  }

  // Funktion zum Aktivieren der Interaction Listeners (sofort beim Start)
  function activateInteractionListeners() {
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { 
        passive: false,
        capture: true
      });
    });
    
    window.addEventListener('focus', handleFirstInteraction, { once: true });
    console.log('🎵 Interaction Listeners SOFORT aktiviert');
  }
  
  // Aktiviere Listeners SOFORT beim Seitenladen
  activateInteractionListeners();

  // Smooth Fade-in/out Funktion
  function fadeAudio(audioElement, targetVolume, duration = 1000) {
    const startVolume = audioElement.volume;
    const volumeDiff = targetVolume - startVolume;
    const startTime = Date.now();
    
    if (targetVolume > 0 && audioElement.paused) {
      audioElement.play().catch(error => {
        console.log('Audio konnte nicht abgespielt werden:', error);
      });
    }
    
    function updateVolume() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      audioElement.volume = Math.max(0, Math.min(1, startVolume + (volumeDiff * easeProgress)));
      
      if (progress < 1) {
        requestAnimationFrame(updateVolume);
      } else {
        audioElement.volume = targetVolume;
        if (targetVolume === 0 && !isFadingOut) {
          setTimeout(() => {
            if (audioElement.volume === 0) {
              audioElement.pause();
            }
          }, 100);
        }
      }
    }
    
    requestAnimationFrame(updateVolume);
  }

  // Interaktive Musik starten (NUR AUS startAudioSystem aufrufen!)
  function startInteractiveMusic() {
    console.log('🎵 Starte interaktive Musik...');
    
    // WICHTIG: Alle Stems gleichzeitig starten für perfekte Synchronisation
    const startPromises = [];
    
    // Basis-Stems (vocals, bass, drums, piano) - diese sind hörbar
    ['vocals', 'bass', 'drums', 'piano'].forEach(stemName => {
      const stem = musicStems[stemName];
      stem.currentTime = 0; // Alle bei 0 starten
      stem.volume = 0;
      
      const playPromise = stem.play().then(() => {
        console.log(`✅ ${stemName} Stem gestartet`);
        fadeAudio(stem, stem.targetVolume, 2000);
      }).catch(error => {
        console.error(`❌ ${stemName} Stem Fehler:`, error);
      });
      
      startPromises.push(playPromise);
    });
    
    // Spin-Stems (guitar, other) - diese starten stumm aber SYNCHRON
    ['guitar', 'other'].forEach(stemName => {
      const stem = musicStems[stemName];
      stem.currentTime = 0; // WICHTIG: Auch diese bei 0 starten
      stem.volume = 0;
      
      const playPromise = stem.play().then(() => {
        console.log(`✅ ${stemName} Stem bereit (stumm aber synchron)`);
      }).catch(error => {
        console.error(`❌ ${stemName} Stem Fehler:`, error);
      });
      
      startPromises.push(playPromise);
    });
    
    // Warte bis alle Stems gestartet sind
    Promise.all(startPromises).then(() => {
      console.log('🎵 Alle Stems erfolgreich synchronisiert gestartet!');
    }).catch(error => {
      console.log('🎵 Einige Stems konnten nicht gestartet werden, aber weiter...');
    });
  }

  // Spin-Musik aktivieren (Guitar und Other entstummen)
  function activateSpinMusic() {
    if (!musicStarted) return;
    
    // Stop any existing fade-out process
    isFadingOut = false;
    
    // Clear existing timeout
    if (spinMusicTimeout) {
      clearTimeout(spinMusicTimeout);
    }
    
    // SYNCHRONISATION: Nutze die aktuelle Zeit der Basis-Stems als Referenz
    const referenceTime = musicStems.vocals.currentTime;
    
    // Stelle sicher, dass Guitar und Other laufen (falls sie pausiert wurden)
    if (musicStems.guitar.paused) {
      musicStems.guitar.currentTime = referenceTime; // SYNC!
      musicStems.guitar.play().catch(error => {
        console.log('Guitar Stem konnte nicht abgespielt werden:', error);
      });
    } else {
      // Auch wenn bereits läuft, synchronisiere die Zeit
      musicStems.guitar.currentTime = referenceTime;
    }
    
    if (musicStems.other.paused) {
      musicStems.other.currentTime = referenceTime; // SYNC!
      musicStems.other.play().catch(error => {
        console.log('Other Stem konnte nicht abgespielt werden:', error);
      });
    } else {
      // Auch wenn bereits läuft, synchronisiere die Zeit
      musicStems.other.currentTime = referenceTime;
    }
    
    // Fade-in Guitar und Other
    fadeAudio(musicStems.guitar, musicStems.guitar.targetVolume, 800);
    fadeAudio(musicStems.other, musicStems.other.targetVolume, 800);
    
    // Nach 20 Sekunden ohne Spin, fade out
    spinMusicTimeout = setTimeout(() => {
      deactivateSpinMusic();
    }, 20000);
  }

  // Spin-Musik deaktivieren (Guitar und Other stummen)
  function deactivateSpinMusic() {
    if (!musicStarted || isFadingOut) return;
    
    isFadingOut = true;
    
    // Langsamerer Fade-out für Guitar und Other
    fadeAudio(musicStems.guitar, 0, 2000);
    fadeAudio(musicStems.other, 0, 2000);
    
    setTimeout(() => {
      isFadingOut = false;
    }, 2000);
  }

  // Reset Spin-Musik Timer (bei erneutem Spin)
  function resetSpinMusicTimer() {
    if (spinMusicTimeout) {
      clearTimeout(spinMusicTimeout);
    }
    
    // Wenn Stems bereits stumm sind, aktiviere sie wieder
    if (musicStems.guitar.volume === 0 || musicStems.other.volume === 0) {
      activateSpinMusic();
      return;
    }
    
    spinMusicTimeout = setTimeout(() => {
      deactivateSpinMusic();
    }, 20000);
  }

  // Musik komplett stoppen (falls benötigt)
  function stopAllMusic() {
    Object.values(musicStems).forEach(stem => {
      fadeAudio(stem, 0, 1000);
    });
    
    setTimeout(() => {
      Object.values(musicStems).forEach(stem => {
        stem.pause();
        stem.currentTime = 0;
      });
      musicStarted = false;
    }, 1000);
  }
  
  let spinning = false;
  let fastStop = false;
  let spinTimeouts = [];
  let finishReelFns = [];
  let finished = [false, false, false];
  let reelFinalOffsets = [0, 0, 0];
  let autoSpinActive = false;
  let autoSpinInterval = null;
  let buttonPressed = false;
  let buttonPressTimer = null;

  const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '🔔', '🍇', '💎', '🍀'];
  const winTable = {
    // Drei gleiche Symbole (Hauptgewinne)
    '🍒🍒🍒': 50,
    '🍋🍋🍋': 30,
    '🍊🍊🍊': 20,
    '🍉🍉🍉': 100,
    '⭐⭐⭐': 200,
    '🔔🔔🔔': 500,
    '🍇🍇🍇': 80,
    '💎💎💎': 300,
    '🍀🍀🍀': 1000,
    
    // Zwei gleiche Symbole (kleinere Gewinne)
    '🍒🍒': 5,    // Zwei Kirschen
    '🍋🍋': 3,    // Zwei Zitronen
    '🍊🍊': 2,    // Zwei Orangen
    '🍉🍉': 8,    // Zwei Wassermelonen
    '⭐⭐': 15,   // Zwei Sterne
    '🔔🔔': 25,   // Zwei Glocken
    '🍇🍇': 6,    // Zwei Trauben
    '💎💎': 20,   // Zwei Diamanten
    '🍀🍀': 50,   // Zwei Kleeblätter
    
    // Spezielle Kombinationen (Mixed Wins)
    '🍒🍋🍊': 4,    // Früchte-Mix
    '🍉🍇🍊': 6,    // Früchte-Mix Premium
    '⭐💎🍀': 25,   // Lucky-Mix (Stern, Diamant, Kleeblatt)
    '🔔⭐💎': 30,   // Premium-Mix (Glocke, Stern, Diamant)
    '🍀💎⭐': 25,   // Lucky-Mix (andere Reihenfolge)
    
    // Beliebige zwei hohe Symbole
    '💎🍀': 15,     // Diamant + Kleeblatt
    '🔔💎': 18,     // Glocke + Diamant
    '🔔🍀': 20,     // Glocke + Kleeblatt
    '⭐💎': 12,     // Stern + Diamant
    '⭐🍀': 15,     // Stern + Kleeblatt
    '⭐🔔': 18,     // Stern + Glocke
  };

  const betSteps = [10, 30, 50, 70, 90, 100, 120, 160, 200, 250, 300, 400, 500, 700, 850, 1000, 1300, 1700, 2500];
  let betIndex = 0;
  let bet = betSteps[betIndex];

  const balanceEl = document.getElementById('balance');
  const spinBtn = document.getElementById('spin');
  const resultEl = document.getElementById('result');
  const strips = [
    document.getElementById('strip1'),
    document.getElementById('strip2'),
    document.getElementById('strip3')
  ];
  const betAmountEl = document.getElementById('bet-amount');
  const betMinus = document.getElementById('bet-minus');
  const betPlus = document.getElementById('bet-plus');

  let balance = parseInt(localStorage.getItem('slot1_balance')) || 1000;
  updateBalance();
  updateBetDisplay();

  // Initialize spin button
  spinBtn.textContent = '';
  spinBtn.className = '';

  // Seitenanimationen - Große Emojis (früh definieren)
  const leftEmoji = document.getElementById('left-side-emoji');
  const rightEmoji = document.getElementById('right-side-emoji');

  // Emoji-Sets für verschiedene Situationen
  const emojiSets = {
    idle: ['🎰', '🍀'],
    spinning: ['🌀', '⚡'],
    win: ['🎉', '💰'],
    bigWin: ['🔥', '✨'],
    jackpot: ['💎', '👑'],
    autoSpin: ['🤖', '🔄'],
    lose: ['😔', '💸']
  };

  let currentEmojiState = 'idle';
  let emojiAnimationTimeout = null;

  function updateSideEmojis(state, duration = 3000) {
    // Prüfe ob Elemente existieren
    if (!leftEmoji || !rightEmoji) return;
    
    if (emojiAnimationTimeout) {
      clearTimeout(emojiAnimationTimeout);
    }

    // Entferne alle Klassen
    leftEmoji.className = 'side-emoji left-emoji';
    rightEmoji.className = 'side-emoji right-emoji';

    // Setze neue Emojis
    if (emojiSets[state]) {
      leftEmoji.textContent = emojiSets[state][0];
      rightEmoji.textContent = emojiSets[state][1];
    }

    // Füge Animation hinzu
    if (state !== 'idle') {
      leftEmoji.classList.add(state === 'bigWin' ? 'big-win' : state);
      rightEmoji.classList.add(state === 'bigWin' ? 'big-win' : state);
    }

    currentEmojiState = state;

    // Zurück zu idle nach bestimmter Zeit
    if (state !== 'idle' && state !== 'autoSpin') {
      emojiAnimationTimeout = setTimeout(() => {
        updateSideEmojis('idle');
      }, duration);
    }
  }

  // Spezielle Emoji-Wechsel für bestimmte Ereignisse
  function triggerSpecialEmojiEvent(eventType) {
    // Prüfe ob Elemente existieren
    if (!leftEmoji || !rightEmoji) return;
    
    switch(eventType) {
      case 'lowBalance':
        if (balance < 100) {
          leftEmoji.textContent = '😰';
          rightEmoji.textContent = '💸';
          updateSideEmojis('lose', 4000);
        }
        break;
      case 'noMoney':
        leftEmoji.textContent = '💸';
        rightEmoji.textContent = '😭';
        updateSideEmojis('lose', 5000);
        break;
      case 'firstSpin':
        leftEmoji.textContent = '🎲';
        rightEmoji.textContent = '🎯';
        updateSideEmojis('spinning', 2000);
        break;
    }
  }

  function updateBetDisplay() {
    bet = betSteps[betIndex];
    betAmountEl.textContent = bet;
  }

  betMinus.addEventListener('click', () => {
    console.log('🎰 Bet Minus clicked, spinning:', spinning, 'betIndex:', betIndex);
    if (spinning) return;
    if (betIndex > 0) {
      betIndex--;
      updateBetDisplay();
      console.log('🎰 Bet decreased to:', bet);
    }
  });
  
  betPlus.addEventListener('click', () => {
    console.log('🎰 Bet Plus clicked, spinning:', spinning, 'betIndex:', betIndex);
    if (spinning) return;
    if (betIndex < betSteps.length - 1) {
      betIndex++;
      updateBetDisplay();
      console.log('🎰 Bet increased to:', bet);
    }
  });

  // Vereinfachte Button-Funktionalität

  spinBtn.addEventListener('mousedown', (e) => {
    console.log('🎰 Spin Button mousedown, autoSpinActive:', autoSpinActive);
    if (autoSpinActive) {
      // Bei AutoSpin sofort stoppen
      stopAutoSpin();
      return;
    }
    
    buttonPressed = true;
    
    // Timer für Long Press
    buttonPressTimer = setTimeout(() => {
      if (buttonPressed) {
        console.log('🎰 Long press detected - starting AutoSpin');
        startAutoSpin();
      }
    }, 800);
  });

  spinBtn.addEventListener('mouseup', (e) => {
    console.log('🎰 Spin Button mouseup, buttonPressed:', buttonPressed, 'autoSpinActive:', autoSpinActive);
    if (buttonPressTimer) {
      clearTimeout(buttonPressTimer);
      buttonPressTimer = null;
    }
    
    if (buttonPressed && !autoSpinActive) {
      // Nur spinnen wenn kein AutoSpin läuft
      console.log('🎰 Single click detected - handling spin');
      handleSpin();
    }
    
    buttonPressed = false;
  });

  spinBtn.addEventListener('mouseleave', (e) => {
    if (buttonPressTimer) {
      clearTimeout(buttonPressTimer);
      buttonPressTimer = null;
    }
    buttonPressed = false;
  });

  function handleSpin() {
    if (spinning && !fastStop) {
      // Early-Stop: Verkürze Wartezeiten (gleiche Geschwindigkeit, anderes Ergebnis)
      fastStop = true;
      
      // Button wird grau wenn Fast-Stop aktiviert wird
      if (!autoSpinActive) {
        spinBtn.className = 'fast-stop';
        console.log('🎰 Fast-Stop aktiviert - Button wird grau');
      }
      
      accelerateReelsToStop();
      return;
    }
    if (spinning && fastStop) {
      // Fast-Stop ist bereits aktiv, ignoriere weitere Klicks
      return;
    }
    if (balance < bet) {
      resultEl.textContent = 'Nicht genug Guthaben!';
      triggerSpecialEmojiEvent('noMoney');
      return;
    }

    // NOTFALL-MUSIK-START: Falls die Musik noch nicht läuft, starte sie beim Spinnen
    if (!musicStarted && loadingComplete) {
      console.log('🎵 NOTFALL: Starte Basis-Stems beim Spinnen, da Musik noch nicht aktiv');
      musicStarted = true;
      
      // WICHTIG: Alle Stems gleichzeitig starten für Synchronisation
      const notfallPromises = [];
      
      // Starte alle Stems synchron
      Object.keys(musicStems).forEach(stemName => {
        const stem = musicStems[stemName];
        stem.currentTime = 0; // Alle bei 0 starten
        stem.volume = 0;
        
        const playPromise = stem.play().then(() => {
          console.log(`✅ Notfall-Start: ${stemName} Stem gestartet`);
          
          // Nur Basis-Stems auf Zielvolumen faden
          if (['vocals', 'bass', 'drums', 'piano'].includes(stemName)) {
            fadeAudio(stem, stem.targetVolume, 1500);
          }
          // Guitar und Other bleiben stumm aber laufen synchron
        }).catch(error => {
          console.error(`❌ Notfall-Start: ${stemName} Stem Fehler:`, error);
        });
        
        notfallPromises.push(playPromise);
      });
      
      Promise.all(notfallPromises).then(() => {
        console.log('🎵 Notfall-Synchronisation erfolgreich!');
      });
    }

    // Reset Spin-Musik Timer bei erneutem Spin
    if (musicStarted) {
      // Wenn Guitar/Other bereits laufen, verlängere nur den Timer
      if (musicStems.guitar.volume > 0 || musicStems.other.volume > 0) {
        resetSpinMusicTimer();
      } else {
        // Wenn sie nicht laufen, aktiviere sie
        activateSpinMusic();
      }
    }

    performSpin();
  }

  function startAutoSpin() {
    if (balance < bet) {
      resultEl.textContent = 'Nicht genug Guthaben für AutoSpin!';
      triggerSpecialEmojiEvent('noMoney');
      return;
    }
    
    autoSpinActive = true;
    updateSideEmojis('autoSpin'); // Seitenanimation für AutoSpin
    spinBtn.textContent = '';
    spinBtn.className = 'auto-spin';
    
    // Erster Spin sofort
    performSpin();
    
    // Dann alle 3 Sekunden
    autoSpinInterval = setInterval(() => {
      if (!spinning && balance >= bet) {
        performSpin();
      } else if (balance < bet) {
        stopAutoSpin();
        resultEl.textContent = 'AutoSpin gestoppt - Nicht genug Guthaben!';
      }
    }, 3000);
  }

  function stopAutoSpin() {
    autoSpinActive = false;
    updateSideEmojis('idle'); // Zurück zu normalen Emojis
    if (autoSpinInterval) {
      clearInterval(autoSpinInterval);
      autoSpinInterval = null;
    }
    
    // Reset button to normal state
    spinBtn.textContent = '';
    spinBtn.className = spinning ? 'spinning' : '';
  }

  function performSpin() {
    // WICHTIG: Überprüfe vor jedem Spin, ob die Reels korrekt gefüllt sind
    resetReelsIfEmpty();
    
    spinning = true;
    fastStop = false;
    spinTimeouts = [];
    finishReelFns = [];
    finished = [false, false, false];
    reelFinalOffsets = [0, 0, 0];
    balance -= bet;
    updateBalance();
    resultEl.textContent = '';
    
    // Aktiviere Spin-Musik (Guitar und Other entstummen)
    activateSpinMusic();
    
    // Seitenanimation für Spinning (nur wenn nicht AutoSpin)
    if (!autoSpinActive) {
      updateSideEmojis('spinning', 2000);
    }
    
    // Set button to spinning state (unless in AutoSpin mode)
    if (!autoSpinActive) {
      spinBtn.textContent = '';
      spinBtn.className = 'spinning';
    }

    // Animation: Reels starten gleichzeitig, stoppen aber von links nach rechts
    // Finalsymbole werden am Ende der Animation sichtbar und die Animation läuft auf das richtige Muster aus
    const finalSymbols = [[], [], []];
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 3; i++) {
        finalSymbols[r][i] = symbols[Math.floor(Math.random() * symbols.length)];
      }
    }
    
    // Debug: Überprüfe generierte Finalsymbole
    console.log('🎰 Generierte Finalsymbole:', finalSymbols);
    
    // Stelle sicher, dass alle finalSymbols Arrays korrekt gefüllt sind
    finalSymbols.forEach((reelSymbols, reelIdx) => {
      if (!reelSymbols || reelSymbols.length !== 3) {
        console.warn(`🎰 Finalsymbole für Reel ${reelIdx + 1} unvollständig, repariere...`);
        finalSymbols[reelIdx] = [];
        for (let i = 0; i < 3; i++) {
          finalSymbols[reelIdx][i] = symbols[Math.floor(Math.random() * symbols.length)];
        }
      }
      // Zusätzliche Prüfung: Stelle sicher, dass alle Symbole gültig sind
      reelSymbols.forEach((sym, symIdx) => {
        if (!sym || !symbols.includes(sym)) {
          console.warn(`🎰 Ungültiges Symbol in finalSymbols[${reelIdx}][${symIdx}]: ${sym}, ersetze...`);
          finalSymbols[reelIdx][symIdx] = symbols[Math.floor(Math.random() * symbols.length)];
        }
      });
    });
    
    function finishReel(idx) {
      if (finished[idx]) return;
      finished[idx] = true;
      const strip = strips[idx];
      
      console.log(`🎰 Beende Reel ${idx + 1} mit Symbolen:`, finalSymbols[idx]);
      
      // Stoppe alle Animationen sofort
      strip.style.transition = 'none';
      strip.style.transform = 'translateY(0px)';
      
      // WICHTIG: Komplett neu aufbauen für saubere Darstellung
      strip.innerHTML = '';
      
      // Stelle sicher, dass finalSymbols[idx] korrekt gefüllt ist
      if (!finalSymbols[idx] || finalSymbols[idx].length !== 3) {
        console.warn(`🎰 Finalsymbole für Reel ${idx + 1} nicht korrekt, generiere neue`);
        finalSymbols[idx] = [];
        for (let i = 0; i < 3; i++) {
          finalSymbols[idx][i] = symbols[Math.floor(Math.random() * symbols.length)];
        }
      }
      
      // Erstelle die 3 finalen sichtbaren Symbole
      for (let i = 0; i < 3; i++) {
        const el = document.createElement('div');
        el.className = 'reel-symbol';
        el.textContent = finalSymbols[idx][i];
        el.style.height = '70px';
        el.style.lineHeight = '70px';
        el.style.fontSize = '40px';
        el.style.textAlign = 'center';
        strip.appendChild(el);
      }
      
      // Setze die finale Position mit dem gespeicherten Offset
      strip.style.transform = `translateY(${reelFinalOffsets[idx]}px)`;
      
      // Debug: Überprüfe was tatsächlich angezeigt wird
      const displayedSymbols = Array.from(strip.children).map(el => el.textContent);
      console.log(`🎰 Reel ${idx + 1} zeigt jetzt:`, displayedSymbols);
      
      if (finished.every(Boolean)) {
        console.log('🎰 Alle Reels beendet, finalisiere Spin');
        finishSpin(finalSymbols);
        spinning = false;
        if (!autoSpinActive) {
          spinBtn.textContent = '';
          spinBtn.className = '';
        }
      }
    }
    
    function animateReel(reelIdx, finalSymbols, startDelay, stopDelay) {
      const strip = strips[reelIdx];
      
      // Debug: Überprüfe den aktuellen Zustand des Strips
      console.log(`🎰 Starte Animation für Reel ${reelIdx + 1}, aktuell ${strip.children.length} Symbole`);
      
      // Hole die aktuellen Symbole aus dem Strip
      let current = Array.from(strip.children).map(el => el.textContent);
      
      // Stelle sicher, dass immer mindestens 3 Symbole vorhanden sind
      if (current.length < 3) {
        console.warn(`🎰 Reel ${reelIdx + 1} hat nur ${current.length} Symbole, fülle auf 3 auf`);
        current = [];
        for (let i = 0; i < 3; i++) {
          current[i] = symbols[Math.floor(Math.random() * symbols.length)];
        }
      }
      
      // Starte mit den aktuellen Symbolen
      let spinSymbols = [...current];
      
      // Verkürzte Animation für AutoSpin
      const spinLength = autoSpinActive ? 15 : 25;
      
      // Füge IMMER neue zufällige Symbole für die Spin-Animation hinzu
      for (let i = 0; i < spinLength; i++) {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        spinSymbols.push(randomSymbol);
      }
      
      // Füge die finalen Symbole am Ende an, damit die Animation auf das richtige Muster ausläuft
      finalSymbols.forEach(sym => spinSymbols.push(sym));
      
      console.log(`🎰 Reel ${reelIdx + 1}: Insgesamt ${spinSymbols.length} Symbole für Animation`);
      console.log(`🎰 Finale Symbole für Reel ${reelIdx + 1}:`, finalSymbols);
      
      // Leere den Strip und fülle ihn mit allen Spin-Symbolen
      strip.innerHTML = '';
      spinSymbols.forEach((sym, index) => {
        const el = document.createElement('div');
        el.className = 'reel-symbol';
        el.textContent = sym;
        el.style.height = '70px';
        el.style.lineHeight = '70px';
        el.style.fontSize = '40px';
        el.style.textAlign = 'center';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        strip.appendChild(el);
      });
      
      strip.style.transform = 'translateY(0)';
      let finishedCalled = false;
      const finishNow = () => {
        if (!finishedCalled) {
          finishedCalled = true;
          console.log(`🎰 finishNow() aufgerufen für Reel ${reelIdx + 1}`);
          finishReel(reelIdx);
        }
      };
      finishReelFns[reelIdx] = finishNow;
      
      // Berechne zufällige finale Position VOR der Animation
      let finalOffset = 0;
      if (Math.random() < 0.2) {
        // Leichte zufällige Verschiebung zwischen -15px und +15px
        finalOffset = (Math.random() - 0.5) * 30;
      }
      
      // Speichere den finalen Offset für diesen Reel
      reelFinalOffsets[reelIdx] = finalOffset;
      
      // Kontinuierliche Animation mit verlangsamender Geschwindigkeit
      let t1 = setTimeout(() => {
        // Verkürzte Dauer für AutoSpin
        const baseDuration = autoSpinActive ? 1200 : 2500;
        const duration = baseDuration + stopDelay;
        strip.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
        // Finale Position inkludiert bereits die zufällige Verschiebung
        const finalY = -70 * (spinSymbols.length - 3) + finalOffset;
        strip.style.transform = `translateY(${finalY}px)`;
        
        console.log(`🎰 Reel ${reelIdx + 1}: Animation startet mit ${duration}ms Dauer zu Position ${finalY}px`);
        
        let t2 = setTimeout(() => {
          console.log(`🎰 Reel ${reelIdx + 1}: Animation-Timer abgelaufen, rufe finishNow() auf`);
          finishNow();
        }, duration);
        spinTimeouts.push(t2);
      }, startDelay);
      spinTimeouts.push(t1);
    }
    
    // Verkürzte Delays für AutoSpin
    const delay1 = autoSpinActive ? 0 : 0;
    const delay2 = autoSpinActive ? 300 : 800;
    const delay3 = autoSpinActive ? 600 : 1600;
    
    // Alle Reels starten gleichzeitig (startDelay = 0), aber stoppen nacheinander
    // Kontinuierliche Animation mit gestaffelten Stopps
    animateReel(0, finalSymbols[0], 0, delay1);
    animateReel(1, finalSymbols[1], 0, delay2);
    animateReel(2, finalSymbols[2], 0, delay3);
  }

  function finishSpin(finalSymbols) {
    // Gewinne hervorheben (nur mittlere Reihe)
    strips.forEach(strip => {
      Array.from(strip.children).forEach(el => el.classList.remove('win'));
    });
    
    // Mittlere Reihe: Index 1
    const middleRow = finalSymbols.map(arr => arr[1]);
    const result = middleRow.join('');
    let win = 0;
    let winType = 'none';
    let winDescription = '';
    
    // Prüfe auf drei gleiche Symbole
    if (winTable[result]) {
      win = winTable[result] * bet / 10;
      winType = 'triple';
      winDescription = `Dreifach ${result}`;
      
      // Markiere alle drei Symbole als Gewinn
      for (let i = 0; i < 3; i++) {
        strips[i].children[1].classList.add('win');
      }
    } else {
      // Prüfe auf zwei gleiche Symbole
      const symbol1 = middleRow[0];
      const symbol2 = middleRow[1];
      const symbol3 = middleRow[2];
      
      // Zwei gleiche in Folge (Position 0&1 oder 1&2)
      if (symbol1 === symbol2) {
        const twoSymbolKey = symbol1 + symbol2;
        if (winTable[twoSymbolKey]) {
          win = winTable[twoSymbolKey] * bet / 10;
          winType = 'double';
          winDescription = `Doppelt ${symbol1}`;
          strips[0].children[1].classList.add('win');
          strips[1].children[1].classList.add('win');
        }
      } else if (symbol2 === symbol3) {
        const twoSymbolKey = symbol2 + symbol3;
        if (winTable[twoSymbolKey]) {
          win = winTable[twoSymbolKey] * bet / 10;
          winType = 'double';
          winDescription = `Doppelt ${symbol2}`;
          strips[1].children[1].classList.add('win');
          strips[2].children[1].classList.add('win');
        }
      } else if (symbol1 === symbol3) {
        // Gleiche Symbole an Position 0&2
        const twoSymbolKey = symbol1 + symbol3;
        if (winTable[twoSymbolKey]) {
          win = winTable[twoSymbolKey] * bet / 10;
          winType = 'double';
          winDescription = `Doppelt ${symbol1}`;
          strips[0].children[1].classList.add('win');
          strips[2].children[1].classList.add('win');
        }
      }
      
      // Wenn noch kein Gewinn, prüfe auf spezielle Kombinationen
      if (win === 0) {
        // Sortiere Symbole für konsistente Überprüfung
        const sortedSymbols = [...middleRow].sort();
        const sortedKey = sortedSymbols.join('');
        
        // Prüfe exakte Kombinationen
        if (winTable[result]) {
          win = winTable[result] * bet / 10;
          winType = 'combo';
          winDescription = `Kombination ${result}`;
          for (let i = 0; i < 3; i++) {
            strips[i].children[1].classList.add('win');
          }
        } else {
          // Prüfe sortierte Kombinationen
          const comboChecks = [
            { pattern: sortedKey, desc: 'Mix' },
            { pattern: symbol1 + symbol2, desc: 'Paar' },
            { pattern: symbol2 + symbol3, desc: 'Paar' },
            { pattern: symbol1 + symbol3, desc: 'Paar' }
          ];
          
          for (const check of comboChecks) {
            if (winTable[check.pattern]) {
              win = winTable[check.pattern] * bet / 10;
              winType = 'combo';
              winDescription = `${check.desc} ${check.pattern}`;
              
              // Markiere relevante Symbole
              if (check.pattern.length === 2) {
                if (check.pattern === symbol1 + symbol2) {
                  strips[0].children[1].classList.add('win');
                  strips[1].children[1].classList.add('win');
                } else if (check.pattern === symbol2 + symbol3) {
                  strips[1].children[1].classList.add('win');
                  strips[2].children[1].classList.add('win');
                } else if (check.pattern === symbol1 + symbol3) {
                  strips[0].children[1].classList.add('win');
                  strips[2].children[1].classList.add('win');
                }
              } else {
                for (let i = 0; i < 3; i++) {
                  strips[i].children[1].classList.add('win');
                }
              }
              break;
            }
          }
        }
      }
    }
    
    if (win > 0) {
      balance += win;
      updateBalance();
      
      // Bestimme Gewinn-Level für verschiedene Meldungen und Seitenanimationen
      let winMessage = '';
      let emojiState = 'win';
      
      if (win >= 1000) {
        winMessage = `🎉 Super Mega Win! +${win}€ (${winDescription})`;
        emojiState = 'jackpot';
      } else if (win >= 500) {
        winMessage = `🔥 MEGA WIN! +${win}€ (${winDescription})`;
        emojiState = 'bigWin';
      } else if (win >= 100) {
        winMessage = `✨ BIG WIN! +${win}€ (${winDescription})`;
        emojiState = 'bigWin';
      } else if (win >= 50) {
        winMessage = `🎊 SUPER! +${win}€ (${winDescription})`;
        emojiState = 'win';
      } else if (win >= 20) {
        winMessage = `🎈 NICE! +${win}€ (${winDescription})`;
        emojiState = 'win';
      } else {
        winMessage = `👍 Gewinn! +${win}€ (${winDescription})`;
        emojiState = 'win';
      }
      
      // Seitenanimation für Gewinn (außer bei AutoSpin)
      if (!autoSpinActive) {
        updateSideEmojis(emojiState, win >= 100 ? 5000 : 3000);
      }
      
      resultEl.textContent = winMessage;
      
      // Check for Win Popup (nur für größere Gewinne ab 100€ - BIG WIN und höher)
      if (win >= 100) { // Nur BIG WIN, MEGA WIN und Super Mega Win
        setTimeout(() => {
          showWinPopup(win, bet);
        }, 500);
      }
    } else {
      resultEl.textContent = 'Leider kein Gewinn.';
      // Seitenanimation für Verlieren (nur wenn nicht AutoSpin)
      if (!autoSpinActive) {
        updateSideEmojis('lose', 2000);
      }
    }
    localStorage.setItem('slot1_balance', balance);
  }

  // Win-Popup System
  const winPopup = document.getElementById('big-win-popup');
  const winPopupOverlay = document.getElementById('win-popup-overlay');
  const winIcon = document.getElementById('win-icon');
  const winTitle = document.getElementById('win-title');
  const winAmountEl = document.getElementById('win-amount');
  const winMultiplier = document.getElementById('win-multiplier');
  const collectBtn = document.getElementById('collect-win');

  function showWinPopup(winAmount, betAmount) {
    const multiplier = Math.round(winAmount / betAmount);
    
    // Bestimme Popup-Stil basierend auf den exakten Gewinnkategorien aus finishSpin
    let icon, title, titleColor, confettiCount;
    
    if (winAmount >= 1000) {
      // 🎉 Super Mega Win!
      icon = '🎉';
      title = 'SUPER MEGA WIN!';
      titleColor = '#9b59b6';
      confettiCount = 50;
    } else if (winAmount >= 500) {
      // 🔥 MEGA WIN!
      icon = '🔥';
      title = 'MEGA WIN!';
      titleColor = '#e74c3c';
      confettiCount = 35;
    } else if (winAmount >= 100) {
      // ✨ BIG WIN!
      icon = '✨';
      title = 'BIG WIN!';
      titleColor = '#f4d03f';
      confettiCount = 25;
    } else {
      // Kein Popup für Gewinne unter 100€ (SUPER!, NICE!, Gewinn!)
      return;
    }

    // Popup-Inhalt setzen
    winIcon.textContent = icon;
    winTitle.textContent = title;
    winTitle.style.color = titleColor;
    winAmountEl.textContent = `${winAmount} €`;
    winMultiplier.textContent = `${multiplier}x Einsatz`;

    // Overlay und Popup anzeigen
    winPopupOverlay.classList.add('show');
    winPopup.classList.add('show');
    
    // Celebration Animation nach kurzer Verzögerung
    setTimeout(() => {
      winPopup.classList.add('celebrate');
    }, 300);

    // Konfetti-Effekt
    createConfetti(confettiCount);

    // Sound-Effekt
    if (musicStarted) {
      activateSpinMusic(); // Aktiviere Spin-Musik für Celebration
    }
  }

  function hideWinPopup() {
    winPopup.classList.remove('show', 'celebrate');
    winPopupOverlay.classList.remove('show');
    
    // Reset Emoji-Zustand
    setTimeout(() => {
      if (!spinning && !autoSpinActive) {
        updateSideEmojis('idle');
      }
    }, 1000);
  }

  function createConfetti(count = 30) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Zufällige horizontale Position
        confetti.style.left = (Math.random() * 100) + '%';
        
        // Zufällige Verzögerung für gestaffelten Effekt
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';
        
        // Zufällige Größe
        const size = Math.random() * 8 + 6;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        document.body.appendChild(confetti);
        
        // Entferne Konfetti nach Animation
        setTimeout(() => {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
          }
        }, 3000);
      }, i * 50); // Gestaffeltes Spawning
    }
  }

  // Event-Listener für Collect-Button
  collectBtn.addEventListener('click', hideWinPopup);
  winPopupOverlay.addEventListener('click', hideWinPopup);

  // ESC-Taste zum Schließen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && winPopup.classList.contains('show')) {
      hideWinPopup();
    }
  });

  function updateBalance() {
    balanceEl.textContent = balance;
    
    // Prüfe auf niedriges Guthaben
    if (balance < 100 && balance > 0 && currentEmojiState === 'idle') {
      triggerSpecialEmojiEvent('lowBalance');
    }
  }

  function fillInitialReels() {
    console.log('🎰 Fülle initial Reels mit Symbolen...');
    for (let r = 0; r < 3; r++) {
      const strip = strips[r];
      strip.innerHTML = '';
      strip.style.transform = 'translateY(0px)';
      strip.style.transition = 'none';
      
      for (let i = 0; i < 3; i++) {
        const el = document.createElement('div');
        el.className = 'reel-symbol';
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        el.textContent = randomSymbol;
        // Explizite Styles für bessere Darstellung
        el.style.height = '70px';
        el.style.lineHeight = '70px';
        el.style.fontSize = '40px';
        el.style.textAlign = 'center';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        strip.appendChild(el);
      }
      console.log(`🎰 Reel ${r + 1} gefüllt mit: ${Array.from(strip.children).map(el => el.textContent).join(' ')}`);
    }
  }
  fillInitialReels();

  // Initialisiere Seitenanimationen
  updateSideEmojis('idle');

  // Verbesserter Emoji-Wasserfall
  const emojiWaterfall = document.getElementById('emoji-waterfall');
  const waterfallEmojis = ['🍒','🍋','🍊','🍉','⭐','🔔','🍇','💎','🍀','💦','🌊','🫧','🦋','🪐','✨','🌈'];
  function spawnEmojiDrop() {
    const emoji = waterfallEmojis[Math.floor(Math.random() * waterfallEmojis.length)];
    const drop = document.createElement('div');
    drop.className = 'emoji-drop';
    drop.textContent = emoji;
    // Zufällige horizontale Position (leicht außerhalb, -5vw bis 105vw)
    drop.style.left = (Math.random() * 110 - 5) + 'vw';
    // Zufällige Größe
    const size = Math.random() * 2.2 + 1.2;
    drop.style.fontSize = size + 'rem';
    // Zufällige Animationsdauer (5-7s)
    drop.style.animationDuration = (Math.random() * 2 + 5) + 's';
    // Leicht zufällige Verzögerung für flüssigen Effekt
    drop.style.animationDelay = (Math.random() * 0.7) + 's';
    // Zufällige Drehung
    const rot = Math.floor(Math.random() * 360);
    drop.style.setProperty('--rot', rot + 'deg');
    // Zufällige Wellenbewegung (seitliche Bewegung)
    const wave = Math.floor(Math.random() * 60 - 30); // -30px bis +30px
    drop.style.setProperty('--wave', wave + 'px');
    // Zufällige Transparenz
    drop.style.opacity = (Math.random() * 0.5 + 0.6).toFixed(2);
    emojiWaterfall.appendChild(drop);
    drop.addEventListener('animationend', () => drop.remove());
  }
  setInterval(spawnEmojiDrop, 180); // Dichte erhöht, aber nicht zu viel

  // Zufällige Emoji-Wechsel alle 30 Sekunden im Idle-Zustand
  function randomEmojiChange() {
    if (currentEmojiState === 'idle' && !spinning && !autoSpinActive) {
      const randomSets = [
        ['🎰', '🍀'], ['🎲', '🎯'], ['💫', '⭐'], ['🎪', '🎭'], 
        ['🎨', '🎪'], ['🔮', '✨'], ['🎡', '🎢'], ['🎊', '🎉']
      ];
      const randomSet = randomSets[Math.floor(Math.random() * randomSets.length)];
      leftEmoji.textContent = randomSet[0];
      rightEmoji.textContent = randomSet[1];
    }
  }

  // Starte zufällige Emoji-Wechsel
  setInterval(randomEmojiChange, 30000);

  // Developer Menu initialisieren
  createDevMenu();

  // Developer Menu
  let devMenuOpen = false;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  function createDevMenu() {
    // Dev Button (verschiebbarer runder Button)
    const devBtn = document.createElement('div');
    devBtn.id = 'dev-btn';
    devBtn.innerHTML = '🛠️';
    devBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 50px;
      height: 50px;
      background: #ff6b6b;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: grab;
      z-index: 1000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      transition: transform 0.2s;
      user-select: none;
    `;

    // Dev Menu Panel
    const devMenu = document.createElement('div');
    devMenu.id = 'dev-menu';
    devMenu.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 20px;
      width: 250px;
      background: #2e2e4f;
      border: 2px solid #f7d203;
      border-radius: 10px;
      padding: 15px;
      display: none;
      z-index: 999;
      box-shadow: 0 6px 20px rgba(0,0,0,0.4);
      color: #f2e9e4;
      font-family: 'Segoe UI', Arial, sans-serif;
    `;

    devMenu.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #f7d203; text-align: center;">🎰 Dev Menu</h3>
      <button class="dev-btn" data-win="🔔🔔🔔">🔔 Mega Win (500x)</button>
      <button class="dev-btn" data-win="🍀🍀🍀">🍀 Super Mega Win (1000x)</button>
      <button class="dev-btn" data-win="💎💎💎">💎 Diamond Win (300x)</button>
      <button class="dev-btn" data-win="⭐⭐⭐">⭐ Star Win (200x)</button>
      <button class="dev-btn" data-win="🍉🍉🍉">🍉 Watermelon Win (100x)</button>
      <button class="dev-btn" data-action="add-balance">💰 +1000€ Balance</button>
      <button class="dev-btn" data-action="reset-balance">🔄 Reset Balance</button>
      <button class="dev-btn" data-action="fast-spin">⚡ Fast Spin Mode</button>
      <button class="dev-btn" data-action="toggle-music">🎵 Toggle Music</button>
      <button class="dev-btn" data-action="test-spin-music">🎸 Test Spin Music</button>
      <button class="dev-btn" data-action="test-win-popup">🎉 Test Win Popup</button>
    `;

    // Add CSS for dev buttons
    const style = document.createElement('style');
    style.textContent = `
      .dev-btn {
        width: 100%;
        margin: 5px 0;
        padding: 8px 12px;
        background: #474772;
        color: #f2e9e4;
        border: 1px solid #9a8c98;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }
      .dev-btn:hover {
        background: #9a8c98;
      }
      .dev-btn:active {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(devBtn);
    document.body.appendChild(devMenu);

    // Toggle menu
    devBtn.addEventListener('click', (e) => {
      if (!isDragging) {
        devMenuOpen = !devMenuOpen;
        devMenu.style.display = devMenuOpen ? 'block' : 'none';
      }
    });

    // Drag functionality
    devBtn.addEventListener('mousedown', (e) => {
      isDragging = false;
      const startX = e.clientX;
      const startY = e.clientY;
      const rect = devBtn.getBoundingClientRect();
      dragOffset.x = startX - rect.left;
      dragOffset.y = startY - rect.top;

      const handleMouseMove = (e) => {
        const deltaX = Math.abs(e.clientX - startX);
        const deltaY = Math.abs(e.clientY - startY);
        
        if (deltaX > 5 || deltaY > 5) {
          isDragging = true;
          devBtn.style.cursor = 'grabbing';
          
          const x = e.clientX - dragOffset.x;
          const y = e.clientY - dragOffset.y;
          
          const maxX = window.innerWidth - devBtn.offsetWidth;
          const maxY = window.innerHeight - devBtn.offsetHeight;
          
          devBtn.style.left = Math.max(0, Math.min(maxX, x)) + 'px';
          devBtn.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
          devBtn.style.right = 'auto';
          
          // Move menu with button
          if (devMenuOpen) {
            devMenu.style.left = (Math.max(0, Math.min(maxX, x)) + 60) + 'px';
            devMenu.style.top = Math.max(0, Math.min(maxY, y)) + 'px';
            devMenu.style.right = 'auto';
          }
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        devBtn.style.cursor = 'grab';
        
        setTimeout(() => {
          isDragging = false;
        }, 100);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });

    // Dev menu actions
    devMenu.addEventListener('click', (e) => {
      if (e.target.classList.contains('dev-btn')) {
        const winCombo = e.target.dataset.win;
        const action = e.target.dataset.action;

        if (winCombo) {
          triggerWin(winCombo);
        } else if (action) {
          handleDevAction(action);
        }
      }
    });
  }

  function triggerWin(combo) {
    if (spinning) return;
    
    // Parse the combo to get individual symbols
    const symbols = [...combo].filter(char => char !== ' ');
    const finalSymbols = [
      [symbols[0], symbols[0], symbols[0]], 
      [symbols[1], symbols[1], symbols[1]], 
      [symbols[2], symbols[2], symbols[2]]
    ];

    // Start a modified spin with predetermined result
    spinning = true;
    fastStop = false;
    spinTimeouts = [];
    finishReelFns = [];
    balance -= bet;
    updateBalance();
    resultEl.textContent = '';
    spinBtn.textContent = 'Stop';

    let finished = [false, false, false];
    let reelFinalOffsets = [0, 0, 0];
    
    function finishReel(idx) {
      if (finished[idx]) return;
      finished[idx] = true;
      const strip = strips[idx];
      strip.style.transition = 'none';
      strip.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const el = document.createElement('div');
        el.className = 'reel-symbol';
        el.textContent = finalSymbols[idx][i];
        strip.appendChild(el);
      }
      
      strip.style.transform = `translateY(${reelFinalOffsets[idx]}px)`;
      
      if (finished.every(Boolean)) {
        finishSpin(finalSymbols);
        spinning = false;
        spinBtn.textContent = '';
        spinBtn.className = '';
      }
    }

    function animateReel(reelIdx, finalSymbols, startDelay, stopDelay) {
      const strip = strips[reelIdx];
      let current = Array.from(strip.children).map(el => el.textContent);
      strip.innerHTML = '';
      
      if (current.length !== 3) {
        for (let i = 0; i < 3; i++) {
          current[i] = symbols[Math.floor(Math.random() * symbols.length)];
        }
      }
      
      let spinSymbols = [...current];
      for (let i = 0; i < 15; i++) { // Shorter spin for dev mode
        spinSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      finalSymbols.forEach(sym => spinSymbols.push(sym));
      
      spinSymbols.forEach(sym => {
        const el = document.createElement('div');
        el.className = 'reel-symbol';
        el.textContent = sym;
        strip.appendChild(el);
      });
      
      strip.style.transform = 'translateY(0)';
      
      let finishedCalled = false;
      const finishNow = () => {
        if (!finishedCalled) {
          finishedCalled = true;
          finishReel(reelIdx);
        }
      };
      finishReelFns[reelIdx] = finishNow;
      
      let finalOffset = 0;
      if (Math.random() < 0.1) { // Less offset for dev wins
        finalOffset = (Math.random() - 0.5) * 20;
      }
      
      reelFinalOffsets[reelIdx] = finalOffset;
      
      let t1 = setTimeout(() => {
        const duration = 1500 + stopDelay; // Faster for dev mode
        strip.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
        const finalY = -70 * (spinSymbols.length - 3) + finalOffset;
        strip.style.transform = `translateY(${finalY}px)`;
        
        let t2 = setTimeout(() => {
          finishNow();
        }, duration);
        spinTimeouts.push(t2);
      }, startDelay);
      spinTimeouts.push(t1);
    }
    
    animateReel(0, finalSymbols[0], 0, 0);
    animateReel(1, finalSymbols[1], 0, 400);
    animateReel(2, finalSymbols[2], 0, 800);
  }

  function handleDevAction(action) {
    switch(action) {
      case 'add-balance':
        balance += 1000;
        updateBalance();
        localStorage.setItem('slot1_balance', balance);
        break;
      case 'reset-balance':
        balance = 1000;
        updateBalance();
        localStorage.setItem('slot1_balance', balance);
        break;
      case 'fast-spin':
        alert('Fast Spin Mode aktiviert! (Bereits implementiert für Dev-Wins)');
        break;
      case 'toggle-music':
        if (musicStarted) {
          stopAllMusic();
          alert('Musik gestoppt');
        } else {
          startInteractiveMusic();
          alert('Musik gestartet');
        }
        break;
      case 'test-spin-music':
        if (musicStarted) {
          activateSpinMusic();
          alert('Spin-Musik (Guitar + Other) aktiviert für 20 Sekunden');
        } else {
          alert('Bitte erst Musik starten!');
        }
        break;
      case 'test-win-popup':
        // Teste Win-Popup nur mit den drei großen Gewinnkategorien
        const testWins = [150, 650, 1200]; // BIG WIN (✨), MEGA WIN (🔥), SUPER MEGA WIN (🎉)
        const randomWin = testWins[Math.floor(Math.random() * testWins.length)];
        showWinPopup(randomWin, bet);
        break;
    }
  }

  // Fast Stop function - verkürzt die normalen Delays für früheres Stoppen
  function accelerateReelsToStop() {
    console.log('🎰 Fast-Stop aktiviert - verkürze Stop-Delays');
    
    // Lösche alle bestehenden Timeouts
    spinTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    spinTimeouts = [];
    
    // Für jede Walze: Verkürze die Wartezeit moderat
    strips.forEach((strip, reelIdx) => {
      if (!finished[reelIdx]) {
        // SANFTERE Stop-Verzögerung - 400-1000ms statt normaler 800ms/1600ms/2400ms
        const earlyStopDelay = 400 + (reelIdx * 300); // 400ms, 700ms, 1000ms
        
        console.log(`🎰 Walze ${reelIdx + 1}: Sanfterer Stopp in ${earlyStopDelay}ms`);
        
        setTimeout(() => {
          if (!finished[reelIdx] && finishReelFns[reelIdx]) {
            // Rufe die ursprüngliche finish-Funktion auf
            // Die Animation läuft mit NORMALER Geschwindigkeit aber stoppt früher
            finishReelFns[reelIdx]();
          }
        }, earlyStopDelay);
      }
    });
  }

  // ===== DEBUG-FUNKTIONEN FÜR REELS =====
  function checkReelState() {
    console.group('🎰 Reel-Zustand Check');
    strips.forEach((strip, index) => {
      const symbols = Array.from(strip.children).map(el => el.textContent);
      const transform = strip.style.transform;
      console.log(`Reel ${index + 1}: [${symbols.join(', ')}] - Transform: ${transform}`);
    });
    console.groupEnd();
  }

  function resetReelsIfEmpty() {
    let needsReset = false;
    strips.forEach((strip, index) => {
      if (strip.children.length === 0) {
        console.warn(`🎰 Reel ${index + 1} ist leer! Fülle neu...`);
        needsReset = true;
      } else {
        // Überprüfe auch ob Symbole korrekt angezeigt werden
        const emptySymbols = Array.from(strip.children).filter(el => !el.textContent || el.textContent.trim() === '');
        if (emptySymbols.length > 0) {
          console.warn(`🎰 Reel ${index + 1} hat ${emptySymbols.length} leere Symbole! Fülle neu...`);
          needsReset = true;
        }
      }
    });
    
    if (needsReset) {
      console.log('🎰 Setze leere Reels zurück...');
      fillInitialReels();
    }
  }

  // Globale Debug-Funktionen erweitern
  if (window.audioDebug) {
    window.audioDebug.checkReels = checkReelState;
    window.audioDebug.resetReels = resetReelsIfEmpty;
    window.audioDebug.refillReels = fillInitialReels;
  }

  // ===== ENDE DEBUG-FUNKTIONEN =====

  // Regelmäßige Überprüfung der Reel-Integrität
  function scheduleReelIntegrityCheck() {
    setInterval(() => {
      if (!spinning) {
        // Prüfe nur wenn nicht gerade gespinnt wird
        let needsRepair = false;
        strips.forEach((strip, index) => {
          if (strip.children.length !== 3) {
            console.warn(`🎰 Integritätsprüfung: Reel ${index + 1} hat ${strip.children.length} statt 3 Symbole`);
            needsRepair = true;
          } else {
            // Prüfe ob alle Symbole gültigen Inhalt haben
            const symbols = Array.from(strip.children).map(el => el.textContent);
            const invalidSymbols = symbols.filter(sym => !sym || sym.trim() === '');
            if (invalidSymbols.length > 0) {
              console.warn(`🎰 Integritätsprüfung: Reel ${index + 1} hat ungültige Symbole`);
              needsRepair = true;
            }
          }
        });
        
        if (needsRepair) {
          console.log('🎰 Integritätsprüfung: Repariere Reels...');
          fillInitialReels();
        }
      }
    }, 5000); // Prüfe alle 5 Sekunden
  }
  
  // Starte die Integritätsprüfung
  scheduleReelIntegrityCheck();

  // Debug: Überprüfe ob alle wichtigen Elemente gefunden wurden
  console.log('🎰 Element Check:');
  console.log('spinBtn:', spinBtn);
  console.log('betMinus:', betMinus);
  console.log('betPlus:', betPlus);
  console.log('betAmountEl:', betAmountEl);
  
  if (!spinBtn) {
    console.error('❌ Spin Button nicht gefunden!');
  }
  if (!betMinus || !betPlus) {
    console.error('❌ Bet Buttons nicht gefunden!');
  }
  if (!betAmountEl) {
    console.error('❌ Bet Amount Element nicht gefunden!');
  }
});
