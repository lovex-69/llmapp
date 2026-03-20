import { state } from '../state.js';
import { showToast } from '../components/toast.js';

let activeFilter = 'all';
let downloadingIds = {};

export function renderStore() {
  const models = activeFilter === 'all'
    ? state.models.available
    : state.models.available.filter(m => m.category === activeFilter);

  const filters = [
    { key:'all', label:'All' },
    { key:'chat', label:'Chat' },
    { key:'coding', label:'Coding' },
    { key:'writing', label:'Writing' },
    { key:'study', label:'Study' },
  ];

  return `<div class="store-screen">
    <div class="store-header">
      <h2>Model Store</h2>
      <p>Download optimized AI models curated for your device</p>
    </div>
    <div class="store-filters">
      ${filters.map(f => `<button class="filter-chip ${activeFilter === f.key ? 'active' : ''}" data-filter="${f.key}">${f.label}</button>`).join('')}
    </div>
    <div class="model-grid">
      ${models.map(m => `
        <div class="model-card" data-model-id="${m.id}">
          <div class="model-card-icon" style="background:${m.color}22;color:${m.color};font-size:0.85rem;font-weight:700">${m.name[0]}</div>
          <div class="model-card-body">
            <div class="model-card-name">${m.name}</div>
            <div class="model-card-desc">${m.desc}</div>
            <div class="model-card-tags">
              <span class="badge badge-${m.perf}">${m.perf.charAt(0).toUpperCase()+m.perf.slice(1)}</span>
              <span class="badge badge-category">${m.ram} RAM</span>
              <span class="badge badge-category">${m.size}</span>
            </div>
            ${downloadingIds[m.id] !== undefined ? `<div class="progress-bar mt-sm"><div class="progress-fill" style="width:${downloadingIds[m.id]}%"></div></div>` : ''}
          </div>
          <div class="model-card-action">
            ${m.installed ? '<span style="color:var(--success);font-size:0.8rem;font-weight:600">Installed</span>' :
              downloadingIds[m.id] !== undefined ? `<span style="color:var(--accent);font-size:0.75rem">${downloadingIds[m.id]}%</span>` :
              `<button class="btn btn-primary btn-xs model-download-btn" data-model-id="${m.id}">Download</button>`}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="load-custom-section" id="load-custom-model">
      <div style="font-size:1rem;margin-bottom:8px;font-weight:700;opacity:0.3">+</div>
      <h3>Load Custom Model</h3>
      <p>Import your own GGUF model files from your device</p>
    </div>
    <input type="file" id="custom-model-input" accept=".gguf,.bin" style="display:none" />
  </div>`;
}

function simulateDownload(modelId, refreshFn) {
  downloadingIds[modelId] = 0;
  refreshFn();
  const interval = setInterval(() => {
    downloadingIds[modelId] += Math.floor(Math.random() * 8) + 3;
    if (downloadingIds[modelId] >= 100) {
      downloadingIds[modelId] = 100;
      clearInterval(interval);
      setTimeout(() => {
        const model = state.models.available.find(m => m.id === modelId);
        if (model) model.installed = true;
        delete downloadingIds[modelId];
        refreshFn();
        showToast(`${model.name} installed successfully!`, 'success');
      }, 500);
    }
    refreshFn();
  }, 300);
}

export function initStore(refreshFn) {
  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter;
      refreshFn();
    });
  });

  // Download buttons
  document.querySelectorAll('.model-download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      simulateDownload(btn.dataset.modelId, refreshFn);
    });
  });

  // Model card click -> detail modal
  document.querySelectorAll('.model-card').forEach(card => {
    card.addEventListener('click', () => {
      const model = state.models.available.find(m => m.id === card.dataset.modelId);
      if (model) showModelDetail(model, refreshFn);
    });
  });

  // Custom model loader
  const customBtn = document.getElementById('load-custom-model');
  const customInput = document.getElementById('custom-model-input');
  if (customBtn) {
    customBtn.addEventListener('click', () => customInput.click());
  }
  if (customInput) {
    customInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const customModel = {
          id: 'custom-' + Date.now(),
          name: file.name.replace(/\.(gguf|bin)$/i, ''),
          desc: 'User-loaded custom model',
          size: (file.size / (1024*1024*1024)).toFixed(1) + ' GB',
          ram: 'Unknown',
          perf: 'balanced',
          category: 'chat',
          icon: '',
          color: '#8b5cf6',
          installed: true,
          benchmarks: { speed: 50, quality: 50, reasoning: 50 },
          useCases: ['Custom usage'],
          custom: true,
        };
        state.models.available.push(customModel);
        state.models.custom.push(customModel);
        refreshFn();
        showToast(`Custom model "${customModel.name}" loaded!`, 'success');
      }
    });
  }
}

function showModelDetail(model, refreshFn) {
  let overlay = document.querySelector('.modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    document.getElementById('app').appendChild(overlay);
  }
  overlay.innerHTML = `<div class="modal">
    <div class="modal-handle"></div>
    <div class="model-detail-header">
      <div class="model-detail-icon" style="background:${model.color}22;color:${model.color};font-size:0.9rem;font-weight:700">${model.name[0]}</div>
      <div>
        <div class="model-detail-title">${model.name}</div>
        <div class="model-detail-subtitle">${model.desc}</div>
      </div>
    </div>
    <div class="model-specs">
      <div class="spec-card"><div class="spec-value">${model.size}</div><div class="spec-label">Download Size</div></div>
      <div class="spec-card"><div class="spec-value">${model.ram}</div><div class="spec-label">RAM Required</div></div>
      <div class="spec-card"><div class="spec-value badge-${model.perf}" style="text-transform:capitalize">${model.perf}</div><div class="spec-label">Performance</div></div>
      <div class="spec-card"><div class="spec-value" style="text-transform:capitalize">${model.category}</div><div class="spec-label">Category</div></div>
    </div>
    <div class="model-detail-section">
      <h4>Benchmarks</h4>
      <div class="benchmark-bar"><span class="benchmark-label">Speed</span><div class="benchmark-track"><div class="benchmark-fill" style="width:${model.benchmarks.speed}%"></div></div><span style="font-size:0.75rem;width:30px;text-align:right">${model.benchmarks.speed}</span></div>
      <div class="benchmark-bar"><span class="benchmark-label">Quality</span><div class="benchmark-track"><div class="benchmark-fill" style="width:${model.benchmarks.quality}%"></div></div><span style="font-size:0.75rem;width:30px;text-align:right">${model.benchmarks.quality}</span></div>
      <div class="benchmark-bar"><span class="benchmark-label">Reasoning</span><div class="benchmark-track"><div class="benchmark-fill" style="width:${model.benchmarks.reasoning}%"></div></div><span style="font-size:0.75rem;width:30px;text-align:right">${model.benchmarks.reasoning}</span></div>
    </div>
    <div class="model-detail-section">
      <h4>Use Cases</h4>
      <ul>${model.useCases.map(u => `<li>${u}</li>`).join('')}</ul>
    </div>
    <div style="margin-top:20px;display:flex;gap:8px">
      ${model.installed
        ? `<button class="btn btn-danger w-full modal-delete-btn">Delete Model</button>`
        : `<button class="btn btn-primary w-full modal-install-btn">Download & Install</button>`}
      <button class="btn btn-secondary modal-close-btn">Close</button>
    </div>
  </div>`;

  setTimeout(() => overlay.classList.add('visible'), 10);

  overlay.querySelector('.modal-close-btn').addEventListener('click', () => {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.remove(), 300);
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    }
  });

  const installBtn = overlay.querySelector('.modal-install-btn');
  if (installBtn) {
    installBtn.addEventListener('click', () => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
      simulateDownload(model.id, refreshFn);
    });
  }
  const deleteBtn = overlay.querySelector('.modal-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      model.installed = false;
      if (state.activeModelId === model.id) {
        const fallback = state.models.available.find(m => m.installed && m.id !== model.id);
        state.activeModelId = fallback ? fallback.id : '';
      }
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
      refreshFn();
      showToast(`${model.name} deleted`, 'info');
    });
  }
}
