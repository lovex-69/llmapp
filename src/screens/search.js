import { state } from '../state.js';

export function showSearch(navigateFn) {
  let overlay = document.querySelector('.modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.getElementById('app').appendChild(overlay);
  }
  overlay.innerHTML = `<div class="modal" style="max-height:90vh;border-radius:var(--radius-lg) var(--radius-lg) 0 0">
    <div class="modal-handle"></div>
    <div style="position:relative;margin-bottom:12px">
      <input type="text" id="search-input" placeholder="Search everything..." autofocus
        style="width:100%;padding:12px 16px 12px 40px;border-radius:var(--radius-md);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-size:0.92rem;outline:none" />
      <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);opacity:0.4" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    </div>
    <div id="search-results" style="max-height:60vh;overflow-y:auto"></div>
  </div>`;

  setTimeout(() => { overlay.classList.add('visible'); document.getElementById('search-input')?.focus(); }, 10);

  function close() { overlay.classList.remove('visible'); setTimeout(() => overlay.remove(), 300); }
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const input = overlay.querySelector('#search-input');
  const results = overlay.querySelector('#search-results');

  function search(query) {
    if (!query.trim()) {
      results.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-tertiary);font-size:0.85rem">
        Search across chats, files, and memories
      </div>`;
      return;
    }
    const q = query.toLowerCase();
    let html = '';
    let count = 0;

    const chatResults = state.chats.filter(c =>
      (!c.locked || state.vaultUnlocked) &&
      (c.title.toLowerCase().includes(q) || c.messages.some(m => m.text.toLowerCase().includes(q)))
    );
    if (chatResults.length > 0) {
      html += '<div style="font-size:0.75rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;padding:8px 0 4px">Conversations</div>';
      chatResults.forEach(c => {
        const matchMsg = c.messages.find(m => m.text.toLowerCase().includes(q));
        const preview = matchMsg ? matchMsg.text.substring(0, 80) + '...' : '';
        html += `<div class="chat-item search-chat-item" data-chat-id="${c.id}" style="margin-bottom:4px">
          <div style="flex:1;min-width:0">
            <div style="font-size:0.85rem;font-weight:500">${c.title}</div>
            ${preview ? `<div style="font-size:0.72rem;color:var(--text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${preview}</div>` : ''}
          </div>
          <span class="chat-item-time">${c.time}</span>
        </div>`;
        count++;
      });
    }

    const fileResults = state.files.filter(f => f.name.toLowerCase().includes(q));
    if (fileResults.length > 0) {
      html += '<div style="font-size:0.75rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;padding:12px 0 4px">Files</div>';
      fileResults.forEach(f => {
        html += `<div class="chat-item" style="margin-bottom:4px">
          <div style="flex:1"><div style="font-size:0.85rem;font-weight:500">${f.name}</div><div style="font-size:0.72rem;color:var(--text-tertiary)">${f.size} · ${f.status}</div></div>
        </div>`;
        count++;
      });
    }

    const memResults = state.memories.filter(m => m.text.toLowerCase().includes(q));
    if (memResults.length > 0) {
      html += '<div style="font-size:0.75rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;padding:12px 0 4px">Memory</div>';
      memResults.forEach(m => {
        html += `<div class="chat-item" style="margin-bottom:4px">
          <div style="flex:1"><div style="font-size:0.85rem">${m.text}</div></div>
        </div>`;
        count++;
      });
    }

    const behResults = state.behaviors.filter(b => b.name.toLowerCase().includes(q) || b.prompt.toLowerCase().includes(q));
    if (behResults.length > 0) {
      html += '<div style="font-size:0.75rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;padding:12px 0 4px">Behaviors</div>';
      behResults.forEach(b => {
        html += `<div class="chat-item" style="margin-bottom:4px">
          <div style="flex:1"><div style="font-size:0.85rem;font-weight:500">${b.name}</div><div style="font-size:0.72rem;color:var(--text-tertiary)">${b.desc}</div></div>
        </div>`;
        count++;
      });
    }

    if (count === 0) {
      html = `<div style="text-align:center;padding:24px;color:var(--text-tertiary);font-size:0.85rem">No results for "${query}"</div>`;
    }

    results.innerHTML = html;

    results.querySelectorAll('.search-chat-item').forEach(item => {
      item.addEventListener('click', () => {
        state.activeChatId = item.dataset.chatId;
        close();
        navigateFn('chat');
      });
    });
  }

  input.addEventListener('input', () => search(input.value));
  search('');
}
