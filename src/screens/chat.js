import { state, getActiveChat, getActiveBehavior, getActiveModel } from '../state.js';
import { showToast } from '../components/toast.js';

// Markdown parser
function parseMd(text) {
  let h = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\* (.+)/gm, '<li>$1</li>')
    .replace(/^- (.+)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)/gm, '<li>$1</li>');
  h = h.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  h = h.split('\n\n').map(p => {
    if (p.startsWith('<pre>') || p.startsWith('<ul>') || p.startsWith('<li>')) return p;
    return `<p>${p}</p>`;
  }).join('');
  h = h.replace(/\n/g, '<br>');
  return h;
}

// Slash commands
const slashCommands = [
  { cmd: '/summarize', label: 'Summarize', desc: 'Condense text or a topic', prompt: 'Please summarize the following:\n' },
  { cmd: '/explain', label: 'Explain', desc: 'Break down a concept clearly', prompt: 'Please explain this in detail:\n' },
  { cmd: '/code', label: 'Code', desc: 'Generate or fix code', prompt: 'Please write code for:\n' },
  { cmd: '/rewrite', label: 'Rewrite', desc: 'Improve existing text', prompt: 'Please rewrite this text with improvements:\n' },
  { cmd: '/translate', label: 'Translate', desc: 'Translate to another language', prompt: 'Please translate the following to English:\n' },
  { cmd: '/debug', label: 'Debug', desc: 'Find and fix issues in code', prompt: 'Please debug this code and explain the fix:\n' },
  { cmd: '/simplify', label: 'Simplify', desc: 'Make something easier to understand', prompt: 'Please simplify this explanation:\n' },
  { cmd: '/brainstorm', label: 'Brainstorm', desc: 'Generate ideas around a topic', prompt: 'Please brainstorm ideas for:\n' },
];

// Simulated responses
const aiResponses = {
  default: [
    "Good question. Let me break it down.\n\n* **First**, consider the core requirements\n* **Second**, evaluate the constraints\n* **Third**, implement iteratively\n\nWant me to go deeper on any of these?",
    "Here's what I'd focus on:\n\n**Key points:**\n\n1. Break complex problems into manageable pieces\n2. Test and verify each piece independently\n3. Integrate at well-defined boundaries\n\nThis pattern shows up everywhere in **software engineering** and **systems design**.",
  ],
  code: [
    "Here's one approach:\n\n```python\ndef solve(data):\n    result = []\n    for item in data:\n        if item.meets_criteria():\n            result.append(item.process())\n    return result\n```\n\n**O(n)** time complexity. Handles edge cases cleanly.\n\nShould I add error handling?",
    "```javascript\nconst process = (input) => {\n  return input\n    .filter(Boolean)\n    .map(transform)\n    .reduce(aggregate, initial);\n};\n```\n\n**Why this works:**\n* Functional pipeline keeps it readable\n* `filter(Boolean)` strips falsy values\n* Reducer accumulates final state",
  ],
  short: [
    "Short answer: **modular design**. Test each piece independently, then integrate. Keeps complexity manageable and debugging straightforward.",
    "Yes — but handle the edge case where inputs are empty. A guard clause at the top solves that cleanly.",
  ],
  detailed: [
    "Let me walk through this properly.\n\n## Overview\n\nThis involves several connected concepts worth understanding individually first.\n\n## Step 1: Foundation\n\nThe core idea is **separation of concerns**. One module, one responsibility.\n\n## Step 2: Implementation\n\nStart with the data layer:\n\n```python\nclass DataProcessor:\n    def __init__(self, config):\n        self.config = config\n        self.cache = {}\n    \n    def process(self, raw_data):\n        validated = self.validate(raw_data)\n        transformed = self.transform(validated)\n        return self.output(transformed)\n```\n\n## Step 3: Integration\n\nConnect modules through clean interfaces. Dependency injection keeps things testable.\n\n## Takeaway\n\nThis layered approach gives you:\n* **Maintainability** — update individual parts without breaking the rest\n* **Testability** — isolate and verify each piece\n* **Scalability** — add features without major refactoring",
  ],
};

function getAiResponse(style = 'default') {
  const pool = aiResponses[style] || aiResponses.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Render messages
function renderMessages(chat) {
  if (!chat || !chat.messages.length) {
    return `<div class="empty-state">
      <div class="empty-state-icon" style="font-size:2rem;opacity:0.3">N</div>
      <h3>New conversation</h3>
      <p>Ask anything. Everything runs locally on your device.</p>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;justify-content:center">
        <button class="quick-action-chip starter-prompt" data-prompt="What can you help me with?">What can you do?</button>
        <button class="quick-action-chip starter-prompt" data-prompt="Explain how on-device AI works">How does local AI work?</button>
        <button class="quick-action-chip starter-prompt" data-prompt="Help me write a Python script">Help me code</button>
      </div>
    </div>`;
  }
  return chat.messages.map((m, i) => {
    const model = getActiveModel();
    const tokCount = Math.floor(m.text.length / 4);
    const speed = (15 + Math.random() * 10).toFixed(1);
    return `
    <div class="msg msg-${m.role}" data-idx="${i}">
      <div class="msg-avatar">${m.role === 'ai' ? 'N' : 'Y'}</div>
      <div class="msg-content">
        <div class="msg-bubble">${parseMd(m.text)}</div>
        ${m.role === 'ai' ? `
          <div class="msg-actions">
            <!-- Actionable -->
            <button class="msg-action-btn copy-msg" data-idx="${i}" title="Copy">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy
            </button>
            <button class="msg-action-btn export-msg" data-idx="${i}" title="Export as Note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export
            </button>
            <button class="msg-action-btn share-msg" data-idx="${i}" title="Share">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share
            </button>

            <div class="action-divider"></div>

            <!-- Refine -->
            <button class="msg-action-btn refine-simplify" data-idx="${i}" title="Simplify">Simplify</button>
            <button class="msg-action-btn refine-expand" data-idx="${i}" title="Expand">Expand</button>
            <button class="msg-action-btn refine-bullets" data-idx="${i}" title="Convert to bullets">Bullets</button>

            <div class="action-divider"></div>
            <button class="msg-action-btn toggle-transparency" data-idx="${i}" title="Response info">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
          </div>
          <div class="transparency-panel hidden" data-panel-idx="${i}">
            <div class="tp-row"><span class="tp-label">Model</span><span class="tp-value">${model?.name || 'Unknown'}</span></div>
            <div class="tp-row"><span class="tp-label">Tokens</span><span class="tp-value">${tokCount}</span></div>
            <div class="tp-row"><span class="tp-label">Speed</span><span class="tp-value">${speed} tok/s</span></div>
            <div class="tp-row"><span class="tp-label">Memory</span><span class="tp-value">${state.memoryEnabled ? 'Active' : 'Off'}</span></div>
            <div class="tp-row"><span class="tp-label">Files</span><span class="tp-value">${state.files.filter(f=>f.status==='indexed').length} indexed</span></div>
            <div class="tp-row"><span class="tp-label">Processing</span><span class="tp-value tp-local">On-device</span></div>
          </div>
        ` : ''}
      </div>
    </div>`;
  }).join('');
}

// Context bar
function renderContextBar() {
  const linkedFiles = state.files.filter(f => f.status === 'indexed').slice(0, 2);
  const memCount = state.memoryEnabled ? state.memories.length : 0;
  if (!linkedFiles.length && !memCount) return '';
  return `<div class="context-bar">
    <span class="context-label">Context</span>
    ${state.memoryEnabled && memCount ? `<button class="context-chip context-active" data-ctx="memory">${memCount} memories</button>` : ''}
    ${linkedFiles.map(f => `<button class="context-chip context-active" data-ctx="file-${f.id}">${f.name.substring(0,18)}</button>`).join('')}
    <button class="context-chip context-add" id="add-context-btn">+</button>
  </div>`;
}

// Main render
export function renderChat() {
  const chat = getActiveChat();
  return `<div class="chat-screen">
    ${renderContextBar()}
    <div id="suggestion-bar" class="suggestion-bar hidden"></div>
    <div class="chat-messages" id="chat-messages">
      ${renderMessages(chat)}
    </div>
    <div class="quick-actions-row">
      <button class="quick-action-chip" data-action="Summarize this: ">Summarize</button>
      <button class="quick-action-chip" data-action="Fix the grammar: ">Fix grammar</button>
      <button class="quick-action-chip" data-action="Generate code for: ">Write code</button>
      <button class="quick-action-chip" data-action="Explain this topic: ">Explain</button>
      <button class="quick-action-chip" data-action="Translate to English: ">Translate</button>
      <button class="quick-action-chip" data-action="Debug this code: ">Debug</button>
    </div>
    <div class="chat-input-area">
      <div class="chat-input-wrapper">
        <textarea class="chat-input" id="chat-input" placeholder="Ask anything..." rows="1"></textarea>
        <div class="input-actions">
          <button class="input-action-btn" id="attach-btn" title="Attach file">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <button class="input-action-btn" id="mic-btn" title="Voice input">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <button class="send-btn" id="send-btn" title="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
      <div id="slash-menu" class="slash-menu hidden"></div>
    </div>
  </div>`;
}

// Streaming text
function streamText(element, text, callback) {
  let i = 0;
  const words = text.split(' ');
  let current = '';
  function addWord() {
    if (i < words.length) {
      current += (i > 0 ? ' ' : '') + words[i];
      element.innerHTML = parseMd(current);
      i++;
      setTimeout(addWord, 25 + Math.random() * 35);
    } else if (callback) callback();
  }
  addWord();
}

// Init
export function initChat() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const messagesEl = document.getElementById('chat-messages');
  const slashMenu = document.getElementById('slash-menu');
  let responseStyle = 'default';

  function sendMessage(overrideText) {
    const text = (overrideText || input.value).trim();
    if (!text) return;
    const chat = getActiveChat();
    chat.messages.push({ role: 'user', text });
    if (!overrideText) { input.value = ''; input.style.height = 'auto'; }
    slashMenu.classList.add('hidden');

    messagesEl.innerHTML = renderMessages(chat);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'msg msg-ai';
    typingDiv.innerHTML = `<div class="msg-avatar">N</div><div class="msg-content"><div class="msg-bubble"><div class="typing-indicator" style="align-items:center;gap:8px;font-size:0.8rem;color:var(--text-secondary);font-weight:500"><div style="display:flex;gap:4px"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div><span class="loading-text">Analyzing context...</span></div></div></div></div>`;
    messagesEl.appendChild(typingDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    let style = responseStyle;
    if (text.toLowerCase().startsWith('/code') || text.toLowerCase().includes('code') || text.toLowerCase().includes('function')) style = 'code';
    if (text.toLowerCase().startsWith('/explain')) style = 'detailed';
    if (text.toLowerCase().startsWith('/summarize') || text.toLowerCase().startsWith('/simplify')) style = 'short';

    setTimeout(() => {
      typingDiv.remove();
      const model = getActiveModel();
      let aiText = '';
      if (!model) {
        aiText = "It looks like you don't have an active AI model selected. Head over to the **Models** tab or the **Store** to download one, and we can get started!";
      } else {
        aiText = getAiResponse(style);
      }
      const aiMsg = document.createElement('div');
      aiMsg.className = 'msg msg-ai';
      const tokCount = Math.floor(aiText.length / 4);
      const speed = (15 + Math.random() * 10).toFixed(1);
      aiMsg.innerHTML = `<div class="msg-avatar">N</div><div class="msg-content"><div class="msg-bubble"></div>
        <div class="msg-actions">
          <button class="msg-action-btn copy-msg" title="Copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>
          <button class="msg-action-btn export-msg" title="Export as Note"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export</button>
          <button class="msg-action-btn share-msg" title="Share"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share</button>
          <div class="action-divider"></div>
          <button class="msg-action-btn refine-simplify" title="Simplify">Simplify</button>
          <button class="msg-action-btn refine-expand" title="Expand">Expand</button>
          <button class="msg-action-btn refine-bullets" title="Convert to bullets">Bullets</button>
          <div class="action-divider"></div>
          <button class="msg-action-btn toggle-transparency" title="Info"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></button>
        </div>
        <div class="transparency-panel hidden">
          <div class="tp-row"><span class="tp-label">Model</span><span class="tp-value">${model?.name||'Unknown'}</span></div>
          <div class="tp-row"><span class="tp-label">Tokens</span><span class="tp-value">${tokCount}</span></div>
          <div class="tp-row"><span class="tp-label">Speed</span><span class="tp-value">${speed} tok/s</span></div>
          <div class="tp-row"><span class="tp-label">Processing</span><span class="tp-value tp-local">On-device</span></div>
        </div>
      </div>`;
      messagesEl.appendChild(aiMsg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      streamText(aiMsg.querySelector('.msg-bubble'), aiText, () => {
        chat.messages.push({ role: 'ai', text: aiText });
        messagesEl.scrollTop = messagesEl.scrollHeight;
        bindMsgActions();
        showSuggestionBar();
      });
    }, 800 + Math.random() * 800);

    responseStyle = 'default';
  }

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    handleSlashMenu(input.value);
  });

  function handleSlashMenu(val) {
    if (val.startsWith('/')) {
      const q = val.toLowerCase();
      const matches = slashCommands.filter(c => c.cmd.startsWith(q));
      if (matches.length > 0 && val.length < 15) {
        slashMenu.classList.remove('hidden');
        slashMenu.innerHTML = matches.map(c => `
          <button class="slash-item" data-cmd="${c.cmd}" data-prompt="${c.prompt}">
            <div><div class="slash-cmd">${c.cmd}</div><div class="slash-desc">${c.desc}</div></div>
          </button>`).join('');
        slashMenu.querySelectorAll('.slash-item').forEach(item => {
          item.addEventListener('click', () => {
            input.value = item.dataset.prompt;
            input.focus();
            slashMenu.classList.add('hidden');
          });
        });
      } else {
        slashMenu.classList.add('hidden');
      }
    } else {
      slashMenu.classList.add('hidden');
    }
  }

  document.querySelectorAll('.quick-action-chip[data-action]').forEach(btn => {
    btn.addEventListener('click', () => { input.value = btn.dataset.action; input.focus(); });
  });

  document.querySelectorAll('.starter-prompt').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.prompt));
  });

  function bindMsgActions() {
    document.querySelectorAll('.copy-msg').forEach(btn => {
      btn.onclick = () => {
        const chat = getActiveChat();
        const idx = parseInt(btn.dataset.idx || btn.closest('.msg')?.dataset?.idx);
        const msg = chat.messages[idx];
        if (msg) {
          navigator.clipboard?.writeText(msg.text).then(() => showToast('Copied', 'success'));
        } else {
          const bubble = btn.closest('.msg-content')?.querySelector('.msg-bubble');
          if (bubble) navigator.clipboard?.writeText(bubble.textContent).then(() => showToast('Copied', 'success'));
        }
      };
    });
    document.querySelectorAll('.export-msg').forEach(btn => {
      btn.onclick = () => {
        const chat = getActiveChat();
        const idx = parseInt(btn.dataset.idx || btn.closest('.msg')?.dataset?.idx);
        const msg = chat.messages[idx];
        if (!msg) return;
        const blob = new Blob([msg.text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'NeuralBox_Response.md';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Exported as Note', 'success');
      };
    });
    document.querySelectorAll('.share-msg').forEach(btn => {
      btn.onclick = async () => {
        const chat = getActiveChat();
        const idx = parseInt(btn.dataset.idx || btn.closest('.msg')?.dataset?.idx);
        const msg = chat.messages[idx];
        if (!msg) return;
        try {
          if (navigator.share) {
            await navigator.share({ title: 'NeuralBox Response', text: msg.text });
          } else {
            await navigator.clipboard.writeText(msg.text);
            showToast('Copied to clipboard for sharing', 'success');
          }
        } catch(e) {}
      };
    });
    document.querySelectorAll('.refine-simplify').forEach(btn => {
      btn.onclick = () => { responseStyle = 'short'; sendMessage('Please simplify this response.'); };
    });
    document.querySelectorAll('.refine-expand').forEach(btn => {
      btn.onclick = () => { responseStyle = 'detailed'; sendMessage('Please expand on this in more detail.'); };
    });
    document.querySelectorAll('.refine-bullets').forEach(btn => {
      btn.onclick = () => { responseStyle = 'default'; sendMessage('Please convert that into bullet points.'); };
    });
    document.querySelectorAll('.toggle-transparency').forEach(btn => {
      btn.onclick = () => {
        const panel = btn.closest('.msg-content')?.querySelector('.transparency-panel');
        if (panel) panel.classList.toggle('hidden');
      };
    });
  }
  bindMsgActions();

  function showSuggestionBar() {
    const bar = document.getElementById('suggestion-bar');
    if (!bar) return;
    const suggestions = ['Continue', 'Summarize this conversation', 'Ask a follow-up'];
    bar.classList.remove('hidden');
    bar.innerHTML = suggestions.map(s =>
      `<button class="suggestion-chip" data-prompt="${s}">${s}</button>`
    ).join('');
    bar.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        sendMessage(chip.dataset.prompt);
        bar.classList.add('hidden');
      });
    });
    setTimeout(() => bar.classList.add('hidden'), 8000);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && state.currentScreen === 'chat') {
      navigator.clipboard?.readText?.().then(text => {
        if (text && text.length > 20 && text.length < 2000) {
          const bar = document.getElementById('suggestion-bar');
          if (bar) {
            bar.classList.remove('hidden');
            bar.innerHTML = `
              <button class="suggestion-chip" data-prompt="Summarize this: ${text.substring(0,200)}">Summarize clipboard</button>
              <button class="suggestion-chip" data-prompt="Explain this: ${text.substring(0,200)}">Explain clipboard</button>
              <button class="suggestion-chip dismiss-suggestion">Dismiss</button>`;
            bar.querySelectorAll('.suggestion-chip[data-prompt]').forEach(chip => {
              chip.addEventListener('click', () => { sendMessage(chip.dataset.prompt); bar.classList.add('hidden'); });
            });
            bar.querySelector('.dismiss-suggestion')?.addEventListener('click', () => bar.classList.add('hidden'));
          }
        }
      }).catch(() => {});
    }
  });

  messagesEl.scrollTop = messagesEl.scrollHeight;
}
