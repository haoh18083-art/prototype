/* 页面实际加载的合并脚本。请改 js/components/ 后再按同样顺序拼回这里。 */
/* js/components/welcome.js */
/* 跟进卡节点提前缓存，后续 follow-card.js 直接复用。 */
const followCards = [...document.querySelectorAll('[data-follow-card]')];

/* 欢迎区打字机：每个会话只播一次，系统要求减少动效时直接跳过。 */
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
      /* 播完后写入 sessionStorage，刷新本会话不再重播。 */
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

/* 欢迎区滚出可视区域后暂停眨眼/扫光，避免后台空转动画。 */
const welcomeModule = document.querySelector('.ios-welcome, .android-welcome');
if (welcomeModule && 'IntersectionObserver' in window) {
  const welcomeObserver = new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('is-welcome-offscreen', !entry.isIntersecting);
  }, { root: document.querySelector('.mobile-content'), threshold: 0 });
  welcomeObserver.observe(welcomeModule);
}
/* js/components/performance-track.js */
/* 本周经营横滑：键盘左右键一次滚动一张卡片宽度。 */
const performanceTrack = document.querySelector('.ios-performance-track, .android-performance-track');
performanceTrack?.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  performanceTrack.scrollBy({ left: event.key === 'ArrowRight' ? 218 : -218, behavior: 'smooth' });
});
/* js/components/toast.js */
/* 收件箱节点与轻提示共用，后续 inbox.js 会继续用这些变量。 */
const inboxItems = [...document.querySelectorAll('[data-inbox-item]')];
const tabButtons = [...document.querySelectorAll('[data-inbox-tab]')];
const toast = document.querySelector('[data-toast]');
let toastTimer;

/* 底部轻提示：新消息会重置计时，约 2.4 秒后自动收起。 */
function showToast(message) {
  if (!toast) return;
  toast.querySelector('[data-toast-message]').textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}
/* js/components/follow-card.js */
/* 跟进卡：点整卡或箭头展开；点「客户空间」只出提示，不跳转。 */
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
/* js/components/inbox.js */
/* 收件箱按 pending / done 过滤；展开与已读是两套状态。 */
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
    /* 展开即已读，去掉蓝点；已读不等于已处理。 */
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
    /* 生成待办：改成已处理，切到「已处理」后再展开同一条。 */
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
/* js/components/assistant.js */
/* 助手 overlay：idle → opening → open → closing → idle，动画中忽略重复点击。 */
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
  /* 圆形揭示的圆心：相对手机框，而不是整个视口。 */
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
/* iframe 聊天页点返回时发 sales-chat-close，由首页收起 overlay。 */
window.addEventListener('message', (event) => {
  const chatFrame = document.querySelector('.ios-chat-frame, .android-chat-frame');
  if (event.source !== chatFrame?.contentWindow || event.data?.type !== 'sales-chat-close') return;
  closeAssistant();
});
/* js/components/chat.js */
/* Web 端内嵌聊天：建议词填入输入框；发送只出提示，不接真实接口。 */
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
/* js/components/bottom-nav.js */
/* 底栏：今日可点选中，其余 Tab 只提示「下一版开放」。 */
document.querySelectorAll('[data-bottom-nav]').forEach((nav) => {
  nav.querySelectorAll('[data-nav-item]').forEach((item) => {
    item.addEventListener('click', () => {
      nav.querySelectorAll('[data-nav-item]').forEach((candidate) => candidate.classList.toggle('is-active', candidate === item));
      if (item.dataset.navItem !== 'today') showToast(`${item.textContent.trim()}页面将在下一版开放`);
    });
  });
});

/* 初始化收件箱可见项，保证默认停在「未处理」。 */
refreshInbox();
