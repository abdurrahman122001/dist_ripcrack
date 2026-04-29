(function() {
  'use strict';

  const config = window.ChatbotConfig || {};
  const apiUrl = 'https://api.chatmesaj.cc'; // Always use chatmesaj API
  const apiKey = config.apiKey || 'default';
  
  console.log('[Chat Widget] Config:', { apiUrl, apiKey });
  
  // Chatmesaj API uses visitorToken, not deviceId
  let visitorToken = localStorage.getItem('chat_visitor_token');
  let conversationId = localStorage.getItem('chat_conversation_id');
  let siteConfig = null;

  // Styles
  const styles = `
    .chat-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .chat-widget-button {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #059669;
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      position: relative;
    }
    .chat-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
    }
    .chat-widget-button svg {
      width: 32px;
      height: 32px;
    }
    .chat-widget-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    .chat-widget-window.active {
      display: flex;
    }
    .chat-widget-header {
      background: #059669;
      color: white;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 12px 12px 0 0;
    }
    .chat-widget-header-title {
      font-weight: 600;
      font-size: 18px;
    }
    .chat-widget-header-subtitle {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
    }
    .chat-widget-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .chat-widget-close:hover {
      opacity: 1;
    }
    .chat-widget-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: white;
      display: flex;
      flex-direction: column;
    }
    .chat-widget-message {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
      margin-bottom: 8px;
    }
    .chat-widget-message.user {
      background: #059669;
      color: white;
      margin-left: auto;
      border-bottom-right-radius: 4px;
      border-top-left-radius: 4px;
    }
    .chat-widget-message.bot {
      background: #f3f4f6;
      color: #1f2937;
      margin-right: auto;
      border-bottom-left-radius: 4px;
      border-top-right-radius: 4px;
    }
    .chat-widget-message.bot a {
      color: #059669;
      text-decoration: underline;
    }
    .chat-widget-input-area {
      padding: 12px 16px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .chat-widget-input {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      padding: 10px 14px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s;
      background: white;
    }
    .chat-widget-input:focus {
      border-color: #059669;
    }
    .chat-widget-send {
      background: #059669;
      color: white;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .chat-widget-send:hover {
      background: #047857;
    }
    .chat-widget-send:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    .chat-widget-contact-form {
      padding: 20px;
      background: #fef3c7;
      border-top: 1px solid #e5e7eb;
    }
    .chat-widget-contact-input {
      width: 100%;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 14px;
      margin-bottom: 12px;
      box-sizing: border-box;
      background: white;
      transition: all 0.2s;
    }
    .chat-widget-contact-input:focus {
      border-color: #059669;
      outline: none;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    }
    .chat-widget-contact-button {
      width: 100%;
      background: #059669;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chat-widget-contact-button:hover {
      background: #047857;
      transform: translateY(-1px);
    }
    .chat-widget-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      align-items: center;
    }
    .chat-widget-typing-dot {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }
    .chat-widget-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .chat-widget-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-10px); }
    }
    @media (max-width: 480px) {
      .chat-widget-window {
        width: calc(100vw - 40px);
        height: 60vh;
        right: 20px;
        left: 20px;
      }
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create widget HTML
  const container = document.createElement('div');
  container.className = 'chat-widget-container';
  container.innerHTML = `
    <button class="chat-widget-button" id="chat-widget-toggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    </button>
    <div class="chat-widget-window" id="chat-widget-window">
      <div class="chat-widget-header">
        <div>
          <div class="chat-widget-header-title">RipCrack Support</div>
          <div class="chat-widget-header-subtitle">We typically reply in a few minutes</div>
        </div>
        <button class="chat-widget-close" id="chat-widget-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div class="chat-widget-messages" id="chat-widget-messages"></div>
      <div class="chat-widget-contact-form" id="chat-widget-contact-form" style="display: none;">
        <input type="text" class="chat-widget-contact-input" id="chat-widget-name" placeholder="Full name">
        <input type="email" class="chat-widget-contact-input" id="chat-widget-email" placeholder="Email">
        <input type="tel" class="chat-widget-contact-input" id="chat-widget-phone" placeholder="Phone (optional)">
        <button class="chat-widget-contact-button" id="chat-widget-contact-submit">Send</button>
      </div>
      <div class="chat-widget-input-area">
        <input type="text" class="chat-widget-input" id="chat-widget-input" placeholder="Type your message...">
        <button class="chat-widget-send" id="chat-widget-send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Elements
  const toggle = document.getElementById('chat-widget-toggle');
  const window_el = document.getElementById('chat-widget-window');
  const close = document.getElementById('chat-widget-close');
  const messages = document.getElementById('chat-widget-messages');
  const input = document.getElementById('chat-widget-input');
  const send = document.getElementById('chat-widget-send');
  const contactForm = document.getElementById('chat-widget-contact-form');
  const nameInput = document.getElementById('chat-widget-name');
  const emailInput = document.getElementById('chat-widget-email');
  const phoneInput = document.getElementById('chat-widget-phone');
  const contactSubmit = document.getElementById('chat-widget-contact-submit');

  // State
  let sessionId = null;
  let userEmail = localStorage.getItem('chat_user_email');
  let userName = localStorage.getItem('chat_user_name');
  let userPhone = localStorage.getItem('chat_user_phone');
  let isWaitingForHuman = false;
  let messagesLoaded = false;
  let needsContactInfo = false;

  // Initialize session with chatmesaj API
  async function initSession() {
    try {
      const url = `${apiUrl}/api/widget/session`;
      console.log('[Chat Widget] Init session:', url, { apiKey, visitorToken });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey,
          visitorToken: visitorToken,
          currentUrl: window.location.href,
          referrer: document.referrer,
          language: navigator.language || 'en'
        })
      });
      
      console.log('[Chat Widget] Session response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Chat Widget] Session failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[Chat Widget] Session data:', data);
      
      visitorToken = data.visitorToken;
      conversationId = data.conversation?.id;
      
      localStorage.setItem('chat_visitor_token', visitorToken);
      localStorage.setItem('chat_conversation_id', conversationId);
      
      // Load existing messages
      if (data.messages && data.messages.length > 0) {
        data.messages.forEach(msg => {
          const role = msg.from === 'VISITOR' ? 'user' : 'bot';
          addMessage(role, msg.text);
        });
        messagesLoaded = true;
      }
      
      return data;
    } catch (err) {
      console.error('[Chat Widget] Session init failed:', err);
      return null;
    }
  }

  // Welcome message
  async function addWelcomeMessage() {
    if (!siteConfig) {
      try {
        const configRes = await fetch(`${apiUrl}/api/widget/config?apiKey=${apiKey}`);
        siteConfig = await configRes.json();
      } catch (e) {
        siteConfig = { appearance: { title: 'Support', message: 'Hello! How can I help you?' }};
      }
    }
    
    const greeting = siteConfig?.appearance?.message || 'Hello! 👋 How can I help you today?';
    addMessage('bot', greeting + '<br><br>Type "human" or "support" to chat with our team.');
  }

  // Toggle widget
  toggle.addEventListener('click', async () => {
    window_el.classList.toggle('active');
    if (window_el.classList.contains('active')) {
      if (!visitorToken || !conversationId) {
        await initSession();
      }
      if (messages.children.length === 0 && !messagesLoaded) {
        addWelcomeMessage();
      }
    }
  });

  close.addEventListener('click', () => {
    window_el.classList.remove('active');
  });

  // Add message to UI
  function addMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `chat-widget-message ${role}`;
    msg.innerHTML = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chat-widget-message bot';
    typing.id = 'typing-indicator';
    typing.innerHTML = '<div class="chat-widget-typing"><div class="chat-widget-typing-dot"></div><div class="chat-widget-typing-dot"></div><div class="chat-widget-typing-dot"></div></div>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  // Send message to chatmesaj API
  async function sendMessage(text) {
    addMessage('user', text);
    send.disabled = true;

    console.log('[Chat Widget] Sending message:', { text, visitorToken, apiKey });

    // Ensure session exists
    if (!visitorToken || !conversationId) {
      console.log('[Chat Widget] No session, initializing...');
      const session = await initSession();
      if (!session) {
        addMessage('bot', 'Could not initialize chat session. Please refresh the page.');
        send.disabled = false;
        return;
      }
    }

    try {
      const url = `${apiUrl}/api/widget/message`;
      console.log('[Chat Widget] POST to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey,
          visitorToken: visitorToken,
          text: text
        })
      });

      console.log('[Chat Widget] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Chat Widget] API Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[Chat Widget] Response data:', data);

      // Check if wants human or needs contact info
      const wantsHuman = text.toLowerCase().includes('human') || text.toLowerCase().includes('support') || text.toLowerCase().includes('agent');
      const hasContactInfo = userName && userEmail;
      
      if ((wantsHuman || data.bot?.attachments?.contactForm) && !hasContactInfo) {
        contactForm.style.display = 'block';
        if (wantsHuman) {
          addMessage('bot', 'To connect you with a human agent, please provide your contact information.');
          isWaitingForHuman = true;
        } else {
          addMessage('bot', data.bot.text || 'I couldn\'t find the answer. Please enter your contact information so our operator can get back to you.');
          needsContactInfo = true;
        }
        send.disabled = false;
        return;
      }

      // No auto-reply - just send message to backend
      // Bot responses are disabled
      console.log('[Chat Widget] Message sent successfully, no reply shown');
    } catch (err) {
      console.error('[Chat Widget] Error:', err);
      addMessage('bot', 'Sorry, I\'m having trouble connecting. Error: ' + err.message);
    } finally {
      send.disabled = false;
    }
  }

  // Contact form submit - identify visitor with full info
  contactSubmit.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name) {
      alert('Please enter your full name');
      return;
    }
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    userName = name;
    userEmail = email;
    userPhone = phone;
    localStorage.setItem('chat_user_name', name);
    localStorage.setItem('chat_user_email', email);
    localStorage.setItem('chat_user_phone', phone);
    contactForm.style.display = 'none';
    needsContactInfo = false;

    addMessage('user', `Name: ${name}, Email: ${email}${phone ? ', Phone: ' + phone : ''}`);

    try {
      // Identify the visitor with full contact info
      await fetch(`${apiUrl}/api/widget/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey,
          visitorToken: visitorToken,
          name: name,
          email: email,
          phone: phone
        })
      });

      // If waiting for human, escalate
      if (isWaitingForHuman) {
        await fetch(`${apiUrl}/api/widget/escalate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: apiKey,
            visitorToken: visitorToken
          })
        });
        addMessage('bot', '✅ Thank you! A human agent will be with you shortly. Please wait while we connect you...');
      } else {
        addMessage('bot', '✅ Your contact information has been saved. How else can I help you?');
      }
    } catch (err) {
      addMessage('bot', 'There was an error saving your info. Please try again.');
    }
  });

  // Send button click
  send.addEventListener('click', () => {
    const text = input.value.trim();
    if (text) {
      input.value = '';
      sendMessage(text);
    }
  });

  // Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const text = input.value.trim();
      if (text) {
        input.value = '';
        sendMessage(text);
      }
    }
  });

  // Track page view via chatmesaj API
  async function trackPage() {
    if (!visitorToken) return;
    fetch(`${apiUrl}/api/widget/page-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: apiKey,
        visitorToken: visitorToken,
        page: window.location.href
      })
    }).catch(() => {});
  }

  // Initialize and track
  (async function init() {
    await initSession();
    trackPage();
  })();

  console.log('[Chat Widget] Loaded with chatmesaj API:', apiUrl);
})();
