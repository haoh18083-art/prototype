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
