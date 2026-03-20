import { state } from '../state.js';

export function showCommandPalette(navigateFn) {
  document.querySelector('.cmd-palette-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'cmd-palette-overlay';
  overlay.innerHTML = `
    <div class="cmd-palette">
      <div class="cmd-input-wrap">
        <svg class="cmd-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="cmd-input" class="cmd-input" placeholder="Search or jump to..." autofocus />
        <kbd class="cmd-kbd">ESC</kbd>
      </div>
      <div id="cmd-results" class="cmd-results"></div>
    </div>`;

  document.getElementById('app').appendChild(overlay);
  setTimeout(() => overlay.classList.add('visible'), 10);

  const input = overlay.querySelector('#cmd-input');
  const results = overlay.querySelector('#cmd-results');

  function close() {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 200);
  }
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const commands = [
    { label:'New conversation', desc:'Start fresh', action:() => { close(); document.getElementById('new-chat-btn')?.click(); }},
    { label:'Search', desc:'Find across chats, files, memory', action:() => { close(); document.getElementById('search-btn')?.click(); }},
    { label:'Switch model', desc:'Change the active AI model', action:() => { close(); navigateFn('models'); }},
    { label:'Behaviors', desc:'Manage response profiles', action:() => { close(); navigateFn('behaviors'); }},
    { label:'Knowledge', desc:'Upload and manage files', action:() => { close(); navigateFn('files'); }},
    { label:'Memory', desc:'View stored context', action:() => { close(); navigateFn('memory'); }},
    { label:'Vault', desc:'PIN-protected conversations', action:() => { close(); navigateFn('vault'); }},
    { label:'Performance', desc:'System metrics', action:() => { close(); navigateFn('dashboard'); }},
    { label:'Voice', desc:'Speech input', action:() => { close(); navigateFn('voice'); }},
    { label:'Model store', desc:'Browse and download models', action:() => { close(); navigateFn('store'); }},
    { label:'Settings', desc:'Preferences', action:() => { close(); navigateFn('settings'); }},
    { label:'Toggle theme', desc:'Switch dark / light', action:() => { close(); state.theme = state.theme==='dark'?'light':'dark'; document.documentElement.setAttribute('data-theme',state.theme); localStorage.setItem('nb-theme',state.theme); }},
    { label:'/summarize', desc:'Condense text or a topic', action:() => { close(); navigateFn('chat'); setTimeout(()=>{const i=document.getElementById('chat-input');if(i){i.value='/summarize ';i.focus();}},100); }},
    { label:'/code', desc:'Generate code', action:() => { close(); navigateFn('chat'); setTimeout(()=>{const i=document.getElementById('chat-input');if(i){i.value='/code ';i.focus();}},100); }},
    { label:'/explain', desc:'Break down a concept', action:() => { close(); navigateFn('chat'); setTimeout(()=>{const i=document.getElementById('chat-input');if(i){i.value='/explain ';i.focus();}},100); }},
    { label:'/debug', desc:'Find issues in code', action:() => { close(); navigateFn('chat'); setTimeout(()=>{const i=document.getElementById('chat-input');if(i){i.value='/debug ';i.focus();}},100); }},
  ];

  state.chats.filter(c => !c.locked || state.vaultUnlocked).forEach(c => {
    commands.push({ label:c.title, desc:`Chat · ${c.time}`, action:() => { close(); state.activeChatId = c.id; navigateFn('chat'); }});
  });

  function render(query) {
    const q = query.toLowerCase();
    const filtered = q ? commands.filter(c => c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)) : commands.slice(0, 10);
    results.innerHTML = filtered.length === 0
      ? '<div style="padding:20px;text-align:center;color:var(--text-tertiary);font-size:0.85rem">Nothing found</div>'
      : filtered.map((c, i) => `
        <button class="cmd-item ${i===0?'cmd-active':''}" data-idx="${i}">
          <div class="cmd-item-text"><div class="cmd-item-label">${c.label}</div><div class="cmd-item-desc">${c.desc}</div></div>
        </button>`).join('');

    results.querySelectorAll('.cmd-item').forEach((item, i) => {
      item.addEventListener('click', () => filtered[i]?.action());
      item.addEventListener('mouseenter', () => {
        results.querySelectorAll('.cmd-item').forEach(el => el.classList.remove('cmd-active'));
        item.classList.add('cmd-active');
      });
    });
  }

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    const items = results.querySelectorAll('.cmd-item');
    const active = results.querySelector('.cmd-active');
    const idx = Array.from(items).indexOf(active);
    if (e.key === 'ArrowDown') { e.preventDefault(); active?.classList.remove('cmd-active'); items[Math.min(idx+1, items.length-1)]?.classList.add('cmd-active'); items[Math.min(idx+1, items.length-1)]?.scrollIntoView({block:'nearest'}); }
    if (e.key === 'ArrowUp') { e.preventDefault(); active?.classList.remove('cmd-active'); items[Math.max(idx-1, 0)]?.classList.add('cmd-active'); }
    if (e.key === 'Enter') { e.preventDefault(); results.querySelector('.cmd-active')?.click(); }
  });

  render('');
  input.focus();
}

export function initCommandPalette(navigateFn) {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      showCommandPalette(navigateFn);
    }
  });
}
