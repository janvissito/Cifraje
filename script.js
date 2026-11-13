/**
 * CIFRADO WEB - APLICACIÓN COMPLETA DE CIFRADO Y CÓDIGO MORSE
 * Algoritmos soportados:
 *   1. Cifrado César (Caesar Cipher)
 *   2. Código Morse (Morse Code con Web Audio API & Optical LED)
 *   3. Inversión de Texto (Text Reverse)
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. DICCIONARIO Y CONSTANTES MORSE
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
    Object.entries(DICCIONARI_MORSE).map(([letra, codigo]) => [codigo, letra])
  );

  // =========================================================================
  // 2. ESTADO DE LA APLICACIÓN
  // =========================================================================
  const state = {
    currentAlgo: 'cesar', // 'cesar' | 'morse' | 'inversio'
    currentAction: 'encrypt', // 'encrypt' | 'decrypt'
    isLive: true,
    caesarShift: 3,
    inversionType: 'full', // 'full' | 'words' | 'word-order'
    morseWpm: 15,
    morseFreq: 650,
    history: []
  };

  // Cargar historial de localStorage si existe
  try {
    const saved = localStorage.getItem('cifratge_history');
    if (saved) state.history = JSON.parse(saved);
  } catch (e) {
    console.warn('No se ha podido acceder a localStorage:', e);
  }

  // =========================================================================
  // 3. ELEMENTOS DEL DOM
  // =========================================================================
  const dom = {
    // Pestañas (Tabs)
    tabBtns: document.querySelectorAll('.tab-btn'),
    
    // Encabezado e Info del Algoritmo
    algoTitle: document.getElementById('algo-current-title'),
    algoDesc: document.getElementById('algo-current-desc'),
    algoBadgeFeature: document.getElementById('algo-badge-feature'),
    
    // Modo
    modeEncryptBtn: document.getElementById('mode-encrypt'),
    modeDecryptBtn: document.getElementById('mode-decrypt'),
    liveConvertToggle: document.getElementById('live-convert-toggle'),
    
    // Paneles de Parámetros
    paramsCesar: document.getElementById('params-cesar'),
    paramsMorse: document.getElementById('params-morse'),
    paramsInversio: document.getElementById('params-inversio'),
    
    // Controles César
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
    
    // Audio y Luz Morse
    btnMorsePlay: document.getElementById('btn-morse-play'),
    btnMorseStop: document.getElementById('btn-morse-stop'),
    morseLed: document.getElementById('morse-led'),
    morseWpmSlider: document.getElementById('morse-wpm-slider'),
    morseWpmVal: document.getElementById('morse-wpm-val'),
    morseFreqSlider: document.getElementById('morse-freq-slider'),
    morseFreqVal: document.getElementById('morse-freq-val'),
    
    // Opciones de Inversión
    inversionRadios: document.querySelectorAll('input[name="inversion-type"]'),
    
    // Áreas de Entrada y Salida (IO)
    textInput: document.getElementById('text-input'),
    textOutput: document.getElementById('text-output'),
    inputCharsCount: document.getElementById('input-chars-count'),
    inputWordsCount: document.getElementById('input-words-count'),
    outputCharsCount: document.getElementById('output-chars-count'),
    outputWordsCount: document.getElementById('output-words-count'),
    statusText: document.getElementById('status-text'),
    
    // Botones de Acción
    btnSwapIo: document.getElementById('btn-swap-io'),
    btnClearInput: document.getElementById('btn-clear-input'),
    btnSampleInput: document.getElementById('btn-sample-input'),
    btnPasteInput: document.getElementById('btn-paste-input'),
    btnCopyOutput: document.getElementById('btn-copy-output'),
    btnDownloadOutput: document.getElementById('btn-download-output'),
    btnManualConvert: document.getElementById('btn-manual-convert'),
    
    // Modales y Paneles Desplegables
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
    
    // Notificación Toast
    toast: document.getElementById('toast-notification'),
    toastMsg: document.getElementById('toast-message')
  };

  // =========================================================================
  // 4. FUNCIONES MATEMÁTICAS Y ALGORITMOS DE CIFRADO
  // =========================================================================

  /**
   * 1. Inversión de texto
   */
  function xifrarInversio(text, type = 'full') {
    if (!text) return '';
    if (type === 'words') {
      return text.split(' ').map(w => [...w].reverse().join('')).join(' ');
    } else if (type === 'word-order') {
      return text.split(' ').reverse().join(' ');
    }
    // Tipo 'full' por defecto
    return [...text].reverse().join('');
  }

  function desxifrarInversio(text, type = 'full') {
    // La inversión es involutiva: descifrar equivale a cifrar
    return xifrarInversio(text, type);
  }

  /**
   * 2. Cifrado César
   */
  function xifrarCesar(text, desplacament = 3) {
    if (!text) return '';
    const shift = ((desplacament % 26) + 26) % 26; // Soporte robusto para valores negativos
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
   * 3. Código Morse
   * Implementa la descomposición Unicode NFKD para eliminar acentos
   */
  function normalitzarTextMorse(text) {
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
  // 5. MOTOR DE CONVERSIÓN PRINCIPAL
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
    }

    dom.textOutput.value = resultat;
    updateStats();
    updateCaesarAlphabetStrip();
    dom.statusText.textContent = 'Actualizado';
  }

  function updateStats() {
    const inputVal = dom.textInput.value;
    const outputVal = dom.textOutput.value;

    dom.inputCharsCount.textContent = `${inputVal.length} caracteres`;
    dom.inputWordsCount.textContent = `${inputVal.trim() ? inputVal.trim().split(/\s+/).length : 0} palabras`;

    dom.outputCharsCount.textContent = `${outputVal.length} caracteres`;
    dom.outputWordsCount.textContent = `${outputVal.trim() ? outputVal.trim().split(/\s+/).length : 0} palabras`;
  }

  // =========================================================================
  // 6. MAPA VISUAL DEL ALFABETO CÉSAR
  // =========================================================================
  function initCaesarAlphabetStrip() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    dom.alphaOriginalStrip.innerHTML = '';
    for (const letra of alphabet) {
      const cell = document.createElement('div');
      cell.className = 'alpha-cell';
      cell.textContent = letra;
      dom.alphaOriginalStrip.appendChild(cell);
    }
    updateCaesarAlphabetStrip();
  }

  function updateCaesarAlphabetStrip() {
    if (!dom.alphaShiftedStrip) return;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const shift = state.currentAction === 'encrypt' ? state.caesarShift : -state.caesarShift;
    dom.alphaShiftedStrip.innerHTML = '';

    for (const letra of alphabet) {
      const cell = document.createElement('div');
      cell.className = 'alpha-cell';
      cell.textContent = xifrarCesar(letra, shift);
      dom.alphaShiftedStrip.appendChild(cell);
    }
  }

  // =========================================================================
  // 7. SINTETIZADOR DE AUDIO WEB AUDIO API PARA CÓDIGO MORSE
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

    // Suavizar bordes con rampa de ataque y caída rápida para evitar chasquidos
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

    // Obtener el código morse de salida o de entrada
    let morseCode = '';
    if (state.currentAlgo === 'morse') {
      morseCode = state.currentAction === 'encrypt' ? dom.textOutput.value : dom.textInput.value;
    } else {
      morseCode = xifrarMorse(dom.textInput.value);
    }

    if (!morseCode.trim()) {
      showToast('Introduce texto para generar código Morse antes de reproducir.');
      return;
    }

    const ctx = getAudioContext();
    const wpm = parseInt(dom.morseWpmSlider.value, 10) || 15;
    const freq = parseInt(dom.morseFreqSlider.value, 10) || 650;
    
    // Cálculo estándar PARIS WPM
    // 1 dot = 1.2 / WPM segundos
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

    // Programar finalización
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
  // 8. FUERZA BRUTA CÉSAR (DESCIFRADO DE LOS 25 DESPLAZAMIENTOS)
  // =========================================================================
  function openBruteforceModal() {
    const text = dom.textInput.value;
    if (!text.trim()) {
      showToast('Introduce un texto para analizar por fuerza bruta.');
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
        <button class="bf-select-btn">Usar</button>
      `;

      item.addEventListener('click', () => {
        state.caesarShift = k;
        dom.caesarSlider.value = k;
        dom.caesarNumber.value = k;
        dom.caesarValText.textContent = k;
        setMode('decrypt');
        performConversion();
        closeModals();
        showToast(`Se ha seleccionado el desplazamiento ${k} en modo descifrado.`);
      });

      dom.bruteforceResultsList.appendChild(item);
    }

    dom.modalBruteforce.classList.remove('hidden');
  }

  // =========================================================================
  // 9. TABLA DE REFERENCIA MORSE
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
      card.title = 'Haz clic para escuchar';

      card.addEventListener('click', () => {
        // Reproducir sonido de esta letra
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
  // 10. GESTIÓN DEL HISTORIAL
  // =========================================================================
  function saveToHistory() {
    const input = dom.textInput.value.trim();
    const output = dom.textOutput.value.trim();
    if (!input || !output) return;

    // Evitar duplicados consecutivos
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
    dom.historyCountText.textContent = `${state.history.length} conversiones guardadas`;

    if (state.history.length === 0) {
      dom.historyList.innerHTML = `
        <div class="empty-history-state">
          <p>No hay conversiones recientes registradas.</p>
        </div>
      `;
      return;
    }

    dom.historyList.innerHTML = '';
    state.history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-card';
      const actionText = item.action === 'encrypt' ? '🔒 Cifrado' : '🔓 Descifrado';
      const algoLabel = {
        cesar: `César (+${item.shift})`,
        morse: 'Morse',
        inversio: 'Inversión'
      }[item.algo] || item.algo;

      card.innerHTML = `
        <div class="hist-top">
          <span class="hist-algo">${algoLabel}</span>
          <span>${item.time} • ${actionText}</span>
        </div>
        <div class="hist-text"><strong>Entrada:</strong> ${escapeHtml(item.input)}</div>
        <div class="hist-arrow">⬇</div>
        <div class="hist-text"><strong>Salida:</strong> ${escapeHtml(item.output)}</div>
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
        showToast('Conversión recuperada del historial.');
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
    showToast('Historial borrado correctamente.');
  }

  // =========================================================================
  // 11. CAMBIO DE PESTAÑA / ALGORITMO
  // =========================================================================
  function setAlgo(algo) {
    state.currentAlgo = algo;

    // Actualizar pestañas activas
    dom.tabBtns.forEach(btn => {
      const isActive = btn.dataset.algo === algo;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Ocultar todos los paneles de parámetros
    dom.paramsCesar.classList.add('hidden');
    dom.paramsMorse.classList.add('hidden');
    dom.paramsInversio.classList.add('hidden');

    // Detener cualquier sonido morse en curso
    stopMorseAudio();

    if (algo === 'cesar') {
      dom.paramsCesar.classList.remove('hidden');
      dom.algoTitle.textContent = 'Cifrado César';
      dom.algoDesc.textContent = "Aplica un desplazamiento determinado de posiciones en el alfabeto sobre cada letra. Mantiene mayúsculas, minúsculas y puntuación intactas.";
      dom.algoBadgeFeature.textContent = 'Aritmética Modular (mod 26)';
    } else if (algo === 'morse') {
      dom.paramsMorse.classList.remove('hidden');
      dom.algoTitle.textContent = 'Código Morse';
      dom.algoDesc.textContent = "Codifica el texto en puntos y rayas con normalización NFKD de acentos. Incluye reproductor de audio sintetizado y señal luminosa.";
      dom.algoBadgeFeature.textContent = 'Señales Telegráficas y Web Audio';
    } else if (algo === 'inversio') {
      dom.paramsInversio.classList.remove('hidden');
      dom.algoTitle.textContent = 'Inversión de Texto';
      dom.algoDesc.textContent = "Invierte el orden de los caracteres de la cadena. Al ser una función involutiva (f(f(x)) = x), descifrar es idéntico a cifrar.";
      dom.algoBadgeFeature.textContent = 'Función Involutiva';
    }

    performConversion();
  }

  function setMode(mode) {
    state.currentAction = mode;
    dom.modeEncryptBtn.classList.toggle('active', mode === 'encrypt');
    dom.modeDecryptBtn.classList.toggle('active', mode === 'decrypt');
    
    // Cambiar etiquetas
    const inputLabel = document.getElementById('input-label');
    const outputLabel = document.getElementById('output-label');
    if (inputLabel && outputLabel) {
      if (mode === 'encrypt') {
        inputLabel.textContent = 'Texto Original (a codificar)';
        outputLabel.textContent = 'Texto Cifrado (resultado)';
      } else {
        inputLabel.textContent = 'Texto Cifrado (a decodificar)';
        outputLabel.textContent = 'Texto Descifrado (original)';
      }
    }

    performConversion();
  }

  // =========================================================================
  // 12. UTILIDADES Y TOAST
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
  // 13. EVENTOS (EVENT LISTENERS)
  // =========================================================================

  // Input de texto
  let debounceTimer = null;
  dom.textInput.addEventListener('input', () => {
    if (state.isLive) {
      performConversion();
    }
    // Tras 1.5s de inactividad de escritura, guardar en el historial
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      saveToHistory();
    }, 1500);
  });

  // Alternar modo Tiempo Real (Live mode)
  dom.liveConvertToggle.addEventListener('change', (e) => {
    state.isLive = e.target.checked;
    dom.btnManualConvert.classList.toggle('hidden', state.isLive);
    if (state.isLive) performConversion();
  });

  dom.btnManualConvert.addEventListener('click', () => {
    performConversion();
    saveToHistory();
  });

  // Selector de acción (Cifrar / Descifrar)
  dom.modeEncryptBtn.addEventListener('click', () => setMode('encrypt'));
  dom.modeDecryptBtn.addEventListener('click', () => setMode('decrypt'));

  // Pestañas de algoritmo
  dom.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => setAlgo(btn.dataset.algo));
  });

  // Sincronización del deslizador y número César
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

  // Controles Morse
  dom.btnMorsePlay.addEventListener('click', playMorseAudio);
  dom.btnMorseStop.addEventListener('click', stopMorseAudio);

  dom.morseWpmSlider.addEventListener('input', (e) => {
    dom.morseWpmVal.textContent = e.target.value;
  });

  dom.morseFreqSlider.addEventListener('input', (e) => {
    dom.morseFreqVal.textContent = e.target.value;
  });

  // Botones de opción de Inversión
  dom.inversionRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        state.inversionType = e.target.value;
        performConversion();
      }
    });
  });

  // Botón de intercambio (Swap)
  dom.btnSwapIo.addEventListener('click', () => {
    const temp = dom.textInput.value;
    dom.textInput.value = dom.textOutput.value;
    dom.textOutput.value = temp;

    // Cambiar acción automáticamente (de cifrar a descifrar o viceversa)
    setMode(state.currentAction === 'encrypt' ? 'decrypt' : 'encrypt');
    showToast('¡Se han intercambiado la entrada y la salida!');
  });

  // Limpiar entrada
  dom.btnClearInput.addEventListener('click', () => {
    dom.textInput.value = '';
    performConversion();
    dom.textInput.focus();
    showToast('Campo de entrada borrado.');
  });

  // Texto de ejemplo
  dom.btnSampleInput.addEventListener('click', () => {
    if (state.currentAlgo === 'cesar') {
      dom.textInput.value = 'Julio César utilizó este sistema militar en la Galia para enviar órdenes secretas en el año 50 a. C.';
    } else if (state.currentAlgo === 'morse') {
      dom.textInput.value = 'SOS Transmision de emergencia a 15 WPM';
    } else {
      dom.textInput.value = '¡Buenos días! La criptografía clásica es fascinante.';
    }
    performConversion();
    saveToHistory();
    showToast('¡Texto de ejemplo cargado!');
  });

  // Pegar del portapapeles
  dom.btnPasteInput.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      dom.textInput.value = text;
      performConversion();
      showToast('Texto pegado desde el portapapeles.');
    } catch (err) {
      showToast('No se ha podido acceder al portapapeles. Usa Ctrl+V directamente.');
    }
  });

  // Copiar salida
  dom.btnCopyOutput.addEventListener('click', async () => {
    const text = dom.textOutput.value;
    if (!text) {
      showToast('No hay texto de salida para copiar.');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      dom.btnCopyOutput.classList.add('copied');
      setTimeout(() => dom.btnCopyOutput.classList.remove('copied'), 2000);
      showToast('¡Texto copiado al portapapeles!');
      saveToHistory();
    } catch (err) {
      showToast('Error al copiar al portapapeles.');
    }
  });

  // Descargar salida (.txt)
  dom.btnDownloadOutput.addEventListener('click', () => {
    const text = dom.textOutput.value;
    if (!text) {
      showToast('El resultado está vacío, no se puede descargar.');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cifrado_${state.currentAlgo}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('¡Archivo descargado!');
  });

  // Disparadores de modales y paneles desplegables
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

  // Cerrar modales al hacer clic fuera de la ventana
  window.addEventListener('click', (e) => {
    if (e.target === dom.modalBruteforce) dom.modalBruteforce.classList.add('hidden');
    if (e.target === dom.modalMorse) dom.modalMorse.classList.add('hidden');
  });

  // Cerrar con la tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModals();
  });

  // =========================================================================
  // 14. INICIALIZACIÓN
  // =========================================================================
  initCaesarAlphabetStrip();
  populateMorseTable();
  renderHistory();
  performConversion();

  // =========================================================================
  // 15. SISTEMA DE REGISTRO DE VISITANTES Y CONTADOR EN TIEMPO REAL (/dades)
  // =========================================================================
  const liveVisitsCountElem = document.getElementById('live-visits-count');

  async function registrarVisita() {
    // 1. Obtener o crear el identificador de usuario
    let usuari = localStorage.getItem('cifratge_nom_usuari');
    if (!usuari) {
      usuari = `Usuario-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('cifratge_nom_usuari', usuari);
    }

    // 2. Detectar geolocalización (país, región, ciudad)
    let geo = {
      pais: 'España',
      regio: 'Madrid',
      ciutat: 'Madrid'
    };

    // Intentar geolocalización por IP pública client-side con fallback rápido
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

    // 3. Enviar datos al servidor HTTP local (/api/visita)
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
      // Modo estático
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

  // Ejecutar registro inicial y consulta periódica en tiempo real
  registrarVisita();
  setInterval(actualitzarComptadorVisites, 4000);
});
