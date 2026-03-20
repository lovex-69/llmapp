import { state } from '../state.js';
import { showToast } from '../components/toast.js';

const categories = [
  { id: 'personal', label: 'Personal', icon: '' },
  { id: 'preferences', label: 'Preferences', icon: '' },
  { id: 'work', label: 'Work', icon: '' },
];

export function renderMemory() {
  const grouped = {};
  categories.forEach(c => grouped[c.id] = []);
  state.memories.forEach(m => {
    const cat = m.category || 'personal';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(m);
  });
  const tempMems = state.memories.filter(m => m.temp);
  const permMems = state.memories.filter(m => !m.temp);

  return `<div class="settings-screen">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
      <h2 style="font-size:1.3rem;font-weight:700">Memory</h2>
      <label class="toggle"><input type="checkbox" id="mem-toggle" ${state.memoryEnabled?'checked':''}/><span class="toggle-slider"></span></label>
    </div>
    <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:16px">AI remembers your context. Fully transparent and editable.</p>

    ${!state.memoryEnabled ? '<div class="empty-state" style="padding:32px"><h3>Memory is off</h3><p>Enable the toggle above to let the AI remember context between conversations.</p></div>' : `
      ${tempMems.length > 0 ? `
        <div class="memory-category-header">Session memory <span class="memory-temp-badge">Temporary</span></div>
        ${tempMems.map(m => renderMemoryItem(m)).join('')}
      ` : ''}

      ${categories.map(cat => {
        const items = grouped[cat.id]?.filter(m => !m.temp) || [];
        if (items.length === 0) return '';
        return `<div class="memory-category-header">${cat.label}</div>
          ${items.map(m => renderMemoryItem(m)).join('')}`;
      }).join('')}

      <button class="add-memory-btn mt-md" id="add-memory-btn">+ Add Memory</button>

      <div style="margin-top:16px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:0.82rem;font-weight:500">${state.memories.length} total entries</div>
            <div style="font-size:0.72rem;color:var(--text-tertiary)">${tempMems.length} session-only • ${permMems.length} permanent</div>
          </div>
          <button class="btn btn-danger btn-xs" id="clear-temp-mem">Clear Temp</button>
        </div>
      </div>
    `}
  </div>`;
}

function renderMemoryItem(m) {
  return `<div class="memory-item" data-id="${m.id}">
    <span class="memory-icon">${m.temp ? '·' : '·'}</span>
    <span class="memory-text">${m.text}</span>
    <div class="memory-actions">
      <button class="btn btn-xs btn-secondary mem-edit" data-id="${m.id}">✎</button>
      <button class="btn btn-xs btn-danger mem-delete" data-id="${m.id}">✕</button>
    </div>
  </div>`;
}

export function initMemory(refreshFn) {
  document.getElementById('mem-toggle')?.addEventListener('change', (e) => {
    state.memoryEnabled = e.target.checked;
    refreshFn();
    showToast(state.memoryEnabled ? 'Memory enabled' : 'Memory disabled', 'info');
  });

  document.querySelectorAll('.mem-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const mem = state.memories.find(m => m.id === btn.dataset.id);
      if (mem) {
        showMemoryEditor(mem, refreshFn);
      }
    });
  });

  document.querySelectorAll('.mem-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      state.memories = state.memories.filter(m => m.id !== btn.dataset.id);
      refreshFn();
      showToast('Memory deleted', 'info');
    });
  });

  document.getElementById('add-memory-btn')?.addEventListener('click', () => {
    showMemoryEditor(null, refreshFn);
  });

  document.getElementById('clear-temp-mem')?.addEventListener('click', () => {
    state.memories = state.memories.filter(m => !m.temp);
    refreshFn();
    showToast('Session memory cleared', 'info');
  });
}

function showMemoryEditor(mem, refreshFn) {
  let overlay = document.querySelector('.modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.getElementById('app').appendChild(overlay);
  }
  const isNew = !mem;
  if (isNew) mem = { id: 'm-' + Date.now(), text: '', category: 'personal', temp: false };

  overlay.innerHTML = `<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${isNew ? 'Add' : 'Edit'} Memory</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:0.78rem;font-weight:600;display:block;margin-bottom:4px">Content</label>
        <textarea id="mem-text" rows="3" style="width:100%;padding:10px 12px;border-radius:var(--radius-sm);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-size:0.85rem;resize:vertical;outline:none">${mem.text}</textarea>
      </div>
      <div style="display:flex;gap:12px">
        <div style="flex:1">
          <label style="font-size:0.78rem;font-weight:600;display:block;margin-bottom:4px">Category</label>
          <select id="mem-cat" style="width:100%;padding:10px;border-radius:var(--radius-sm);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-size:0.85rem;outline:none">
            ${categories.map(c => `<option value="${c.id}" ${mem.category===c.id?'selected':''}>${c.label}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex;align-items:flex-end;gap:6px;padding-bottom:2px">
          <label style="font-size:0.75rem;color:var(--text-secondary)">Temporary</label>
          <label class="toggle"><input type="checkbox" id="mem-temp" ${mem.temp?'checked':''}/><span class="toggle-slider"></span></label>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary flex-1" id="mem-save">Save</button>
        <button class="btn btn-secondary" id="mem-cancel">Cancel</button>
      </div>
    </div>
  </div>`;

  setTimeout(() => overlay.classList.add('visible'), 10);
  function close() { overlay.classList.remove('visible'); setTimeout(() => overlay.remove(), 300); }
  overlay.querySelector('#mem-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('#mem-save').addEventListener('click', () => {
    mem.text = overlay.querySelector('#mem-text').value.trim();
    mem.category = overlay.querySelector('#mem-cat').value;
    mem.temp = overlay.querySelector('#mem-temp').checked;
    if (!mem.text) { showToast('Memory text required', 'error'); return; }
    if (isNew) state.memories.push(mem);
    close();
    refreshFn();
    showToast(isNew ? 'Memory added' : 'Memory updated', 'success');
  });
}
