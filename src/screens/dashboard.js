import { state, getActiveModel } from '../state.js';

export function renderDashboard() {
  const m = state.perfMetrics;
  const model = getActiveModel();
  const ramPct = ((m.ramUsed / m.ramTotal) * 100).toFixed(0);

  return `<div class="settings-screen">
    <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:4px">Performance</h2>
    <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:16px">Real-time system metrics — transparent and local</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div class="card" style="text-align:center">
        <div class="perf-ring-container" style="position:relative;width:72px;height:72px;margin:0 auto 8px">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" stroke="var(--border)" stroke-width="6" fill="none"/>
            <circle cx="36" cy="36" r="30" stroke="var(--accent)" stroke-width="6" fill="none"
              stroke-dasharray="${(2*Math.PI*30)}" stroke-dashoffset="${(2*Math.PI*30)*(1-ramPct/100)}"
              stroke-linecap="round" transform="rotate(-90 36 36)" style="transition:stroke-dashoffset 0.5s"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700">${ramPct}%</div>
        </div>
        <div style="font-size:0.75rem;font-weight:600">RAM Usage</div>
        <div style="font-size:0.68rem;color:var(--text-tertiary)">${m.ramUsed} / ${m.ramTotal} GB</div>
      </div>
      <div class="card" style="text-align:center">
        <div class="perf-ring-container" style="position:relative;width:72px;height:72px;margin:0 auto 8px">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" stroke="var(--border)" stroke-width="6" fill="none"/>
            <circle cx="36" cy="36" r="30" stroke="${m.cpuPercent > 70 ? 'var(--warning)' : 'var(--success)'}" stroke-width="6" fill="none"
              stroke-dasharray="${(2*Math.PI*30)}" stroke-dashoffset="${(2*Math.PI*30)*(1-m.cpuPercent/100)}"
              stroke-linecap="round" transform="rotate(-90 36 36)" style="transition:stroke-dashoffset 0.5s"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700">${m.cpuPercent}%</div>
        </div>
        <div style="font-size:0.75rem;font-weight:600">CPU Usage</div>
        <div style="font-size:0.68rem;color:var(--text-tertiary)">Model processing</div>
      </div>
    </div>

    <div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:8px">MODEL STATUS</div>
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="width:40px;height:40px;border-radius:10px;background:${model?.color || '#8b5cf6'}22;color:${model?.color || '#8b5cf6'};display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700">${(model?.name || 'N')[0]}</div>
        <div>
          <div style="font-size:0.9rem;font-weight:600">${model?.name || 'No model'}</div>
          <div style="font-size:0.72rem;color:var(--text-tertiary)">${model?.size || '-'} • ${model?.ram || '-'} RAM</div>
        </div>
        <span class="badge badge-fast" style="margin-left:auto">Loaded</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <div style="text-align:center;padding:8px;background:var(--bg-glass);border-radius:var(--radius-sm)">
          <div style="font-size:1rem;font-weight:700;color:var(--accent)">${m.tokensPerSec}</div>
          <div style="font-size:0.65rem;color:var(--text-tertiary)">tok/s</div>
        </div>
        <div style="text-align:center;padding:8px;background:var(--bg-glass);border-radius:var(--radius-sm)">
          <div style="font-size:1rem;font-weight:700">${m.totalInferences}</div>
          <div style="font-size:0.65rem;color:var(--text-tertiary)">Inferences</div>
        </div>
        <div style="text-align:center;padding:8px;background:var(--bg-glass);border-radius:var(--radius-sm)">
          <div style="font-size:1rem;font-weight:700">${m.uptime}</div>
          <div style="font-size:0.65rem;color:var(--text-tertiary)">Uptime</div>
        </div>
      </div>
    </div>

    <div style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:8px">SYSTEM INFO</div>
    <div class="card">
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between;font-size:0.82rem"><span style="color:var(--text-secondary)">Runtime</span><span>MLC LLM / llama.cpp</span></div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem"><span style="color:var(--text-secondary)">Quantization</span><span>Q4_K_M</span></div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem"><span style="color:var(--text-secondary)">Context Length</span><span>4096 tokens</span></div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem"><span style="color:var(--text-secondary)">Backend</span><span>CPU + NEON</span></div>
        <div style="display:flex;justify-content:space-between;font-size:0.82rem"><span style="color:var(--text-secondary)">Privacy</span><span style="color:var(--success);font-weight:600">On-device</span></div>
      </div>
    </div>
  </div>`;
}
