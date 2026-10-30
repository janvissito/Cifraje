/**
 * CIFRATGE WEB - APLICACIÓ COMPLETA DE XIFRATGE I CODI MORSE
 * Algoritmes suportats:
 *   1. Xifratge Cèsar (Caesar Cipher)
 *   2. Codi Morse (Morse Code amb Web Audio API & Optical LED)
 *   3. Inversió de Text (Text Reverse)
 *   4. Multixifratge (Comparativa simultània)
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. DICCIONARI I CONSTANTS MORSE
  // =========================================================================
  const DICCIONARI_MORSE = {
    'A': '.-',     'B': '-...',   'C': '-.-.',   'D': '-..',    'E': '.',
    'F': '..-.',   'G': '--.',    'H': '....',   'I': '..',     'J': '.---',
    'K': '-.-',    'L': '.-..',   'M': '--',     'N': '-.',     'O': '---',
    'P': '.--.',   'Q': '--.-',   'R': '.-.',    'S': '...',    'T': '-',
    'U': '..-',    'V': '...-',   'W': '.--',    'X': '-..-',   'Y': '-.--',
    'Z': '--..',
    '0': '-----',  '1': '.----',  '2': '..---',  '3': '...--',  '4': '....-',
    '5': '.....',  '6': '-....',  '7': '--...',  '8': '---..',  '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.',  '(': '-.--.',  ')': '-.--.-', '&': '.-...',  ':': '---...',
    ';': '-.-.-.', '=': '-...-',  '+': '.-.-.',  '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
  };

  const DICCIONARI_MORSE_INVERS = Object.fromEntries(
    Object.entries(DICCIONARI_MORSE).map(([lletra, codi]) => [codi, lletra])
  );

  // =========================================================================
  // 2. ESTAT DE L'APLICACIÓ
  // =========================================================================
  const state = {
    currentAlgo: 'cesar', // 'cesar' | 'morse' | 'inversio' | 'multi'
    currentAction: 'encrypt', // 'encrypt' | 'decrypt'
    isLive: true,
    caesarShift: 3,
    inversionType: 'full', // 'full' | 'words' | 'word-order'
    morseWpm: 15,
    morseFreq: 650,
    history: []
  };

  // Carregar historial de localStorage si existeix
  try {
    const saved = localStorage.getItem('cifratge_history');
    if (saved) state.history = JSON.parse(saved);
  } catch (e) {
    console.warn('No s\'ha pogut accedir a localStorage:', e);
  }

  // =========================================================================
  // 3. ELEMENTS DEL DOM
  // =========================================================================
  const dom = {
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    
    // Header & Algo Info
    algoTitle: document.getElementById('algo-current-title'),
    algoDesc: document.getElementById('algo-current-desc'),
    algoBadgeFeature: document.getElementById('algo-badge-feature'),
    
    // Mode
    modeEncryptBtn: document.getElementById('mode-encrypt'),
    modeDecryptBtn: document.getElementById('mode-decrypt'),
    liveConvertToggle: document.getElementById('live-convert-toggle'),
    
    // Params Panels
    paramsCesar: document.getElementById('params-cesar'),
    paramsMorse: document.getElementById('params-morse'),
    paramsInversio: document.getElementById('params-inversio'),
    paramsMulti: document.getElementById('params-multi'),
    
    // Caesar Controls
    caesarSlider: document.getElementById('caesar-shift-slider'),
    caesarNumber: document.getElementById('caesar-shift-number'),
    caesarValText: document.getElementById('caesar-shift-value'),
    btnCaesarMinus: document.getElementById('btn-caesar-minus'),
    btnCaesarPlus: document.getElementById('btn-caesar-plus'),
    btnCaesarRot13: document.getElementById('btn-caesar-rot13'),
    btnCaesarReset: document.getElementById('btn-caesar-reset'),
    btnCaesarBruteforce: document.getElementById('btn-caesar-bruteforce'),
    alphaOriginalStrip: document.getElementById('alphabet-original-strip'),
    alphaShiftedStrip: document.getElementById('alphabet-shifted-strip'),
    
    // Morse Audio & Light
    btnMorsePlay: document.getElementById('btn-morse-play'),
    btnMorseStop: document.getElementById('btn-morse-stop'),
    morseLed: document.getElementById('morse-led'),
    morseWpmSlider: document.getElementById('morse-wpm-slider'),
    morseWpmVal: document.getElementById('morse-wpm-val'),
    morseFreqSlider: document.getElementById('morse-freq-slider'),
    morseFreqVal: document.getElementById('morse-freq-val'),
    
    // Inversion Options
    inversionRadios: document.querySelectorAll('input[name="inversion-type"]'),
    
    // IO Areas
    textInput: document.getElementById('text-input'),
    textOutput: document.getElementById('text-output'),
    inputCharsCount: document.getElementById('input-chars-count'),
    inputWordsCount: document.getElementById('input-words-count'),
    outputCharsCount: document.getElementById('output-chars-count'),
    outputWordsCount: document.getElementById('output-words-count'),
    statusText: document.getElementById('status-text'),
    
    // Action Buttons
    btnSwapIo: document.getElementById('btn-swap-io'),
    btnClearInput: document.getElementById('btn-clear-input'),
    btnSampleInput: document.getElementById('btn-sample-input'),
    btnPasteInput: document.getElementById('btn-paste-input'),
    btnCopyOutput: document.getElementById('btn-copy-output'),
    btnDownloadOutput: document.getElementById('btn-download-output'),
    btnManualConvert: document.getElementById('btn-manual-convert'),
    
    // Multi View
    standardView: document.getElementById('standard-conversion-view'),
    multiView: document.getElementById('multi-comparison-view'),
    multiCesarVal: document.getElementById('multi-cesar-val'),
    multiMorseVal: document.getElementById('multi-morse-val'),
    multiInversioVal: document.getElementById('multi-inversio-val'),
    
    // Modals & Drawers
    modalBruteforce: document.getElementById('modal-bruteforce'),
    btnCloseBfModal: document.getElementById('btn-close-bf-modal'),
    bruteforceResultsList: document.getElementById('bruteforce-results-list'),
    
    modalMorse: document.getElementById('modal-morse'),
    btnOpenMorseModal: document.getElementById('btn-open-morse-modal'),
    btnCloseMorseModal: document.getElementById('btn-close-morse-modal'),
    morseLettersGrid: document.getElementById('morse-letters-grid'),
    morseNumbersGrid: document.getElementById('morse-numbers-grid'),
    morseSymbolsGrid: document.getElementById('morse-symbols-grid'),
    
    historyDrawer: document.getElementById('history-drawer'),
    btnOpenHistory: document.getElementById('btn-open-history'),
    btnCloseHistory: document.getElementById('btn-close-history'),
    btnClearHistory: document.getElementById('btn-clear-history'),
    historyList: document.getElementById('history-list'),
    historyBadge: document.getElementById('history-badge'),
    historyCountText: document.getElementById('history-count-text'),
    
    // Toast
    toast: document.getElementById('toast-notification'),
    toastMsg: document.getElementById('toast-message')
  };

  // =========================================================================
  // 4. FUNCIONS MATEMÀTIQUES I D'ALGORITMES DE XIFRATGE
  // =========================================================================

  /**
   * 1. Inversió de text
   */
  function xifrarInversio(text, type = 'full') {
    if (!text) return '';
    if (type === 'words') {
      return text.split(' ').map(w => [...w].reverse().join('')).join(' ');
    } else if (type === 'word-order') {
      return text.split(' ').reverse().join(' ');
    }
    // Tipus 'full' per defecte (equivalent directe a cifratge.py text[::-1])
    return [...text].reverse().join('');
  }

  function desxifrarInversio(text, type = 'full') {
    // La inversió és involutiva: desxifrar equival a xifrar
    return xifrarInversio(text, type);
  }

  /**
   * 2. Xifratge Cèsar
   * Manté exactament el funcionament modular de cifratge.py
   */
  function xifrarCesar(text, desplacament = 3) {
    if (!text) return '';
    const shift = ((desplacament % 26) + 26) % 26; // Suport robust per valors negatius
    let res = '';
    
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const code = text.charCodeAt(i);
      
      if (code >= 97 && code <= 122) { // a-z
        res += String.fromCharCode(((code - 97 + shift) % 26) + 97);
      } else if (code >= 65 && code <= 90) { // A-Z
        res += String.fromCharCode(((code - 65 + shift) % 26) + 65);
      } else {
        res += c;
      }
    }
    return res;
  }

  function desxifrarCesar(text, desplacament = 3) {
    return xifrarCesar(text, -desplacament);
  }

  /**
   * 3. Codi Morse
   * Implementa la descomposició Unicode NFKD per eliminar accents com en cifratge.py
   */
  function normalitzarTextMorse(text) {
    // NFKD descompon caràcters com 'é' en 'e' + accés combinatori, que eliminem amb regex
    return text
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  }

  function xifrarMorse(text) {
    if (!text) return '';
    const textNet = normalitzarTextMorse(text);
    const paraules = textNet.split(' ');
    const paraulesMorse = [];

    for (const paraula of paraules) {
      const lletresMorse = [];
      for (const car of paraula) {
        lletresMorse.push(DICCIONARI_MORSE[car] || car);
      }
      paraulesMorse.push(lletresMorse.join(' '));
    }

    return paraulesMorse.join(' / ');
  }

  function desxifrarMorse(codiMorse) {
    const codiNet = (codiMorse || '').trim();
    if (!codiNet) return '';

    let paraules;
    if (codiNet.includes(' / ')) {
      paraules = codiNet.split(' / ');
    } else if (codiNet.includes('/')) {
      paraules = codiNet.split('/');
    } else if (codiNet.includes('   ')) {
      paraules = codiNet.split('   ');
    } else {
      paraules = [codiNet];
    }

    const paraulesText = [];
    for (const paraula of paraules) {
      const simbols = paraula.trim().split(/\s+/);
      const lletres = [];
      for (const s of simbols) {
        if (!s) continue;
        lletres.push(DICCIONARI_MORSE_INVERS[s] || s);
      }
      paraulesText.push(lletres.join(''));
    }

    return paraulesText.join(' ');
  }

  // =========================================================================
  // 5. MOTOR DE CONVERSIÓ PRINCIPAL
  // =========================================================================
  function performConversion() {
    const text = dom.textInput.value;
    const { currentAlgo, currentAction, caesarShift, inversionType } = state;
    let resultat = '';

    if (currentAlgo === 'cesar') {
      resultat = currentAction === 'encrypt' 
        ? xifrarCesar(text, caesarShift) 
        : desxifrarCesar(text, caesarShift);
    } else if (currentAlgo === 'morse') {
      resultat = currentAction === 'encrypt' 
        ? xifrarMorse(text) 
        : desxifrarMorse(text);
    } else if (currentAlgo === 'inversio') {
      resultat = currentAction === 'encrypt' 
        ? xifrarInversio(text, inversionType) 
        : desxifrarInversio(text, inversionType);
    } else if (currentAlgo === 'multi') {
      // Multixifratge
      const resCesar = currentAction === 'encrypt' ? xifrarCesar(text, caesarShift) : desxifrarCesar(text, caesarShift);
      const resMorse = currentAction === 'encrypt' ? xifrarMorse(text) : desxifrarMorse(text);
      const resInversio = currentAction === 'encrypt' ? xifrarInversio(text, inversionType) : desxifrarInversio(text, inversionType);
      
      dom.multiCesarVal.textContent = resCesar || '(Buit)';
      dom.multiMorseVal.textContent = resMorse || '(Buit)';
      dom.multiInversioVal.textContent = resInversio || '(Buit)';
      resultat = resCesar;
    }

    dom.textOutput.value = resultat;
    updateStats();
    updateCaesarAlphabetStrip();
    dom.statusText.textContent = 'Actualitzat';
  }

  function updateStats() {
    const inputVal = dom.textInput.value;
    const outputVal = dom.textOutput.value;

    dom.inputCharsCount.textContent = `${inputVal.length} caràcters`;
    dom.inputWordsCount.textContent = `${inputVal.trim() ? inputVal.trim().split(/\s+/).length : 0} paraules`;

    dom.outputCharsCount.textContent = `${outputVal.length} caràcters`;
    dom.outputWordsCount.textContent = `${outputVal.trim() ? outputVal.trim().split(/\s+/).length : 0} paraules`;
  }

  // =========================================================================
  // 6. MAPA VISUAL DE L'ALFABET CÈSAR
  // =========================================================================
  function initCaesarAlphabetStrip() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    dom.alphaOriginalStrip.innerHTML = '';
    for (const lletra of alphabet) {
      const cell = document.createElement('div');
      cell.className = 'alpha-cell';
      cell.textContent = lletra;
      dom.alphaOriginalStrip.appendChild(cell);
    }
    updateCaesarAlphabetStrip();
  }

  function updateCaesarAlphabetStrip() {
    if (!dom.alphaShiftedStrip) return;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const shift = state.currentAction === 'encrypt' ? state.caesarShift : -state.caesarShift;
    dom.alphaShiftedStrip.innerHTML = '';

    for (const lletra of alphabet) {
      const cell = document.createElement('div');
      cell.className = 'alpha-cell';
      cell.textContent = xifrarCesar(lletra, shift);
      dom.alphaShiftedStrip.appendChild(cell);
    }
  }

  // =========================================================================
  // 7. SINTETITZADOR D'ÀUDIO WEB AUDIO API PER A CODI MORSE
  // =========================================================================
  let audioCtx = null;
  let isPlayingMorse = false;
  let currentAudioTimeouts = [];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(startTime, duration, freq) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Suavitzar vores amb rampa d'atac i caiguda ràpida per evitar clics
    const attackTime = 0.005;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + attackTime);
    gain.gain.setValueAtTime(0.25, startTime + duration - attackTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  function playMorseAudio() {
    stopMorseAudio();

    // Obtenir el text morse de sortida o d'entrada
    let morseCode = '';
    if (state.currentAlgo === 'morse') {
      morseCode = state.currentAction === 'encrypt' ? dom.textOutput.value : dom.textInput.value;
    } else {
      morseCode = xifrarMorse(dom.textInput.value);
    }

    if (!morseCode.trim()) {
      showToast('Introdueix text per generar codi Morse abans de reproduir.');
      return;
    }

    const ctx = getAudioContext();
    const wpm = parseInt(dom.morseWpmSlider.value, 10) || 15;
    const freq = parseInt(dom.morseFreqSlider.value, 10) || 650;
    
    // Càlcul estàndard PARIS WPM
    // 1 dot = 1.2 / WPM segons
    const dotDuration = 1.2 / wpm;
    const dashDuration = dotDuration * 3;
    const symbolPause = dotDuration;
    const letterPause = dotDuration * 3;
    const wordPause = dotDuration * 7;

    isPlayingMorse = true;
    dom.btnMorsePlay.classList.add('hidden');
    dom.btnMorseStop.classList.remove('hidden');

    let currentTime = ctx.currentTime + 0.1;

    for (let i = 0; i < morseCode.length; i++) {
      const char = morseCode[i];

      if (char === '.') {
        playTone(currentTime, dotDuration, freq);
        scheduleLedPulse(currentTime - ctx.currentTime, dotDuration);
        currentTime += dotDuration + symbolPause;
      } else if (char === '-') {
        playTone(currentTime, dashDuration, freq);
        scheduleLedPulse(currentTime - ctx.currentTime, dashDuration);
        currentTime += dashDuration + symbolPause;
      } else if (char === ' ') {
        currentTime += letterPause;
      } else if (char === '/') {
        currentTime += wordPause;
      }
    }

    // Programar finalització
    const totalDurationMs = (currentTime - ctx.currentTime) * 1000;
    const finishTimeout = setTimeout(() => {
      stopMorseAudio();
    }, totalDurationMs);
    currentAudioTimeouts.push(finishTimeout);
  }

  function scheduleLedPulse(delaySeconds, durationSeconds) {
    const onTimeout = setTimeout(() => {
      if (dom.morseLed) dom.morseLed.classList.add('active');
    }, Math.max(0, delaySeconds * 1000));

    const offTimeout = setTimeout(() => {
      if (dom.morseLed) dom.morseLed.classList.remove('active');
    }, Math.max(0, (delaySeconds + durationSeconds) * 1000));

    currentAudioTimeouts.push(onTimeout, offTimeout);
  }

  function stopMorseAudio() {
    isPlayingMorse = false;
    currentAudioTimeouts.forEach(t => clearTimeout(t));
    currentAudioTimeouts = [];

    if (dom.btnMorsePlay) dom.btnMorsePlay.classList.remove('hidden');
    if (dom.btnMorseStop) dom.btnMorseStop.classList.add('hidden');
    if (dom.morseLed) dom.morseLed.classList.remove('active');

    if (audioCtx) {
      try {
        audioCtx.close();
      } catch (e) {}
      audioCtx = null;
    }
  }

  // =========================================================================
  // 8. FORÇA BRUTA CÈSAR (DESXIFRATGE DE TOTS ELS 25 DESPLAÇAMENTS)
  // =========================================================================
  function openBruteforceModal() {
    const text = dom.textInput.value;
    if (!text.trim()) {
      showToast('Introdueix un text per analitzar per força bruta.');
      return;
    }

    dom.bruteforceResultsList.innerHTML = '';

    for (let k = 1; k <= 25; k++) {
      const decoded = desxifrarCesar(text, k);
      const item = document.createElement('div');
      item.className = 'bf-item';
      item.innerHTML = `
        <span class="bf-shift-tag">Desp. ${k}</span>
        <span class="bf-text-preview" title="${escapeHtml(decoded)}">${escapeHtml(decoded)}</span>
        <button class="bf-select-btn">Utilitzar</button>
      `;

      item.addEventListener('click', () => {
        state.caesarShift = k;
        dom.caesarSlider.value = k;
        dom.caesarNumber.value = k;
        dom.caesarValText.textContent = k;
        setMode('decrypt');
        performConversion();
        closeModals();
        showToast(`S'ha seleccionat el desplaçament ${k} en mode desxifratge.`);
      });

      dom.bruteforceResultsList.appendChild(item);
    }

    dom.modalBruteforce.classList.remove('hidden');
  }

  // =========================================================================
  // 9. TAULA DE REFERÈNCIA MORSE
  // =========================================================================
  function populateMorseTable() {
    dom.morseLettersGrid.innerHTML = '';
    dom.morseNumbersGrid.innerHTML = '';
    dom.morseSymbolsGrid.innerHTML = '';

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    for (const [char, code] of Object.entries(DICCIONARI_MORSE)) {
      const card = document.createElement('div');
      card.className = 'morse-card';
      card.innerHTML = `<span class="morse-char">${char}</span><span class="morse-code">${code}</span>`;
      card.style.cursor = 'pointer';
      card.title = 'Fes clic per escoltar';

      card.addEventListener('click', () => {
        // Reproduir so d'aquesta lletra
        const ctx = getAudioContext();
        const dotDuration = 0.08;
        const dashDuration = 0.24;
        let t = ctx.currentTime + 0.05;
        for (const sym of code) {
          if (sym === '.') {
            playTone(t, dotDuration, 650);
            t += dotDuration + 0.08;
          } else if (sym === '-') {
            playTone(t, dashDuration, 650);
            t += dashDuration + 0.08;
          }
        }
      });

      if (letters.includes(char)) {
        dom.morseLettersGrid.appendChild(card);
      } else if (numbers.includes(char)) {
        dom.morseNumbersGrid.appendChild(card);
      } else {
        dom.morseSymbolsGrid.appendChild(card);
      }
    }
  }

  // =========================================================================
  // 10. GESTIÓ D'HISTORIAL
  // =========================================================================
  function saveToHistory() {
    const input = dom.textInput.value.trim();
    const output = dom.textOutput.value.trim();
    if (!input || !output) return;

    // Evitar duplicats consecutius
    if (state.history.length > 0 && state.history[0].input === input && state.history[0].algo === state.currentAlgo) {
      return;
    }

    const item = {
      id: Date.now(),
      algo: state.currentAlgo,
      action: state.currentAction,
      shift: state.caesarShift,
      input,
      output,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.history.unshift(item);
    if (state.history.length > 20) state.history.pop();

    try {
      localStorage.setItem('cifratge_history', JSON.stringify(state.history));
    } catch (e) {}

    renderHistory();
  }

  function renderHistory() {
    dom.historyBadge.textContent = state.history.length;
    dom.historyCountText.textContent = `${state.history.length} conversions guardades`;

    if (state.history.length === 0) {
      dom.historyList.innerHTML = `
        <div class="empty-history-state">
          <p>No hi ha conversions recents enregistrades.</p>
        </div>
      `;
      return;
    }

    dom.historyList.innerHTML = '';
    state.history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-card';
      const actionText = item.action === 'encrypt' ? '🔒 Xifrat' : '🔓 Desxifrat';
      const algoLabel = {
        cesar: `Cèsar (+${item.shift})`,
        morse: 'Morse',
        inversio: 'Inversió',
        multi: 'Multixifratge'
      }[item.algo] || item.algo;

      card.innerHTML = `
        <div class="hist-top">
          <span class="hist-algo">${algoLabel}</span>
          <span>${item.time} • ${actionText}</span>
        </div>
        <div class="hist-text"><strong>Entrada:</strong> ${escapeHtml(item.input)}</div>
        <div class="hist-arrow">⬇</div>
        <div class="hist-text"><strong>Sortida:</strong> ${escapeHtml(item.output)}</div>
      `;

      card.addEventListener('click', () => {
        dom.textInput.value = item.input;
        setAlgo(item.algo);
        setMode(item.action);
        if (item.shift) {
          state.caesarShift = item.shift;
          dom.caesarSlider.value = item.shift;
          dom.caesarNumber.value = item.shift;
          dom.caesarValText.textContent = item.shift;
        }
        performConversion();
        closeModals();
        showToast('Conversió recuperada de l\'historial.');
      });

      dom.historyList.appendChild(card);
    });
  }

  function clearHistory() {
    state.history = [];
    try {
      localStorage.removeItem('cifratge_history');
    } catch (e) {}
    renderHistory();
    showToast('Historial esborrat correctament.');
  }

  // =========================================================================
  // 11. CANVI DE TAB / ALGORITME
  // =========================================================================
  function setAlgo(algo) {
    state.currentAlgo = algo;

    // Actualitzar tabs actius
    dom.tabBtns.forEach(btn => {
      const isActive = btn.dataset.algo === algo;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Ocultar tots els panells de paràmetres
    dom.paramsCesar.classList.add('hidden');
    dom.paramsMorse.classList.add('hidden');
    dom.paramsInversio.classList.add('hidden');
    dom.paramsMulti.classList.add('hidden');

    // Aturar qualsevol so morse en curs
    stopMorseAudio();

    if (algo === 'cesar') {
      dom.paramsCesar.classList.remove('hidden');
      dom.algoTitle.textContent = 'Xifratge Cèsar';
      dom.algoDesc.textContent = "Aplica un desplaçament determinat de posicions a l'alfabet sobre cada lletra. Manté majúscules, minúscules i puntuació intactes.";
      dom.algoBadgeFeature.textContent = 'Aritmètica Modular (mod 26)';
      dom.standardView.classList.remove('hidden');
      dom.multiView.classList.add('hidden');
    } else if (algo === 'morse') {
      dom.paramsMorse.classList.remove('hidden');
      dom.algoTitle.textContent = 'Codi Morse';
      dom.algoDesc.textContent = "Codifica el text en punts i ratlles amb normalització NFKD d'accents. Inclou reproductor d'àudio sintetitzat i senyal lluminós.";
      dom.algoBadgeFeature.textContent = 'Senyals Telegràfics & Web Audio';
      dom.standardView.classList.remove('hidden');
      dom.multiView.classList.add('hidden');
    } else if (algo === 'inversio') {
      dom.paramsInversio.classList.remove('hidden');
      dom.algoTitle.textContent = 'Inversió de Text';
      dom.algoDesc.textContent = "Inverteix l'ordre dels caràcters de la cadena. Com que és una funció involutiva (f(f(x)) = x), desxifrar és idèntic a xifrar.";
      dom.algoBadgeFeature.textContent = 'Funció Involutiva';
      dom.standardView.classList.remove('hidden');
      dom.multiView.classList.add('hidden');
    } else if (algo === 'multi') {
      dom.paramsMulti.classList.remove('hidden');
      dom.algoTitle.textContent = 'Panell de Multixifratge';
      dom.algoDesc.textContent = "Compara el resultat simultani dels tres algoritmes (Cèsar, Morse i Inversió) en temps real.";
      dom.algoBadgeFeature.textContent = 'Multi-algoritme en paral·lel';
      dom.standardView.classList.add('hidden');
      dom.multiView.classList.remove('hidden');
    }

    performConversion();
  }

  function setMode(mode) {
    state.currentAction = mode;
    dom.modeEncryptBtn.classList.toggle('active', mode === 'encrypt');
    dom.modeDecryptBtn.classList.toggle('active', mode === 'decrypt');
    
    // Canviar etiquetes
    const inputLabel = document.getElementById('input-label');
    const outputLabel = document.getElementById('output-label');
    if (inputLabel && outputLabel) {
      if (mode === 'encrypt') {
        inputLabel.textContent = 'Text Original (a codificar)';
        outputLabel.textContent = 'Text Xifrat (resultat)';
      } else {
        inputLabel.textContent = 'Text Xifrat (a decodificar)';
        outputLabel.textContent = 'Text Desxifrat (original)';
      }
    }

    performConversion();
  }

  // =========================================================================
  // 12. UTILITATS I TOAST
  // =========================================================================
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    dom.toastMsg.textContent = message;
    dom.toast.classList.add('show');
    toastTimer = setTimeout(() => {
      dom.toast.classList.remove('show');
    }, 2800);
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function closeModals() {
    dom.modalBruteforce.classList.add('hidden');
    dom.modalMorse.classList.add('hidden');
    dom.historyDrawer.classList.add('hidden');
  }

  // =========================================================================
  // 13. ESDEVENIMENTS (EVENT LISTENERS)
  // =========================================================================

  // Input de text
  let debounceTimer = null;
  dom.textInput.addEventListener('input', () => {
    if (state.isLive) {
      performConversion();
    }
    // Després de 1.5s d'inactivitat d'escriptura, desar a l'historial
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      saveToHistory();
    }, 1500);
  });

  // Toggle Live mode
  dom.liveConvertToggle.addEventListener('change', (e) => {
    state.isLive = e.target.checked;
    dom.btnManualConvert.classList.toggle('hidden', state.isLive);
    if (state.isLive) performConversion();
  });

  dom.btnManualConvert.addEventListener('click', () => {
    performConversion();
    saveToHistory();
  });

  // Selector d'acció (Xifrar / Desxifrar)
  dom.modeEncryptBtn.addEventListener('click', () => setMode('encrypt'));
  dom.modeDecryptBtn.addEventListener('click', () => setMode('decrypt'));

  // Tabs d'algoritme
  dom.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => setAlgo(btn.dataset.algo));
  });

  // Caesar Slider & Input sync
  function handleCaesarChange(newVal) {
    let val = parseInt(newVal, 10);
    if (isNaN(val)) val = 3;
    val = Math.max(1, Math.min(25, val));
    state.caesarShift = val;
    dom.caesarSlider.value = val;
    dom.caesarNumber.value = val;
    dom.caesarValText.textContent = val;
    performConversion();
  }

  dom.caesarSlider.addEventListener('input', (e) => handleCaesarChange(e.target.value));
  dom.caesarNumber.addEventListener('change', (e) => handleCaesarChange(e.target.value));

  dom.btnCaesarMinus.addEventListener('click', () => handleCaesarChange(state.caesarShift - 1));
  dom.btnCaesarPlus.addEventListener('click', () => handleCaesarChange(state.caesarShift + 1));
  dom.btnCaesarRot13.addEventListener('click', () => handleCaesarChange(13));
  dom.btnCaesarReset.addEventListener('click', () => handleCaesarChange(3));
  dom.btnCaesarBruteforce.addEventListener('click', openBruteforceModal);

  // Morse Controls
  dom.btnMorsePlay.addEventListener('click', playMorseAudio);
  dom.btnMorseStop.addEventListener('click', stopMorseAudio);

  dom.morseWpmSlider.addEventListener('input', (e) => {
    dom.morseWpmVal.textContent = e.target.value;
  });

  dom.morseFreqSlider.addEventListener('input', (e) => {
    dom.morseFreqVal.textContent = e.target.value;
  });

  // Inversion Radios
  dom.inversionRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        state.inversionType = e.target.value;
        performConversion();
      }
    });
  });

  // Botó d'intercanvi (Swap)
  dom.btnSwapIo.addEventListener('click', () => {
    const temp = dom.textInput.value;
    dom.textInput.value = dom.textOutput.value;
    dom.textOutput.value = temp;

    // Canviar acció automàticament (de xifrar a desxifrar o viceversa)
    setMode(state.currentAction === 'encrypt' ? 'decrypt' : 'encrypt');
    showToast('S\'ha intercanviat l\'entrada i la sortida!');
  });

  // Netejar entrada
  dom.btnClearInput.addEventListener('click', () => {
    dom.textInput.value = '';
    performConversion();
    dom.textInput.focus();
    showToast('Camp d\'entrada netejat.');
  });

  // Text d'exemple
  dom.btnSampleInput.addEventListener('click', () => {
    if (state.currentAlgo === 'cesar') {
      dom.textInput.value = 'Juli Cèsar va utilitzar aquest sistema militar a la Gàl·lia per enviar ordres secretes l\'any 50 aC.';
    } else if (state.currentAlgo === 'morse') {
      dom.textInput.value = 'SOS Transmissio d\'emergencia a 15 WPM';
    } else {
      dom.textInput.value = 'Bon dia! La criptografia clàssica és fascinant.';
    }
    performConversion();
    saveToHistory();
    showToast('Text d\'exemple carregat!');
  });

  // Enganxar del porta-retalls
  dom.btnPasteInput.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      dom.textInput.value = text;
      performConversion();
      showToast('Text enganxat des del porta-retalls.');
    } catch (err) {
      showToast('No s\'ha pogut accedir al porta-retalls. Fes Ctrl+V directament.');
    }
  });

  // Copiar sortida
  dom.btnCopyOutput.addEventListener('click', async () => {
    const text = dom.textOutput.value;
    if (!text) {
      showToast('No hi ha text de sortida per copiar.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      dom.btnCopyOutput.classList.add('copied');
      setTimeout(() => dom.btnCopyOutput.classList.remove('copied'), 2000);
      showToast('Text copiat al porta-retalls!');
      saveToHistory();
    } catch (err) {
      showToast('Error en copiar al porta-retalls.');
    }
  });

  // Copiar botons de la vista Multi
  document.querySelectorAll('.copy-multi-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.target;
      const elem = document.getElementById(targetId);
      if (elem && elem.textContent) {
        await navigator.clipboard.writeText(elem.textContent);
        showToast('Text copiat!');
      }
    });
  });

  // Descarregar sortida (.txt)
  dom.btnDownloadOutput.addEventListener('click', () => {
    const text = dom.textOutput.value;
    if (!text) {
      showToast('El resultat és buit, no es pot descarregar.');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cifratge_${state.currentAlgo}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Fitxer descarregat!');
  });

  // Modals & Drawers triggers
  dom.btnOpenMorseModal.addEventListener('click', () => {
    dom.modalMorse.classList.remove('hidden');
  });

  dom.btnCloseMorseModal.addEventListener('click', () => {
    dom.modalMorse.classList.add('hidden');
  });

  dom.btnCloseBfModal.addEventListener('click', () => {
    dom.modalBruteforce.classList.add('hidden');
  });

  dom.btnOpenHistory.addEventListener('click', () => {
    renderHistory();
    dom.historyDrawer.classList.remove('hidden');
  });

  dom.btnCloseHistory.addEventListener('click', () => {
    dom.historyDrawer.classList.add('hidden');
  });

  dom.btnClearHistory.addEventListener('click', clearHistory);

  // Tancar modals en fer clic fora de la finestra
  window.addEventListener('click', (e) => {
    if (e.target === dom.modalBruteforce) dom.modalBruteforce.classList.add('hidden');
    if (e.target === dom.modalMorse) dom.modalMorse.classList.add('hidden');
  });

  // Tancar amb tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModals();
  });

  // =========================================================================
  // 14. INICIALITZACIÓ
  // =========================================================================
  initCaesarAlphabetStrip();
  populateMorseTable();
  renderHistory();
  performConversion();

  // =========================================================================
  // 15. SISTEMA DE REGISTRE DE VISITANTS I COMPTADOR EN TEMPS REAL (/dades)
  // =========================================================================
  const liveVisitsCountElem = document.getElementById('live-visits-count');

  async function registrarVisita() {
    // 1. Obtenir o crear l'identificador d'usuari
    let usuari = localStorage.getItem('cifratge_nom_usuari');
    if (!usuari) {
      usuari = `Usuari-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('cifratge_nom_usuari', usuari);
    }

    // 2. Detectar geolocalització (país, regió, ciutat)
    let geo = {
      pais: 'Espanya',
      regio: 'Catalunya',
      ciutat: 'Barcelona'
    };

    // Intentar geolocalització per IP pública client-side amb fallback ràpid
    try {
      const geoResp = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      if (geoResp.ok) {
        const geoData = await geoResp.json();
        if (geoData.country_name) geo.pais = geoData.country_name;
        if (geoData.region) geo.regio = geoData.region;
        if (geoData.city) geo.ciutat = geoData.city;
      }
    } catch (e) {
      // Fallback: usar timezone del navegador
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && tz.includes('/')) {
          geo.ciutat = tz.split('/')[1].replace(/_/g, ' ');
          geo.regio = tz.split('/')[0];
        }
      } catch (err) {}
    }

    // 3. Enviar dades al servidor HTTP local (/api/visita)
    try {
      const resp = await fetch('/api/visita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuari: usuari,
          pais: geo.pais,
          regio: geo.regio,
          ciutat: geo.ciutat,
          dispositiu: `${navigator.platform || 'Desktop'} • ${navigator.userAgent.split(' ')[0]}`
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && typeof data.total_visites === 'number' && liveVisitsCountElem) {
          liveVisitsCountElem.textContent = data.total_visites;
        }
      }
    } catch (err) {
      // Mode estàtic
    }
  }

  async function actualitzarComptadorVisites() {
    try {
      const resp = await fetch('/api/visites');
      if (resp.ok) {
        const data = await resp.json();
        if (data && typeof data.total_visites === 'number' && liveVisitsCountElem) {
          liveVisitsCountElem.textContent = data.total_visites;
        }
      }
    } catch (e) {}
  }

  // Executar registre inicial i poller en temps real
  registrarVisita();
  setInterval(actualitzarComptadorVisites, 4000);
});

