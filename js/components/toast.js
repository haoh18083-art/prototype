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
