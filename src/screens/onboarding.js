import { state } from '../state.js';

export function renderOnboarding() {
  const overlay = document.getElementById('onboarding-overlay');
  overlay.classList.remove('hidden');

  const slides = [
    {
      icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      title: 'Your AI. Your Data.',
      desc: 'NeuralBox runs powerful AI models directly on your device. No cloud, no tracking, no compromises. Everything stays local.'
    },
    {
      icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/></svg>',
      title: 'Smart & Customizable',
      desc: 'Define how AI responds — as a concise engineer, patient tutor, or creative writer. Use slash commands, quick actions, and keyboard shortcuts.'
    },
    {
      icon: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      title: 'Ready for Real Work',
      desc: 'Chat, code, study, analyze documents — all offline. Your personal AI system that works when you need it, with full transparency.'
    }
  ];

  let current = 0;

  function render() {
    overlay.innerHTML = `
      <div class="onboarding-slides">
        ${slides.map((s, i) => `
          <div class="onboarding-slide ${i === current ? 'active' : i < current ? 'exit' : ''}">
            <div class="onboarding-icon">${s.icon}</div>
            <div class="onboarding-title">${s.title}</div>
            <div class="onboarding-desc">${s.desc}</div>
          </div>`).join('')}
      </div>
      <div class="onboarding-footer">
        <div class="onboarding-dots">
          ${slides.map((_, i) => `<div class="onboarding-dot ${i === current ? 'active' : ''}"></div>`).join('')}
        </div>
        <div class="onboarding-actions">
          ${current < slides.length - 1
            ? `<button class="btn btn-secondary" id="ob-skip">Skip</button><button class="btn btn-primary" id="ob-next">Next</button>`
            : `<button class="btn btn-primary w-full" id="ob-done">Get Started</button>`}
        </div>
      </div>`;

    document.getElementById('ob-next')?.addEventListener('click', () => { current++; render(); });
    document.getElementById('ob-skip')?.addEventListener('click', finish);
    document.getElementById('ob-done')?.addEventListener('click', finish);
  }

  function finish() {
    state.onboardingDone = true;
    localStorage.setItem('nb-onboarding', 'done');
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.classList.add('hidden'); overlay.style.opacity = ''; }, 400);
  }

  render();
}
