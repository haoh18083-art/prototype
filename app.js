const followCards = [...document.querySelectorAll('[data-follow-card]')];

function runWelcomeIntro() {
  const welcome = document.querySelector('[data-typewriter="true"]');
  const platform = document.body.classList.contains('platform-android') ? 'android' : 'ios';
  const seenClass = `platform-${platform}-welcome-seen`;
  const seenKey = `sales-${platform}-welcome-seen`;
  if (!welcome || document.body.classList.contains(seenClass) || window.sessionStorage.getItem(seenKey) === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lines = [...welcome.querySelectorAll('[data-typewriter-line]')];
  const originals = lines.map((line) => line.textContent);
  document.body.classList.add('is-playing-welcome');
  lines.forEach((line) => { line.textContent = ''; line.classList.add('is-typing'); });
  let lineIndex = 0;
  let charIndex = 0;
  const typeNext = () => {
    if (lineIndex >= lines.length) {
      lines.forEach((line) => line.classList.remove('is-typing'));
      document.body.classList.remove('is-playing-welcome');
      document.body.classList.add(seenClass);
      window.sessionStorage.setItem(seenKey, '1');
      return;
    }
    const line = lines[lineIndex];
    line.textContent = originals[lineIndex].slice(0, charIndex + 1);
    charIndex += 1;
    if (charIndex >= originals[lineIndex].length) {
      line.classList.remove('is-typing');
      lineIndex += 1;
      charIndex = 0;
      window.setTimeout(typeNext, 180);
      return;
    }
    window.setTimeout(typeNext, 72);
  };
  typeNext();
}

runWelcomeIntro();

const welcomeModule = document.querySelector('.ios-welcome, .android-welcome');
if (welcomeModule && 'IntersectionObserver' in window) {
  const welcomeObserver = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('is-welcome-offscreen', !entry.isIntersecting);
  }, { root: document.querySelector('.mobile-content'), threshold: 0 });
  welcomeObserver.observe(welcomeModule);
}

const performanceTrack = document.querySelector('.ios-performance-track, .android-performance-track');
performanceTrack?.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  performanceTrack.scrollBy({ left: event.key === 'ArrowRight' ? 218 : -218, behavior: 'smooth' });
});

const inboxItems = [...document.querySelectorAll('[data-inbox-item]')];
const tabButtons = [...document.querySelectorAll('[data-inbox-tab]')];
const toast = document.querySelector('[data-toast]');
let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.querySelector('[data-toast-message]').textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

followCards.forEach((card) => {
  const toggle = card.querySelector('[data-follow-toggle]');
  const navigate = card.querySelector('[data-space-link]');
  toggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    card.classList.toggle('is-expanded');
  });
  card.addEventListener('click', (event) => {
    if (event.target.closest('[data-space-link]') || event.target.closest('[data-follow-toggle]')) return;
    card.classList.toggle('is-expanded');
  });
  navigate?.addEventListener('click', (event) => {
    event.preventDefault();
    showToast(`正在打开${card.dataset.customer}的客户空间`);
  });
});

function getActiveTab() {
  return document.querySelector('[data-inbox-tab].is-active')?.dataset.inboxTab || 'pending';
}

function refreshInbox() {
  const activeTab = getActiveTab();
  inboxItems.forEach((item) => {
    const shouldShow = item.dataset.status === activeTab;
    item.hidden = !shouldShow;
    if (!shouldShow) item.classList.remove('is-expanded');
  });
  const empty = document.querySelector('[data-inbox-empty]');
  const visible = inboxItems.some((item) => !item.hidden);
  if (empty) empty.hidden = visible;
}

function openInboxItem(item) {
  inboxItems.forEach((other) => {
    if (other !== item) other.classList.remove('is-expanded');
  });
  item.classList.toggle('is-expanded');
  if (item.classList.contains('is-expanded')) {
    item.dataset.read = 'true';
    item.querySelector('.unread-dot')?.remove();
  }
}

inboxItems.forEach((item) => {
  item.querySelector('[data-inbox-toggle]')?.addEventListener('click', (event) => {
    event.preventDefault();
    openInboxItem(item);
  });
  item.querySelector('[data-enter-space]')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    showToast(`正在打开${item.dataset.customer}的客户空间`);
  });
  item.querySelector('[data-generate-task]')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    item.dataset.status = 'done';
    item.classList.remove('is-expanded');
    tabButtons.find((button) => button.dataset.inboxTab === 'done')?.click();
    window.setTimeout(() => {
      const doneItem = inboxItems.find((candidate) => candidate === item);
      doneItem?.classList.add('is-expanded');
      showToast(`已生成待办，并挂到${item.dataset.customer}`);
    }, 220);
  });
});

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    tabButtons.forEach((candidate) => candidate.classList.toggle('is-active', candidate === button));
    refreshInbox();
  });
});

const assistantPages = [...document.querySelectorAll('[data-assistant-page]')];
const assistantOpeners = [...document.querySelectorAll('[data-open-assistant]')];
const assistantClosers = [...document.querySelectorAll('[data-close-assistant]')];
const homePage = document.querySelector('[data-home-page]');
let assistantTransition = 'idle';

function settleAssistantOpen() {
  if (assistantTransition !== 'opening') return;
  assistantPages.forEach((page) => page.classList.add('is-open'));
  assistantTransition = 'open';
}

function openAssistant(event) {
  event?.preventDefault();
  if (assistantTransition !== 'idle') return;
  assistantTransition = 'opening';
  const source = event?.currentTarget;
  const rect = source?.getBoundingClientRect();
  const root = document.documentElement;
  const isAndroid = document.body.classList.contains('platform-android');
  const surfaceWidth = isAndroid ? 412 : 430;
  const statusHeight = isAndroid ? 31 : 44;
  const surfaceLeft = Math.max(0, (window.innerWidth - Math.min(window.innerWidth, surfaceWidth)) / 2);
  root.style.setProperty('--origin-x', `${rect ? rect.left - surfaceLeft + rect.width / 2 : Math.min(window.innerWidth, surfaceWidth) * .88}px`);
  root.style.setProperty('--origin-y', `${rect ? rect.top - statusHeight + rect.height / 2 : 50}px`);
  homePage?.setAttribute('aria-hidden', 'true');
  homePage?.classList.add('is-assistant-hidden');
  assistantPages.forEach((page) => {
    page.classList.remove('is-closing', 'is-open');
    page.classList.add('is-visible');
    page.setAttribute('aria-hidden', 'false');
    page.addEventListener('animationend', settleAssistantOpen, { once: true });
  });
  window.setTimeout(settleAssistantOpen, 380);
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function closeAssistant(event) {
  event?.preventDefault();
  if (assistantTransition === 'idle' || assistantTransition === 'closing') return;
  assistantTransition = 'closing';
  assistantPages.forEach((page) => {
    page.classList.remove('is-visible', 'is-open');
    page.classList.add('is-closing');
    page.setAttribute('aria-hidden', 'true');
    page.addEventListener('animationend', () => {
      page.classList.remove('is-closing');
      assistantTransition = 'idle';
    }, { once: true });
  });
  window.requestAnimationFrame(() => homePage?.classList.remove('is-assistant-hidden'));
  window.setTimeout(() => homePage?.removeAttribute('aria-hidden'), 280);
}

assistantOpeners.forEach((button) => button.addEventListener('click', openAssistant));
assistantClosers.forEach((button) => button.addEventListener('click', closeAssistant));
window.addEventListener('message', (event) => {
  const chatFrame = document.querySelector('.ios-chat-frame, .android-chat-frame');
  if (event.source !== chatFrame?.contentWindow || event.data?.type !== 'sales-chat-close') return;
  closeAssistant();
});

document.querySelectorAll('[data-suggestion]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.querySelector('[data-chat-input]');
    if (!input) return;
    input.value = button.textContent.trim();
    input.focus();
  });
});

document.querySelectorAll('[data-send-chat]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.querySelector('[data-chat-input]');
    if (!input?.value.trim()) return;
    showToast('已记录你的问题，助手正在准备回答');
    input.value = '';
  });
});

document.querySelectorAll('[data-bottom-nav]').forEach((nav) => {
  nav.querySelectorAll('[data-nav-item]').forEach((item) => {
    item.addEventListener('click', () => {
      nav.querySelectorAll('[data-nav-item]').forEach((candidate) => candidate.classList.toggle('is-active', candidate === item));
      if (item.dataset.navItem !== 'today') showToast(`${item.textContent.trim()}页面将在下一版开放`);
    });
  });
});

refreshInbox();
