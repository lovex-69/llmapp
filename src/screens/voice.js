export function renderVoice() {
  return `<div class="voice-screen">
    <div class="voice-label">Tap to start speaking</div>
    <div class="voice-orb-container">
      <div class="voice-ring"></div>
      <div class="voice-ring"></div>
      <button class="voice-orb" id="voice-orb">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      </button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <button class="btn btn-secondary btn-sm" id="voice-tts-toggle">🔊 TTS: On</button>
      <button class="btn btn-secondary btn-sm" id="voice-continuous">🔄 Continuous Mode</button>
    </div>
    <div class="voice-transcript" id="voice-transcript">Your speech will appear here...</div>
  </div>`;
}

export function initVoice() {
  const orb = document.getElementById('voice-orb');
  const transcript = document.getElementById('voice-transcript');
  let listening = false;

  if (orb) {
    orb.addEventListener('click', () => {
      listening = !listening;
      orb.classList.toggle('listening', listening);
      if (listening) {
        transcript.textContent = 'Listening...';
        // Simulate speech recognition
        setTimeout(() => {
          if (orb.classList.contains('listening')) {
            transcript.textContent = '"How does machine learning work?"';
            orb.classList.remove('listening');
          }
        }, 3000);
      } else {
        transcript.textContent = 'Tap the orb to start speaking';
      }
    });
  }
}
