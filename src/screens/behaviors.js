import { state, getActiveBehavior } from '../state.js';
import { showToast } from '../components/toast.js';

export function renderBehaviors() {
  const active = getActiveBehavior();
  const tones = ['balanced','professional','friendly','creative','academic'];
  const lengths = ['concise','medium','detailed'];

  return `<div class="settings-screen">
    <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px">AI Behavior</h2>
    <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:16px">Define how the AI responds. Apply different behaviors per conversation.</p>

    <div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:8px">ACTIVE BEHAVIOR</div>
    <div class="card" style="border-color:rgba(139,92,246,0.3);background:var(--accent-soft);margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:1rem;width:28px;text-align:center">${active.icon || active.name[0]}</span>
        <div>
          <div style="font-size:0.92rem;font-weight:600">${active.name}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary)">${active.desc}</div>
        </div>
      </div>
      <div style="font-size:0.78rem;color:var(--text-tertiary);background:var(--bg-glass);padding:8px 12px;border-radius:var(--radius-sm);font-style:italic;border:1px solid var(--border)">"${active.prompt}"</div>
    </div>

    <div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:8px">ALL PROFILES</div>
    ${state.behaviors.map(b => `
      <div class="installed-model-card ${b.id === state.activeBehaviorId ? 'active-model' : ''}" data-beh-id="${b.id}" style="cursor:pointer">
        <span style="font-size:1rem;flex-shrink:0;width:28px;text-align:center">${b.icon || b.name[0]}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:0.88rem;font-weight:600">${b.name}</div>
          <div style="font-size:0.72rem;color:var(--text-tertiary)">${b.desc}</div>
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          ${b.id === state.activeBehaviorId ? '<span class="badge badge-fast">Active</span>' : `<button class="btn btn-secondary btn-xs beh-activate" data-id="${b.id}">Use</button>`}
          <button class="btn btn-xs btn-secondary beh-edit" data-id="${b.id}">✎</button>
          ${b.id !== 'default' ? `<button class="btn btn-xs btn-danger beh-delete" data-id="${b.id}">✕</button>` : ''}
        </div>
      </div>`).join('')}

    <button class="add-memory-btn mt-md" id="add-behavior-btn">+ Create New Behavior</button>

    <div style="margin-top:24px;padding:14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md)">
      <div style="font-size:0.8rem;font-weight:600;margin-bottom:8px;color:var(--text-secondary)">TIPS</div>
      <ul style="font-size:0.78rem;color:var(--text-secondary);padding-left:16px;line-height:1.8">
        <li>Use natural language: "Respond like a patient teacher"</li>
        <li>Be specific: "Use bullet points, keep paragraphs under 3 lines"</li>
        <li>Set per-chat behaviors from the sidebar</li>
      </ul>
    </div>
  </div>`;
}

export function initBehaviors(refreshFn) {
  document.querySelectorAll('.beh-activate').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.activeBehaviorId = btn.dataset.id;
      refreshFn();
      showToast(`Behavior: ${getActiveBehavior().name}`, 'success');
    });
  });

  document.querySelectorAll('.beh-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Delete this behavior profile?')) {
        state.behaviors = state.behaviors.filter(b => b.id !== btn.dataset.id);
        if (state.activeBehaviorId === btn.dataset.id) state.activeBehaviorId = 'default';
        refreshFn();
        showToast('Behavior deleted', 'info');
      }
    });
  });

  document.querySelectorAll('.beh-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const beh = state.behaviors.find(b => b.id === btn.dataset.id);
      if (beh) showBehaviorEditor(beh, refreshFn);
    });
  });

  document.getElementById('add-behavior-btn')?.addEventListener('click', () => {
    const newBeh = {
      id: 'beh-' + Date.now(),
      name: 'New Behavior',
      icon: '',
      desc: 'Custom behavior profile',
      prompt: '',
      tone: 'balanced',
      length: 'medium',
    };
    showBehaviorEditor(newBeh, refreshFn, true);
  });
}

function showBehaviorEditor(beh, refreshFn, isNew = false) {
  let overlay = document.querySelector('.modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.getElementById('app').appendChild(overlay);
  }
  overlay.innerHTML = `<div class="modal">
    <div class="modal-handle"></div>
    <div class="modal-title">${isNew ? 'Create' : 'Edit'} Behavior Profile</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:0.78rem;font-weight:600;display:block;margin-bottom:4px">Name</label>
        <input type="text" id="beh-name" value="${beh.name}" style="width:100%;padding:10px 12px;border-radius:var(--radius-sm);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-size:0.88rem;outline:none" />
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:600;display:block;margin-bottom:4px">Icon</label>
        <input type="text" id="beh-icon" value="${beh.icon}" maxlength="4" style="width:60px;padding:10px 12px;border-radius:var(--radius-sm);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-size:1.1rem;text-align:center;outline:none" />
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:600;display:block;margin-bottom:4px">Description</label>
        <input type="text" id="beh-desc" value="${beh.desc}" style="width:100%;padding:10px 12px;border-radius:var(--radius-sm);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-size:0.85rem;outline:none" />
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:600;display:block;margin-bottom:4px">Behavior Instructions</label>
        <textarea id="beh-prompt" rows="4" style="width:100%;padding:10px 12px;border-radius:var(--radius-sm);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-size:0.85rem;resize:vertical;outline:none;line-height:1.5">${beh.prompt}</textarea>
      </div>
      <div style="display:flex;gap:12px">
        <div style="flex:1">
          <label style="font-size:0.78rem;font-weight:600;display:block;margin-bottom:4px">Tone</label>
          <select id="beh-tone" style="width:100%;padding:10px;border-radius:var(--radius-sm);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-size:0.85rem;outline:none">
            ${['balanced','professional','friendly','creative','academic'].map(t => `<option value="${t}" ${beh.tone===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div style="flex:1">
          <label style="font-size:0.78rem;font-weight:600;display:block;margin-bottom:4px">Length</label>
          <select id="beh-length" style="width:100%;padding:10px;border-radius:var(--radius-sm);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);font-size:0.85rem;outline:none">
            ${['concise','medium','detailed'].map(l => `<option value="${l}" ${beh.length===l?'selected':''}>${l.charAt(0).toUpperCase()+l.slice(1)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary flex-1" id="beh-save">Save</button>
        <button class="btn btn-secondary" id="beh-cancel">Cancel</button>
      </div>
    </div>
  </div>`;

  setTimeout(() => overlay.classList.add('visible'), 10);
  function close() { overlay.classList.remove('visible'); setTimeout(() => overlay.remove(), 300); }
  overlay.querySelector('#beh-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('#beh-save').addEventListener('click', () => {
    beh.name = overlay.querySelector('#beh-name').value || 'Untitled';
    beh.icon = overlay.querySelector('#beh-icon').value || '';
    beh.desc = overlay.querySelector('#beh-desc').value || '';
    beh.prompt = overlay.querySelector('#beh-prompt').value || '';
    beh.tone = overlay.querySelector('#beh-tone').value;
    beh.length = overlay.querySelector('#beh-length').value;
    if (isNew) state.behaviors.push(beh);
    close();
    refreshFn();
    showToast(isNew ? 'Behavior created!' : 'Behavior updated!', 'success');
  });
}
