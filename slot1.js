document.addEventListener('DOMContentLoaded', function() {
  // Ladebildschirm-Logik
  function initializeLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');
    
    const loadingSteps = [
      { text: 'Initialisiere Spiel...', duration: 500 },
      { text: 'Lade Grafiken...', duration: 800 },
      { text: 'Lade Sounds...', duration: 700 },
      { text: 'Bereite Walzen vor...', duration: 600 },
      { text: 'Starte Spiel...', duration: 400 }
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
          
          // Starte Pop-in Animationen nach dem Laden
          setTimeout(() => {
            startPopInAnimations();
            playStartSound();
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

  // Audio-System initialisieren
  const startSound = new Audio('data/sounds/ElevenSoundEffects/Slot_Maschine_Start.mp3');
  startSound.volume = 0.6; // Lautstärke auf 60% setzen
  
  // Start-Sound abspielen wenn die Seite geladen wird
  function playStartSound() {
    startSound.currentTime = 0; // Sound von Anfang an abspielen
    startSound.play().catch(error => {
      console.log('Start-Sound konnte nicht abgespielt werden:', error);
      // Fallback: Versuche es nach User-Interaktion
      document.addEventListener('click', function playOnFirstClick() {
        startSound.play().catch(e => console.log('Sound-Wiedergabe fehlgeschlagen:', e));
        document.removeEventListener('click', playOnFirstClick);
      }, { once: true });
    });
  }

  let spinning = false;
  let fastStop = false;
  let spinTimeouts = [];
  let finishReelFns = [];
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
    if (spinning) return;
    if (betIndex > 0) {
      betIndex--;
      updateBetDisplay();
    }
  });
  betPlus.addEventListener('click', () => {
    if (spinning) return;
    if (betIndex < betSteps.length - 1) {
      betIndex++;
      updateBetDisplay();
    }
  });

  // Vereinfachte Button-Funktionalität

  spinBtn.addEventListener('mousedown', (e) => {
    if (autoSpinActive) {
      // Bei AutoSpin sofort stoppen
      stopAutoSpin();
      return;
    }
    
    buttonPressed = true;
    
    // Timer für Long Press
    buttonPressTimer = setTimeout(() => {
      if (buttonPressed) {
        startAutoSpin();
      }
    }, 800);
  });

  spinBtn.addEventListener('mouseup', (e) => {
    if (buttonPressTimer) {
      clearTimeout(buttonPressTimer);
      buttonPressTimer = null;
    }
    
    if (buttonPressed && !autoSpinActive) {
      // Nur spinnen wenn kein AutoSpin läuft
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
      // Fast-Stop: Animationen sofort überspringen und Ergebnis direkt anzeigen
      fastStop = true;
      spinTimeouts.forEach(clearTimeout);
      finishReelFns.forEach(fn => fn && fn());
      return;
    }
    if (spinning) return;
    if (balance < bet) {
      resultEl.textContent = 'Nicht genug Guthaben!';
      triggerSpecialEmojiEvent('noMoney');
      return;
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
    spinning = true;
    fastStop = false;
    spinTimeouts = [];
    finishReelFns = [];
    balance -= bet;
    updateBalance();
    resultEl.textContent = '';
    
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
    let finished = [false, false, false];
    let reelFinalOffsets = [0, 0, 0]; // Speichere die finalen Offsets für jeden Reel
    
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
      
      // Setze die finale Position mit dem gespeicherten Offset
      strip.style.transform = `translateY(${reelFinalOffsets[idx]}px)`;
      
      if (finished.every(Boolean)) {
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
      // Zeige aktuelle Symbole bis zum Spin, nicht sofort neue!
      let current = Array.from(strip.children).map(el => el.textContent);
      strip.innerHTML = '';
      // Wenn noch keine Symbole, fülle mit Zufall
      if (current.length !== 3) {
        for (let i = 0; i < 3; i++) {
          current[i] = symbols[Math.floor(Math.random() * symbols.length)];
        }
      }
      let spinSymbols = [...current];
      
      // Verkürzte Animation für AutoSpin
      const spinLength = autoSpinActive ? 15 : 25;
      for (let i = 0; i < spinLength; i++) {
        spinSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      
      // Füge die finalen Symbole am Ende an, damit die Animation auf das richtige Muster ausläuft
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
        
        let t2 = setTimeout(() => {
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
        winMessage = `🎉 JACKPOT! +${win}€ (${winDescription})`;
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
      
      // Check for Big Win Popup (nur bei den großen Gewinnen)
      if (result === '💎💎💎' || result === '🔔🔔🔔' || result === '🍀🍀🍀') {
        setTimeout(() => {
          showBigWinPopup('big', win, result);
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

  function updateBalance() {
    balanceEl.textContent = balance;
    
    // Prüfe auf niedriges Guthaben
    if (balance < 100 && balance > 0 && currentEmojiState === 'idle') {
      triggerSpecialEmojiEvent('lowBalance');
    }
  }

  function fillInitialReels() {
    for (let r = 0; r < 3; r++) {
      strips[r].innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const el = document.createElement('div');
        el.className = 'reel-symbol';
        el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        strips[r].appendChild(el);
      }
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
    const duration = Math.random() * 2 + 5;
    drop.style.animationDuration = duration + 's';
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
      top: 20px;
      right: 20px;
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
      top: 80px;
      right: 20px;
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
        // Toggle between normal and fast spin timings
        alert('Fast Spin Mode aktiviert! (Bereits implementiert für Dev-Wins)');
        break;
    }
  }

  // Big Win Popup System
  function showBigWinPopup(winType, amount, symbols) {
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'big-win-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.5s ease-out;
    `;

    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'big-win-popup';
    popup.style.cssText = `
      background: linear-gradient(135deg, #2e2e4f 0%, #474772 50%, #2e2e4f 100%);
      border: 4px solid #f7d203;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 
        0 0 50px rgba(247, 210, 3, 0.6),
        0 0 100px rgba(247, 210, 3, 0.4),
        inset 0 0 30px rgba(247, 210, 3, 0.1);
      animation: popupAppear 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      max-width: 500px;
      position: relative;
      overflow: hidden;
    `;

    // Determine win level and styling
    let winLevel, titleText, titleColor, symbolsText, glowColor;
    
    if (symbols === '💎💎💎') {
      winLevel = 'big';
      titleText = 'BIG WIN';
      titleColor = '#00ffff';
      symbolsText = '💎💎💎';
      glowColor = 'cyan';
    } else if (symbols === '🔔🔔🔔') {
      winLevel = 'mega';
      titleText = 'MEGA WIN';
      titleColor = '#ff6b6b';
      symbolsText = '🔔🔔🔔';
      glowColor = 'red';
    } else if (symbols === '🍀🍀🍀') {
      winLevel = 'super';
      titleText = 'SUPER MEGA WIN';
      titleColor = '#50fa7b';
      symbolsText = '🍀🍀🍀';
      glowColor = 'lime';
    }

    popup.innerHTML = `
      <div class="sparkles-bg"></div>
      <div class="win-title" style="
        font-size: 4rem;
        font-weight: bold;
        color: ${titleColor};
        text-shadow: 
          0 0 20px ${titleColor},
          0 0 40px ${titleColor},
          2px 2px 4px rgba(0,0,0,0.8);
        margin-bottom: 20px;
        animation: titlePulse 1.5s infinite alternate;
        font-family: Impact, Arial Black, sans-serif;
        letter-spacing: 3px;
        text-stroke: 2px #f7d203;
        -webkit-text-stroke: 2px #f7d203;
      ">${titleText}</div>
      
      <div class="win-symbols" style="
        font-size: 5rem;
        margin: 20px 0;
        animation: symbolsBounce 1s infinite alternate;
        filter: drop-shadow(0 0 10px ${glowColor});
      ">${symbolsText}</div>
      
      <div class="win-amount" style="
        font-size: 3.5rem;
        font-weight: bold;
        color: #f7d203;
        text-shadow: 
          0 0 20px #f7d203,
          0 0 40px #f7d203,
          2px 2px 4px rgba(0,0,0,0.8);
        background: linear-gradient(45deg, #f7d203, #ffed4e, #f7d203);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: amountShine 2s infinite;
        margin: 20px 0;
        font-family: Impact, Arial Black, sans-serif;
      ">${amount.toLocaleString()}€</div>
      
      <div class="continue-text" style="
        color: #f2e9e4;
        font-size: 1.2rem;
        margin-top: 30px;
        opacity: 0.8;
        animation: continueFlash 2s infinite;
      ">Klicken zum Fortfahren</div>
    `;

    // Add sparkles background
    const sparklesBg = popup.querySelector('.sparkles-bg');
    sparklesBg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
    `;

    // Create floating sparkles
    for (let i = 0; i < 20; i++) {
      const sparkle = document.createElement('div');
      sparkle.textContent = '✨';
      sparkle.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 20 + 10}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: sparkleFloat ${Math.random() * 3 + 2}s infinite linear;
        opacity: ${Math.random() * 0.8 + 0.2};
      `;
      sparklesBg.appendChild(sparkle);
    }

    // Add golden coins falling effect
    for (let i = 0; i < 15; i++) {
      const coin = document.createElement('div');
      coin.textContent = '🪙';
      coin.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 30 + 20}px;
        left: ${Math.random() * 100}%;
        top: -50px;
        animation: coinFall ${Math.random() * 2 + 3}s infinite linear;
        animation-delay: ${Math.random() * 2}s;
      `;
      popup.appendChild(coin);
    }

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Add CSS animations
    const popupStyles = document.createElement('style');
    popupStyles.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes popupAppear {
        0% { 
          transform: scale(0.3) rotate(-10deg);
          opacity: 0;
        }
        50% {
          transform: scale(1.1) rotate(5deg);
        }
        100% { 
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
      }
      
      @keyframes titlePulse {
        0% { 
          transform: scale(1);
          text-shadow: 
            0 0 20px ${titleColor},
            0 0 40px ${titleColor},
            2px 2px 4px rgba(0,0,0,0.8);
        }
        100% { 
          transform: scale(1.05);
          text-shadow: 
            0 0 30px ${titleColor},
            0 0 60px ${titleColor},
            2px 2px 4px rgba(0,0,0,0.8);
        }
      }
      
      @keyframes symbolsBounce {
        0% { transform: translateY(0px) scale(1); }
        100% { transform: translateY(-10px) scale(1.1); }
      }
      
      @keyframes amountShine {
        0% { 
          background-position: -200px 0;
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
        100% { 
          background-position: 200px 0;
          transform: scale(1);
        }
      }
      
      @keyframes continueFlash {
        0%, 50% { opacity: 0.8; }
        75% { opacity: 0.4; }
        100% { opacity: 0.8; }
      }
      
      @keyframes sparkleFloat {
        0% { 
          transform: translateY(0px) rotate(0deg);
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% { 
          transform: translateY(-20px) rotate(360deg);
          opacity: 0;
        }
      }
      
      @keyframes coinFall {
        0% { 
          transform: translateY(-50px) rotateY(0deg);
          opacity: 1;
        }
        100% { 
          transform: translateY(600px) rotateY(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(popupStyles);

    // Close popup on click
    overlay.addEventListener('click', () => {
      overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
      setTimeout(() => {
        document.body.removeChild(overlay);
        document.head.removeChild(popupStyles);
      }, 300);
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        overlay.click();
      }
    }, 5000);
  }

  // Initialize dev menu
  createDevMenu();

  // Leertasten-Funktionalität hinzufügen
  let spaceKeyTimer = null;
  let spaceKeyPressed = false;
  let autoSpinTriggered = false;

  document.addEventListener('keydown', function(event) {
    if ((event.code === 'Space' || event.key === ' ') && !spaceKeyPressed) {
      event.preventDefault();
      spaceKeyPressed = true;
      autoSpinTriggered = false;
      
      if (autoSpinActive) {
        stopAutoSpin();
        return;
      }
      
      // Starte Timer für Long Press AutoSpin
      spaceKeyTimer = setTimeout(() => {
        autoSpinTriggered = true;
        startAutoSpin();
      }, 800); // 800ms für Long Press
    }
  });

  document.addEventListener('keyup', function(event) {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      
      if (spaceKeyTimer) {
        clearTimeout(spaceKeyTimer);
        spaceKeyTimer = null;
      }
      
      // Nur wenn es kein Long Press war und kein AutoSpin läuft
      if (spaceKeyPressed && !autoSpinTriggered && !autoSpinActive) {
        handleSpin();
      }
      
      spaceKeyPressed = false;
      autoSpinTriggered = false;
    }
  });
});
