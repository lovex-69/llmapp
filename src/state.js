// NeuralBox — State & Data
export const state = {
  currentScreen: 'chat',
  theme: localStorage.getItem('nb-theme') || 'light',
  onboardingDone: localStorage.getItem('nb-onboarding') === 'done',
  activeModelId: 'mistral-7b-lite',
  sidebarOpen: false,
  activeChatId: 'chat-1',
  activeBehaviorId: 'default',
  vaultPin: localStorage.getItem('nb-vault-pin') || '',
  vaultUnlocked: false,
  chats: [
    { id:'chat-1', title:'Getting Started', pinned:true, time:'Just now', locked:false, behaviorId:'default', tag:'personal', messages:[
      { role:'ai', text:"Hi — I'm **NeuralBox**, running entirely on your device.\n\nNothing leaves this phone. No cloud, no tracking.\n\nAsk me anything, or try the quick actions below." }
    ]},
    { id:'chat-2', title:'Python Help', pinned:false, time:'2h ago', locked:false, behaviorId:'engineer', tag:'work', messages:[
      { role:'user', text:'How do I read a CSV file in Python?' },
      { role:'ai', text:"Two common ways:\n\n```python\nimport csv\n\nwith open('data.csv', 'r') as file:\n    reader = csv.reader(file)\n    for row in reader:\n        print(row)\n```\n\nOr with **pandas** if you want more control:\n\n```python\nimport pandas as pd\ndf = pd.read_csv('data.csv')\nprint(df.head())\n```" }
    ]},
    { id:'chat-3', title:'Essay Draft', pinned:false, time:'Yesterday', locked:false, behaviorId:'default', tag:'study', messages:[] },
    { id:'chat-4', title:'Confidential Notes', pinned:false, time:'Mar 18', locked:true, behaviorId:'default', tag:'personal', messages:[
      { role:'user', text:'Private project details...' },
      { role:'ai', text:'These notes are secured in your vault. Only accessible with your PIN.' }
    ]},
  ],
  behaviors: [
    { id:'default', name:'Default', icon:'', desc:'Helpful, balanced responses', prompt:'You are a helpful AI assistant. Respond clearly and helpfully.', tone:'balanced', length:'medium' },
    { id:'engineer', name:'Engineer', icon:'', desc:'Concise, technical, code-focused', prompt:'Respond concisely like a senior software engineer. Prefer code examples over long explanations.', tone:'professional', length:'concise' },
    { id:'tutor', name:'Tutor', icon:'', desc:'Step-by-step explanations', prompt:'Explain concepts in detailed, step-by-step format. Use analogies. Check understanding.', tone:'friendly', length:'detailed' },
    { id:'writer', name:'Writer', icon:'', desc:'Eloquent, expressive prose', prompt:'Write with creativity, vivid language, and strong narrative voice.', tone:'creative', length:'detailed' },
    { id:'analyst', name:'Analyst', icon:'', desc:'Structured, data-focused analysis', prompt:'Provide structured analysis. Use bullet points, tables when helpful. Be precise with numbers.', tone:'professional', length:'medium' },
  ],
  models: {
    available: [
      { id:'mistral-7b-lite', name:'Mistral 7B Lite', desc:'Fast general-purpose chat model', size:'3.8 GB', ram:'4 GB', perf:'fast', category:'chat', color:'#8b5cf6', installed:true, benchmarks:{speed:92,quality:75,reasoning:70}, useCases:['General chat','Quick Q&A','Summarization'] },
      { id:'phi-3-mini', name:'Phi-3 Mini', desc:'Compact and efficient reasoning model', size:'2.3 GB', ram:'3 GB', perf:'fast', category:'chat', color:'#3b82f6', installed:true, benchmarks:{speed:95,quality:70,reasoning:72}, useCases:['Reasoning','Math','Logic puzzles'] },
      { id:'codellama-7b', name:'CodeLlama 7B', desc:'Specialized for code generation and review', size:'4.2 GB', ram:'5 GB', perf:'balanced', category:'coding', color:'#10b981', installed:false, benchmarks:{speed:78,quality:85,reasoning:80}, useCases:['Code generation','Bug fixing','Code review'] },
      { id:'llama3-8b', name:'Llama 3 8B', desc:'High-quality open-source all-rounder', size:'5.1 GB', ram:'6 GB', perf:'powerful', category:'chat', color:'#f59e0b', installed:false, benchmarks:{speed:65,quality:90,reasoning:88}, useCases:['Complex reasoning','Creative writing','Analysis'] },
      { id:'gemma-2b', name:'Gemma 2B', desc:'Ultra-light model for basic tasks', size:'1.4 GB', ram:'2 GB', perf:'fast', category:'chat', color:'#ec4899', installed:false, benchmarks:{speed:98,quality:55,reasoning:50}, useCases:['Simple chat','Quick answers','Low-end devices'] },
      { id:'deepseek-coder', name:'DeepSeek Coder 6.7B', desc:'Advanced coding assistant', size:'4.5 GB', ram:'5 GB', perf:'balanced', category:'coding', color:'#ef4444', installed:false, benchmarks:{speed:72,quality:88,reasoning:85}, useCases:['Full-stack dev','Debugging','Architecture'] },
      { id:'tinyllama-1b', name:'TinyLlama 1.1B', desc:'Tiny but capable study companion', size:'0.8 GB', ram:'1.5 GB', perf:'fast', category:'study', color:'#06b6d4', installed:false, benchmarks:{speed:99,quality:45,reasoning:40}, useCases:['Flashcards','Simple Q&A','Definitions'] },
      { id:'neural-writer', name:'Neural Writer 7B', desc:'Creative writing and content specialist', size:'4.0 GB', ram:'5 GB', perf:'balanced', category:'writing', color:'#a855f7', installed:false, benchmarks:{speed:75,quality:92,reasoning:70}, useCases:['Essays','Stories','Blog posts','Emails'] },
    ],
    custom: []
  },
  files: [
    { id:'f1', name:'Machine Learning Notes.pdf', type:'pdf', size:'2.4 MB', status:'indexed', date:'Mar 20' },
    { id:'f2', name:'Project Requirements.txt', type:'txt', size:'12 KB', status:'indexed', date:'Mar 19' },
    { id:'f3', name:'Research Paper.pdf', type:'pdf', size:'5.1 MB', status:'processing', date:'Mar 18' },
  ],
  memories: [
    { id:'m1', text:'My name is Alex', category:'personal', temp:false },
    { id:'m2', text:'I am a software developer', category:'work', temp:false },
    { id:'m3', text:'I prefer Python and JavaScript', category:'preferences', temp:false },
    { id:'m4', text:'I\'m studying machine learning', category:'work', temp:false },
    { id:'m5', text:'Currently working on NeuralBox project', category:'work', temp:true },
  ],
  memoryEnabled: true,
  perfRAM: 60,
  perfCPU: 50,
  privacyMode: true,
  perfMetrics: {
    ramUsed: 2.4,
    ramTotal: 8,
    cpuPercent: 35,
    modelLoaded: 'Mistral 7B Lite',
    tokensPerSec: 18.5,
    totalInferences: 147,
    uptime: '2h 34m',
  },
};

export function getActiveModel() {
  return state.models.available.find(m => m.id === state.activeModelId);
}
export function getActiveChat() {
  return state.chats.find(c => c.id === state.activeChatId);
}
export function getInstalledModels() {
  return state.models.available.filter(m => m.installed);
}
export function getActiveBehavior() {
  return state.behaviors.find(b => b.id === state.activeBehaviorId);
}
