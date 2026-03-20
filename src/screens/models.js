import { state, getInstalledModels, getActiveModel } from '../state.js';
import { showToast } from '../components/toast.js';

export function renderModels() {
  const installed = getInstalledModels();
  const active = getActiveModel();
  const totalSizeGB = installed.reduce((sum, m) => sum + parseFloat(m.size), 0).toFixed(1);

  return `<div class="manager-screen">
    <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:16px">Model Manager</h2>
    <div class="storage-overview">
      <div class="storage-title">Storage Usage</div>
      <div class="storage-stats">
        <div><div class="storage-stat-value">${totalSizeGB} GB</div><div class="storage-stat-label">Used by models</div></div>
        <div style="text-align:right"><div class="storage-stat-value">${installed.length}</div><div class="storage-stat-label">Models installed</div></div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${Math.min((totalSizeGB / 32) * 100, 100)}%"></div></div>
      <div style="display:flex;justify-content:space-between;margin-top:4px">
        <span style="font-size:0.7rem;color:var(--text-tertiary)">${totalSizeGB} GB used</span>
        <span style="font-size:0.7rem;color:var(--text-tertiary)">32 GB total</span>
      </div>
    </div>

    ${installed.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3>No models installed</h3>
        <p>Visit the Model Store to download your first model</p>
      </div>` : `
      <div style="font-size:0.85rem;font-weight:600;margin-bottom:10px;color:var(--text-secondary)">Installed Models</div>
      ${installed.map(m => `
        <div class="installed-model-card ${state.activeModelId === m.id ? 'active-model' : ''}" data-model-id="${m.id}">
          <div class="model-card-icon" style="background:${m.color}22;color:${m.color};width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;flex-shrink:0">${m.name[0]}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:0.88rem;font-weight:600">${m.name}</div>
            <div style="font-size:0.72rem;color:var(--text-tertiary)">${m.size} • ${m.ram} RAM${m.custom ? ' • Custom' : ''}</div>
          </div>
          <div style="display:flex;gap:4px;align-items:center">
            ${state.activeModelId === m.id
              ? '<span class="badge badge-fast">Active</span>'
              : `<button class="btn btn-secondary btn-xs switch-model-btn" data-id="${m.id}">Activate</button>`}
            <button class="btn btn-danger btn-xs delete-model-btn" data-id="${m.id}" title="Delete">✕</button>
          </div>
        </div>
      `).join('')}
    `}

    <div class="perf-slider-group" style="margin-top:24px">
      <div style="font-size:0.85rem;font-weight:600;margin-bottom:12px;color:var(--text-secondary)">Performance Controls</div>
      <div class="card" style="margin-bottom:8px">
        <div class="perf-slider-label"><span>RAM Limit</span><span id="ram-val">${state.perfRAM}%</span></div>
        <input type="range" id="perf-ram" min="20" max="100" value="${state.perfRAM}" />
      </div>
      <div class="card">
        <div class="perf-slider-label"><span>CPU Limit</span><span id="cpu-val">${state.perfCPU}%</span></div>
        <input type="range" id="perf-cpu" min="20" max="100" value="${state.perfCPU}" />
      </div>
    </div>
  </div>`;
}

export function initModels(refreshFn) {
  document.querySelectorAll('.switch-model-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeModelId = btn.dataset.id;
      document.getElementById('active-model-name').textContent = getActiveModel()?.name || 'No model';
      refreshFn();
      showToast(`Switched to ${getActiveModel()?.name}`, 'success');
    });
  });

  document.querySelectorAll('.delete-model-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const model = state.models.available.find(m => m.id === btn.dataset.id);
      if (model) {
        model.installed = false;
        if (state.activeModelId === model.id) {
          const fallback = getInstalledModels()[0];
          state.activeModelId = fallback ? fallback.id : '';
          document.getElementById('active-model-name').textContent = fallback?.name || 'No model';
        }
        refreshFn();
        showToast(`${model.name} deleted`, 'info');
      }
    });
  });

  const ramSlider = document.getElementById('perf-ram');
  const cpuSlider = document.getElementById('perf-cpu');
  if (ramSlider) {
    ramSlider.addEventListener('input', () => {
      state.perfRAM = parseInt(ramSlider.value);
      document.getElementById('ram-val').textContent = state.perfRAM + '%';
    });
  }
  if (cpuSlider) {
    cpuSlider.addEventListener('input', () => {
      state.perfCPU = parseInt(cpuSlider.value);
      document.getElementById('cpu-val').textContent = state.perfCPU + '%';
    });
  }
}
