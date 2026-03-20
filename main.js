// ===== NeuralBox — Main Entry Point =====
import { state, getActiveModel, getInstalledModels, getActiveBehavior } from './src/state.js';
import { showToast } from './src/components/toast.js';
import { renderChat, initChat } from './src/screens/chat.js';
import { renderStore, initStore } from './src/screens/store.js';
import { renderModels, initModels } from './src/screens/models.js';
import { renderSettings, initSettings } from './src/screens/settings.js';
import { renderFiles, initFiles } from './src/screens/files.js';
import { renderMemory, initMemory } from './src/screens/memory.js';
import { renderVoice, initVoice } from './src/screens/voice.js';
import { renderOnboarding } from './src/screens/onboarding.js';
import { renderBehaviors, initBehaviors } from './src/screens/behaviors.js';
import { showSearch } from './src/screens/search.js';
import { renderVault, initVault } from './src/screens/vault.js';
import { renderDashboard } from './src/screens/dashboard.js';
import { showCommandPalette, initCommandPalette } from './src/screens/cmdpalette.js';

const container = document.getElementById('screen-container');

// Apply saved theme
document.documentElement.setAttribute('data-theme', state.theme);

// ===== Screen Router =====
function navigateTo(screen) {
  state.currentScreen = screen;
  renderScreen();
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.screen === screen);
  });
  const topBar = document.getElementById('top-bar');
  if (['files', 'memory', 'voice', 'vault', 'dashboard'].includes(screen)) {
    topBar.querySelector('.top-bar-center').style.visibility = 'hidden';
  } else {
    topBar.querySelector('.top-bar-center').style.visibility = 'visible';
  }
}

function renderScreen() {
  const screen = state.currentScreen;
  let html = '';
  switch (screen) {
    case 'chat': html = renderChat(); break;
    case 'store': html = renderStore(); break;
    case 'models': html = renderModels(); break;
    case 'settings': html = renderSettings(); break;
    case 'files': html = renderFiles(); break;
    case 'memory': html = renderMemory(); break;
    case 'voice': html = renderVoice(); break;
    case 'behaviors': html = renderBehaviors(); break;
    case 'vault': html = renderVault(navigateTo); break;
    case 'dashboard': html = renderDashboard(); break;
    default: html = renderChat();
  }
  container.innerHTML = `<div class="screen active">${html}</div>`;

  switch (screen) {
    case 'chat': initChat(); break;
    case 'store': initStore(refreshCurrentScreen); break;
    case 'models': initModels(refreshCurrentScreen); break;
    case 'settings': initSettings(refreshCurrentScreen); break;
    case 'files': initFiles(refreshCurrentScreen); break;
    case 'memory': initMemory(refreshCurrentScreen); break;
    case 'voice': initVoice(); break;
    case 'behaviors': initBehaviors(refreshCurrentScreen); break;
    case 'vault': initVault(refreshCurrentScreen, navigateTo); break;
  }
}

function refreshCurrentScreen() {
  renderScreen();
  updateModelSelector();
  updateBehaviorSelector();
}

function updateModelSelector() {
  const model = getActiveModel();
  const nameEl = document.getElementById('active-model-name');
  if (nameEl) nameEl.textContent = model?.name || 'No model selected';
}

function updateBehaviorSelector() {
  const beh = getActiveBehavior();
  const el = document.getElementById('behavior-name');
  if (el) el.textContent = beh?.name || 'Default';
}

// ===== Bottom Navigation =====
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navigateTo(item.dataset.screen));
});

// ===== Sidebar =====
const sidebar = document.getElementById('chat-sidebar');
const backdrop = document.getElementById('sidebar-backdrop');

document.getElementById('sidebar-toggle').addEventListener('click', () => {
  sidebar.classList.add('open');
  backdrop.classList.remove('hidden');
  setTimeout(() => backdrop.classList.add('visible'), 10);
  renderChatList();
});

function closeSidebar() {
  sidebar.classList.remove('open');
  backdrop.classList.remove('visible');
  setTimeout(() => backdrop.classList.add('hidden'), 300);
}
backdrop.addEventListener('click', closeSidebar);

document.getElementById('new-chat-btn').addEventListener('click', () => {
  const newChat = { id: 'chat-' + Date.now(), title: 'New Chat', pinned: false, locked: false, behaviorId: state.activeBehaviorId, tag: '', time: 'Just now', messages: [] };
  state.chats.unshift(newChat);
  state.activeChatId = newChat.id;
  closeSidebar();
  navigateTo('chat');
  showToast('New conversation created', 'success');
});

document.getElementById('sidebar-memory-btn').addEventListener('click', () => { closeSidebar(); navigateTo('memory'); });
document.getElementById('sidebar-files-btn').addEventListener('click', () => { closeSidebar(); navigateTo('files'); });
document.getElementById('sidebar-vault-btn')?.addEventListener('click', () => { closeSidebar(); navigateTo('vault'); });
document.getElementById('sidebar-behaviors-btn')?.addEventListener('click', () => { closeSidebar(); navigateTo('behaviors'); });
document.getElementById('sidebar-dashboard-btn')?.addEventListener('click', () => { closeSidebar(); navigateTo('dashboard'); });

function renderChatList() {
  const list = document.getElementById('chat-list');
  const search = document.getElementById('chat-search');
  const query = search?.value.toLowerCase() || '';
  const filtered = state.chats.filter(c => {
    if (c.locked && !state.vaultUnlocked) return false;
    return c.title.toLowerCase().includes(query);
  });

  list.innerHTML = filtered.length === 0
    ? '<div class="empty-state" style="padding:24px"><p style="font-size:0.85rem;color:var(--text-secondary)">No conversations yet</p></div>'
    : filtered.map(c => {
      const tagMap = {work:'tag-work',study:'tag-study',personal:'tag-personal'};
      const tagLabel = c.tag ? `<span class="chat-tag ${tagMap[c.tag]||''}">${c.tag}</span>` : '';
      return `
      <div class="chat-item ${c.id === state.activeChatId ? 'active' : ''}" data-chat-id="${c.id}">
        ${c.pinned ? '<span class="chat-item-pin">·</span>' : ''}${c.locked ? '<span class="chat-item-pin" style="opacity:0.5">locked</span>' : ''}
        <span class="chat-item-title">${c.title}${tagLabel}</span>
        <span class="chat-item-time">${c.time}</span>
      </div>
    `}).join('');

  list.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', () => {
      state.activeChatId = item.dataset.chatId;
      closeSidebar();
      navigateTo('chat');
    });
  });
}

document.getElementById('chat-search')?.addEventListener('input', renderChatList);

// ===== Model Selector Dropdown =====
const modelDropdown = document.getElementById('model-dropdown');
document.getElementById('model-selector-btn').addEventListener('click', () => {
  modelDropdown.classList.toggle('hidden');
  if (!modelDropdown.classList.contains('hidden')) renderModelDropdown();
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('#model-selector-btn') && !e.target.closest('#model-dropdown')) {
    modelDropdown.classList.add('hidden');
  }
  if (!e.target.closest('#behavior-selector-btn') && !e.target.closest('#behavior-dropdown')) {
    const behDd = document.getElementById('behavior-dropdown');
    if (behDd) behDd.classList.add('hidden');
  }
});
document.getElementById('manage-models-link').addEventListener('click', () => {
  modelDropdown.classList.add('hidden');
  navigateTo('models');
});

function renderModelDropdown() {
  const list = document.getElementById('model-dropdown-list');
  const installed = getInstalledModels();
  list.innerHTML = installed.length === 0
    ? '<div style="padding:16px;text-align:center;color:var(--text-tertiary);font-size:0.85rem">No models installed</div>'
    : installed.map(m => `
      <div class="dropdown-model-item ${m.id === state.activeModelId ? 'active' : ''}" data-id="${m.id}">
        <div class="dropdown-model-info">
          <span class="dropdown-model-name">${m.name}</span>
          <span class="dropdown-model-meta">${m.size} • ${m.ram} RAM</span>
        </div>
        ${m.id === state.activeModelId ? '<span class="dropdown-model-check">✓</span>' : ''}
      </div>
    `).join('');

  list.querySelectorAll('.dropdown-model-item').forEach(item => {
    item.addEventListener('click', () => {
      state.activeModelId = item.dataset.id;
      updateModelSelector();
      renderModelDropdown();
      modelDropdown.classList.add('hidden');
      showToast(`Switched to ${getActiveModel()?.name}`, 'success');
    });
  });
}

// ===== Behavior Selector Dropdown =====
document.getElementById('behavior-selector-btn')?.addEventListener('click', () => {
  const behDd = document.getElementById('behavior-dropdown');
  if (behDd) {
    behDd.classList.toggle('hidden');
    if (!behDd.classList.contains('hidden')) renderBehaviorDropdown();
  }
});

function renderBehaviorDropdown() {
  const list = document.getElementById('behavior-dropdown-list');
  if (!list) return;
  list.innerHTML = state.behaviors.map(b => `
    <div class="dropdown-model-item ${b.id === state.activeBehaviorId ? 'active' : ''}" data-id="${b.id}">
      <div class="dropdown-model-info">
        <span class="dropdown-model-name">${b.name}</span>
        <span class="dropdown-model-meta">${b.desc}</span>
      </div>
      ${b.id === state.activeBehaviorId ? '<span class="dropdown-model-check">✓</span>' : ''}
    </div>
  `).join('') +
  `<div style="padding:8px;border-top:1px solid var(--border);margin-top:4px">
    <button class="btn btn-secondary btn-sm w-full" id="dd-manage-behaviors">Manage Behaviors →</button>
  </div>`;

  list.querySelectorAll('.dropdown-model-item').forEach(item => {
    item.addEventListener('click', () => {
      state.activeBehaviorId = item.dataset.id;
      updateBehaviorSelector();
      document.getElementById('behavior-dropdown').classList.add('hidden');
      showToast(`Behavior: ${getActiveBehavior()?.name}`, 'success');
    });
  });
  list.querySelector('#dd-manage-behaviors')?.addEventListener('click', () => {
    document.getElementById('behavior-dropdown').classList.add('hidden');
    navigateTo('behaviors');
  });
}

// ===== Search Button =====
document.getElementById('search-btn')?.addEventListener('click', () => showSearch(navigateTo));

// ===== Quick Settings =====
document.getElementById('quick-settings-btn').addEventListener('click', () => navigateTo('settings'));

// ===== Init =====
if (!state.onboardingDone) renderOnboarding();
navigateTo('chat');
updateModelSelector();
updateBehaviorSelector();
initCommandPalette(navigateTo);
