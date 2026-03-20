import { state } from '../state.js';
import { showToast } from '../components/toast.js';

export function renderSettings() {
  return `<div class="settings-screen">
    <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">Settings</h2>

    <div class="settings-section">
      <div class="settings-section-title">Appearance</div>
      <div class="setting-row">
        <div><div class="setting-label">Dark Mode</div><div class="setting-desc">Toggle between dark and light theme</div></div>
        <label class="toggle"><input type="checkbox" id="theme-toggle" ${state.theme === 'dark' ? 'checked' : ''} /><span class="toggle-slider"></span></label>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Privacy & Security</div>
      <div class="setting-row">
        <div><div class="setting-label">Privacy Mode</div><div class="setting-desc">Strict local processing, no external calls</div></div>
        <label class="toggle"><input type="checkbox" id="privacy-toggle" ${state.privacyMode ? 'checked' : ''} /><span class="toggle-slider"></span></label>
      </div>
      <div class="setting-row">
        <div><div class="setting-label">AI Memory</div><div class="setting-desc">Allow AI to remember your preferences</div></div>
        <label class="toggle"><input type="checkbox" id="memory-toggle" ${state.memoryEnabled ? 'checked' : ''} /><span class="toggle-slider"></span></label>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Performance</div>
      <div class="card" style="margin-bottom:8px">
        <div class="perf-slider-label"><span>RAM Usage Limit</span><span id="s-ram-val">${state.perfRAM}%</span></div>
        <input type="range" id="s-perf-ram" min="20" max="100" value="${state.perfRAM}" />
      </div>
      <div class="card">
        <div class="perf-slider-label"><span>CPU Usage Limit</span><span id="s-cpu-val">${state.perfCPU}%</span></div>
        <input type="range" id="s-perf-cpu" min="20" max="100" value="${state.perfCPU}" />
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Data</div>
      <button class="btn btn-danger w-full" id="clear-all-btn">Clear All Data</button>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">About</div>
      <div class="card">
        <div style="font-size:0.88rem;font-weight:600;margin-bottom:4px">NeuralBox v1.0.0</div>
        <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.6">Your private, offline AI operating system. All processing happens on-device — no data ever leaves your phone.</div>
      </div>
    </div>
  </div>`;
}

export function initSettings(refreshFn) {
  document.getElementById('theme-toggle')?.addEventListener('change', (e) => {
    state.theme = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('nb-theme', state.theme);
    showToast(`Switched to ${state.theme} mode`, 'info');
  });
  document.getElementById('privacy-toggle')?.addEventListener('change', (e) => {
    state.privacyMode = e.target.checked;
    showToast(state.privacyMode ? 'Privacy mode enabled' : 'Privacy mode disabled', 'info');
  });
  document.getElementById('memory-toggle')?.addEventListener('change', (e) => {
    state.memoryEnabled = e.target.checked;
    showToast(state.memoryEnabled ? 'Memory enabled' : 'Memory disabled', 'info');
  });
  document.getElementById('s-perf-ram')?.addEventListener('input', (e) => {
    state.perfRAM = parseInt(e.target.value);
    document.getElementById('s-ram-val').textContent = state.perfRAM + '%';
  });
  document.getElementById('s-perf-cpu')?.addEventListener('input', (e) => {
    state.perfCPU = parseInt(e.target.value);
    document.getElementById('s-cpu-val').textContent = state.perfCPU + '%';
  });
  document.getElementById('clear-all-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      showToast('All data cleared', 'success');
      setTimeout(() => location.reload(), 1000);
    }
  });
}
