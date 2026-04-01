/**
 * Kai — Katwal Digital AI Chat Widget
 * Add to katwaldigital.com just before </body>:
 *
 *   <script src="/kai-widget.js"></script>
 *
 * Then set your Worker URL below.
 */

(function () {
  // ─── CONFIG ───────────────────────────────────────────────────────────────
  const WORKER_URL = 'https://YOUR_WORKER.YOUR_SUBDOMAIN.workers.dev';
  const BRAND     = '#1A7A70';
  const BRAND_D   = '#145f57';
  // ──────────────────────────────────────────────────────────────────────────

  const messages = []; // conversation history sent to API

  // ── Styles ────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #kai-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9998;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${BRAND}; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(26,122,112,0.35);
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s, transform 0.2s;
    }
    #kai-btn:hover { background: ${BRAND_D}; transform: scale(1.06); }
    #kai-btn svg { width: 26px; height: 26px; fill: #fff; }

    #kai-panel {
      position: fixed; bottom: 90px; right: 24px; z-index: 9999;
      width: 340px; max-height: 520px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.14);
      display: flex; flex-direction: column;
      overflow: hidden; font-family: 'Instrument Sans', system-ui, sans-serif;
      transform: scale(0.92) translateY(12px); opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #kai-panel.open {
      opacity: 1; transform: scale(1) translateY(0); pointer-events: all;
    }

    #kai-header {
      background: ${BRAND}; color: #fff;
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    #kai-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 600; color: #fff; flex-shrink: 0;
    }
    #kai-header-text { flex: 1; }
    #kai-name { font-size: 14px; font-weight: 600; margin: 0; }
    #kai-status { font-size: 11px; opacity: 0.8; margin: 0; display: flex; align-items: center; gap: 4px; }
    #kai-status::before {
      content: ''; display: inline-block;
      width: 7px; height: 7px; border-radius: 50%; background: #7fe8c8;
    }
    #kai-close {
      background: none; border: none; color: #fff; cursor: pointer;
      font-size: 20px; line-height: 1; padding: 4px; opacity: 0.8;
    }
    #kai-close:hover { opacity: 1; }

    #kai-messages {
      flex: 1; overflow-y: auto; padding: 16px 14px;
      display: flex; flex-direction: column; gap: 10px;
      scroll-behavior: smooth;
    }
    #kai-messages::-webkit-scrollbar { width: 4px; }
    #kai-messages::-webkit-scrollbar-thumb { background: #d0e8e5; border-radius: 4px; }

    .kai-msg {
      max-width: 82%; font-size: 13.5px; line-height: 1.5;
      padding: 9px 13px; border-radius: 14px; word-wrap: break-word;
    }
    .kai-msg.bot {
      background: #f0f7f6; color: #1a2e2c; border-bottom-left-radius: 4px; align-self: flex-start;
    }
    .kai-msg.user {
      background: ${BRAND}; color: #fff; border-bottom-right-radius: 4px; align-self: flex-end;
    }

    .kai-typing {
      display: flex; gap: 4px; align-items: center;
      padding: 10px 14px; align-self: flex-start;
    }
    .kai-typing span {
      width: 7px; height: 7px; border-radius: 50%; background: #aac9c6;
      animation: kai-bounce 1.2s infinite;
    }
    .kai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .kai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes kai-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    #kai-input-row {
      display: flex; gap: 8px; padding: 12px 14px;
      border-top: 1px solid #edf2f1;
    }
    #kai-input {
      flex: 1; border: 1px solid #d4e6e4; border-radius: 10px;
      padding: 8px 12px; font-size: 13px; font-family: inherit;
      outline: none; resize: none; max-height: 80px; overflow-y: auto;
      color: #1a2e2c;
      transition: border-color 0.15s;
    }
    #kai-input:focus { border-color: ${BRAND}; }
    #kai-input::placeholder { color: #9ab8b5; }
    #kai-send {
      width: 36px; height: 36px; border-radius: 10px; border: none;
      background: ${BRAND}; color: #fff; cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      align-self: flex-end;
      transition: background 0.15s;
    }
    #kai-send:hover { background: ${BRAND_D}; }
    #kai-send svg { width: 16px; height: 16px; fill: #fff; }

    #kai-footer {
      text-align: center; font-size: 10px; color: #9ab8b5;
      padding: 0 0 10px; letter-spacing: 0.02em;
    }
    .kai-notice {
      font-size: 10px; color: #9ab8b5; text-align: center;
      padding: 4px 12px; line-height: 1.4; align-self: center;
    }

    @media (max-width: 600px) {
      #kai-panel {
        width: 100vw; right: 0; left: 0; bottom: 0;
        border-radius: 16px 16px 0 0;
        max-height: 70vh;
      }
      #kai-btn { right: 16px; bottom: 16px; }
    }
  `;
  document.head.appendChild(style);

  // ── HTML ──────────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <button id="kai-btn" aria-label="Chat with Kai">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    </button>

    <div id="kai-panel" role="dialog" aria-label="Chat with Kai">
      <div id="kai-header">
        <div id="kai-avatar">K</div>
        <div id="kai-header-text">
          <p id="kai-name">Kai</p>
          <p id="kai-status">Online — Katwal Digital</p>
        </div>
        <button id="kai-close" aria-label="Close chat">×</button>
      </div>

      <div id="kai-messages" aria-live="polite"></div>

      <div id="kai-input-row">
        <textarea id="kai-input" placeholder="Ask me anything…" rows="1" aria-label="Your message"></textarea>
        <button id="kai-send" aria-label="Send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="kai-footer">Powered by Katwal Digital</div>
    </div>
  `);

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const btn      = document.getElementById('kai-btn');
  const panel    = document.getElementById('kai-panel');
  const closeBtn = document.getElementById('kai-close');
  const msgBox   = document.getElementById('kai-messages');
  const input    = document.getElementById('kai-input');
  const sendBtn  = document.getElementById('kai-send');

  // ── Open / close ──────────────────────────────────────────────────────────
  let opened = false;

  function openPanel() {
    panel.classList.add('open');
    input.focus();
    // On mobile, scroll input into view when keyboard opens
    setTimeout(() => input.scrollIntoView({ block: 'nearest' }), 300);
    if (!opened) {
      opened = true;
      addNotice("🔒 Chats may be reviewed to help us improve. We never share your data.");
      addBotMsg("Hi! I'm Kai 👋 I can tell you about Katwal Digital's services and pricing — or help you get started. What brings you here today?");
    }
  }

  function closePanel() { panel.classList.remove('open'); }

  btn.addEventListener('click', () => panel.classList.contains('open') ? closePanel() : openPanel());
  closeBtn.addEventListener('click', closePanel);

  // ── Messaging ─────────────────────────────────────────────────────────────
  function addNotice(text) {
    const el = document.createElement('div');
    el.className = 'kai-notice';
    el.textContent = text;
    msgBox.appendChild(el);
    scrollBottom();
  }

  function addBotMsg(text) {
    const el = document.createElement('div');
    el.className = 'kai-msg bot';
    el.textContent = text;
    msgBox.appendChild(el);
    scrollBottom();
  }

  function addUserMsg(text) {
    const el = document.createElement('div');
    el.className = 'kai-msg user';
    el.textContent = text;
    msgBox.appendChild(el);
    scrollBottom();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'kai-typing';
    el.id = 'kai-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgBox.appendChild(el);
    scrollBottom();
    return el;
  }

  function removeTyping() {
    document.getElementById('kai-typing')?.remove();
  }

  function scrollBottom() {
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    addUserMsg(text);
    messages.push({ role: 'user', content: text });

    showTyping();

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      const data = await res.json();
      removeTyping();

      const reply = data.reply || "Sorry, I couldn't get a response. Please try again.";
      messages.push({ role: 'assistant', content: reply });
      addBotMsg(reply);

    } catch {
      removeTyping();
      addBotMsg("Oops — something went wrong on my end. Please try again in a moment.");
    }

    sendBtn.disabled = false;
    input.focus();
  }

  // ── Input handling ────────────────────────────────────────────────────────
  sendBtn.addEventListener('click', send);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  // Auto-grow textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  });

})();
