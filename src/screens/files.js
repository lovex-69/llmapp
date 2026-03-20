import { state } from '../state.js';
import { showToast } from '../components/toast.js';

const workspaces = [
  { id: 'w1', name: 'AI & ML Research', color: '#8b5cf6' },
  { id: 'w2', name: 'Project Notes', color: '#3b82f6' },
];

export function renderFiles() {
  const indexed = state.files.filter(f => f.status === 'indexed');
  const processing = state.files.filter(f => f.status === 'processing');

  return `<div class="files-screen">
    <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px">Knowledge</h2>
    <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:16px">Upload documents for AI-powered Q&A. All indexing happens locally.</p>

    <div class="upload-zone" id="upload-zone">
      <div class="upload-zone-icon" style="font-size:1.2rem;font-weight:700;opacity:0.3">+</div>
      <h3>Drop files here</h3>
      <p>PDF, TXT, DOC, MD — processed on-device</p>
      <input type="file" id="file-input" hidden accept=".pdf,.txt,.doc,.docx,.md" multiple />
    </div>

    ${workspaces.length > 0 ? `
      <div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:8px;margin-top:16px">WORKSPACES</div>
      <div style="display:flex;gap:8px;margin-bottom:16px;overflow-x:auto">
        ${workspaces.map(w => `
          <div class="card" style="min-width:140px;cursor:pointer;border-left:3px solid ${w.color}">
            <div style="font-size:0.75rem;font-weight:700;color:${w.color};margin-bottom:4px">${w.name[0]}</div>
            <div style="font-size:0.82rem;font-weight:600">${w.name}</div>
            <div style="font-size:0.68rem;color:var(--text-tertiary)">${state.files.filter(f=>f.workspace===w.id).length || 0} files</div>
          </div>`).join('')}
        <div class="card" style="min-width:100px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-tertiary);font-size:0.82rem">+ New</div>
      </div>
    ` : ''}

    ${processing.length > 0 ? `
      <div style="font-size:0.8rem;font-weight:600;color:var(--warning);margin-bottom:8px">PROCESSING</div>
      ${processing.map(f => renderFileItem(f)).join('')}
    ` : ''}

    ${indexed.length > 0 ? `
      <div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:8px;${processing.length?'margin-top:12px':''}">INDEXED FILES</div>
      ${indexed.map(f => renderFileItem(f)).join('')}
    ` : ''}

    ${state.files.length === 0 ? `
      <div class="empty-state" style="padding:32px">
        <h3>No files yet</h3>
        <p>Upload documents to ask questions about their content</p>
      </div>
    ` : `
      <div style="margin-top:16px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:0.82rem;font-weight:500">${state.files.length} files</div>
            <div style="font-size:0.72rem;color:var(--text-tertiary)">${indexed.length} indexed • ${processing.length} processing</div>
          </div>
          <span class="badge badge-fast">Local index</span>
        </div>
      </div>
    `}
  </div>`;
}

function renderFileItem(f) {
  const exts = { pdf:'PDF', txt:'TXT', doc:'DOC', md:'MD' };
  const colors = { pdf:'#ef4444', txt:'#3b82f6', doc:'#3b82f6', md:'#8b5cf6' };
  return `<div class="file-item" data-id="${f.id}">
    <div class="file-icon" style="background:${colors[f.type]||'#666'}22;color:${colors[f.type]||'#666'};font-size:0.65rem;font-weight:700">${exts[f.type]||f.type.toUpperCase()}</div>
    <div class="file-info">
      <div class="file-name">${f.name}</div>
      <div class="file-meta">${f.size} • ${f.date}</div>
    </div>
    <span class="file-status ${f.status}">${f.status === 'indexed' ? 'Indexed' : 'Processing...'}</span>
    <button class="btn btn-xs btn-danger file-delete" data-id="${f.id}">✕</button>
  </div>`;
}

export function initFiles(refreshFn) {
  const zone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');

  zone?.addEventListener('click', () => fileInput?.click());
  zone?.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone?.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone?.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files, refreshFn);
  });
  fileInput?.addEventListener('change', () => {
    handleFiles(fileInput.files, refreshFn);
  });

  document.querySelectorAll('.file-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      state.files = state.files.filter(f => f.id !== btn.dataset.id);
      refreshFn();
      showToast('File removed', 'info');
    });
  });
}

function handleFiles(files, refreshFn) {
  Array.from(files).forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    const newFile = {
      id: 'f-' + Date.now() + Math.random().toString(36).substr(2,4),
      name: file.name,
      type: ext,
      size: formatSize(file.size),
      status: 'processing',
      date: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' }),
    };
    state.files.push(newFile);
    showToast(`Indexing ${file.name}...`, 'info');
    // Simulate indexing
    setTimeout(() => {
      newFile.status = 'indexed';
      refreshFn();
      showToast(`${file.name} indexed`, 'success');
    }, 2000 + Math.random() * 2000);
  });
  refreshFn();
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}
