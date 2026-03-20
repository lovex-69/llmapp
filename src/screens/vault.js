import { state } from '../state.js';
import { showToast } from '../components/toast.js';

export function renderVault(navigateFn) {
  if (!state.vaultPin) {
    return renderSetupVault();
  }
  if (!state.vaultUnlocked) {
    return renderUnlockVault();
  }
  return renderVaultContents(navigateFn);
}

function renderSetupVault() {
  return `<div class="settings-screen">
    <div class="empty-state" style="padding:40px 24px">
      <div style="width:80px;height:80px;border-radius:20px;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;margin-bottom:20px;box-shadow:var(--shadow-glow)">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h3 style="font-size:1.1rem;margin-bottom:6px">Set Up Secure Vault</h3>
      <p style="max-width:280px;margin-bottom:20px">Lock sensitive conversations with a PIN. Vault data is stored locally and never transmitted.</p>
      <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:260px">
        <input type="password" id="vault-new-pin" placeholder="Enter 4-digit PIN" maxlength="6" inputmode="numeric"
          style="width:100%;padding:14px;text-align:center;font-size:1.3rem;letter-spacing:12px;border-radius:var(--radius-md);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);outline:none" />
        <button class="btn btn-primary w-full" id="vault-create-btn">Create Vault</button>
      </div>
    </div>
  </div>`;
}

function renderUnlockVault() {
  return `<div class="settings-screen">
    <div class="empty-state" style="padding:40px 24px">
      <div style="width:80px;height:80px;border-radius:20px;background:var(--bg-glass);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin-bottom:20px">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h3 style="font-size:1.1rem;margin-bottom:6px">Unlock Vault</h3>
      <p style="margin-bottom:20px;color:var(--text-secondary);font-size:0.85rem">Enter your PIN to access locked conversations</p>
      <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:260px">
        <input type="password" id="vault-pin-input" placeholder="Enter PIN" maxlength="6" inputmode="numeric"
          style="width:100%;padding:14px;text-align:center;font-size:1.3rem;letter-spacing:12px;border-radius:var(--radius-md);background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);outline:none" />
        <button class="btn btn-primary w-full" id="vault-unlock-btn">Unlock</button>
        <div id="vault-error" style="color:var(--danger);font-size:0.8rem;text-align:center;display:none">Incorrect PIN</div>
      </div>
    </div>
  </div>`;
}

function renderVaultContents(navigateFn) {
  const lockedChats = state.chats.filter(c => c.locked);
  return `<div class="settings-screen">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 style="font-size:1.3rem;font-weight:700">Secure Vault</h2>
      <button class="btn btn-secondary btn-sm" id="vault-lock-btn">Lock Vault</button>
    </div>
    <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:16px">Conversations locked in the vault. PIN-protected, stored locally.</p>

    ${lockedChats.length === 0 ? `
      <div class="empty-state" style="padding:32px">
        <div class="empty-state-icon" style="font-size:1rem;opacity:0.3">—</div>
        <h3>No locked conversations</h3>
        <p>Lock a chat from the sidebar to move it here</p>
      </div>` : lockedChats.map(c => `
      <div class="installed-model-card" style="cursor:pointer" data-chat-id="${c.id}">
        <span style="font-size:0.8rem;opacity:0.4">●</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:0.88rem;font-weight:600">${c.title}</div>
          <div style="font-size:0.72rem;color:var(--text-tertiary)">${c.messages.length} messages • ${c.time}</div>
        </div>
        <div style="display:flex;gap:4px">
          <button class="btn btn-secondary btn-xs vault-open-chat" data-id="${c.id}">Open</button>
          <button class="btn btn-danger btn-xs vault-unlock-chat" data-id="${c.id}">Unlock</button>
        </div>
      </div>`).join('')}

    <div style="margin-top:24px;padding:14px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:0.8rem;color:var(--text-secondary)">Change PIN</span>
        <button class="btn btn-secondary btn-xs" id="vault-change-pin">Change</button>
      </div>
    </div>
  </div>`;
}

export function initVault(refreshFn, navigateFn) {
  // Setup vault
  document.getElementById('vault-create-btn')?.addEventListener('click', () => {
    const pin = document.getElementById('vault-new-pin')?.value;
    if (pin && pin.length >= 4) {
      state.vaultPin = pin;
      state.vaultUnlocked = true;
      localStorage.setItem('nb-vault-pin', pin);
      refreshFn();
      showToast('Vault created! Your chats are now protected.', 'success');
    } else {
      showToast('PIN must be at least 4 digits', 'error');
    }
  });

  // Unlock vault
  document.getElementById('vault-unlock-btn')?.addEventListener('click', () => {
    const pin = document.getElementById('vault-pin-input')?.value;
    if (pin === state.vaultPin) {
      state.vaultUnlocked = true;
      refreshFn();
      showToast('Vault unlocked', 'success');
    } else {
      const errEl = document.getElementById('vault-error');
      if (errEl) errEl.style.display = 'block';
      showToast('Incorrect PIN', 'error');
    }
  });

  // Lock vault
  document.getElementById('vault-lock-btn')?.addEventListener('click', () => {
    state.vaultUnlocked = false;
    refreshFn();
    showToast('Vault locked', 'info');
  });

  // Open chat from vault
  document.querySelectorAll('.vault-open-chat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.activeChatId = btn.dataset.id;
      navigateFn('chat');
    });
  });

  // Unlock (unprotect) a chat
  document.querySelectorAll('.vault-unlock-chat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const chat = state.chats.find(c => c.id === btn.dataset.id);
      if (chat) { chat.locked = false; refreshFn(); showToast('Chat unlocked', 'info'); }
    });
  });

  // Change PIN
  document.getElementById('vault-change-pin')?.addEventListener('click', () => {
    const newPin = prompt('Enter new PIN (min 4 digits):');
    if (newPin && newPin.length >= 4) {
      state.vaultPin = newPin;
      localStorage.setItem('nb-vault-pin', newPin);
      showToast('PIN changed', 'success');
    }
  });
}
