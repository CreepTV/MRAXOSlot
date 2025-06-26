document.addEventListener('DOMContentLoaded', function() {
  let spinning = false;
  let fastStop = false;
  let spinTimeouts = [];
  let finishReelFns = [];

  const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '🔔', '🍇', '💎', '🍀'];
  const winTable = {
    '🍒🍒🍒': 50,
    '🍋🍋🍋': 30,
    '🍊🍊🍊': 20,
    '🍉🍉🍉': 100,
    '⭐⭐⭐': 200,
    '🔔🔔🔔': 500,
    '🍇🍇🍇': 80,
    '💎💎💎': 300,
    '🍀🍀🍀': 1000
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

  spinBtn.addEventListener('click', () => {
    if (spinning && !fastStop) {
      spinBtn.textContent = `Spin`;
      // Fast-Stop: Animationen sofort überspringen und Ergebnis direkt anzeigen
      fastStop = true;
      spinTimeouts.forEach(clearTimeout);
      finishReelFns.forEach(fn => fn && fn());
      return;
    }
    if (spinning) return;
    if (balance < bet) {
      resultEl.textContent = 'Nicht genug Guthaben!';
      return;
    }
    spinning = true;
    fastStop = false;
    spinTimeouts = [];
    finishReelFns = [];
    balance -= bet;
    updateBalance();
    resultEl.textContent = '';
    spinBtn.textContent = 'Stop';

    // Animation: Reels scrollen nacheinander
    // Finalsymbole werden am Ende der Animation sichtbar und die Animation läuft auf das richtige Muster aus
    const finalSymbols = [[], [], []];
    for (let r = 0; r < 3; r++) {
      for (let i = 0; i < 3; i++) {
        finalSymbols[r][i] = symbols[Math.floor(Math.random() * symbols.length)];
      }
    }
    let finished = [false, false, false];
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
      strip.style.transform = 'translateY(0)';
      if (finished.every(Boolean)) {
        finishSpin(finalSymbols);
        spinning = false;
        spinBtn.textContent = `Spin`;
      }
    }
    function animateReel(reelIdx, finalSymbols, delay, cb) {
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
      for (let i = 0; i < 12; i++) {
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
          cb && cb();
        }
      };
      finishReelFns[reelIdx] = finishNow;
      let t1 = setTimeout(() => {
        strip.style.transition = 'transform 0.7s cubic-bezier(.32,1.56,.53,1)';
        // Die Animation läuft auf die letzten 3 Symbole (die finalen) aus
        strip.style.transform = `translateY(-${70 * (spinSymbols.length - 3)}px)`;
        let t2 = setTimeout(() => {
          finishNow();
        }, 750);
        spinTimeouts.push(t2);
      }, delay);
      spinTimeouts.push(t1);
    }
    animateReel(0, finalSymbols[0], 0, () => {
      animateReel(1, finalSymbols[1], 300, () => {
        animateReel(2, finalSymbols[2], 300, () => {
          // finishSpin wird in finishReel aufgerufen
        });
      });
    });
  });

  function finishSpin(finalSymbols) {
    // Gewinne hervorheben (nur mittlere Reihe)
    strips.forEach(strip => {
      Array.from(strip.children).forEach(el => el.classList.remove('win'));
    });
    // Mittlere Reihe: Index 1
    const result = finalSymbols.map(arr => arr[1]).join('');
    let win = 0;
    if (winTable[result]) {
      win = winTable[result] * bet / 10;
      balance += win;
      updateBalance();
      resultEl.textContent = `Gewinn! +${win}€ (${result})`;
      for (let i = 0; i < 3; i++) {
        strips[i].children[1].classList.add('win');
      }
    } else {
      resultEl.textContent = 'Leider kein Gewinn.';
    }
    localStorage.setItem('slot1_balance', balance);
  }

  function updateBalance() {
    balanceEl.textContent = balance;
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
});
